## What and why

<!-- One paragraph in plain language. Link the slice (htco-platform/docs/plan/phases/…) or issue. -->

Slice / issue:
Platforms: web / android / windows / design system

## Acceptance criteria

| AC | Tests |
|---|---|
| | |

## Screenshots

<!-- Every changed state in he/en × light/dark. No real buyer data. -->

## How it was verified

<!-- Summary of the feature-verification evidence (also in docs/features/<feature>/tests.md). -->

## Test changes

<!-- Required if any existing test, screenshot baseline, assertion or skip marker changed. Otherwise "None". -->

## Checklist

- [ ] Tests and stories written first; all acceptance criteria covered
- [ ] Platform checks pass locally; CI is green
- [ ] Only semantic tokens; logical (start/end) layout; no hard-coded strings
- [ ] Loading, empty, error, stale, offline and no-permission states exist
- [ ] Nothing shows success before the server confirms it
- [ ] Docs updated (feature folder, component spec, navigation map, design system reference as relevant)

## Accessibility

- [ ] Keyboard path works (web, Windows); focus visible and in order
- [ ] Screen reader names and reading order checked (axe, TalkBack or Narrator)
- [ ] Contrast passes in both themes; 200% text does not clip
- [ ] Hebrew (RTL) and English (LTR) checked; codes and money keep their order

## Security

- [ ] No tokens or secrets in code, storage, logs or URLs
- [ ] Buyer data masked for roles that should not see it
- [ ] Generated API client used; no hand-written HTTP calls
