// Shared layout: top nav + footer used on every page.

const NAV = [
  { id:'home',       label:'Start',     href:'index.html' },
  { id:'articles',   label:'Artykuły',  href:'artykuly.html' },
  { id:'strategies', label:'Strategie', href:'strategie.html' },
];

/* ── Contact Modal ─────────────────────────────────────────── */
function QRContactModal({ onClose }) {
  const [status, setStatus] = React.useState('idle'); // idle | sending | ok | err

  function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    const form = e.target;
    const data = new URLSearchParams(new FormData(form)).toString();
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data,
    })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('err'));
  }

  // Close on backdrop click
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-md rounded-xl border hairline bg-[var(--bg-1)] shadow-2xl p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[15px] font-semibold">Napisz do mnie</div>
            <div className="mono text-[10.5px] uppercase tracking-[.15em] text-[var(--ink-faint)] mt-0.5">kontakt</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-[var(--ink-mute)] hover:text-[var(--ink)] hover:bg-[var(--bg-2)] transition"
            aria-label="Zamknij"
          >
            ✕
          </button>
        </div>

        {status === 'ok' ? (
          <div className="py-8 text-center">
            <div className="text-[var(--accent)] text-[28px] mb-3">✓</div>
            <div className="text-[14px] font-medium">Wiadomość wysłana!</div>
            <div className="text-[13px] text-[var(--ink-mute)] mt-1">Odezwę się najszybciej jak mogę.</div>
            <button
              onClick={onClose}
              className="mt-5 px-4 py-2 rounded-md bg-[var(--accent)] text-[#04261b] text-[13px] font-semibold hover:brightness-110 transition"
            >
              Zamknij
            </button>
          </div>
        ) : (
          <form
            name="kontakt"
            method="POST"
            data-netlify="true"
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <input type="hidden" name="form-name" value="kontakt" />

            <div>
              <label className="block mono text-[10.5px] uppercase tracking-[.15em] text-[var(--ink-faint)] mb-1">
                Imię i nazwisko
              </label>
              <input
                type="text"
                name="imie_nazwisko"
                required
                placeholder="Jan Kowalski"
                className="w-full rounded-md border hairline bg-[var(--bg-2)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>

            <div>
              <label className="block mono text-[10.5px] uppercase tracking-[.15em] text-[var(--ink-faint)] mb-1">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="jan@example.com"
                className="w-full rounded-md border hairline bg-[var(--bg-2)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>

            <div>
              <label className="block mono text-[10.5px] uppercase tracking-[.15em] text-[var(--ink-faint)] mb-1">
                Telefon <span className="normal-case tracking-normal opacity-60">(opcjonalnie)</span>
              </label>
              <input
                type="tel"
                name="telefon"
                placeholder="+48 600 000 000"
                className="w-full rounded-md border hairline bg-[var(--bg-2)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>

            <div>
              <label className="block mono text-[10.5px] uppercase tracking-[.15em] text-[var(--ink-faint)] mb-1">
                Wiadomość
              </label>
              <textarea
                name="wiadomosc"
                required
                rows={4}
                placeholder="Twoja wiadomość…"
                className="w-full rounded-md border hairline bg-[var(--bg-2)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition resize-none"
              />
            </div>

            {status === 'err' && (
              <div className="text-[12px] text-red-400">
                Coś poszło nie tak. Spróbuj ponownie lub napisz bezpośrednio na hello@kwantowo.pl.
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-2.5 rounded-md bg-[var(--accent)] text-[#04261b] text-[13px] font-semibold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? 'Wysyłanie…' : 'Wyślij wiadomość'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Top Nav ───────────────────────────────────────────────── */
function QRTopNav({ active = 'home' }) {
  return (
    <header className="border-b hairline glass sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto h-14 px-6 flex items-center justify-between">
        <a href="index.html" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
            <span className="mono text-[13px] font-bold text-[#04261b]">Q</span>
          </div>
          <div className="leading-tight">
            <div className="text-[14px] font-medium tracking-[-0.01em]">kwantowo.pl</div>
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

/* ── Footer ────────────────────────────────────────────────── */
function QRFooter() {
  const [contactOpen, setContactOpen] = React.useState(false);

  return (
    <>
      {contactOpen && <QRContactModal onClose={() => setContactOpen(false)} />}

      <footer className="border-t hairline mt-20 bg-[var(--bg-1)]">
        <div className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
                <span className="mono text-[13px] font-bold text-[#04261b]">Q</span>
              </div>
              <span className="text-[15px] font-medium">kwantowo.pl</span>
            </div>
            <p className="text-[13px] text-[var(--ink-mute)] mt-3 leading-relaxed max-w-[44ch]">
              Niezależny blog o ilościowym podejściu do inwestowania. Strategie, narzędzia,
              otwarte dane. <span className="text-[var(--ink-dim)]">Bez porad inwestycyjnych. Wszystko, co czytasz, to edukacja.</span>
            </p>
          </div>

          <div>
            <div className="text-[10.5px] mono uppercase tracking-[.16em] text-[var(--ink-faint)] mb-3">Czytaj</div>
            <ul className="space-y-2 text-[13px]">
              <li><a className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition" href="artykuly.html">Wszystkie artykuły</a></li>
              <li><a className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition" href="strategie.html">Katalog strategii</a></li>
            </ul>
          </div>

          <div>
            <div className="text-[10.5px] mono uppercase tracking-[.16em] text-[var(--ink-faint)] mb-3">Kontakt</div>
            <ul className="space-y-2 text-[13px]">
              <li>
                <button
                  onClick={() => setContactOpen(true)}
                  className="text-[var(--ink-dim)] hover:text-[var(--accent)] transition cursor-pointer bg-transparent border-0 p-0 text-[13px]"
                >
                  Napisz do mnie
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t hairline">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3 mono text-[10.5px] uppercase tracking-[.14em] text-[var(--ink-faint)]">
            <div>© 2025 kwantowo.pl · prywatny blog edukacyjny</div>
            <div className="flex items-center gap-3">
              <span>nie stanowi porady inwestycyjnej</span>
              <span>·</span>
              <a className="hover:text-[var(--ink-mute)]" href="#">polityka prywatności</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

window.QRTopNav = QRTopNav;
window.QRFooter = QRFooter;
window.QRContactModal = QRContactModal;
