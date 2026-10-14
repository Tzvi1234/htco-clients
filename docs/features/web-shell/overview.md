# Web shell — Overview

| | |
|---|---|
| **Slug** | `web-shell` |
| **Phase / slices** | Phase 3 — slices 3.1, 3.3, 3.4, 3.6–3.9 (tokens: [`design-tokens`](../design-tokens/overview.md); authentication: `auth-bff` in `htco-platform`) |
| **Requirements** | FR-ADM-01, FR-IAM-01, FR-IAM-02, FR-IAM-05, FR-IAM-06 (see the PRD in `htco-platform`) |
| **Status** | In progress (slice 3.1, part 1) |
| **Last updated** | 2026-10-14 |

## What and why

The owner's web app: a calm, bilingual, accessible shell where they sign in and see their organization and shops. Slice 3.1 lays the repository foundation every client builds on: one pnpm workspace with strict TypeScript, type-aware linting, formatting, unit tests, supply-chain rules and a CI pipeline with one required status.

## Acceptance criteria

| ID | Criterion | Slice | Status |
|---|---|---|---|
| AC-3.1.1 | A physical direction utility (`ml-4`, `left-0`) in a component fails lint. | 3.1 (part 2, with the web app and Tailwind) | Open |
| AC-3.1.2 | A failing Vitest, Storybook interaction or axe check fails `ci-gate`. | 3.1 (Vitest now; Storybook and axe with slice 3.4) | Partly verified |

## Scope

- **In (3.1, part 1):** pnpm workspace (`pnpm-workspace.yaml`), Node 24 (`.node-version`), TypeScript 6.0 strict, ESLint 10 with typescript-eslint's strict and stylistic type-checked rules, Prettier, Vitest 5, repository scripts (`scripts/`) for the pull request title, SHA pins and test integrity, the CI workflow with `ci-gate`, Renovate.
- **Out (part 2):** Storybook with the accessibility addon, Playwright, and the logical-CSS lint rule; they need the web app (slice 3.3) and its first components (slice 3.4). Path filters arrive with the first expensive job.

## External facts learned

- 2026-10-14: typescript-eslint 8.71 supports TypeScript `>=4.8.4 <6.1.0`; TypeScript 7.0 (the native compiler) is not supported yet, so the workspace stays on TypeScript 6.0.3 for both compiling and linting.
- 2026-10-14: pnpm 12 blocks dependency install scripts unless `allowBuilds` lists them, blocks exotic transitive dependencies, and defaults `minimumReleaseAge` to one day; we set seven days and `trustPolicy: no-downgrade`.
- 2026-10-14: `corepack use` with pnpm 12 did not write the `packageManager` field; it is written by hand with the registry's sha512 integrity.
- 2026-10-14: Node 24 runs the TypeScript scripts directly (type stripping) and supports `import.meta.main`; the scripts use only erasable syntax (`erasableSyntaxOnly`).
