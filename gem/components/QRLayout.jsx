// Shared layout: top nav + footer used on every page.

const NAV = [
  { id:'home',       label:'Wpisy',     href:'index.html' },
  { id:'strategies', label:'Strategie', href:'strategie.html', mobileHidden:true },
  { id:'tools',      label:'Symulator GEM', href:'gem.html' },
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
      style={{ background: 'rgba(0,0,0,0.55)',  }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-md rounded-sm border border-[var(--ink)] bg-[var(--bg)] p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[15px] font-semibold">Napisz do mnie</div>
            <div className="text-[13px] text-[var(--ink-mute)] mt-0.5">kontakt</div>
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
              className="mt-5 px-4 py-2 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] text-[13px] font-semibold hover:brightness-110 transition"
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
              <label className="block text-[13px] text-[var(--ink-mute)] mb-1">
                Imię i nazwisko
              </label>
              <input
                type="text"
                name="imie_nazwisko"
                required
                placeholder="Jan Kowalski"
                className="w-full rounded-sm border hairline bg-[var(--bg-2)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>

            <div>
              <label className="block text-[13px] text-[var(--ink-mute)] mb-1">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="jan@example.com"
                className="w-full rounded-sm border hairline bg-[var(--bg-2)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>

            <div>
              <label className="block text-[13px] text-[var(--ink-mute)] mb-1">
                Telefon <span className="normal-case tracking-normal opacity-60">(opcjonalnie)</span>
              </label>
              <input
                type="tel"
                name="telefon"
                placeholder="+48 600 000 000"
                className="w-full rounded-sm border hairline bg-[var(--bg-2)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>

            <div>
              <label className="block text-[13px] text-[var(--ink-mute)] mb-1">
                Wiadomość
              </label>
              <textarea
                name="wiadomosc"
                required
                rows={4}
                placeholder="Twoja wiadomość…"
                className="w-full rounded-sm border hairline bg-[var(--bg-2)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition resize-none"
              />
            </div>

            {status === 'err' && (
              <div className="text-[13px] text-[var(--bad)]">
                Nie udało się wysłać wiadomości. Spróbuj ponownie.
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-2.5 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] text-[13px] font-semibold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? 'Wysyłanie…' : 'Wyślij wiadomość'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Newsletter Modal ──────────────────────────────────────── */
function QRNewsletterModal({ onClose }) {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle | sending | ok | err
  const [errMsg, setErrMsg] = React.useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('ok');
      } else {
        setErrMsg(data.error || 'Coś poszło nie tak.');
        setStatus('err');
      }
    } catch {
      setErrMsg('Brak połączenia. Spróbuj ponownie.');
      setStatus('err');
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)',  }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-md rounded-sm border border-[var(--ink)] bg-[var(--bg)] p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[15px] font-semibold">Newsletter</div>
            <div className="text-[13px] text-[var(--ink-mute)] mt-0.5">bezpłatnie</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-[var(--ink-mute)] hover:text-[var(--ink)] hover:bg-[var(--bg-2)] transition"
            aria-label="Zamknij"
          >✕</button>
        </div>

        {status === 'ok' ? (
          <div className="py-8 text-center">
            <div className="text-[var(--accent)] text-[28px] mb-3">✓</div>
            <div className="text-[14px] font-medium">Zapisano!</div>
            <div className="text-[13px] text-[var(--ink-mute)] mt-1">Sprawdź skrzynkę — możliwe że trafiło do spamu.</div>
            <button
              onClick={onClose}
              className="mt-5 px-4 py-2 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] text-[13px] font-semibold hover:brightness-110 transition"
            >Zamknij</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-[13px] text-[var(--ink-mute)] leading-relaxed">
              Backtesty, błędy, surowy research. Bez clickbaitu, bez „sygnałów premium".
            </p>
            <div>
              <label className="block text-[13px] text-[var(--ink-mute)] mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ty@example.com"
                className="w-full rounded-sm border hairline bg-[var(--bg-2)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>
            {status === 'err' && (
              <div className="text-[13px] text-[var(--bad)]">{errMsg}</div>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-2.5 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] text-[13px] font-semibold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? 'Zapisuję…' : 'Zapisz się'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Logo i przełącznik motywu ─────────────────────────────── */
function QRLogo({ size = 32 }) {
  return (
    <svg viewBox="0 0 800 800" width={size} height={size} aria-hidden="true" style={{ display: 'block' }}>
      <rect width="800" height="800" fill="#0E141C"/>
      <g transform="translate(400 400) scale(1.12) translate(-400 -400)">
        <rect x="230" y="215" width="100" height="370" fill="#E9E8E4"/>
        <polygon points="372,400 488,400 583,215 467,215" fill="#E9E8E4"/>
        <polygon points="372,400 488,400 583,585 467,585" fill="#E3A548"/>
      </g>
    </svg>
  );
}

function QRThemeToggle() {
  function toggle() {
    const r = document.documentElement;
    const dark = r.dataset.theme ? r.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    r.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('kw-theme', r.dataset.theme); } catch (e) {}
  }
  return (
    <button type="button" onClick={toggle} className="k-theme" aria-label="Przełącz jasny i ciemny motyw" title="Jasny / ciemny">
      <svg className="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor"/></svg>
      <svg className="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g></svg>
    </button>
  );
}

/* ── Top Nav ───────────────────────────────────────────────── */
function QRTopNav({ active = 'home' }) {
  return (
    <header>
      <div className="k-wrap k-wide flex items-center justify-between gap-4 py-6">
        <a href="index.html" className="flex items-center gap-2.5 shrink-0" aria-label="Kwantyka, strona główna">
          <QRLogo size={28}/>
          <span className="display-font text-[17px] sm:text-[19px]">Kwantyka</span>
        </a>
        <nav className="k-nav flex items-center gap-4 sm:gap-6 text-[14px] sm:text-[14.5px] text-[var(--ink-dim)]" aria-label="Główna">
          {NAV.map(item => (
            <a key={item.id} href={item.href} aria-current={active === item.id ? 'page' : undefined}
               className={`whitespace-nowrap hover:text-[var(--ink)] ${item.mobileHidden ? 'hidden sm:inline' : ''}`}>
              {item.label}
            </a>
          ))}
          <QRThemeToggle/>
        </nav>
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
      <footer className="mt-24 border-t hairline">
        <div className="k-wrap k-wide py-8 flex flex-wrap items-start justify-between gap-6 text-[13.5px] text-[var(--ink-mute)]">
          <div className="max-w-[44ch]">
            <div className="flex items-center gap-2.5 text-[var(--ink)]">
              <QRLogo size={22}/><span className="display-font text-[15px]">Kwantyka</span>
            </div>
            <p className="mt-3 leading-relaxed">Backtesty, koszty i strategie sprawdzone na danych. Materiały edukacyjne, nie porada inwestycyjna.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a className="hover:text-[var(--ink)]" href="artykuly.html">Wpisy</a>
            <a className="hover:text-[var(--ink)]" href="strategie.html">Strategie</a>
            <a className="hover:text-[var(--ink)]" href="gem.html">Symulator GEM</a>
            <button type="button" onClick={() => setContactOpen(true)} className="hover:text-[var(--ink)]">Kontakt</button>
          </div>
        </div>
        <div className="k-wrap k-wide pb-10 text-[13px] text-[var(--ink-mute)]">© {new Date().getFullYear()} Kwantyka</div>
      </footer>
    </>
  );
}

window.QRTopNav = QRTopNav;
window.QRFooter = QRFooter;
window.QRContactModal = QRContactModal;
window.QRNewsletterModal = QRNewsletterModal;
window.QRLogo = QRLogo;
