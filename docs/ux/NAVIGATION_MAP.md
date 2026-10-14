# Navigation Map

Every destination in HTCO Command, where it appears on each platform, and the phase that brings it. Screens are added to this map in the pull request that builds them. Phase numbers follow the platform's [master plan, version 3.0](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/PLAN.md) (the Claude-Native Hybrid Edition); the office follows [platform ADR-0012](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0012-living-office-organization.md) (16 AI employees in seven departments, three service departments, and Jev as a shared Decision Advisor). The groups are the information architecture of the owner's clients specification v6.0 (§2). Each screen's data, actions, states and phases are in the [screen specification](SCREEN_SPEC.md); numbers in brackets below are its screen numbers.

## Tree

```text
Authentication
  Welcome · Sign in · MFA · Recovery · Sessions                       [1]
Home
  Executive KPIs · urgent approvals · shop health · daily briefing    [2]
Office
  Office 2D                  department rooms · three service wings · list view          [14]
  Department explorer        people · responsibility · tasks · service KPIs · handoffs   [15]
  Employee directory         all 16 employees, role, department, real state              [16]
  Employee profile           Overview · Responsibilities · Tasks · Conversations ·       [17]
                             Agent Sessions · Skills & Tools & Automations · Knowledge ·
                             Memory · Model Router · Permissions · Evaluations ·
                             Cost & Usage · History
  Executive Office rooms     Quality Center (Noa, with Night Shift)                     [24]
                             Optimization Center (Omer)                                 [25]
Work
  Task Board                 board · list with SLA · timeline                           [20]
  My approvals               inbox → approval detail                                    [22]
  Activity feed              every actor, filtered by employee, shop, task and kind     [23]
  Agent runs                 task detail → runs · trace · cost · evidence · resume      [21]
  Messages                   inter-employee messenger · handoffs                        [19]
  Conversation detail        chat with an employee                                      [18]
Commerce
  Shops · Policies           shop cards, connection health, SKU policy, budgets         [3]
  Orders                     queue → order detail (items · timeline · incidents · audit) [4, 5]
  Fulfillment                SLA windows, shipment exceptions, inspector findings       [6]
  Customers                  inside order detail and tickets                            [5, 34]
Products
  Discovery → Candidate review                                                          [7, 8]
  Catalog → Listing editor                                                              [9, 10]
  Assets                     Nika's Creative Studio (GPT images with provenance)        [11]
  Price                      pricing and profitability                                  [13]
  Supplier quotes                                                                       [12]
Finance
  Revenue · P&L · Fees · Ledger · Exports                                               [33]
  AI costs                                                                              [32]
Marketing
  Listings performance · SEO recommendations · Campaigns · Tests (read only until 21)   [35]
Customer Service
  Tickets → ticket conversation · Templates · Returns approvals                         [34]
System
  Automation Center → Workflow detail → Execution log                                   [26, 27, 28]
  AI Tool Registry · MCP connectors                                                     [29]
AI Operations
  Decision Advisor (Jev)                                                                [30]
  Model Router · Per-employee routing · Evaluations                                     [31]
  Cost limits                                                                           [32]
Engineering
  Incident Center · Debugger                                                            [36]
  GitHub PRs · Deployments · Tests · Infrastructure health (role-gated)                 [37]
Mail
  Team inbox · Threads · Compose · Templates · Sending approvals                        [38]
  Agent aliases                                                                         [39]
Admin
  Users · Roles · Shops · Integrations · Secrets refs                                   [41]
  Audit                                                                                 [42]
  Notifications              notification center → the exact item; approvals first      [40]
  Settings                   language · theme · density · accessibility                 [43]
```

The office shows only recorded activity from the API (activity records, tasks, task runs, executions, routing decisions). It never fabricates or infers an employee's state: statuses are the eight runtime states (`IDLE`, `QUEUED`, `RUNNING`, `WAITING_EXTERNAL`, `WAITING_APPROVAL`, `BLOCKED`, `FAILED`, `OFFLINE`) derived on the server; no recorded activity means no activity shown; when the agent worker is offline every employee shows `OFFLINE` and the office is read-only. The service wings (Automations, AI Tools, Infrastructure) show services, never people; Jev is a service tile in AI Tools and AI Operations; GPT image generation lives in Nika's studio.

## By platform and phase

Web phases name where a destination is first built; [Phase 16](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-16-web-office.md) completes every screen to the state contract. Android ([Phase 17](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-17-android.md)) builds the screens marked ALL; Windows ([Phase 18](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-18-windows.md)) builds all 43.

| Destination | Web | Android | Windows | Phase (web · Android · Windows) |
|---|---|---|---|---|
| Authentication: sign in, MFA, recovery, sessions | ✓ | ✓ | ✓ | 3 · 17 · 18 |
| Home: Executive Dashboard | Full dashboard | Summary cards (Home tab) | Multi-panel | 7 (basic), 16 · 17 · 18 |
| Shops and policies | ✓ | ✓ (More; switcher everywhere) | ✓ | 3, 9 · 17 · 18 |
| Orders and order detail | Table with filters | ✓ (More) | Dense grid, split pane | 4 (fixtures), 9 (live) · 17 · 18 |
| Fulfillment Watch | ✓ | ✓ (More) | ✓ | 10 · 17 · 18 |
| Products: Discovery, Listing Workspace, Creative Studio | ✓ | Continue on web | ✓ (Listings split pane) | 7 (research), 11, 12 · — · 18 |
| Products: Candidate Detail, Catalog, Supplier Quotes, Pricing | ✓ | ✓ (More) | ✓ (Profitability split pane) | 12, 13 · 17 · 18 |
| Office 2D, departments, directory, profile | ✓ | List first, compact map (Office tab); profile read only | ✓ | 6 (directory), 16 · 17 · 18 |
| Employee Chat | ✓ | ✓ (Office tab) | Agent conversations split pane | 15 (Lia), 16 · 17 · 18 |
| Inter-employee Messenger | ✓ | Continue on web | ✓ | 16 · — · 18 |
| Task Board, Task Detail & Agent Runs, Activity Feed | ✓ | ✓ (Tasks tab) | ✓ | 5, 6 · 17 · 18 |
| Approvals | ✓ | Floating approvals, biometric step-up | ✓, Windows Hello step-up | 5 · 17 · 18 |
| Quality Center (Night Shift), Optimization Center | ✓ | ✓ (More) | ✓ | 7 (pilot), 14 · 17 · 18 |
| Automation Center, Execution Log | ✓ | ✓ (More) | ✓ | 16 · 17 · 18 |
| Workflow Detail, AI Tools Registry | ✓ | Continue on web | ✓ | 8 (tools), 16 · — · 18 |
| Decision Advisor (Jev), Model Router Console | ✓ | Continue on web | ✓ | 8 · — · 18 |
| AI Cost & Quota | ✓ | ✓ (More) | ✓ | 8 · 17 · 18 |
| Finance & P&L | ✓ | ✓ (More) | ✓ | 13 · 17 · 18 |
| Customer Service | ✓ | ✓ (Inbox tab) | ✓ | 15 · 17 · 18 |
| Marketing Analytics | Read only | ✓ (More) | ✓ | 16 (read only), 21 (actions) · 17 · 18 |
| Incident & Debugging Center | ✓ | ✓ (Home tab) | Incident center, split pane | 10 · 17 · 18 |
| Engineering & Deployments | ✓ (role, read only) | Continue on web | Developer Console (role) | 16 (read only), 19 (actions) · — · 18 |
| Mail Inbox / Outbox | ✓ | ✓ (Inbox tab: read, approve drafted sends) | ✓ | 15 · 17 · 18 |
| Agent Mail Alias Manager | ✓ | Continue on web | ✓ | 15 · — · 18 |
| Notifications | Web push | Push with deep links (Inbox tab) | Windows notifications | 16 · 17 · 18 |
| Admin / Integrations, Audit & Compliance | ✓ | Continue on web | ✓ | 3, 9, 16 · — · 18 |
| Preferences, offline and error | ✓ | ✓ (More), offline read | ✓ | 3 · 17 · 18 |

## Navigation patterns

- **Web and Windows:** a sidebar at 1200 px and wider, a navigation rail between 640 and 1200 px; the top bar holds the command palette and search, notifications and the user menu. The sidebar shows the groups above; the [`AppShell`](../../design/COMPONENT_SPEC.md#appshell) specification folds them into fewer sidebar sections, and the final grouping is settled in the DS0 design review.
- **Windows:** a three-column workspace (navigation, list, detail with an inspector), keyboard shortcuts, a global search limited to the user's shops, split panes for Orders, Listings, Profitability, Incidents and Agent conversations, and multi-window where it helps.
- **Android:** a `BottomBar` with five destinations: **Home, Office, Tasks, Inbox, More** (specification §4). Home: dashboard, approvals, open incidents. Office: office list and map, departments, directory, profiles, chat. Tasks: task board, task detail, activity. Inbox: notifications, mail, customer service. More: everything else marked ALL. Pending approvals relevant to the open item float in place; approvals open in a bottom sheet (`ApprovalSheet`) with the full card. A deep link to a WEB/WIN screen opens a "continue on web" card.
- **Deep links:** every notification opens the exact object (`/approvals/{id}`, `/incidents/{id}`, `/orders/{id}`, `/tasks/{id}`, `/office/employees/{id}`, `/office/automations/{id}/executions/{id}`) after authentication, and never shows another shop's object.
- **Shop scope:** the shop switcher changes the URL scope (`/shops/{id}/…`); one screen never mixes two shops.
- **The amber dot** appears on a destination only when something there waits for the user.
