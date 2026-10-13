<p align="center">
  <img src="assets/brand/HTCO_Official_Logo.png" alt="HTCO" width="420">
</p>

<h1 align="center">HTCO Clients</h1>

<p align="center">
  The web, Windows and Android apps of <strong>HTCO OS</strong>,<br>
  with the HTCO design system and typed API clients.
</p>

<p align="center">
  <a href="design/README.md">Design system</a> ·
  <a href="design/COMPONENT_SPEC.md">Components</a> ·
  <a href="docs/architecture/CLIENT_ARCHITECTURE.md">Architecture</a> ·
  <a href="docs/ux/NAVIGATION_MAP.md">Navigation</a> ·
  <a href="docs/adr/README.md">Decisions</a>
</p>

---

> **Status:** Phase 0 — design system v1 and plans complete. The web app starts in Phase 3, Android in Phase 14 and Windows in Phase 15. The master plan lives in [`htco-platform`](https://github.com/Tzvi1234/htco-platform/blob/main/docs/plan/PLAN.md).

## What is here

HTCO Command is where the owner of a marketplace business sees verified orders and fulfillment, approves what the AI workforce proposes, and watches the office at work. It ships as three native clients over one API:

| Client | Stack | Best at |
|---|---|---|
| **Web** | TypeScript, React, React Aria, Tailwind (logical properties), Lingui | Everything, from any computer |
| **Android** | Kotlin, Jetpack Compose | Approvals with push and biometrics, incidents, the daily picture |
| **Windows** | C#/.NET 10, WinUI 3 | Dense operations work: order grids, incident center, developer console |

All three share the [design tokens](design/tokens/README.md), the [component specification](design/COMPONENT_SPEC.md) and clients generated from the platform's OpenAPI contract. They never share business rules: those live on the server.

## Design system

<table>
<tr>
<td width="33%"><strong>Navy</strong> <code>#030F1F</code><br>The office: the calm ground.</td>
<td width="33%"><strong>Turquoise</strong> <code>#05F7F4</code><br>The system at work: actions, live states, selection.</td>
<td width="33%"><strong>Amber</strong> <code>#F8B857</code><br>The dot: a decision is waiting for you.</td>
</tr>
</table>

Hebrew and English, light and dark, WCAG 2.2 AA in every theme. Read the [brand book](design/README.md), browse the [components](design/COMPONENT_SPEC.md), or open the live reference with previews: [HTCO design system](https://claude.ai/artifact/Bgq6rDafP6qyXiJBCsq8nf).

## Repository layout

```text
apps/web/              Web app
apps/android/          Android app
apps/windows/          Windows app
design/                Brand book, tokens, component specification
packages/api-clients/  Pinned OpenAPI contract and generated clients
assets/brand/          Official logo
docs/                  Architecture, UX, decisions, features
```

## How we build

Test-first, accessibility-first, right-to-left-first. Every screen designs its loading, empty, error, stale, offline and no-permission states, and nothing claims success before the server confirms it. Engineering rules: [`htco-platform` ENGINEERING_RULES](https://github.com/Tzvi1234/htco-platform/blob/main/docs/engineering/ENGINEERING_RULES.md) and [client architecture](docs/architecture/CLIENT_ARCHITECTURE.md).

## Getting started

Setup instructions arrive with the web shell in Phase 3.

## Security

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

Copyright © 2026 H.T.Z Studios. All rights reserved. See [LICENSE](LICENSE).

"Etsy" is a trademark of Etsy, Inc. This application uses the Etsy API but is not endorsed or certified by Etsy, Inc.
