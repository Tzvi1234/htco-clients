# Design tokens

The single source of truth for colour, type, spacing, shape, motion and sizes on every HTCO client. Format: [W3C Design Tokens (DTCG) 2025.10](https://www.designtokens.org/).

| File | Holds |
|---|---|
| [`base.json`](base.json) | Primitives: the three brand colours measured from the official logo, the full palette ramps, font families, type scale, spacing, radii, sizes, motion, breakpoints |
| [`semantic.light.json`](semantic.light.json) | Semantic tokens for the light theme, as references into `base.json` |
| [`semantic.dark.json`](semantic.dark.json) | The same semantic tokens for the dark theme |

Components use **semantic tokens only** (`color.text.primary`, `color.action.primary.bg`, `color.status.needs-you`). Primitives exist so the semantic layer can reference them; a component that reaches for `palette.turquoise.400` directly is a review finding.

## Brand colours (Relay)

| Token | Hex | Role |
|---|---|---|
| `color.brand.iris` | `#4C3AC7` | The logo's CO; primary actions, links, selection, focus |
| `color.brand.iris-bright` | `#7B66FF` | The CO on dark grounds |
| `color.brand.saffron` | `#F2B72F` | The logo's dot; the decision ring ("needs you") |
| `color.brand.ink` | `#16161A` | The logo's HT on light grounds; text |
| `color.brand.paper` | `#FFFFFF` | Light ground |

They replace the navy, turquoise and amber of version 1 ([client ADR-0007](../../docs/adr/0007-relay-design-language.md), superseding ADR-0005). Semantic groups added with Relay: `bg.sidebar`, `bg.hover`, `attention.ring`, `tag.<hue>.{bg,text,dot}` for seven hues, `presence.<hue>.{bg,fg}` for AI employee flags, and `illustration.*` for brand art. Type adds `font.family.display` (Rubik) and the `hero` size; radii gain `xs` (4 px, tags); motion gains `duration.draw` (400 ms).

## Contrast guarantee

Every text pair is at least 4.5:1 and every control boundary, focus ring and status dot at least 3:1, in both themes. The pairs checked are the ones the brand book names (text on each background, button labels on fills, badge text on its tint, dots on surfaces, tag text on its tint, presence names on their flags): 164 per theme, listed in [`packages/design-tokens/src/contrast.ts`](../../packages/design-tokens/src/contrast.ts). CI recomputes them from these files on every pull request and fails on any regression, and `pnpm tokens` refuses to build while one fails.

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
