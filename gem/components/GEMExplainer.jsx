// GEMExplainer — primer above the simulator. Explains the strategy in plain Polish.
// Wyniki pochodzą z useGemSummary, czyli z tego samego silnika co symulator.

function HeadlineStat({ label, value, suffix, bench, accent }) {
  return (
    <div>
      <div className="text-[10.5px] mono uppercase tracking-[.14em] text-[var(--ink-mute)]">{label}</div>
      <div className={`display text-[32px] tnum mt-1.5 ${accent ? 'text-[var(--accent)]' : ''}`}>
        {value}{suffix && <span className="text-[16px] text-[var(--ink-mute)]"> {suffix}</span>}
      </div>
      <div className="mono text-[10.5px] text-[var(--ink-faint)] mt-1">{bench}</div>
    </div>
  );
}

function GEMResultCard({ summary, failed }) {
  if (failed) {
    return (
      <div className="border hairline rounded-xl bg-[var(--bg-1)] p-5 text-[13px] text-[var(--ink-dim)]">
        Nie udało się wczytać danych rynkowych, więc wyników nie można policzyć. Odśwież stronę.
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="border hairline rounded-xl bg-[var(--bg-1)] p-5 text-[13px] text-[var(--ink-mute)]">
        Liczę wyniki…
      </div>
    );
  }

  const { gem, bench, benchLabel, since2010, classic, crisis } = summary;
  const amount = window.formatGemAmount;

  return (
    <div className="border hairline rounded-xl bg-[var(--bg-1)] p-5">
      <div className="text-[10.5px] mono uppercase tracking-[.16em] text-[var(--ink-faint)]">
        ustawienia domyślne · {summary.from} – {summary.to}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-5">
        <HeadlineStat label="Na rękę po podatku" value={(gem.net / 1_000_000).toFixed(2)} suffix="mln PLN" accent
                      bench={`vs ${benchLabel} ${amount(bench.net)}`}/>
        <HeadlineStat label="CAGR (przybliżony)" value={gem.cagr.toFixed(1)} suffix="%"
                      bench={`vs ${benchLabel} ${bench.cagr.toFixed(1)}%`}/>
        <HeadlineStat label="Maks. obsunięcie" value={gem.maxDrawdown.toFixed(1)} suffix="%"
                      bench={`vs ${benchLabel} ${bench.maxDrawdown.toFixed(1)}%`}/>
        <HeadlineStat label="Sharpe" value={gem.sharpe.toFixed(2)}
                      bench={`vs ${benchLabel} ${bench.sharpe.toFixed(2)}`}/>
      </div>

      <div className="mt-6 pt-5 border-t hairline space-y-3 text-[13px] text-[var(--ink-dim)] leading-relaxed">
        <p>
          Wpłacono {summary.deployed.toLocaleString('pl-PL')} PLN: {window.GEM_DEFAULT_PARAMS.initialCapital.toLocaleString('pl-PL')} na start i {window.GEM_DEFAULT_PARAMS.monthlyDCA.toLocaleString('pl-PL')} miesięcznie.
          Aktywa: Nasdaq 100, rynki wschodzące i złoto. Prowizja i spread 0%, bez IKE.
        </p>
        <p>
          <span className="text-[var(--ink)]">Wynik mocno zależy od okresu i aktywów.</span>{' '}
          Od 2010 roku ten sam zestaw daje {amount(since2010.gemNet)} wobec {amount(since2010.benchNet)} dla {benchLabel}.
          Klasyczny GEM (USA, rynki poza USA, obligacje, 12 miesięcy) od 2000 roku daje {amount(classic.gemNet)} wobec {amount(classic.benchNet)} dla miksu MSCI.
        </p>
        <p>
          W latach 2007–2009 obsunięcie GEM wyniosło {crisis.gem.toFixed(1)}%, a {benchLabel} {crisis.bench.toFixed(1)}%.
        </p>
      </div>
    </div>
  );
}

function GEMExplainer() {
  const { summary, failed } = window.useGemSummary();

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
            GEM — <em className="not-italic text-[var(--ink)]">Global Equity Momentum</em> — to jedna z najprostszych strategii ilościowych.
            Algorytm robi tylko trzy rzeczy:
          </p>

          <ol className="mt-6 space-y-4 max-w-[58ch]">
            <li className="flex gap-4">
              <span className="step-num active shrink-0 mt-0.5">1</span>
              <div>
                <div className="text-[14px] text-[var(--ink)]">Sprawdza, czy akcje rosną szybciej niż bezpieczne aktywa</div>
                <div className="text-[12.5px] text-[var(--ink-mute)] mt-1 leading-relaxed">
                  Jeśli momentum akcji jest słabsze — siedzimy w obligacjach. Bessa nie nasza wojna.
                  Klasyczny GEM patrzy na 12 miesięcy, a symulator domyślnie na średnią z 3, 6 i 12 miesięcy.
                </div>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="step-num active shrink-0 mt-0.5">2</span>
              <div>
                <div className="text-[14px] text-[var(--ink)]">Wybiera lidera momentum z koszyka aktywów ryzyka</div>
                <div className="text-[12.5px] text-[var(--ink-mute)] mt-1 leading-relaxed">
                  Klasycznie USA albo rynki poza USA. Domyślny zestaw w symulatorze to Nasdaq 100, rynki wschodzące i złoto.
                  Ten, który ostatnio zarobił najwięcej, dostaje 100% kapitału.
                </div>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="step-num active shrink-0 mt-0.5">3</span>
              <div>
                <div className="text-[14px] text-[var(--ink)]">Powtarza co miesiąc</div>
                <div className="text-[12.5px] text-[var(--ink-mute)] mt-1 leading-relaxed">
                  Bez emocji, bez prognoz, bez „ja wiem, że to odbije". Symulator sprawdza sygnał raz w miesiącu, na cenach zamknięcia.
                </div>
              </div>
            </li>
          </ol>

        </div>

        {/* RIGHT — wynik z silnika */}
        <aside className="lg:col-span-5">
          <GEMResultCard summary={summary} failed={failed}/>

          <div className="mt-3 px-4 py-3 border hairline rounded-md bg-[var(--bg-1)]/50 flex items-start gap-3">
            <div className="text-[var(--warn)] mono text-[14px] leading-none mt-0.5">!</div>
            <div className="text-[13px] text-[var(--ink-dim)] leading-relaxed">
              <span className="text-[var(--ink)]">Wyniki historyczne nie gwarantują przyszłych.</span> GEM przegrywa w sideways
              i traci po skokach trendu. W symulatorze sprawdzisz, jak zmieniają wynik koszty, bufor histerezy i IKE.
            </div>
          </div>
        </aside>
      </div>

      {/* Sub-strip — title for what's below */}
      <div className="border-t hairline">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10.5px] mono uppercase tracking-[.18em] text-[var(--ink-faint)] mb-1">
              symulator interaktywny
            </div>
            <h2 className="text-[20px] font-medium tracking-[-0.01em]">
              Sprawdź <span className="serif italic text-[var(--ink-dim)]">na własnych parametrach</span>
            </h2>
          </div>
          <div className="mono text-[10.5px] uppercase tracking-[.14em] text-[var(--ink-mute)] flex items-center gap-3">
            {summary && <><span>{summary.months} mies. danych</span><span>·</span></>}
            <span>notowania w USD</span><span>·</span>
            <span>liczone w przeglądarce</span>
          </div>
        </div>
      </div>
    </section>
  );
}

window.GEMExplainer = GEMExplainer;
