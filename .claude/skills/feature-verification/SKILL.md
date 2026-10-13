---
name: feature-verification
description: How to verify that a client feature really works before calling it done — beyond unit and component tests. Use after the tests pass and before opening or merging a pull request in htco-clients. Gives a universal protocol (run it against the real local stack, look at it in both languages and themes, try to break it, check accessibility and security) and playbooks for screens, components, forms, lists, approval and decision UI, authentication and sessions, live or stale data, and native Android and Windows specifics, plus the evidence format.
---

# Feature verification (clients)

Tests prove the code matches expectations. Verification proves a person can actually use the feature, in Hebrew and English, light and dark, by mouse, keyboard, touch and screen reader, and that it fails honestly. Record the evidence; never claim a check you did not run.

## Universal protocol

1. **Outcome:** one sentence on what the user can do now; list the acceptance criteria.
2. **Automated evidence:** run the platform's check commands; map each criterion to its tests.
3. **Run it for real:** start the platform's local stack (`../htco-platform`: `just up`, seeded with two organizations and a user per role) and the client against it, not only against mocks.
4. **Walk the happy path** as each relevant role.
5. **Look at it:** capture screenshots of every state in **he/en × light/dark** (Playwright for web, Roborazzi for Android, the Windows screenshot test). Compare them side by side with the design system previews and, for new patterns, with the Mobbin references used. Fix anything clipped, misaligned, low-contrast or busy.
6. **Try to break it:** run the playbook checks below.
7. **Accessibility pass:** keyboard-only (web, Windows), screen reader on the main path (NVDA or Narrator, TalkBack), 200% text, reduced motion.
8. **Security pass:** no tokens in browser storage or logs; buyer data masked for roles that should not see it; another shop's object returns the not-found state.
9. **Record** the evidence in `docs/features/<feature>/tests.md` and attach key screenshots to the pull request (never commit screenshots with real buyer data).

## Playbooks

### Screen or flow
- Every state renders: loading, empty, populated, error with request ID, stale with age, offline, no permission.
- Deep link to the screen works after sign-in and preserves filters.
- Browser back and forward (web), system back (Android), window resize and snap (Windows) behave.

### Component
- All variants and states in the component spec exist as stories or previews, in both themes and both directions.
- Focus ring visible; keyboard and touch work; accessible name present; contrast passes (axe).
- Content stress: very long and very short labels, Hebrew and English, numbers with many digits.

### Form
- Labels visible; validation messages appear in text with an icon and are announced; server-side validation errors map to the right fields.
- Double submit sends one request (the button shows loading and is disabled).
- Unsaved changes warn before leaving.

### List or table
- Sorting, filtering, searching and paging work together and survive reload (state in the URL).
- 0, 1 and 1,000+ rows; the last page; slow pages show progress, not a blank table.
- Codes and money stay left-to-right in Hebrew; columns align numbers with tabular figures.

### Approval or decision UI
- The card shows the raw action, before and after, cost range, risk, evidence, rollback and expiry from the server.
- Expired approvals cannot be approved (button disabled with a reason, and the API refuses anyway).
- High-risk approval asks for re-authentication (biometrics on Android).
- Approving twice quickly results in one decision; the UI shows the server's confirmed state.
- A screen reader reads action, reason, impact and risk in order.

### Authentication and sessions
- Sign-in, MFA enrollment and verification, sign-out, session revocation from another device.
- Expired session mid-task returns the user to the same place after signing in again.
- Web: no token in local storage, session storage, IndexedDB or URLs; cookies have `__Host-`, `Secure`, `HttpOnly`, `SameSite=Strict`; requests without the CSRF header are refused.
- Android and Windows: tokens only in secure storage; sign-out clears caches and push registration.

### Live or stale data
- Disconnect the network: the screen shows offline with the data's age; reconnect: it refreshes without a reload.
- Stop the platform worker: the office shows read-only and never a fake "running" agent.

### Android specifics
- TalkBack order on approval cards; touch targets ≥ 48 dp; system back; notification deep links; app killed and restored; dark theme follows the system.
- Cold start time measured on a mid-range device for screens on the startup path.

### Windows specifics
- Keyboard-only path through the main journeys; Narrator names; high-contrast theme; window resizing from narrow to wide; multiple monitors with different scaling.

## Evidence format (append to `docs/features/<feature>/tests.md`)

```markdown
## Verification — <slice ID> — <date>

| Acceptance criterion | Tests | Verified for real | Result |
|---|---|---|---|
| AC-7.5.1 | `ApprovalCard.stories` a11y, `approvals.spec.ts` | TalkBack read order checked on Pixel 8 emulator | Pass |

**States captured:** he/en × light/dark for loading, empty, populated, error, stale, no permission.
**Adversarial checks:** <list>
**Accessibility:** keyboard ✓ · screen reader ✓ · 200% text ✓ · reduced motion ✓
**Security:** <what was checked>
**Open issues:** <links> or "none".
```
