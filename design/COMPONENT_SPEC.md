# Component Specification

All 58 HTCO components: the 38 of version 1, and 20 added in version 2 for the Claude-Native edition ([below](#version-2-components-claude-native-edition)). Four version 1 office components remain planned (Phase 17): DepartmentCard is now designed in version 2, AutomationRow is superseded by AutomationExecutionRow and RoutingDecisionRow by RoutingTrace; EmployeeProfileHeader, ProposalCard and ToolBadge stay planned. Live previews in both themes for the 38: [HTCO design system](https://claude.ai/artifact/Bgq6rDafP6qyXiJBCsq8nf); planned components get previews when they are designed. Implementations: web components in `apps/web/src/shared/ui/` (Phase 3), Compose in `apps/android/core/designsystem/` (Phase 17), WinUI in `apps/windows/HTCO.Presentation/Controls/` (Phase 18).

Actors follow the office model of [platform ADR-0012](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0012-living-office-organization.md): people (users), 16 AI employees with permanent names and titles in seven departments, deterministic automations, Jev as a shared Decision Advisor, and the system. Tools are capabilities, never actors. Every office component shows only recorded activity from the API.

Each implementation must cover, per component: every variant and size listed here; default, hover, focus, pressed, disabled, loading and error states where they apply; light and dark; left-to-right and right-to-left; an accessible name and keyboard or touch behaviour; and screenshot tests for he/en × light/dark.

## Index

| Group | Components |
|---|---|
| Actions | [Button](#button), [IconButton](#iconbutton) |
| Forms | [DateRangePicker](#daterangepicker), [FilterChips](#filterchips), [Input](#input), [PasswordField](#passwordfield), [SearchField](#searchfield), [Select](#select) |
| Navigation | [BottomBar](#bottombar), [NavigationRail](#navigationrail), [Pagination](#pagination), [Sidebar](#sidebar), [Tabs](#tabs), [TopBar](#topbar) |
| Status | [Badge](#badge), [ConnectivityIndicator](#connectivityindicator), [StatusDot](#statusdot), [StatusTimeline](#statustimeline) |
| Data | [ActivityLogRow](#activitylogrow), [ChartContainer](#chartcontainer), [Ltr](#ltr), [MetricCard](#metriccard), [OrderRow](#orderrow), [ProductTile](#producttile) |
| Workforce | [AgentAvatar](#agentavatar), [AgentCard](#agentcard) (superseded by EmployeeCard), [TaskBoard](#taskboard) |
| Office & runtime (v2) | [AgentStatus](#agentstatus), [Avatar](#avatar), [EmployeeCard](#employeecard), [DepartmentCard](#departmentcard-1), [TaskCard](#taskcard), [MessageThread](#messagethread), [ToolResult](#toolresult), [PolicyChip](#policychip), [RoutingTrace](#routingtrace), [ModelSelector](#modelselector), [BillingModeBadge](#billingmodebadge), [AutomationExecutionRow](#automationexecutionrow), [OfficeMap](#officemap) |
| Navigation, data, decisions (v2) | [AppShell](#appshell), [CommandPalette](#commandpalette), [ShopSwitcher](#shopswitcher), [OrderTimeline](#ordertimeline), [CostChart](#costchart), [CatalogAssetGrid](#catalogassetgrid), [ApprovalSheet](#approvalsheet) |
| Office (planned, Phase 16) | [AutomationRow](#automationrow), [DepartmentCard](#departmentcard), [EmployeeProfileHeader](#employeeprofileheader), [ProposalCard](#proposalcard), [RoutingDecisionRow](#routingdecisionrow), [ToolBadge](#toolbadge) |
| Decisions | [ApprovalCard](#approvalcard), [AuditPopover](#auditpopover), [IncidentCard](#incidentcard), [PermissionGate](#permissiongate) |
| Feedback | [EmptyState](#emptystate), [ErrorState](#errorstate), [RetryBanner](#retrybanner), [Skeleton](#skeleton), [Toast](#toast) |
| Overlays | [BottomSheet](#bottomsheet), [Dialog](#dialog) |

## Actions

### Button

Use a button for an action the user takes now; one primary button per view, for the thing the screen exists to do.

#### Variants
- **primary** — `action-primary-bg` with `action-primary-fg`: a navy ink capsule in the light theme, turquoise in the dark theme.
- **secondary** — `action-secondary-*`: outlined, for supporting actions.
- **ghost** — for low-emphasis actions inside toolbars and tables.
- **danger** — `action-danger-*`: only for destructive actions, always behind a confirmation.

#### Sizes
`sm` 32 px (dense tables, Windows), `md` 40 px (default), `lg` 48 px (touch, Android primary actions).

#### Rules
- Label with a verb in sentence case: "Approve fix", "Connect shop". Hebrew buttons use the gender-neutral infinitive: "לאשר תיקון".
- Loading keeps the label and adds a spinner; the button stays the same width.
- Disabled buttons explain why nearby (helper text or tooltip); never disable silently.
- Focus shows the `border-focus` ring, 2 px with a 2 px offset.

#### Consumer provides
Label, variant, size, `onClick`/command, `disabled` and `loading` state, an accessible name for icon-only use (use IconButton instead).

### IconButton

A square button that shows only an icon, for frequent, recognizable actions in toolbars and headers.

#### Rules
- Always has an accessible name (`aria-label`, `AutomationProperties.Name`, `contentDescription`).
- Use the amber attention dot only when something needs the user (unread approvals), never for general unread counts.
- Sizes: 32 px in dense bars, 40 px default, 48 px touch target on Android.
- Pair with a tooltip on web and Windows.

#### Consumer provides
Icon, accessible name, action, optional `needsAttention`.

## Forms

### DateRangePicker

Choose a date range for dashboards and reports, with presets first.

#### Rules
- Presets: Today, Last 7 days, Last 30 days, This month, Custom.
- Ranges are inclusive and shown in the user's time zone; the API receives UTC.
- Week starts on Sunday for Hebrew, Monday for English (configurable).

### FilterChips

Active filters on a list, each removable, plus a chip to add one.

#### Rules
- A chip states the filter and its value ("Status: No tracking").
- Removing a chip updates the list and the URL; "Clear all" appears after two or more chips.

### Input

A single-line text field with a visible label above it.

#### Rules
- Label always visible; placeholder is an example, never the label.
- Border uses `border-control` (≥ 3:1 against the surface); errors switch to `danger-dot` and add a message with an icon, not colour alone.
- Helper text in `text-muted`, 12 px.
- Codes (SKU, tracking number, email) render LTR inside RTL layouts.

#### Consumer provides
Label, value, change handler, validation message, helper text, input type and autocomplete hints.

### PasswordField

A password input with a reveal toggle, used on sign-in and re-authentication.

#### Rules
- The toggle has an accessible name that states the action ("Show password").
- Never pre-fill; allow password managers (`autocomplete="current-password"`).
- Errors never reveal whether the email exists ("Email or password is incorrect").

### SearchField

Search within the current list or the whole workspace.

#### Rules
- Leading search icon, placeholder names what is searched ("Search receipts, SKUs, tracking").
- Show the keyboard shortcut on web and Windows (`/` or `Ctrl K`).
- Results update after typing pauses (250 ms); never on every keystroke against the API.

### Select

Pick one value from a short list (up to about 12 options); longer lists use a searchable combobox.

#### Rules
- Shows the current value, never an empty field without a placeholder.
- Native on Android and Windows (Exposed dropdown, ComboBox); React Aria Select on the web.

## Navigation

### BottomBar

Primary navigation on phones: up to five destinations along the bottom edge.

#### Rules
- Intentional addition: the phone form of the Sidebar, referenced by the navigation map.
- Destinations: Overview, Approvals, Incidents, Orders, More. Labels are always visible.
- The current destination gets a `bg-selected` pill behind its icon; the amber dot only on a destination where something waits for the user.
- Touch targets at least 48 dp; respects the system gesture area.

### NavigationRail

Compact navigation for medium widths (tablets, narrow Windows windows): icons with short labels.

#### Rules
- Up to seven destinations; labels always visible.
- Selected item gets a `bg-selected` pill behind the icon.

### Pagination

Cursor-based paging for long lists.

#### Rules
- Shows the visible range and Previous / Next; no page numbers (the API is cursor-based).
- Keeps filters and sort in the URL so a page can be shared.

### Sidebar

Primary navigation on web and Windows: shop switcher, grouped destinations, counts that need attention.

#### Rules
- The current page is marked by `bg-selected` plus a 3 px `accent-fill` bar at the start edge (it moves to the right in RTL).
- Counts are plain muted numbers; only items that need the user get the amber dot.
- Collapses to a NavigationRail under 1200 px and to a bottom bar on phones.

### Tabs

Switch between views of the same object (order detail: Items, Timeline, Incidents, Audit).

#### Rules
- Intentional addition: not in the original component list, needed for object detail pages on all three platforms.
- The selected tab has a 2 px `accent-fill` underline; counts stay muted.

### TopBar

Page header: breadcrumbs, page title, global search, notifications and the user menu.

#### Rules
- Title in `title-sm`; breadcrumbs in `text-muted`.
- Notifications use the amber dot only when an approval or decision waits.

## Status

### Badge

A short label for a category or state attached to an item.

#### Tones
`neutral` (default), `accent` (live, synced), `attention` (needs you), `success`, `danger`. Each pairs a `*-subtle` background with its `*-text` colour, both themes at ≥ 4.5:1.

#### Rules
- One or two words. States that change over time use StatusDot instead.

### ConnectivityIndicator

Tells the user whether what they see is live, catching up, or stale.

#### Rules
- Live: turquoise dot. Reconnecting: muted dot plus "Reconnecting". Offline: hollow dot plus the age of the data.
- Never hide staleness: show "Last synced 14 min ago" with the source.

### StatusDot

The status language of HTCO: a small dot plus a word. Colour is never the only signal.

#### States
- running → `status-running` (turquoise, with a soft halo)
- needs you → `status-needs-you` (the amber dot, 10 px)
- waiting → `status-waiting` (muted)
- done → `status-done`
- failed or blocked → `status-failed`
- offline → hollow muted ring

#### Rules
- Intentional addition: the base of every state display (orders, employees, automations, tasks, incidents).
- The word is always present ("Running", "Needs you", "Waiting for AutoVA").

### StatusTimeline

The history of an order, task or incident: each step with time, actor and the source that proves it.

#### Rules
- Newest at the bottom for processes, at the top for activity feeds.
- Every step names its source ("Etsy webhook", "Reconciliation", "AutoVA via Etsy").
- Future steps are not drawn; the next expected step may appear as "Expected by …".

## Data

### ActivityLogRow

One entry in an activity feed or audit trail: when, who, what, and a link to the receipt. Each row is one recorded activity record from the API.

#### Actor kinds
- `user`: photo or initials on a neutral disc, with the person's name.
- `employee`: AgentAvatar (navy, turquoise initials) with name and title, "Noa · Quality & Operations Supervisor".
- `automation`: dashed neutral disc with a workflow glyph, with the automation's name.
- `advisor`: Jev's rounded-square service mark, labelled "Shared service".
- `system`: plain neutral disc, "System".

#### Rules
- The actor kind is always stated in words or a badge, not only by the disc's shape.
- Shows shop, task and severity where present; feeds filter by employee, shop, task and severity.
- The sentence is plain and specific ("Opened incident for receipt 3412987711: no tracking after 6 days").
- "Receipt" links open the action receipt: inputs, tool, changes, approval.

### ChartContainer

Frame for every chart: title, legend, the chart, and the source line.

#### Rules
- Series colours in order `dataviz-1` … `dataviz-5`; never more than five series.
- Axis labels and gridlines in `text-muted` and `border-subtle`.
- Footer states source, period and freshness; estimated values use a dashed line.
- Every chart has a table view for screen readers.

### Ltr

Keeps codes, numbers and amounts in left-to-right order inside right-to-left text.

#### Rules
- Intentional addition: a utility every platform needs because HTCO mixes Hebrew text with receipt numbers, tracking codes, SKUs, IDs, emails, URLs and money.
- Web: wrap the value in `<bdi dir="ltr">` (the `Ltr` component). Plain-text channels (notifications, CSV exports, emails): surround the value with Unicode FSI (U+2068) and PDI (U+2069).
- Android: `BidiFormatter.unicodeWrap` or the same isolates. Windows: a left-to-right `Run` or the same isolates.
- Codes also use the mono family; money uses the locale formatter before isolation.

### MetricCard

One KPI with its trend and, always, its source and freshness.

#### Rules
- Value in `display-sm` with tabular numbers; delta in `success-text` or `danger-text` with a sign and the comparison period.
- Footer names the source and age ("Etsy · 4 min ago"); estimated figures say "Estimated".
- Selecting a card opens the matching list, not a tooltip.

### OrderRow

A row in the orders table: receipt, buyer (masked by role), items, total, fulfillment state, tracking, last update.

#### Rules
- Receipt numbers and tracking codes are monospace and LTR in every language.
- Status is a StatusDot with a word; money uses tabular numbers with the currency.
- Buyer names are masked unless the role may see them.
- Row height 44 px (36 px compact on Windows); selected rows use `bg-selected`.

### ProductTile

A product or listing in a grid: image, title, price, listing state and Listing Health risk.

#### Rules
- Image shows the real product photo; placeholders use the neutral sunken surface with an icon, never stock imagery.
- Titles clamp at two lines; full title on hover or in detail.
- Listing Health risk appears as a Badge only when risk is medium or high.

## Workforce

### AgentAvatar

The mark of an AI employee: a navy disc with the employee's initials (from the first name, "MA" for Maya), never a photo, face or mascot. State shows around it.

#### States
- idle: plain disc · running: turquoise ring (`status-running`) · needs you: amber dot · offline: dashed hollow disc.

#### Variants
- **employee**: round navy disc, with a small "AI" badge when the title is not shown next to it.
- **advisor**: Jev, a rounded-square navy service mark with "Shared service" in its label and accessible name; never shown inside a department.

#### Rules
- Employees are navy discs; people use photos or initials on a neutral disc, so the two are never confused.
- State comes only from recorded activity; with no record the disc is idle, and when the agent worker is offline it is offline.
- Accessible name: name, title, "AI employee" and state ("Maya, General Manager, AI employee, running").

#### Consumer provides
Employee ID, name, title, state, size, optional `showTitle`.

### AgentCard

Superseded in version 2 by [EmployeeCard](#employeecard); kept here until the web implementation is renamed.

An AI employee in a department or office list: name and title, department, what it is doing, and what it costs today.

#### Rules
- Shows "Maya · General Manager" and the department. Jev appears only in the Decision & Model Observatory and in activity, never in a department list.
- State comes only from recorded activity; when the agent worker is offline, every card shows Offline. Readiness (`draft`, `ready`) shows as a Badge until the employee is activated.
- The current task links to the task; cost shows today's spend against the employee's daily cap.

### TaskBoard

Tasks by state: Queued, Running, Waiting for you, Done. The same tasks also appear as a list with SLA.

#### Rules
- Column headers carry the state's StatusDot and a count.
- Cards show title, owner (a person, or an employee disc with name and title), department, shop and SLA; handoffs between employees show on the task's timeline.
- No drag and drop for tasks owned by employees or automations (state changes come from the system).

## Office (planned, Phase 16)

Planned components for the office information architecture ([navigation map](../docs/ux/NAVIGATION_MAP.md)). They are specified here and designed, previewed and implemented in Phase 16.

### AutomationRow

Planned (Phase 16). One automation execution in the Automation Center: automation name and version, trigger, state, attempts and timing.

#### Rules
- State uses StatusDot with the execution's words: Pending, Running, Succeeded, Failed, Retry scheduled, Dead-lettered, Compensated, Cancelled.
- Shows attempts ("Attempt 2 of 5"), the trigger kind (event, schedule, employee, user, workflow) and who triggered it.
- The idempotency key and execution ID are monospace and LTR; a link opens the execution's activity records.
- Manual execution is a separate, permission-gated action with confirmation; the row never offers it to a user without the right role.

#### Consumer provides
Execution ID, automation name and version, state, attempt and maximum, trigger, start and finish times, link.

### DepartmentCard

Planned (Phase 16). One department in the Departments view: name, employees, current work and handoffs.

#### Rules
- Lists the department's employees as AgentAvatars with names; counts of open tasks, tasks waiting for the user and handoffs in progress come from the API.
- The amber dot only when something in the department waits for the user.
- Seven departments; Jev is never shown as a member.

#### Consumer provides
Department ID and name, employees, counts, link to the department profile.

### EmployeeProfileHeader

Planned (Phase 16). The top of an employee's profile: identity, state and the facts that bound the employee's work.

#### Rules
- Large AgentAvatar, name and title, department, state, autonomy level, readiness and profile version.
- Links to the profile's sections: activity, tools, skills, permissions, automations, sessions, memory summaries, model policy, evaluations.
- Shows only recorded facts; a draft profile says "Draft: not production-ready".

#### Consumer provides
Employee ID, name, title, department, state, autonomy, readiness, profile version.

### ProposalCard

Planned (Phase 16; filled from Phase 14). An optimization proposal: the problem, the measured baseline, the expected benefit and where it is in its lifecycle.

#### Rules
- Lifecycle state in words: Detected, Proposed, Evaluating, Approved, Rejected, In development, Testing, Deployed, Measuring, Verified, Rolled back.
- Baseline and expected benefit are numbers with units and period; after deployment the measured result sits next to them, labelled "Estimated" until verified.
- Names the proposer (Omer), the prioritizer (Maya) and the implementer; links the pull request when one exists.

#### Consumer provides
Proposal ID, title, state, baseline, expected benefit, measured result, people, links.

### RoutingDecisionRow

Planned (Phase 16). One model routing decision in the Decision & Model Observatory: which employee, which task, which tier and model, and why.

#### Rules
- Shows employee, task, routing policy version, chosen tier (including "No AI") and model, fallback used, cost and latency.
- Decision Advisor calls show the provider tried and the outcome (answered, rejected by schema, failed, fell back); never model reasoning.
- Model names and IDs are monospace and LTR.

#### Consumer provides
Decision ID, employee, task, policy version, tier, model, fallback, cost, latency, advisor attempts.

### ToolBadge

Planned (Phase 16). A tool as a detail of an action or a profile: name, version, risk and side-effect class.

#### Rules
- Name in monospace (`catalog.create_draft`) with "v1"; risk (low, medium, high, critical) and side effect (none, internal, external, financial) as words, not colour alone.
- Tools are never actors: no avatar, never the subject of a sentence.
- In the AI Tools Center the badge links to the tool's registry entry (status, capabilities, access controls, tests).

#### Consumer provides
Tool name, version, risk, side effect, optional link.

## Decisions

### ApprovalCard

A request for a human decision. It shows the exact action, its effect, the evidence and the risk, and expires.

#### Anatomy
Requester (employee disc with name and title, or automation) → action in plain words → before and after (diff, changed words marked with `accent-subtle`) → cost range → risk meter → evidence links → rollback → expiry → Reject / Approve.

#### Rules
- The amber dot marks it as waiting for the user; nothing else on the screen competes with it.
- Show raw parameters, not only the employee's summary; the server re-checks permissions, MFA and expiry on decision.
- High risk requires re-authentication before Approve is enabled.
- Screen readers read action, reason, impact and risk in that order.

### AuditPopover

Who did what and when, attached to any value or decision that has an audit trail.

#### Rules
- Shows actor, action, time, policy version and a link to the full receipt.
- Read-only: audit entries cannot be edited from any client.

### IncidentCard

A verified problem: severity, what is affected, the evidence, the proposed fix and its state.

#### Rules
- Severity label plus words; the incident resolves only on evidence, and the card says which evidence closed it.
- Proposed fixes say whether they are automatic (allowlisted), need approval, or need Engineering (an engineering request).

### PermissionGate

Replaces content the user may not see, explaining why and what to do. The API refuses the data anyway; this is only the honest UI for it.

#### Rules
- Name the missing permission in plain words; offer "Request access" when a request flow exists.
- Never render the hidden data and blur it.

## Feedback

### EmptyState

What a screen shows when there is nothing yet, and the one action that changes that.

#### Rules
- Explains why it is empty and what will appear; one primary action.
- Illustration is geometric (rings and a dot from the logo), never stock art.

### ErrorState

Shown when a screen cannot load. Explains, offers a retry, and gives the request ID for support.

#### Rules
- Plain cause when known ("Etsy is not responding"), never raw exception text.
- Request ID in monospace, selectable, so the owner can paste it to support or to Amir (Debugger & Reliability Engineer).

### RetryBanner

An inline notice that data could not refresh, with automatic retry and a manual option.

#### Rules
- Says what failed, what the system is doing, and how old the shown data is.
- "Retry now" is the only action; the banner disappears on success.

### Skeleton

Placeholder shapes while the first data loads.

#### Rules
- Mirrors the real layout; never longer than a few seconds before showing an error or empty state.
- The shimmer stops under reduced motion.
- Never used to hide stale data: stale data is shown with its age.

### Toast

Brief confirmation of a completed background action, with an undo or view link when useful.

#### Rules
- Intentional addition: needed for confirmations the backend has verified ("Fix applied on Etsy").
- Only for confirmed outcomes; errors that need action use a banner or the field itself.
- Polite live region; never steals focus; stays at least 6 s and pauses on hover.

## Overlays

### BottomSheet

Android's container for quick decisions and details over the current screen.

#### Rules
- Grabber, title, content, actions; actions are 48 px touch targets.
- Used for approval details on the phone; the full approval card content, never a summary only.

### Dialog

A focused decision that blocks the page until answered, mainly confirmations of destructive or external actions.

#### Rules
- Title states the action as a question; body states the consequence; buttons repeat the verb ("Disconnect shop").
- Focus moves into the dialog and returns to the trigger; Escape cancels.
- Not for approvals of employee or automation work: those use ApprovalCard in the approvals inbox.

## Version 2 components (Claude-Native edition)

Added on 2026-10-14 from the clients specification v6.0 inventory (§10) and its runtime status model (§5). Live previews in both themes: [HTCO design system](https://claude.ai/artifact/Bgq6rDafP6qyXiJBCsq8nf), version 9. Phase 3 slice 3.10 (DS0) closes with the owner's design review of these; each is implemented on a platform in the phase that first needs it ([SCREEN_SPEC](../docs/ux/SCREEN_SPEC.md)).

### Office & runtime

#### AgentStatus

The live state of an AI employee or a task run: one of eight runtime states, shown as a dot plus a word.

##### States (from task runs and the state machine, never animation)
| State | Dot | Word (en / he) |
|---|---|---|
| `IDLE` | waiting (muted) | Idle / פנוי |
| `QUEUED` | waiting + clock icon | Queued / בתור |
| `RUNNING` | running (turquoise with halo) | Running: what it does / פועל |
| `WAITING_EXTERNAL` | waiting | Waiting for AutoVA, Etsy, supplier, provider / ממתין ל… |
| `WAITING_APPROVAL` | needs you (amber) | Waiting for your approval / ממתין לאישורך |
| `BLOCKED` | failed | Blocked: reason / חסום: סיבה |
| `FAILED` | failed | Failed: reason, retry time / נכשל |
| `OFFLINE` | hollow ring | Offline · data from 14 min ago / לא מחובר |

##### Rules
- The word is always present; `BLOCKED` and `FAILED` share a dot, so their words must differ and name the reason.
- Amber only for `WAITING_APPROVAL`: a person is needed. A provider quota or 429 is `WAITING_EXTERNAL`, said in words, never amber.
- When the agent worker is offline, every employee shows `OFFLINE` and the office is read-only.
- Accessible name: name, state and detail ("Shon, running, researching garden lanterns").

##### Consumer provides
State, detail text, optional `since` time, optional link to the task run.

#### Avatar

A person: the owner or a team member. A photo, or initials on a neutral disc, so people are never confused with AI employees.

##### Rules
- Never the navy disc (that is the AI employee's AgentAvatar) and never the rounded-square service mark (Jev, service wings).
- Sizes 24, 32 and 48 px. Accessible name: the person's name and role.
- No status ring for people; presence is not tracked.

##### Consumer provides
Name, role, photo URL (optional), size.

#### EmployeeCard

One AI employee in the directory or a department: name and title, department, real state, current task and today's cost against the cap.

##### Rules
- Shows "Name · Title" (Maya · General Manager) and the department; never a face, photo or mascot.
- State is an AgentStatus from recorded task runs. Readiness (`Draft`, `Ready`) is a Badge until the employee is activated; a draft employee is never shown as working.
- The current task is a link; cost shows today's spend from `agent_runs` against the employee's daily cap, with a meter that turns `danger` only at 100%.
- The billing mode (BillingModeBadge) appears where cost appears.
- Jev never gets an EmployeeCard: it is a shared service.

##### Consumer provides
Employee ID, name, title, department, state and detail, readiness, current task link, cost today and cap, billing mode.

#### DepartmentCard

One department of the office: its people, the work in progress, what waits for you and the handoffs between employees.

##### Rules
- Seven people departments. The three service departments (Automations, AI Tools, Infrastructure) are drawn as service wings, never with employee discs.
- Counts come from the API: open tasks, waiting for you, handoffs in progress. The amber dot only when something in the department waits for the owner.
- Members are AgentAvatars with names; a person who is a member (a human operator) keeps a neutral avatar.

##### Consumer provides
Department ID and name, members with state, counts, link to the department page.

#### TaskCard

A business task as one card: what, who owns it, which shop, the SLA, its state and the evidence it closed with.

##### Rules
- Owner is a person (neutral avatar) or an employee (AgentAvatar with name); automations show their dashed mark.
- State is a StatusDot word from the task state machine; a task is `Done` only with evidence, and the card says which.
- Handoffs show the previous owner ("from Maya"). No drag and drop for tasks owned by employees or automations.
- IDs are monospace and left-to-right.

##### Consumer provides
Task ID, title, state, owner, department, shop, SLA or due time, evidence summary, handoff source, link.

#### MessageThread

A conversation in the office: owner to employee, employee to employee, employee to department, or a task thread. Every message is a stored `employee_messages` row with delivery receipts.

##### Rules
- Messages are a calm list, not chat bubbles: avatar, name and title, time, then the text. The owner's messages use a neutral avatar.
- Employees speak in the first person, factually, and attach receipts (ToolResult, links to tasks and records). No model reasoning is shown.
- A handoff shows as its own row with the task link; every handoff has a message ID and a task transition.
- Delivery state under the last message of a sender: Sent, Delivered, Acknowledged (from `ack_timestamp`).
- Attachments are typed records (an order, a listing, an image) with scope; files are scanned before they open.
- The composer is disabled with a reason when the employee is offline, a draft, or the user lacks the capability.

##### Consumer provides
Thread ID and kind, participants, messages (sender, time, text, attachments, tool results, delivery state), handoff rows, composer state.

#### ToolResult

One tool call inside a conversation, run or audit view: the tool and version, the policy decision, and the outcome with links to the records it changed.

##### Rules
- The tool name is monospace (`catalog.read`) with its version; tools are never the subject of a sentence and never get an avatar.
- Show the decision in words: Allowed, Waiting for approval (amber dot), Denied with the reason. A denied call shows what was refused and that it was recorded.
- Show results as records and links, never raw provider payloads or model reasoning. Untrusted content (web pages, email) is labelled as such.
- Collapsed by default in long threads; the header stays readable.

##### Consumer provides
Tool name and version, decision and reason, outcome summary, record links, duration and cost, invocation ID.

#### PolicyChip

A capability and what the employee's policy says about it: allowed, needs approval, or denied.

##### Rules
- The capability name is monospace; the decision is a word or an icon with an accessible name, never colour alone.
- Denied chips are dashed and muted. Needs-approval chips carry a lock icon, not amber (amber is for a waiting decision, not a rule).
- Used in employee profiles (Permissions tab), routing policies and tool registry rows. Read-only: changes go through a versioned, approved profile.

##### Consumer provides
Capability, decision (`allow`, `approval`, `deny`), optional limit text (for example "up to $50").

#### RoutingTrace

Why a task ran on a given model, step by step, following the router's decision order; never the model's reasoning.

##### Rules
- Steps follow the router: (1) no AI if possible, (2) security gate, (3) capability fit, (4) quality benchmark, (5) cost and latency, (6) fallback, (7) final quality check.
- The header names the employee, the routing policy version, the chosen runtime and model (monospace), the billing mode and the actual cost.
- Rejected candidates say why in a few words. Model IDs come from the catalog with their verified date.
- A Decision Advisor (Jev) step shows provider, schema result and fallback; Jev never appears as a decision authority.

##### Consumer provides
Decision ID, employee, policy version, steps (outcome, detail), chosen model, fallback chain, billing mode, reserved and actual cost.

#### ModelSelector

Choose which catalog models an employee's routing policy may use, with verified facts beside each option.

##### Rules
- Options come only from the model catalog; each shows provider, model reference (monospace), capability fit, price with its as-of date, benchmark score and status. No free-text model IDs.
- Unverified or unhealthy models are disabled with the reason.
- Selecting never applies a change: it proposes a new policy version that needs evaluation and approval (master plan test 12). The footer says so.
- The Claude runtime runs Anthropic models only; image models appear only for Nika's image tools.

##### Consumer provides
Employee, current policy version, catalog entries with verification data, selection, onPropose.

#### BillingModeBadge

Which billing mode paid for an agent run, from the run's record (ADR-0017), shown wherever cost or a run appears.

##### Modes
- **API**: `API_PRODUCTION`, the only mode for hosted runs.
- **API credits**: API usage paid from plan credits, where the provider reports it.
- **Dev subscription**: a developer's own interactive session; never on a product run, shown only in engineering views.
- **Approved subscription runtime**: off; shown as "Off" with the reason, never selectable.

##### Rules
- Neutral badges: billing is information, not a warning. No switching control anywhere: a mode changes only by policy and ADR.
- Hover or focus explains the mode and links to the cost record.

#### AutomationExecutionRow

One run of a deterministic workflow in the Automation Center or an execution log: which workflow and version, what triggered it, its state, attempts, timing and keys.

##### Rules
- State words from the execution state machine: Pending, Running, Succeeded, Failed, Retry scheduled, Dead-lettered, Compensated, Cancelled. Rows are never tinted red; the dot and word carry the state.
- Shows attempts ("2 of 5"), trigger kind (event, schedule, employee, user, workflow) and the actor that triggered it.
- Execution ID and idempotency key are monospace, left-to-right, selectable.
- "Retry safe run" appears only for callers with the capability and only for retryable states; there is never a "Run" action for a caller without it.

##### Consumer provides
Execution ID, automation name and version, state, attempt and maximum, trigger kind and actor, started and duration, idempotency key, canRetry, link.

#### OfficeMap

The 2D office: department rooms with their employees at their desks, real states, handoffs in progress, and the three service wings, with a list alternative for every view.

##### Rules
- Rooms: Executive Office, Product Studio, Procurement & Finance, Order Assurance, Marketing, Customer Support, Engineering. Service wings (Automations, AI Tools, Infrastructure) are dashed and show services, not people.
- Jev sits in the AI Tools wing as a shared-service mark, never at a desk. GPT image generation is reached through Nika's desk, not shown as staff.
- Desk states come only from task runs (AgentStatus). Motion is subtle and only for recorded events; under reduced motion it stops. When the worker is offline, every desk shows offline.
- Every room and desk is a link to its page. A list view with the same content is one click away and is the default for screen readers.

##### Consumer provides
Departments with members and states, counts, service summaries, worker connectivity, onOpen.

### Navigation (v2)

#### AppShell

The frame of every web and Windows screen: sidebar with shop switcher and grouped destinations, top bar with search, notifications and the user, and the page.

##### Rules
- Sidebar groups: Home; Work (Tasks, Approvals, Activity); Commerce (Orders, Products, Finance, Support); Office (Office, Departments, Employees, Conversations); System (Automations, AI Tools, Models, Engineering); Admin. Under 1200 px it becomes a NavigationRail; under 640 px a BottomBar.
- The connectivity indicator in the top bar says whether data is live; the office becomes read-only when the agent worker is offline.
- The amber dot appears only on destinations where something waits for the user.
- The page owns its title, one primary action and its states (loading, empty, error, stale, offline, no permission).

##### Consumer provides
Current destination, user, shop, counts that need the user, connectivity state, page content.

#### CommandPalette

Jump anywhere and run allowed actions from the keyboard (Ctrl K on web and Windows): pages, employees, orders, tasks and commands in groups.

##### Rules
- Groups in this order: Go to, Employees, Records (orders, tasks, incidents), Actions. Results are filtered by the user's permissions on the server; an action the user cannot run is never listed.
- Codes match exactly (receipt numbers, SKUs, task IDs) and render monospace and left-to-right.
- Actions with side effects open their normal confirmation or approval flow; the palette never executes them directly.
- Full keyboard support with a visible footer of keys; screen readers announce the active option.

##### Consumer provides
Query, grouped results with type, label, detail and target, active index, onSelect.

#### ShopSwitcher

Choose the shop context for every screen: each shop with its marketplace connection health and the user's role in it.

##### Rules
- Lists only shops the user is a member of (server-filtered). The current shop is marked with `bg-selected` and a check.
- Connection health is a dot plus words ("Connected · synced 2 min ago", "Reconnect needed"). A broken connection is said in words; amber only if a decision waits for the owner.
- Changing the shop changes the URL scope (`/shops/{id}/…`) and never mixes data from two shops on one screen.

##### Consumer provides
Shops (ID, name, marketplace, health, role), current shop, onSelect, link to Shops settings.

### Data (v2)

#### OrderTimeline

The life of one order as recorded facts: each step with its time, actor and the source that proves it, including sync proof from Etsy and AutoVA.

##### Rules
- Process order: oldest at the top. Each step names its source ("Etsy webhook", "Reconciliation", "AutoVA via Etsy") and links its record.
- Duplicate deliveries are shown as one step with a note ("received 3 times, ingested once"), never as three orders.
- Future steps are not drawn; the next expected step may appear as "Expected by …" in muted text.
- Receipt and tracking numbers are monospace and left-to-right.

##### Consumer provides
Order ID, steps (state, time, actor, source, record link, note), next expected step.

#### CostChart

AI spend over time against the budget, by employee, task kind or shop, with real API cost separated from credits and estimates.

##### Rules
- Bars in `dataviz-1`; estimated or unsettled days are dashed. The budget cap is a dashed line labelled with its value.
- A budget meter shows thresholds at 70% and 90% as ticks; it turns `danger` only past 100%, and the text says what happens (tasks wait, automations continue).
- API cost, API credits and personal development usage are separate figures; subscription usage never gets an invented per-token cost.
- Footer names the source (`agent_runs`, provider usage) and freshness; a table view exists for screen readers.

##### Consumer provides
Series (date, amount, settled), cap, month to date, breakdown rows, currency, source and freshness.

#### CatalogAssetGrid

The images of a product or listing with their provenance and review state, including images Nika generated or edited.

##### Rules
- Every asset shows its origin in words: Supplier photo, Owner upload, Generated by Nika, Edited by Nika. Generated and edited assets carry their provenance link (brief, inputs, provider, cost).
- New generated assets start as **Needs QA**; only Approved assets can be used in a listing. The rights check result is shown.
- Real product imagery only; placeholders use the sunken surface and an icon, never stock pictures.
- Each tile has alt text from the asset record; selection is keyboard-accessible.

##### Consumer provides
Assets (ID, thumbnail, origin, review state, rights check, provenance link, cost), selection, actions allowed.

### Decisions (v2)

#### ApprovalSheet

The phone form of an approval, opened from a push notification: the full ApprovalCard content in a bottom sheet, with a fast and authenticated Approve or Reject.

##### Rules
- Opens from a deep link after the user authenticates; never shows another shop's item. The notification itself carries no buyer data.
- Same order as ApprovalCard: requester, action, before and after, cost, risk, evidence, expiry. Never a summary only.
- High-risk approvals require biometric or device re-authentication before Approve is enabled; the button says so.
- Actions are 48 dp; Reject asks for an optional reason. The result is shown only after the server confirms it.

##### Consumer provides
Approval ID and content (as ApprovalCard), risk level, re-auth requirement, onApprove, onReject.
