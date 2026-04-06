/**
 * GEM Backtest Engine v2
 * Global Equity Momentum Simulator — Polish Resident Edition
 * FIFO tax (Belka 19%), IKE shield, DCA, TER drag, broker fee, FX spread
 *
 * Accounting principle:
 *   - On BUY: deduct txCost from the cash invested (cash → units)
 *   - On SELL: deduct txCost from the proceeds (units → cash), then deduct tax on profit
 *   - TER is expressed as annual drag; we reduce held-value each month
 */

const MONTHS    = 252; // Jan 2003 – Dec 2023
const START_YEAR = 2003;
const RISK_FREE_RATE = 0.025; // 2.5% pa

// ─── Seeded LCG PRNG ─────────────────────────────────────────────────────────
function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeRandn(rng) {
  return () => {
    const u = Math.max(1e-10, 1 - rng());
    const v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

// ─── Cumulative price index / ROC helpers ──────────────────────────────────────
function getROC(prices, index, lookback) {
  const start = index - lookback;
  if (start < 0) return -Infinity;
  if (prices[start] === null || prices[index] === null) return -Infinity;
  return prices[index] / prices[start] - 1;
}

function ensembleROC(prices, i) {
  const r3 = getROC(prices, i, 3);
  const r6 = getROC(prices, i, 6);
  const r12 = getROC(prices, i, 12);
  if (r3 === -Infinity || r6 === -Infinity || r12 === -Infinity) return -Infinity;
  return (r3 + r6 + r12) / 3;
}

// ─── Main backtest ────────────────────────────────────────────────────────────
export function runBacktest(params) {
  const {
    historicalData   = [], // Array of {date, usa, exus, bonds}
    lookback         = 12,
    ensembleMomentum = false,
    initialCapital   = 50000,
    monthlyDCA       = 1500,
    brokerFee        = 0.29,   // %
    fxSpread         = 0.20,   // %
    ikeActive        = false,
    startDate        = '2000-01-01', // defaults to early to fetch everything
    riskAssets       = ['usa', 'exus'], 
    safeAsset        = 'bonds',
    benchmark        = 'MSCI',
    leverage         = 1.0,
    whipsawBuffer    = 0.0,
  } = params;

  if (!historicalData || historicalData.length === 0) {
    return null; // Await data load
  }

  // Find the exact starting index based on startDate
  // We need to ensure there are at least 'lookback' months before the startIndex!
  let startIndex = historicalData.findIndex(d => d.date >= startDate);
  if (startIndex === -1) startIndex = lookback; // Fallback
  if (startIndex < lookback) startIndex = lookback;

  const realMonths = historicalData.length;
  
  // Extract prices into arrays for fast indexed access
  const ALL_ASSETS = ['usa', 'exus', 'nq', 'em', 'epol', 'gld', 'btc', 'bonds', 'tlt', 'shy'];
  const pArr = {};
  ALL_ASSETS.forEach(a => {
    pArr[a] = historicalData.map(d => (d[a] !== undefined && d[a] !== null) ? d[a] : null);
  });

  const bFee  = brokerFee / 100;
  const fxSpr = fxSpread  / 100;
  const txCost = bFee + fxSpr; // combined one-way transaction cost

  // ── GEM Portfolio State ───────────────────────────────────────────────────
  let cash        = initialCapital;
  let heldAsset   = null;           // current asset key
  let tranches    = [];             // FIFO: [{units, costPerUnit, costBasisPLN}]
  let taxLosses   = [];             // Array of {year, remainingLoss}
  let marginLoan  = 0;              // borrowed cash for leverage
  let monthsInAsset = 0;            // tracking duration in current asset

  // ── IKE Portfolio State (same GEM signals, no Belka tax) ─────────────────
  let ikeCash     = initialCapital;
  let ikeAsset    = null;
  let ikeUnits    = 0;
  let ikeCostBasis = 0;             // total PLN cost tracked for curiosity

  // ── Benchmark (MSCI World 60/40 or SP500 100/0) ──────────────────────────
  let bCash       = initialCapital;
  let bUnitsUSA   = 0;
  let bUnitsEXUS  = 0;
  let bCostBasis  = initialCapital; // Tracks total invested cash
  let bInit       = false;

  // ── Running prices ────────────────────────────────────────────────────────
  const px = { usa: 100, exus: 100, nq: 100, em: 100, epol: 100, gld: 100, btc: 100, bonds: 100, tlt: 100, shy: 100, cash: 100 };

  // ── Accumulators ─────────────────────────────────────────────────────────
  let accFee    = 0;
  let accFX     = 0;
  let accTax    = 0;
  let currentYearPnl = 0;
  let taxToPayInApril = 0;

  let bAccFee = 0;
  let bAccFX  = 0;

  // ── Output arrays ────────────────────────────────────────────────────────
  const portValues    = [];
  const benchValues   = [];
  const ikeValues     = [];
  const labels        = [];
  const ddSeries      = [];
  const benchDdSeries = [];
  const rebalLog      = [];
  const investedSeries = []; // cumulative capital injected

  let portPeak  = initialCapital;
  let benchPeak = initialCapital;

  const roc = (priceArr, i) =>
    ensembleMomentum ? ensembleROC(priceArr, i) : getROC(priceArr, i, lookback);

  const NAMES = { usa: 'USA Eq', exus: 'Ex-US Eq', nq: 'Nasdaq', em: 'Emerging Mkt', epol: 'Poland (EPOL)', gld: 'Gold', btc: 'Bitcoin', bonds: 'Bonds (Agg)', tlt: 'TLT (Long Bond)', shy: 'SHY (Short Bond)', cash: 'Cash' };
  const SAFE_BOND_CANDIDATES = ['tlt', 'shy', 'bonds', 'cash']; // For Dynamic rotation

  // ─────────────────────────────────────────────────────────────────────────
  for (let i = startIndex; i < realMonths; i++) {
    // Start tracking from startIndex, which is guaranteed to be >= lookback.
    const isFirstMonth = (i === startIndex);
    labels.push(historicalData[i].date);

    // 1. Update market prices
    ALL_ASSETS.forEach(a => {
      // Only update px if it's not null; otherwise keep last known or default
      if (pArr[a][i] !== null) px[a] = pArr[a][i];
    });

    // 2. Inject DCA (month 0 is initial capital)
    if (!isFirstMonth) {
      cash       += monthlyDCA;
      ikeCash    += monthlyDCA;
      bCash      += monthlyDCA;
      bCostBasis += monthlyDCA;
    }

    // 2b. Accrue margin interest (monthly) — 4% annual assumed cost
    const marginRate = 0.04 / 12;
    if (marginLoan > 0) marginLoan += marginLoan * marginRate;


    // 4. GEM dynamic signal
    let mStats = {};
    let bestRiskAsset = null;
    let bestRiskROC = -Infinity;
    
    riskAssets.forEach(a => {
      const r = roc(pArr[a], i);
      if (r !== -Infinity) mStats[a] = r;
      if (r > bestRiskROC) {
        bestRiskROC = r;
        bestRiskAsset = a;
      }
    });

    // 4b. Determine effective safe asset (supports Dynamic Bond Rotation)
    let effectiveSafeAsset;
    if (safeAsset === 'dynamic') {
      // Pick the highest-momentum safe bond candidate
      let bestSafeROC = -Infinity;
      let bestSafe = 'cash'; // ultimate fallback
      SAFE_BOND_CANDIDATES.forEach(candidate => {
        const r = candidate === 'cash' ? 0 : roc(pArr[candidate], i);
        if (r !== -Infinity) mStats[candidate] = r;
        if (r !== -Infinity && r > bestSafeROC) {
          bestSafeROC = r;
          bestSafe = candidate;
        }
      });
      effectiveSafeAsset = bestSafe;
    } else {
      effectiveSafeAsset = safeAsset;
      const r = safeAsset === 'cash' ? 0 : roc(pArr[safeAsset], i);
      if (r !== -Infinity) mStats[safeAsset] = r;
    }

    const safeRoc = effectiveSafeAsset === 'cash' ? 0 : roc(pArr[effectiveSafeAsset], i);
    
    let signal = effectiveSafeAsset; // fallback to safe
    if (bestRiskAsset !== null && bestRiskROC >= safeRoc) {
      signal = bestRiskAsset;
    }

    // Apply Hysteresis (Whipsaw buffer to prevent month-to-month churning)
    // Only apply buffer if the asset was acquired recently (<= 3 months)
    if (heldAsset && signal !== heldAsset && monthsInAsset <= 3) {
      const heldRocVal = mStats[heldAsset] !== undefined ? mStats[heldAsset] : (heldAsset === 'cash' ? 0 : -Infinity);
      const sigRocVal = mStats[signal] !== undefined ? mStats[signal] : (signal === 'cash' ? 0 : -Infinity);
      // signal must beat held Asset by the buffer percentage
      if (sigRocVal < heldRocVal + whipsawBuffer / 100) {
        signal = heldAsset;
      }
    }

    // 5. Rebalance GEM portfolio
    if (signal !== heldAsset) {
      // SELL
      if (heldAsset && tranches.length > 0) {
        const totalUnits  = tranches.reduce((s, t) => s + t.units, 0);
        const grossRevenue = totalUnits * px[heldAsset];
        let netRevenue   = grossRevenue * (1 - txCost);
        
        // Repay margin loan
        netRevenue -= marginLoan;
        marginLoan = 0;

        accFee += grossRevenue * bFee;
        accFX  += grossRevenue * fxSpr;

        let taxForLog = 0;
        // FIFO tax
        // Accumulate PnL for yearly Belka processing
        if (!ikeActive) {
          const totalCostBasis = tranches.reduce((s, t) => s + t.costBasisPLN, 0);
          const tradeProfit = netRevenue - totalCostBasis;
          currentYearPnl += tradeProfit;
        }

        cash    = netRevenue;
        tranches = [];
        const _soldArr = pArr[heldAsset];
        const sellRoc  = _soldArr ? roc(_soldArr, i) : 0;
        rebalLog.push({ 
          date: historicalData[i].date, 
          asset: NAMES[heldAsset], 
          action: 'SELL',
          roc: (sellRoc !== -Infinity ? (sellRoc * 100).toFixed(2) + '%' : 'N/A')
        });
        heldAsset = null;
      }

      // BUY (all cash)
      if (cash > 1) {
        // Apply Leverage to the Cash Pile
        const deployedCash = cash * leverage;
        marginLoan = cash * (leverage - 1);

        const invested   = deployedCash * (1 - txCost);
        accFee += deployedCash * bFee;
        accFX  += deployedCash * fxSpr;
        const units = invested / px[signal];
        tranches  = [{ units, costBasisPLN: cash }]; // Tax tracked on real cash
        heldAsset = signal;
        let buyRoc = (signal === effectiveSafeAsset) ? safeRoc : bestRiskROC;
        rebalLog.push({ 
          date: historicalData[i].date, 
          asset: NAMES[signal], 
          action: 'BUY',
          roc: (buyRoc > -100 ? (buyRoc * 100).toFixed(2) + '%' : 'N/A'),
          mStats: mStats
        });
        cash = 0;
      }
      monthsInAsset = 1; // It was just bought, starts counting
    } else {
      if (heldAsset) monthsInAsset++;

      // Same asset — DCA into existing position
      if (cash > 1 && heldAsset) {
        const deployedCash = cash * leverage;
        marginLoan += cash * (leverage - 1);

        const invested = deployedCash * (1 - txCost);
        accFee += deployedCash * bFee;
        accFX  += deployedCash * fxSpr;
        const units = invested / px[heldAsset];
        tranches.push({ units, costBasisPLN: cash });
        cash = 0;
      } else if (cash > 1 && !heldAsset) {
        // First month — buy
        const deployedCash = cash * leverage;
        marginLoan = cash * (leverage - 1);

        const invested = deployedCash * (1 - txCost);
        accFee += deployedCash * bFee;
        accFX  += deployedCash * fxSpr;
        const units = invested / px[signal];
        tranches  = [{ units, costBasisPLN: cash }];
        heldAsset = signal;
        let buyRoc = (signal === effectiveSafeAsset) ? safeRoc : bestRiskROC;
        rebalLog.push({ 
          date: historicalData[i].date, 
          asset: NAMES[signal], 
          action: 'BUY',
          roc: (buyRoc > -100 ? (buyRoc * 100).toFixed(2) + '%' : 'N/A'),
          mStats: mStats
        });
        cash = 0;
      }
    }

    // 5b. Yearly evaluation (December) - sum all closed trades & roll carry
    const monthStr = historicalData[i].date || "0000-00";
    if (!ikeActive && monthStr.endsWith('-12')) {
      const currentYear = parseInt(monthStr.split('-')[0], 10);
      if (currentYearPnl > 0) {
        // filter out expired losses (older than 5 years)
        taxLosses = taxLosses.filter(l => currentYear - l.year <= 5 && l.remainingLoss > 0);
        let taxable = currentYearPnl;
        for (let j = 0; j < taxLosses.length; j++) {
            if (taxable <= 0) break;
            const use = Math.min(taxable, taxLosses[j].remainingLoss);
            taxable -= use;
            taxLosses[j].remainingLoss -= use;
        }
        taxToPayInApril += taxable * 0.19;
      } else if (currentYearPnl < 0) {
        taxLosses.push({ year: currentYear, remainingLoss: Math.abs(currentYearPnl) });
      }
      currentYearPnl = 0;
    }

    // 5c. Tax Payment (April of next year)
    if (!ikeActive && monthStr.endsWith('-04') && taxToPayInApril > 0) {
      accTax += taxToPayInApril;
      if (cash >= taxToPayInApril) {
        cash -= taxToPayInApril;
      } else {
        marginLoan += (taxToPayInApril - cash);
        cash = 0;
      }
      rebalLog.push({ date: monthStr, asset: 'Belka Tax', action: 'PAY',
        roc: 'N/A', tax: taxToPayInApril });
      taxToPayInApril = 0;
    }

    // 6. Compute portfolio value (after trades & taxes)
    let portValue = cash;
    if (heldAsset && tranches.length > 0) {
      const units     = tranches.reduce((s, t) => s + t.units, 0);
      const rawVal    = units * px[heldAsset];
      portValue += rawVal - marginLoan;
    }
    // Wiped out check
    if (portValue < 0) portValue = 0; 
    
    portValues.push(portValue);
    portPeak = Math.max(portPeak, portValue);
    ddSeries.push((portValue / portPeak - 1) * 100);
    // Cumulative deployed capital up to this month
    const monthIdx = labels.length - 1;
    investedSeries.push(initialCapital + monthlyDCA * monthIdx);

    // 7. Benchmark
    const bWgUSA = benchmark === 'SP500' ? 1.0 : 0.6;
    const bWgEXUS = benchmark === 'SP500' ? 0.0 : 0.4;
    
    if (!bInit) {
      const dep = bCash;
      bAccFee += dep * bFee;
      bAccFX  += dep * fxSpr;
      bUnitsUSA  = (dep * bWgUSA * (1 - txCost)) / px.usa;
      bUnitsEXUS = (dep * bWgEXUS * (1 - txCost)) / px.exus;
      bCash = 0; bInit = true;
    } else if (bCash > 1) {
      const dep = bCash;
      bAccFee += dep * bFee;
      bAccFX  += dep * fxSpr;
      bUnitsUSA  += (dep * bWgUSA * (1 - txCost)) / px.usa;
      bUnitsEXUS += (dep * bWgEXUS * (1 - txCost)) / px.exus;
      bCash = 0;
    }
    const bRaw   = bUnitsUSA * px.usa + bUnitsEXUS * px.exus;
    // Benchmark tax is only evaluated hypothetically to represent "net value if liquidated today"
    const bProfit = Math.max(0, bRaw - bCostBasis);
    const bTaxExpected = ikeActive ? 0 : bProfit * 0.19;
    const bNet = bRaw - bTaxExpected;
    benchValues.push(bNet);
    benchPeak = Math.max(benchPeak, bNet);
    benchDdSeries.push((bNet / benchPeak - 1) * 100);

    // 8. IKE Portfolio (same GEM logic, no tax, no leverage)
    if (signal !== ikeAsset) {
      if (ikeAsset && ikeUnits > 0) {
        const gross = ikeUnits * px[ikeAsset];
        let net   = gross * (1 - txCost);
        ikeCash  = net;
        ikeUnits = 0;
      }
      if (ikeCash > 1) {
        const dep = ikeCash;
        const invested = dep * (1 - txCost);
        ikeUnits    = invested / px[signal];
        ikeCostBasis = ikeCash;
        ikeAsset    = signal;
        ikeCash     = 0;
      }
    } else if (ikeCash > 1 && ikeAsset) {
        const dep = ikeCash;
        const invested = dep * (1 - txCost);
        ikeUnits   += invested / px[ikeAsset];
        ikeCostBasis += ikeCash;
        ikeCash     = 0;
    } else if (ikeCash > 1 && !ikeAsset) {
        const dep = ikeCash;
        const invested = dep * (1 - txCost);
        ikeUnits  = invested / px[signal];
        ikeAsset  = signal;
        ikeCostBasis = ikeCash;
        ikeCash   = 0;
    }
    const ikeRaw     = ikeUnits * px[ikeAsset || signal];
    let ikeVal = (ikeCash + ikeRaw);
    if (ikeVal < 0) ikeVal = 0;
    ikeValues.push(ikeVal);
  }

  // ─── KPI helpers ──────────────────────────────────────────────────────────
  const trackedMonths = realMonths - startIndex;
  const totalDeployed = initialCapital + monthlyDCA * (Math.max(0, trackedMonths - 1));

  function cagr(vals) {
    if (!vals?.length) return 0;
    const final = vals[vals.length - 1];
    // Simple IRR approximation: assume lump-sum equivalent
    const yr = trackedMonths / 12;
    return (Math.pow(final / (totalDeployed * 0.5 + initialCapital * 0.5), 1 / yr) - 1) * 100;
  }

  function maxDD(vals) {
    let peak = -Infinity, md = 0;
    for (const v of vals) {
      peak = Math.max(peak, v);
      md   = Math.min(md, (v / peak - 1) * 100);
    }
    return md;
  }

  function sharpe(vals) {
    if (vals.length < 2) return 0;
    const rets = [];
    for (let i = 1; i < vals.length; i++) rets.push(vals[i] / vals[i - 1] - 1);
    const avgR = rets.reduce((a, b) => a + b, 0) / rets.length;
    const varR = rets.reduce((a, b) => a + (b - avgR) ** 2, 0) / rets.length;
    return varR > 0 ? (avgR * 12 - RISK_FREE_RATE) / (Math.sqrt(varR * 12)) : 0;
  }

  function ulcerIdx(vals) {
    let peak = -Infinity, sumSq = 0;
    for (const v of vals) {
      peak  = Math.max(peak, v);
      const dd = (v / peak - 1) * 100;
      sumSq += dd * dd;
    }
    return Math.sqrt(sumSq / vals.length);
  }

  function upi(vals) {
    const ui = ulcerIdx(vals);
    return ui > 0 ? (cagr(vals) / 100 - RISK_FREE_RATE) / (ui / 100) : 0;
  }

  const pct = (n) => Math.min(99.9, (n / totalDeployed) * 100).toFixed(2);
  const fin = (n) => parseFloat(n.toFixed(2));

  // 9. Final liquidation logic
  let gemPendingTax = taxToPayInApril; // Plus whatever is assessed right now
  if (!ikeActive) {
    let finalUnrealizedProfit = 0;
    if (heldAsset && tranches.length > 0) {
      const totalUnits = tranches.reduce((s, t) => s + t.units, 0);
      const rawVal = totalUnits * px[heldAsset];
      const netRevenue = rawVal * (1 - txCost) - marginLoan;
      const totalCostBasis = tranches.reduce((s, t) => s + t.costBasisPLN, 0);
      finalUnrealizedProfit = netRevenue - totalCostBasis;
    }
    const combinedPnl = currentYearPnl + finalUnrealizedProfit;
    if (combinedPnl > 0) {
      const finalYear = labels.length > 0 ? parseInt(labels[labels.length - 1].split('-')[0], 10) : 0;
      let totalValidLosses = taxLosses.filter(l => finalYear - l.year <= 5).reduce((s, l) => s + l.remainingLoss, 0);
      const afterCarry = Math.max(0, combinedPnl - totalValidLosses);
      gemPendingTax += afterCarry * 0.19;
    }
  }

  const finalGemGross = portValues[portValues.length > 0 ? portValues.length - 1 : 0] || 0;
  const finalGemNet = Math.max(0, finalGemGross - gemPendingTax);
  
  const bRawFinal = bUnitsUSA * px.usa + bUnitsEXUS * px.exus;
  const bProfitFinal = Math.max(0, bRawFinal - bCostBasis);
  const benchPendingTax = ikeActive ? 0 : bProfitFinal * 0.19;
  const finalBenchGross = bRawFinal;
  const finalBenchNet = Math.max(0, finalBenchGross - benchPendingTax);

  return {
    labels, portfolioValues: portValues, benchmarkValues: benchValues,
    ikeValues, drawdownSeries: ddSeries, benchDrawdownSeries: benchDdSeries, investedSeries,
    rebalLog: rebalLog.slice(-200),

    kpi: {
      gem:   { cagr: fin(cagr(portValues)),  maxDrawdown: fin(maxDD(portValues)),  sharpe: fin(sharpe(portValues)),  upi: fin(upi(portValues)),  ulcerIndex: fin(ulcerIdx(portValues)) },
      bench: { cagr: fin(cagr(benchValues)), maxDrawdown: fin(maxDD(benchValues)), sharpe: fin(sharpe(benchValues)), upi: fin(upi(benchValues)), ulcerIndex: fin(ulcerIdx(benchValues)) },
      ike:   { cagr: fin(cagr(ikeValues)),   maxDrawdown: fin(maxDD(ikeValues)),   sharpe: fin(sharpe(ikeValues)),   upi: fin(upi(ikeValues)),   ulcerIndex: fin(ulcerIdx(ikeValues)) },
    },

    costs: {
      brokerFee:   pct(accFee),
      fxSpread:    pct(accFX),
      brokerFeePLN: Math.round(accFee),
      fxSpreadPLN:  Math.round(accFX),
      taxPaidPLN:   Math.round(accTax),
      bBrokerFeePLN: Math.round(bAccFee),
      bFxSpreadPLN:  Math.round(bAccFX),
    },

    liquidation: {
      gemFinalGross: Math.round(finalGemGross),
      gemFinalNet: Math.round(finalGemNet),
      gemReturnGross: fin((finalGemGross / totalDeployed - 1) * 100),
      gemReturnNet: fin((finalGemNet / totalDeployed - 1) * 100),
      gemPendingTax: Math.round(gemPendingTax),

      benchFinalGross: Math.round(finalBenchGross),
      benchFinalNet: Math.round(finalBenchNet),
      benchReturnGross: fin((finalBenchGross / totalDeployed - 1) * 100),
      benchReturnNet: fin((finalBenchNet / totalDeployed - 1) * 100),
      benchPendingTax: Math.round(benchPendingTax),
    },

    metadata: {
      totalCapitalDeployed: Math.round(totalDeployed),
      months: trackedMonths,
    },
  };
}
