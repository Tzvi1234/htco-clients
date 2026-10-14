# Web shell — Tests and verification

## Test plan

| Level | What is covered | Location |
|---|---|---|
| Repository scripts | Conventional Commits headers (valid, malformed, Git-generated, length limit); SHA-pinned, local and digest references; test-integrity findings (skip, todo and focus markers, removed tests, changed assertions, quality-gate settings) and the "Test changes" section | `scripts/*.test.ts` |
| CI | The pipeline itself | `.github/workflows/ci.yml` |

## Acceptance criteria coverage

| Acceptance criterion | Tests |
|---|---|
| AC-3.1.1 | Part 2 |
| AC-3.1.2 | The `tests` job runs Vitest and `ci-gate` requires it (Storybook and axe in part 2) |

## Verification evidence

### Verification — 3.1 (part 1) — 2026-10-14

| Acceptance criterion | Covered by tests | Verified for real | Result |
|---|---|---|---|
| AC-3.1.2 (Vitest) | `scripts/*.test.ts` | Red first: 9 and then 26 failing tests against stubs; `pnpm check` green (ESLint strict, Prettier, TypeScript, 67 tests). Locally: actionlint clean, zizmor no findings, SHA pins clean, osv-scanner on `pnpm-lock.yaml` no issues. | Pass (part 1) |

**Open issues:** AC-3.1.1 and the Storybook and axe half of AC-3.1.2 (part 2).
