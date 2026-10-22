# Component Specification

All 38 HTCO components, their purpose and rules, plus 6 planned office components (Phase 15) marked "Planned". Live previews in both themes for the 38: [HTCO design system](https://claude.ai/artifact/Bgq6rDafP6qyXiJBCsq8nf); planned components get previews when they are designed. Implementations: web components in `apps/web/src/shared/ui/` (Phase 3), Compose in `apps/android/core/designsystem/` (Phase 16), WinUI in `apps/windows/HTCO.Presentation/Controls/` (Phase 17).

Actors follow the office model of [platform ADR-0012](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0012-living-office-organization.md): people (users), 16 AI employees with permanent names and titles in seven departments, deterministic automations, Jev as a shared Decision Advisor, and the system. Tools are capabilities, never actors. Every office component shows only recorded activity from the API.

Each implementation must cover, per component: every variant and size listed here; default, hover, focus, pressed, disabled, loading and error states where they apply; light and dark; left-to-right and right-to-left; an accessible name and keyboard or touch behaviour; and screenshot tests for he/en × light/dark.

## Design 1C revision (2026-10-15)

The design language changed to Design 1C ([client ADR-0008](../docs/adr/0008-design-1c.md)), superseding the Relay rules below. Where they disagree, the brand book wins. Built on the web so far:

| Component | Design 1C rules |
|---|---|
| Button | Pills of 28, 32 or 40 px, 13 px regular; primary is the inverse (ink) fill; others outlined in `border.strong`, the outline darkens on hover; presses to 98% |
| Circle button | 40 px circle with a hairline (`.cb`): top bar actions, the sidebar toggle, the area icons; the current area is the inverse fill |
| Segmented (new) | A pill of exclusive options (a radio group): the language switch on the landing and sign-in pages, levels as one to three dots |
| Panel (new) | The floating surface of every screen: radius 22, `bg.panel`, `border.edge`, solid (glass is for the navigation and the top bar, round 3); a 56 px header with a 13 px title and a quiet meta line |
| Sidebar | 264 px floating panel, a 72 px rail with a 208 px flyout; logo and toggle, shop card, Quick actions pill, areas as circle icons with names, tabs on a connector rail, the owner's card |
| TopBar | 72 px of frosted glass on the ground: crumbs (12 px), the page's 24 px light title (the h1, placed by `PageHeader`), approvals and search; a hairline appears once the page scrolls under it |
| TabBar (phones, new) | A floating 64 px pill bar: Home, Office, Work, Commerce, More (a sheet with every area) |
| QuickActions | Ctrl+K or ⌘K, the sidebar pill or the top bar's search; a 560 px panel over a veil of the ground, a pill search field, destinations grouped by area with Soon tags |
| AppearanceChoices (round 3) | Settings' three personal settings as radio groups of choice cards (a small picture, a name, a line): Theme (System, which says what the device shows now · Light · Dark), Palette (Gray · Cream), Language (עברית · English); the chosen card has the ink outline and the orange check |
| SoonTag, DemoBadge, DemoScreen (new) | "Soon" beside an unbuilt tab, in its own text colour; "Demo — coming soon" on a screen that shows only the design; DemoScreen is the frame for a tab whose screen is not built |
| Toast | A 40 px ink pill at the bottom centre, 1.8 s, announced politely; confirmations only |
| Logo | The owner's Design 1C logo, `full` or `mark`, colours from `logo.*`, the dot drops in once |

## Relay revision (2026-10-15)

The design language changed to Relay ([client ADR-0007](../docs/adr/0007-relay-design-language.md)). Where this specification and the brand book disagree, the brand book's sizes and colours win. Built on the web so far:

| Component | Relay rules |
|---|---|
| Button | 28, 32 or 40 px; radius 8; primary is iris with white text and the faintest shadow; presses to 98% |
| IconButton | 32 px, radius 6; the "needs you" dot is saffron |
| Input (`TextField`) | 32 px (40 px on sign-in), radius 6, label 13 px medium above, iris focus border plus a soft iris halo |
| Sidebar | 248 px; the logo, Quick actions, 32 px items with object-coloured icons, section labels, the shop card, the account |
| QuickActions (new) | Ctrl+K or ⌘K; a 560 px dialog with a search field and a filtered menu; Enter goes |
| PageHeader (TopBar) | 48 px sticky bar: object icon, title (the h1), a short description on wide screens, actions |
| Tag (new) | 20 px, radius 4, soft tint plus darker text, optional dot; seven hues |
| ObjectIcon (new) | 20 or 28 px rounded tile in the record type's hue |
| DecisionRing (new) | The saffron marker loop around what waits for the owner; decorative, always beside words; draws on in 400 ms |
| StatusDot | Unchanged meaning; needs-you is saffron |
| EmptyState | Brand art (receipt, handoff rings, listing tile), title 16 px, one sentence, one action or a plain "not yet" |
| Banner (RetryBanner) | A slim full-width bar under the header on the saffron tint |
| Logo | Inline SVG of the official geometry in token colours; `mark` variant; the dot drops in during the intro |

## Index

| Group | Components |
|---|---|
| Actions | [Button](#button), [IconButton](#iconbutton) |
| Forms | [DateRangePicker](#daterangepicker), [FilterChips](#filterchips), [Input](#input), [PasswordField](#passwordfield), [SearchField](#searchfield), [Select](#select) |
| Navigation | [BottomBar](#bottombar), [NavigationRail](#navigationrail), [Pagination](#pagination), [Sidebar](#sidebar), [Tabs](#tabs), [TopBar](#topbar) |
| Status | [Badge](#badge), [ConnectivityIndicator](#connectivityindicator), [StatusDot](#statusdot), [StatusTimeline](#statustimeline) |
| Data | [ActivityLogRow](#activitylogrow), [ChartContainer](#chartcontainer), [Ltr](#ltr), [MetricCard](#metriccard), [OrderRow](#orderrow), [ProductTile](#producttile) |
| Workforce | [AgentAvatar](#agentavatar), [AgentCard](#agentcard), [TaskBoard](#taskboard) |
| Office (planned, Phase 15) | [AutomationRow](#automationrow), [DepartmentCard](#departmentcard), [EmployeeProfileHeader](#employeeprofileheader), [ProposalCard](#proposalcard), [RoutingDecisionRow](#routingdecisionrow), [ToolBadge](#toolbadge) |
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

## Office (planned, Phase 15)

Planned components for the office information architecture ([navigation map](../docs/ux/NAVIGATION_MAP.md)). They are specified here and designed, previewed and implemented in Phase 15.

### AutomationRow

Planned (Phase 15). One automation execution in the Automation Center: automation name and version, trigger, state, attempts and timing.

#### Rules
- State uses StatusDot with the execution's words: Pending, Running, Succeeded, Failed, Retry scheduled, Dead-lettered, Compensated, Cancelled.
- Shows attempts ("Attempt 2 of 5"), the trigger kind (event, schedule, employee, user, workflow) and who triggered it.
- The idempotency key and execution ID are monospace and LTR; a link opens the execution's activity records.
- Manual execution is a separate, permission-gated action with confirmation; the row never offers it to a user without the right role.

#### Consumer provides
Execution ID, automation name and version, state, attempt and maximum, trigger, start and finish times, link.

### DepartmentCard

Planned (Phase 15). One department in the Departments view: name, employees, current work and handoffs.

#### Rules
- Lists the department's employees as AgentAvatars with names; counts of open tasks, tasks waiting for the user and handoffs in progress come from the API.
- The amber dot only when something in the department waits for the user.
- Seven departments; Jev is never shown as a member.

#### Consumer provides
Department ID and name, employees, counts, link to the department profile.

### EmployeeProfileHeader

Planned (Phase 15). The top of an employee's profile: identity, state and the facts that bound the employee's work.

#### Rules
- Large AgentAvatar, name and title, department, state, autonomy level, readiness and profile version.
- Links to the profile's sections: activity, tools, skills, permissions, automations, sessions, memory summaries, model policy, evaluations.
- Shows only recorded facts; a draft profile says "Draft: not production-ready".

#### Consumer provides
Employee ID, name, title, department, state, autonomy, readiness, profile version.

### ProposalCard

Planned (Phase 15; filled from Phase 18). An optimization proposal: the problem, the measured baseline, the expected benefit and where it is in its lifecycle.

#### Rules
- Lifecycle state in words: Detected, Proposed, Evaluating, Approved, Rejected, In development, Testing, Deployed, Measuring, Verified, Rolled back.
- Baseline and expected benefit are numbers with units and period; after deployment the measured result sits next to them, labelled "Estimated" until verified.
- Names the proposer (Omer), the prioritizer (Maya) and the implementer; links the pull request when one exists.

#### Consumer provides
Proposal ID, title, state, baseline, expected benefit, measured result, people, links.

### RoutingDecisionRow

Planned (Phase 15). One model routing decision in the Decision & Model Observatory: which employee, which task, which tier and model, and why.

#### Rules
- Shows employee, task, routing policy version, chosen tier (including "No AI") and model, fallback used, cost and latency.
- Decision Advisor calls show the provider tried and the outcome (answered, rejected by schema, failed, fell back); never model reasoning.
- Model names and IDs are monospace and LTR.

#### Consumer provides
Decision ID, employee, task, policy version, tier, model, fallback, cost, latency, advisor attempts.

### ToolBadge

Planned (Phase 15). A tool as a detail of an action or a profile: name, version, risk and side-effect class.

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
