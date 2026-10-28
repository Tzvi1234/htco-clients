# Tracking relay — Overview

| | |
|---|---|
| **Slug** | `tracking-relay` (platform: `fulfillment-monitoring`, slice 6.10) |
| **Phase / slices** | Phase 6 — slice 6.10 PR B (the screen); platform PRs #159 (PR A) and #213 (PR B) |
| **Platform** | `GET /v1/relay-items`, `POST /v1/relay-items/{id}/tracking`, `GET /v1/relay-items/{id}/code` (tag `incidents`) |
| **Code** | `apps/web/src/features/incidents/` (`relay.ts`, `RelayPage.tsx`), fake `apps/web/src/test/fakeRelay.ts` |

## What the user can do

The owner orders from suppliers through AutoVA, which has no API. For every paid order still
without tracking two business days after payment, Commerce › Tracking (`/commerce/tracking`)
shows it, and he:

1. **Pastes** the number: picks the carrier as AutoVA shows it and pastes the number. The server
   checks the carrier and format before anything is saved (AC-6.10.4) and answers with the carrier
   and the last four characters only.
2. **Sees the state:** checked and handed off for the copy (AC-6.10.3), or, when Etsy already
   shows that number, the order is done with nothing to copy (AC-6.10.2).
3. **Copies into Etsy** from the "Copy into Etsy" sub-tab: the number is hidden until he presses
   "Reveal the number" (an audited reveal), then "Copy to clipboard". It hides again after two
   minutes, on "Hide", or when he leaves. The order closes on its own once Etsy shows the tracking.

Only an Owner or Admin with a second factor pastes and copies; the server decides.

## States

Loading (`aria-busy`, "Loading the orders…"); nothing waiting; nothing to copy; the relay not set
up (503 `relay-unavailable`, with "Try again"); a role without fulfillment (403, no retry). Each
refused paste or reveal says why in Hebrew and English:

| Problem | Screen |
|---|---|
| 422 `tracking-invalid` | "This is not a valid {carrier} tracking number…": names the carrier, never the number; the field is marked invalid |
| 409 `tracking-already-used` | The number is used for another order of this shop |
| 409 `relay-item-moved`, 404 on paste | The order is no longer waiting; the list reloads |
| 403 `forbidden` | Only an Owner or Admin pastes or copies |
| 403 `mfa-required` | Needs the second factor, with a link to `/security/setup` |
| 404 on reveal | Closed, expired after 30 days or not allowed (the API never says which) |

## Security

The pasted number is buyer data. It reaches the client only from the audited `GET …/code`
(server `no-store`, request `cache: "no-store"`), only on "Reveal", and lives only in the copy
panel's component state: the reveal's mutation returns nothing into the mutation cache, the paste
is not a mutation hook (its variables would keep the number), and nothing is written to storage,
logged or put in an address. `relay.test.tsx` checks storage, the console, the address, request
URLs and every query and mutation in the caches after a paste, reveal and copy.

## Tests

`relay.test.tsx` (every state and problem above, Hebrew and RTL, the never-kept check);
`e2e/journeys/relay.spec.ts` (paste → checked → reveal → copy, he and en, desktop and phone, axe and
screenshots). `?demo=shops` carries two orders waiting and one ready for Etsy (invented numbers).

## Known limits

- The contract types `carrier` as a plain string; the client keeps the platform's carrier list
  (`CARRIERS` in `relay.ts`) by hand until the API publishes it as an enum.
- The list carries no carrier or last four for a handed-off order (by design); the copy panel
  shows the number only after the reveal.
- One number per order; several parcels per order are a platform follow-up. The guarded upload to
  Etsy is slice 6.8.