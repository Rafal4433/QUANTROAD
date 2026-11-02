# QuantRoad — AGENTS.md

## WHAT

**Polski symulator strategii GEM (Global Equity Momentum) i blog o inwestowaniu.**
Statyczna strona dla polskich inwestorów: rotacja momentum między aktywami ryzykownymi
i bezpiecznymi z modelem podatku Belki 19%.

**Stan techniczny (bez kroku build):**
- Strony HTML w `gem/`, JSX kompilowany w przeglądarce przez `@babel/standalone`
- React 18 i ReactDOM z unpkg (UMD), komponenty dzielą się przez `window.*`
- Tailwind z `cdn.tailwindcss.com` (klasy w JSX), tokeny i klasy wspólne w `gem/qr.css`
- Wykres GEM to własny SVG. Recharts 2 ładuje tylko `sharpe-ratio.html`
- Netlify: `publish = "gem"`, funkcja `netlify/functions/subscribe.mjs` (MailerLite,
  zmienna `MAILERLITE_API_KEY`), Netlify Forms dla formularza `kontakt`
- Dane: `scripts/fetch_data.py` (Yahoo Finance) i GitHub Action co miesiąc zapisują
  `gem/historical_data.json`
- Brak TypeScriptu, brak `package.json`, brak lintera i testów

**Układ:**
```
gem/
├── index.html, gem.html, strategie.html, artykuly.html, sharpe-ratio.html
├── qr.css                  — tokeny i klasy wspólne
├── historical_data.json    — dane miesięczne od 1998, format niżej
└── components/
    ├── gemEngine.js        — silnik, czysty JS, eksportuje window.runBacktest
    ├── gemSummary.jsx      — domyślne parametry i wspólne wyniki dla stron
    ├── GEMSimulator.jsx    — stan parametrów, wywołanie silnika, układ symulatora
    ├── SimulatorControls.jsx, KPIRow.jsx, EquityCurveChart.jsx,
    │   RebalancingLog.jsx, CostBreakdown.jsx, GEMExplainer.jsx
    ├── QRLayout.jsx        — nawigacja, stopka, modale
    ├── QRData.jsx          — lista artykułów i strategii (bez wyników liczbowych)
    └── icons.jsx
netlify/functions/subscribe.mjs
scripts/fetch_data.py
```

`historical_data.json`: `[{ date: "YYYY-MM", usa, exus, nq, em, epol, brk, gld, btc, bonds, tlt, shy }]`.
Ceny skorygowane w USD. Część aktywów startuje później (np. `gld` 2004-11, `tlt` 2002-07).

---

## WHY

**Silnik to czysty JS.** `runBacktest(params)` nie zależy od Reacta. Można go uruchomić
w Node przez `vm`, podstawiając `window`.

**Jedno źródło liczb.** Domyślne parametry i wyniki pokazywane poza symulatorem pochodzą
z `gemSummary.jsx`, które woła `runBacktest`. Nie wpisuj wyników na stałe do treści.

**Brak TypeScriptu to świadoma decyzja.** Nie dodawaj plików `.ts`, `.tsx` ani `tsconfig.json`.

**Co silnik modeluje:** podatek Belki 19% rozliczany co roku w kwietniu, przenoszenie strat
do 5 lat, opcję IKE (wyłącza podatek), prowizję, spread FX, dźwignię z kosztem 4% rocznie,
bufor histerezy.

**Czego silnik nie modeluje. Nie obiecuj tego w treści:**
- kursu USD/PLN: wpłaty są w PLN, a zwroty pochodzą z notowań w USD
- IKZE oraz limitów wpłat na IKE
- prawdziwych S&P 500 i MSCI World: S&P 500 to 100% VTSMX, a MSCI to 60% VTSMX i 40% VGTSX
- dokładnego CAGR: to przybliżenie, wartość końcowa do średniego kapitału, nie IRR

**Znane rozbieżności w silniku:**
- `portfolioValues` GEM nie zawiera podatku od niezrealizowanego zysku, a `benchmarkValues` zawiera.
  Do porównań używaj `liquidation.gemFinalNet` i `liquidation.benchFinalNet`.
- Sharpe, obsunięcie i Ulcer liczone są na saldzie z wpłatami, które je zniekształcają.

---

## HOW

**Uruchomienie lokalne:**
```bash
python3 -m http.server 8791 --directory gem   # strony i symulator
netlify dev                                   # gdy potrzebny jest /api/subscribe
```

**Aktualizacja danych:**
```bash
pip install yfinance && python scripts/fetch_data.py
```
Normalnie robi to `.github/workflows/update-data.yml` 3. dnia miesiąca.

**Nowy parametr symulatora:**
1. `gemSummary.jsx` — dodaj do `GEM_DEFAULT_PARAMS`
2. `gemEngine.js` — obsłuż w `runBacktest()`
3. `SimulatorControls.jsx` — dodaj kontrolkę

**Nowa strona:** utwórz HTML w `gem/`, dodaj link do `NAV` w `QRLayout.jsx`.

**Nowy ticker:** `TICKERS` w `scripts/fetch_data.py`, lista `required` w workflow,
`ALL_ASSETS` i `NAMES` w `gemEngine.js`, listy `RISKY` lub `SAFE` w `SimulatorControls.jsx`.

**Silnika nie zmieniaj bez wyraźnej zgody właściciela projektu.** Każda zmiana przesuwa
wszystkie publikowane wyniki.

---

## Design

**Użytkownik:** polski inwestor, który chce wiedzieć, ile zostanie mu po podatku Belki.

**Treść i liczby muszą być prawdziwe.**
- Każdy wynik pochodzi z silnika albo ma podane źródło i założenia.
- Przy wyniku podawaj okres, benchmark i koszty.
- Jeśli wynik nie potwierdza zdania na stronie, zmień zdanie, nie liczbę.
- Nie wymyślaj autora, czytelników, opinii ani statystyk.
- Nie dodawaj elementów pozornych: wyszukiwarek bez działania, ozdobnych wykresów,
  wskaźników „na żywo” przy danych, które nie są na żywo.

**Nowe i przerabiane elementy:**
- Bez gradientów, glassmorphismu, tła z kropek i migających kropek.
- Bez etykiet CAPS nad nagłówkami i wyróżniania jednego słowa w nagłówku.
- Bez strzałek w przyciskach. Numeracja 01/02 tylko przy prawdziwych krokach.
- Tekst co najmniej 13 px, kontrast co najmniej 4.5:1.

Obecny wygląd strony jeszcze nie spełnia tych zasad. Nie kopiuj go do nowych elementów.
