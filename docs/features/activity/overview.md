# Activity — Overview

| | |
|---|---|
| **Slug** | `activity` |
| **Phase / slices** | Phase 7: slice 7.8 (the activity query view) |
| **Platform** | `GET /v1/activity`, `GET /v1/tasks/{task_id}/activity` (tag `activity`); platform docs: `htco-platform/docs/features/activity-records/` |
| **Code** | `apps/web/src/features/activity/` (`api.ts`, `ActivityPage.tsx`); fakes in `apps/web/src/test/fakeActivity.ts` |
| **Status** | In review, stacked on platform#200 (the API) and platform#191 (the store) |
| **Last updated** | 2026-10-27 |

## What and why

Every operation of the office leaves one activity record: who acted (a person, an AI employee, an automation or HTCO), what they did, how it ended, and its correlation, causation and task. Work › Activity (`/work/activity`) is where the owner reads them. "What did this automation do today" and "which automations failed this week" are each one tap away, and so is a task's trail across actors. The screen shows only what the server recorded. An empty answer says "No recorded activity", never that nothing happened.

## The screen

- **Focus:**
  - How many records the answer holds.
  - How many failed or were denied (orange when any).
  - How many actors.
  - Where the answer comes from and when it was read ("From recorded activity, read at …", AC-7.8.4).
- **Saved views (filter chips):**
  - **Today:** `day` is today's date in the user's own time zone, which is sent as `timezone` (AC-7.8.1).
  - **Failed automations, 7 days:** `actor_kind=automation&outcome=failed&since=…` (AC-7.8.2).
  - **Everything recent:** no filter.
  - The view sits in the address (`?view=failed|recent`).
- **The list:** each record's time, who acted (the user is "You", an employee by name, an automation by its ID), what happened (its template summary) and the outcome (glyph plus word, never colour alone). Newest first.
  - "Show older" follows the server's `next_cursor`, and "Back to the newest" returns.
  - Phones fold who, when and the outcome under the summary.
- **The chosen record** (beside the list, under it on phones):
  - Its summary and outcome, who, the kind of actor, when, the shop, and its identifiers (action, correlation, caused by).
  - "Only this actor" filters by it (`?actor=kind:id`). The chip "Only …" clears it.
  - "Show the task's trail" appears when the record belongs to a task.
- **Task trail** (`?task={id}`): `GET /v1/tasks/{id}/activity`. Every record of the task and every record sharing its correlation IDs, across actors, oldest first, with the newest marked in orange (AC-7.8.3).
- **States:**
  - Loading skeletons named for screen readers.
  - Empty ("No recorded activity").
  - 403 ("Your role does not include activity. Ask an Owner or Admin."), with no retry.
  - Other errors with "Try again".
  - The trail has its own unavailable and empty notes.
- **Workspaces:** the address owns the workspace (`?workspace=`), as on the incident center.

## Open

- The department filter and server-side saved queries (platform 7.8 follow-ups).
- Linking a failed automation record to its execution and its dead-letter state, once the record carries the execution ID (AC-7.8.2 on the platform).
- Employee names come from the record's ID until the API names actors.
