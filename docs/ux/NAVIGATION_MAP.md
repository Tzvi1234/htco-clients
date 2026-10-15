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

- **Web and Windows:** a sidebar at 1200 px and wider, a navigation rail between 640 and 1200 px; the top bar holds search, notifications and the user menu. The sidebar groups the office destinations under "Office" below the commerce destinations.
- **Android:** a `BottomBar` with up to five destinations: Overview, Approvals and Incidents first (Phase 16), then Orders and More by ADR. Approvals open in a bottom sheet with the full card. The office summary lives on Overview.
- **Deep links:** every notification opens the exact object (`/approvals/{id}`, `/incidents/{id}`, `/orders/{id}`, `/office/employees/{id}`, `/office/automations/{id}/executions/{id}`) after authentication, and never shows another shop's object.
- **The amber dot** appears on a destination only when something there waits for the user.
