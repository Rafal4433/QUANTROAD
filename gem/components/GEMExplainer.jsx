// GEMExplainer — primer above the simulator. Explains the strategy in plain Polish.

function GEMExplainer() {
  return (
    <section className="border-b hairline">
      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT — narrative */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 text-[10.5px] mono uppercase tracking-[.18em] text-[var(--ink-faint)] mb-3">
            <span className="px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)]">strategia</span>
            <span>global equity momentum</span>
            <span>·</span>
            <span>antonacci, 2014</span>
          </div>

          <h1 className="serif text-[44px] md:text-[56px] leading-[0.98] tracking-[-0.02em]">
            Idziesz tam, gdzie <span className="italic text-[var(--accent)]">już rośnie</span>.<br/>
            Schodzisz, gdy <span className="italic">przestaje</span>.
          </h1>

          <p className="text-[15px] text-[var(--ink-dim)] mt-6 max-w-[60ch] leading-relaxed">
            GEM — <em className="not-italic text-[var(--ink)]">Global Equity Momentum</em> — to jedna z najprostszych strategii ilościowych,
            która historycznie pobiła rynek przy o połowę mniejszym obsunięciu. Algorytm robi tylko trzy rzeczy:
          </p>

          <ol className="mt-6 space-y-4 max-w-[58ch]">
            <li className="flex gap-4">
              <span className="step-num active shrink-0 mt-0.5">1</span>
              <div>
                <div className="text-[14px] text-[var(--ink)]">Sprawdza, czy akcje rosną szybciej niż T-bille</div>
                <div className="text-[12.5px] text-[var(--ink-mute)] mt-1 leading-relaxed">
                  Jeśli ostatnie 12 miesięcy dało mniej niż obligacje krótkoterminowe — siedzimy w obligacjach. Bessa nie nasza wojna.
                </div>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="step-num active shrink-0 mt-0.5">2</span>
              <div>
                <div className="text-[14px] text-[var(--ink)]">Wybiera lidera momentum z koszyka aktywów ryzyka</div>
                <div className="text-[12.5px] text-[var(--ink-mute)] mt-1 leading-relaxed">
                  US, Europa, rynki wschodzące, czasem złoto albo BTC. Ten, który ostatnio zarobił najwięcej, dostaje 100% kapitału.
                </div>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="step-num active shrink-0 mt-0.5">3</span>
              <div>
                <div className="text-[14px] text-[var(--ink)]">Powtarza co miesiąc</div>
                <div className="text-[12.5px] text-[var(--ink-mute)] mt-1 leading-relaxed">
                  Bez emocji, bez prognoz, bez „ja wiem, że to odbije". Pierwszy poniedziałek miesiąca, sprawdź, rotuj, koniec.
                </div>
              </div>
            </li>
          </ol>

        </div>

        {/* RIGHT — proof block */}
        <aside className="lg:col-span-5">
          <div className="border hairline rounded-xl bg-[var(--bg-1)] p-5">
            <div className="text-[10.5px] mono uppercase tracking-[.16em] text-[var(--ink-faint)]">15 lat backtestu · 2010–2025</div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <div className="text-[10.5px] mono uppercase tracking-[.14em] text-[var(--ink-mute)]">CAGR</div>
                <div className="display text-[36px] tnum text-[var(--accent)] mt-1.5">11.8<span className="text-[18px] text-[var(--ink-mute)]">%</span></div>
                <div className="mono text-[10.5px] text-[var(--ink-faint)] mt-1">vs MSCI 8.1%</div>
              </div>
              <div>
                <div className="text-[10.5px] mono uppercase tracking-[.14em] text-[var(--ink-mute)]">Maks. obsunięcie</div>
                <div className="display text-[36px] tnum mt-1.5">−14.2<span className="text-[18px] text-[var(--ink-mute)]">%</span></div>
                <div className="mono text-[10.5px] text-[var(--ink-faint)] mt-1">vs MSCI −33.7%</div>
              </div>
              <div>
                <div className="text-[10.5px] mono uppercase tracking-[.14em] text-[var(--ink-mute)]">Sharpe</div>
                <div className="display text-[36px] tnum mt-1.5">1.04</div>
                <div className="mono text-[10.5px] text-[var(--ink-faint)] mt-1">vs MSCI 0.62</div>
              </div>
              <div>
                <div className="text-[10.5px] mono uppercase tracking-[.14em] text-[var(--ink-mute)]">Czas w bessie</div>
                <div className="display text-[36px] tnum mt-1.5">11<span className="text-[18px] text-[var(--ink-mute)]">%</span></div>
                <div className="mono text-[10.5px] text-[var(--ink-faint)] mt-1">vs MSCI 38%</div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t hairline">
              <div className="text-[12px] text-[var(--ink-dim)] leading-relaxed">
                W 2008 (poza oknem) GEM siedział w T-billach, gdy SP500 spadał −51%.
                W 2020 wyszedł z drawdownu w 4 miesiące. <span className="text-[var(--ink-mute)]">Symulator poniżej liczy te liczby na żywo dla Twoich parametrów.</span>
              </div>
            </div>
          </div>

          <div className="mt-3 px-4 py-3 border hairline rounded-md bg-[var(--bg-1)]/50 flex items-start gap-3">
            <div className="text-[var(--warn)] mono text-[14px] leading-none mt-0.5">!</div>
            <div className="text-[11.5px] text-[var(--ink-mute)] leading-relaxed">
              <span className="text-[var(--ink-dim)]">Wyniki historyczne nie gwarantują przyszłych.</span> GEM przegrywa w sideways
              i traci po skokach trendu. Histereza i tarcza IKE łagodzą oba problemy — pokażę je w symulatorze.
            </div>
          </div>
        </aside>
      </div>

      {/* Sub-strip — title for what's below */}
      <div className="border-t hairline">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] mono uppercase tracking-[.18em] text-[var(--ink-faint)] mb-1">
              <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
              symulator interaktywny
            </div>
            <h2 className="text-[20px] font-medium tracking-[-0.01em]">
              Sprawdź <span className="serif italic text-[var(--ink-dim)]">na własnych parametrach</span>
            </h2>
          </div>
          <div className="mono text-[10.5px] uppercase tracking-[.14em] text-[var(--ink-mute)] flex items-center gap-3">
            <span>192 mies. danych</span><span>·</span>
            <span>USD/PLN historyczne</span><span>·</span>
            <span>licz lokalnie</span>
          </div>
        </div>
      </div>
    </section>
  );
}

window.GEMExplainer = GEMExplainer;
