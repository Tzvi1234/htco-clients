# Client ADR-0001: Three native clients, built web first

- **Status:** Proposed; accepted with decision D-05 (native app order)
- **Date:** 2026-10-14
- **Deciders:** Owner, engineering

## Context

The product specification asks for real native UI on every platform: Windows (WinUI 3), Android (Kotlin and Jetpack Compose) and the web (TypeScript), explicitly ruling out Electron, WebView wrappers and React Native. Research on 2026-10-14 estimates the cost of three native clients at roughly two to two and a half times a web-only client per feature, plus three release pipelines and constant dependency churn.

## Decision

- Keep three native clients that share design tokens, component specifications and generated API clients, and never business rules.
- Build order: **web first** (Phase 3 onward, every feature), **Android second** (Phase 14: approvals, push, incidents, dashboard), **Windows last** (Phase 15).
  - 2026-10-14: phases renumbered by platform PLAN 2.0 ([ADR-0012](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0012-living-office-organization.md)); Android is now Phase 16 and Windows Phase 17. The decision is unchanged.
  - 2026-10-14: phases renumbered by platform PLAN 3.0, the Claude-Native Hybrid Edition ([ADR-0016](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0016-claude-native-agent-runtime.md)); Android is now Phase 17 (it may start after Phase 7) and Windows Phase 18. The decision is unchanged.
- Before Windows starts, confirm the concrete reasons it beats the web app (OS notifications, multi-window work, dense keyboard-driven grids, an offline read cache) and scope it to those.

## Consequences

- Positive: each platform feels right; the owner gets approvals with biometrics on the phone and a power console on the desktop.
- Negative: higher cost per feature; the native apps trail the web.
- Follow-ups: a contract job regenerates all clients on every API change; each native app implements only the features listed in its phase.
