# Navigation Map

Every destination in HTCO Command, where it appears on each platform, and the phase that brings it. Screens are added to this map in the pull request that builds them.

## Tree

```text
Sign in · MFA · Recovery · Sessions
Overview
Shops                      shop cards, capabilities, connect / disconnect
Orders                     list → order detail (items · timeline · incidents · audit)
Fulfillment                tracking health, SLA windows
Incidents                  incident center → incident detail
Approvals                  inbox → approval detail
Tasks                      board · list · task detail
Products                   catalog · Listing Health · Product Studio pipeline → product detail
Suppliers                  quote requests · supplier mappings
Finance                    P&L · fees · costs · exports
Support                    inbox · tickets → ticket detail
Workforce                  office · agent directory → agent detail · conversations
Settings                   profile · notifications · language and theme
Administration             users and roles · shop access · budgets and model policies · kill switches · audit log
Developer console          runs · traces · dead-letter queue (role-gated)
```

## By platform and phase

| Destination | Web | Android | Windows | Phase |
|---|---|---|---|---|
| Sign in, MFA, sessions | ✓ | ✓ | ✓ | 3 · 14 · 15 |
| Overview | Full dashboard | Summary cards | Multi-panel | 3 |
| Shops | ✓ | — | ✓ | 4 |
| Orders | Table with filters | Later, by ADR | Dense grid, bulk actions | 5 |
| Fulfillment and incidents | ✓ | Incidents list and detail | Incident center | 6 |
| Approvals and tasks | ✓ | Approvals first, with push and biometrics | ✓ | 7 · 14 |
| Workforce: directory (read-only) and budgets (owner) | ✓ | — | ✓ | 8 |
| Products: Listing Health | ✓ | Approvals only | ✓ | 9 |
| Products: Product Studio | ✓ | Approvals only | ✓ | 10 |
| Suppliers and finance | ✓ | — | ✓ | 11 |
| Support | ✓ | Approvals only | ✓ | 12 |
| Office and conversations | Rooms grid + list | Later, by ADR | Rooms grid + side panel | 13 |
| Administration (users, roles, shop access) | ✓ | — | ✓ | 2–3 |
| Developer console | ✓ (role) | — | ✓ (role) | 13 · 15 |

## Navigation patterns

- **Web and Windows:** a sidebar at 1200 px and wider, a navigation rail between 640 and 1200 px; the top bar holds search, notifications and the user menu.
- **Android:** a `BottomBar` with up to five destinations (Overview, Approvals, Incidents, and later Orders and More); approvals open in a bottom sheet with the full card. Phase 14 ships Overview, Approvals and Incidents; anything more comes by ADR.
- **Deep links:** every notification opens the exact object (`/approvals/{id}`, `/incidents/{id}`, `/orders/{id}`) after authentication, and never shows another shop's object.
- **The amber dot** appears on a destination only when something there waits for the user.
