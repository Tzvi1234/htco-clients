# Post-merge review of #37 to #41 (2026-10-23)

The Codex review bot had no quota left, so five pull requests merged without a review: #37
(clarity round 3 part B), #38 (order periods and Statistics), #39 (charts), #40 (refunds and
cancellations), #41 (reconnect banner, Remove shop). This review read the merged code on `main`
(not only the diffs), in the order security and privacy, correctness, then accessibility, RTL and
translations. Every P0 to P2 finding has a failing test committed before its fix in the same pull
request; the P3 findings are recorded here for later.

Severity: P0 data loss or a security hole now; P1 a wrong number, a wrong action or personal data
where it must not be; P2 a broken state or an honest-state rule broken in a real flow; P3 polish,
edge cases and debt.

## Checked and found sound

- **Buyer data by role.** Buyer names and tracking numbers come from the API already filtered for
  Owner, Admin, Operations and Support (`buyer_details`); the screens show `buyer` only when it is
  not `null` (`OrdersPage.tsx`, `ShippingPage.tsx`) and Statistics shows aggregates only. No
  buyer data reaches `console`, Sentry or analytics (none of them is called in `apps/web/src`).
- **No Etsy writes.** The only writes are HTCO's own: step-up, connect, callback, re-check,
  disconnect and `DELETE /v1/shops/{shop_id}`; the Remove dialog says nothing changes on Etsy.
- **Step-up.** Disconnect and Remove send the request, open the code dialog on
  `step-up-required` (403), send again after the code, and reset when cancelled; `forbidden` and
  `mfa-required` have their own sentences; a repeated Remove answering 404 counts as done, as the
  contract says.
- **Periods and time.** The order periods are computed by the API (`period`, `window_start`); the
  overview and the statistics send `utc_offset_minutes`; the months are named in UTC from the
  API's month dates, which are contiguous up to the current month, so "last 12 months" and the
  highlighted current month are right.
- **Money.** Each amount is formatted in its own currency; sums never mix shops; a period cut at
  its cap says the revenue covers the newest orders.
- **Charts.** `BarChart` and `LineChart` are one `role="img"` each, named with every value;
  `HBarList` stays a list whose words carry everything. Time follows the document direction and
  the line drawing mirrors in Hebrew; the tips use logical insets.
- **RTL and translations.** No physical left/right property was added; `lingui check sync` and
  `check missing` pass, and no Hebrew entry is a copy of its English one (brand names aside).

## Findings

| # | Severity | Where | Finding | Status |
|---|---|---|---|---|
| 1 | P2 | `apps/web/src/features/shops/ShopsPage.tsx:222` | Removing the last shop shows no confirmation | Fixed |
| 2 | P2 | `apps/web/src/features/shops/shopActions.tsx:136` | Disconnect keeps the shop's live data, buyer names included | Fixed |
| 3 | P2 | `apps/web/src/features/shops/shopActions.tsx:151`, `:268` | A 401 on Disconnect or Remove says "try again shortly" | Fixed |
| 4 | P3 | `apps/web/src/features/shops/shopActions.tsx` | Focus falls to the page after Remove or Disconnect | Open |
| 5 | P3 | `apps/web/src/features/overview/OverviewPage.tsx:546` | Home's 7-day chart is read as bare day numbers | Open |
| 6 | P3 | `apps/web/src/features/commerce/live.tsx:371`, `:417` | Two alerts and two Reconnect buttons for one problem | Open |
| 7 | P3 | `apps/web/src/features/commerce/ShippingPage.tsx:94` | The shipping queue sees the last 30 days only | Open |
| 8 | P3 | `apps/web/src/features/commerce/live.tsx:63` | One UTC offset for every day, across a DST change | Open |
| 9 | P3 | `apps/web/src/features/commerce/OrdersPage.tsx:216` | "Total shown" and "Average order" count cancelled and refunded orders | Open |
| 10 | P3 | `apps/web/src/features/shops/ShopStats.tsx:170` | "Open for 0 months" for a shop opened this month | Open |
| 11 | P3 | `apps/web/src/features/shops/shopActions.tsx:160` | Disconnect answered "not found" asks to refresh instead of refreshing | Open |
| 12 | P3 | `apps/web/src/features/shops/shopActions.tsx` | `csrf-failed` reads as a generic failure | Open |
| 13 | P3 | `apps/web/src/test/fakeApi.ts:559` | The fake API hides buyer data from Operations | Open |
| 14 | P3 | `apps/web/src/shared/ui/kit/table.tsx:61` | A table that scrolls sideways is not keyboard-scrollable | Open |

### 1. Removing the last shop shows no confirmation (P2, fixed)

`Shops` returned the empty page (`NoShops`, `HowConnecting`) before it built its notices and
without the dialogs. Removing the only shop invalidates the list, the list comes back empty, and
the page switches to "No shops yet": the "… and its data were removed." status is never shown or
announced, for the one action that cannot be undone (golden rule 5: say what happened).

- Scenario: an Owner with one shop types its name, presses Remove shop: the page shows "No shops
  yet" and nothing says the removal succeeded.
- Fix: the empty page renders the notices above it and keeps the Disconnect and Remove dialogs.
- Test: `confirms removing the last shop instead of switching to the empty page silently`.

### 2. Disconnect keeps the shop's live data, buyer names included (P2, fixed)

Remove dropped the shop's `["live", shopId]` queries; Disconnect only refreshed the shop list and
the connections. The orders (with buyer names for the roles that see them), the overview and the
statistics of a shop HTCO no longer has access to stayed in the browser's cache and were shown
again on Orders, Shipping and Home until the next refresh answered (up to two minutes, longer
with no network).

- Scenario: open Orders (buyer names), go to Shops, disconnect the shop, go back to Orders: the
  cached orders and buyer names are on screen while the API is asked again.
- Fix: Disconnect removes the shop's live queries on success, as Remove does; the screens ask
  the API again and show "not connected".
- Test: `forgets a disconnected shop's live orders (buyer names) at once`.

### 3. A 401 on Disconnect or Remove says "try again shortly" (P2, fixed)

The 401 handler that sends a user back to sign-in watches queries only, not mutations (it cannot
watch every mutation: a wrong step-up code also answers 401). A session that ended while Shops
was open made Disconnect or Remove answer "The shop was not … Try again shortly.", which can
never work, on a destructive action.

- Scenario: the session expires or is revoked in another tab; the Owner presses Remove, types the
  name, confirms: "The shop was not removed. Try again shortly." Repeating gives the same.
- Fix: a 401 says "Your session has ended. Sign in again, then remove (disconnect) the shop.", in
  English and Hebrew.
- Test: `says the session ended when %s answers 401, instead of 'try again shortly'` (removing,
  disconnecting).

### 4 to 14 (P3, open)

4. **Focus after Remove or Disconnect.** The dialog returns focus to its trigger, which is gone
   (the card is removed, or its Disconnect button disappears with the connection), so focus falls
   to the document. The status message is still announced. Fix: move focus to the notice or the
   page heading on success.
5. **Home's chart text alternative.** The 7-day `BarChart` on Home passes no `tips`, so its name
   reads "Orders in the last 7 days: 16 3, 17 5, …" (day number, then count). Orders passes the
   dates; Home should too.
6. **Duplicate reconnect prompts.** On a shop that needs reconnecting, `ShopReconnectBanner` and
   the panel's `ReconnectNotice` are both `role="alert"` with their own Reconnect button and code
   dialog. Intended by #41's tests, but a screen reader hears it twice. Consider making the
   panel's notice a plain status when the banner is shown.
7. **Shipping's 30-day window.** Shipping reads the default 30-day period, so a paid order placed
   more than 30 days ago and still not shipped (the latest of the late) is not in the queue.
   Not a regression (before #38 the API's window was 30 days too); the API's queue could serve
   it, see the platform note below.
8. **DST.** `utcOffsetMinutes()` sends today's offset; days and months on the other side of a
   daylight-saving change are bucketed an hour off. Sending the IANA time zone would fix it, and
   that is a contract change in the platform.
9. **"Total shown" and "Average order"** on Orders add every listed order, cancelled and refunded
   ones too, while the Revenue figure counts sales only. Label or filter them as sales.
10. **"Open for 0 months"** for a shop opened this month; say "Opened this month".
11. **Disconnect answered 404** says "Refresh the page" but does not refresh the shop list itself.
12. **`csrf-failed` (403)** on Disconnect or Remove reads as the generic failure; "Refresh the
    page and try again" would tell the way out.
13. **The fake API** shows buyer data to Owner, Admin and Support but not Operations, unlike the
    contract; no test covers Operations seeing buyer names.
14. **Sideways-scrolling tables** (`DataTable flow`) are not focusable, so a keyboard user cannot
    scroll a table wider than its panel (axe `scrollable-region-focusable`) unless a cell holds a
    focusable control (Orders does; Shipping does not).

## For the platform (`htco-platform`)

- Finding 7: Shipping needs every paid, unshipped order whatever its age; a `state=paid` read
  without a period limit (or the store's queue in Phase 5) would serve it.
- Finding 8: the overview and statistics take a fixed `utc_offset_minutes`; a `time_zone` (IANA)
  parameter would bucket days and months correctly across DST.
