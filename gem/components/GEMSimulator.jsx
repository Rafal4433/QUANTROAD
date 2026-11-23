// Main shell — ładuje dane, uruchamia silnik, przekazuje wyniki do sub-komponentów.

function GEMSimulator() {
  const [params, setParams] = React.useState(window.GEM_SIM_START_PARAMS);
  const [historicalData, setHistoricalData] = React.useState(null);
  const [loadError, setLoadError] = React.useState(false);
  const [tab, setTab] = React.useState('log');
  const [advOpen, setAdvOpen] = React.useState(false);

  // Ładowanie danych historycznych raz
  React.useEffect(() => {
    window.loadGemData()
      .then(data => setHistoricalData(data))
      .catch(() => setLoadError(true));
  }, []);

  const dataStatus = React.useMemo(() => {
    const lastDate = historicalData?.[historicalData.length - 1]?.date;
    if (!lastDate) return null;

    return {
      lastDate,
      label: window.formatGemMonth(lastDate),
    };
  }, [historicalData]);

  // Uruchomienie backtestу
  const result = React.useMemo(() => {
    if (!historicalData || !window.runBacktest) return null;
    try {
      const endFilter = params.endDate || '9999-12';
      const filteredData = params.endDate
        ? historicalData.filter(d => d.date <= endFilter)
        : historicalData;
      const main = window.runBacktest({ ...params, historicalData: filteredData });
      // Ten sam scenariusz bez prowizji, spreadu i podatku: różnica to koszty i podatek.
      const gross = window.runBacktest({ ...params, brokerFee: 0, fxSpread: 0, ikeActive: true, historicalData: filteredData });
      return main && gross ? { ...main, grossValues: gross.portfolioValues, grossFinal: gross.liquidation.gemFinalNet } : main;
    } catch (e) {
      console.error('Backtest error:', e);
      return null;
    }
  }, [params, historicalData]);

  // Transformacja wyniku do formatu sub-komponentów
  const chartData = React.useMemo(() => {
    if (!result) return null;
    const equity = result.labels.map((label, i) => {
      const d = new Date(label + '-01');
      return {
        date: d,
        label: d.toLocaleDateString('pl-PL', { year: 'numeric', month: 'short' }),
        year: d.getFullYear(),
        gem:      result.portfolioValues[i],
        gross:    result.grossValues ? result.grossValues[i] : null,
        msci:     result.benchmarkValues[i],
        invested: params.initialCapital + params.monthlyDCA * i,
        gemDd:    result.drawdownSeries[i],
        msciDd:   result.benchDrawdownSeries[i],
      };
    });

    const kpis = {
      cagr:   { gem: result.kpi.gem.cagr,        bench: result.kpi.bench.cagr },
      maxDd:  { gem: result.kpi.gem.maxDrawdown,  bench: result.kpi.bench.maxDrawdown },
      sharpe: { gem: result.kpi.gem.sharpe,       bench: result.kpi.bench.sharpe },
      ulcer:  { gem: result.kpi.gem.ulcerIndex,   bench: result.kpi.bench.ulcerIndex },
    };

    const costs = {
      gem: {
        brokerFees:  result.costs.brokerFeePLN + result.costs.fxSpreadPLN,
        taxesPaid:   result.costs.taxPaidPLN,
        gross:       result.liquidation.gemFinalGross,
        finalTax:    result.liquidation.gemPendingTax,
        net:         result.liquidation.gemFinalNet,
        grossReturn: result.liquidation.gemReturnGross,
        netReturn:   result.liquidation.gemReturnNet,
      },
      bench: {
        brokerFees:  result.costs.bBrokerFeePLN + result.costs.bFxSpreadPLN,
        taxesPaid:   0,
        gross:       result.liquidation.benchFinalGross,
        finalTax:    result.liquidation.benchPendingTax,
        net:         result.liquidation.benchFinalNet,
        grossReturn: result.liquidation.benchReturnGross,
        netReturn:   result.liquidation.benchReturnNet,
      },
    };

    const ACTION_MAP = { BUY: 'KUP', SELL: 'SPRZEDAJ', PAY: 'ZAPŁAĆ' };
    const log = result.rebalLog.map(e => ({
      date:  e.date,
      kind:  ACTION_MAP[e.action] || 'TRZYMAJ',
      asset: e.asset,
      roc:   parseFloat(e.roc) || 0,
      tax:   e.tax || 0,
      note:  e.mStats
        ? Object.entries(e.mStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([k, v]) => `${k} ${(v * 100).toFixed(1)}%`)
            .join(' · ')
        : '',
    }));

    const lostToCosts = Math.max(0, (result.grossFinal || 0) - result.liquidation.gemFinalNet);
    return { equity, kpis, costs, log, meta: result.metadata, lostToCosts };
  }, [result]);

  // CSV export
  function exportCSV() {
    if (!chartData) return;
    const rows = [['data', 'akcja', 'aktyw', 'ROC', 'podatek', 'nota']];
    chartData.log.forEach(r => rows.push([r.date, r.kind, r.asset, r.roc.toFixed(2) + '%', r.tax, r.note]));
    const blob = new Blob([rows.map(r => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gem_reballog.csv';
    a.click();
  }

  // Stany ładowania / błędu
  if (loadError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center flex-col gap-4 text-center px-8">
        <div className="mono text-[13px] text-[var(--bad)]">Błąd ładowania danych</div>
        <p className="text-[13.5px] text-[var(--ink-mute)] max-w-[48ch] leading-relaxed">
          Nie można załadować <code>historical_data.json</code>. Uruchom serwer lokalny (np. <code>netlify dev</code>) zamiast otwierać plik bezpośrednio.
        </p>
      </div>
    );
  }

  if (!historicalData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center flex-col gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin"></div>
        <div className="mono text-[13px] text-[var(--ink-faint)]">Ładowanie danych rynkowych…</div>
      </div>
    );
  }

  const benchLabel = params.benchmark === 'SP500' ? 'S&P 500' : 'MSCI World';

  const preset = window.detectGemPreset(params);
  function applyPreset(id) {
    if (id === 'own') { setAdvOpen(true); return; }
    setParams({ ...params, ...window.GEM_PRESETS[id].params });
  }
  const fmtAmount = v => v >= 1_000_000
    ? `${(v / 1_000_000).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mln zł`
    : `${Math.round(v / 1_000).toLocaleString('pl-PL')} tys. zł`;

  return (
    <section className="k-wrap k-wide">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] border border-[var(--ink)]">
        {/* PANEL */}
        <div className="border-b lg:border-b-0 lg:border-r border-[var(--ink)] min-w-0">
          <div className="px-5 py-5 border-b hairline">
            <h2 className="k-h3 mb-3">Strategia</h2>
            <div className="grid gap-1.5">
              {Object.entries(window.GEM_PRESETS).map(([id, p]) => (
                <button key={id} type="button" onClick={() => applyPreset(id)}
                        className={`k-preset focus-ring ${preset === id ? 'on' : ''}`} aria-pressed={preset === id}>
                  <span className="display-font text-[15px] text-[var(--ink)]">{p.label}</span>
                  <span className="text-[13px] text-[var(--ink-mute)]">{p.desc}</span>
                </button>
              ))}
              <button type="button" onClick={() => applyPreset('own')}
                      className={`k-preset focus-ring ${preset === 'own' ? 'on' : ''}`} aria-pressed={preset === 'own'}>
                <span className="display-font text-[15px] text-[var(--ink)]">Własny</span>
                <span className="text-[13px] text-[var(--ink-mute)]">wybierasz w ustawieniach zaawansowanych</span>
              </button>
            </div>
          </div>
          <div className="px-5 py-5 border-b hairline space-y-4">
            <h2 className="k-h3">Twoje pieniądze</h2>
            <div className="grid grid-cols-2 gap-3">
              <MoneyInput id="sim-cap" label="Na start" value={params.initialCapital} onChange={v => setParams({ ...params, initialCapital: v })}/>
              <MoneyInput id="sim-dca" label="Co miesiąc" value={params.monthlyDCA} onChange={v => setParams({ ...params, monthlyDCA: v })}/>
            </div>
            <label className="block" htmlFor="sim-fee">
              <span className="flex items-baseline justify-between mb-2 text-[13.5px] text-[var(--ink-dim)]">
                Koszt transakcji
                <span className="mono text-cost">{params.brokerFee.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}%</span>
              </span>
              <input id="sim-fee" type="range" min={0} max={1} step={0.05} value={params.brokerFee}
                     onChange={e => setParams({ ...params, brokerFee: +e.target.value })} className="w-full cost" />
            </label>
            <button type="button" onClick={() => setParams({ ...params, ikeActive: !params.ikeActive })}
                    className="w-full flex items-center justify-between gap-3 text-left focus-ring" aria-pressed={params.ikeActive}>
              <span>
                <span className="block text-[14px] text-[var(--ink)]">Konto IKE</span>
                <span className="block text-[13px] text-[var(--ink-mute)]">Bez podatku Belki.</span>
              </span>
              <span className={`toggle ${params.ikeActive ? 'on' : ''}`}></span>
            </button>
          </div>
          <details className="k-more" open={advOpen} onToggle={e => setAdvOpen(e.currentTarget.open)}>
            <summary>Ustawienia zaawansowane</summary>
            {advOpen && <SimulatorControls params={params} setParams={setParams} historicalData={historicalData} advanced />}
            <div className="px-5 py-4">
              <button type="button" className="k-btn k-btn-ghost" onClick={() => setParams(window.GEM_SIM_START_PARAMS)}>Przywróć domyślne</button>
            </div>
          </details>
        </div>

        {/* WYNIK */}
        <div className="min-w-0">
          {chartData ? (
            <>
              <div className="px-5 py-5 border-b hairline">
                <p className="text-[19px] sm:text-[21px] leading-[1.45] text-[var(--ink-dim)] max-w-[46ch]">
                  Wpłacając <b className="display-font text-[var(--ink)] whitespace-nowrap">{fmtAmount(chartData.meta.totalCapitalDeployed)}</b> przez {Math.round(chartData.meta.months / 12)} lat,
                  miałbyś dziś <b className="display-font text-[var(--ink)] whitespace-nowrap">{fmtAmount(chartData.costs.gem.net)}</b> na rękę.
                  {' '}{benchLabel} dałby {fmtAmount(chartData.costs.bench.net)}.
                  {' '}Bez kosztów i podatku byłoby o <span className="text-cost font-semibold whitespace-nowrap">{fmtAmount(chartData.lostToCosts)}</span> więcej.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <Kpi label="Rocznie (CAGR)" value={`${fmtPct(chartData.kpis.cagr.gem)}`} bench={`${benchLabel} ${fmtPct(chartData.kpis.cagr.bench)}`}/>
                  <Kpi label="Maks. obsunięcie" value={`${fmtPct(chartData.kpis.maxDd.gem)}`} bench={`${benchLabel} ${fmtPct(chartData.kpis.maxDd.bench)}`}/>
                  <Kpi label="Sharpe" value={fmtNum(chartData.kpis.sharpe.gem, 2)} bench={`${benchLabel} ${fmtNum(chartData.kpis.sharpe.bench, 2)}`}/>
                </div>
              </div>

              <EquityCurveChart data={chartData.equity} density="comfortable" showBench showDrawdown={false} benchLabel={benchLabel}/>

              <details className="k-more border-t hairline">
                <summary>Szczegóły: obsunięcie, dziennik transakcji, koszty, momentum</summary>
                <EquityCurveChart data={chartData.equity} density="compact" showBench showDrawdown benchLabel={benchLabel}/>
                <div className="border-t hairline">
                  <div className="px-5 border-b hairline flex items-center gap-6 overflow-x-auto">
                    <button className={`tab ${tab === 'log' ? 'on' : ''}`} onClick={() => setTab('log')}>Dziennik transakcji</button>
                    <button className={`tab ${tab === 'cost' ? 'on' : ''}`} onClick={() => setTab('cost')}>Koszty i podatek</button>
                    <button className={`tab ${tab === 'momentum' ? 'on' : ''}`} onClick={() => setTab('momentum')}>Momentum teraz</button>
                  </div>
                  <div className="h-[420px] overflow-auto">
                    {tab === 'log'      && <RebalancingLog log={chartData.log} />}
                    {tab === 'cost'     && <CostBreakdown costs={chartData.costs} benchLabel={benchLabel} ikeActive={params.ikeActive} />}
                    {tab === 'momentum' && <MomentumHeatmap params={params} historicalData={historicalData} />}
                  </div>
                </div>
                <div className="px-5 py-4 border-t hairline flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--ink-mute)]">
                  {dataStatus && <span>Dane rynkowe: {dataStatus.label}, zamknięcie miesiąca. Aktualizacja 3. dnia miesiąca.</span>}
                  <button onClick={exportCSV} className="k-btn k-btn-ghost">Eksport CSV</button>
                </div>
              </details>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-[var(--ink-mute)] text-[14px] px-5 text-center">
              Nie udało się policzyć wyniku dla tych ustawień. Zmień zakres lat albo aktywa.
            </div>
          )}
        </div>
      </div>
      {chartData && <Assumptions params={params} pendingTax={chartData.costs.gem.finalTax} benchLabel={benchLabel}/>}
    </section>
  );
}

const fmtNum = (v, d = 1) => v.toLocaleString('pl-PL', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtPct = v => fmtNum(v, 1) + '%';

function Kpi({ label, value, bench }) {
  return (
    <div className="min-w-0">
      <div className="text-[13px] text-[var(--ink-mute)]">{label}</div>
      <div className="mono text-[20px] sm:text-[22px] text-[var(--ink)] mt-0.5 tnum">{value}</div>
      <div className="mono text-[13px] text-[var(--blue)] tnum">{bench}</div>
    </div>
  );
}

function MoneyInput({ id, label, value, onChange }) {
  return (
    <label className="block min-w-0" htmlFor={id}>
      <span className="block text-[13.5px] text-[var(--ink-dim)] mb-1.5">{label}</span>
      <span className="flex items-center gap-1 border border-[var(--line-2)] rounded-sm px-2.5 py-2 focus-within:border-[var(--ink)]">
        <input id={id} type="text" inputMode="numeric" value={value.toLocaleString('pl-PL')}
               onChange={e => onChange(+e.target.value.replace(/\D/g, '') || 0)}
               className="bg-transparent outline-none flex-1 min-w-0 mono text-[14px] tnum text-[var(--ink)]"/>
        <span className="text-[13px] text-[var(--ink-mute)]">zł</span>
      </span>
    </label>
  );
}

function Assumptions({ params, pendingTax, benchLabel }) {
  const items = [
    `Koszty: prowizja ${params.brokerFee}% i spread walutowy ${params.fxSpread}% od każdej transakcji. Symulator startuje z prowizją 0,2%. Wyniki na innych stronach liczone są bez prowizji.`,
    'Waluta: wpłaty są w PLN, a zwroty pochodzą z notowań w USD. Zmiany kursu USD/PLN nie są liczone.',
    'Benchmark: S&P 500 przybliża VTSMX (cały rynek USA), a MSCI World miks 60% VTSMX i 40% VGTSX.',
    'Wskaźniki: CAGR to przybliżenie (wartość końcowa do średniego kapitału), nie stopa zwrotu z wpłat. Sharpe (stopa wolna 2,5%) i obsunięcie liczone są na saldzie z wpłatami, które je zniekształcają.',
  ];
  if (!params.ikeActive) {
    items.push(`Podatek: krzywa i CAGR GEM nie zawierają podatku od niezrealizowanego zysku (${pendingTax.toLocaleString('pl-PL')} PLN na koniec), a ${benchLabel} już go zawiera. Zdanie z wynikiem i zakładka „Koszty i podatek” używają wartości netto.`);
  }

  return (
    <div className="pt-6">
      <h3 className="k-h3 mb-2">Założenia tego wyniku</h3>
      <ul className="space-y-1.5 text-[14px] text-[var(--ink-dim)] leading-relaxed max-w-[80ch] list-disc pl-5">
        {items.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

const ASSET_META = {
  usa:   { ticker: 'VTSMX', sub: 'US Total Mkt' },
  nq:    { ticker: 'QQQ',   sub: 'Nasdaq 100' },
  exus:  { ticker: 'VGTSX', sub: 'Intl ex-US' },
  em:    { ticker: 'VEIEX', sub: 'Emerging Mkts' },
  epol:  { ticker: 'EPOL',  sub: 'Polska MSCI' },
  brk:   { ticker: 'BRK.B', sub: 'Berkshire' },
  gld:   { ticker: 'GLD',   sub: 'Złoto' },
  btc:   { ticker: 'BTC',   sub: 'Bitcoin' },
  bonds: { ticker: 'VBMFX', sub: 'Bonds Total' },
  tlt:   { ticker: 'TLT',   sub: 'T-bond 20Y+' },
  shy:   { ticker: 'SHY',   sub: 'T-bill 1–3Y' },
};
const DYNAMIC_SAFE = ['tlt', 'shy', 'bonds'];

function MomentumHeatmap({ params, historicalData }) {
  if (!historicalData || historicalData.length === 0) {
    return <div className="flex items-center justify-center h-full mono text-[13px] text-[var(--ink-faint)]">Ładowanie danych…</div>;
  }

  // build asset list: selected risk assets + safe asset(s)
  const riskIds = params.riskAssets || [];
  const safeIds = params.safeAsset === 'dynamic' ? DYNAMIC_SAFE : (params.safeAsset && params.safeAsset !== 'cash' ? [params.safeAsset] : []);
  const assetIds = [...riskIds, ...safeIds.filter(s => !riskIds.includes(s))];

  // price arrays keyed by asset id (last element = most recent)
  const priceOf = {};
  assetIds.forEach(id => {
    priceOf[id] = historicalData.map(d => (d[id] !== undefined && d[id] !== null) ? d[id] : null);
  });

  function roc(prices, lookback) {
    const n = prices.length - 1;
    const start = n - lookback;
    if (start < 0 || prices[start] === null || prices[n] === null) return null;
    return (prices[n] / prices[start] - 1) * 100;
  }

  const PERIODS = [
    { label: '1M',   lb: 1 },
    { label: '3M',   lb: 3 },
    { label: '6M',   lb: 6 },
    { label: '12M',  lb: 12 },
    { label: 'SKŁAD', lb: null }, // ensemble avg(3,6,12)
  ];

  const lastDate = historicalData[historicalData.length - 1]?.date;

  const rows = assetIds.map(id => {
    const prices = priceOf[id];
    const r1  = roc(prices, 1);
    const r3  = roc(prices, 3);
    const r6  = roc(prices, 6);
    const r12 = roc(prices, 12);
    const ensemble = (r3 !== null && r6 !== null && r12 !== null) ? (r3 + r6 + r12) / 3 : null;
    const vals = [r1, r3, r6, r12, ensemble];
    const isRisk = riskIds.includes(id);
    return { id, vals, isRisk };
  });

  // for color scale: max abs value across all cells (capped for saturation)
  const allVals = rows.flatMap(r => r.vals).filter(v => v !== null);
  const absMax = Math.max(10, Math.min(60, Math.max(...allVals.map(Math.abs))));

  function cellBg(v) {
    if (v === null) return 'transparent';
    const t = Math.min(1, Math.abs(v) / absMax);
    const pct = Math.round(8 + t * 30);
    return v >= 0
      ? `color-mix(in srgb, var(--ink) ${pct}%, transparent)`
      : `color-mix(in srgb, var(--bad) ${pct}%, transparent)`;
  }

  // find winner (highest ensemble among risk assets)
  const riskRows = rows.filter(r => r.isRisk);
  const winnerIdx = riskRows.length > 0
    ? riskRows.reduce((best, r, i) => {
        const v = r.vals[4]; // ensemble col
        const bv = riskRows[best].vals[4];
        return (v !== null && (bv === null || v > bv)) ? i : best;
      }, 0)
    : -1;
  const winnerId = riskRows[winnerIdx]?.id;

  return (
    <div className="p-5 overflow-auto h-full">
      <div className="grid gap-1" style={{ gridTemplateColumns: '90px repeat(5, 1fr)' }}>
        {/* header */}
        <div className="mono text-[13px] text-[var(--ink-faint)] pb-2 flex items-end">
          {lastDate ? lastDate.slice(0,7) : ''}
        </div>
        {PERIODS.map(p => (
          <div key={p.label} className="mono text-[13px] text-[var(--ink-mute)] text-center pb-2">{p.label}</div>
        ))}

        {/* divider row: ryzykowne */}
        <div className="col-span-6 mono text-[13px] text-[var(--ink-faint)] py-1 border-t hairline">
          ryzykowne
        </div>

        {rows.filter(r => r.isRisk).map(r => {
          const meta = ASSET_META[r.id] || { ticker: r.id.toUpperCase(), sub: '' };
          const isWinner = r.id === winnerId;
          return (
            <React.Fragment key={r.id}>
              <div className={`flex flex-col justify-center py-1 ${isWinner ? 'text-[var(--accent)]' : 'text-[var(--ink-dim)]'}`}>
                <span className="mono text-[13px] font-semibold leading-none">{meta.ticker}</span>
                <span className="mono text-[13px] text-[var(--ink-faint)] leading-tight mt-0.5">{meta.sub}</span>
                {isWinner && <span className="mono text-[13px] text-[var(--accent)] mt-0.5">▲ sygnał</span>}
              </div>
              {r.vals.map((v, pi) => (
                <div key={pi} className="rounded-sm py-2 px-2 border hairline flex items-center justify-end" style={{ background: cellBg(v) }}>
                  <span className={`mono text-[13px] tnum ${v === null ? 'text-[var(--ink-faint)]' : v >= 0 ? 'text-[var(--ink)]' : 'text-[var(--bad)]'}`}>
                    {v === null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
                  </span>
                </div>
              ))}
            </React.Fragment>
          );
        })}

        {/* divider row: bezpieczne */}
        {rows.some(r => !r.isRisk) && (
          <div className="col-span-6 mono text-[13px] text-[var(--ink-faint)] py-1 border-t hairline mt-1">
            bezpieczne
          </div>
        )}
        {rows.filter(r => !r.isRisk).map(r => {
          const meta = ASSET_META[r.id] || { ticker: r.id.toUpperCase(), sub: '' };
          return (
            <React.Fragment key={r.id}>
              <div className="flex flex-col justify-center py-1 text-[var(--ink-dim)]">
                <span className="mono text-[13px] font-semibold leading-none">{meta.ticker}</span>
                <span className="mono text-[13px] text-[var(--ink-faint)] leading-tight mt-0.5">{meta.sub}</span>
              </div>
              {r.vals.map((v, pi) => (
                <div key={pi} className="rounded-sm py-2 px-2 border hairline flex items-center justify-end" style={{ background: cellBg(v) }}>
                  <span className={`mono text-[13px] tnum ${v === null ? 'text-[var(--ink-faint)]' : v >= 0 ? 'text-[var(--ink)]' : 'text-[var(--bad)]'}`}>
                    {v === null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
                  </span>
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-4 mono text-[13px] text-[var(--ink-faint)]">
        SKŁAD = śr. (3M + 6M + 12M) · dane na: {lastDate ? lastDate.slice(0,7) : '—'} · obliczono lokalnie
      </div>
    </div>
  );
}

window.GEMSimulator = GEMSimulator;
