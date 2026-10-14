# Client Architecture

| | |
|---|---|
| **Status** | Baseline 1.0 |
| **Last updated** | 2026-10-14 |
| **System design** | `htco-platform/docs/architecture/SOFTWARE_DESIGN.md` (the clients are consumers of that system) |
| **Rules** | `htco-platform/docs/engineering/ENGINEERING_RULES.md` applies here in full; this document adds client-specific rules |

## 1. Principles

1. **Clients are presentation.** Business rules (pricing, order transitions, permissions, policies) live on the server. A client may pre-validate input for convenience, never decide.
2. **Contracts are generated.** Every client talks to the API through a client generated from the pinned OpenAPI document. Hand-written HTTP calls are a review finding.
3. **One design language, native behaviour.** Shared tokens and component specifications; each platform implements components natively.
4. **Honest state.** Every screen designs loading, empty, error, stale, offline and no-permission states, and never shows success the server did not confirm.
5. **Secure by default.** No secrets in any client; tokens only in platform-secure storage (or, on the web, nowhere: the session lives in an HttpOnly cookie).
6. **Bilingual and accessible from the first screen.** Hebrew (RTL) and English (LTR), light and dark, keyboard and screen readers.

## 2. Repository layout

```text
apps/web/                 Vite + React + TypeScript web app
apps/android/             Kotlin + Jetpack Compose app (Phase 17)
apps/windows/             C# + WinUI 3 app (Phase 18)
design/tokens/            DTCG token source
design/COMPONENT_SPEC.md  Component specification
packages/api-clients/     Pinned openapi.yaml copy + generated TypeScript client; generation config for Kotlin and C#
assets/brand/             Official logo and approved derivations
docs/                     ADRs, architecture, UX, features
```

## 3. Build order

Web first (it establishes tokens, components, i18n, accessibility and the auth model), Android second (approvals and push on the phone, Phase 17), Windows last (Phase 18), after its concrete advantages over the web app are confirmed ([client ADR-0001](../adr/0001-three-native-clients.md)). Three native clients cost roughly two to two and a half times the effort of web-only per feature, so each native app ships the slice of features that platform does best.

## 4. Web

| Area | Choice | Notes |
|---|---|---|
| Build | Vite 8, TypeScript 6.0 for compiling and linting; both move to TypeScript 7 together once typescript-eslint supports it (its peer range ends below 6.1 today) | Static build served by a small Caddy service with strict headers. One TypeScript version keeps type-aware lint and the compiler in agreement. |
| UI | React 19, React Aria Components | Accessibility and RTL built in |
| Styling | Tailwind CSS 4 with token variables, logical utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) | Lint rule rejects physical direction utilities |
| Routing and data | TanStack Router, TanStack Query | Typed routes; query keys from the generated client |
| API client | openapi-typescript + openapi-fetch + openapi-react-query | Types only, tiny runtime; a removed field breaks compilation |
| i18n | Lingui 6 (ICU messages, compiled catalogs) | Hebrew plurals use one, two and other |
| Auth | Backend-for-frontend: HttpOnly `__Host-` session cookie set by the API; CSRF header on unsafe requests | No token ever reaches JavaScript ([platform ADR-0006](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0006-web-auth-bff.md)) |
| Tests | Vitest 5 + Testing Library, Storybook 10 interaction and accessibility tests, screenshot tests, Playwright 1.64 with axe, MSW 3 handlers typed from OpenAPI | Matrix: he/en × light/dark |

Structure (feature-oriented):

```text
apps/web/src/
  app/            routes, shells, providers
  features/       orders, incidents, approvals, … and the office areas: executive, departments, employees,
                  automations, tools, engineering, communication, observatory, activity (UI, hooks, tests per feature)
  shared/ui/      design-system components
  shared/api/     generated client wiring, query keys
  shared/auth/    session hooks, route guards
  shared/i18n/    catalogs, formatters (dates, money, numbers), Ltr isolation
  shared/lib/     small pure helpers
```

No global state library until measurement shows a need; server state lives in TanStack Query.

The office areas follow the organization of [platform ADR-0012](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0012-living-office-organization.md): 16 AI employees in seven departments, deterministic automations, the tool registry, engineering, and Jev as a shared Decision Advisor. They read only recorded activity from the API (activity records, tasks, automation executions, routing decisions, proposals); a client never derives or invents an employee's state, and shows Offline for every employee when the API reports the agent worker offline. Names, titles and departments come from the API's registry, never from client constants.

## 5. Android

| Area | Choice |
|---|---|
| Language and build | Kotlin 2.4, AGP 9.4, Gradle version catalog |
| UI | Jetpack Compose (BOM 2026.09), Material 3 foundation themed with HTCO tokens; same visual language as web, Android behaviours (back gesture, bottom sheets, biometrics) |
| Architecture | Clean MVVM with unidirectional data flow: `feature/*` modules (state, use cases, screens), `core/designsystem`, `core/network`, `core/database`, `core/domain` |
| DI | Hilt |
| Network | Retrofit 3 + kotlinx.serialization, client generated by openapi-generator (`jvm-retrofit2`, kotlinx serialization) |
| Storage | Room for cache; DataStore + Tink AEAD with a Keystore-wrapped key for tokens (androidx security-crypto is deprecated) |
| Auth | Decided by an ADR at the start of Phase 17: native sign-in screens calling Supabase Auth, or the HTCO web sign-in page in the system browser through Supabase's OAuth 2.1 server with PKCE (Auth Tab and verified App Links). Supabase does not host a sign-in page. Biometric step-up uses a Keystore key pair verified by the server |
| Push | FCM HTTP v1 with deep links |
| Tests | JUnit 5/6, Turbine, Compose UI tests with forced RTL, Roborazzi screenshots, Macrobenchmark and Baseline Profiles |
| Lint | ktlint (Spotless), Android Lint; detekt advisory until it supports Kotlin 2.4 |
| SDK levels | minSdk 26, targetSdk 36 (Play requirement since August 2026) |

## 6. Windows

| Area | Choice |
|---|---|
| Runtime | .NET 10 LTS, WinUI 3 on Windows App SDK 2.x |
| Architecture | MVVM with CommunityToolkit.Mvvm source generators; Microsoft.Extensions.Hosting for DI; `HTCO.App` (shell), `HTCO.Presentation` (views, view models, controls), `HTCO.Application`, `HTCO.Domain`, `HTCO.Infrastructure` (generated client, cache, auth), `HTCO.Tests` |
| API client | Kiota-generated C# client behind an `IHtcoApi` facade |
| Auth | Same approach as Android (Phase 17 ADR), with a loopback redirect when the system browser is used; tokens in Credential Locker (packaged) or DPAPI; Windows Hello step-up with a device key verified by the server |
| Packaging | MSIX signed with Azure Artifact Signing; App Installer or WinGet; automatic updates |
| Tests | MSTest 4.5 for view models, `UITestMethod` for XAML-bound tests, FlaUI smoke tests |
| Open risks | RTL behaviour of NavigationView and the title bar (spiked first); OAuth2Manager still experimental |

## 7. Cross-cutting rules

- **Tokens only.** No literal colours, sizes or radii in components (lint and review).
- **Bidi.** Receipt numbers, tracking codes, SKUs, IDs, emails and URLs are wrapped in an LTR isolate (`<bdi dir="ltr">` / Unicode FSI…PDI in plain text) in every language.
- **Formatting.** Dates, numbers and money through locale-aware formatters (`Intl` on the web, `java.text`/ICU on Android, `CultureInfo` on Windows). Money values come from the API as decimal strings with a currency; clients never do money arithmetic.
- **Errors.** Show the API's problem `title` in the user's language by mapping its stable `type`; show the `request_id` for support.
- **Realtime.** Until Phase 16 (the live-update spike, slice 16.2), freshness comes from polling with visible "last updated" times; realtime is an enhancement, never the only source of state.
- **Logout and revocation** clear caches, push registration and realtime subscriptions.
- **No analytics SDKs** that send buyer or user data to third parties.

## 8. Continuous integration

One workflow (`.github/workflows/ci.yml`) and a single required `ci-gate` job. Today it runs `checks` (ESLint, Prettier, TypeScript), `tests` (Vitest, including the token contrast and drift tests), `security` (gitleaks over the history, osv-scanner on `pnpm-lock.yaml`), `workflows` (actionlint, zizmor, SHA pins), `test-integrity` and `pr-title`. Jobs for `web`, `android`, `windows`, `tokens` and `contracts` join with their slices behind path filters; a change to `design/tokens/` or `packages/api-clients/openapi.yaml` will run every client's job. All actions pinned by SHA; Renovate across npm, Gradle and NuGet with a seven-day minimum release age, matching pnpm's `minimumReleaseAge`.
