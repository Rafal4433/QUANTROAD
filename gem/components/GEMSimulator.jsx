// Main shell — ładuje dane, uruchamia silnik, przekazuje wyniki do sub-komponentów.

const DEFAULT_PARAMS = {
  riskAssets:      ['nq', 'em', 'gld'],
  safeAsset:       'dynamic',
  benchmark:       'SP500',
  lookback:        12,
  whipsawBuffer:   0,
  initialCapital:  50000,
  monthlyDCA:      1500,
  leverage:        1.0,
  brokerFee:       0,
  fxSpread:        0,
  ikeActive:       false,
  ensembleMomentum: true,
  startDate:       '2000-01-01',
  endDate:         '',
};

function formatDataMonth(dateKey) {
  const [year, month] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
}

function GEMSimulator() {
  const [params, setParams] = React.useState(DEFAULT_PARAMS);
  const [historicalData, setHistoricalData] = React.useState(null);
  const [loadError, setLoadError] = React.useState(false);
  const [tab, setTab] = React.useState('log');

  // Tweaks panel
  const tweaksDefaults = /*EDITMODE-BEGIN*/{
    "accent":       "#00e5a0",
    "density":      "comfortable",
    "showBench":    true,
    "showDrawdown": true
  }/*EDITMODE-END*/;
  const [t, setTweak] = window.useTweaks ? window.useTweaks(tweaksDefaults) : [tweaksDefaults, () => {}];

  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--accent-soft', t.accent + '1f');
    document.documentElement.style.setProperty('--accent-line', t.accent + '59');
  }, [t.accent]);

  // Ładowanie danych historycznych raz
  React.useEffect(() => {
    fetch('historical_data.json', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => setHistoricalData(data))
      .catch(() => setLoadError(true));
  }, []);

  const dataStatus = React.useMemo(() => {
    const lastDate = historicalData?.[historicalData.length - 1]?.date;
    if (!lastDate) return null;

    return {
      lastDate,
      label: formatDataMonth(lastDate),
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
      return window.runBacktest({ ...params, historicalData: filteredData });
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

    return { equity, kpis, costs, log, meta: result.metadata };
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
        <div className="mono text-[10.5px] uppercase tracking-[.18em] text-[var(--bad)]">Błąd ładowania danych</div>
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
        <div className="mono text-[10.5px] uppercase tracking-[.18em] text-[var(--ink-faint)]">Ładowanie danych rynkowych…</div>
      </div>
    );
  }

  const benchLabel = params.benchmark === 'SP500' ? 'S&P 500' : 'MSCI World';

  return (
    <div className="min-h-screen flex flex-col">
      {/* MAIN GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_1fr]">
        <SimulatorControls params={params} setParams={setParams} historicalData={historicalData} />

        <main className="main-content min-w-0">
          {/* Title row */}
          <div className="px-6 pt-6 pb-4 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-[10.5px] mono uppercase tracking-[.18em] text-[var(--ink-faint)] mb-1.5">
                <span>strategia</span><span className="text-[var(--ink-mute)]">/</span><span>global equity momentum</span>
              </div>
              <h1 className="text-[26px] font-medium tracking-[-0.02em] text-[var(--ink)]">
                GEM <span className="serif italic text-[var(--ink-dim)] font-normal">na rynku polskim</span>
              </h1>
              <p className="text-[12.5px] text-[var(--ink-mute)] mt-1.5 max-w-[60ch] leading-relaxed">
                Symulator momentum dla polskiego inwestora — rotacja z podatkiem Belki, IKE/IKZE i spreadem FX.
                {chartData && <span className="ml-2 text-[var(--ink-faint)]">· {chartData.meta.months} mies. · wdrożono {chartData.meta.totalCapitalDeployed.toLocaleString('pl-PL')} PLN</span>}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              {dataStatus && (
                <div className="rounded-md border hairline bg-[var(--bg-2)] px-3 py-2 text-left sm:text-right">
                  <div className="mono text-[10px] uppercase tracking-[.16em] text-[var(--ink-faint)]">
                    dane rynkowe
                  </div>
                  <div className="mt-0.5 text-[12px] text-[var(--ink-dim)]">
                    do <span className="text-[var(--ink)]">{dataStatus.label}</span>
                    <span className="text-[var(--ink-faint)]"> · zamknięcie miesiąca</span>
                  </div>
                  <div className="mt-0.5 mono text-[10px] uppercase tracking-[.12em] text-[var(--ink-faint)]">
                    auto-update: 3. dzień mies. 04:00 CEST / 03:00 CET
                  </div>
                </div>
              )}
              <button onClick={exportCSV} className="px-3 py-1.5 rounded-md bg-[var(--bg-2)] border hairline text-[12px] text-[var(--ink-dim)] hover:text-[var(--ink)] transition">
                Eksport CSV
              </button>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-3">
            {chartData ? (
              <>
                {/* KPI ROW */}
                <KPIRow kpis={chartData.kpis} finalNet={chartData.costs.gem.net} equityData={chartData.equity} benchLabel={benchLabel} ikeActive={params.ikeActive}/>

                {/* CHART */}
                <EquityCurveChart
                  data={chartData.equity}
                  density={t.density}
                  showBench={t.showBench}
                  showDrawdown={t.showDrawdown}
                  benchLabel={benchLabel}
                />

                {/* LOWER TABBED PANEL */}
                <div className="border hairline rounded-xl bg-[var(--bg-1)] overflow-hidden">
                  <div className="px-5 border-b hairline flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button className={`tab ${tab === 'log' ? 'on' : ''}`} onClick={() => setTab('log')}>
                        Log rebalansowania
                        <span className="ml-1.5 mono text-[10.5px] text-[var(--ink-faint)]">{chartData.log.length}</span>
                      </button>
                      <button className={`tab ${tab === 'cost' ? 'on' : ''}`} onClick={() => setTab('cost')}>
                        Koszty i podatki
                      </button>
                      <button className={`tab ${tab === 'momentum' ? 'on' : ''}`} onClick={() => setTab('momentum')}>
                        Heatmapa momentum
                      </button>
                    </div>
                  </div>
                  <div className="h-[420px]">
                    {tab === 'log'      && <RebalancingLog log={chartData.log} />}
                    {tab === 'cost'     && <CostBreakdown costs={chartData.costs} benchLabel={benchLabel} ikeActive={params.ikeActive} />}
                    {tab === 'momentum' && <MomentumHeatmap params={params} historicalData={historicalData} />}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-[var(--ink-faint)] mono text-[12px]">
                Błąd silnika backtestowego. Sprawdź konsolę przeglądarki.
              </div>
            )}

            <Footer params={params} chartData={chartData}/>
          </div>
        </main>
      </div>

      {/* TWEAKS PANEL */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Wygląd">
            <window.TweakColor
              label="Kolor akcentu"
              value={t.accent}
              onChange={v => setTweak('accent', v)}
              options={['#00e5a0', '#5b8dee', '#ffb454', '#e7ecf3']}
            />
            <window.TweakRadio
              label="Gęstość"
              value={t.density}
              onChange={v => setTweak('density', v)}
              options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfort' }]}
            />
          </window.TweakSection>
          <window.TweakSection title="Wykres">
            <window.TweakToggle label="Pokaż benchmark" value={t.showBench} onChange={v => setTweak('showBench', v)}/>
            <window.TweakToggle label="Panel drawdown"  value={t.showDrawdown} onChange={v => setTweak('showDrawdown', v)}/>
          </window.TweakSection>
        </window.TweaksPanel>
      )}
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
    return <div className="flex items-center justify-center h-full mono text-[12px] text-[var(--ink-faint)]">Ładowanie danych…</div>;
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
    return v >= 0
      ? `oklch(0.45 0.15 165 / ${0.12 + t * 0.65})`
      : `oklch(0.45 0.15 20  / ${0.12 + t * 0.65})`;
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
        <div className="mono text-[9.5px] uppercase tracking-wider text-[var(--ink-faint)] pb-2 flex items-end">
          {lastDate ? lastDate.slice(0,7) : ''}
        </div>
        {PERIODS.map(p => (
          <div key={p.label} className="mono text-[10.5px] uppercase tracking-wider text-[var(--ink-mute)] text-center pb-2">{p.label}</div>
        ))}

        {/* divider row: ryzykowne */}
        <div className="col-span-6 mono text-[9px] uppercase tracking-[.18em] text-[var(--ink-faint)] py-1 border-t hairline">
          ryzykowne
        </div>

        {rows.filter(r => r.isRisk).map(r => {
          const meta = ASSET_META[r.id] || { ticker: r.id.toUpperCase(), sub: '' };
          const isWinner = r.id === winnerId;
          return (
            <React.Fragment key={r.id}>
              <div className={`flex flex-col justify-center py-1 ${isWinner ? 'text-[var(--accent)]' : 'text-[var(--ink-dim)]'}`}>
                <span className="mono text-[12px] font-semibold tracking-wide leading-none">{meta.ticker}</span>
                <span className="mono text-[9.5px] text-[var(--ink-faint)] leading-tight mt-0.5">{meta.sub}</span>
                {isWinner && <span className="mono text-[8.5px] text-[var(--accent)] uppercase tracking-wider mt-0.5">▲ sygnał</span>}
              </div>
              {r.vals.map((v, pi) => (
                <div key={pi} className="rounded-md py-2 px-2 border hairline flex items-center justify-end" style={{ background: cellBg(v) }}>
                  <span className={`mono text-[12px] tnum ${v === null ? 'text-[var(--ink-faint)]' : v >= 0 ? 'text-[var(--ink)]' : 'text-[var(--bad)]'}`}>
                    {v === null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
                  </span>
                </div>
              ))}
            </React.Fragment>
          );
        })}

        {/* divider row: bezpieczne */}
        {rows.some(r => !r.isRisk) && (
          <div className="col-span-6 mono text-[9px] uppercase tracking-[.18em] text-[var(--ink-faint)] py-1 border-t hairline mt-1">
            bezpieczne
          </div>
        )}
        {rows.filter(r => !r.isRisk).map(r => {
          const meta = ASSET_META[r.id] || { ticker: r.id.toUpperCase(), sub: '' };
          return (
            <React.Fragment key={r.id}>
              <div className="flex flex-col justify-center py-1 text-[var(--ink-dim)]">
                <span className="mono text-[12px] font-semibold tracking-wide leading-none">{meta.ticker}</span>
                <span className="mono text-[9.5px] text-[var(--ink-faint)] leading-tight mt-0.5">{meta.sub}</span>
              </div>
              {r.vals.map((v, pi) => (
                <div key={pi} className="rounded-md py-2 px-2 border hairline flex items-center justify-end" style={{ background: cellBg(v) }}>
                  <span className={`mono text-[12px] tnum ${v === null ? 'text-[var(--ink-faint)]' : v >= 0 ? 'text-[var(--ink)]' : 'text-[var(--bad)]'}`}>
                    {v === null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
                  </span>
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-4 mono text-[10.5px] text-[var(--ink-faint)]">
        SKŁAD = śr. (3M + 6M + 12M) · dane na: {lastDate ? lastDate.slice(0,7) : '—'} · obliczono lokalnie
      </div>
    </div>
  );
}

function Footer({ params, chartData }) {
  const months = chartData?.meta?.months || '–';
  return (
    <div className="flex items-center justify-between text-[10.5px] mono text-[var(--ink-faint)] uppercase tracking-[.14em] py-3 border-t hairline mt-2">
      <div className="flex items-center gap-4">
        <span>GEM · {params.benchmark}</span>
        <span>·</span>
        <span>okno {params.lookback}m · histereza {params.whipsawBuffer}%</span>
        <span>·</span>
        <span>{params.riskAssets.length} aktywów ryzykownych</span>
        <span>·</span>
        <span>{months} mies.</span>
      </div>
      <div className="flex items-center gap-3">
        <span>dane: yahoo · stooq</span>
        <span>·</span>
        <span>obliczono lokalnie</span>
      </div>
    </div>
  );
}

window.GEMSimulator = GEMSimulator;
