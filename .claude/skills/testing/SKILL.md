---
name: testing
description: How to write correct, trustworthy tests in htco-clients — choosing the level (unit, component, screen, contract, visual, accessibility, end to end), testing through the user's view, MSW handlers typed from the OpenAPI contract, the state matrix every screen must prove, he/en × light/dark, the eight runtime statuses, and the anti-patterns that make UI tests lie. Load together with `tdd` whenever you write or review a test on web, Android or Windows.
---

# Writing correct tests in htco-clients

`tdd` says **when** (first) and the loop. This skill says **how** to write a client test that proves something real. References: platform [TESTING_STRATEGY §5](https://github.com/Tzvi1234/htco-platform/blob/main/docs/engineering/TESTING_STRATEGY.md#5-clients-summary), [CLIENT_ARCHITECTURE](../../../docs/architecture/CLIENT_ARCHITECTURE.md), [SCREEN_SPEC](../../../docs/ux/SCREEN_SPEC.md).

## 1. What a correct client test is

1. It fails when what the **user** sees or can do is broken, and passes only when it works.
2. It talks to the UI the way a person or an assistive technology does: by role, accessible name and visible text, never by CSS class, test-only DOM structure or component internals.
3. It is deterministic: fixed clock and locale, mocked network through typed handlers, no real backend, no sleeps, animations off (reduced motion).
4. It asserts the honest state: the screen never claims success before the (mocked) server confirms it.
5. Business rules are not tested here, because they live on the server. A client test that recomputes a price or a permission is testing the wrong repository.

## 2. Pick the level

| You changed… | Web | Android | Windows |
|---|---|---|---|
| A pure helper (formatting money, dates, Ltr isolation, locale) | Vitest unit | JUnit | MSTest |
| A view model, hook or store (loading → data → error, retries, optimistic rollback) | Vitest + Testing Library `renderHook` | JUnit + Turbine on flows | MSTest on the ViewModel |
| A design-system component | Storybook story + interaction test + axe; screenshot he/en × light/dark | Compose UI test + Roborazzi screenshot, forced RTL | WinUI `UITestMethod` + screenshot, high contrast |
| A screen | Vitest browser mode or Testing Library with MSW; the full state matrix (§4) | Compose screen test with a fake repository | ViewModel + UI test |
| The API contract | Generated client compiles against the pinned `openapi.yaml`; MSW handlers typed from it | Generated Retrofit client compiles | Kiota client compiles |
| A journey (sign in → approve → see the result) | Playwright against MSW, and against the local stack for critical paths; axe in every journey | Instrumented smoke test | FlaUI smoke test |

## 3. Network and data

- **MSW handlers are typed from the OpenAPI contract.** A handler that returns a field the contract does not have must fail type checking. Never hand-write response shapes.
- Return realistic records, including problem+json errors with a `request_id`, 401, 403, cross-shop 404, 429 with `Retry-After`, slow responses and offline.
- Builders for fixtures (`anEmployee().running("Researching lanterns")`), synthetic people only, money with a currency, Hebrew and mixed-direction strings in at least one fixture per screen.
- The web never stores tokens: tests assert that no token appears in `localStorage`, `sessionStorage` or JavaScript-readable cookies.

## 4. The state matrix every screen proves

For each screen in [SCREEN_SPEC](../../../docs/ux/SCREEN_SPEC.md), one test per state, in he and en, light and dark (screenshot), with axe clean:

| State | What the test asserts |
|---|---|
| Loading | Skeleton mirrors the layout; nothing pretends to be data |
| Empty | The explanation and the one primary action |
| Data | The real values, codes in LTR isolation, tabular numbers, the source and age line |
| Error | Plain cause, Retry, and the request ID from the problem response |
| Stale | Data shown with its age and source, plus the retry banner |
| Offline | Read-only, writes disabled with a reason, the age of the data |
| No permission | PermissionGate text; the hidden data is not in the DOM at all |

Office screens add the **eight runtime statuses**: render each of `IDLE`, `QUEUED`, `RUNNING`, `WAITING_EXTERNAL`, `WAITING_APPROVAL`, `BLOCKED`, `FAILED`, `OFFLINE` from API records and assert the word, the dot and the accessible name. Assert that a draft employee is never shown as working, that amber appears only for `WAITING_APPROVAL`, and that a worker-offline response turns every employee `OFFLINE`.

## 5. Patterns

```ts
it("approval__high_risk__requires_step_up_before_approve", async () => {
  server.use(approvalHandlers.pending(anApproval().highRisk()));
  render(<ApprovalDetail id="apr_1" />, { locale: "he", theme: "dark" });

  const approve = await screen.findByRole("button", { name: /לאמת ולאשר/ });

  expect(approve).toBeEnabled();
  await user.click(approve);
  expect(await screen.findByRole("dialog", { name: /אימות מחדש/ })).toBeVisible();
  expect(server.requests("POST /v1/approvals/apr_1/decision")).toHaveLength(0);
});
```

- Query by role and name (`getByRole`), never by test IDs unless no accessible name can exist.
- Assert requests that must **not** happen (no decision before step-up, no write while offline).
- For optimistic UI, assert the rollback and the message when the server refuses.
- For realtime, feed events out of order and twice; the screen converges on the newest by version and shows no duplicates.

## 6. Anti-patterns

| Anti-pattern | Why it lies | Instead |
|---|---|---|
| Snapshotting the whole DOM | Passes on any visible regression the snapshot accepted | Screenshot review per state, plus behavioural assertions |
| Selecting by class name or nth-child | Breaks on refactor, ignores accessibility | Role and accessible name |
| Mocking the generated client by hand | Drifts from the contract | MSW handlers typed from `openapi.yaml` |
| `waitFor(() => true)` or timeouts | Flaky, hides slow paths | `findBy…` with a condition |
| Testing only English and light | Misses RTL, bidi and contrast bugs | he/en × light/dark for every component and screen |
| Hiding a button and calling it a permission test | The server is the authority | Assert the server's 403 is handled; the hidden data is not in the DOM |
| Updating screenshots without looking | Accepts regressions | Review every changed image in the pull request |
| `skip`, `only` or deleting a failing test | Hides the failure | Fix it, or quarantine with an issue (never accessibility or security tests) |

## 7. Review checklist

- [ ] Right level; no business rule re-implemented in the client.
- [ ] Role and name queries; axe clean; keyboard path tested for every action.
- [ ] The state matrix (§4) covered for every screen touched; office screens cover the eight statuses.
- [ ] he/en × light/dark screenshots reviewed.
- [ ] Network through contract-typed MSW handlers; errors include problem+json with `request_id`.
- [ ] Assertions on requests that must not happen.
- [ ] Seen failing for the right reason first.
