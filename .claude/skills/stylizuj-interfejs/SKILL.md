---
name: stylizuj-interfejs
description: >
  Użyj przy dodawaniu lub zmianie stylów strony Kwantyka: tokenów i klas w gem/qr.css
  oraz klas Tailwind w komponentach JSX i stronach HTML w gem/.
---

## Stylizacja interfejsu Kwantyki

Zadanie: $ARGUMENTS

### Zanim zaczniesz

1. Przeczytaj `gem/qr.css` i sekcję Design w `CLAUDE.md`.
2. Sprawdź, czy potrzebna klasa już istnieje: `.chip`, `.seg`, `.toggle`, `.badge`, `.tab`.
3. Obejrzyj stronę w przeglądarce przed zmianą i po niej.

### Tokeny (`gem/qr.css`)

| Rola | Token |
|------|-------|
| Tła | `--bg`, `--bg-1`, `--bg-2`, `--bg-3` |
| Linie | `--line`, `--line-2` (klasy `.hairline`, `.hairline-2`) |
| Tekst | `--ink`, `--ink-dim`, `--ink-mute`, `--ink-faint` |
| Akcent | `--accent`, `--accent-soft`, `--accent-line` |
| Stany | `--blue` (benchmark), `--cost` / `--cost-ink` (koszty), `--warn`, `--bad` |

Kontrast na `--bg` (jasny): `--ink-dim` 8.3:1, `--ink-mute` 5.5:1, `--ink-faint` 4.9:1.
`--cost` (bursztyn) tylko jako tło lub plama, tekst kosztów w `--cost-ink`.

### Zasady

- Kolory przez `var(--token)`, nie przez wpisany hex.
- Tekst co najmniej 13 px, kontrast co najmniej 4.5:1.
- Bez gradientów, glassmorphismu, tła z kropek i migających kropek.
- Bez etykiet CAPS nad nagłówkami i wyróżniania jednego słowa w nagłówku.
- Bez strzałek w przyciskach. Numeracja 01/02 tylko przy prawdziwych krokach.
- Hierarchię buduj rozmiarem, grubością i odstępem. Ramka tylko wokół osobnego obiektu.
- Liczby w kolumnach mają cyfry tabelaryczne (`.tnum`).

### Weryfikacja

```bash
python3 -m http.server 8791 --directory gem
```

Sprawdź szerokości 375 i 1440 px, stany hover, focus i disabled oraz brak poziomego przewijania.
