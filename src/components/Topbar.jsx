import React from 'react';
import { TrendingUp, Activity, Shield, Zap, Menu, X } from 'lucide-react';

export function Topbar({ sidebarOpen, setSidebarOpen, metadata, historicalData }) {
  const startYear = historicalData?.length ? historicalData[0].date.split('-')[0] : '2003';
  const endYear = historicalData?.length ? historicalData[historicalData.length - 1].date.split('-')[0] : '2024';
  const totalMonths = metadata?.months || 252;
  return (
    <header className="topbar">
      <button
        className="hamburger"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div className="logo">
        <div className="logo-icon">G</div>
        <div>
          <div className="logo-text">GEM Simulator</div>
          <div className="logo-sub">Global Equity Momentum</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: 'auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)'
        }}>
          <Activity size={12} style={{ color: 'var(--accent-blue)' }} />
          <span>{startYear} – {endYear}</span>
          <span style={{ color: 'var(--border-strong)', margin: '0 2px' }}>·</span>
          <span>{totalMonths} months</span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)'
        }}>
          <Shield size={12} style={{ color: 'var(--accent-warn)' }} />
          <span>PL Tax: Belka 19%</span>
        </div>

        <div className="status-pill">
          <div className="status-dot" />
          LIVE ENGINE
        </div>
      </div>
    </header>
  );
}
