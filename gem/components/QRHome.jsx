// Quant Road homepage — hero manifest + featured + posts grid

function PostCard({ post, large }) {
  const tagColor = { accent:'var(--accent)', blue:'var(--blue)', warn:'var(--warn)' }[post.color] || 'var(--accent)';
  return (
    <a href={post.href || `artykul.html?slug=${post.slug}`} className="block group">
      <article className={`border hairline rounded-xl p-5 bg-[var(--bg-1)] hover:border-[var(--line-2)] transition h-full flex flex-col ${large ? 'md:p-7' : ''}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="mono text-[10px] uppercase tracking-[.16em]" style={{color: tagColor}}>{post.tag}</span>
          <span className="h-px flex-1 bg-[var(--line)]"></span>
          <span className="mono text-[10px] tnum text-[var(--ink-faint)]">{post.read} min</span>
        </div>
        <h3 className={`serif tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)] transition leading-tight ${large ? 'text-[34px]' : 'text-[20px]'}`}>
          {post.title}
        </h3>
        <p className={`text-[var(--ink-mute)] mt-3 leading-relaxed ${large ? 'text-[14.5px]' : 'text-[13px]'} line-clamp-3`}>
          {post.deck}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="mono text-[10.5px] text-[var(--ink-faint)] tnum uppercase tracking-wider">
            {new Date(post.date).toLocaleDateString('pl-PL', {day:'2-digit', month:'short', year:'numeric'})}
          </span>
          <span className="text-[12px] text-[var(--ink-mute)] group-hover:text-[var(--accent)] transition flex items-center gap-1">
            Czytaj <Ic.Chevron width="11" height="11"/>
          </span>
        </div>
      </article>
    </a>
  );
}

function QRHome() {
  const featured = window.QRPosts.find(p => p.featured);
  const recent = window.QRPosts.filter(p => !p.featured).slice(0, 6);

  return (
    <>
      <QRTopNav active="home" />

      {/* HERO */}
      <section className="relative overflow-hidden border-b hairline">
        <div className="absolute inset-0 grid-dots opacity-50 pointer-events-none"></div>
        <div className="relative max-w-[1200px] mx-auto px-6 pt-20 pb-24">
          <div className="flex items-center gap-2 mono text-[10.5px] uppercase tracking-[.18em] text-[var(--ink-faint)] mb-6">
            <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
            <span>blog · backtesty · strategie</span>
            <span className="h-px w-12 bg-[var(--line)]"></span>
            <span>od 2024</span>
          </div>
          <h1 className="serif text-[64px] md:text-[96px] leading-[0.92] tracking-[-0.025em] max-w-[16ch]">
            Kwantyfikuj <em className="text-[var(--accent)] not-italic font-normal">decyzje</em><br/>
            finansowe.
          </h1>
          <p className="text-[16px] md:text-[18px] text-[var(--ink-dim)] mt-8 max-w-[60ch] leading-relaxed">
            Quant Road to mój notatnik z drogi przez ilościowe inwestowanie.
            Strategie testowane na danych, kalkulowane realnie — z polskim podatkiem Belki, IKE/IKZE i spreadem FX.
            Bez magii, bez sygnałów premium.
          </p>
          <div className="flex items-center gap-3 mt-10">
            <a href="gem.html" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--accent)] text-[#04261b] text-[13px] font-semibold hover:brightness-110 transition">
              Symulator GEM <Ic.Chevron width="12" height="12"/>
            </a>
            <a href="artykuly.html" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border hairline-2 text-[13px] text-[var(--ink-dim)] hover:text-[var(--ink)] transition">
              Wszystkie artykuły
            </a>
          </div>

          {/* mini stats strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[800px]">
            {[
              { k: 'Artykuły', v: '24', s: 'i rośnie' },
              { k: 'Strategie', v: '3', s: 'live · 2 wip' },
              { k: 'Backtest', v: '15Y', s: '2010–2025' },
              { k: 'Subskrybenci', v: '1.2k', s: '+38 / tydz.' },
            ].map(s => (
              <div key={s.k} className="border-l hairline-2 pl-4">
                <div className="mono text-[10.5px] uppercase tracking-[.14em] text-[var(--ink-faint)]">{s.k}</div>
                <div className="display text-[36px] tnum mt-1.5 text-[var(--ink)]">{s.v}</div>
                <div className="mono text-[11px] text-[var(--ink-mute)] mt-1">{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED STRATEGY */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[.18em] text-[var(--ink-faint)] mb-2">flagowa strategia</div>
            <h2 className="serif text-[36px] tracking-[-0.02em]">Global Equity Momentum</h2>
          </div>
          <a href="strategie.html" className="text-[12.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition">Wszystkie strategie →</a>
        </div>

        <a href="gem.html" className="block group border hairline rounded-2xl p-7 bg-[var(--bg-1)] hover:border-[var(--accent-line)] transition relative overflow-hidden">
          <div className="absolute inset-0 grid-dots opacity-30 pointer-events-none"></div>
          <div className="relative grid md:grid-cols-[1.1fr_1fr] gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge badge-buy">live</span>
                <span className="mono text-[10.5px] uppercase tracking-[.14em] text-[var(--ink-mute)]">strategia · momentum</span>
              </div>
              <h3 className="serif text-[28px] md:text-[32px] tracking-[-0.02em] leading-tight">
                GEM na rynku polskim — z IKE, FX i podatkiem Belki w cenie.
              </h3>
              <p className="text-[14px] text-[var(--ink-dim)] mt-3 leading-relaxed max-w-[55ch]">
                Klasyczny Antonacci, przerobiony pod realia GPW i polskiego inwestora detalicznego.
                Z interaktywnym symulatorem, w którym możesz zmienić każde założenie.
              </p>
              <div className="mt-5 flex items-center gap-2 text-[var(--accent)] text-[13px] group-hover:gap-3 transition-all">
                Otwórz stronę strategii <Ic.Chevron width="13" height="13"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'CAGR', v: '11.8%', s: 'vs 8.1% MSCI', good: true },
                { k: 'Max DD', v: '-14.2%', s: 'vs -33.7%', good: true },
                { k: 'Sharpe', v: '1.04', s: 'vs 0.62', good: true },
                { k: 'Okno', v: '15Y', s: '2010-2025', good: false },
              ].map(s => (
                <div key={s.k} className="border hairline rounded-md p-3 bg-[var(--bg-2)]">
                  <div className="mono text-[10px] uppercase tracking-[.14em] text-[var(--ink-faint)]">{s.k}</div>
                  <div className="display text-[28px] tnum mt-1" style={{color: s.good ? 'var(--accent)' : 'var(--ink)'}}>{s.v}</div>
                  <div className="mono text-[10.5px] text-[var(--ink-mute)] mt-0.5">{s.s}</div>
                </div>
              ))}
            </div>
          </div>
        </a>
      </section>

      {/* RECENT ARTICLES */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 border-t hairline">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[.18em] text-[var(--ink-faint)] mb-2">najnowsze</div>
            <h2 className="serif text-[36px] tracking-[-0.02em]">Z notatnika</h2>
          </div>
          <a href="artykuly.html" className="text-[12.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition">Wszystkie artykuły →</a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recent.map(p => <PostCard key={p.slug} post={p}/>)}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="border hairline rounded-2xl p-8 md:p-12 bg-[var(--bg-1)] grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[.18em] text-[var(--ink-faint)] mb-2">newsletter · raz na 2 tygodnie</div>
            <h3 className="serif text-[28px] tracking-[-0.02em] leading-tight">Dostaniesz nowe analizy zanim trafią na blog.</h3>
            <p className="text-[13.5px] text-[var(--ink-mute)] mt-3 max-w-[55ch] leading-relaxed">
              Jedna wiadomość co dwa tygodnie. Backtesty, błędy, surowy research.
              Bez płatnych „sygnałów", bez clickbaitu.
            </p>
          </div>
          <form className="flex items-center gap-2 self-end" onSubmit={e=>e.preventDefault()}>
            <input type="email" placeholder="ty@example.com"
              className="bg-[var(--bg-2)] border hairline-2 rounded-md px-3 py-2.5 text-[13px] mono text-[var(--ink)] outline-none focus:border-[var(--accent-line)] min-w-[240px]"/>
            <button className="px-4 py-2.5 rounded-md bg-[var(--accent)] text-[#04261b] text-[13px] font-semibold hover:brightness-110 transition">
              Zapisz się
            </button>
          </form>
        </div>
      </section>

      <QRFooter/>
    </>
  );
}

window.QRHome = QRHome;
