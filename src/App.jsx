import React, { useState, useMemo, useEffect } from 'react';
import { runBacktest }      from './engine/gemEngine.js';
import { Topbar }           from './components/Topbar.jsx';
import { Sidebar }          from './components/Sidebar.jsx';
import { KPIRow }           from './components/KPIRow.jsx';
import { EquityCurveChart } from './components/EquityCurveChart.jsx';
import { RebalancingLog }   from './components/RebalancingLog.jsx';
import { CostBreakdown }    from './components/CostBreakdown.jsx';

const DEFAULT_PARAMS = {
  lookback:        12,
  ensembleMomentum: false,
  initialCapital:  50000,
  monthlyDCA:      1500,
  brokerFee:       0,
  fxSpread:        0,
  ikeActive:       false,
  startDate:       '2000-01-01',
  riskAssets:      ['usa', 'exus'],
  safeAsset:       'shy',
  benchmark:       'MSCI',
  leverage:        1.0,
  whipsawBuffer:   0,
};

export default function App() {
  const [params, setParams]           = useState(DEFAULT_PARAMS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    fetch('/historical_data.json')
      .then(res => res.json())
      .then(data => setHistoricalData(data))
      .catch(err => console.error("Failed to load historical data:", err));
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
        <Topbar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          metadata={result?.metadata}
          historicalData={historicalData}
        />

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        params={params}
        setParams={setParams}
        sidebarOpen={sidebarOpen}
      />

      <main className="main-content">
        {/* ── KPI Row ──────────────────────────────────────────────── */}
        <KPIRow kpi={result?.kpi} ikeActive={params.ikeActive} />

        {/* ── Equity Curve ─────────────────────────────────────────── */}
        {!result ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading historical market data...
          </div>
        ) : (
          <>
            <EquityCurveChart result={result} ikeActive={params.ikeActive} benchmark={params.benchmark} />

        {/* ── Lower Grid: 2 columns ──────────────────────────────── */}
        <div className="lower-grid" style={{ gridTemplateColumns: '1.2fr 2fr' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
              <RebalancingLog log={result?.rebalLog} />
            </div>
          </div>
          <CostBreakdown costs={result?.costs} metadata={result?.metadata} liquidation={result?.liquidation} benchmark={params.benchmark} />
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
