# Web shell — Design

## Repository tooling (slice 3.1, part 1)

| Concern | Tool | Where |
|---|---|---|
| Packages and lockfile | pnpm 12.10.1 (pinned with its hash), one workspace | `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` |
| Supply chain | `minimumReleaseAge: 10080` (seven days), `trustPolicy: no-downgrade`, `blockExoticSubdeps`, `strictDepBuilds` | `pnpm-workspace.yaml` |
| Types | TypeScript 6.0.3, strict plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `erasableSyntaxOnly` | `tsconfig.base.json`, `tsconfig.json` |
| Lint | ESLint 10, typescript-eslint `strictTypeChecked` and `stylisticTypeChecked` with the project service | `eslint.config.js` |
| Formatting | Prettier 3 (print width 100); Markdown and token sources are not reformatted | `.prettierrc.json`, `.prettierignore` |
| Tests | Vitest 5 with shuffled order | `vitest.config.ts` |
| Repository scripts | TypeScript run directly by Node 24: Conventional Commits title check, SHA-pin check, test-integrity check | `scripts/` |
| CI | `checks`, `tests`, `security`, `workflows`, `test-integrity`, `pr-title`, aggregated by `ci-gate` | `.github/workflows/ci.yml` |
| Updates | Renovate with a seven-day minimum release age; TypeScript held below 7 | `.github/renovate.json5` |

## Decisions and alternatives

| Decision | Alternatives considered | Why |
|---|---|---|
| TypeScript 6.0 for compiler and lint | TypeScript 7 for compiling, 6 for lint, side by side | Two TypeScript packages fight over the `tsc` binary and the peer resolution; at this size the native compiler's speed buys nothing, and one version keeps lint and compiler in agreement. |
| Repository scripts in TypeScript, run by Node | Reuse the platform's Python scripts | Each repository builds with its own toolchain (ADR-0001 in `htco-platform`); the scripts are small and tested here. |
| `uvx` for actionlint and zizmor in CI | Release binaries with checksums | The same versions as the platform repository, no Python project needed. |
