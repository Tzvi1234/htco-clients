# Accessibility and Right-to-Left

| | |
|---|---|
| **Target** | WCAG 2.2 AA on the web; the equivalent platform guidelines on Windows (Narrator, keyboard, high contrast) and Android (TalkBack, touch targets, font scaling) |
| **Verified by** | Automated checks in CI plus a manual pass per feature (see the `feature-verification` skill) |

## Requirements

| Area | Rule | How it is tested |
|---|---|---|
| Contrast | Text ≥ 4.5:1, large text and UI parts ≥ 3:1, in both themes; guaranteed by the token contrast check | Token CI check; axe on every story and page |
| Focus | Always visible: 2 px `border-focus` ring with 2 px offset; logical focus order; focus returns to the trigger after dialogs | Keyboard-only Playwright journeys; Windows keyboard tests |
| Keyboard | Every action reachable without a mouse on web and Windows; shortcuts never the only path | Playwright and FlaUI keyboard tests |
| Screen readers | Every control has an accessible name; status words, not colour alone; approval cards read action, reason, impact, risk in order; charts have a table alternative | axe, TalkBack and Narrator spot checks per feature |
| Touch | Targets ≥ 48 dp on Android, ≥ 24 px with spacing on the web | Compose tests; lint |
| Motion | Respect reduced-motion settings: transitions become instant, shimmer and office animation stop | Tests with reduced motion emulated |
| Text size | Layouts survive 200% text on the web and the largest system font on Android without clipping | Screenshot tests at large font scale |
| Time limits | Approval expiry is shown in advance; sessions warn before timing out | Unit and end-to-end tests |
| Forms | Labels always visible; errors in text with an icon; errors announced | Component tests |

## Right-to-left

- Hebrew sets `lang="he"` and `dir="rtl"` on the root (web), `FlowDirection="RightToLeft"` (Windows) and layout direction RTL (Android).
- Layout uses **logical** directions only: start and end, never left and right (lint-enforced on the web).
- Mirror: navigation order, chevrons and arrows, progress direction, the current-page indicator.
- Do not mirror: the logo, charts' time axes, media controls, clocks, numbers, codes.
- **Bidi isolation:** receipt numbers, tracking codes, SKUs, IDs, emails, URLs and money amounts inside sentences are isolated left-to-right (`<bdi dir="ltr">` on the web; FSI…PDI in plain-text notifications and CSV exports).
- Mixed-direction strings are tested in both languages (for example a Hebrew sentence containing a tracking number and a dollar amount).

## Platforms

- **Web:** React Aria Components provide accessible primitives; Storybook runs axe on every story; Playwright runs axe on every route in he/en × light/dark.
- **Android:** content descriptions, semantics merging for cards, TalkBack order checked on approval cards; RTL forced in Compose tests.
- **Windows:** `AutomationProperties.Name` on every control; high-contrast theme dictionary; Narrator check on the main journeys.
