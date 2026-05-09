// Strategies list

function QRStrategiesList() {
  const items = window.QRStrategies;
  const labels = { live: 'live', wip: 'w przygotowaniu', planned: 'planowana' };

  return (
    <>
      <QRTopNav active="strategies"/>
      <section className="max-w-[1200px] mx-auto px-6 pt-14 pb-10 border-b hairline">
        <div className="mono text-[10.5px] uppercase tracking-[.18em] text-[var(--ink-faint)] mb-3">strategie</div>
        <h1 className="serif text-[56px] md:text-[72px] leading-[0.95] tracking-[-0.025em]">
          Strategie z <em className="text-[var(--accent)] not-italic">backtestem</em>.
        </h1>
        <p className="text-[15px] text-[var(--ink-dim)] mt-5 max-w-[60ch] leading-relaxed">
          Każda strategia ma stronę z explainerem, założeniami, kosztami i interaktywnym symulatorem. Dane historyczne 2010–2025.
        </p>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 py-10 space-y-4">
        {items.map(s => {
          const isLive = s.status === 'live';
          return (
            <a key={s.slug}
               href={isLive ? s.href : '#'}
               className={`group block border hairline rounded-xl p-6 bg-[var(--bg-1)] transition
                 ${isLive ? 'hover:border-[var(--accent-line)]' : 'opacity-70 cursor-not-allowed'}`}>
              <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${isLive ? 'badge-buy' : 'badge-hold'}`}>{labels[s.status]}</span>
                    <span className="mono text-[10.5px] uppercase tracking-[.14em] text-[var(--ink-mute)]">/{s.slug}</span>
                  </div>
                  <h3 className="serif text-[28px] tracking-[-0.02em] leading-tight group-hover:text-[var(--accent)] transition">
                    {s.name}
                  </h3>
                  <p className="text-[13.5px] text-[var(--ink-dim)] mt-2 leading-relaxed max-w-[55ch]">
                    {s.deck}
                  </p>
                </div>
                {s.cagr != null ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border hairline rounded-md p-3 bg-[var(--bg-2)]">
                      <div className="mono text-[10px] uppercase tracking-[.14em] text-[var(--ink-faint)]">CAGR</div>
                      <div className="display text-[24px] tnum mt-1 text-[var(--accent)]">{s.cagr.toFixed(1)}%</div>
                      <div className="mono text-[10px] text-[var(--ink-mute)] mt-0.5">vs {s.benchCagr.toFixed(1)}%</div>
                    </div>
                    <div className="border hairline rounded-md p-3 bg-[var(--bg-2)]">
                      <div className="mono text-[10px] uppercase tracking-[.14em] text-[var(--ink-faint)]">DD</div>
                      <div className="display text-[24px] tnum mt-1 text-[var(--ink)]">{s.maxDd.toFixed(1)}%</div>
                    </div>
                    <div className="border hairline rounded-md p-3 bg-[var(--bg-2)]">
                      <div className="mono text-[10px] uppercase tracking-[.14em] text-[var(--ink-faint)]">Sharpe</div>
                      <div className="display text-[24px] tnum mt-1 text-[var(--ink)]">{s.sharpe.toFixed(2)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mono text-[11px] text-[var(--ink-faint)] uppercase tracking-[.14em] border hairline rounded-md p-4 text-center bg-[var(--bg-2)]">
                    {s.status === 'wip' ? 'Backtest trwa — ETA Q2 2026' : 'Na liście — bez ETA'}
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </section>

      <QRFooter/>
    </>
  );
}

window.QRStrategiesList = QRStrategiesList;
