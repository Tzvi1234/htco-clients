# CLAUDE.md — htco-clients

Operating manual for AI coding agents in this repository. Read it fully at the start of every session.

## What this repository is

The clients of **HTCO OS** (HT Commerce, by H.T.Z Studios): the web app (`apps/web`), the Android app (`apps/android`), the Windows app (`apps/windows`), the design system (`design/`), the official brand assets (`assets/brand/`) and the generated API clients (`packages/api-clients/`). The backend, the master plan and the system-level docs live in the sibling repository `htco-platform` (checked out at `../htco-platform`).

The office model ([platform ADR-0012](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0012-living-office-organization.md)): 16 AI employees with permanent names and titles in seven departments, deterministic automations, a tool registry and an engineering department; Jev is a shared Decision Advisor, not an employee. The office shows only recorded activity.

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
| Design system summary and product context (Impeccable) | [`DESIGN.md`](DESIGN.md), [`PRODUCT.md`](PRODUCT.md); last audit [`docs/design/impeccable-audit.md`](docs/design/impeccable-audit.md), round 2 [`docs/design/round2-review.md`](docs/design/round2-review.md), round 4 brightness [`docs/design/round4-brightness.md`](docs/design/round4-brightness.md) |
| Tokens | [`design/tokens/`](design/tokens/README.md) |
| Components | [`design/COMPONENT_SPEC.md`](design/COMPONENT_SPEC.md); live previews: https://claude.ai/artifact/Bgq6rDafP6qyXiJBCsq8nf |
| Navigation, content, accessibility | [`docs/ux/`](docs/ux/) |
| Client decisions | [`docs/adr/`](docs/adr/README.md) |
| API contract | `packages/api-clients/openapi.yaml` (pinned copy of the platform's contract) |

## Layout

```text
apps/web/              Vite + React + TypeScript (Phase 3)
apps/android/          Kotlin + Jetpack Compose (Phase 16)
apps/windows/          C# + WinUI 3 (Phase 17)
design/tokens/         DTCG token source
design/                Brand book and component spec
packages/api-clients/  Pinned OpenAPI copy and generated clients
assets/brand/          The Design 1C logo: light, dark, Design 4 and mark files
docs/                  ADRs, architecture, UX, features
```

## Commands

The web app exists (`apps/web`, slice 3.3 part 1). Each command is created by the slice listed below, which must also update this table. If a command does not exist yet, say so; never claim it ran.

| Command | What it runs | Created in |
|---|---|---|
| `pnpm tokens` | Build the CSS, Kotlin and XAML tokens into `packages/design-tokens/generated/` (refuses when a contrast pair fails in any of the 114 palette, theme and tweak modes); `pnpm check` fails when they drift | Slice 3.2 (modes: ADR-0008) |
| `pnpm install && pnpm check` | ESLint (strict, type-aware), Prettier, TypeScript, Vitest; later also i18n, tokens and contrast | Slice 3.1 (tokens: 3.2; web: 3.3) |
| `node scripts/<name>.ts` | Repository scripts run by CI (`conventional-commit`, `check-action-pins`, `test-integrity`); Node runs TypeScript directly | Slice 3.1 |
| `pnpm web` | The web app's dev server on http://localhost:5173; add `?demo` (signed in), `?demo=shops` (signed in, a shop in each connection state, with invented live Etsy data on Shops, Home, Orders, Products, Shipping and Customers, and invented incidents and notifications), `?demo=mfa` (the authenticator code step), `?demo=no-workspace` or `?demo=signed-out` to run it on the in-memory API without a local API server (development builds only) | Slice 3.3 |
| `pnpm i18n:check` | Lingui catalogs in sync with the code, and no missing Hebrew translation (part of `pnpm check`); `pnpm --filter @htco/web i18n:extract` updates them | Slice 3.3 |
| `pnpm api:generate` | Regenerate `packages/api-client/generated/schema.d.ts` from the pinned `packages/api-client/openapi.yaml`; a test fails when they drift | Slice 3.6 |
| `node scripts/openapi-pin.ts --pin <sha>` / `--check` | Copy the platform's `openapi.yaml` at a commit and record it in `packages/api-client/openapi.pin.json` / fail when the copy differs from that commit's file (CI) | Audit finding 8.1 |
| `pnpm storybook` | Component previews on http://localhost:6006, with Hebrew/English and light/dark in the toolbar | Slice 3.4 |
| `pnpm test:storybook` | Every story as a Vitest browser test in Chromium: render, play function (keyboard, focus ring), axe | Slice 3.4 |
| `pnpm test:e2e` | Builds Storybook, then Playwright: every story in he/en × light/dark with axe and a screenshot, and the journeys (sign-in with MFA setup, language, theme, team invitation, accepting an invitation, sign-out) on the `?demo` in-memory API at 1440×900 and 375×812 with axe and screenshots; screenshots compared only in CI's Linux image (`docs/features/web-shell/operations.md`) | Slice 3.4 (journeys: 3.3 part 2) |
| `./gradlew check` | Android: lint, unit and screenshot tests | Slice 16.1 |
| `dotnet test` | Windows: unit and UI tests | Slice 17.2 |

## Golden rules

1. No business rules in clients; the server decides.
2. Generated API clients only; contract changes start in `htco-platform`.
3. Tokens only; logical (start/end) layout; Hebrew and English for every string.
4. Design 1C ([client ADR-0008](docs/adr/0008-design-1c.md)): panels on a gray ground, ink for what is current, orange as the one accent and the tertiary colour in both palettes; the theme, palette (Gray or Cream) and language are the three personal settings, one shared preference set in Settings only (`data-theme`, `data-pal` on `<html>`; round 3, [ADR-0009](docs/adr/0009-clarity-round-3.md)). The navigation and the top bar are always frosted glass (`data-glass`).
5. Every screen has loading, empty, error, stale, offline and no-permission states; never claim unconfirmed success.
6. Web keeps no tokens in JavaScript; native apps keep tokens only in platform-secure storage.
7. WCAG 2.2 AA; keyboard and screen-reader paths for every action.
8. Tests first; screenshots reviewed in he/en × light/dark before merge.
9. The logo is the owner's Design 1C logo (`assets/brand/`, `Logo`); never redraw it or recolour it outside the `logo.*` tokens.
10. No junk files; docs change in the same pull request.

## Building a screen

The navigation (`apps/web/src/app/shell/nav.ts`) lists the seven areas and every tab of Design 1C. A tab without a screen has a route that renders its demo screen (a feature's `demoScreens.tsx`, in the kit's `DemoFrame`; `DemoScreen` when nothing is drawn yet), and a `SoonTag` beside it in the navigation. Screens are built from the one screen kit, `apps/web/src/shared/ui/kit/` (import from `kit/index.ts`). To build one: write the feature under `src/features/`, give its route the component in `src/app/router.tsx` (with `staticData: { layout: "panels" }` when it lays out its own `Panel`s), set `built: true` in `nav.ts`, and update `docs/ux/NAVIGATION_MAP.md`. The page's `PageHeader` puts its title in the top bar.

## Ask the owner first

New dependencies, fonts, icon sets or analytics; changes to brand colours, logo use or token meanings; new UI patterns; store releases; anything touching real buyer data.

## Git

Trunk-based with short branches, Conventional Commit pull request titles, squash merge after green CI. Never push to `main` directly.
