# Web shell — Overview

| | |
|---|---|
| **Slug** | `web-shell` |
| **Phase / slices** | Phase 3 — slices 3.1, 3.3, 3.4, 3.6–3.9 (tokens: [`design-tokens`](../design-tokens/overview.md); authentication: `auth-bff` in `htco-platform`) |
| **Requirements** | FR-ADM-01, FR-IAM-01, FR-IAM-02, FR-IAM-05, FR-IAM-06 (see the PRD in `htco-platform`) |
| **Status** | In progress (slice 3.1 complete except Storybook and axe; slice 3.3 part 1; slice 3.6 and the web half of 3.5) |
| **Last updated** | 2026-10-15 |

## What and why

The owner's web app: a calm, bilingual, accessible shell where they sign in and see their organization and shops. Slice 3.1 lays the repository foundation every client builds on: one pnpm workspace with strict TypeScript, type-aware linting, formatting, unit tests, supply-chain rules and a CI pipeline with one required status.

## Acceptance criteria

| ID | Criterion | Slice | Status |
|---|---|---|---|
| AC-3.1.1 | A physical direction utility (`ml-4`, `left-0`) in a component fails lint. | 3.1 (part 2, with the web app and Tailwind) | Pass |
| AC-3.3.1 | Switching to Hebrew sets `dir="rtl"` and mirrors the layout; English restores LTR. | 3.3 | Pass (unit); visual check with the end-to-end suite in part 2 |
| AC-3.3.2 | A user-visible string missing from a catalog fails the i18n check. | 3.3 | Pass |
| AC-3.3.3 | Theme follows the system by default and the user's choice when set. | 3.3 | Pass |
| AC-3.5.1 | Signing in keeps no token in the browser: the session is an HttpOnly cookie set by the API, and nothing is written to `localStorage` or `sessionStorage`. | 3.5 (web) | Pass |
| AC-3.5.2 | Every unsafe request carries the CSRF header the API requires. | 3.5 (web) | Pass |
| AC-3.5.3 | An Owner or Admin reaches the dashboard only after setting up, or confirming, an authenticator app. | 3.5 (web) | Pass |
| AC-3.5.4 | A user sees their signed-in devices and signs any other one out. | 3.5 (web) | Pass |
| AC-3.6.1 | The generated API types match the pinned OpenAPI copy. | 3.6 | Pass |
| AC-3.8.1 | Every page carries the security policies (CSP, referrer), over HTTPS only; see client ADR-0006 for why they travel in the page. | 3.8 | Pass (unit); live check after the first deploy |
| AC-3.8.2 | The deployed app passes the sign-in journey with a real account. | 3.8 | Open (needs the owner's account) |
| AC-3.1.2 | A failing Vitest, Storybook interaction or axe check fails `ci-gate`. | 3.1 (Vitest now; Storybook and axe with slice 3.4) | Partly verified |

## Scope

- **In (3.1, part 1):** pnpm workspace (`pnpm-workspace.yaml`), Node 24 (`.node-version`), TypeScript 6.0 strict, ESLint 10 with typescript-eslint's strict and stylistic type-checked rules, Prettier, Vitest 5, repository scripts (`scripts/`) for the pull request title, SHA pins and test integrity, the CI workflow with `ci-gate`, Renovate.
- **In (3.1 part 2, 3.3 part 1):** the logical-CSS lint rule; `apps/web` with Vite 8, React 19, Tailwind 4 driven only by the design tokens, React Aria Components, TanStack Router and Query, Lingui 6 (English source, Hebrew catalog); the app shell (sidebar at 1200 px, rail from 640 px, bottom bar on phones), shop switcher placeholder, account menu (language, theme), overview and shops empty states, settings, offline banner, not-found and route-error states.
- **In (3.6, 3.5 web):** `packages/api-client` (openapi-typescript types, an openapi-fetch client that sends the CSRF header); the Vite dev proxy `/api` to the local API; sign-in, authenticator setup and confirmation, the security settings page (two-factor status, signed-in devices), sign-out from the account menu; route guards that send a visitor to sign-in and back, and an Owner or Admin to the second factor; any 401 from the API returns to sign-in.
- **In (3.5 part 3, web):** password reset. Sign-in links to `/forgot-password`, which posts the email to `POST /v1/auth/password/forgot` and always shows the same confirmation (the API never says whether the account exists). The emailed link lands on `/reset-password`, which reads the tokens once from the URL fragment and strips it, checks 12–128 characters and the repeat, and posts to `POST /v1/auth/password/reset`. A user with an authenticator app is asked for its code when the API answers `mfa-code-required`. The page then goes to `/`, where the usual guards take over. An expired or used link (`#error=…&error_code=otp_expired`, or 401 `reset-link-refused`) offers a new link. The API signs out every other session of the user.
- **In (3.8):** `apps/web/Dockerfile` builds the app for App Platform's static site at `https://dash.ht-co.app`; the CSP and referrer policy are written into the built page; the app refuses to run inside a frame ([client ADR-0006](../../adr/0006-static-web-hosting.md)). The app spec, ingress and DNS live in `htco-platform`.
- **Out (3.3 part 2 and 3.4):** Playwright journeys with axe in he/en × light/dark, Storybook with the accessibility addon, the rest of the core components. Path filters arrive with the first expensive job.

## External facts learned

- 2026-10-15: TanStack Query deprecates `ensureQueryData`; the replacement is `queryClient.query({ ...options, staleTime: "static" })`.
- 2026-10-15: TanStack Router's `redirect()` is thrown by design, which typescript-eslint's `only-throw-error` flags; each throw carries a disable comment.

- 2026-10-14: typescript-eslint 8.71 supports TypeScript `>=4.8.4 <6.1.0`; TypeScript 7.0 (the native compiler) is not supported yet, so the workspace stays on TypeScript 6.0.3 for both compiling and linting.
- 2026-10-14: pnpm 12 blocks dependency install scripts unless `allowBuilds` lists them, blocks exotic transitive dependencies, and defaults `minimumReleaseAge` to one day; we set seven days and `trustPolicy: no-downgrade`.
- 2026-10-14: `corepack use` with pnpm 12 did not write the `packageManager` field; it is written by hand with the registry's sha512 integrity.
- 2026-10-14: Node 24 runs the TypeScript scripts directly (type stripping) and supports `import.meta.main`; the scripts use only erasable syntax (`erasableSyntaxOnly`).
