// Cost breakdown — 2 columns GEM vs benchmark with side-by-side rows.

function fmtPLN(n){ return n.toLocaleString('pl-PL') + ' PLN'; }

function Row({ label, gem, bench, kind = 'cost', highlight }) {
  const isPos = kind === 'value';
  const better = kind === 'value' ? gem > bench : gem < bench;
  const diff = gem - bench;

  return (
    <div className={`grid grid-cols-[1.1fr_1fr_1fr_70px] items-center gap-3 px-5 py-3 ${highlight ? 'bg-[var(--bg-2)]/60' : ''}`}>
      <div className="text-[12px] text-[var(--ink-dim)]">{label}</div>
      <div className={`mono text-[12.5px] tnum text-right ${highlight ? 'text-[var(--ink)] font-semibold' : 'text-[var(--ink)]'}`}>
        {typeof gem === 'number' ? (kind==='pct' ? `${gem.toFixed(1)}%` : fmtPLN(gem)) : gem}
      </div>
      <div className={`mono text-[12.5px] tnum text-right text-[var(--ink-mute)]`}>
        {typeof bench === 'number' ? (kind==='pct' ? `${bench.toFixed(1)}%` : fmtPLN(bench)) : bench}
      </div>
      <div className={`mono text-[10.5px] tnum text-right ${better ? 'text-[var(--accent)]' : 'text-[var(--bad)]'}`}>
        {kind==='pct'
          ? `${diff>=0?'+':''}${diff.toFixed(1)}pp`
          : `${diff>=0?'+':'−'}${Math.abs(diff).toLocaleString('pl-PL')}`}
      </div>
    </div>
  );
}

function CostBreakdown({ costs, benchLabel = 'Benchmark' }) {
  const c = costs || { gem: { brokerFees: 0, taxesPaid: 0, gross: 0, finalTax: 0, net: 0, grossReturn: 0, netReturn: 0 }, bench: { brokerFees: 0, taxesPaid: 0, gross: 0, finalTax: 0, net: 0, grossReturn: 0, netReturn: 0 } };

  return (
    <div className="flex flex-col h-full">
      {/* head */}
      <div className="grid grid-cols-[1.1fr_1fr_1fr_70px] gap-3 px-5 py-3 border-b hairline sticky top-0 bg-[var(--bg-1)] z-10">
        <div className="text-[10px] mono uppercase tracking-[.14em] text-[var(--ink-faint)]">pozycja</div>
        <div className="text-[10px] mono uppercase tracking-[.14em] text-right">
          <span className="text-[var(--accent)]">strategia GEM</span>
        </div>
        <div className="text-[10px] mono uppercase tracking-[.14em] text-[var(--ink-faint)] text-right">
          <span className="text-[var(--blue)]">{benchLabel}</span>
        </div>
        <div className="text-[10px] mono uppercase tracking-[.14em] text-[var(--ink-faint)] text-right">delta</div>
      </div>

      {/* rows */}
      <div className="flex-1 overflow-y-auto dotted-row">
        <Row label="Opłaty brokera" gem={c.gem.brokerFees} bench={c.bench.brokerFees} kind="cost" />
        <Row label="Zapłacony podatek (Belka)" gem={c.gem.taxesPaid} bench={c.bench.taxesPaid} kind="cost" />

        <div className="px-5 pt-4 pb-2 text-[10px] mono uppercase tracking-[.14em] text-[var(--ink-faint)]">na koniec okresu</div>

        <Row label="Wartość brutto portfela" gem={c.gem.gross} bench={c.bench.gross} kind="value" />
        <Row label="Podatek likwidacyjny" gem={c.gem.finalTax} bench={c.bench.finalTax} kind="cost" />
        <Row label="Wartość netto" gem={c.gem.net} bench={c.bench.net} kind="value" highlight />

        <div className="px-5 pt-4 pb-2 text-[10px] mono uppercase tracking-[.14em] text-[var(--ink-faint)]">stopy zwrotu</div>

        <Row label="Zwrot brutto" gem={c.gem.grossReturn} bench={c.bench.grossReturn} kind="pct" />
        <Row label="Zwrot netto" gem={c.gem.netReturn} bench={c.bench.netReturn} kind="pct" highlight />
      </div>

      {/* footer note */}
      <div className="px-5 py-3 border-t hairline mono text-[10.5px] text-[var(--ink-faint)] flex items-center gap-2">
        <Ic.Shield width="11" height="11" className="text-[var(--ink-mute)]"/>
        Tarcza IKE/IKZE oszczędza <span className="text-[var(--accent)] tnum">{(c.gem.taxesPaid + c.gem.finalTax).toLocaleString('pl-PL')} PLN</span> podatku w 15-letnim oknie.
      </div>
    </div>
  );
}

window.CostBreakdown = CostBreakdown;
