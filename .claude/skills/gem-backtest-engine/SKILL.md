---
name: modyfikuj-silnik-gem
description: >
  Uruchamia się gdy użytkownik rozszerza, debuguje lub refaktoryzuje silnik backtestowy GEM
  w pliku src/backtest/gemEngine.js. Wektory semantyczne: dodawanie nowego podatku Belka,
  zmiana logiki FIFO lot tracking, modyfikacja wskaźnika ROC momentum, dodanie nowego
  portfela równoległego, zmiana kalkulacji Sharpe/Ulcer/CAGR, obsługa marginu i dźwigni,
  implementacja zwolnienia IKE/IKZE, rollup roczny, histereza sygnałów, przesunięcie
  safe-asset selection. Każda operacja na silniku jest precyzyjną rzeźbą w systemie
  finansowym — każda nieścisłość propaguje się przez 250+ miesięcznych iteracji jak
  błąd zaokrąglenia w obliczeniach rakietowych.
---

## Protokół Modyfikacji Silnika GEM

### ZANIM ZACZNIESZ — Obowiązkowy Checklist Antyhalucynacyjny

> **STOP.** Przed każdą modyfikacją wykonaj kroki 1-3. Pominięcie = ryzyko błędu podatkowego.

1. **CZYTAJ** plik źródłowy: `src/backtest/gemEngine.js` (pełny, nie skracaj)
2. **ZIDENTYFIKUJ** punkt wejścia parametru: sprawdź `runBacktest(params)` signature — linie 1-30
3. **ZLOKALIZUJ** dotknięte struktury state: `gemState`, `benchState`, `ikeState` — są symetryczne

### Zadanie: $ARGUMENTS

### Mapowanie Architektury (nie modyfikuj bez przeczytania)

```
runBacktest(params)
  ├── Phase 1: Walidacja i inicjalizacja state (gemState / benchState / ikeState)
  ├── Phase 2: Główna pętla miesięczna [i=startIdx → data.length]
  │   ├── calcROC() → ensemble 3mo/6mo/12mo → targetAsset selection
  │   ├── rebalance() → SELL tranches (FIFO) → oblicz podatek Belka → BUY
  │   ├── accrueMarginInterest() → gemState.marginDebt × (0.04/12)
  │   └── Month-end: dodaj do equityCurve, rebalLog
  └── Phase 3: KPI calculation (CAGR, Sharpe, Ulcer Index, UPI)
```

### Reguły Nienaruszalne

- **NIGDY** nie dodawaj `import React` ani JSX do tego pliku — to czysty JS Node-runnable
- **NIGDY** nie używaj TypeScript (`.ts`) — projekt świadomie rezygnuje z typów
- **ZAWSZE** zachowaj symetrię 3 portfeli: zmiana w `gemState` → sprawdź czy `benchState`/`ikeState` wymaga analogicznej zmiany
- **ZAWSZE** używaj FIFO przy sprzedaży transz: `lots.shift()`, nie `lots.pop()`
- **WALIDUJ** floaty: używaj `Math.round(x * 100) / 100` dla wartości PLN w `rebalLog`, ale **nigdy** do wewnętrznych kalkulacji akumulacyjnych
- **PODATEK BELKA**: 19% tylko od zysku (`proceeds - costBasis > 0`); straty zapisuj do `lossCarryForward` max 5 lat

### Schemat Zmiany Parametru

Gdy $ARGUMENTS wymaga nowego parametru:

1. Dodaj do `DEFAULT_PARAMS` w `src/simulator/GEMSimulator.jsx`
2. Obsłuż w `runBacktest(params)` w `gemEngine.js`
3. Dodaj kontrolkę UI w `src/simulator/SimulatorControls.jsx`

### Wzorzec State Portfela

```js
// Każdy z 3 portfeli ma identyczną strukturę — nigdy jej nie łam
const gemState = {
  cash: params.initialCapital,
  units: 0,
  lots: [],            // FIFO: [{ units, costBasis, date }]
  marginDebt: 0,
  lossCarryForward: [0, 0, 0, 0, 0],  // 5 lat wstecz
  currentAsset: null,
  totalFees: 0,
  totalTax: 0,
};
```

### Wzorzec Kalkulacji ROC

```js
// ensemble 3mo/6mo/12mo — wagi sumują się do 1.0
// UWAGA: może zwrócić -Infinity gdy brak danych historycznych — obsłuż to jako null
function calcROC(prices, idx, lookback) {
  if (idx < lookback || prices[idx - lookback] == null) return null;
  return (prices[idx] - prices[idx - lookback]) / prices[idx - lookback];
}
```

### Weryfikacja po Zmianie

```bash
node src/backtest/test_engine.js   # smoke test — musi wykonać się bez wyjątku
npm run build                       # sprawdź czy Vite nie rzuca błędów bundlera
```

Sprawdź ręcznie w UI: uruchom `netlify dev`, zmień parametry, zweryfikuj że `rebalLog`
zawiera poprawne wpisy `tax` i `costBasis` po każdej transakcji sprzedaży.
