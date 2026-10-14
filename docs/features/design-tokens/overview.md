# Design tokens — Overview

| | |
|---|---|
| **Slug** | `design-tokens` |
| **Phase / slices** | Phase 3 — slice 3.2 |
| **Requirements** | ER-UX-02 (tokens only), WCAG 2.2 AA contrast ([ACCESSIBILITY.md](../../ux/ACCESSIBILITY.md)), [client ADR-0003](../../adr/0003-design-token-pipeline.md) |
| **Status** | Done (slice 3.2) |
| **Last updated** | 2026-10-14 |

## What and why

One source of truth for colour, type, spacing, shape and motion (`design/tokens/`, DTCG 2025.10) becomes the files each platform uses: CSS custom properties for the web, Kotlin objects for Compose and a WinUI resource dictionary. A colour or spacing change is one pull request for all three clients, and CI guarantees contrast and that the committed outputs match the source.

## Acceptance criteria

| ID | Criterion | Slice | Status |
|---|---|---|---|
| AC-3.2.1 | Changing a token value without regenerating outputs fails CI. | 3.2 | Pass |
| AC-3.2.2 | A token pair below WCAG AA (4.5:1 text, 3:1 controls) fails the contrast test. | 3.2 | Pass |

## Scope

- **In:** `packages/design-tokens` (loader, CSS, Kotlin and XAML formatters, contrast check, build), the generated files, tests, `pnpm tokens`.
- **Out:** the `HighContrast` XAML dictionary (Phase 17, with the Windows app's system-colour mapping); Tailwind wiring of the CSS variables (slice 3.3); Compose theme objects built on the Kotlin tokens (Phase 16).

## External facts learned

- 2026-10-14: Style Dictionary 5.6 reads DTCG 2025.10 colour objects (`colorSpace`, `components`, `hex`) and dimension objects, but its Compose transforms assume rem units (20px became `320.00.dp`), so the formats are ours.
- 2026-10-14: semantic tokens that are bare references have no `$type` after resolution; the loader infers colour from the resolved value.
- 2026-10-14: Style Dictionary reads `source` entries as glob patterns, which need forward slashes on Windows.
- 2026-10-14: every semantic colour in both themes is opaque, so contrast needs no compositing.
