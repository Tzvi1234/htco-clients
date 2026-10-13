# Design tokens

The single source of truth for colour, type, spacing, shape, motion and sizes on every HTCO client. Format: [W3C Design Tokens (DTCG) 2025.10](https://www.designtokens.org/).

| File | Holds |
|---|---|
| [`base.json`](base.json) | Primitives: the three brand colours measured from the official logo, the full palette ramps, font families, type scale, spacing, radii, sizes, motion, breakpoints |
| [`semantic.light.json`](semantic.light.json) | Semantic tokens for the light theme, as references into `base.json` |
| [`semantic.dark.json`](semantic.dark.json) | The same semantic tokens for the dark theme |

Components use **semantic tokens only** (`color.text.primary`, `color.action.primary.bg`, `color.status.needs-you`). Primitives exist so the semantic layer can reference them; a component that reaches for `palette.turquoise.400` directly is a review finding.

## Brand colours (measured, not guessed)

| Token | Hex | Measured from |
|---|---|---|
| `color.brand.navy` | `#030F1F` | Logo background pixels (median) |
| `color.brand.turquoise` | `#05F7F4` | The "CO" letters |
| `color.brand.amber` | `#F8B857` | The dot |
| `color.brand.white` | `#FFFFFF` | The "HT" letters |

The original planning brief's earlier approximations (`#061322`, `#00E6D9`, `#F0B76A`) and the retired indigo palette are superseded by these values ([client ADR-0005](../../docs/adr/0005-brand-palette-from-logo.md)).

## Contrast guarantee

Every text pair is at least 4.5:1 and every control boundary, focus ring and status dot at least 3:1, in both themes. The pairs checked are the ones the brand book names (text on each background, button labels on fills, badge text on its tint, dots on surfaces). From Phase 3, CI recomputes all pairs from these files and fails on any regression.

## How tokens reach each platform (Phase 3 onward)

[Style Dictionary](https://styledictionary.com/) builds the files below; generated output is committed and CI fails if it drifts from the source.

| Platform | Output | Naming |
|---|---|---|
| Web | CSS custom properties: `:root` (light), `[data-theme="dark"]`, and a `prefers-color-scheme` fallback | `--bg-canvas`, `--text-primary`, `--space-4` (the `color.` prefix is dropped so names match the brand book) |
| Android | Kotlin objects for Compose (`HtcoColors.Light`, `HtcoColors.Dark`, `HtcoSpacing`, `HtcoType`) | `bgCanvas`, `textPrimary` |
| Windows | XAML `ResourceDictionary` with `ThemeDictionaries` (Light, Dark, HighContrast) | `HtcoBgCanvasBrush`, `HtcoTextPrimaryBrush` |

## Changing a token

1. Change the source file (never the generated output).
2. Run the build and the contrast check.
3. Update the live design system reference and the brand book if the meaning changed.
4. A change to a brand colour needs the owner's approval and a new ADR.
