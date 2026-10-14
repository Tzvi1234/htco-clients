# Screen Specification

| | |
|---|---|
| **Status** | Draft for the DS0 design review ([Phase 3](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-03-design-system-web-shell.md), slice 3.10) |
| **Source** | The owner's clients specification v6.0 (Claude-Native Clients, 14 October 2026; kept outside the repository): §2 navigation, §3 screen matrix, §4 platform UX, §5 office, §6 employee page, §7 automations, §8 models and tools, §9 mail, §11 security, §12 roadmap, §13 checklist |
| **Plan** | Phase numbers follow the platform's [master plan, version 3.0](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/PLAN.md) |
| **Related** | [Navigation map](NAVIGATION_MAP.md) · [Component specification](../../design/COMPONENT_SPEC.md) · [Brand book](../../design/README.md) · [Accessibility](ACCESSIBILITY.md) · [Content style](CONTENT_STYLE.md) · platform [PERMISSION_MATRIX](https://github.com/Tzvi1234/htco-platform/blob/main/docs/architecture/PERMISSION_MATRIX.md) and [DATA_MODEL](https://github.com/Tzvi1234/htco-platform/blob/main/docs/architecture/DATA_MODEL.md) |

All 43 screens of HTCO OS, the same on every platform in what they show and allow. The business system is the one of the living office ([platform ADR-0012](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0012-living-office-organization.md)): 16 AI employees in seven people departments, three service departments (Automations, AI Tools, Infrastructure), Jev as a shared Decision Advisor and GPT image generation inside Nika's studio. The Claude-Native edition ([ADR-0016](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0016-claude-native-agent-runtime.md), [ADR-0017](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0017-auth-and-billing-policy.md)) changes only what the screens show about runs: real runtime states, the billing mode of each run, and cost.

A screen is built in the phase that owns its data and completed to the state contract on the web in [Phase 16](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-16-web-office.md). Android ([Phase 17](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-17-android.md)) builds the 31 **ALL** screens; Windows ([Phase 18](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-18-windows.md)) builds all 43. Update the phase columns in the pull request that builds a screen.

## 1. How to read this

Each screen has:

- **Group** in the navigation (§2 of the specification; see [section 2](#2-navigation-groups)).
- **Priority:** **ALL** (web, Android and Windows) or **WEB/WIN** (web and Windows; on Android a deep link opens a short card with a "continue on web" link).
- **Stage:** the specification's UX stage (UX1–UX5; DS0 and UX6 apply to every screen, [section 11](#11-release-stages)).
- **Phases:** where the web screen is first built and completed, the Android slice and the Windows slice.
- **Purpose, data and actions:** what the screen is for, the records it reads (platform tables) and what the user can do.
- **Roles:** who can open it, from the platform permission matrix (Owner, Admin, Operations, Finance, Support, Developer, Viewer). "S" means only for shops granted to the user; **MFA** an `aal2` session; **RA** recent re-authentication (step-up). The backend enforces every rule; hiding a control is never the permission.
- **Components** from the [component specification](../../design/COMPONENT_SPEC.md). Every screen also uses `AppShell` (web, Windows) or the Android shell with `BottomBar`, `ShopSwitcher`, and the feedback components (`Skeleton`, `EmptyState`, `ErrorState`, `RetryBanner`, `PermissionGate`, `ConnectivityIndicator`); they are not repeated per screen.
- **States** beyond the contract below, and screen-specific **rules**.

The API a screen calls is added contract-first to the platform's `openapi.yaml` in the phase that owns the data, and reaches clients only through `packages/api-clients`. A screen never calls a provider, Etsy, GitHub, DigitalOcean or Supabase directly.

### State contract (every screen)

| State | What the screen shows |
|---|---|
| Loading | A skeleton that mirrors the layout; nothing pretends to be data |
| Empty | Why it is empty and the one primary action, if the user has it |
| Error | The cause in plain words, Retry, and the request ID from the problem response |
| Stale | The data with its age and source, plus the retry banner |
| Offline | Read-only; writes disabled with the reason; the age of the data |
| No permission | `PermissionGate` text; the hidden data is not sent by the server and is not in the DOM |
| Disabled | A control the user may see but cannot use now says why (offline, expired, draft employee, missing capability shown only where the capability is visible to that role) |

Office screens also prove the **eight runtime statuses** (`IDLE`, `QUEUED`, `RUNNING`, `WAITING_EXTERNAL`, `WAITING_APPROVAL`, `BLOCKED`, `FAILED`, `OFFLINE`), each from seeded records; see [section 5](#5-office-2d).

## 2. Navigation groups

From specification §2. Each screen has one home group; it may be linked from others. Items of §2 that are not separate screens live inside the screen named.

| Group | §2 items | Screens |
|---|---|---|
| Authentication | Welcome, Sign In, MFA, Recovery, Sessions | 1 |
| Home | Executive KPIs, urgent approvals, shop health, daily briefing | 2 |
| Office | Office visual 2D, department explorer, employee directory, employee profile | 14, 15, 16, 17; the Executive Office rooms 24 (Quality Center, with Night Shift) and 25 (Optimization Center) |
| Work | Task Board, My approvals, Activity feed, Agent runs, Messages, Conversation detail | 20, 22, 23, 21, 19, 18 |
| Commerce | Shops, Policies, Orders, Order detail, Fulfillment, Customers | 3 (shops and policies), 4, 5, 6; customers inside 5 and 34 |
| Products | Discovery, Candidate review, Catalog, Listing editor, Assets, Price, Supplier quotes | 7, 8, 9, 10, 11 (assets and images), 13 (price), 12 |
| Finance | Revenue, P&L, Fees, AI costs, Ledger, Exports | 33 (revenue, P&L, fees, ledger, exports), 32 (AI costs) |
| Marketing | Listings performance, SEO recommendations, Campaigns, Tests | 35 |
| Customer Service | Tickets, Ticket conversation, Templates, Returns approvals | 34 |
| System | Automation Center, Workflow detail, Execution log, AI Tool Registry, MCP connectors | 26, 27, 28, 29 (with MCP connectors) |
| AI Operations | Decision Advisor, Model Router, Per-employee routing, Cost limits, Evaluations | 30, 31 (per-employee routing, evaluations), 32 (cost limits) |
| Engineering | Incident Center, Debugger, GitHub PRs, Deployments, Tests, Infrastructure health | 36 (incidents, debugger), 37 (PRs, deployments, tests, infrastructure health) |
| Mail | Team inbox, Threads, Compose, Templates, Sending approvals, Agent aliases | 38, 39 |
| Admin | Users, Roles, Shops, Integrations, Secrets refs, Audit, Notifications, Settings | 41, 42, 40, 43 |

The [navigation map](NAVIGATION_MAP.md) shows how each platform presents these groups.

## 3. Screen matrix

Phase links: [3](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-03-design-system-web-shell.md) · [4](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-04-durable-core-order-intake.md) · [5](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-05-tasks-messages-approvals.md) · [6](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-06-workforce-claude-runtime.md) · [7](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-07-pilot-office.md) · [8](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-08-models-tools.md) · [9](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-09-etsy-connection.md) · [10](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-10-fulfillment-incidents.md) · [11](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-11-listing-health.md) · [12](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-12-product-studio.md) · [13](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-13-procurement-finance.md) · [14](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-14-governance.md) · [15](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-15-mail-support.md) · [16](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-16-web-office.md) · [17](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-17-android.md) · [18](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-18-windows.md) · [19](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-19-engineering.md) · [21](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/phases/phase-21-growth-scale.md)

"Web" names the phase that first builds the screen, then the Phase 16 slice that completes it to the state contract. "—" on Android means WEB/WIN.

| # | Screen | Group | Priority | Stage | Web | Android | Windows |
|---|---|---|---|---|---|---|---|
| 1 | Welcome & Sign-in | Authentication | ALL | UX1 | 3 (3.5, 3.9) → 16.4 | 17.3 | 18.3 |
| 2 | Executive Dashboard | Home | ALL | UX1 | 7 (basic) → 16.4 | 17.7 | 18.6 |
| 3 | Shop Selector & Settings | Commerce | ALL | UX1 | 3 (3.7), 9 → 16.4 | 17.4, 17.8 | 18.6 |
| 4 | Order Queue | Commerce | ALL | UX1 | 4, 9 → 16.4 | 17.8 | 18.5 |
| 5 | Order Detail | Commerce | ALL | UX1 | 4, 10 → 16.4 | 17.8 | 18.5 |
| 6 | Fulfillment Watch | Commerce | ALL | UX1 | 10 → 16.4 | 17.8 | 18.6 |
| 7 | Product Discovery | Products | WEB/WIN | UX4 | 7 (research results), 12 → 16.9 | — | 18.6 |
| 8 | Product Candidate Detail | Products | ALL | UX4 | 12 → 16.9 | 17.8 | 18.6 |
| 9 | Catalog Explorer | Products | ALL | UX4 | 12 → 16.9 | 17.8 | 18.6 |
| 10 | Listing Workspace | Products | WEB/WIN | UX4 | 11, 12 → 16.9 | — | 18.5 |
| 11 | Creative Studio | Products | WEB/WIN | UX4 | 12 → 16.9 | — | 18.6 |
| 12 | Supplier Quotes | Products | ALL | UX4 | 13 → 16.9 | 17.8 | 18.6 |
| 13 | Pricing & Profitability | Products | ALL | UX4 | 13 → 16.9 | 17.8 | 18.5 |
| 14 | Virtual Office 2D | Office | ALL | UX2 | 16.5 (design from 7) | 17.7 | 18.6 |
| 15 | Department Detail | Office | ALL | UX2 | 16.5 | 17.7 | 18.6 |
| 16 | Employee Directory | Office | ALL | UX2 | 6 → 16.5 | 17.7 | 18.6 |
| 17 | Employee Profile | Office | ALL | UX2 | 16.6 | 17.7 (read only) | 18.6 |
| 18 | Employee Chat | Work | ALL | UX2 | 15 (Lia) → 16.7 | 17.7 | 18.5 |
| 19 | Inter-employee Messenger | Work | WEB/WIN | UX2 | 16.7 | — | 18.5 |
| 20 | Task Board | Work | ALL | UX2 | 5 → 16.7 | 17.7 | 18.6 |
| 21 | Task Detail & Agent Runs | Work | ALL | UX2 | 5, 6 → 16.7 | 17.7 | 18.6, 18.7 |
| 22 | Approvals Center | Work | ALL | UX2 | 5 → 16.7 | 17.4, 17.5 | 18.3, 18.6 |
| 23 | Activity Feed | Work | ALL | UX2 | 5 → 16.7 | 17.7 | 18.6 |
| 24 | Quality Center | Office | ALL | UX3 | 7 (pilot), 14 → 16.8 | 17.8 | 18.6 |
| 25 | Optimization Center | Office | ALL | UX3 | 7 (pilot), 14 → 16.8 | 17.8 | 18.6 |
| 26 | Automation Center | System | ALL | UX3 | 16.8 | 17.8 | 18.6 |
| 27 | Workflow Detail | System | WEB/WIN | UX3 | 16.8 | — | 18.6 |
| 28 | Automation Execution Log | System | ALL | UX3 | 16.8 | 17.8 | 18.6 |
| 29 | AI Tools Registry | System | WEB/WIN | UX3 | 8 → 16.8 | — | 18.6 |
| 30 | Decision Advisor / Jev | AI Operations | WEB/WIN | UX3 | 8 → 16.8 | — | 18.6 |
| 31 | Model Router Console | AI Operations | WEB/WIN | UX3 | 8 → 16.8 | — | 18.6 |
| 32 | AI Cost & Quota Dashboard | AI Operations | ALL | UX3 | 8 → 16.8 | 17.8 | 18.6 |
| 33 | Finance & P&L | Finance | ALL | UX4 | 13 → 16.9 | 17.8 | 18.5 |
| 34 | Customer Service | Customer Service | ALL | UX4 | 15 → 16.9 | 17.8 | 18.6 |
| 35 | Marketing Analytics | Marketing | ALL | UX4 | 16.9 (read only); actions 21 | 17.8 | 18.6 |
| 36 | Incident & Debugging Center | Engineering | ALL | UX5 | 10 → 16.10 | 17.7 | 18.5, 18.7 |
| 37 | Engineering & Deployments | Engineering | WEB/WIN | UX5 | 16.10 (read only); actions 19 | — | 18.7 |
| 38 | Mail Inbox / Outbox | Mail | ALL | UX5 | 15 → 16.10 | 17.8 | 18.6 |
| 39 | Agent Mail Alias Manager | Mail | WEB/WIN | UX5 | 15 → 16.10 | — | 18.6 |
| 40 | Notifications | Admin | ALL | UX5 | 16.10 (web push) | 17.6, 17.8 | 18.8 |
| 41 | Admin / Integrations | Admin | WEB/WIN | UX5 | 3 (3.9), 9 → 16.10 | — | 18.6 |
| 42 | Audit & Compliance | Admin | WEB/WIN | UX5 | 3 (3.9 audit view) → 16.10 | — | 18.6 |
| 43 | Preferences / Offline / Error | Admin | ALL | UX1 | 3 (3.3) → 16.4 | 17.8, 17.9 | 18.6 |

Totals: 31 ALL, 12 WEB/WIN. Check this table against what each phase really delivered at the kickoff of Phase 16 (slice 16.1 turns it into the automated screen-matrix harness).

## 4. Screens

### 1 · Welcome & Sign-in

- **Group:** Authentication · **Priority:** ALL · **Stage:** UX1 · **Phases:** web 3 (3.5 BFF authentication, 3.9 sessions) → 16.4; Android 17.3; Windows 18.3.
- **Purpose:** get a person into HTCO safely and let them see and end their sessions.
- **Data and actions:** welcome, sign in with email and password (or the OAuth path chosen by the native sign-in ADR in Phase 17), MFA enrolment and verification, recovery (second factor or owner-assisted reset), authorized session list with revoke; `users`, `web_sessions`, `device_keys`.
- **Roles:** everyone for their own account and sessions.
- **Components:** `Input`, `PasswordField`, `Button`, `Dialog` (revoke), `Toast`.
- **States:** no empty state; offline disables sign-in with the reason.
- **Rules:** the owner cannot reach an owner-only screen without MFA (`aal2`). Errors never reveal whether an account exists. The web holds only the `__Host-` session cookie, never a token in JavaScript storage; Android keeps tokens in Keystore-protected storage, Windows in Credential Locker or DPAPI. Revoking a session signs the other device out on its next request.

### 2 · Executive Dashboard

- **Group:** Home · **Priority:** ALL · **Stage:** UX1 · **Phases:** web 7 (basic office dashboard) → 16.4; Android 17.7 (Home); Windows 18.6.
- **Purpose:** in one look, how the shops and the office are doing and what needs the owner.
- **Data and actions:** shop KPIs, net profit (verified and estimated), urgent approvals, shop health, the employees' daily brief from Maya's office review; `orders`, `financial_entries`, `approvals`, `incidents`, `daily_operations_reports`, `activity_records`.
- **Roles:** all roles, S.
- **Components:** `MetricCard`, `ChartContainer`, `ApprovalCard`, `IncidentCard`, `EmployeeCard`, `AgentStatus`, `ActivityLogRow`.
- **States:** empty for a new organization is "Connect your first shop" for the owner; offline shows the cached non-sensitive summary with its age (Android 17.9).
- **Rules:** every figure links to its records. Estimated figures are labelled. The daily brief lists its sources; a missing source is named, never filled in. Amber only on items that wait for the user.

### 3 · Shop Selector & Settings

- **Group:** Commerce (Shops, Policies) · **Priority:** ALL · **Stage:** UX1 · **Phases:** web 3 (3.7 shops), 9 (connection and sync health) → 16.4; Android 17.4 (switcher), 17.8; Windows 18.6.
- **Purpose:** choose the shop context and see each shop's connection, policies and budgets.
- **Data and actions:** shops with marketplace connection health, SKU policy, Etsy connectivity and sync drifts, store-scoped budgets; connect or disconnect a shop; `shops`, `shop_integrations`, `shop_capabilities`, `sync_drifts`, `budgets`, `policies`.
- **Roles:** view S for all roles; connect or disconnect Owner MFA RA; budgets Owner MFA RA.
- **Components:** `ShopSwitcher`, `ConnectivityIndicator`, `Badge`, `PolicyChip`, `CostChart` (budget meter), `Dialog`.
- **States:** empty is "Connect your first shop" (Owner) or "No shop granted yet" (others).
- **Rules:** only granted shops are listed. Changing the shop changes the URL scope (`/shops/{id}/…`); one screen never mixes two shops. A broken connection is said in words. Budget changes are versioned and audited.

### 4 · Order Queue

- **Group:** Commerce · **Priority:** ALL · **Stage:** UX1 · **Phases:** web 4 (recorded fixtures), 9 (live orders) → 16.4; Android 17.8; Windows 18.5 (Orders split pane, dense grid).
- **Purpose:** find and triage orders.
- **Data and actions:** orders with payment and fulfillment statuses, filters (shop, status, date, SLA), safe actions (retry an allowlisted sync, request a bulk re-sync, which creates an approval); `orders`, `order_items`, `shipments`.
- **Roles:** view S for all roles (Viewer masked); retry sync Owner, Admin, Operations S, Developer S.
- **Components:** `OrderRow`, `FilterChips`, `SearchField`, `DateRangePicker`, `Pagination`, `StatusDot`, `Ltr`.
- **States:** empty distinguishes "no orders yet" from "no orders match these filters".
- **Rules:** receipt numbers are monospace and left-to-right. A webhook delivered three times is one order (mandatory test 1). Buyer details are masked unless the role may see them.

### 5 · Order Detail

- **Group:** Commerce · **Priority:** ALL · **Stage:** UX1 · **Phases:** web 4, 10 (tracking and incidents) → 16.4; Android 17.8; Windows 18.5.
- **Purpose:** the whole truth about one order, with proof.
- **Data and actions:** timeline, variations and quantities, customer, tracking, Etsy and AutoVA sync proof, linked incidents and audit; confirm a shipment write to Etsy (approval); `orders`, `order_items`, `order_status_events`, `shipments`, `tracking_events`, `customers`, `incidents`.
- **Roles:** view S (Viewer masked); buyer contact Owner, Admin, Operations S, Support S; shipment write Owner and Admin MFA RA, Operations S as an approval.
- **Components:** `OrderTimeline`, `Tabs`, `IncidentCard`, `ApprovalCard`, `AuditPopover`, `Ltr`.
- **States:** a deleted or cross-shop order shows the no-permission state, never another shop's data.
- **Rules:** duplicate deliveries show as one step ("received 3 times, ingested once"). Tracking that already exists on Etsy is shown with its source and is never sent twice (mandatory test 10). Every step names its source and links its record.

### 6 · Fulfillment Watch

- **Group:** Commerce (Fulfillment) · **Priority:** ALL · **Stage:** UX1 · **Phases:** web 10 → 16.4; Android 17.8; Windows 18.6.
- **Purpose:** catch late or broken fulfillment before the buyer does.
- **Data and actions:** SLA windows, supplier mapping, shipment exceptions, Eitan's inspector findings, AutoVA Fulfillment Watch and Tracking Sync executions; open the order or the incident; `sla_policies`, `shipments`, `tracking_events`, `incidents`, `automation_executions`.
- **Roles:** view S for all roles; open or update incidents Owner, Admin, Operations S, Support S, Developer S.
- **Components:** `OrderRow`, `StatusDot`, `IncidentCard`, `EmployeeCard` (Eitan), `AutomationExecutionRow`, `FilterChips`.
- **States:** empty is "All orders within their SLA", with the time of the last check.
- **Rules:** one late or missing tracking raises one incident; it closes automatically only on evidence. Findings link their evidence.

### 7 · Product Discovery

- **Group:** Products · **Priority:** WEB/WIN · **Stage:** UX4 · **Phases:** web 7 (Shon's research results in the pilot), 12 → 16.9; Windows 18.6.
- **Purpose:** see product opportunities and the evidence behind them.
- **Data and actions:** research opportunities, sources, candidates waiting for review; assign research to Shon (through Maya or a task); `product_candidates`, `product_sources`, `business_tasks`.
- **Roles:** Owner, Admin, Operations S.
- **Components:** `ProductTile`, `TaskCard`, `ToolResult`, `EmployeeCard` (Shon), `FilterChips`, `Badge`.
- **States:** empty offers "Ask Shon to research" when the user may create the task.
- **Rules:** every opportunity carries its sources; web content is labelled untrusted. Nothing here publishes.

### 8 · Product Candidate Detail

- **Group:** Products · **Priority:** ALL · **Stage:** UX4 · **Phases:** web 12 → 16.9; Android 17.8; Windows 18.6.
- **Purpose:** decide whether a candidate becomes a product.
- **Data and actions:** status `APPROVED`, `REVIEW` or `REJECTED`, policy references (Etsy marketplace and dropshipping rules), vendor evidence, images; approve or reject through an approval; `product_candidates`, `product_sources`, `approvals`.
- **Roles:** view Owner, Admin, Operations S; decide per the approval's risk level.
- **Components:** `ApprovalCard` (web, Windows), `ApprovalSheet` (Android), `PolicyChip`, `StatusTimeline`, `CatalogAssetGrid`, `ToolResult`.
- **Rules:** a candidate that breaks a platform rule is blocked and shows why; nothing is published (mandatory test 11).

### 9 · Catalog Explorer

- **Group:** Products (Catalog) · **Priority:** ALL · **Stage:** UX4 · **Phases:** web 12 → 16.9; Android 17.8 (read only); Windows 18.6.
- **Purpose:** browse the catalog and how it maps to each shop's listings.
- **Data and actions:** products, variants, SKUs, shop listing mappings, version history; open a listing; `products`, `product_facts`, `listings`.
- **Roles:** view S for all roles; enter or edit product facts Owner, Admin, Operations S.
- **Components:** `ProductTile`, `Tabs`, `StatusTimeline`, `CatalogAssetGrid`, `Ltr`.
- **Rules:** SKUs are monospace and left-to-right. Version history comes from records, newest first.

### 10 · Listing Workspace

- **Group:** Products (Listing editor) · **Priority:** WEB/WIN · **Stage:** UX4 · **Phases:** web 11 (Listing Health), 12 → 16.9; Windows 18.5 (Listings split pane).
- **Purpose:** improve a listing and see it published.
- **Data and actions:** SEO, images, prices, approvals, published status; Daniel's and Noam's proposed fixes; propose a change; `listings`, `listing_audits`, `approvals`.
- **Roles:** Owner, Admin, Operations S; run a Listing Health audit Owner and Admin MFA, Operations S.
- **Components:** `Tabs`, `Input`, `CatalogAssetGrid`, `PolicyChip`, `ApprovalCard`, `StatusDot`, `EmployeeCard`.
- **Rules:** edits are proposals; they reach Etsy only after approval and show the published state from the sync, not from the click. Only Approved assets can be used. A price below the margin floor is blocked with the reason.

### 11 · Creative Studio

- **Group:** Products (Assets) · **Priority:** WEB/WIN · **Stage:** UX4 · **Phases:** web 12 (image adapter from 8) → 16.9; Windows 18.6.
- **Purpose:** Nika's studio: briefs and generated or edited images with their provenance.
- **Data and actions:** Nika's briefs, GPT image generations, input image records, results, licensing and rights check, provenance, cost, review status, safe variants; request a variant, approve or reject an asset; `asset_provenance`, `agent_runs`, `tool_invocations`, `approvals`.
- **Roles:** Owner, Admin, Operations S.
- **Components:** `CatalogAssetGrid`, `EmployeeCard` (Nika), `ToolResult`, `BillingModeBadge`, `ApprovalCard`, `Badge`.
- **Rules:** image generation appears only here, reached through Nika; the image engine is a tool, never shown as staff. Every new asset starts as **Needs QA** with provenance, price and permissions (mandatory test 8).

### 12 · Supplier Quotes

- **Group:** Products (Supplier quotes) · **Priority:** ALL · **Stage:** UX4 · **Phases:** web 13 → 16.9; Android 17.8; Windows 18.6.
- **Purpose:** compare supplier quotes and approve mappings.
- **Data and actions:** quotes, supplier mapping, expiry, price discrepancies, approval; Tom's follow-ups (Supplier Quote Request & Follow-up executions); `quote_requests`, `approvals`, `automation_executions`.
- **Roles:** Owner, Admin, Operations S, Finance S (read).
- **Components:** `Tabs`, `Badge`, `StatusDot`, `ApprovalCard`, `ApprovalSheet`, `EmployeeCard` (Tom), `AutomationExecutionRow`, `Ltr`.
- **Rules:** a mapping becomes active only after approval. Expired quotes are labelled and cannot be approved. No payment action exists here.

### 13 · Pricing & Profitability

- **Group:** Products (Price), linked from Finance · **Priority:** ALL · **Stage:** UX4 · **Phases:** web 13 → 16.9; Android 17.8; Windows 18.5 (Profitability split pane).
- **Purpose:** see the margin of each product and how it moves with costs.
- **Data and actions:** fees, shipping, VAT and tax assumptions, margin floor, sensitivity; propose a price change (approval); `financial_entries`, `products`, `listings`, `policies`.
- **Roles:** Owner and Admin MFA, Finance S MFA, Operations S (without ledger detail).
- **Components:** `MetricCard`, `ChartContainer`, `PolicyChip` (margin floor), `Badge` (Verified, Estimated), `Ltr`.
- **Rules:** every assumption shows its source and date. Estimates are never shown as verified.

### 14 · Virtual Office 2D

- **Group:** Office · **Priority:** ALL · **Stage:** UX2 · **Phases:** web 16.5 (design may start in 7); Android 17.7 (department list first, compact map only within the performance budget); Windows 18.6.
- **Purpose:** the living office: who works on what, right now, from records.
- **Data and actions:** employees grouped by department, actual run status, assignments, handoffs in progress, service wings; open a room, a desk or a service; `departments`, `employees`, `business_tasks`, `task_executions`, `agent_runs`, `worker_heartbeats`.
- **Roles:** Owner, Admin, Operations S, Finance S, Developer S (view the office).
- **Components:** `OfficeMap`, `DepartmentCard`, `EmployeeCard`, `AgentAvatar`, `AgentStatus`, `ConnectivityIndicator`.
- **States:** worker offline: every employee `OFFLINE`, the office read-only.
- **Rules:** [section 5](#5-office-2d).

### 15 · Department Detail

- **Group:** Office · **Priority:** ALL · **Stage:** UX2 · **Phases:** web 16.5; Android 17.7; Windows 18.6.
- **Purpose:** one department: its people, its work and how it is doing.
- **Data and actions:** people, responsibility, tasks, service KPIs, conversations and handoffs; open an employee, task or thread; `departments`, `employees`, `business_tasks`, `employee_messages`.
- **Roles:** as screen 14.
- **Components:** `DepartmentCard`, `EmployeeCard`, `TaskCard`, `MetricCard`, `MessageThread`, `Tabs`.
- **Rules:** the three service departments (Automations, AI Tools, Infrastructure) open a service view: dashboards, services and workflows (links to 26, 29 and the infrastructure health of 37), never employee avatars.

### 16 · Employee Directory

- **Group:** Office · **Priority:** ALL · **Stage:** UX2 · **Phases:** web 6 (workforce directory) → 16.5; Android 17.7; Windows 18.6.
- **Purpose:** all sixteen employees in one list.
- **Data and actions:** the 16 employee cards with name, title, role, department, readiness, state and current task; filter and search; `employees`, `employee_profile_versions`, `agent_runs`.
- **Roles:** as screen 14.
- **Components:** `EmployeeCard`, `AgentStatus`, `Badge` (Draft, Ready), `FilterChips`, `SearchField`.
- **Rules:** exactly sixteen employees in seven departments. A `draft` employee shows Draft and is never shown working. Jev is not in the directory (shared service, screen 30).

### 17 · Employee Profile

- **Group:** Office · **Priority:** ALL · **Stage:** UX2 · **Phases:** web 16.6; Android 17.7 (read only); Windows 18.6.
- **Purpose:** everything about one employee: what it is for, what it may do, what it did and what it cost.
- **Data and actions:** mission, skills, tools, permissions, allowed models, budget, history in thirteen tabs ([section 6](#6-employee-profile)); propose a profile change; `employees`, `employee_profile_versions`, `business_tasks`, `employee_messages`, `agent_runs`, `tool_invocations`, `evaluation_runs`, `agent_memory`, `routing_decisions`, cost records.
- **Roles:** view as screen 14; propose changes Owner MFA RA (model policies, budgets, kill switches).
- **Components:** `EmployeeProfileHeader` (planned), `Tabs`, `AgentStatus`, `BillingModeBadge`, `PolicyChip`, `ModelSelector`, `RoutingTrace`, `CostChart`, `TaskCard`, `MessageThread`, `ActivityLogRow`, `ApprovalCard`.
- **Rules:** [section 6](#6-employee-profile).

### 18 · Employee Chat

- **Group:** Work (Messages, Conversation detail) · **Priority:** ALL · **Stage:** UX2 · **Phases:** web 15 (Lia) → 16.7; Android 17.7; Windows 18.5 (Agent conversations split pane).
- **Purpose:** talk to an employee and get work done with receipts.
- **Data and actions:** text, structured attachments, scoped access, tool results, task links; send a message, open a task, decide an approval in place; `employee_messages`, `agent_threads`, `tool_invocations`, `business_tasks`.
- **Roles:** Owner, Admin, Operations S (per employee grants).
- **Components:** `MessageThread`, `ToolResult`, `TaskCard`, `Avatar`, `AgentAvatar`, `ApprovalCard`.
- **States:** composer disabled with the reason when the employee is offline or a draft, or the user lacks the capability.
- **Rules:** chat is a view over the HTCO message bus, not a direct connection to a Claude session. Chat content is untrusted and never grants tools. No model reasoning is shown, only results and receipts.

### 19 · Inter-employee Messenger

- **Group:** Work (Messages) · **Priority:** WEB/WIN · **Stage:** UX2 · **Phases:** web 16.7 (messages recorded from 5); Windows 18.5.
- **Purpose:** see how employees hand work to each other.
- **Data and actions:** employee-to-employee, employee-to-department and employee-to-task threads, delivery and acknowledgement, handoffs, task references; `employee_messages`, `business_tasks`.
- **Roles:** Owner, Admin, Operations S, Developer S.
- **Components:** `MessageThread`, `TaskCard`, `ActivityLogRow`, `StatusDot`.
- **Rules:** each handoff links exactly one message (`message_id`) and one task transition. Delivery states (Sent, Delivered, Acknowledged) come from the message record. Nothing crosses shops (mandatory test 4).

### 20 · Task Board

- **Group:** Work · **Priority:** ALL · **Stage:** UX2 · **Phases:** web 5 → 16.7 (board, list with SLA, timeline); Android 17.7 (list and filters); Windows 18.6.
- **Purpose:** all work in one place, whoever owns it.
- **Data and actions:** kanban and list views, deadlines, priority, owner (person, employee or automation), shop, evidence; filter; open a task; `business_tasks`.
- **Roles:** view S for all roles.
- **Components:** `TaskBoard`, `TaskCard`, `FilterChips`, `Avatar`, `AgentAvatar`.
- **Rules:** a task is Done only with evidence, and the card says which. No drag and drop for tasks owned by employees or automations.

### 21 · Task Detail & Agent Runs

- **Group:** Work (Agent runs) · **Priority:** ALL · **Stage:** UX2 · **Phases:** web 5, 6 → 16.7; Android 17.7; Windows 18.6 (engineering parts in the Developer Console, 18.7).
- **Purpose:** what happened in a task, step by step, and what it cost.
- **Data and actions:** stages and events, agent runs with trace, routing, tool calls, cost and billing mode, evidence, resume history; `business_tasks`, `task_executions`, `agent_runs`, `tool_invocations`, `routing_decisions`, `employee_messages`.
- **Roles:** view S for all roles; sessions, routing and traces Owner, Admin, Operations S, Developer S.
- **Components:** `StatusTimeline`, `AgentStatus`, `RoutingTrace`, `ToolResult`, `BillingModeBadge`, `ActivityLogRow`, `ApprovalCard`, `MessageThread`.
- **Rules:** a step that died and resumed shows the lease expiry and the resume, with no duplicate action (mandatory test 2). A provider outage or 429 shows `WAITING_EXTERNAL` in words (mandatory test 3). Traces are masked; no chain of thought.

### 22 · Approvals Center

- **Group:** Work (My approvals) · **Priority:** ALL · **Stage:** UX2 · **Phases:** web 5 → 16.7; Android 17.4 (floating approvals), 17.5 (biometric step-up); Windows 18.3 (Windows Hello), 18.6.
- **Purpose:** decide risky business changes and technical releases with their reasons.
- **Data and actions:** pending and decided approvals with requester (person or employee), action, before and after, cost, risk, evidence and expiry; approve or reject; `approvals`, audit records.
- **Roles:** view S for all roles; low-risk decisions Owner and Admin MFA, Operations S MFA, Finance S MFA; high-risk (money, refunds, publishing scope, permissions, high-risk customer messages, production deployment) Owner MFA RA.
- **Components:** `ApprovalCard`, `ApprovalSheet` (Android), `AuditPopover`, `Badge`.
- **States:** expired or already decided approvals cannot be decided; the button is disabled and the server refuses anyway.
- **Rules:** approving from a conversation, this screen or a push uses the same server re-authorization and records the same approval. The result shows only after the server confirms it.

### 23 · Activity Feed

- **Group:** Work · **Priority:** ALL · **Stage:** UX2 · **Phases:** web 5 → 16.7; Android 17.7; Windows 18.6.
- **Purpose:** what happened, by whom, when, from the records.
- **Data and actions:** auditable business events by time, shop, actor (person, employee, automation, system) and task; filter by actor, department, shop, task, kind and time; `activity_records`.
- **Roles:** view S for all roles.
- **Components:** `ActivityLogRow`, `FilterChips`, `DateRangePicker`, `Avatar`, `AgentAvatar`.
- **Rules:** answers "what did Shon do today" from records (FR-AUD-05). Every row links its authoritative record and ID.

### 24 · Quality Center

- **Group:** Office (Executive Office) · **Priority:** ALL · **Stage:** UX3 · **Phases:** web 7 (Noa's pilot finding), 14 (full scope, Night Shift) → 16.8; Android 17.8; Windows 18.6.
- **Purpose:** Noa's audit of whether the office really did what it says.
- **Data and actions:** findings about critical activity completeness, missing events, data integrity, reconciliation issues, unfinished jobs, SLA and verification; the Night Shift page (unfinished work, resumed jobs, the night report); assign or verify a finding; `quality_findings`, `reconciliation_runs`, `daily_operations_reports`.
- **Roles:** Owner, Admin, Operations S, Developer S.
- **Components:** `EmployeeCard` (Noa), `Badge` (severity), `StatusDot`, `TaskCard`, `ActivityLogRow`, `AuditPopover`.
- **Rules:** [section 7](#7-automations-supervisor-and-optimizer).

### 25 · Optimization Center

- **Group:** Office (Executive Office) · **Priority:** ALL · **Stage:** UX3 · **Phases:** web 7 (Omer's first proposal), 14 (full pipeline) → 16.8; Android 17.8; Windows 18.6.
- **Purpose:** Omer's ideas to make the office cheaper or better, and whether they worked.
- **Data and actions:** ideas, baseline, experiment, pull request link, realized savings, previous actual cost and quality; approve a proposal; `optimization_proposals`, `engineering_requests`, cost records.
- **Roles:** Owner, Admin, Operations S, Developer S; approve Owner.
- **Components:** `ProposalCard` (planned), `StatusTimeline`, `MetricCard`, `ChartContainer`, `ApprovalCard`, `EmployeeCard` (Omer).
- **Rules:** [section 7](#7-automations-supervisor-and-optimizer).

### 26 · Automation Center

- **Group:** System · **Priority:** ALL · **Stage:** UX3 · **Phases:** web 16.8 (registry and executions from 4); Android 17.8; Windows 18.6.
- **Purpose:** every deterministic workflow, its health and its last runs.
- **Data and actions:** workflow registry, schedules, active flows, last execution; test in sandbox, pause, retry a safe run, disable, open the definition change in a pull request; `automation_definitions`, `automation_executions`.
- **Roles:** view Owner, Admin, Operations S, Finance S, Developer S; actions per capability.
- **Components:** `AutomationRow`, `AutomationExecutionRow`, `StatusDot`, `Badge`, `Dialog`.
- **Rules:** [section 7](#7-automations-supervisor-and-optimizer). Never a "Run" action for a caller without the capability.

### 27 · Workflow Detail

- **Group:** System · **Priority:** WEB/WIN · **Stage:** UX3 · **Phases:** web 16.8; Windows 18.6.
- **Purpose:** one workflow's contract and behaviour.
- **Data and actions:** trigger and input/output schema, side effects, idempotency, retry and backoff, error handling, owner, permissions, SLO, latest executions, errors, version history and change review; `automation_definitions`, `automation_executions`.
- **Roles:** as screen 26.
- **Components:** `Tabs`, `AutomationExecutionRow`, `PolicyChip`, `StatusTimeline`, `MetricCard`, `Ltr`.
- **Rules:** the definition is edited only through a pull request; the screen links it and shows the review.

### 28 · Automation Execution Log

- **Group:** System (Execution log) · **Priority:** ALL · **Stage:** UX3 · **Phases:** web 16.8 (executions recorded from 4); Android 17.8; Windows 18.6.
- **Purpose:** every run of every workflow, with its keys.
- **Data and actions:** trigger ID, idempotency key, attempt, outcome, trace; filter; retry a safe run; `automation_executions`.
- **Roles:** as screen 26.
- **Components:** `AutomationExecutionRow`, `FilterChips`, `DateRangePicker`, `Pagination`, `AuditPopover`.
- **Rules:** state words from the execution state machine; IDs and keys monospace, left-to-right and selectable.

### 29 · AI Tools Registry

- **Group:** System (AI Tool Registry, MCP connectors) · **Priority:** WEB/WIN · **Stage:** UX3 · **Phases:** web 8 → 16.8; Windows 18.6.
- **Purpose:** the tools employees can use, who may use them and whether they are healthy.
- **Data and actions:** tools and MCP connectors, permissions per employee, version, health, test results; run a sandbox test; `tool_definitions`, `tool_invocations`.
- **Roles:** Owner, Admin, Operations S, Developer S.
- **Components:** `ToolBadge` (planned), `PolicyChip`, `StatusDot`, `Badge`, `Tabs`.
- **Rules:** grants are read-only here; they change through a versioned, approved profile or registry pull request.

### 30 · Decision Advisor / Jev

- **Group:** AI Operations · **Priority:** WEB/WIN · **Stage:** UX3 · **Phases:** web 8 → 16.8; Windows 18.6.
- **Purpose:** how Jev, the shared Decision Advisor, performs and where it is used.
- **Data and actions:** schema, provider availability, gold dataset accuracy, evaluation results, decision history and traces, overrides, cost, fallback and policy; Safe Disable; `decision_advisors`, `decision_records`, `evaluation_runs`.
- **Roles:** view Owner, Admin, Operations S, Developer S; Safe Disable Owner MFA RA.
- **Components:** `RoutingTrace`, `MetricCard`, `ChartContainer`, `CostChart`, `StatusDot`, `Dialog`.
- **Rules:** Jev is a shared service tile, never an employee and never a decision authority. A failure or invalid schema shows the rules or fallback answer that was used, with no bypass (mandatory test 7).

### 31 · Model Router Console

- **Group:** AI Operations (Model Router, per-employee routing, evaluations) · **Priority:** WEB/WIN · **Stage:** UX3 · **Phases:** web 8 → 16.8; Windows 18.6.
- **Purpose:** which model each employee may use and why each run used the one it did.
- **Data and actions:** the model catalog, per-employee routing policies, candidate models, budget, evaluations, routing decisions; propose a policy change; `model_catalog`, `routing_decisions`, `employee_profile_versions`, `evaluation_runs`.
- **Roles:** view Owner, Admin, Operations S, Developer S; propose Owner MFA RA.
- **Components:** `ModelSelector`, `RoutingTrace`, `RoutingDecisionRow` (planned), `PolicyChip`, `CostChart`, `BillingModeBadge`.
- **Rules:** [section 8](#8-models-tools-budgets-and-the-decision-advisor). A routing change needs a versioned approval and evaluations (mandatory test 12).

### 32 · AI Cost & Quota Dashboard

- **Group:** AI Operations (Cost limits), linked from Finance (AI costs) · **Priority:** ALL · **Stage:** UX3 · **Phases:** web 8 → 16.8; Android 17.8; Windows 18.6.
- **Purpose:** what the AI work costs, against which limits, and what happens at the limit.
- **Data and actions:** API usage and cost, credits, limits and budgets, fallbacks, subscription status (informational); edit budgets; `agent_runs` (with `billing_mode`), `budgets`, cost records.
- **Roles:** view Owner, Admin, Operations S, Finance S, Developer S; edit budgets Owner MFA RA.
- **Components:** `CostChart`, `MetricCard`, `BillingModeBadge`, `ChartContainer`, `Badge`.
- **Rules:** API cost, credits and subscription usage are separate figures; subscription usage never gets an invented per-token cost. At the limit tasks wait or use an approved fallback, and automations continue; the screen says so.

### 33 · Finance & P&L

- **Group:** Finance · **Priority:** ALL · **Stage:** UX4 · **Phases:** web 13 → 16.9; Android 17.8; Windows 18.5.
- **Purpose:** revenue, costs and profit, verified against the ledger.
- **Data and actions:** gross and net, fees, line items, ledger, reconciliations, AI costs, export CSV; `financial_entries`, `payouts`, `reconciliation_runs`.
- **Roles:** Owner and Admin MFA, Finance S MFA.
- **Components:** `MetricCard`, `ChartContainer`, `Badge` (Verified, Estimated), `Tabs`, `DateRangePicker`, `Button`.
- **Rules:** no sale is counted twice (cross-checked with reconciliation records). Verified and estimated figures are labelled. Exports are audited.

### 34 · Customer Service

- **Group:** Customer Service · **Priority:** ALL · **Stage:** UX4 · **Phases:** web 15 → 16.9; Android 17.8 (Inbox tab); Windows 18.6.
- **Purpose:** buyer tickets answered well and on time.
- **Data and actions:** tickets, ticket conversation, Dana's drafted replies, templates, escalations, returns and refunds approvals; approve a reply, escalate; `support_tickets`, `email_threads`, `approvals`.
- **Roles:** Owner, Admin, Operations S, Support S; refunds Owner MFA RA.
- **Components:** `MessageThread`, `ApprovalCard`, `ApprovalSheet`, `EmployeeCard` (Dana), `PolicyChip`, `Badge`.
- **Rules:** drafted replies and high-risk customer messages need approval; refunds always need approval. Buyer details are masked unless the role may see them. Untrusted mail content is labelled.

### 35 · Marketing Analytics

- **Group:** Marketing · **Priority:** ALL · **Stage:** UX4 · **Phases:** web 16.9 (read only, on Product Metrics Rollup from 14); actions with Gal in 21; Android 17.8; Windows 18.6.
- **Purpose:** how listings perform and what to try next.
- **Data and actions:** listings performance, SEO recommendations, campaigns, tests, conversion indicators; `product_sales_counters`, `listings`, product metrics rollups.
- **Roles:** Owner, Admin, Operations S.
- **Components:** `MetricCard`, `ChartContainer`, `FilterChips`, `Badge`.
- **Rules:** read only until Phase 21. Policy-compliant use only: no mailing list is built from Etsy buyer emails without permission and consent.

### 36 · Incident & Debugging Center

- **Group:** Engineering (Incident Center, Debugger) · **Priority:** ALL · **Stage:** UX5 · **Phases:** web 10 → 16.10; Android 17.7 (Home: open incidents); Windows 18.5 (Incidents split pane), 18.7.
- **Purpose:** what broke, who owns it, and proof that it is fixed.
- **Data and actions:** alerts, ownership, root cause analysis, remediation, verification; open or update an incident, approve a sensitive fix; `incidents`, `debug_reports`, `system_alerts`.
- **Roles:** view S for all roles; update Owner, Admin, Operations S, Support S, Developer S.
- **Components:** `IncidentCard`, `StatusTimeline`, `ApprovalCard`, `AuditPopover`, `EmployeeCard` (Eitan, Amir).
- **Rules:** one issue raises one incident; it resolves only on evidence. Traces are masked.

### 37 · Engineering & Deployments

- **Group:** Engineering (GitHub PRs, Deployments, Tests, Infrastructure health) · **Priority:** WEB/WIN · **Stage:** UX5 · **Phases:** web 16.10 (read only); actions in 19; Windows 18.7 (Developer Console).
- **Purpose:** the state of the code, the releases and the infrastructure.
- **Data and actions:** GitHub issues, branches, pull requests, CI runs, staged diffs, approvals, releases, deployments, infrastructure health and monitoring; release-gate approvals (Phase 19); `engineering_requests`, `approvals`, `worker_heartbeats`, `system_alerts`.
- **Roles:** Owner, Admin, Developer S.
- **Components:** `Tabs`, `StatusDot`, `Badge`, `ApprovalCard`, `ActivityLogRow`, `Ltr`.
- **Rules:** no shell, no command box and no production command; any action is an API call through the policy engine with step-up and audit (mandatory test 9).

### 38 · Mail Inbox / Outbox

- **Group:** Mail · **Priority:** ALL · **Stage:** UX5 · **Phases:** web 15 → 16.10; Android 17.8 (Inbox tab: read, approve drafted sends); Windows 18.6.
- **Purpose:** the shared mailboxes, with proof of what was sent.
- **Data and actions:** support and info mail, threads, compose drafts, templates, sending approvals, attachments, delivery proof and failures, spam and injection flags, provider health; `email_threads`, `email_delivery_events`, `approvals`.
- **Roles:** Owner, Admin, Support S, Operations S.
- **Components:** `MessageThread`, `ApprovalCard`, `ApprovalSheet`, `Badge`, `StatusDot`, `Ltr`.
- **Rules:** [section 9](#9-mail).

### 39 · Agent Mail Alias Manager

- **Group:** Mail (Agent aliases) · **Priority:** WEB/WIN · **Stage:** UX5 · **Phases:** web 15 → 16.10; Windows 18.6.
- **Purpose:** plan and control the per-employee mail aliases.
- **Data and actions:** future `<employee-slug>@agents.ht-co.app` mappings (for example Shon's), restrictions, delegation, routing; propose a change; `agent_mail_aliases`, `email_domains`.
- **Roles:** Owner, Admin MFA.
- **Components:** `EmployeeCard`, `PolicyChip`, `Badge`, `ApprovalCard`.
- **Rules:** [section 9](#9-mail). An alias never grants access to data.

### 40 · Notifications

- **Group:** Admin (Notifications) · **Priority:** ALL · **Stage:** UX5 · **Phases:** web 16.10 (web push with consent); Android 17.6 (push), 17.8; Windows 18.8.
- **Purpose:** what needs the user, in order of urgency.
- **Data and actions:** push and in-app notifications, urgent tasks, health, approvals required from the owner; preferences per severity and shop; open the exact item; `notifications`, `notification_preferences`.
- **Roles:** everyone, for their own notifications, S.
- **Components:** `Tabs`, `FilterChips`, `Badge`, `ApprovalCard`, `IncidentCard`, `Toast`.
- **Rules:** payloads carry IDs, type and a generic title, never customer PII. A deep link opens the exact item after authentication. Push subscriptions are removed on logout.

### 41 · Admin / Integrations

- **Group:** Admin (Users, Roles, Shops, Integrations, Secrets refs) · **Priority:** WEB/WIN · **Stage:** UX5 · **Phases:** web 3 (3.9 users, roles, shop access), 9 (integrations) → 16.10; Windows 18.6.
- **Purpose:** who can do what, and which external systems are connected.
- **Data and actions:** users and roles, shop access, external connections and their health, secret references, policies; invite, change role, grant a shop; `users`, `memberships`, `shop_access`, `shop_integrations`, `service_identities`, `policies`.
- **Roles:** Owner and Admin MFA.
- **Components:** `Tabs`, `Select`, `Dialog`, `PolicyChip`, `Badge`, `ConnectivityIndicator`.
- **Rules:** secrets appear only as references (name, scope, last rotated), never values. Admin permission is never inferred from a name or email alias. Every change is audited.

### 42 · Audit & Compliance

- **Group:** Admin (Audit) · **Priority:** WEB/WIN · **Stage:** UX5 · **Phases:** web 3 (3.9 audit view) → 16.10; Windows 18.6.
- **Purpose:** the append-only record of who did what, and the compliance tasks on it.
- **Data and actions:** append-only events, policy decisions, exports, retention, data subject requests; filter and export; audit log, `activity_records`.
- **Roles:** Owner, Admin, Developer S.
- **Components:** `ActivityLogRow`, `AuditPopover`, `PolicyChip`, `FilterChips`, `DateRangePicker`, `Button`.
- **Rules:** nothing can be edited or deleted here. Exports need the permission and are themselves audited. PII is masked by default.

### 43 · Preferences / Offline / Error

- **Group:** Admin (Settings) · **Priority:** ALL · **Stage:** UX1 · **Phases:** web 3 (3.3 settings, offline and stale banners) → 16.4; Android 17.8, 17.9 (offline read); Windows 18.6.
- **Purpose:** the user's preferences, and the shared templates for empty, error, slow and offline.
- **Data and actions:** language (Hebrew, English), theme (system, light, dark), density, accessibility (reduced motion), notification preferences link; the empty, error, slow and offline templates every screen uses.
- **Roles:** everyone, for themselves.
- **Components:** `Select`, `Tabs`, `RetryBanner`, `ErrorState`, `EmptyState`, `ConnectivityIndicator`, `Toast`.
- **Rules:** theme follows the system until the user chooses. Language switch sets `lang` and `dir`. Density defaults to compact for Windows tables. Offline: only non-sensitive summaries, labelled with the last sync time; writes disabled.

## 5. Office 2D

From specification §5; built on the web in slice 16.5, on Android in 17.7, on Windows in 18.6. Component: [`OfficeMap`](../../design/COMPONENT_SPEC.md#officemap).

- **Rooms.** One building with a room per people department: Executive Office (Maya, Lia, Noa, Omer), Product Studio (Shon, Daniel, Noam, Nika), Procurement & Finance (Tom, Roni), Order Assurance (Eitan), Marketing (Gal), Customer Support (Dana), Engineering (Alex, Amir, Iris). Hierarchy: Owner → Maya → departments.
- **Rooms show work.** Each room shows current work, handoffs in progress and its KPIs. Each employee tile opens the employee profile (screen 17).
- **Three service wings, not people.** Automations, AI Tools and Infrastructure are drawn as service wings with dashboards, services and workflows, never with avatars or desks.
- **Jev tile.** Jev (Decision Advisor) is a shared expert service tile in the AI Tools wing, linked to screen 30; never a desk, never staff.
- **Nika's studio.** GPT image generation is reached through Nika's desk and her Creative Studio (screen 11); no extra invented paid AI staff.
- **Eight real statuses.** `IDLE`, `QUEUED`, `RUNNING`, `WAITING_EXTERNAL`, `WAITING_APPROVAL`, `BLOCKED`, `FAILED`, `OFFLINE`, derived on the server from task runs and the task state machine, with a link to the run they came from. Never computed on the client, never a cartoon. `WAITING_APPROVAL` is the only amber state; a provider quota or 429 is `WAITING_EXTERNAL` in words. A `draft` employee is never shown working. When the agent worker is offline every employee shows `OFFLINE` and the office is read-only.
- **Motion.** Smooth and subtle, only for recorded events; off under reduced motion; within a performance budget (60 fps on Windows, NFR-PERF-02).
- **List alternative.** A list with the same statuses, assignments and links is one click away, is the default for screen readers and on narrow screens, and is the first view on Android. An automated test compares the list with the 2D view.

## 6. Employee profile

From specification §6; screen 17, web slice 16.6.

**Tabs (13):** Overview · Responsibilities · Tasks · Conversations · Agent Sessions · Skills & Tools & Automations · Knowledge · Memory · Model Router · Permissions · Evaluations · Cost & Usage · History.

- The header shows the profile version in use, its evaluation result, its runtime, its readiness and its `AgentStatus`.
- **Edits never apply in place.** Saving creates a proposed profile version that goes through the reviewed registry path and a policy approval; the running version stays until both complete.
- **Billing mode.** A `BillingModeBadge` shows how runs were paid (API, credits; a subscription mode only where legally and technically supported, per ADR-0017), with data provenance. There is no control that switches billing mode, anywhere.
- Memory and Agent Sessions show business summaries and receipts, never model reasoning.
- Permissions show `PolicyChip`s (allowed, needs approval, denied); Model Router shows the employee's policy with provenance, budget and fallback.

**Conversations.** Four kinds: user → employee, employee → employee, employee → department, employee → task. Structured attachments, delivery status and receipts. Every handoff creates a `message_id` and a task transition. Chat is a view over the HTCO message bus, not a direct, sync-only dependency on Claude.

## 7. Automations, supervisor and optimizer

From specification §7; screens 24–28.

- **Automation Center (26):** list, test in sandbox, pause, view the last execution, retry a safe run, edit the definition in a pull request, version history and change review.
- **Workflow spec (27):** every workflow shows trigger, input and output schema, idempotency, retry and backoff, error handling, owner, permissions and SLO.
- **No "Run" without capability.** A run, retry, pause or disable control is never shown to a caller who lacks the capability, and the server refuses it anyway.
- **Quality Center (24):** Noa's audit of critical activity completeness, reconciliation issues and unfinished jobs. Every finding has proof, severity, owner, deadline and a verified resolution. Noa audits CRM and system records, not text summaries of chats (mandatory test 5). The **Night Shift** page shows unfinished work, resumed jobs and the night report.
- **Optimization Center (25):** Omer's pipeline Detected → Proposed → Evaluated → Approved → Development → Tested → Deployed → Measuring → Verified or Rolled back, with the previous actual cost and quality beside each proposal and links to the GitHub implementation and post-release metrics (mandatory test 6).

## 8. Models, tools, budgets and the Decision Advisor

From specification §8; screens 11, 29–32.

- **Central model catalog (31):** provider, verified ID, capability, price with its as-of date, quality benchmark, latency, data class, status. No free-text model IDs; unverified models are disabled with the reason. Model IDs and prices are never hard-coded in clients.
- **Per-employee routing (31, 17):** permitted providers, policy version, quality threshold, per-task budget, fallback chain, risk and approval requirements, provider status and deployment state.
- **Routing trace (21, 31):** explains the choice, the fallback and the actual cost; never the model's chain of thought.
- **Jev Decision Advisor (30):** schema, provider availability, gold dataset accuracy, decision history, overrides and Safe Disable.
- **Nika Creative Studio (11):** GPT image generation with prompt brief, input image records, result, licensing check, provenance, cost and review status.
- **Quota and billing panel (32):** actual API cost separate from informational personal subscription usage; never an invented per-token economy for subscription sessions when the provider does not expose reliable billing metadata.

## 9. Mail

From specification §9; screens 38 and 39, built in Phase 15.

- `support@office.ht-co.app`, `info@office.ht-co.app` and `noreply@office.ht-co.app` through one managed inbound and outbound provider, preserving the inbound webhook and threading.
- Later, `shon@agents.ht-co.app` and other `<employee-slug>@agents.ht-co.app` as **virtual aliases**: no sixteen servers or mailboxes. A sender address never grants access to data; an email identity maps to the employee's service identity and capabilities.
- Screens: Inbox, Outbox, Draft compose, Templates, Approval queue, Agent mail routing, Attachments, Delivery failures, Spam and injection flags, Provider health.
- `office.ht-co.app` and `agents.ht-co.app` are reserved for mail DNS (MX, SPF, DKIM, DMARC); the application office lives at `app.ht-co.app/office` to avoid CNAME conflicts.
- No mailing list is built from Etsy buyer emails without the allowed permission and consent.
- Mail content is untrusted: an email with prompt injection never makes an employee call a protected tool (mandatory test 14); flagged mail is labelled in the inbox.

## 10. Security rules for the UI

From specification §11; they apply to every screen and platform.

- The UI calls only typed API contracts. It never holds or shows Anthropic, OpenAI or Jev provider secrets, Etsy tokens, the Supabase `service_role` key or private runtime tokens.
- Owner MFA. Web sessions in Secure, HttpOnly cookies (BFF). Windows: DPAPI or Credential Locker. Android: Keystore and OAuth PKCE. Explicit session management (screen 1).
- Shop-scoped RBAC and RLS, with capability checks in the backend. Admin permission is never inferred from names or email aliases.
- Approval required for money, refunds, publishing scope changes, high-risk customer messages, production deployment and permission changes; step-up for the critical ones (biometrics on Android, Windows Hello on Windows, TOTP on the web).
- Realtime channels filtered per organization and shop, with replay protection, reconnect, deduplication and out-of-order handling. No state comes only from the stream.
- Event retention and PII rules, data subject requests, attachment scanning before opening, prompt-injection handling, anti-XSS and CSRF, and security and UX tests per platform.
- Notifications carry no customer PII; the user authenticates before any critical action from a notification.

## 11. Release stages

From specification §12, mapped to master plan 3.0.

| Stage | Deliverables | Exit criteria | Phases |
|---|---|---|---|
| DS0 | Brand tokens, cross-platform component inventory, navigation IA and clickthrough; this document | Design review approved | 3 (slice 3.10) |
| UX1 | Auth, Home, Shops, Orders, CRM read views (screens 1–6, 43) | Real API, auth and errors | Built in 3, 4, 7, 9, 10; audited in 16.4 |
| UX2 | Office 2D, directory, employee profiles, task and inter-agent chats (14–23) | Live state and accessible fallback | Built in 5, 6, 7, 15; completed in 16.5–16.7 |
| UX3 | Automation, AI Tool Registry, Supervisor, Optimizer, Quota and Router pages (24–32) | Real executions and audit links | Built in 7, 8, 14; completed in 16.8 |
| UX4 | Catalog, images, pricing, finance, support and marketing (7–13, 33–35) | End-to-end domain policies | Built in 11, 12, 13, 15; completed in 16.9 |
| UX5 | Mail, engineering, mobile push, full Windows and Android parity (36–42, push) | Platform QA and security | 15, 16.10, 17, 18; engineering actions 19 |
| UX6 | Accessibility, RTL/LTR, performance, release and runbooks | All acceptance tests pass | Checked per screen in 16–18; finished in 20 |

## 12. UI acceptance and anti-omission checklist

From specification §13. Each item is an automated test or a recorded manual check; on the web it is acceptance criterion AC-16.12.x of Phase 16, and parity is re-checked in Phases 17 and 18.

| # | Item | Where |
|---|---|---|
| 1 | All 16 employees and 7 people departments appear, with the correct hierarchy | 14, 15, 16 |
| 2 | The three service departments are visibly distinct from people | 14, 15 |
| 3 | GPT image capability appears in Nika's studio; Jev appears in the Decision Advisor and router screens; neither is shown with policy authority | 11, 30, 31 |
| 4 | Supervisor Noa audits CRM activity, not only text summaries of chats | 24 |
| 5 | Optimizer Omer's proposals link to the GitHub implementation and post-release metrics | 25 |
| 6 | Every agent action, automation execution, critical email, approval and audit event shown has its ID, authoritative record and link | 21, 22, 23, 28, 38, 42 |
| 7 | The router displays each employee's policy with provenance, budget and fallback | 17, 31 |
| 8 | Subscription usage shown only where legally and technically supported; API cost and credits separate | 17, 32 |
| 9 | Push links support mobile Approve and Reject with authentication and audit | 22, 40 |
| 10 | Layout adapts to Windows, Android and web without duplicating domain logic | all |
| 11 | Office 2D has an accessible list alternative | 14 |
| 12 | All business screens have empty, error, permission, loading and offline states | all |
| 13 | Role access by shop is enforced in the backend, not only by hidden buttons | all |
| 14 | Inbound and outbound email and the later per-agent alias domain have planned screens and DNS | 38, 39 |
| 15 | No duplicated Etsy shipment update or double-counted sale | 4, 5, 33 |

## Mobbin inspiration

Patterns studied for the version 2 components. HTCO borrows the pattern, not the look (navy ground, turquoise for the system at work, amber only when the owner is needed).

| Reference | Pattern taken | Used in |
|---|---|---|
| [Browserbase · agent run](https://mobbin.com/screens/38e3e1bc-2a5c-4f7b-aa64-00ab6f736224) | A run as an ordered list of steps beside its result, each step with status and timing | `ToolResult`, `RoutingTrace`; screen 21 |
| [Lindy · tool steps](https://mobbin.com/screens/9f4affd5-f387-4149-860e-95c83f9bbba5) | Tool calls shown inline in a conversation as collapsible steps with their outcome | `ToolResult` inside `MessageThread`; screens 18, 19 |
| [Tana · agent thread](https://mobbin.com/screens/254e49a0-cf54-4a7c-8206-c706a58c6346) | An agent conversation that carries structured object cards instead of plain text | `MessageThread` attachments; screens 18, 19, 34 |
| [n8n · executions](https://mobbin.com/screens/6947469e-9c8c-4644-8cae-56a1250195da) | Execution list with status, start time, duration and retry, filterable per workflow | `AutomationExecutionRow`; screens 26, 27, 28 |
| [Databricks · run events](https://mobbin.com/screens/3b1e2801-5c47-4730-a7f6-f7875ce7aeb1) | A time-ordered event log of one run, each event with its time and source | `OrderTimeline`, `StatusTimeline`; screens 5, 21, 36 |
| [Gumloop · command palette](https://mobbin.com/screens/97f3400e-39b6-469b-b208-addb2d51e850) | A command palette with grouped results (go to, records, actions) and a key footer | `CommandPalette`; every web and Windows screen |
| [OpenAI Platform · usage](https://mobbin.com/screens/b781c7ac-618d-4946-9ef2-808f6f933d71) | Spend over time with a budget bar and a breakdown table | `CostChart`; screens 17, 32 |
