---
name: modyfikuj-silnik-gem
description: >
  Użyj przy zmianie lub debugowaniu silnika backtestu GEM w gem/components/gemEngine.js:
  sygnału momentum, podatku Belki, IKE, kosztów, dźwigni i wskaźników KPI.
---

## Modyfikacja silnika GEM

Zadanie: $ARGUMENTS

**Silnika nie zmieniaj bez wyraźnej zgody właściciela projektu.** Każda zmiana przesuwa
wszystkie publikowane wyniki.

### Zanim zaczniesz

Przeczytaj cały `gem/components/gemEngine.js` oraz sekcję WHY w `CLAUDE.md`.

### Budowa `runBacktest(params)`

```
Pętla miesięczna od startIndex
  ├── wpłata DCA
  ├── sygnał: najlepsze aktywo ryzykowne kontra bezpieczne (ROC lub średnia 3/6/12 mies.)
  ├── rebalans: sprzedaż wszystkich transz, potem kupno nowego aktywa
  ├── grudzień: rozliczenie roku i strat, kwiecień: zapłata podatku
  └── wartości trzech portfeli: GEM, benchmark, IKE
KPI: cagr, maxDrawdown, sharpe, upi, ulcerIndex
Wynik: labels, serie wartości, rebalLog, kpi, costs, liquidation, metadata
```

### Zasady

- Bez Reacta i JSX. Bez TypeScriptu.
- Zmiana w portfelu GEM: sprawdź, czy benchmark i IKE potrzebują tej samej zmiany.
- Po zmianie porównaj wyniki przed i po, a różnice wypisz właścicielowi projektu.
- Zaktualizuj opis modelu w `CLAUDE.md` i blok `Assumptions` w `GEMSimulator.jsx`.

### Weryfikacja

Uruchom silnik w Node przez `vm`, z `window` jako kontekstem, na `gem/historical_data.json`.
Potem sprawdź `gem.html` w przeglądarce.
