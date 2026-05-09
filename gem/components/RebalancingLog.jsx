// Rebalancing log — table-style timeline feed, scrollable, with grouping.

function RebalancingLog({ log = [] }) {
  const [filter, setFilter] = React.useState('ALL');

  const filtered = filter === 'ALL' ? log : log.filter(r => r.kind === filter);

  function fmtDate(iso){
    const d = new Date(iso);
    return d.toLocaleDateString('pl-PL', { day:'2-digit', month:'short', year:'numeric' });
  }

  const badgeCls = (k) => ({
    'KUP': 'badge badge-buy',
    'SPRZEDAJ': 'badge badge-sell',
    'ZAPŁAĆ': 'badge badge-pay',
    'TRZYMAJ': 'badge badge-hold',
  }[k] || 'badge badge-hold');

  return (
    <div className="flex flex-col h-full">
      {/* sub-toolbar */}
      <div className="px-5 py-3 border-b hairline flex items-center justify-between gap-3 sticky top-0 bg-[var(--bg-1)] z-10">
        <div className="flex items-center gap-1.5">
          {['ALL','KUP','SPRZEDAJ','TRZYMAJ','ZAPŁAĆ'].map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-[11px] mono uppercase tracking-wider transition
                ${filter === f
                  ? 'bg-[var(--bg-3)] text-[var(--ink)] border hairline-2'
                  : 'text-[var(--ink-mute)] hover:text-[var(--ink)] border border-transparent'}`}
            >{f === 'ALL' ? 'wszystkie' : f.toLowerCase()}</button>
          ))}
        </div>
        <div className="mono text-[10.5px] text-[var(--ink-faint)] uppercase tracking-wider">
          {filtered.length} z {log.length} zdarzeń
        </div>
      </div>

      {/* table head */}
      <div className="grid grid-cols-[88px_92px_68px_1fr_92px_74px] gap-3 px-5 py-2 text-[10px] mono uppercase tracking-[.14em] text-[var(--ink-faint)] border-b hairline">
        <div>data</div>
        <div>akcja</div>
        <div>aktyw</div>
        <div>sygnał / nota</div>
        <div className="text-right">ROC</div>
        <div className="text-right">podatek</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((r, i) => (
          <div key={i}
               className="grid grid-cols-[88px_92px_68px_1fr_92px_74px] gap-3 px-5 py-3 hover:bg-[var(--bg-2)]/40 transition border-b border-dashed hairline group">
            <div className="mono text-[11.5px] text-[var(--ink-dim)] tnum">{fmtDate(r.date)}</div>
            <div><span className={badgeCls(r.kind)}>{r.kind}</span></div>
            <div className="mono text-[12px] text-[var(--ink)] font-semibold tracking-wide">{r.asset}</div>
            <div className="text-[11.5px] text-[var(--ink-mute)] leading-snug truncate group-hover:text-[var(--ink-dim)]">
              {r.note || <span className="text-[var(--ink-faint)]">—</span>}
            </div>
            <div className={`mono text-[11.5px] tnum text-right ${r.roc >= 0 ? 'text-[var(--accent)]' : 'text-[var(--bad)]'}`}>
              {r.roc >= 0 ? '+' : ''}{r.roc.toFixed(1)}%
            </div>
            <div className="mono text-[11.5px] tnum text-right text-[var(--ink-dim)]">
              {r.tax > 0 ? r.tax.toLocaleString('pl-PL') : <span className="text-[var(--ink-faint)]">—</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.RebalancingLog = RebalancingLog;
