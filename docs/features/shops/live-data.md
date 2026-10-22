# Shops — the shop's live data on the dashboard (slice 4.6)

| | |
|---|---|
| **Platform** | `GET /v1/shops/{shop_id}/overview · orders · listings · reviews · shipping` ([dashboard data](https://github.com/Tzvi1234/htco-platform/blob/main/docs/features/etsy-integration/dashboard-data.md)) |
| **Code** | `apps/web/src/features/commerce/live.tsx` (queries, money, freshness, honest states), `OrdersPage`, `ProductsPage`, `ShippingPage`, `features/customers/CustomersPage`, `features/shops/ShopCard` and `TopListings`, Home's `TodayKpis` |
| **Last updated** | 2026-10-22 |

## What each screen shows

| Screen | Real, live from Etsy | Still Demo |
|---|---|---|
| Shops | On top: the shops in three groups that add up (working, need you, disconnected) and today's orders across them. Each shop's orders and revenue today, favourites, rating and review count, with "Live from Etsy · updated …"; the top listings (photo, price, views) in their own sub-tab; **Statistics** (per shop, a picker when there are several): opened and "open for N years", total sales (Etsy's count), revenue (gross, before Etsy's fees), average order, favourites, listings (and digital ones), orders per month for the last 12 months (bars) and revenue per month (a line), best month, top 5 products by units, where orders go (country only), refunds and cancellations by Etsy's reason (orders and amount as bars, "No reason given" when Etsy has none) with the refund and cancellation rates, and "based on the latest N orders" when the API's read stopped at its cap (`GET /v1/shops/{id}/stats`, aggregates only) | — |
| Home | On top: revenue and orders today against yesterday, awaiting shipment and late, and the next step (ship what waits, or open the orders); the shop's 7-day orders | What needs you (Today tab); the office pulse, open tickets and incidents (Office tab) |
| Orders | A period switch: 30 days (default), 90 days, 12 months, All time (`period`: `30d`, `90d`, `12m`, `all`; the API reads up to 500, 1,000, 2,000 and the newest 2,000 orders and says when it stopped). On top: orders, awaiting shipment, late and revenue for the period, orders per day, and "Show the late orders" when one is late; filters with server counts (paid, late, shipped, awaiting payment, cancelled, refunded), totals, orders per day, the order table (25 per page, "show more"); phones get order rows and a sheet with items and shipment, wider screens open the same sheet from the order number; refunded and cancelled rows (and orders refunded in part) carry a chip with the reason, and the sheet lists each refund's reason or "No reason given", amount, date and the seller's note (`refunds[]`, `refunded_total`; the note only for roles that see buyer data) | — (search, export and bulk actions are not offered) |
| Products | On top: active listings, sold out, views and favourites, and "Show the sold-out listings"; catalog with sections (24 at a time, "show more"), photo, price, stock, views, favourites; the chosen listing's details, tags, units sold in 30 days, link to Etsy | Production cost and supplier (Phase 13), the product studio card (Phase 12) |
| Shipping | On top: awaiting, late, shipped in 30 days, ships-from, and "Ship on Etsy" (a link to Etsy's sold orders; HTCO writes nothing). Sub-tabs: orders to ship and shipped; awaiting / shipped / late counts, ships-from country shipping profiles, return policies and production partners | Tracking sync and delivery performance (Phase 6), in the Tracking sub-tab |
| Customers | On top: the shop's average and count, the five-star share and the low ratings (three stars or fewer) of the newest reviews, with "Read the low ratings"; the reviews with drawn stars, 12 at a time | Customer health and the customer list, in the Customers sub-tab (a customer store comes with Phase 5) |

The Orders, Products, Shipping and Customers tabs are `built` (no Soon tag, no DEMO pill). Suppliers stays a demo frame.

## States

Loading skeletons (`aria-busy`), no shop connected (a link to Shops), a shop with no orders or listings, a period without orders in a shop that has sold ("No orders in the last 30 days", Etsy's sales count, and "Show all time"; never a bare empty table), a connection that needs reconnecting (409 `shop-not-connected` with `reason: needs_reauth`, or the connection's own `needs_reauth`: the banner "This shop needs reconnecting" on top of the screen and in each panel, with Reconnect for the Owner), a disconnected shop or a missing scope (409: "Open Shops"), Etsy not answering with nothing cached (503: "Try again"), and stale data marked "Etsy is not answering · showing data from 10:42". A disconnected shop is never asked for data.

## Rules kept

- Buyer names and tracking numbers come only when the API sends them (Owner, Admin, Operations, Support); the client does not decide.
- Money is formatted symbol first in the shop's currency (`$1,284.50`) and kept left-to-right in `N`; numbers stand apart from their Hebrew labels; English listing titles and reviews carry `dir="auto"`.
- Listing photos (`url_170x135` for strips and rows, `url_570xN` for cards and details) are hot-linked from Etsy's image host, lazy, in fixed squares that pulse until they arrive, never proxied or stored: the CSP allows `img-src https://i.etsystatic.com` and nothing else from outside; the referrer stays on this site, and a photo that cannot load falls back to the title's first letter.
- Phase 5 swaps the orders source to HTCO's store; the answers keep their shape, so only the "Live from Etsy" label changes.

## Demo and tests

`?demo=shops` serves invented Etsy data (`src/test/fakeShopData.ts`) for every connected demo shop, different per shop; the fake API's `liveTrouble` option ("unavailable", "stale", "quiet", "hang", "partial", "history") drives the error, stale, capped and empty states; the fake shops also have five years of older, completed orders for the longer periods and the statistics. `?demo=history` is the owner's live shop: every order older than 30 days. `features/commerce/live.test.tsx` covers the screens, roles, states, Hebrew direction and that a disconnected shop is not asked; `features/commerce/history.test.tsx` the periods, the empty period's way to all time, and the Statistics tab.
