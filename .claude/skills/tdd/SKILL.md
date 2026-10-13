---
name: tdd
description: Test-driven development protocol for htco-clients (web, Android, Windows). Use before writing or changing any component, screen, view model, hook, formatter or token build — and before fixing any client bug. Gives the red-green-refactor loop, which test to write at each level on each platform, naming and data rules, and the UI edge-case checklist (RTL and bidi, long text, large fonts, slow and failing networks, expired sessions, double submits).
---

# Test-driven development in htco-clients

The loop is the same as on the platform: one acceptance criterion, a failing test that fails for the right reason, the simplest code, refactor, full suite. What changes is which tests prove client behaviour.

## Which test for which code

| Code | Web | Android | Windows |
|---|---|---|---|
| Pure helper (formatting, mapping, bidi) | Vitest unit + property tests (fast-check) | JUnit unit | MSTest unit |
| Hook / ViewModel / state logic | Vitest with Testing Library `renderHook`, MSW typed handlers | JUnit + Turbine on `StateFlow` with fake repositories | MSTest on view models with fake `IHtcoApi` |
| Component | Storybook story per state + interaction test + axe | Compose UI test + Roborazzi screenshot | `UITestMethod` test + screenshot |
| Screen / flow | Playwright journey against MSW (fast) and against the local stack (real API) | Instrumented smoke test | FlaUI smoke test |
| Contract | Generated client compiles; MSW handlers typed from OpenAPI | Generated client compiles | Generated client compiles |
| Tokens | Contrast and drift checks | Generated objects compile | Generated dictionaries load |

Write the story or the test **before** the component: the states in the story are the acceptance criteria made visible.

## The loop for a screen

1. List the screen's states from the slice: loading, empty, populated, error, stale, offline, no permission, and each interaction.
2. RED: write one story or test for the first state (for example "shows 'Connect your first shop' when the user has no shops"). Run it, watch it fail.
3. GREEN: implement just enough.
4. Add the next state. Keep stories small and named after the state.
5. Add the journey test last (sign in → open screen → act → see the confirmed result).
6. Refactor with all tests green; run screenshot tests in he/en × light/dark and review the diffs.

## Naming

- Vitest and JUnit: `it("shows a stale banner when data is older than the sync window")` / `` `shows stale banner when data is older than sync window`() ``.
- Stories: `Orders/List/Empty`, `Orders/List/Stale`, `Orders/List/NoPermission`.
- Reference acceptance criteria IDs in test descriptions or tags (`AC-5.7.1`).

## UI edge-case checklist

- [ ] Hebrew and English; RTL mirroring correct; codes, numbers and money isolated left-to-right inside Hebrew text.
- [ ] Long and short text: long product titles, long names, one-character values; no clipping, no overlap.
- [ ] Large font scale (200% on web, largest on Android) and narrow widths (360 px).
- [ ] Light and dark themes; high contrast on Windows.
- [ ] Keyboard only; screen-reader names and order; focus after dialogs and navigation.
- [ ] Loading longer than expected; server error (problem+json with request ID); timeout; offline; slow network.
- [ ] 401 (expired session → sign-in, then back to the same place); 403 (no permission state); 404 for another shop's object.
- [ ] Double click and double submit; navigating away mid-request; stale response arriving after a newer one.
- [ ] Empty lists, one item, many items, paging to the end.
- [ ] Dates around midnight and DST, time zones; money in two currencies.
- [ ] Data older than the sync window shows its age; the office never shows a fake "running" state.

## Never

- Snapshot-update screenshots without reviewing each diff.
- Mock the generated client's types by hand; use the typed MSW handlers or fakes of our own interfaces.
- Test implementation details (class names, internal state); test what the user sees and can do.
