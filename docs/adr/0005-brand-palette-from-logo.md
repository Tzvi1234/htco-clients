# Client ADR-0005: Brand palette measured from the official logo

- **Status:** Superseded by [client ADR-0007](0007-relay-design-language.md) (2026-10-15)
- **Date:** 2026-10-14
- **Deciders:** Owner, engineering

## Context

Older planning documents carried a palette from an earlier logo (indigo `#596CEB`, mint `#49D6C0`) and approximate values for the current one. The original planning brief requires exact colours taken from the official logo file and approved as tokens.

## Decision

- Brand colours are the median pixel values of the official logo: navy `#030F1F` (the ground), turquoise `#05F7F4` (the "CO"), amber `#F8B857` (the dot) and white (the "HT").
- Each brand colour has one job: navy is the ground (the office); turquoise is the system at work (primary action in the dark theme, live state, selection); amber means a human decision is needed.
- In the light theme the primary action is a navy capsule, because turquoise fails contrast on white. Turquoise appears there as indicators and as a deep teal for text.
- The indigo palette is retired; a softened indigo survives only as the second data-visualization colour.
- Every semantic pair is contrast-checked in both themes.

## Consequences

- Positive: the product looks like its logo, and colour meanings stay consistent across platforms.
- Negative: the light theme leads with navy rather than turquoise for primary buttons.
