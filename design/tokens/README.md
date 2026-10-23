# Design tokens

The single source of truth for colour, type, spacing, shape, motion and sizes on every HTCO client. Format: [W3C Design Tokens (DTCG) 2025.10](https://www.designtokens.org/).

| File | Holds |
|---|---|
| [`base.json`](base.json) | Primitives: the brand colours, Design 1C's named colours for each palette and theme (`palette.sbb`, `palette.sbb-dark`, `palette.d4`, `palette.d4-dark`), the data-colour ramps, font families, type scale, spacing, radii, sizes, motion, glass, breakpoints |
| [`semantic.light.json`](semantic.light.json) | Semantic tokens of the default palette (SBB), light theme, as references into `base.json` |
| [`semantic.dark.json`](semantic.dark.json) | The same semantic tokens, dark theme |
| [`modes/`](modes/) | Overlays: the Design 4 palette (`palette-d4.*`) and the tweak levels (`contrast-2/3.*`, `borders-2/3.*`, `glass-2/3.*`, `glass-2/3-d4.*`), each light and dark, setting only the tokens they change |

Components use **semantic tokens only** (`color.text.primary`, `color.action.primary.bg`, `color.status.needs-you`). Primitives exist so the semantic layer can reference them; a component that reaches for `palette.turquoise.400` directly is a review finding.

## Brand colours (Design 1C)

| Token | Hex | Role |
|---|---|---|
| `color.brand.orange` | `#FF7F36` | The logo's CO and the accent in the default palette |
| `color.brand.ink` | `#000000` | The logo's HT and dot; text; the inverse fill |
| `color.brand.lilac` | `#8C76D6` | The logo's CO and the accent in Design 4 |
| `color.brand.lemon` | `#EDD803` | The logo's dot and attention in Design 4 |
| `color.brand.cream` | `#F3F4EE` | The Design 4 ground |

They replace Relay's iris and saffron ([client ADR-0008](../../docs/adr/0008-design-1c.md)). Semantic groups added with Design 1C: `bg.ground`, `bg.panel`, `bg.menu`, `bg.card`, `bg.table-head`, `inverse.*`, `accent.mark`, `accent.on-inverse`, `accent.on-fill`, `attention.fill`, `attention.on-fill`, `info.*`, `border.edge`, `border.sidebar`, `border.hover*`, `icon.faint`, `logo.*`, `bloom.*`, `elevation.panel`, `elevation.sidebar`, `elevation.popover`, and the web-only `glass.*`. Relay's names stay as aliases (`bg.canvas` is `{color.bg.panel}`), which the CSS keeps as `var()` links. Radii: `radius.xl` (16) for cards and `radius.xxl` (22) for panels.

## Modes

A mode is a palette (`sbb`, `plain`, `d4`), a theme and three tweak levels (`packages/design-tokens/src/modes.ts`). The web CSS puts each overlay group in a cascade layer keyed on `<html>` attributes (`data-pal`, `data-theme`, `data-t1`, `data-t2`, `data-t3`). Native outputs carry the default palette for now.

## Contrast guarantee

Every text pair is at least 4.5:1 and every control boundary, focus ring and status dot at least 3:1, in every mode: 225 pairs (text and controls on every surface, labels on fills, coloured text on its tint, tags, presence flags, orange as the tertiary colour) in each of 114 modes, and in the navigation's fixed glass (glass level 2 scoped to `[data-glass]`, over the plain ground, in both palettes and themes), listed in [`packages/design-tokens/src/contrast.ts`](../../packages/design-tokens/src/contrast.ts). Translucent glass surfaces are composited over each backdrop of their mode (the ground, or the bloom colours over both ends of its gradient) before measuring. CI recomputes them from these files on every pull request and fails on any regression, and `pnpm tokens` refuses to build while one fails.

## How tokens reach each platform

`pnpm tokens` builds the files below in [`packages/design-tokens/generated/`](../../packages/design-tokens/generated/): [Style Dictionary](https://styledictionary.com/) merges the sources and resolves references, and small formatters of ours write each platform's file. The output is committed, and `pnpm check` fails when it drifts from the source.

| Platform | File | Contents | Naming |
|---|---|---|---|
| Web | `htco-tokens.css` | Custom properties: light theme and the primitives on `:root`, the dark theme on `[data-theme="dark"]` and, when the user has not chosen, on a dark `prefers-color-scheme` | `--bg-canvas`, `--text-primary`, `--space-4`, `--font-size-body`, `--elevation-1` (the `color.` prefix is dropped so names match the brand book) |
| Android | `HtcoTokens.kt` (package `app.htco.designsystem.tokens`) | `HtcoColors.Light` and `HtcoColors.Dark`, `HtcoSpacing`, `HtcoRadius`, `HtcoSize`, `HtcoBorderWidth`, `HtcoType` (sizes and line heights in sp, weights), `HtcoMotion` (milliseconds and easing); pixels become dp, 1rem is 16 | `bgCanvas`, `textPrimary`, `space4` |
| Windows | `HtcoTokens.xaml` | A `ResourceDictionary` with `SolidColorBrush` resources in `Light` and `Dark` theme dictionaries, sizes as `x:Double`, radii as `CornerRadius`. The `HighContrast` dictionary, mapped to Windows system colours, is designed with the Windows app (Phase 17) | `HtcoBgCanvasBrush`, `HtcoSpace4`, `HtcoRadiusMd` |

Unpublished on purpose: the palette ramps and raw brand colours (semantic tokens reference them) and the breakpoints. Font families stay on the web; Android and Windows load fonts as resources.

## Changing a token

1. Change the source file (never the generated output).
2. Run `pnpm tokens` and commit the regenerated files with the source change; `pnpm check` runs the contrast and drift tests.
3. Update the live design system reference and the brand book if the meaning changed.
4. A change to a brand colour needs the owner's approval and a new ADR.

## Round 3 additions ([ADR-0009](../../docs/adr/0009-clarity-round-3.md))

- `color.tertiary.*` (`fill`, `on-fill`, `mark`, `on-inverse`, `subtle`, `text`): orange, the tertiary colour beside gray, black and white, the same in both palettes. Design 4's overlay now keeps the logo's orange as its accent, attention and selection; lilac and lemon are retired from it.
- `color.swatch.*`: fixed sample colours for the appearance choices in Settings (web only, never text).
- `motion.easing.spring` (critically damped, for the navigation's open and close), `motion.easing.out` (a strong ease-out for what enters) and `motion.duration.screen` (240 ms).
- The `nav-glass` cascade layer: the glass level 2 overlay scoped to `[data-glass]` while `<html>` has no `data-solid`.
