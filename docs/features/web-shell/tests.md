# Web shell — Tests and verification

## Test plan

| Level | What is covered | Location |
|---|---|---|
| Repository scripts | Conventional Commits headers (valid, malformed, Git-generated, length limit); SHA-pinned, local and digest references; test-integrity findings (skip, todo and focus markers, removed tests, changed assertions, quality-gate settings) and the "Test changes" section | `scripts/*.test.ts` |
| Lint rule | Physical utilities (`ml-`, `left-`, `text-right`, `border-l`, `rounded-tr-`…, with variants and negatives) are reported with their logical replacement; prose and translated text are not | `scripts/eslint-logical-properties.test.ts` |
| Web units | Locale (direction, browser languages, remembered choice), theme (system default, remembered choice, `data-theme`), guarded storage | `apps/web/src/shared/**/*.test.ts` |
| Web app | Shell and navigation (`aria-current`), Hebrew start, language switch both ways from the account menu, theme choice and return to system, offline banner, not-found recovery | `apps/web/src/app/App.test.tsx` |
| Design 1C (ADR-0008) | The tweaks preference (defaults, one key per tweak, invalid values, blocked storage, `data-*` attributes, the badge count); the boot script gives the same attributes as the app, and the CSP carries its hash; the navigation model (seven areas, the demo's tabs, built screens, `locate`); the shell (current area and tab, Soon tags in English and Hebrew, sub-lists, the collapsed rail remembered and starting on narrow windows, the flyout, every placeholder route and every redirect, crumbs and title, the language switch, search, the approvals bell, the tweaks panel with palettes, levels, theme, reset and another tab's change, the phone tab bar and sheet, the account on phones, no view transitions under reduced motion); every token pair in all 114 modes, with glass composited over its backdrops | `apps/web/src/shared/theme/*.test.ts`, `apps/web/src/app/shell/nav.test.ts`, `apps/web/src/app/shell/shell.test.tsx`, `packages/design-tokens/test/*.test.ts` |
| i18n | Catalogs in sync with the code and complete in Hebrew | `pnpm i18n:check` (`lingui check sync`, `lingui check missing`) |
| Component stories | Every story renders in Chromium, its play function passes (keyboard reach, focus ring, Enter and Space, typing, announced errors, bidi order) and axe finds no violation (the accessibility addon with `a11y.test: "error"`) | `apps/web/src/shared/ui/*.stories.tsx`, `pnpm test:storybook` (`apps/web/vitest.storybook.config.ts`) |
| Component matrix | Every story of the built Storybook in he/en × light/dark: no serious or critical axe violation, and a screenshot equal to its baseline | `apps/web/e2e/components/stories.spec.ts`, baselines in `apps/web/e2e/components/__screenshots__/` |
| Journeys | The app on its in-memory API (`?demo`, `src/test/fakeApi.ts`) at 1440×900 and 375×812: Owner sign-in → authenticator setup → overview; language switch both ways with the layout mirrored; theme following the system, a choice overriding it and surviving a reload; team invitation; accepting an invitation; sign-out. Every stop: no serious or critical axe violation on the page, and a screenshot equal to its baseline | `apps/web/e2e/journeys/*.spec.ts` (projects `journeys-desktop`, `journeys-phone`), baselines in `apps/web/e2e/journeys/__screenshots__/` |
| CI | The pipeline itself | `.github/workflows/ci.yml` |

## Acceptance criteria coverage

| Acceptance criterion | Tests |
|---|---|
| AC-3.1.1 | `scripts/eslint-logical-properties.test.ts` |
| AC-3.3.1 | `App.test.tsx`: "switches to Hebrew and back from the account menu", "starts right-to-left in Hebrew"; `locale.test.ts`; journey `preferences.spec.ts` "switching to Hebrew mirrors the app right to left…" (`lang`/`dir` on the root, the main navigation moves to the right side and back, screenshots) |
| AC-3.3.2 | `pnpm i18n:check` in the `checks` job |
| AC-3.3.3 | `App.test.tsx`: "follows the system theme until the user picks one"; `theme.test.ts`; journey `preferences.spec.ts` "the theme follows the system…" (emulated system light and dark, then the user's choice, a reload, and back to the system) |
| AC-3.5.1 | `auth.test.tsx`: "sends the CSRF header and keeps no token in the browser" |
| AC-3.5.2 | `packages/api-client/test/client.test.ts`: "sends the CSRF header on unsafe requests only"; the fake API refuses requests without it |
| AC-3.5.3 | `auth.test.tsx`: "sends an Owner without an authenticator app to set one up...", "asks an enrolled Owner for the code...", "lets other roles in..."; journey `auth.spec.ts` "an Owner signs in, sets up the authenticator app and lands on the overview" |
| AC-3.5.4 | `auth.test.tsx`: "lists this user's devices and signs another one out" |
| AC-3.5.6 (web) | `passwordReset.test.tsx`: the sign-in link, the same confirmation for any email, 429, empty email, Hebrew; the reset sets the password and signs in, strips the fragment, mismatch, length, weak, expired link (fragment and API), the authenticator code |
| AC-3.6.1 | `packages/api-client/test/client.test.ts`: "match the pinned OpenAPI document" |
| AC-3.1.2 | The `tests` job runs Vitest and the `storybook` job runs the story tests (interactions, axe) and the component matrix; `ci-gate` requires both |
| AC-3.4.1 | Every story: axe through the accessibility addon (`pnpm test:storybook`, any violation fails) and `@axe-core/playwright` in he/en × light/dark (`stories.spec.ts`, serious or critical fail) |
| AC-3.4.2 | `Keyboard` stories of Button, IconButton and TextField, `KeyboardDisabled` (Button), `WithAction` (Banner): Tab reaches the control, the focus ring is the 2 px `--border-focus` outline (or the field's focus border and ring), Enter and Space press |
| AC-3.4.3 | `stories.spec.ts`: one screenshot per story in he/en × light/dark |
| AC-3.4.4 | `Ltr.stories.tsx` "Tracking Number In Hebrew": each character of `2024-0042-IL` sits to the right of the one before it, the Hebrew words around it read right to left, and the same number without `Ltr` is reordered (the check can fail) |

## Verification evidence

### Verification — 3.1 (part 1) — 2026-10-14

| Acceptance criterion | Covered by tests | Verified for real | Result |
|---|---|---|---|
| AC-3.1.2 (Vitest) | `scripts/*.test.ts` | Red first: 9 and then 26 failing tests against stubs; `pnpm check` green (ESLint strict, Prettier, TypeScript, 67 tests). Locally: actionlint clean, zizmor no findings, SHA pins clean, osv-scanner on `pnpm-lock.yaml` no issues. | Pass (part 1) |

**Open issues:** the Storybook and axe half of AC-3.1.2 (slice 3.4).

### Verification — 3.1 (part 2) and 3.3 (part 1) — 2026-10-14

| Acceptance criterion | Covered by tests | Verified for real | Result |
|---|---|---|---|
| AC-3.1.1 | 14 rule tests | Red first (missing module); `eslint .` clean on the app | Pass |
| AC-3.3.1 | App and locale tests | Red first; the Hebrew switch sets `lang="he" dir="rtl"` and translates the page | Pass (visual check in part 2) |
| AC-3.3.2 | `lingui check missing` | With the Hebrew "Settings" translation emptied: "FAIL missing: Found 1 missing translation(s)", exit 1; restored: PASS | Pass |
| AC-3.3.3 | App and theme tests | Red first | Pass |

`pnpm check`: ESLint, Prettier, TypeScript (repository and web), i18n, 136 tests. `vite build` succeeds.

**Open issues:** end-to-end journeys with axe and screenshots in he/en × light/dark (3.3 part 2); the official logo PNG is 1.2 MB and needs an optimized, owner-approved derivative.

### Verification — 3.6 and 3.5 (web) — 2026-10-15

| Acceptance criterion | Covered by tests | Verified for real | Result |
|---|---|---|---|
| AC-3.5.1 to AC-3.5.4 | `auth.test.tsx` against the in-memory API | Red first against the missing pages; the platform side was verified live on `api.ht-co.app` (CSRF 403, wrong password 401, ended session 401) | Pass (unit); live end to end with slice 3.8 |
| AC-3.6.1 | Drift test | Red before the first generation; green after `pnpm api:generate` | Pass |

`pnpm check`: ESLint, Prettier, TypeScript, i18n (64 messages, none missing in Hebrew), 153 tests.

**Open issues:** the web app is not deployed yet (slice 3.8); password reset and email verification need an email provider (3.5 part 3).

### Verification — 3.4 (part 1) — 2026-10-15

| Acceptance criterion | Covered by tests | Verified for real | Result |
|---|---|---|---|
| AC-3.1.2 | `storybook` job in `ci-gate` | A story with an unnamed button and one with low-contrast text failed `pnpm test:storybook` (axe `button-name`, `color-contrast`); the first CI runs failed on the missing screenshots until the baselines were committed | Pass |
| AC-3.4.1 | 48 stories × (addon axe + he/en × light/dark `@axe-core/playwright`) | No violation found in any story, language or theme | Pass |
| AC-3.4.2 | `Keyboard` stories | Red first: the focus-ring colour check failed while the ring's colour was still in transition; it now waits for the transition | Pass |
| AC-3.4.3 | 192 screenshots | Baselines made in CI's image (`storybook-screenshots` artifact), each component reviewed in he/en × light/dark before committing | Pass |
| AC-3.4.4 | `Ltr` "Tracking Number In Hebrew" | The control without `Ltr` is reordered (`IL-2024-0042` on screen), with `Ltr` the order is kept | Pass |

CI: the `storybook` job runs beside the others in about 4.5 minutes (image pull 40 s, install 16 s, story tests 31 s, Storybook build 13 s, 193-case matrix 2.3 min). `pnpm check` green.

**Open issues:** the slice's components that do not exist yet get their stories when they are built.
