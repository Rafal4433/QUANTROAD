/**
 * GEM Backtest Engine v2 — Browser Build (no ES modules)
 * Global Equity Momentum Simulator — Polish Resident Edition
 * FIFO tax (Belka 19%), IKE shield, DCA, broker fee, FX spread
 */

const RISK_FREE_RATE = 0.025; // 2.5% pa

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

function runBacktest(params) {
  const {
    historicalData   = [],
    lookback         = 12,
    ensembleMomentum = false,
    initialCapital   = 50000,
    monthlyDCA       = 1500,
    brokerFee        = 0,
    fxSpread         = 0,
    ikeActive        = false,
    startDate        = '2000-01-01',
    riskAssets       = ['usa', 'exus'],
    safeAsset        = 'bonds',
    benchmark        = 'MSCI',
    leverage         = 1.0,
    whipsawBuffer    = 0.0,
  } = params;

  if (!historicalData || historicalData.length === 0) return null;

  let startIndex = historicalData.findIndex(d => d.date >= startDate);
  if (startIndex === -1) startIndex = lookback;
  if (startIndex < lookback) startIndex = lookback;

  const realMonths = historicalData.length;

  const ALL_ASSETS = ['usa', 'exus', 'nq', 'em', 'epol', 'gld', 'btc', 'bonds', 'tlt', 'shy'];
  const pArr = {};
  ALL_ASSETS.forEach(a => {
    pArr[a] = historicalData.map(d => (d[a] !== undefined && d[a] !== null) ? d[a] : null);
  });

  const bFee  = brokerFee / 100;
  const fxSpr = fxSpread  / 100;
  const txCost = bFee + fxSpr;

  let cash = initialCapital, heldAsset = null, tranches = [], taxLosses = [], marginLoan = 0, monthsInAsset = 0;
  let ikeCash = initialCapital, ikeAsset = null, ikeUnits = 0, ikeCostBasis = 0;
  let bCash = initialCapital, bUnitsUSA = 0, bUnitsEXUS = 0, bCostBasis = initialCapital, bInit = false;
  const px = { usa: 100, exus: 100, nq: 100, em: 100, epol: 100, gld: 100, btc: 100, bonds: 100, tlt: 100, shy: 100, cash: 100 };
  let accFee = 0, accFX = 0, accTax = 0, currentYearPnl = 0, taxToPayInApril = 0, bAccFee = 0, bAccFX = 0;

  const portValues = [], benchValues = [], ikeValues = [], labels = [], ddSeries = [], benchDdSeries = [], rebalLog = [];
  let portPeak = initialCapital, benchPeak = initialCapital;

  const roc = (priceArr, i) => ensembleMomentum ? ensembleROC(priceArr, i) : getROC(priceArr, i, lookback);

  const NAMES = { usa: 'USA Eq', exus: 'Ex-US Eq', nq: 'Nasdaq', em: 'Emerging Mkt', epol: 'Poland (EPOL)', gld: 'Gold', btc: 'Bitcoin', bonds: 'Bonds (Agg)', tlt: 'TLT (Long Bond)', shy: 'SHY (Short Bond)', cash: 'Cash' };
  const SAFE_BOND_CANDIDATES = ['tlt', 'shy', 'bonds', 'cash'];

  for (let i = startIndex; i < realMonths; i++) {
    const isFirstMonth = (i === startIndex);
    labels.push(historicalData[i].date);

    ALL_ASSETS.forEach(a => { if (pArr[a][i] !== null) px[a] = pArr[a][i]; });

    if (!isFirstMonth) { cash += monthlyDCA; ikeCash += monthlyDCA; bCash += monthlyDCA; bCostBasis += monthlyDCA; }

    const marginRate = 0.04 / 12;
    if (marginLoan > 0) marginLoan += marginLoan * marginRate;

    let mStats = {}, bestRiskAsset = null, bestRiskROC = -Infinity;
    riskAssets.forEach(a => {
      const r = roc(pArr[a], i);
      if (r !== -Infinity) mStats[a] = r;
      if (r > bestRiskROC) { bestRiskROC = r; bestRiskAsset = a; }
    });

    let effectiveSafeAsset;
    if (safeAsset === 'dynamic') {
      let bestSafeROC = -Infinity, bestSafe = 'cash';
      SAFE_BOND_CANDIDATES.forEach(candidate => {
        const r = candidate === 'cash' ? 0 : roc(pArr[candidate], i);
        if (r !== -Infinity) mStats[candidate] = r;
        if (r !== -Infinity && r > bestSafeROC) { bestSafeROC = r; bestSafe = candidate; }
      });
      effectiveSafeAsset = bestSafe;
    } else {
      effectiveSafeAsset = safeAsset;
      const r = safeAsset === 'cash' ? 0 : roc(pArr[safeAsset], i);
      if (r !== -Infinity) mStats[safeAsset] = r;
    }

    const safeRoc = effectiveSafeAsset === 'cash' ? 0 : roc(pArr[effectiveSafeAsset], i);
    let signal = effectiveSafeAsset;
    if (bestRiskAsset !== null && bestRiskROC >= safeRoc) signal = bestRiskAsset;

    if (heldAsset && signal !== heldAsset && monthsInAsset <= 3) {
      const heldRocVal = mStats[heldAsset] !== undefined ? mStats[heldAsset] : (heldAsset === 'cash' ? 0 : -Infinity);
      const sigRocVal  = mStats[signal]    !== undefined ? mStats[signal]    : (signal    === 'cash' ? 0 : -Infinity);
      if (sigRocVal < heldRocVal + whipsawBuffer / 100) signal = heldAsset;
    }

    if (signal !== heldAsset) {
      if (heldAsset && tranches.length > 0) {
        const totalUnits = tranches.reduce((s, t) => s + t.units, 0);
        const grossRevenue = totalUnits * px[heldAsset];
        let netRevenue = grossRevenue * (1 - txCost) - marginLoan;
        marginLoan = 0;
        accFee += grossRevenue * bFee; accFX += grossRevenue * fxSpr;
        if (!ikeActive) { const totalCB = tranches.reduce((s, t) => s + t.costBasisPLN, 0); currentYearPnl += netRevenue - totalCB; }
        cash = netRevenue; tranches = [];
        const sellRoc = pArr[heldAsset] ? roc(pArr[heldAsset], i) : 0;
        rebalLog.push({ date: historicalData[i].date, asset: NAMES[heldAsset], action: 'SELL', roc: sellRoc !== -Infinity ? (sellRoc * 100).toFixed(2) + '%' : 'N/A' });
        heldAsset = null;
      }
      if (cash > 1) {
        const deployedCash = cash * leverage; marginLoan = cash * (leverage - 1);
        const invested = deployedCash * (1 - txCost);
        accFee += deployedCash * bFee; accFX += deployedCash * fxSpr;
        const units = invested / px[signal];
        tranches = [{ units, costBasisPLN: cash }]; heldAsset = signal;
        const buyRoc = (signal === effectiveSafeAsset) ? safeRoc : bestRiskROC;
        rebalLog.push({ date: historicalData[i].date, asset: NAMES[signal], action: 'BUY', roc: buyRoc > -100 ? (buyRoc * 100).toFixed(2) + '%' : 'N/A', mStats });
        cash = 0;
      }
      monthsInAsset = 1;
    } else {
      if (heldAsset) monthsInAsset++;
      if (cash > 1 && heldAsset) {
        const deployedCash = cash * leverage; marginLoan += cash * (leverage - 1);
        const invested = deployedCash * (1 - txCost);
        accFee += deployedCash * bFee; accFX += deployedCash * fxSpr;
        tranches.push({ units: invested / px[heldAsset], costBasisPLN: cash }); cash = 0;
      } else if (cash > 1 && !heldAsset) {
        const deployedCash = cash * leverage; marginLoan = cash * (leverage - 1);
        const invested = deployedCash * (1 - txCost);
        accFee += deployedCash * bFee; accFX += deployedCash * fxSpr;
        tranches = [{ units: invested / px[signal], costBasisPLN: cash }]; heldAsset = signal;
        const buyRoc = (signal === effectiveSafeAsset) ? safeRoc : bestRiskROC;
        rebalLog.push({ date: historicalData[i].date, asset: NAMES[signal], action: 'BUY', roc: buyRoc > -100 ? (buyRoc * 100).toFixed(2) + '%' : 'N/A', mStats });
        cash = 0;
      }
    }

    const monthStr = historicalData[i].date || '0000-00';
    if (!ikeActive && monthStr.endsWith('-12')) {
      const currentYear = parseInt(monthStr.split('-')[0], 10);
      if (currentYearPnl > 0) {
        taxLosses = taxLosses.filter(l => currentYear - l.year <= 5 && l.remainingLoss > 0);
        let taxable = currentYearPnl;
        for (let j = 0; j < taxLosses.length; j++) { if (taxable <= 0) break; const use = Math.min(taxable, taxLosses[j].remainingLoss); taxable -= use; taxLosses[j].remainingLoss -= use; }
        taxToPayInApril += taxable * 0.19;
      } else if (currentYearPnl < 0) {
        taxLosses.push({ year: currentYear, remainingLoss: Math.abs(currentYearPnl) });
      }
      currentYearPnl = 0;
    }

    if (!ikeActive && monthStr.endsWith('-04') && taxToPayInApril > 0) {
      accTax += taxToPayInApril;
      if (cash >= taxToPayInApril) { cash -= taxToPayInApril; } else { marginLoan += (taxToPayInApril - cash); cash = 0; }
      rebalLog.push({ date: monthStr, asset: 'Podatek Belka', action: 'PAY', roc: 'N/A', tax: taxToPayInApril });
      taxToPayInApril = 0;
    }

    let portValue = cash;
    if (heldAsset && tranches.length > 0) { portValue += tranches.reduce((s, t) => s + t.units, 0) * px[heldAsset] - marginLoan; }
    if (portValue < 0) portValue = 0;
    portValues.push(portValue);
    portPeak = Math.max(portPeak, portValue);
    ddSeries.push((portValue / portPeak - 1) * 100);

    const bWgUSA = benchmark === 'SP500' ? 1.0 : 0.6;
    const bWgEXUS = benchmark === 'SP500' ? 0.0 : 0.4;
    if (!bInit) {
      const dep = bCash; bAccFee += dep * bFee; bAccFX += dep * fxSpr;
      bUnitsUSA = (dep * bWgUSA * (1 - txCost)) / px.usa; bUnitsEXUS = (dep * bWgEXUS * (1 - txCost)) / px.exus; bCash = 0; bInit = true;
    } else if (bCash > 1) {
      const dep = bCash; bAccFee += dep * bFee; bAccFX += dep * fxSpr;
      bUnitsUSA += (dep * bWgUSA * (1 - txCost)) / px.usa; bUnitsEXUS += (dep * bWgEXUS * (1 - txCost)) / px.exus; bCash = 0;
    }
    const bRaw = bUnitsUSA * px.usa + bUnitsEXUS * px.exus;
    const bNet = bRaw - (ikeActive ? 0 : Math.max(0, bRaw - bCostBasis) * 0.19);
    benchValues.push(bNet);
    benchPeak = Math.max(benchPeak, bNet);
    benchDdSeries.push((bNet / benchPeak - 1) * 100);

    if (signal !== ikeAsset) {
      if (ikeAsset && ikeUnits > 0) { ikeCash = ikeUnits * px[ikeAsset] * (1 - txCost); ikeUnits = 0; }
      if (ikeCash > 1) { ikeUnits = ikeCash * (1 - txCost) / px[signal]; ikeAsset = signal; ikeCostBasis = ikeCash; ikeCash = 0; }
    } else if (ikeCash > 1 && ikeAsset) {
      ikeUnits += ikeCash * (1 - txCost) / px[ikeAsset]; ikeCostBasis += ikeCash; ikeCash = 0;
    } else if (ikeCash > 1 && !ikeAsset) {
      ikeUnits = ikeCash * (1 - txCost) / px[signal]; ikeAsset = signal; ikeCostBasis = ikeCash; ikeCash = 0;
    }
    let ikeVal = ikeCash + ikeUnits * px[ikeAsset || signal];
    if (ikeVal < 0) ikeVal = 0;
    ikeValues.push(ikeVal);
  }

  const trackedMonths = realMonths - startIndex;
  const totalDeployed = initialCapital + monthlyDCA * (Math.max(0, trackedMonths - 1));

  function cagr(vals) {
    if (!vals || !vals.length) return 0;
    const yr = trackedMonths / 12;
    return (Math.pow(vals[vals.length - 1] / (totalDeployed * 0.5 + initialCapital * 0.5), 1 / yr) - 1) * 100;
  }
  function maxDD(vals) { let peak = -Infinity, md = 0; for (const v of vals) { peak = Math.max(peak, v); md = Math.min(md, (v / peak - 1) * 100); } return md; }
  function sharpe(vals) {
    if (vals.length < 2) return 0;
    const rets = []; for (let i = 1; i < vals.length; i++) rets.push(vals[i] / vals[i - 1] - 1);
    const avgR = rets.reduce((a, b) => a + b, 0) / rets.length;
    const varR = rets.reduce((a, b) => a + (b - avgR) ** 2, 0) / rets.length;
    return varR > 0 ? (avgR * 12 - RISK_FREE_RATE) / Math.sqrt(varR * 12) : 0;
  }
  function ulcerIdx(vals) { let peak = -Infinity, sumSq = 0; for (const v of vals) { peak = Math.max(peak, v); sumSq += ((v / peak - 1) * 100) ** 2; } return Math.sqrt(sumSq / vals.length); }
  function upi(vals) { const ui = ulcerIdx(vals); return ui > 0 ? (cagr(vals) / 100 - RISK_FREE_RATE) / (ui / 100) : 0; }
  const fin = n => parseFloat(n.toFixed(2));

  let gemPendingTax = taxToPayInApril;
  if (!ikeActive && heldAsset && tranches.length > 0) {
    const totalUnits = tranches.reduce((s, t) => s + t.units, 0);
    const rawVal = totalUnits * px[heldAsset];
    const netRevenue = rawVal * (1 - txCost) - marginLoan;
    const totalCB = tranches.reduce((s, t) => s + t.costBasisPLN, 0);
    const combinedPnl = currentYearPnl + (netRevenue - totalCB);
    if (combinedPnl > 0) {
      const finalYear = labels.length > 0 ? parseInt(labels[labels.length - 1].split('-')[0], 10) : 0;
      const totalValidLosses = taxLosses.filter(l => finalYear - l.year <= 5).reduce((s, l) => s + l.remainingLoss, 0);
      gemPendingTax += Math.max(0, combinedPnl - totalValidLosses) * 0.19;
    }
  }

  const finalGemGross = portValues[portValues.length - 1] || 0;
  const finalGemNet = Math.max(0, finalGemGross - gemPendingTax);
  const bRawFinal = bUnitsUSA * px.usa + bUnitsEXUS * px.exus;
  const benchPendingTax = ikeActive ? 0 : Math.max(0, bRawFinal - bCostBasis) * 0.19;
  const finalBenchNet = Math.max(0, bRawFinal - benchPendingTax);

  return {
    labels, portfolioValues: portValues, benchmarkValues: benchValues,
    ikeValues, drawdownSeries: ddSeries, benchDrawdownSeries: benchDdSeries,
    rebalLog: rebalLog.slice(-200),
    kpi: {
      gem:   { cagr: fin(cagr(portValues)),  maxDrawdown: fin(maxDD(portValues)),  sharpe: fin(sharpe(portValues)),  upi: fin(upi(portValues)),  ulcerIndex: fin(ulcerIdx(portValues)) },
      bench: { cagr: fin(cagr(benchValues)), maxDrawdown: fin(maxDD(benchValues)), sharpe: fin(sharpe(benchValues)), upi: fin(upi(benchValues)), ulcerIndex: fin(ulcerIdx(benchValues)) },
      ike:   { cagr: fin(cagr(ikeValues)),   maxDrawdown: fin(maxDD(ikeValues)),   sharpe: fin(sharpe(ikeValues)),   upi: fin(upi(ikeValues)),   ulcerIndex: fin(ulcerIdx(ikeValues)) },
    },
    costs: {
      brokerFeePLN: Math.round(accFee), fxSpreadPLN: Math.round(accFX), taxPaidPLN: Math.round(accTax),
      bBrokerFeePLN: Math.round(bAccFee), bFxSpreadPLN: Math.round(bAccFX),
    },
    liquidation: {
      gemFinalGross: Math.round(finalGemGross), gemFinalNet: Math.round(finalGemNet),
      gemReturnGross: fin((finalGemGross / totalDeployed - 1) * 100),
      gemReturnNet: fin((finalGemNet / totalDeployed - 1) * 100),
      gemPendingTax: Math.round(gemPendingTax),
      benchFinalGross: Math.round(bRawFinal), benchFinalNet: Math.round(finalBenchNet),
      benchReturnGross: fin((bRawFinal / totalDeployed - 1) * 100),
      benchReturnNet: fin((finalBenchNet / totalDeployed - 1) * 100),
      benchPendingTax: Math.round(benchPendingTax),
    },
    metadata: { totalCapitalDeployed: Math.round(totalDeployed), months: trackedMonths },
  };
}

window.runBacktest = runBacktest;
