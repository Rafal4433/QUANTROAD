---
name: buduj-komponent-symulatora
description: >
  Aktywuje się gdy użytkownik buduje, modyfikuje lub dodaje komponent React do interfejsu
  symulatora GEM w katalogu src/simulator/. Wektory semantyczne: nowe kontrolki parametrów
  (suwak, toggle, segmented button, chip wyboru aktywów), nowe panele wyświetlające KPI,
  modyfikacja wykresu Recharts (nowa seria, custom tooltip, sampling punktów), eksport CSV
  z RebalancingLog, responsywny layout siatki, formatowanie liczb PLN/procent, state
  management dla 11 parametrów symulacji, łańcuch useMemo wywołujący runBacktest().
  Komponenty symulatora to precyzyjne instrumenty finansowe oprawione w szkło — każdy
  parametr kontroluje miliony złotych wirtualnego kapitału, błąd formatowania zepsuje
  prezentację klientowi jak rysa na tarczy zegarka szwajcarskiego.
---

## Protokół Budowy Komponentu Symulatora

### ZANIM ZACZNIESZ — Obowiązkowy Checklist

1. **CZYTAJ** orchestrator: `src/simulator/GEMSimulator.jsx` — zrozum params → useMemo → result flow
2. **CZYTAJ** `src/simulator/SimulatorControls.jsx` — wzorzec stanu: `setParams(p => ({ ...p, [key]: value }))`
3. **SPRAWDŹ** CSS tokeny w `src/index.css` — użyj istniejących custom properties, nie twórz nowych

### Zadanie: $ARGUMENTS

### Anatomia Komponentu Symulatora

```
GEMSimulator.jsx (orchestrator)
  ├── state: params (11 pól), data (historyczne), error
  ├── useMemo: result = runBacktest(params, data)  ← JEDYNY punkt wywołania silnika
  ├── SimulatorControls → setParams callback
  ├── KPIRow → result.kpi
  ├── EquityCurveChart → result.equityCurve (sampled do 180 pkt)
  ├── CostBreakdown → result.annualStats
  ├── RebalancingLog → result.rebalLog
  └── UlcerIndexPanel → result.ulcerData
```

### Wzorzec Nowej Kontrolki Parametru

```jsx
// W SimulatorControls.jsx — użyj istniejącego wzorca LightSlider/LightInput
<LightSlider
  label="NAZWA_PARAMETRU"
  value={params.nazwaParametru}
  min={MIN} max={MAX} step={STEP}
  onChange={v => setParams(p => ({ ...p, nazwaParametru: v }))}
  hint="Opis w języku polskim"
/>
```

### Wzorzec Nowego Panelu KPI

```jsx
// Używaj CSS custom properties z src/index.css — nigdy hardcode hex
<div className="sim-panel">
  <div className="sim-panel-title">TYTUŁ</div>
  <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
    {formatPercent(result.kpi.wartość)}
  </div>
</div>
```

### Formatowanie Liczb — Reguły Kanoniczne

```js
// PLN z lokalizacją polską
value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })

// Procenty (CAGR, Sharpe jako %)
(value * 100).toFixed(2) + '%'

// Duże liczby (K/M skrót)
value >= 1e6 ? (value / 1e6).toFixed(1) + 'M zł' :
value >= 1e3 ? (value / 1e3).toFixed(0) + 'K zł' : value.toFixed(0) + ' zł'
```

### Wzorzec Wykresu Recharts

```jsx
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Sampling: thinning 250+ miesięcy do 180 punktów — zawsze zachowaj ostatni punkt
function sampleData(arr, maxPoints = 180) {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  const sampled = arr.filter((_, i) => i % step === 0);
  if (sampled[sampled.length - 1] !== arr[arr.length - 1]) {
    sampled.push(arr[arr.length - 1]);
  }
  return sampled;
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-tooltip)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};
```

### Reguły Nienaruszalne

- **NIGDY** nie wywołuj `runBacktest()` poza `useMemo` w `GEMSimulator.jsx`
- **NIGDY** nie dodawaj TypeScript — projekt JSX only, brak `.ts`/`.tsx`
- **ZAWSZE** używaj klas `.sim-*` z `src/index.css` dla nowych paneli, nie twórz inline styles dla kolorów
- **SAMPLING** wykresu: thinning do 180 punktów przy zachowaniu ostatniego punktu
- **STATE UPDATE**: zawsze używaj wzorca funkcyjnego `setParams(p => ({ ...p, key: val }))`, nigdy bezpośrednio `setParams({ ...params, key: val })`

### Weryfikacja

```bash
npm run dev    # lub netlify dev jeśli komponent ładuje dane historyczne
npm run lint   # ESLint 9 — jedyne narzędzie formatowania
```

Sprawdź w przeglądarce: responsywność na 768px i 1280px, wartości PLN sformatowane,
wykres renderuje bez błędów konsolowych, KPI widoczne.
