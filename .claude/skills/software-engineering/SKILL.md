---
name: software-engineering
description: Mandatory preflight and quality bar for ANY change in htco-clients — web, Android, Windows, design tokens, API clients or docs. Load it before planning or editing anything in this repository, including small fixes. Covers scoping a slice, where code belongs on each platform, the client non-negotiables (no business logic, generated clients, tokens only, i18n, RTL, accessibility, honest states, secure storage), the definition of done, and when to ask the owner.
---

# Software engineering in htco-clients

The clients are the face of a system that handles money, buyer data and autonomous agents. They must be correct, honest and accessible. The universal rules are in `htco-platform/docs/engineering/ENGINEERING_RULES.md` (sibling checkout at `../htco-platform`); client specifics are in `docs/architecture/CLIENT_ARCHITECTURE.md`. This skill is the operational checklist.

## 1. Preflight

1. **Find the slice** in `htco-platform/docs/plan/phases/` (client work is planned there with the API work). Unplanned work: ask the owner.
2. **Read** the slice's acceptance criteria, the feature folder (`docs/features/<feature>/`), the relevant components in `design/COMPONENT_SPEC.md`, and the API endpoints in `packages/api-clients/openapi.yaml`.
3. **Restate the goal** and what is out of scope.
4. **List the screens and states** you will build: loading, empty, error, stale, offline, no permission, and success only when the server confirms it.
5. **Check the contract.** If the API you need does not exist or is wrong, stop: the change starts in `htco-platform` (contract first).
6. **Design check.** Use existing components and tokens. If a screen needs a new pattern, load the `design-system` skill and look for references on Mobbin before inventing one.
7. **Plan tests** with the `tdd` skill and verification with the `feature-verification` skill.

## 2. Where code belongs

| Platform | UI | State and logic | API access | Shared |
|---|---|---|---|---|
| Web | `apps/web/src/features/<feature>/` components | hooks next to the feature; server state in TanStack Query | `src/shared/api/` (generated client only) | `src/shared/ui/` design-system components |
| Android | `feature/<feature>/` Compose screens | ViewModel + immutable UI state (unidirectional data flow) | `core/network` (generated client) | `core/designsystem` |
| Windows | `HTCO.Presentation/Views` | `HTCO.Presentation/ViewModels` (CommunityToolkit.Mvvm) | `HTCO.Infrastructure` behind `IHtcoApi` | `HTCO.Presentation/Controls` |

## 3. Non-negotiables

- **No business rules in clients.** Pricing, order transitions, permissions, policies and money arithmetic happen on the server. Clients display and request.
- **Generated API clients only.** No hand-written HTTP calls or DTOs that duplicate the contract.
- **Tokens only.** No literal colours, spacing, radii or font sizes. No physical left/right in layout code.
- **Every string translatable** (Hebrew and English); no sentence concatenation; codes and numbers isolated left-to-right.
- **Every state designed**: loading, empty, error (with request ID), stale (with age), offline, no permission.
- **Never claim success** the server did not confirm.
- **Security:** web keeps no tokens in JavaScript (session cookie only, CSRF header on unsafe requests); Android stores tokens only in DataStore encrypted with a Keystore-wrapped key; Windows only in Credential Locker or DPAPI. No secrets in any client, ever. Mask buyer data unless the role allows it.
- **Accessibility:** WCAG 2.2 AA; keyboard and screen-reader paths for every action.

## 4. Before you say "done"

Run the checks for the platforms you touched (the commands are created in Phase 3, 14 and 15; if one does not exist yet, say so instead of claiming it passed):

```
pnpm check            # web: lint, types, unit and component tests, i18n, tokens
pnpm test:e2e         # web: Playwright journeys with axe (he/en × light/dark)
./gradlew check       # android: lint, unit, screenshot tests
dotnet test           # windows: unit and UI tests
```

Then verify with `feature-verification`, document with `feature-docs`, fill in the pull request template, and report to the owner in Hebrew: what changed, how it was verified (with screenshots), what is left.

## 5. Stop and ask the owner before

- adding a dependency, a font, an icon set or an analytics tool;
- changing a brand colour, the logo usage or the meaning of a token;
- shipping a new pattern that is not in the component spec;
- publishing a release to a store or to users;
- anything that touches real buyer data outside an approved test.

## 6. Never

- weaken or skip a test, a lint rule or an accessibility check to get green;
- add a placeholder, scratch or summary file to the repository;
- invent API behaviour — the contract and the server are the truth.
