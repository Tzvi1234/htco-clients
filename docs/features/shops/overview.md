# Shops — Overview

| | |
|---|---|
| **Slug** | `shops` |
| **Phase / slices** | Phase 4 — slices 4.3 (connect flow, web side), 4.5 (capabilities on the card), 4.6 (Shops UI) and 4.7 (disconnect, web side) |
| **Platform side** | [htco-platform `docs/features/etsy-integration/`](https://github.com/Tzvi1234/htco-platform/tree/main/docs/features/etsy-integration) |
| **Status** | In progress |
| **Last updated** | 2026-10-16 |

## What and why

The Owner connects an Etsy shop from the web app and then sees, per shop, whether the connection works, what HTCO may read, what HTCO can do with the shop (each capability checked by the server's read-only probes, with the allowed alternative for anything blocked or not known), how healthy the connection's tokens are and when it last synced, in plain words. Owners and Admins can re-check; the Owner can disconnect. HTCO never writes to Etsy. Owners and Admins see the connection details; other roles see the shops they were granted.

## Users and actors

- **Owner:** connects, reconnects and disconnects shops (two factors, and a code from the authenticator app within the last ten minutes); re-checks capabilities.
- **Admin:** sees every shop's connection and re-checks capabilities; cannot connect or disconnect.
- **Other roles:** see their granted shops without connection details.

## Acceptance criteria

| ID | Criterion | Slice | Status |
|---|---|---|---|
| AC-4.3.1 (web) | A rejected callback (state missing, reused, expired or foreign) is explained, with a way back to Shops | 4.3 | Pass |
| — | The code and state leave the address bar at once and are sent once, also under StrictMode | 4.3 | Pass |
| — | Cancelling on Etsy (`error=access_denied`) says so and calls nothing | 4.3 | Pass |
| — | Without a recent second factor, connecting asks for the authenticator code and continues | 4.3 | Pass |
| AC-4.4.2 (card part) | `needs_reauth` is shown on the shop card with a Reconnect action | 4.6 | Pass |
| AC-4.1.2 | The shop card shows Etsy's requests left today "as of" when last seen, amber below the floor | 4.6 | Pass: `shops.test.tsx` (platform PR #222) |
| AC-4.6.2 | All card states have screenshot tests in he/en × light/dark | 4.6 | Pass: `e2e/journeys/shops.spec.ts` (connected, expiring, needs re-auth, disconnected, probing and probe error, en/he × light/dark, desktop and phone) |
| AC-4.6.1 | Capability-blocked states explain the alternative | 4.6 | Pass (`explains the allowed alternative for what is blocked or not known`) |
| AC-4.5.1 (web) | Capabilities shown with when they were checked; "Works" only as the server reports it | 4.5 | Pass |
| — | Re-check by Owner and Admin, with feedback (done, too soon with the wait, not connected) | 4.5 | Pass |
| — | Disconnect: confirmation dialog, then the authenticator code when needed; the card shows the disconnected state, the data deletion date and Reconnect | 4.7 | Pass |

## External facts learned

- Etsy's API terms require the notice "The term 'Etsy' is a trademark of Etsy, Inc. This application uses the Etsy API but is not endorsed or certified by Etsy, Inc." It is shown at the foot of the Shops page (translated in Hebrew).
- Etsy returns to the redirect URI with `?code=&state=` or `?error=access_denied&error_description=…`.

## Known limits

- No overview banner for a connection that needs reconnecting yet.
- "Instant order alerts" stays "Blocked" until Phase 5 sets up Etsy webhooks; "Tracking upload" is always "Not known" (the server never probes a write).
- Connecting asks the API with no workspace parameter; the API connects to the Owner's workspace.
