---
name: buduj-komponent-symulatora
description: >
  Użyj przy dodawaniu lub zmianie komponentów symulatora GEM w gem/components/:
  kontrolek parametrów, KPI, wykresu SVG, logu transakcji, kosztów i eksportu CSV.
---

## Budowa komponentu symulatora

Zadanie: $ARGUMENTS

### Zanim zaczniesz

Przeczytaj `gem/components/GEMSimulator.jsx`, `SimulatorControls.jsx` i `gemSummary.jsx`.

### Przepływ danych

```
gemSummary.jsx        GEM_DEFAULT_PARAMS, loadGemData, useGemSummary
GEMSimulator.jsx      params → useMemo(runBacktest) → chartData
  ├── SimulatorControls  zmienia params przez setParams
  ├── KPIRow             chartData.kpis, chartData.costs.gem.net
  ├── EquityCurveChart   chartData.equity (własny SVG)
  ├── RebalancingLog     chartData.log
  ├── CostBreakdown      chartData.costs
  └── MomentumHeatmap    params, historicalData
```

Komponenty nie używają modułów. Każdy plik kończy się `window.NazwaKomponentu = NazwaKomponentu`,
a kolejność skryptów ustala HTML strony.

### Nowa kontrolka

Użyj `Slider`, `NumInput`, `Toggle` lub `Chip` z `SimulatorControls.jsx`.
Parametr dodaj do `GEM_DEFAULT_PARAMS` w `gemSummary.jsx`.

### Zasady

- Wyniki pochodzą z `runBacktest`. Nie wpisuj ich na stałe.
- Nowe założenie modelu opisz w bloku `Assumptions` w `GEMSimulator.jsx`.
- Kwoty formatuj przez `toLocaleString('pl-PL')`.
- Style według skilla `stylizuj-interfejs`. Bez TypeScriptu.

### Weryfikacja

```bash
python3 -m http.server 8791 --directory gem
```

Otwórz `gem.html`, zmień parametr i sprawdź wynik, konsolę oraz szerokości 375 i 1440 px.
