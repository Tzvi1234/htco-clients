# Admin › Automations — Overview

| | |
|---|---|
| **Slug** | `automations` |
| **Phase / slices** | Phase 5: slices 5.1 (the registry), 5.9 (metrics, in the health read) and 5.11 (the three order automations live) |
| **Platform** | `GET /v1/automations`, `GET /v1/automations/{id}/executions` (tag `automations`); `GET /v1/operations/health` (re-used, the same query as Admin › Health); `GET /v1/executions/{id}` and its retry (the execution sheet) |
| **Code** | `apps/web/src/features/admin/` (`AutomationsPage.tsx`, `execution.tsx` shared with Health, `automationTools.tsx`), `apps/web/src/shared/api/automations.ts` |
| **Status** | In review |
| **Last updated** | 2026-10-26 |

## What and why

The office's deterministic automations, such as Etsy Order Intake, Order Deduplication &
Verification and Product Sales Counters, run on their own. The owner needs to see which ones are
live, what starts them, and whether their runs succeed, and to reach a run that gave up.

## The screen

- **Focus:** how many automations are live, the last seven days' runs, success, retries and
  dead letters (only the dead-letters figure turns orange, and only when there is one). The lead
  names the automation with a dead-lettered run, and "Open the dead-lettered run" opens its
  execution sheet.
- **Automations:** every automation of the registry, by name and ID, with its status (Live,
  or Draft and its activation phase) and its trigger kinds in words (the primary one first).
  Owners and Admins also see its runs, success, retries and dead letters. A row is chosen by
  click, Enter or Space. Phones show only the name and the status.
- **The chosen automation:** what starts it, its effect (inside HTCO, reads from or writes to
  the marketplace), whether each run is approved, and who may start it by hand. Then its latest
  ten runs, each opening the execution sheet. Then its tools: `AUTOMATION_TOOLS` gives each
  automation an optional self-contained component, such as Recount sales for Product Sales
  Counters.

## Data and caching

- The metrics come from the same `operationsHealthQuery` (and key) as Admin › Health, so the two
  screens share one cached answer: never a second health call.
- The registry is cached for five minutes; the runs refresh every 30 seconds.
- Every call names its workspace, every key carries it, and every key sits under `operations`,
  which the session's end removes (`forgetSession`).

## States

- **Loading:** a skeleton until the registry and the health read have answered.
- **No permission for the metrics** (health 403 for roles below Admin): the registry and runs
  show, without the metric columns, with a line saying who sees them.
- **Health failed otherwise:** the registry shows without metrics, and says so.
- **Registry 403 / 503 / error:** a message, and "Try again" except for 403.
- **Several workspaces:** the workspace picker first; nothing is asked until one is chosen.
- **No runs:** "No run yet in this workspace" for a live automation, "It has not run" for a
  draft.

## Demo

`?demo` and `?demo=shops` serve the registry's three live order automations and two drafts from
the in-memory API (`test/fakeOperations.ts`), with invented runs and no buyer data.
