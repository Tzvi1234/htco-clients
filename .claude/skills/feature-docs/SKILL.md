---
name: feature-docs
description: How to document client features and decisions in htco-clients so the owner and future sessions can understand what exists and why. Use when starting a client feature (create its folder), at the end of every slice (update the feature files, component spec, navigation map, design system reference), and when a client decision deserves an ADR. Also lists what must never be committed.
---

# Feature documentation (clients)

Documentation is part of the change and is written in the same pull request.

## The feature folder

`docs/features/<feature-slug>/`, created from `docs/features/_template/`. When the feature has a platform side, use a matching slug and link both ways (for example the platform's `orders-ingest` pairs with `orders-ui` here).

| File | Holds |
|---|---|
| `overview.md` | What the user can do, roles, acceptance criteria and their status, platforms covered, known limits |
| `design.md` | Screens and states, components used, navigation entry points, API endpoints consumed, client-side state, decisions |
| `tests.md` | Test plan per platform, criteria-to-tests mapping, verification evidence (screenshots referenced, not committed with real data) |
| `security.md` | Data shown and to whom, storage, session handling, deep links, threats specific to the client |
| `operations.md` | Feature flags, release notes, rollout, known issues |

## At the end of every slice

1. Update the feature files.
2. Update shared references the slice changed:
   - `design/COMPONENT_SPEC.md` and the live design system (new or changed components);
   - `docs/ux/NAVIGATION_MAP.md` (new destinations);
   - `docs/ux/CONTENT_STYLE.md` (new terms or status words);
   - `packages/api-clients/openapi.yaml` (pinned contract copy) and regenerated clients;
   - `CLAUDE.md` and `README.md` if commands or structure changed.
3. Tick the slice in `htco-platform/docs/plan/phases/phase-NN-*.md` (in the platform pull request for the same slice, or a small docs pull request there).

## ADRs

Client decisions go in `docs/adr/` (index in `docs/adr/README.md`): a new library or framework, a navigation or state pattern, a platform capability decision (for example how Windows stores tokens), a design-system rule change.

## Never commit

Session notes, scratch files, summaries of what was done, duplicated docs, empty placeholders, screenshots or recordings with real buyer data, generated reports.
