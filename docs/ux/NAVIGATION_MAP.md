# Navigation Map

Every destination in HTCO Command, where it appears on each platform, and the phase that brings it. Screens are added to this map in the pull request that builds them. Phase numbers follow the platform's [master plan, version 2.0](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/PLAN.md); the office follows [platform ADR-0012](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0012-living-office-organization.md) (16 AI employees in seven departments, automations, tools, engineering, and Jev as a shared Decision Advisor).

## Tree

```text
Sign in · MFA · Recovery · Sessions
Overview
Shops                      shop cards, capabilities, connect / disconnect
  Etsy return              /integrations/etsy/callback: finishes connecting, then back to Shops
Orders                     list → order detail (items · timeline · incidents · audit)
Fulfillment                tracking health, SLA windows
Incidents                  incident center → incident detail
Approvals                  inbox → approval detail
Tasks                      board · list · task detail
Products                   catalog · Listing Health · Product Studio pipeline → product detail
Suppliers                  quote requests · supplier mappings
Finance                    P&L · fees · costs · exports
Support                    inbox · tickets → ticket detail
Office
  Executive Office         manager overview · supervisor findings · optimization proposals · approvals · business health
  Departments              department profile → employees · current tasks · communications · performance · handoffs
  Employee profile         name and title · role · goals · activity · tools · skills · permissions · available automations ·
                           sessions · memory summaries · model policy · evaluations
  Automation Center        workflow definitions · triggers · execution history · failures · retries · metrics ·
                           manual authorized execution
  AI Tools Center          tool registry · version · status · capabilities · access controls · testing
  Engineering Console      development requests · incidents · optimization proposals · GitHub PRs · deployment status ·
                           releases · infrastructure health (role-gated)
  Communication            direct conversations with employees · internal employee-to-employee messages · task threads ·
                           handoff history · search
  Decision & Model Observatory   Decision Advisor (Jev) status · routing policies · model usage · costs · routing history ·
                           evaluation results
  Activity & Audit         activity feed across departments, filtered by employee, shop, task and severity · audit log
Notifications              notification center → the exact item; approvals waiting for the user first
Settings                   profile · notifications · language and theme
Administration             users and roles · shop access · budgets and model policies · kill switches · audit log
```

The office shows only recorded activity from the API (activity records, tasks, executions, routing decisions). It never fabricates or infers an employee's state: no recorded activity means no activity shown, and when the agent worker is offline every employee shows Offline and the office is read-only.

## The web app's navigation (Design 1C, client ADR-0008)

Seven areas in the owner's order and wording, defined once in `apps/web/src/app/shell/nav.ts`. Every tab has an address now; a tab that is not built shows the demo's full screen in the demo frame (dimmed, inert, the DEMO pill in the top bar; `features/*/demoScreens.tsx`) and carries a "Soon" tag ("בקרוב") in the sidebar, the flyout, the phone sheet and quick actions.

| Area (he) | Tab | Address | Screen |
|---|---|---|---|
| Home (בית) | — | `/` | Built: greeting, shops, getting started; approvals, key numbers and the office pulse as demos |
| Office (המשרד) | Floor · Chat · Team room · AI ops · Engineering | `/office/floor` · `/office/chat` · `/office/team` · `/office/aiops` · `/office/eng` | Soon (the demo's full screens in the demo frame; the floor is the living 3D office) |
| Work (עבודה) | Tasks · Approvals · Activity | `/work/tasks` · `/work/approvals` · `/work/activity` | Soon (the demo's full screens in the demo frame) |
| Commerce (מסחר) | Shops | `/shops` (also `/commerce/shops`; the Etsy return `/integrations/etsy/callback` belongs here) | Built: shops and their connection, connecting with the step-up code; sales tiles and top listings as demos |
| | Orders · Products · Shipping · Suppliers | `/commerce/orders` · `/commerce/products` · `/commerce/shipping` · `/commerce/suppliers` | Soon (the demo's full screens in the demo frame) |
| Customers (לקוחות) | Tickets · Customers · Mail · Marketing | `/customers/tickets` · `/customers/customers` · `/customers/mail` · `/customers/marketing` | Soon (the demo's full screens in the demo frame) |
| Finance (כספים) | Overview · Ledger | `/finance/overview` · `/finance/ledger` | Soon (the demo's full screens in the demo frame) |
| Admin (ניהול) | Health · Automations | `/admin/health` · `/admin/automations` | Soon (the demo's full screens in the demo frame) |
| | Members & access | `/settings/team` (also `/admin/members`) | Built: members, inviting with the one-time link, role changes, shop access, removal; AI employees and the approval policy as demos |
| | Settings | `/settings`, with Security at `/settings/security` (also `/admin/settings`) | Built: interface language, the design tweaks, access and security, Etsy connections; business settings, notifications and other connections as demos. Security: the second factor and signed-in devices; recovery as a demo |

An area's own address (`/office`, `/work`, …) opens its first tab. The sidebar groups Home, then Workspace (Office to Finance), then System (Admin); on phones the tab bar carries Home, Office, Work and Commerce, and More opens every area.

## By platform and phase

| Destination | Web | Android | Windows | Phase |
|---|---|---|---|---|
| Sign in, MFA, sessions | ✓ | ✓ | ✓ | 3 · 16 · 17 |
| Overview | Full dashboard | Summary cards | Multi-panel | 3 |
| Shops | ✓ | — | ✓ | 4 |
| Orders | Table with filters | Later, by ADR | Dense grid, bulk actions | 5 |
| Fulfillment and incidents | ✓ | Incidents list and detail | Incident center | 6 |
| Approvals and tasks | ✓ | Approvals first, with push and biometrics | ✓ | 7 · 16 |
| Activity & Audit (activity records for every actor) | ✓ | — | ✓ | 7, extended in 15 |
| Employee, tool and automation registry (read-only) and budgets (owner) | ✓ | — | ✓ | 8 |
| Products: Listing Health | ✓ | Approvals only | ✓ | 11 |
| Products: Product Studio | ✓ | Approvals only | ✓ | 12 |
| Suppliers and finance | ✓ | — | ✓ | 13 |
| Support | ✓ | Approvals only | ✓ | 14 |
| Executive Office, Departments, Employee profile | ✓ | Office summary | ✓ | 15 |
| Automation Center, AI Tools Center | ✓ | — | ✓ | 15 |
| Communication | ✓ | Later, by ADR | Conversations + side panel | 15 |
| Decision & Model Observatory | ✓ | — | ✓ | 15 (data from 9) |
| Notifications and web push | ✓ | Push with deep links | Windows notifications | 15 · 16 · 17 |
| Optimization proposals (Executive Office) | ✓ | Approvals only | ✓ | 18 |
| Engineering Console | ✓ (role) | — | ✓ (role) | 15 (runs, traces, dead letters) · 17 · 19 (requests, PRs, releases) |
| Administration (users, roles, shop access) | ✓ | — | ✓ | 2–3 |

## Navigation patterns

- **Web and Windows:** the Design 1C floating sidebar (264 px) from 1360 px, its 72 px rail with the area flyout below that (the user's choice is remembered), and a tab bar under 640 px; the top bar holds the crumbs and title, language, approvals, search and the design tweaks; the account sits at the foot of the sidebar (in the top bar on phones).
- **Android:** a `BottomBar` with up to five destinations: Overview, Approvals and Incidents first (Phase 16), then Orders and More by ADR. Approvals open in a bottom sheet with the full card. The office summary lives on Overview.
- **Deep links:** every notification opens the exact object (`/approvals/{id}`, `/incidents/{id}`, `/orders/{id}`, `/office/employees/{id}`, `/office/automations/{id}/executions/{id}`) after authentication, and never shows another shop's object.
- **The attention badge** (orange, or lemon in Design 4) appears on a destination only when something recorded there waits for the user.
