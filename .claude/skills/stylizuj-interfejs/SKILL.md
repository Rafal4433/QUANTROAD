---
name: stylizuj-interfejs
description: >
  Aktywuje się gdy użytkownik dodaje nowe style, tworzy warianty komponentów, definiuje
  nowe CSS custom properties, implementuje efekty wizualne (glass-morphism, gradient panel,
  backdrop blur), modyfikuje istniejące klasy .sim-*, .sl-*, .rebal-*, .kpi-* lub konfiguruje
  system tokenów w src/index.css. Wektory semantyczne: nowy komponent z ciemnym tłem karty,
  dodanie stanu hover/active/disabled do przycisku, responsywny grid z auto-fit, kolor
  z kanałem alpha, typografia monospace dla danych finansowych, scrollbar styling, integracja
  Tailwind 4 z custom properties. System tokenów CSS to mechanizm zegarka z 21 precyzyjnymi
  trybikami — każdy nowy kolor lub odstęp musi zmieścić się w istniejącej skali jak wskazówka
  zegarowa w tarczy, inaczej cały instrument traci spójność wizualną i estetyczną koherencję.
---

## Protokół Stylizacji Interfejsu QuantRoad

### ZANIM ZACZNIESZ — Obowiązkowy Checklist

1. **CZYTAJ** `src/index.css` w całości — zrozum istniejące tokeny przed dodaniem nowych
2. **SPRAWDŹ** czy komponent z $ARGUMENTS już ma klasę `.sim-*` lub `.sl-*`
3. **NIE DOTYKAJ** `public/assets/sass/` — to legacy HTML5UP template, tylko do odczytu

### Zadanie: $ARGUMENTS

### Hierarchia Tokenów CSS — Kanon (src/index.css)

```css
:root {
  /* Tła — 4 poziomy głębokości */
  --bg-base: #0a0e1a;        /* strona główna */
  --bg-card: #111827;        /* karty/panele */
  --bg-input: #1a2035;       /* pola formularzy */
  --bg-tooltip: #1e2d45;     /* tooltopy */

  /* Akcent */
  --accent-primary: #3b82f6;   /* niebieski — akcje, fokus */
  --accent-secondary: #10b981; /* zielony — zysk, pozytywny */

  /* Tekst — 3 poziomy kontrastu */
  --text-primary: #e2e8f0;     /* główna treść */
  --text-secondary: #94a3b8;   /* etykiety, opisy */
  --text-muted: #475569;       /* placeholder, disabled */

  /* Typografia */
  --font-mono: 'JetBrains Mono', monospace;  /* dane finansowe, liczby */
  --font-title: 'Orbitron', sans-serif;       /* nagłówki sekcji */
  --font-ui: 'Inter', sans-serif;             /* UI labels, teksty */
}
```

### Skala Alpha — Dokładne Wartości (nie interpoluj)

| Użycie | Wartość |
|--------|---------|
| Hover tło subtelne | `rgba(255,255,255,0.04)` |
| Panel glass tło | `rgba(255,255,255,0.06)` |
| Border domyślny | `rgba(255,255,255,0.08)` |
| Border aktywny/fokus | `rgba(59,130,246,0.125)` |
| Overlay disabled | `rgba(0,0,0,0.50)` |
| Tło chip aktywny | `rgba(59,130,246,0.12)` |

### Wzorzec Glass-Morphism Panel

```css
/* Kopiuj ten wzorzec — nie wymyślaj własnych gradientów */
.nowy-panel {
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(4px);
  border-radius: 10px;
  padding: 1.25rem;
}
```

### Wzorzec Klasy Komponentu z Wariantami Stanu

```css
/* Dodawaj do sekcji "Component Classes" w src/index.css */
.nowa-klasa {
  background: var(--bg-card);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  transition: background 0.15s, border-color 0.15s;
}
.nowa-klasa:hover {
  background: rgba(255,255,255,0.04);
  color: var(--text-primary);
}
.nowa-klasa.active {
  border-color: rgba(59,130,246,0.125);
  color: var(--accent-primary);
  background: rgba(59,130,246,0.08);
}
.nowa-klasa:disabled,
.nowa-klasa.disabled {
  opacity: 0.4;
  pointer-events: none;
}
```

### Wzorzec Responsywnego Grid

```css
/* Użyj istniejącego .sim-grid-2col lub skopiuj wzorzec */
.nowy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
```

### Skale — Używaj TYLKO tych wartości

**Odstępy:** `0.5rem` · `0.75rem` · `1rem` · `1.25rem` · `1.5rem` · `2rem`

**Border-radius:**
| Element | Wartość |
|---------|---------|
| Input, chip, badge | `4px` |
| Przycisk, tag | `6px` |
| Karta mała, tooltip | `8px` |
| Panel główny | `10px` |
| Modal, duży panel | `12px` |

**Typografia etykiet:** `9px–10px`, `uppercase`, `letter-spacing: 0.08–0.12em`

### Reguły Nienaruszalne

- **NIGDY** nie edytuj `public/assets/sass/` — pre-kompilowany template HTML5UP
- **ZAWSZE** używaj `var(--token)` dla kolorów w nowych klasach, nie hardcode hex
- **NIE TWÓRZ** nowych `@font-face` — używaj `--font-mono`, `--font-title`, `--font-ui`
- **TAILWIND 4**: klasy utility OK dla spacingu/layout (`p-4`, `flex`, `grid`), ale kolory przez tokeny (`text-[var(--text-primary)]`)
- **NIE DUPLIKUJ** — przed dodaniem klasy sprawdź czy `.sim-panel`, `.sim-chip`, `.sl-*` już nie realizują tego wzorca

### Weryfikacja

```bash
npm run dev    # sprawdź visual w przeglądarce przy :5173
```

Weryfikuj ręcznie: wygląd na ciemnym tle, stany hover/active/disabled działają,
responsywność na 768px i 1280px, wartości finansowe w `--font-mono`.
