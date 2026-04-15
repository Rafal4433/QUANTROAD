# QuantRoad — CLAUDE.md

## WHAT

**Polish GEM (Global Equity Momentum) backtesting simulator.**
SPA React dla polskich inwestorów: symulacja rotacji momentum między US equities,
Ex-US equities i obligacjami, z pełnym modelem polskiego podatku Belka 19%.

**Tech stack (wersje wiążące):**
- React 19 + React Router 7 — JSX, brak TypeScript
- TailwindCSS 4 via `@tailwindcss/vite` — główny system stylów
- Recharts 3 — wykresy finansowe (equity curve, drawdown)
- Lucide React 1.x — ikony w komponentach symulatora
- Vite 8 + `@vitejs/plugin-react` — bundler i dev server
- ESLint 9 — linting; brak Prettier/Biome
- Netlify Functions (ESM `.mjs`) + Netlify Blobs — serverless data layer
- yahoo-finance2 — tylko w pipeline danych (`scripts/fetch-data.js`)

**Układ katalogów src/:**
```
src/
├── simulator/   — 7 komponentów React składających UI symulatora GEM
├── backtest/    — gemEngine.js (czysty JS, bez React) + test_engine.js
├── shell/       — Layout.jsx (Outlet wrapper), AppRoutes.jsx
├── pages/       — ArticleGEM.jsx, Home.jsx (poziom route)
└── index.css    — punkt wejścia Tailwind + globalne tokeny CSS
```

`public/assets/` — legacy szablon Solid State HTML5UP (CSS/SASS/JS). Nie edytować.

---

## WHY

**Silnik backtestowy to czysty JS, nie React.**
`backtest/gemEngine.js` eksportuje jedną funkcję `runBacktest(params)`.
Zero zależności React — można uruchomić przez `node` bez przeglądarki.
`simulator/GEMSimulator.jsx` wywołuje go przez `useMemo`. Ta izolacja jest celowa.

**Brak TypeScript — świadoma decyzja projektowa.**
Projekt priorytetyzuje szybkość iteracji nad bezpieczeństwem typów.
Nie dodawać plików `.ts`/`.tsx` ani `tsconfig.json`.
JSDoc w `backtest/gemEngine.js` jest akceptowalny dla dokumentacji parametrów.

**TailwindCSS 4 to główny system stylów; SASS to legacy.**
`public/assets/sass/` to pre-kompilowany szablon HTML5UP. Nigdy go nie edytować.
Nowe UI używa klas Tailwind. Style komponentowe używają custom properties CSS
zdefiniowanych w `src/index.css` (tokeny: `--bg-card`, `--accent-primary`, itp.).

**Netlify Blobs jako główny magazyn danych.**
`netlify/functions/historical-data.mjs` czyta z Blobs, fallback do
`public/historical_data.json`. Blob jest zapisywany przez `update-data.mjs`
(codziennie, 06:00 UTC). Statyczny fallback obsługuje cold starty i local dev.

**Polski kontekst podatkowy — cechy domenowe, nie błędy.**
Silnik implementuje: Belka 19% podatek od zysków, śledzenie lot FIFO,
przenoszenie strat (5 lat), zwolnienie IKE, obniżkę IKZE.
`rebalLog` zawiera historię transakcji z podstawą kosztową i naliczonym podatkiem.

**`public/historical_data.json`** — 1998-2025, dane miesięczne OHLCV dla 10 tickerów.
Format: `[{ date: "YYYY-MM", usa, exus, nq, em, btc, gld, epol, bonds, tlt, shy }]`.

---

## HOW

**Uruchomienie lokalne:**
```bash
npm run dev          # Vite dev server :5173 (bez Netlify Functions)
netlify dev          # Vite + Functions proxy :8888 — WYMAGANE gdy symulator ładuje dane
```
Przy `npm run dev` symulator nie dotrze do `/.netlify/functions/historical-data`.
Używaj `netlify dev` do pełnego developmentu.

**Aktualizacja danych rynkowych:**
```bash
npm run update-data  # node scripts/fetch-data.js → public/historical_data.json
```
Uruchom lokalnie po zmianie zakresu dat lub dodaniu tickera. Wynik commitować do repo
— to jest statyczny fallback dla cold startów Netlify.

**Linting i build:**
```bash
npm run lint         # ESLint 9 — jedyne narzędzie formatowania
npm run build        # Vite build → dist/
npm run preview      # Podgląd dist/ lokalnie
```

**Dodanie nowego parametru symulatora:**
1. `simulator/GEMSimulator.jsx` — dodaj do `DEFAULT_PARAMS`
2. `backtest/gemEngine.js` — obsłuż parametr w logice `runBacktest()`
3. `simulator/SimulatorControls.jsx` — dodaj kontrolkę UI

**Dodanie nowej strony/route:**
1. Utwórz `pages/NowaSrona.jsx`
2. Dodaj `<Route>` w `shell/AppRoutes.jsx`
3. Dodaj link nawigacyjny w `shell/Layout.jsx`

**Dodanie nowego tickera danych:**
1. Dodaj ticker do `TICKERS` w `scripts/fetch-data.js`
2. Dodaj ten sam ticker do `netlify/functions/update-data.mjs`
3. Uruchom `npm run update-data` (lokalnie, commituj JSON)
4. Zaktualizuj `ASSET_UNIVERSE` w `simulator/SimulatorControls.jsx`

**Netlify Functions** — pliki `.mjs` (ESM). `node_bundler = esbuild` (netlify.toml).
Nie używać CommonJS `require()` w funkcjach.
