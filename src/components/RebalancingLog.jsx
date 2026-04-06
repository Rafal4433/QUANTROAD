import React from 'react';
import { ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';

export function RebalancingLog({ log }) {
  if (!log || log.length === 0) return (
    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '8px 0' }}>
      No rebalancing events yet.
    </div>
  );

  const downloadCSV = () => {
    let csv = 'Date,Action,Asset,ROC,Tax,Momentum_USA,Momentum_EXUS,Momentum_Safe\n';
    log.forEach(entry => {
      const mStats = entry.mStats || {};
      const date = entry.date;
      const action = entry.action;
      const asset = entry.asset;
      const roc = entry.roc || '';
      const tax = entry.tax || '';
      const mUsa = mStats.usa != null ? (mStats.usa * 100).toFixed(2) + '%' : '';
      const mExus = mStats.exus != null ? (mStats.exus * 100).toFixed(2) + '%' : '';
      
      // Attempt to find the safe asset momentum (could be shy, tlt, bonds, cash)
      let mSafe = '';
      if (mStats.shy != null) mSafe = `SHY: ${(mStats.shy * 100).toFixed(2)}%`;
      else if (mStats.tlt != null) mSafe = `TLT: ${(mStats.tlt * 100).toFixed(2)}%`;
      else if (mStats.bonds != null) mSafe = `VBMFX: ${(mStats.bonds * 100).toFixed(2)}%`;
      else if (mStats.cash != null) mSafe = `CASH: 0%`;

      // Or just join all stats generically:
      const statsArray = Object.entries(mStats).map(([k, v]) => `${k.toUpperCase()}=${(v * 100).toFixed(2)}%`);

      csv += `"${date}","${action}","${asset}","${roc}","${tax}","${statsArray.join(' | ')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gem_rebalancing_log.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show newest first
  const sorted = [...log].reverse();

  return (
    <div className="chart-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="chart-title">Rebalancing Log</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
            {log.length} events
          </div>
        </div>
        <button 
          onClick={downloadCSV}
          style={{
            background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px',
            color: 'var(--text-muted)', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase'
          }}
        >
          <Download size={10} /> CSV
        </button>
      </div>
      <div className="rebal-log" style={{ flex: 1, overflowY: 'auto' }}>
        {sorted.map((entry, i) => (
          <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="rebal-row" style={{ borderBottom: 'none', padding: 0 }}>
              <span className="rebal-date">{entry.date}</span>
              <span className={`badge ${entry.action === 'BUY' ? 'badge-buy' : entry.action === 'SELL' ? 'badge-sell' : 'badge-tax'}`}>
                {entry.action === 'BUY' && <ArrowUpRight size={9} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} />}
                {entry.action === 'SELL' && <ArrowDownRight size={9} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} />}
                {entry.action}
              </span>
              <span className="rebal-asset">{entry.asset}</span>
              {entry.action !== 'PAY' && <span className="rebal-roc">{entry.roc}</span>}
              {entry.tax > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-danger)', marginLeft: 'auto' }}>
                  -{(entry.tax).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN tax
                </span>
              )}
            </div>
            {entry.mStats && Object.keys(entry.mStats).length > 0 && (
              <div style={{ 
                fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(255,255,255,0.3)',
                paddingLeft: '45px', marginTop: '3px', display: 'flex', gap: '8px', flexWrap: 'wrap' 
              }}>
                {Object.entries(entry.mStats).map(([k, v]) => (
                  <span key={k}>
                    {k.toUpperCase()}: <span style={{ color: v > 0 ? 'rgba(0, 229, 160, 0.6)' : 'rgba(240, 128, 128, 0.6)' }}>{(v * 100).toFixed(1)}%</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
