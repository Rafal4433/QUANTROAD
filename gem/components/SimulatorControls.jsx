// Sidebar: konfiguracja strategii GEM — 3 kroki.
// Używa wewnętrznych ID silnika (usa, nq, exus, ...) zamiast tickerów ETF.

const RISKY = [
  { id: 'usa',  ticker: 'VTSMX', sub: 'US Total Mkt' },
  { id: 'nq',   ticker: 'QQQ',   sub: 'Nasdaq 100' },
  { id: 'exus', ticker: 'VGTSX', sub: 'Intl ex-US' },
  { id: 'em',   ticker: 'VEIEX', sub: 'Emerging Mkts' },
  { id: 'epol', ticker: 'EPOL',  sub: 'Polska MSCI' },
  { id: 'gld',  ticker: 'GLD',   sub: 'Złoto' },
  { id: 'btc',  ticker: 'BTC',   sub: 'Bitcoin' },
];

const SAFE = [
  { id: 'dynamic', ticker: 'DYN',   sub: 'Dynamiczny' },
  { id: 'shy',     ticker: 'SHY',   sub: 'T-bill 1–3Y' },
  { id: 'bonds',   ticker: 'VBMFX', sub: 'Bonds Total' },
  { id: 'tlt',     ticker: 'TLT',   sub: 'T-bond 20Y+' },
];

function Section({ step, title, hint, children }) {
  return (
    <section className="px-5 py-5 border-b hairline">
      <header className="flex items-center gap-2 mb-4">
        <span className="step-num active">{step}</span>
        <h3 className="text-[13px] font-medium tracking-[-0.01em]">{title}</h3>
        {hint && <span className="ml-auto text-[10px] mono uppercase tracking-wider text-[var(--ink-faint)]">{hint}</span>}
      </header>
      {children}
    </section>
  );
}

function Chip({ on, onClick, ticker, sub }) {
  return (
    <button onClick={onClick} className={`chip focus-ring justify-start w-full ${on ? 'on' : ''}`}>
      <span className="chip-dot shrink-0"></span>
      <span className="mono text-[12px] font-semibold tracking-wide">{ticker}</span>
      <span className="text-[10.5px] text-[var(--ink-mute)] truncate">· {sub}</span>
    </button>
  );
}

function Slider({ label, value, min, max, step = 1, suffix = '', onChange, hint }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] text-[var(--ink-dim)]">{label}</span>
        <span className="mono text-[12px] tnum text-[var(--ink)]">{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={e => onChange(+e.target.value)} className="w-full focus-ring" />
      {hint && <div className="text-[10.5px] text-[var(--ink-faint)] mono mt-1.5">{hint}</div>}
    </label>
  );
}

function NumInput({ label, value, onChange, suffix = 'PLN' }) {
  return (
    <label className="block">
      <div className="text-[12px] text-[var(--ink-dim)] mb-1.5">{label}</div>
      <div className="flex items-center gap-1 bg-[var(--bg-2)] border hairline rounded-md px-3 py-2 focus-within:border-[var(--line-2)]">
        <input
          type="text"
          value={value.toLocaleString('pl-PL')}
          onChange={e => onChange(+e.target.value.replace(/\D/g, '') || 0)}
          className="bg-transparent outline-none flex-1 mono text-[13px] tnum text-[var(--ink)]"
        />
        <span className="mono text-[10.5px] text-[var(--ink-mute)] uppercase tracking-wider">{suffix}</span>
      </div>
    </label>
  );
}

function Toggle({ on, onChange, label, desc }) {
  return (
    <button onClick={() => onChange(!on)} className="w-full flex items-start gap-3 text-left focus-ring rounded-md py-1">
      <span className={`toggle ${on ? 'on' : ''} mt-0.5 shrink-0`}></span>
      <span className="flex-1">
        <span className="block text-[12.5px] text-[var(--ink)]">{label}</span>
        {desc && <span className="block text-[10.5px] text-[var(--ink-mute)] mt-0.5 leading-relaxed">{desc}</span>}
      </span>
    </button>
  );
}

function SimulatorControls({ params, setParams }) {
  const p = params;
  const upd = (k, v) => setParams({ ...p, [k]: v });

  const toggleRisk = id => {
    const next = p.riskAssets.includes(id)
      ? p.riskAssets.filter(x => x !== id)
      : [...p.riskAssets, id];
    if (next.length === 0) return; // przynajmniej 1 aktyw
    upd('riskAssets', next);
  };

  return (
    <aside className="simulator-controls h-full flex flex-col bg-[var(--bg-1)] border-r hairline">
      {/* header */}
      <div className="px-5 pt-5 pb-4 border-b hairline">
        <div className="flex items-center gap-2 text-[10.5px] mono uppercase tracking-[.18em] text-[var(--ink-faint)] mb-2">
          <span>panel</span>
          <span className="h-px bg-[var(--line)] flex-1"></span>
          <span>3 kroki</span>
        </div>
        <h2 className="text-[16px] font-medium tracking-[-0.01em]">Konfiguracja strategii</h2>
        <p className="text-[11.5px] text-[var(--ink-mute)] mt-1 leading-relaxed">
          Ustaw wszechświat aktywów, sygnał trendu i ekonomię. Wynik przelicza się na bieżąco.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Krok 1 — Wszechświat aktywów */}
        <Section step="1" title="Wszechświat aktywów" hint="zaznacz dowolne">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10.5px] mono uppercase tracking-[.14em] text-[var(--ink-mute)]">Aktywa ryzykowne</span>
                <span className="mono text-[10.5px] text-[var(--accent)]">{p.riskAssets.length}/{RISKY.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {RISKY.map(a => (
                  <Chip key={a.id} ticker={a.ticker} sub={a.sub}
                        on={p.riskAssets.includes(a.id)} onClick={() => toggleRisk(a.id)} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10.5px] mono uppercase tracking-[.14em] text-[var(--ink-mute)]">Bezpieczna przystań</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {SAFE.map(a => (
                  <Chip key={a.id} ticker={a.ticker} sub={a.sub}
                        on={p.safeAsset === a.id} onClick={() => upd('safeAsset', a.id)} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Krok 2 — Trend i benchmark */}
        <Section step="2" title="Trend i punkt odniesienia" hint="sygnał">
          <div className="space-y-4">
            <div>
              <div className="text-[12px] text-[var(--ink-dim)] mb-2">Benchmark</div>
              <div className="seg w-full">
                <button className={`flex-1 ${p.benchmark === 'MSCI' ? 'on' : ''}`} onClick={() => upd('benchmark', 'MSCI')}>MSCI World</button>
                <button className={`flex-1 ${p.benchmark === 'SP500' ? 'on' : ''}`} onClick={() => upd('benchmark', 'SP500')}>S&P 500</button>
              </div>
            </div>

            <div className="bg-[var(--bg-2)] border hairline rounded-md px-3 py-2.5 flex items-center justify-between">
              <div>
                <div className="text-[12px] text-[var(--ink)]">Algorytm trendu</div>
                <div className="text-[10.5px] text-[var(--ink-mute)] mono mt-0.5">
                  {p.ensembleMomentum ? 'Ensemble · 3M · 6M · 12M' : `Prosty · ${p.lookback}M ROC`}
                </div>
              </div>
              <Toggle on={p.ensembleMomentum} onChange={v => upd('ensembleMomentum', v)} label="" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Slider label="Okno ROC" value={p.lookback} min={1} max={36} suffix=" mies."
                      onChange={v => upd('lookback', v)} />
              <Slider label="Bufor histerezy" value={p.whipsawBuffer} min={0} max={10} step={0.5} suffix="%"
                      onChange={v => upd('whipsawBuffer', v)} />
            </div>
          </div>
        </Section>

        {/* Krok 3 — Ekonomia portfela */}
        <Section step="3" title="Ekonomia portfela" hint="koszty">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Kapitał startowy" value={p.initialCapital} onChange={v => upd('initialCapital', v)} />
              <NumInput label="Miesięczne DCA"   value={p.monthlyDCA}     onChange={v => upd('monthlyDCA', v)} />
            </div>

            <div className="space-y-3 pt-1">
              <Slider label="Dźwignia marginowa" value={p.leverage} min={1} max={3} step={0.1} suffix="×"
                      onChange={v => upd('leverage', v)}
                      hint={p.leverage > 1 ? `Zwiększa ekspozycję ${p.leverage.toFixed(1)}× — ryzyko rośnie proporcjonalnie` : null} />
              <Slider label="Opłata brokera" value={p.brokerFee} min={0} max={1} step={0.05} suffix="%"
                      onChange={v => upd('brokerFee', v)} />
              <Slider label="Spread FX" value={p.fxSpread} min={0} max={0.5} step={0.02} suffix="%"
                      onChange={v => upd('fxSpread', v)} />
            </div>

            <div className="bg-[var(--bg-2)] border hairline rounded-md p-3 space-y-3">
              <Toggle
                on={p.ikeActive}
                onChange={v => upd('ikeActive', v)}
                label="IKE / IKZE Shield"
                desc="Tarcza podatkowa — 19% podatku Belki zwolnione przy spełnieniu warunków."
              />
            </div>
          </div>
        </Section>
      </div>

      {/* footer */}
      <div className="px-5 py-4 border-t hairline">
        <div className="mono text-[10.5px] text-[var(--ink-faint)] text-center uppercase tracking-[.14em]">
          {p.riskAssets.length} ryzykownych · {p.safeAsset} · IKE {p.ikeActive ? 'ON' : 'OFF'}
        </div>
      </div>
    </aside>
  );
}

window.SimulatorControls = SimulatorControls;
