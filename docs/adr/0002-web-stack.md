# Client ADR-0002: Web — Vite SPA with React Aria, Tailwind logical utilities and Lingui

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** Owner, engineering

## Context

The web app is a fully authenticated dashboard that handles money and personal data, in Hebrew (RTL) and English. It is served from DigitalOcean App Platform, whose static sites cannot set response headers (no CSP or HSTS).

## Options considered

1. **Next.js with static export.** Static export removes middleware, server actions and image optimization: the features that justify Next.js.
2. **Next.js with a server.** More infrastructure and attack surface, and no benefit for an authenticated dashboard.
3. **Vite single-page app** with TanStack Router and Query.

## Decision

- Vite + React + TypeScript, TanStack Router and Query.
- React Aria Components as the accessible, RTL-aware foundation for components.
- Tailwind CSS 4 with token variables and **logical utilities only**, enforced by lint.
- Lingui for ICU messages with compiled catalogs and a CI check for missing translations.
- Served by a small Caddy service component with strict security headers (CSP without inline scripts, HSTS, `frame-ancestors 'none'`). The API is routed under the same origin at `/api`, so the session cookie needs no CORS.
- Authentication through the platform's backend-for-frontend: an HttpOnly `__Host-` session cookie and a CSRF header; no tokens in JavaScript.

## Consequences

- Positive: simple deploys, strong accessibility and RTL from the component layer, no tokens exposed to cross-site scripting.
- Negative: the Caddy service adds about $5 per month; the tooling is young (TypeScript 7, Vitest 5, Storybook 10 and MSW 3 are all recent majors), so versions are pinned and upgraded one at a time.
