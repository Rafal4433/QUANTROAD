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
};

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
    fetch('historical_data.json')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => setHistoricalData(data))
      .catch(() => setLoadError(true));
  }, []);

  // Uruchomienie backtestу
  const result = React.useMemo(() => {
    if (!historicalData || !window.runBacktest) return null;
    try {
      return window.runBacktest({ ...params, historicalData });
    } catch (e) {
      console.error('Backtest error:', e);
      return null;
    }
  }, [params, historicalData]);

  // Transformacja wyniku do formatu sub-komponentów
  const chartData = React.useMemo(() => {
    if (!result) return null;
    const p0 = result.portfolioValues[0] || 1;
    const b0 = result.benchmarkValues[0] || 1;

    const equity = result.labels.map((label, i) => {
      const d = new Date(label + '-01');
      return {
        date: d,
        label: d.toLocaleDateString('pl-PL', { year: 'numeric', month: 'short' }),
        year: d.getFullYear(),
        gem:  result.portfolioValues[i] / p0 * 100,
        msci: result.benchmarkValues[i] / b0 * 100,
        gemDd:  result.drawdownSeries[i],
        msciDd: result.benchDrawdownSeries[i],
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
        <SimulatorControls params={params} setParams={setParams} />

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
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} className="px-3 py-1.5 rounded-md bg-[var(--bg-2)] border hairline text-[12px] text-[var(--ink-dim)] hover:text-[var(--ink)] transition">
                Eksport CSV
              </button>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-3">
            {chartData ? (
              <>
                {/* KPI ROW */}
                <KPIRow kpis={chartData.kpis} finalNet={chartData.costs.gem.net} equityData={chartData.equity} benchLabel={benchLabel}/>

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
                    {tab === 'cost'     && <CostBreakdown costs={chartData.costs} benchLabel={benchLabel} />}
                    {tab === 'momentum' && <MomentumHeatmap />}
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

function MomentumHeatmap() {
  const assets  = ['VTSMX','QQQ','VGTSX','VEIEX','EPOL','GLD','BTC','SHY','TLT'];
  const periods = ['1M','3M','6M','12M','SKŁAD'];
  const matrix  = [
    [ 4.2,  8.1, 14.7, 18.4, 11.4],
    [ 5.6, 10.8, 16.2, 22.1, 13.7],
    [ 2.4,  4.1,  7.2,  9.0,  5.7],
    [ 6.7,  9.4,  8.9,  7.8,  8.2],
    [-1.2, -0.4,  3.1,  6.5,  2.0],
    [ 1.6,  3.4,  5.7,  9.1,  4.9],
    [12.4, 38.1, 92.7,142.0, 71.3],
    [ 0.4,  1.1,  2.0,  4.1,  1.9],
    [-2.1, -3.4, -1.2,  0.6, -1.5],
  ];
  function cell(v) {
    const x = Math.max(-30, Math.min(30, v));
    const t = Math.abs(x) / 30;
    return v >= 0
      ? `oklch(0.45 0.15 165 / ${0.15 + t * 0.6})`
      : `oklch(0.45 0.15 20 / ${0.15 + t * 0.6})`;
  }
  return (
    <div className="p-5 overflow-auto h-full">
      <div className="grid gap-1" style={{ gridTemplateColumns: '78px repeat(5, 1fr)' }}>
        <div></div>
        {periods.map(p => <div key={p} className="mono text-[10.5px] uppercase tracking-wider text-[var(--ink-mute)] text-center pb-2">{p}</div>)}
        {assets.map((a, ai) => (
          <React.Fragment key={a}>
            <div className="mono text-[12px] text-[var(--ink-dim)] flex items-center font-semibold tracking-wide">{a}</div>
            {matrix[ai].map((v, pi) => (
              <div key={pi} className="rounded-md py-2 px-2 border hairline flex items-center justify-between" style={{ background: cell(v) }}>
                <span className="mono text-[10.5px] text-[var(--ink-faint)]">{periods[pi]}</span>
                <span className={`mono text-[12px] tnum ${v >= 0 ? 'text-[var(--ink)]' : 'text-[var(--bad)]'}`}>
                  {v >= 0 ? '+' : ''}{v.toFixed(1)}%
                </span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-4 mono text-[10.5px] text-[var(--ink-faint)]">SKŁAD = śr. ważona · dane ilustracyjne</div>
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
