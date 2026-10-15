# Shops — Design

## Screens and states

| Screen | States | Platforms |
|---|---|---|
| Shops (`/shops`) | loading (skeleton cards) · empty (record-table shape, Connect for the Owner, "The workspace owner connects shops." for others) · populated (shop cards) · error (retry) · connected / reconnected confirmation · several workspaces (picker) | web |
| Shop card | connected (renews automatically) · expiring ("Reconnect within N days") · needs reconnecting · disconnected · no connection details (roles below Admin) | web |
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

## Client state

Server state in TanStack Query (`["shops", organizationId]`, `["shops", organizationId, "integrations"]`); the code dialog and the chosen workspace are local state; the confirmation travels in router history state. Nothing is persisted.

## Decisions and alternatives

| Decision | Alternatives | Why |
|---|---|---|
| Cards instead of the record table once shops exist | Table rows | The owner asked for an Attio-like card per shop; few shops per workspace |
| Days left rounded down | Rounded up | "Reconnect within N days" must never promise more time than there is |
| Reconnect also offered when disconnected | Only for expiring and needs reconnecting | A disconnected shop has no other way back until disconnect/reconnect lands in 4.7 |
