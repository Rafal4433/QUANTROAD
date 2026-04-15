import React from 'react';

const BAR_COLORS = {
  GEM:       'var(--accent-primary)',
  Benchmark: 'var(--accent-blue)',
  IKE:       'var(--accent-warn)',
};

function UlcerBarItem({ label, ui, upi, maxUI, color }) {
  const pct = maxUI > 0 ? Math.min(100, (ui / maxUI) * 100) : 0;

  return (
    <div className="ulcer-bar-item">
      <div className="ulcer-bar-header">
        <span className="ulcer-bar-name">
          <span style={{
            display: 'inline-block', width: '8px', height: '8px',
            borderRadius: '50%', background: color,
            marginRight: '6px', verticalAlign: 'middle',
          }} />
          {label}
        </span>
        <div style={{ textAlign: 'right' }}>
          <span className="ulcer-bar-val" style={{ color }}>
            UI: {ui}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--text-muted)', marginLeft: '8px'
          }}>
            UPI: {upi}
          </span>
        </div>
      </div>
      <div className="ulcer-bar-track">
        <div
          className="ulcer-bar-fill"
          style={{ width: `${pct}%`, background: color, opacity: 0.8 }}
        />
      </div>
    </div>
  );
}

export function UlcerIndexPanel({ kpi, ikeActive }) {
  if (!kpi) return null;

  const items = [
    { label: 'GEM Portfolio', ui: kpi.gem.ulcerIndex, upi: kpi.gem.upi, color: BAR_COLORS.GEM },
    { label: 'Benchmark (60/40)', ui: kpi.bench.ulcerIndex, upi: kpi.bench.upi, color: BAR_COLORS.Benchmark },
    ...(ikeActive
      ? [{ label: 'GEM + IKE', ui: kpi.ike.ulcerIndex, upi: kpi.ike.upi, color: BAR_COLORS.IKE }]
      : []),
  ];

  const maxUI = Math.max(...items.map(x => parseFloat(x.ui)));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <div className="chart-title">Ulcer Index Comparison</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
            Lower is better · UPI = (CAGR − Rf) / UI
          </div>
        </div>
      </div>

      <div className="ulcer-bar-group">
        {items.map(item => (
          <UlcerBarItem key={item.label} {...item} maxUI={maxUI} />
        ))}
      </div>

      <div style={{ marginTop: '16px', padding: '10px 12px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Ulcer Index</strong> measures drawdown severity & duration.<br />
          <strong style={{ color: 'var(--text-secondary)' }}>UPI</strong> = risk-adjusted excess return per unit of ulcer risk.<br />
          Risk-free rate assumed: <span style={{ color: 'var(--accent-primary)' }}>2.5%</span>
        </div>
      </div>
    </div>
  );
}
