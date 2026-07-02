# DeroArts — Brand Kit

Master assets for the DeroArts brand. One master per use case; sub-versions
(sizes, `.ico`, cropped formats) are derived by tooling from these masters.

## Folder map

| Folder | Use | Background | Files |
|---|---|---|---|
| `home-screen/` | App icon (iOS/Android launcher) | yes | `app-icon-light.png`, `app-icon-dark.png` |
| `browser-tab/` | Favicon | yes | `favicon.svg`, `favicon.png` |
| `instagram/` | Profile avatar (circle-safe) | yes | `profile-picture.png` |
| `logo/` | DeroArts logo — all **transparent** | no | horizontal / two-line / stacked / wordmark / symbol / mono |

**Rule:** background only on `home-screen`, `browser-tab`, `instagram`. Everything in `logo/` is transparent.

## Naming convention (kebab-case)

- `-on-light` = artwork for **light** backgrounds (dark "Dero" text).
- `-on-dark` = artwork for **dark** backgrounds (white "Dero" text).
- `app-icon-light` / `-dark` = the icon's own theme (light / dark squircle).
- `symbol` = feather mark alone · `wordmark` = text alone · `logo-*` = full lockup.

## Logo variants (transparent, in `logo/`)

- `logo-horizontal-*` — feather left, DeroArts on one line.
- `logo-two-line-*` — feather left, "Dero" over "Arts" (App Control style).
- `logo-stacked-*` — feather on top, text below.
- `wordmark-*` — text only.
- `symbol.svg` / `symbol.png` — feather only.
- `logo-mono-black|white.svg`, `symbol-mono-black|white.png` — single colour.

## Palette

| Token | Hex |
|---|---|
| Graphite (Dero) | `#1A222B` |
| Green (Arts) | `#8FC603` → `#1E9E3D` |
| Icon dark | `#1A3A26` → `#0F2419` |
| Surface light | `#F8F6F6` |

## Typography

Poppins (Medium). Logo text is outlined to vector paths — no font install needed.

## For automation

`manifest.json` is a machine-readable index of every asset (purpose, format,
transparency, background, sizes, and which sub-versions to derive). Read it first.
