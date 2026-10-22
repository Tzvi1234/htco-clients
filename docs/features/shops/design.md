# Shops — Design

## Screens and states

| Screen | States | Platforms |
|---|---|---|
| Shops (`/shops`) | loading (skeleton cards) · empty (record-table shape, Connect for the Owner, "The workspace owner connects shops." for others) · populated (shop cards) · error (retry) · connected / reconnected confirmation · several workspaces (picker) | web |
| Shop card | connected (renews automatically) · expiring ("Reconnect within N days") · needs reconnecting · disconnected (data deletion date, Reconnect) · no connection details (roles below Admin) · capabilities (not checked yet · checked, with Works / Blocked / Not known and the alternative) · re-checking · re-check done / too soon / failed | web |
| Disconnect confirmation | asking (what is deleted and when) · code dialog when the confirmation is older than ten minutes · disconnected confirmation · refused (a plain sentence per problem, also "HTCO could not be reached" without an answer) | web |
| Remove shop (Owner, the card's quiet danger zone) | asking (what is deleted, cannot be undone; the button stays disabled until the shop's name is typed) · code dialog · removed confirmation (the card goes) · refused | web |
| Reconnect banner (Home, Orders, Products, Shipping, Customers; Statistics and Top listings on Shops) | shown when the connection says `needs_reauth` or a data call answers `shop-not-connected` with a reason other than `disconnected`: "This shop needs reconnecting", Reconnect for the Owner (the Etsy connect flow), "The workspace owner can reconnect it." for others; the panels say the same instead of an empty screen | web |
| Code dialog | asking · wrong code · too many attempts | web |
| Etsy return (`/integrations/etsy/callback`) | connecting · cancelled on Etsy · incomplete link · one message per problem (`etsy-state-rejected`, `etsy-authorization-refused`, `etsy-unreachable`, `etsy-no-shop`, `etsy-shop-connected-elsewhere`, `web-session-required`, `etsy-unavailable`) | web |

## Components used

PageHeader, PageBody, EmptyState, ErrorState, Button, Tag (solid fill, white text), StatusDot (dot plus words), ObjectIcon, Ltr (Etsy shop ID and unknown scopes), FormAlert, the authenticator CodeField, and React Aria Modal/Dialog in the quick-actions style. `WorkspacePicker` was extracted from the Team page so both pages share it.

The card is a white card (radius 12, hairline, faintest shadow): the shop's icon tile, name and Etsy shop ID, the status tag, then rows for connection health, access (Read shop, Read orders, Read listings) and the last sync ("Last synced 4 minutes ago"). On phones the card shows fewer things: no shop ID and no access row, and the Reconnect button spans the card.

## Navigation

- `/shops` from the sidebar, the tab bar and quick actions.
- `/integrations/etsy/callback` is the Etsy redirect URI, inside the signed-in area (it needs the session cookie). It replaces its own address without the query and then moves to `/shops`, passing the confirmation in history state, not in the URL.

## API consumed

| Endpoint | Purpose | Notes |
|---|---|---|
| `GET /v1/shops?organization_id=` | The shops | Every role |
| `GET /v1/shop-integrations?organization_id=` | Status, scopes, token health | Owner and Admin only; never a token |
| `POST /v1/shops/etsy/connect` | Etsy's consent address | `step-up-required` opens the code dialog, then the request is sent again; only https or same-origin addresses are followed |
| `POST /v1/auth/step-up` | The authenticator code | Opens a ten-minute window |
| `POST /v1/integrations/etsy/callback` | Finish connecting | Sent once; invalidates the shop queries |
| `POST /v1/shop-integrations/{shop_id}/capability-checks` | Re-check what HTCO can do | Owner and Admin, connected shops; 429 `capability-check-too-soon` shows the `Retry-After` wait; refetches the connection details |
| `POST /v1/shop-integrations/{shop_id}/disconnect` | Disconnect | Owner; after the confirmation dialog; `step-up-required` opens the code dialog and the request is sent again; refetches shops and connection details |
| `DELETE /v1/shops/{shop_id}` | Remove shop | Owner; after typing the shop's name; `step-up-required` opens the code dialog and the request is sent again; 204, or 404 (already removed), drops the shop's live data and refetches shops and connection details |
| Every data endpoint | 409 `shop-not-connected` | `reason`: `needs_reauth` shows the reconnect banner; `disconnected` keeps "Open Shops" |

## Client state

Server state in TanStack Query (`["shops", organizationId]`, `["shops", organizationId, "integrations"]`); the code dialog and the chosen workspace are local state; the confirmation travels in router history state. Nothing is persisted.

## Decisions and alternatives

| Decision | Alternatives | Why |
|---|---|---|
| Cards instead of the record table once shops exist | Table rows | The owner asked for an Attio-like card per shop; few shops per workspace |
| Days left rounded down | Rounded up | "Reconnect within N days" must never promise more time than there is |
| Reconnect also offered when disconnected | Only for expiring and needs reconnecting | Reconnecting is the way back after a disconnect (4.7) |
| Capabilities as a list with the alternative under anything not working | Pills only | AC-4.6.1 asks for the allowed alternative in words; the glyph's shape (filled, square, dashed ring) carries the state besides colour |
| A confirmation dialog before the code dialog | Code dialog only | Disconnecting stops syncing at once; the owner should read what happens first |
