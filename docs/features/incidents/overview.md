# Incident center — Overview

| | |
|---|---|
| **Slug** | `incidents` |
| **Phase / slices** | Phase 6 — slice 6.5 (incident center UI and notification bell) |
| **Platform** | `GET /v1/incidents`, `GET /v1/incidents/{id}`, `POST /v1/incidents/{id}/transitions`, `GET /v1/notifications`, `POST /v1/notifications/read` (tag `incidents`) |
| **Code** | `apps/web/src/features/incidents/` (`api.ts`, `IncidentState.tsx`, `IncidentsPage.tsx`), `apps/web/src/app/shell/NotificationBell.tsx` |
| **Status** | In review (clients#48); the platform side is merged (platform#87, #98) |
| **Last updated** | 2026-10-25 |

## What and why

HTCO notices fulfillment problems before buyers do: an order past its shipping window without
tracking, tracking that disagrees, Etsy and HTCO out of sync, an automation that gave up. The
incident center (Commerce › Incidents, `/incidents`) shows them; the bell in the top bar tells the
owner when one opens or closes, and about shipping alerts, sign-ins and shop connections.

## The screen

- **Focus:** how many incidents are open, the oldest one's age and how many are high or
  critical (orange when any), with "Open the most urgent" (highest severity, then oldest).
- **Sub-tabs:** Open (the API's `state=open`), Resolved and All (`state=all`, asked only when
  chosen). The list shows the incident (its cause and order number), severity, shop, age and
  state, newest first; phones fold the shop and age under the cause.
- **Detail** (beside the list, under it on phones; `/incidents/{id}`): severity and state, shop,
  the related order (its number links to Orders; there is no per-order address yet), detected
  and found by (or resolved), the evidence (each fact once, with its source and reference), the
  incident's own details, the timeline newest first (who: you, a team member, an automation or
  HTCO), and the next steps.
- **Steps:** exactly the API's `next_states`, only when `can_update`; escalating comes last.
  Nobody resolves an incident by hand: there is no Resolve button, it resolves on evidence. A
  refused step says why: `illegal-incident-step` and `incident-moved` reload the incident,
  `evidence-required` changes nothing, 403 names the role.
- **Bell:** the unread count (all the user's workspaces), the newest six notifications in words
  built on the client from `kind` and `params` (Hebrew and English), "Mark all read" (the IDs of
  the shown unread ones, each workspace's under its own `organization_id`; "Mark these read" when
  more are unread than shown), and each notification leading to its subject: an incident opens
  itself (`/incidents/{id}?workspace=…`) and is marked read.
- **Workspaces:** the address owns the workspace (`?workspace=`). A link from another
  workspace's notification opens there; switching the workspace on the screen leaves the open
  incident and shows the other workspace's center.
- **The order sheet** (Orders, slice 5.7): an order's incidents, asked from its own workspace
  with `shop_id`, `receipt_id`, `state=all` and `limit=20`, each with its state and a link into
  the incident center. Nothing shows when the order has none.

## Acceptance criteria

| ID | Criterion | Test |
|---|---|---|
| AC-6.5.1 | Incident states use a status dot plus a word, never colour alone. | `incidents.test.tsx`: "AC-6.5.1 shows every incident state as a status glyph plus a word, never colour alone", "AC-6.5.1 the list and the detail show the state with its glyph and word" |
| AC-6.5.2 | The screen reader announces new notifications politely, not intrusively. | `notifications.test.tsx`: "AC-6.5.2 announces new notifications in a polite live region, never an assertive one" |

Each state's glyph is the kit's status glyph (`kit/status.tsx`), so its shape differs as well as
its colour: detected a dashed ring, triaged a ring, investigating and fixing a filled dot, a fix
proposed or needing approval the orange halo, needing a developer or verifying the half disc,
escalated the ink square, resolved the filled check.

## States

Loading (`aria-busy`, "Loading incidents…"), nothing open (what opens and closes an incident),
an empty Resolved or All tab, the incident center not answering (503, "Try again"), a role
without incidents (403, no retry), an incident not available (404), a role that may view but not
move (a note instead of steps), and the bell's loading, empty and error states: one workspace's
notifications not loading ("Some workspaces' notifications did not load", with Try again, the
others still shown) and a failed "Mark all read" (an alert; the unread ones stay). Every call names
its workspace; a user in several picks one on the screen (`WorkspacePicker`).

## Demo data

`?demo=shops` (and the journeys) carry three open incidents and one resolved on evidence, and
five notifications, from `apps/web/src/test/fakeIncidents.ts`; the fake API follows the
platform's incident machine and answers the 403 and 409 problems as the API does.
