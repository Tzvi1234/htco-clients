# Client ADR-0006: The web app as an App Platform static site, policies in the page

- **Status:** Accepted
- **Date:** 2026-10-15
- **Deciders:** Owner, engineering

## Context

Slice 3.8 planned a Caddy container that serves the built app with security response headers. A second container costs another $5 a month, and the owner asked for hosting that costs nothing more. App Platform serves static site components inside an app that already has a paid service at no extra charge, but a static site cannot set response headers.

## Decision

- The web app is a static site component (`web`) of the existing App Platform app, built by `apps/web/Dockerfile` from this repository's `main`, at `https://dash.ht-co.app`. The app's ingress sends `dash.ht-co.app/api/*` to the API (prefix removed), so the API stays on the page's origin (platform ADR-0006).
- The policies travel inside the page, written at build time by `src/shared/security/csp.ts`:
  - **Content-Security-Policy** as a `<meta>`: only this origin; `data:` images for the authenticator QR code; one hashed `<style>` that React Aria injects; no inline script, no `unsafe-*`.
  - **Referrer-Policy** `same-origin` as a `<meta>`.
- **HSTS:** every `.app` domain is on the browsers' HSTS preload list, so plain HTTP is never used. App Platform also redirects HTTP to HTTPS.
- **Framing:** `frame-ancestors` does not work in a `<meta>`, so the app renders nothing when it runs inside a frame (`framing.ts`).
- **Not covered:** `Permissions-Policy` (the app uses no camera, microphone, location or payment features) and `X-Content-Type-Options` (App Platform sets content types from file extensions).

## Alternatives

| Option | Why not now |
|---|---|
| Caddy container with real headers (the original plan) | $5 a month more; revisit when the app needs `frame-ancestors` or `Permissions-Policy` as headers |
| Cloudflare proxy with Transform Rules adding headers | The API would see Cloudflare's addresses instead of the visitor's, which breaks per-IP sign-in throttling |
| Cloudflare Workers static assets | A second hosting provider, and `/api` would need a proxy that forwards the visitor's address |

## Consequences

- Positive: no extra cost, no server to patch, and the same origin for the app and the API.
- Negative: AC-3.8.1 is met by the page's policies plus the `.app` preload, not by response headers. An older browser that ignores `<meta>` CSP gets no CSP.
