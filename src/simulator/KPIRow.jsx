import React from 'react';
import { TrendingUp, TrendingDown, ArrowDown, Zap } from 'lucide-react';

function KPICard({ label, value, unit, sub, colorClass, icon: Icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">
        {Icon && <Icon size={10} style={{ display: 'inline', marginRight: '4px' }} />}
        {label}
      </div>
      <div className={`kpi-value ${colorClass}`}>
        {value}
        {unit && (
          <span style={{ fontSize: '14px', fontWeight: 400, marginLeft: '2px', opacity: 0.7 }}>{unit}</span>
        )}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

export function KPIRow({ kpi, ikeActive }) {
  const g = kpi?.gem;
  if (!g) return null;

  const cagrVal = parseFloat(g.cagr);
  const ddVal   = parseFloat(g.maxDrawdown);
  const sharpe  = parseFloat(g.sharpe);
  const upiVal  = parseFloat(g.upi);

  return (
    <div className="kpi-grid">
      <KPICard
        label="CAGR"
        value={cagrVal > 0 ? `+${g.cagr}` : g.cagr}
        unit="%"
        sub={`Benchmark: ${kpi?.bench?.cagr}%${ikeActive ? ` · IKE: ${kpi?.ike?.cagr}%` : ''}`}
        colorClass={cagrVal > 0 ? 'kpi-positive' : 'kpi-negative'}
        icon={cagrVal > 0 ? TrendingUp : TrendingDown}
      />
      <KPICard
        label="Maks. obsunięcie"
        value={g.maxDrawdown}
        unit="%"
        sub={`Benchmark: ${kpi?.bench?.maxDrawdown}%`}
        colorClass="kpi-negative"
        icon={ArrowDown}
      />
      <KPICard
        label="Współczynnik Sharpe'a"
        value={sharpe > 0 ? `+${g.sharpe}` : g.sharpe}
        unit=""
        sub={`Benchmark: ${kpi?.bench?.sharpe}${ikeActive ? ` · IKE: ${kpi?.ike?.sharpe}` : ''}`}
        colorClass={sharpe > 1.0 ? 'kpi-positive' : sharpe > 0.5 ? 'kpi-neutral' : 'kpi-negative'}
        icon={TrendingUp}
      />
      <KPICard
        label="Indeks Ulcera (UPI)"
        value={upiVal > 0 ? `+${g.upi}` : g.upi}
        unit=""
        sub={`UI: ${g.ulcerIndex} · (CAGR−Rf)/UI`}
        colorClass={upiVal > 0.5 ? 'kpi-warn' : 'kpi-neutral'}
        icon={Zap}
      />
    </div>
  );
}
