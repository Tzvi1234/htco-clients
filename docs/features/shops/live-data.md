# Shops — the shop's live data on the dashboard (slice 4.6)

| | |
|---|---|
| **Platform** | `GET /v1/shops/{shop_id}/overview · orders · listings · reviews · shipping` ([dashboard data](https://github.com/Tzvi1234/htco-platform/blob/main/docs/features/etsy-integration/dashboard-data.md)) |
| **Code** | `apps/web/src/features/commerce/live.tsx` (queries, money, freshness, honest states), `OrdersPage`, `ProductsPage`, `ShippingPage`, `features/customers/CustomersPage`, `features/shops/ShopCard` and `TopListings`, Home's `TodayKpis` |
| **Last updated** | 2026-10-22 |

## What each screen shows

| Screen | Real, live from Etsy | Still Demo |
|---|---|---|
| Shops | Each connected shop's orders and revenue today, favourites, rating and review count, with "Live from Etsy · updated …"; the top listings strip (photo, price, views) | — |
| Home | Revenue and orders today against yesterday; the shop card's 7-day orders and today's numbers | What needs you, open tickets, incidents, the office pulse |
| Orders | Filters with server counts (paid, late, shipped, awaiting payment, cancelled, refunded), totals, orders per day, the order table (25 per page, "show more"); phones get order rows and a sheet with items and shipment | — (search, export and bulk actions are not offered) |
| Products | Catalog with sections, photo, price, stock, views, favourites; the chosen listing's details, tags, units sold in 30 days, link to Etsy | Production cost and supplier (Phase 13), the product studio card (Phase 12) |
| Shipping | Orders to ship and shipped, awaiting / shipped / late counts, ships-from country, shipping profiles, return policy, production partners | Tracking sync and delivery performance (Phase 6) |
| Customers | The newest reviews with stars, the shop's average and count (replacing the demo's segments) | Customer health and the customer list (a customer store comes with Phase 5) |

The Orders, Products, Shipping and Customers tabs are `built` (no Soon tag, no DEMO pill). Suppliers stays a demo frame.

## States

Loading skeletons (`aria-busy`), no shop connected (a link to Shops), a shop with no orders or listings, a connection that needs reconnecting or lacks a scope (409: "Open Shops"), Etsy not answering with nothing cached (503: "Try again"), and stale data marked "Etsy is not answering · showing data from 10:42". A disconnected shop is never asked for data.

## Rules kept

- Buyer names and tracking numbers come only when the API sends them (Owner, Admin, Operations, Support); the client does not decide.
- Money is formatted symbol first in the shop's currency (`$1,284.50`) and kept left-to-right in `N`; numbers stand apart from their Hebrew labels; English listing titles and reviews carry `dir="auto"`.
- Listing photos load from Etsy's image host: the CSP allows `img-src https://i.etsystatic.com` and nothing else from outside; the referrer stays on this site, and a photo that cannot load falls back to the title's first letter.
- Phase 5 swaps the orders source to HTCO's store; the answers keep their shape, so only the "Live from Etsy" label changes.

## Demo and tests

`?demo=shops` serves invented Etsy data (`src/test/fakeShopData.ts`) for every connected demo shop, different per shop; the fake API's `liveTrouble` option ("unavailable", "stale", "quiet", "hang") drives the error, stale and empty states. `features/commerce/live.test.tsx` covers the screens, roles, states, Hebrew direction and that a disconnected shop is not asked.
