import React, { useState, useMemo, useEffect } from 'react';
import { runBacktest }      from '../backtest/gemEngine.js';
import { SimulatorControls }  from './SimulatorControls.jsx';
import { KPIRow }           from './KPIRow.jsx';
import { EquityCurveChart } from './EquityCurveChart.jsx';
import { RebalancingLog }   from './RebalancingLog.jsx';
import { CostBreakdown }    from './CostBreakdown.jsx';

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
  const [params, setParams]           = useState(DEFAULT_PARAMS);
  const [historicalData, setHistoricalData] = useState([]);
  const [dataError, setDataError]     = useState(null);

  useEffect(() => {
    fetch('/.netlify/functions/historical-data')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Otrzymano pustą odpowiedź z serwera');
        }
        setHistoricalData(data);
      })
      .catch(err => {
        console.error("Failed to load historical data:", err);
        setDataError(err.message);
      });
  }, []);

  // ── Run backtest with memoization ─────────────────────────────────────
  const result = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return null;
    try {
      return runBacktest({ ...params, historicalData });
    } catch (e) {
      console.error('Backtest error:', e);
      return null;
    }
  }, [params, historicalData]);

  return (
    <div className="app-shell">
      <SimulatorControls
        params={params}
        setParams={setParams}
      />

      <main className="main-content">
        {!result ? (
          <div style={{ padding: '40px', textAlign: 'center', color: dataError ? 'var(--accent-primary, #ff4444)' : 'var(--text-muted)' }}>
            {dataError
              ? `Błąd ładowania danych: ${dataError}`
              : 'Loading historical market data...'}
          </div>
        ) : (
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
          GEM Simulator v1.0 · For Polish Residents · Educational Use Only · Not Financial Advice
          <br />Built with React + Recharts + Yahoo Finance · All logic runs client-side · No data leaves your browser
        </div>
      </main>
    </div>
  );
}
