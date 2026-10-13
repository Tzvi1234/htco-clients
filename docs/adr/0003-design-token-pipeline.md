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
