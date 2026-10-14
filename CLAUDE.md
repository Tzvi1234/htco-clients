# CLAUDE.md — htco-clients

Operating manual for AI coding agents in this repository. Read it fully at the start of every session.

## What this repository is

The clients of **HTCO OS** (HT Commerce, by H.T.Z Studios): the web app (`apps/web`), the Android app (`apps/android`), the Windows app (`apps/windows`), the design system (`design/`), the official brand assets (`assets/brand/`) and the generated API clients (`packages/api-clients/`). The backend, the master plan and the system-level docs live in the sibling repository `htco-platform` (checked out at `../htco-platform`).

## Talking to the owner

The owner writes in Hebrew. Answer in Hebrew in conversation. Everything committed (code, comments, docs, commit messages) is in English; user-facing strings exist in Hebrew and English.

## Before any task

1. Load the `software-engineering` skill (mandatory, every task).
2. Load `design-system` before creating or changing any UI, and `tdd` before writing code.
3. Find the slice in `../htco-platform/docs/plan/phases/` (client work is planned there). Work only on planned slices or issues.
4. Before calling anything done: `feature-verification` (screenshots in he/en × light/dark, keyboard, screen reader), then `feature-docs`.

## Sources of truth

| Topic | Document |
|---|---|
| Product, plan, architecture, rules | `../htco-platform/docs/` (PRD, PLAN, SOFTWARE_DESIGN, ENGINEERING_RULES, TESTING_STRATEGY) |
| Client architecture and stacks | [`docs/architecture/CLIENT_ARCHITECTURE.md`](docs/architecture/CLIENT_ARCHITECTURE.md) |
| Brand book | [`design/README.md`](design/README.md) |
| Tokens | [`design/tokens/`](design/tokens/README.md) |
| Components | [`design/COMPONENT_SPEC.md`](design/COMPONENT_SPEC.md); live previews: https://claude.ai/artifact/Bgq6rDafP6qyXiJBCsq8nf |
| Navigation, content, accessibility | [`docs/ux/`](docs/ux/) |
| Client decisions | [`docs/adr/`](docs/adr/README.md) |
| API contract | `packages/api-clients/openapi.yaml` (pinned copy of the platform's contract) |

## Layout

```text
apps/web/              Vite + React + TypeScript (Phase 3)
apps/android/          Kotlin + Jetpack Compose (Phase 14)
apps/windows/          C# + WinUI 3 (Phase 15)
design/tokens/         DTCG token source
design/                Brand book and component spec
packages/api-clients/  Pinned OpenAPI copy and generated clients
assets/brand/          Official logo (never modify)
docs/                  ADRs, architecture, UX, features
```

## Commands

There is no app code yet; the workspace tooling exists (slice 3.1). Each command is created by the slice listed below, which must also update this table. If a command does not exist yet, say so; never claim it ran.

| Command | What it runs | Created in |
|---|---|---|
| `pnpm tokens` | Build the CSS, Kotlin and XAML tokens into `packages/design-tokens/generated/` (refuses when a contrast pair fails); `pnpm check` fails when they drift | Slice 3.2 |
| `pnpm install && pnpm check` | ESLint (strict, type-aware), Prettier, TypeScript, Vitest; later also i18n, tokens and contrast | Slice 3.1 (tokens: 3.2; web: 3.3) |
| `node scripts/<name>.ts` | Repository scripts run by CI (`conventional-commit`, `check-action-pins`, `test-integrity`); Node runs TypeScript directly | Slice 3.1 |
| `pnpm storybook` | Component previews | Slice 3.4 |
| `pnpm test:e2e` | Playwright journeys with axe (he/en × light/dark) | Slice 3.3 |
| `./gradlew check` | Android: lint, unit and screenshot tests | Slice 14.1 |
| `dotnet test` | Windows: unit and UI tests | Slice 15.2 |

## Golden rules

1. No business rules in clients; the server decides.
2. Generated API clients only; contract changes start in `htco-platform`.
3. Tokens only; logical (start/end) layout; Hebrew and English for every string.
4. Navy ground, turquoise for the system at work, amber only when the owner is needed.
5. Every screen has loading, empty, error, stale, offline and no-permission states; never claim unconfirmed success.
6. Web keeps no tokens in JavaScript; native apps keep tokens only in platform-secure storage.
7. WCAG 2.2 AA; keyboard and screen-reader paths for every action.
8. Tests first; screenshots reviewed in he/en × light/dark before merge.
9. The official logo file is never modified, recoloured or redrawn.
10. No junk files; docs change in the same pull request.

## Ask the owner first

New dependencies, fonts, icon sets or analytics; changes to brand colours, logo use or token meanings; new UI patterns; store releases; anything touching real buyer data.

## Git

Trunk-based with short branches, Conventional Commit pull request titles, squash merge after green CI. Never push to `main` directly.
