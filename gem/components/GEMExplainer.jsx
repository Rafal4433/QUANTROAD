// Nagłówek strony GEM i kontekst wyniku pod symulatorem. Liczby z useGemSummary (silnik).

function GEMExplainer() {
  return (
    <section className="k-wrap k-wide pt-4 pb-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-end">
      <div>
        <p className="k-meta">Global Equity Momentum · Antonacci, 2014</p>
        <h1 className="k-h1 mt-2">Symulator GEM</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-dim)] max-w-[56ch]">
          Raz w miesiącu trzymasz aktywo, które ostatnio rosło najmocniej, a gdy akcje słabną, przechodzisz do obligacji.
          Wybierz zestaw, wpisz, ile odkładasz, i zobacz, ile zostałoby Ci na rękę po kosztach i podatku Belki.
        </p>
      </div>
      <ol className="grid gap-3 text-[14.5px] text-[var(--ink-dim)]">
        {[
          'Sprawdza, czy akcje rosną szybciej niż bezpieczne aktywa. Jeśli nie, trzymasz obligacje.',
          'Z koszyka aktywów ryzykownych wybiera lidera momentum. Dostaje on 100% kapitału.',
          'Powtarza to raz w miesiącu, na cenach zamknięcia.',
        ].map((t, i) => (
          <li key={i} className="grid grid-cols-[22px_minmax(0,1fr)] gap-2 pb-3 border-b hairline">
            <span className="mono text-[var(--ink)]">{i + 1}</span><span>{t}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function GEMContext() {
  const { summary, failed } = window.useGemSummary();
  if (failed || !summary) return null;
  const { benchLabel, since2010, classic, crisis } = summary;
  const amount = window.formatGemAmount;
  return (
    <section className="k-wrap k-wide pt-10">
      <h2 className="k-h3">Wynik mocno zależy od okresu i aktywów</h2>
      <div className="mt-3 grid gap-2 text-[15px] leading-relaxed text-[var(--ink-dim)] max-w-[70ch]">
        <p>Liczone na ustawieniach domyślnych bez prowizji, {summary.from} – {summary.to}.</p>
        <p>Od 2010 roku zestaw Kwantyka daje {amount(since2010.gemNet)} wobec {amount(since2010.benchNet)} dla {benchLabel}.
          Klasyczny GEM od 2000 roku daje {amount(classic.gemNet)} wobec {amount(classic.benchNet)} dla miksu MSCI.</p>
        <p>W latach 2007–2009 obsunięcie GEM wyniosło {crisis.gem.toLocaleString('pl-PL', { maximumFractionDigits: 1 })}%, a {benchLabel} {crisis.bench.toLocaleString('pl-PL', { maximumFractionDigits: 1 })}%.</p>
        <p>Wyniki historyczne nie gwarantują przyszłych. GEM przegrywa w trendach bocznych i traci po nagłych zwrotach rynku.</p>
      </div>
    </section>
  );
}

window.GEMExplainer = GEMExplainer;
window.GEMContext = GEMContext;
