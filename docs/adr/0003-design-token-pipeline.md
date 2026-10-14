# Client ADR-0003: One DTCG token source generated for CSS, Kotlin and XAML

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** Owner, engineering

## Context

Three platforms must share one visual language without sharing UI code. The W3C Design Tokens format reached its first stable version (2025.10).

## Decision

- Tokens live once, in `design/tokens/` in DTCG format: `base.json` for primitives and one semantic file per theme (`semantic.light.json`, `semantic.dark.json`). Themes stay separate token sets until our build tool supports the DTCG resolver module.
- Style Dictionary 5 generates CSS custom properties, Kotlin objects for Compose, and a XAML `ResourceDictionary` (custom format) with Light, Dark and HighContrast theme dictionaries.
- Generated files are committed; CI fails on drift and on any contrast regression.
- Components use semantic tokens only.

## Consequences

- Positive: a colour or spacing change is one pull request across all clients, and contrast is guaranteed by CI.
- Negative: a custom XAML format to maintain.

## Validation

- 2026-10-14 (slice 3.2): implemented in `packages/design-tokens`. Style Dictionary 5.6 merges the DTCG sources and resolves references; our own small formatters write all three outputs, because its built-in Compose transforms assume rem units and a single CSS file needs both themes. The `HighContrast` XAML dictionary moves to Phase 15, where the Windows app maps roles to Windows system colours. Contrast (202 pairs) and drift run in CI as tests.
- 2026-10-14: phases renumbered by platform PLAN 2.0; the Windows app, and with it the `HighContrast` dictionary, is now Phase 17.
- 2026-10-14: phases renumbered by platform PLAN 3.0 (Claude-Native Hybrid Edition); the Windows app and the `HighContrast` dictionary are now Phase 18.
