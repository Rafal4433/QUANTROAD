import React, { useState, useMemo } from 'react';
import { runBacktest }      from '../backtest/gemEngine.js';
import { SimulatorControls }  from './SimulatorControls.jsx';
import { KPIRow }           from './KPIRow.jsx';
import { EquityCurveChart } from './EquityCurveChart.jsx';
import { RebalancingLog }   from './RebalancingLog.jsx';
import { CostBreakdown }    from './CostBreakdown.jsx';
import historicalData       from '../../public/historical_data.json';

const DEFAULT_PARAMS = {
  lookback:        12,
  ensembleMomentum: true,
  initialCapital:  50000,
  monthlyDCA:      1500,
  brokerFee:       0,
  fxSpread:        0,
  ikeActive:       false,
  startDate:       '2000-01-01',
  riskAssets:      ['nq', 'em', 'gld'],
  safeAsset:       'dynamic',
  benchmark:       'SP500',
  leverage:        1.0,
  whipsawBuffer:   0,
};

export function GEMSimulator() {
  const [params, setParams] = useState(DEFAULT_PARAMS);

  // ── Run backtest with memoization ─────────────────────────────────────
  const result = useMemo(() => {
    try {
      return runBacktest({ ...params, historicalData });
    } catch (e) {
      console.error('Backtest error:', e);
      return null;
    }
  }, [params]);

  return (
    <div className="app-shell">
      <SimulatorControls
        params={params}
        setParams={setParams}
      />

      <main className="main-content">
        {result ? (
          <>
            {/* ── Equity Curve ─────────────────────────────────────────── */}
            <EquityCurveChart result={result} ikeActive={params.ikeActive} benchmark={params.benchmark} />

            {/* ── Lower Section: KPIs, Logs, Costs ──────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <KPIRow kpi={result?.kpi} ikeActive={params.ikeActive} />

              <div className="lower-grid" style={{ gridTemplateColumns: '1.2fr 2fr' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
                    <RebalancingLog log={result?.rebalLog} />
                  </div>
                </div>
                <CostBreakdown costs={result?.costs} metadata={result?.metadata} liquidation={result?.liquidation} benchmark={params.benchmark} />
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Błąd silnika backtestu. Sprawdź konsolę.
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          padding: '24px 0 16px',
          marginTop: '60px',
          borderTop: '1px solid var(--border)',
        }}>
          Symulator GEM v1.0 · Dla polskich inwestorów · Wyłącznie cel edukacyjny · Nie stanowi porady finansowej
          <br />Zbudowany w React + Recharts + Yahoo Finance · Cała logika działa po stronie klienta · Żadne dane nie opuszczają przeglądarki
        </div>
      </main>
    </div>
  );
}
