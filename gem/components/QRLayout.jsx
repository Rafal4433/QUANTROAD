// Shared layout: top nav + footer used on every page.

const NAV = [
  { id:'home',       label:'Start',     href:'index.html' },
  { id:'articles',   label:'Artykuły',  href:'artykuly.html' },
  { id:'strategies', label:'Strategie', href:'strategie.html' },
];

function QRTopNav({ active = 'home' }) {
  return (
    <header className="border-b hairline glass sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto h-14 px-6 flex items-center justify-between">
        <a href="index.html" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
            <span className="mono text-[13px] font-bold text-[#04261b]">Q</span>
          </div>
          <div className="leading-tight">
            <div className="text-[14px] font-medium tracking-[-0.01em]">Quant Road</div>
            <div className="mono text-[9.5px] uppercase tracking-[.18em] text-[var(--ink-faint)] -mt-0.5">finanse · dane · kod</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(item => (
            <a key={item.id}
               href={item.href}
               className={`px-3 py-1.5 rounded text-[13px] transition ${
                 active === item.id
                   ? 'text-[var(--ink)] bg-[var(--bg-2)]'
                   : 'text-[var(--ink-mute)] hover:text-[var(--ink)]'
               }`}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--bg-2)] border hairline mono text-[11px] text-[var(--ink-mute)]">
            {window.Ic && <Ic.Search width="11" height="11"/>}
            <span>szukaj artykułu</span>
            <span className="ml-3 px-1 py-0.5 rounded bg-[var(--bg-3)] text-[9.5px] text-[var(--ink-faint)]">⌘K</span>
          </div>
          <a href="#newsletter" className="hidden sm:inline-block px-3 py-1.5 rounded-md bg-[var(--accent)] text-[#04261b] text-[12.5px] font-semibold hover:brightness-110 transition">
            Newsletter
          </a>
        </div>
      </div>
    </header>
  );
}

function QRFooter() {
  return (
    <footer className="border-t hairline mt-20 bg-[var(--bg-1)]">
      <div className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
              <span className="mono text-[13px] font-bold text-[#04261b]">Q</span>
            </div>
            <span className="text-[15px] font-medium">Quant Road</span>
          </div>
          <p className="text-[13px] text-[var(--ink-mute)] mt-3 leading-relaxed max-w-[44ch]">
            Niezależny blog o ilościowym podejściu do inwestowania. Strategie, narzędzia,
            otwarte dane. <span className="text-[var(--ink-dim)]">Bez porad inwestycyjnych — wszystko, co czytasz, to edukacja.</span>
          </p>
        </div>

        <div>
          <div className="text-[10.5px] mono uppercase tracking-[.16em] text-[var(--ink-faint)] mb-3">Czytaj</div>
          <ul className="space-y-2 text-[13px]">
            <li><a className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition" href="artykuly.html">Wszystkie artykuły</a></li>
            <li><a className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition" href="strategie.html">Katalog strategii</a></li>
            <li><a className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition" href="gem.html">Symulator GEM</a></li>
            <li><a className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition" href="o-mnie.html">O mnie</a></li>
          </ul>
        </div>

        <div>
          <div className="text-[10.5px] mono uppercase tracking-[.16em] text-[var(--ink-faint)] mb-3">Kontakt</div>
          <ul className="space-y-2 text-[13px]">
            <li><a className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition" href="#">RSS</a></li>
            <li><a className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition" href="#">Mastodon</a></li>
            <li><a className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition" href="#">GitHub</a></li>
            <li><a className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition" href="mailto:hello@quantroad.pl">e-mail</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3 mono text-[10.5px] uppercase tracking-[.14em] text-[var(--ink-faint)]">
          <div>© 2025 Quant Road · prywatny blog edukacyjny</div>
          <div className="flex items-center gap-3">
            <span>nie stanowi porady inwestycyjnej</span>
            <span>·</span>
            <a className="hover:text-[var(--ink-mute)]" href="#">polityka prywatności</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

window.QRTopNav = QRTopNav;
window.QRFooter = QRFooter;
