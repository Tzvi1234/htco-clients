# HTCO Clients Documentation

Client-specific documentation. Product, plan, system architecture and engineering rules live in [`htco-platform/docs`](https://github.com/Tzvi1234/htco-platform/tree/main/docs).

| Area | Documents |
|---|---|
| **Design** | [Brand book](../design/README.md) · [Tokens](../design/tokens/README.md) · [Component specification](../design/COMPONENT_SPEC.md) · [Live reference](https://claude.ai/artifact/Bgq6rDafP6qyXiJBCsq8nf) |
| **Architecture** | [Client architecture](architecture/CLIENT_ARCHITECTURE.md) |
| **UX** | [Screen specification (all 43 screens)](ux/SCREEN_SPEC.md) · [Navigation map](ux/NAVIGATION_MAP.md) · [Content style](ux/CONTENT_STYLE.md) · [Accessibility and right-to-left](ux/ACCESSIBILITY.md) |
| **Decisions** | [Client ADRs](adr/README.md) |
| **Features** | [Feature docs and template](features/README.md) |

## Created later, in the phase that needs them

Phase numbers follow the platform's [master plan, version 3.0](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/PLAN.md).

| Document | Phase |
|---|---|
| `docs/screens/SCREEN_MATRIX.md` (the automated screen-matrix harness built from [SCREEN_SPEC](ux/SCREEN_SPEC.md)), `android-parity.md`, `windows-parity.md` | 16 (slice 16.1), 17, 18 |
| `docs/ux/INTERACTION_CONTRACTS.md` (confirmations, permissions, feedback) | 5 |
| `docs/ux/OFFICE_ANIMATION_SPEC.md` (office views; animation only after v1 proves useful) | 16 |
| `docs/security/THREAT_MODEL_CLIENTS.md` | 3, extended in 17 and 18 |
| `docs/releases/` release runbooks | 17 and 18 |
