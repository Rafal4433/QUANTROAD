import React, { useState } from 'react';
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// Sample every N-th month to keep render fast
function sampleData(result, ikeActive) {
  if (!result) return [];
  const { labels, portfolioValues, benchmarkValues, ikeValues, drawdownSeries, investedSeries } = result;
  const step = Math.max(1, Math.floor(labels.length / 180));
  const out = [];
  for (let i = 0; i < labels.length; i += step) {
    const entry = {
      date:     labels[i],
      gem:      portfolioValues[i],
      bench:    benchmarkValues[i],
      invested: investedSeries?.[i],
      dd:       drawdownSeries[i],
      benchDd:  result.benchDrawdownSeries?.[i] || 0
    };
    if (ikeActive) entry.ike = ikeValues[i];
    out.push(entry);
  }
  // always include the last point
  const last = labels.length - 1;
  out.push({
    date:     labels[last],
    gem:      portfolioValues[last],
    bench:    benchmarkValues[last],
    invested: investedSeries?.[last],
    dd:       drawdownSeries[last],
    benchDd:  result.benchDrawdownSeries?.[last] || 0,
    ...(ikeActive ? { ike: ikeValues[last] } : {}),
  });
  return out;
}

const PLN = (v) => v !== undefined
  ? `${Math.round(v).toLocaleString('pl-PL')} PLN`
  : '—';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const labels = {
    gem:      'GEM      ',
    bench:    'BENCHMARK',
    ike:      'IKE      ',
    invested: 'WKŁAD    ',
    dd:       'DD GEM   ',
    benchDd:  'DD BENCH ',
  };
  return (
    <div style={{
      background: '#1e2330',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.08em' }}>
        {label}
      </div>
      {payload.map(p => {
        let text = p.dataKey === 'dd' || p.dataKey === 'benchDd' ? `${p.value?.toFixed(2)}%` : PLN(p.value);
        if (p.dataKey === 'gem' || p.dataKey === 'bench' || p.dataKey === 'ike') {
           const investedPayload = payload.find(x => x.dataKey === 'invested');
           if (investedPayload && investedPayload.value > 0) {
             const ret = ((p.value / investedPayload.value) - 1) * 100;
             text += ` (${ret >= 0 ? '+' : ''}${ret.toFixed(1)}%)`;
           }
        }
        return (
          <div key={p.dataKey} style={{ color: p.color, marginBottom: '3px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{labels[p.dataKey] ?? p.dataKey}</span>
            {' '}{text}
          </div>
        );
      })}
    </div>
  );
}

export function EquityCurveChart({ result, ikeActive, benchmark }) {
  const [scale, setScale] = useState('log');
  const data = sampleData(result, ikeActive);

  const tickFormatter = (v) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `${Math.round(v / 1000)}K`;
    return v;
  };

  const domainMin = scale === 'log' ? 'auto' : 'auto';
  const minDD = result?.drawdownSeries ? Math.min(...result.drawdownSeries) : -50;

  // Thin out x-axis labels
  const xTicks = data.filter((_, i) => i % 24 === 0).map(d => d.date);
  const benchLabel = benchmark === 'SP500' ? 'S&P 500' : 'MSCI World';

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <div className="chart-title">Krzywa wzrostu — GEM vs {benchLabel}{ikeActive ? ' vs IKE' : ''}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
            Ważona DCA · Po opłatach i podatku · PLN
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--accent-primary)' }} />
              GEM
            </div>
            <div className="legend-item">
              <div className="legend-line-dashed" style={{ borderColor: 'var(--accent-blue)' }} />
              {benchLabel}
            </div>
            <div className="legend-item">
              <div className="legend-line-dashed" style={{ borderColor: 'rgba(255,255,255,0.35)', borderStyle: 'dashed' }} />
              Wpłacony
            </div>
            {ikeActive && (
              <div className="legend-item">
                <div className="legend-line-dashed" style={{ borderColor: 'var(--accent-warn)' }} />
                GEM+IKE
              </div>
            )}
          </div>
          <div className="scale-toggle">
            <button
              className={`scale-btn ${scale === 'log' ? 'active' : ''}`}
              onClick={() => setScale('log')}
            >LOG</button>
            <button
              className={`scale-btn ${scale === 'linear' ? 'active' : ''}`}
              onClick={() => setScale('linear')}
            >LIN</button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} syncId="equityCurve">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            ticks={xTicks}
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: 'var(--border-strong)' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            scale={scale}
            domain={[domainMin, 'auto']}
            tickFormatter={tickFormatter}
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={54}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />

          {/* Invested capital — dashed white line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="invested"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1.5}
            strokeDasharray="3 4"
            dot={false}
            isAnimationActive={false}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="bench"
            stroke="var(--accent-blue)"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            isAnimationActive={false}
          />
          {ikeActive && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ike"
              stroke="var(--accent-warn)"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              isAnimationActive={false}
            />
          )}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="gem"
            stroke="var(--accent-primary)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ marginTop: '20px', marginBottom: '8px' }}>
        <div className="chart-title" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Krzywa obsunięć kapitału</div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <ComposedChart data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }} syncId="equityCurve">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" hide={true} />
          <YAxis
            domain={[minDD * 1.05, 0]}
            tickFormatter={v => `${v.toFixed(0)}%`}
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={54}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
          <Area
            type="monotone"
            dataKey="benchDd"
            stroke="var(--accent-blue)"
            fill="var(--accent-blue)"
            fillOpacity={0.15}
            strokeWidth={1}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="dd"
            stroke="rgba(232,85,85,0.8)"
            fill="rgba(232,85,85,0.3)"
            strokeWidth={1}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
