# Design tokens — Tests and verification

## Test plan

| Level | What is covered | Location |
|---|---|---|
| Formatters | CSS blocks per theme, names, values (hex, rgb with alpha, px, rem, ms, cubic-bezier, quoted fonts, shadows), nothing unpublished; Kotlin package, imports, colour objects, dp, sp, weights, easing; XAML brushes per theme, doubles, corner radii, balanced tags | `packages/design-tokens/test/formats.test.ts` |
| Contrast | Ratio maths (21, 1, symmetric, known value), a failing synthetic pair, a missing token, every real pair in both themes | `packages/design-tokens/test/contrast.test.ts` |
| Build | Committed outputs equal what the sources produce; the three file names; references resolved with types; same token paths in both themes | `packages/design-tokens/test/build.test.ts` |

## Acceptance criteria coverage

| Acceptance criterion | Tests |
|---|---|
| AC-3.2.1 | `the generated outputs > are exactly what the token sources produce` |
| AC-3.2.2 | `contrastFailures > reports a text pair below 4.5:1`, `the light theme / the dark theme > meets WCAG AA for every declared pair` |

## Edge cases considered

- Translucent colours (shadows) render as `rgb(r g b / a)` in CSS and `#AARRGGBB` in XAML and Kotlin; a translucent colour in a contrast pair is refused.
- rem dimensions (letter spacing) become sp in Kotlin and are left out of XAML; durations in seconds become milliseconds.
- Names starting with a digit keep their group in Kotlin (`space4`).
- Generic font families stay unquoted; every other family is quoted.

## Verification evidence

### Verification — 3.2 — 2026-10-14

| Acceptance criterion | Covered by tests | Verified for real | Result |
|---|---|---|---|
| AC-3.2.1 | `build.test.ts` | Red first (16 failing tests against stubs). Built with `node packages/design-tokens/src/build.ts`; the drift test passes against the committed files. | Pass |
| AC-3.2.2 | `contrast.test.ts` | The synthetic pair `#8a8a8a` on white fails at 3.45:1; all 202 real pairs pass. | Pass |

**Observed:** `htco-tokens.css` (230 lines), `HtcoTokens.kt` (190 lines), `HtcoTokens.xaml` (156 lines, 100 brushes: 50 per theme); spot-checked `--bg-canvas` (`#f4f7fa` light, `#030f1f` dark), `HtcoColors.Light.bgCanvas`, `HtcoBgCanvasBrush`.
**Open issues:** the Kotlin and XAML files are compiled for the first time with the Android (Phase 16) and Windows (Phase 17) apps.
