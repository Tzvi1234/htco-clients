# Web shell — Tests and verification

## Test plan

| Level | What is covered | Location |
|---|---|---|
| Repository scripts | Conventional Commits headers (valid, malformed, Git-generated, length limit); SHA-pinned, local and digest references; test-integrity findings (skip, todo and focus markers, removed tests, changed assertions, quality-gate settings) and the "Test changes" section | `scripts/*.test.ts` |
| Lint rule | Physical utilities (`ml-`, `left-`, `text-right`, `border-l`, `rounded-tr-`…, with variants and negatives) are reported with their logical replacement; prose and translated text are not | `scripts/eslint-logical-properties.test.ts` |
| Web units | Locale (direction, browser languages, remembered choice), theme (system default, remembered choice, `data-theme`), guarded storage | `apps/web/src/shared/**/*.test.ts` |
| Web app | Shell and navigation (`aria-current`), Hebrew start, language switch both ways from the account menu, theme choice and return to system, offline banner, not-found recovery | `apps/web/src/app/App.test.tsx` |
| i18n | Catalogs in sync with the code and complete in Hebrew | `pnpm i18n:check` (`lingui check sync`, `lingui check missing`) |
| CI | The pipeline itself | `.github/workflows/ci.yml` |

## Acceptance criteria coverage

| Acceptance criterion | Tests |
|---|---|
| AC-3.1.1 | `scripts/eslint-logical-properties.test.ts` |
| AC-3.3.1 | `App.test.tsx`: "switches to Hebrew and back from the account menu", "starts right-to-left in Hebrew"; `locale.test.ts` |
| AC-3.3.2 | `pnpm i18n:check` in the `checks` job |
| AC-3.3.3 | `App.test.tsx`: "follows the system theme until the user picks one"; `theme.test.ts` |
| AC-3.1.2 | The `tests` job runs Vitest and `ci-gate` requires it (Storybook and axe in part 2) |

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
