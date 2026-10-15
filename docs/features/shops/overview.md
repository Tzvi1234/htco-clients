# Shops — Overview

| | |
|---|---|
| **Slug** | `shops` |
| **Phase / slices** | Phase 4 — slices 4.3 (connect flow, web side) and 4.6 (Shops UI, first part) |
| **Platform side** | [htco-platform `docs/features/etsy-integration/`](https://github.com/Tzvi1234/htco-platform/tree/main/docs/features/etsy-integration) |
| **Status** | In progress |
| **Last updated** | 2026-10-15 |

## What and why

The Owner connects an Etsy shop from the web app and then sees, per shop, whether the connection works, what HTCO may read, how healthy the connection's tokens are and when it last synced, in plain words. Owners and Admins see the connection details; other roles see the shops they were granted.

## Users and actors

- **Owner:** connects and reconnects shops (two factors, and a code from the authenticator app within the last ten minutes).
- **Admin:** sees every shop's connection, cannot connect.
- **Other roles:** see their granted shops without connection details.

## Acceptance criteria

| ID | Criterion | Slice | Status |
|---|---|---|---|
| AC-4.3.1 (web) | A rejected callback (state missing, reused, expired or foreign) is explained, with a way back to Shops | 4.3 | Pass |
| — | The code and state leave the address bar at once and are sent once, also under StrictMode | 4.3 | Pass |
| — | Cancelling on Etsy (`error=access_denied`) says so and calls nothing | 4.3 | Pass |
| — | Without a recent second factor, connecting asks for the authenticator code and continues | 4.3 | Pass |
| AC-4.4.2 (card part) | `needs_reauth` is shown on the shop card with a Reconnect action | 4.6 | Pass |
| AC-4.6.2 | All card states have screenshot tests in he/en × light/dark | 4.6 | Open (needs the Playwright/Storybook setup) |
| AC-4.6.1 | Capability-blocked states explain the alternative | 4.6 | Open (capabilities arrive with 4.5) |

## External facts learned

- Etsy's API terms require the notice "The term 'Etsy' is a trademark of Etsy, Inc. This application uses the Etsy API but is not endorsed or certified by Etsy, Inc." It is shown at the foot of the Shops page (translated in Hebrew).
- Etsy returns to the redirect URI with `?code=&state=` or `?error=access_denied&error_description=…`.

## Known limits

- No capabilities (slice 4.5), no disconnect (slice 4.7), no overview banner for a connection that needs reconnecting yet.
- Connecting asks the API with no workspace parameter; the API connects to the Owner's workspace.
