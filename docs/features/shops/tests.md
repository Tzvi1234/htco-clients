# Shops — Tests and verification

## Test plan

| Level | Web |
|---|---|
| Component and flow | Vitest + Testing Library on the in-memory API (`apps/web/src/test/fakeApi.ts`), rendered under StrictMode: `apps/web/src/features/shops/shops.test.tsx` |
| Screenshots (he/en × light/dark) | Open: arrive with the Playwright/Storybook setup (AC-4.6.2) |
| Manual | `pnpm web`, then `?demo` (no shops; connecting asks for the code 123456 and comes back through the callback) or `?demo=shops` (one shop in each connection state), at 1440×900 and 375×812 |

## Acceptance criteria coverage

| Criterion | Tests |
|---|---|
| Connect only for the Owner | `offers the Owner to connect the first shop`, `does not offer a %s to connect a shop` |
| Step-up then redirect | `asks for a code from the authenticator app, then opens Etsy`, `says when the code is wrong…`, `opens Etsy straight away after a recent confirmation` |
| Callback success, reconnect, address cleaned | `finishes the connection once and shows the shop`, `says when a shop was reconnected`, `removes the code from the address bar straight away` |
| Every callback problem | `explains %s` (seven problem slugs), `says when the owner cancelled on Etsy…`, `says when the address has no code` |
| Card states | `shows a healthy connection…`, `asks to reconnect before an expiring connection runs out`, `asks to reconnect a connection Etsy no longer accepts`, `shows a disconnected shop`, `reconnects through Etsy`, Admin and other roles |
| Trademark notice | `shows Etsy's trademark notice` |
| Capabilities (4.5, AC-4.6.1) | `lists each capability in plain words with when it was checked`, `explains the allowed alternative for what is blocked or not known`, `says when nothing was checked yet`, `offers no re-check for a disconnected shop` |
| Re-check | `re-checks on request and says it is done`, `says when to try again after a re-check moments ago`, `lets an Admin re-check` |
| Disconnect (4.7) | `asks for confirmation and does nothing when cancelled`, `confirms with the authenticator code, then shows the shop disconnected`, `disconnects at once after a recent confirmation`, `does not offer an Admin to disconnect`, `shows when a disconnected shop's data is deleted` |
| Remove shop | `offers the Owner a quiet Remove shop at the bottom of the card`, `offers a %s no removal`, `stays disabled until the shop's name is typed, and cancelling removes nothing`, `removes after the name and the authenticator code, then the shop is gone`, `says why when the server refuses, and keeps the shop` |
| Reconnect after the Etsy app key changed | `%s shows the banner with Reconnect, never an empty screen` (Home, Orders, Products, Shipping, Customers), `Reconnect runs the Etsy connect flow: the code first, then Etsy`, `tells a member who is not the Owner who can reconnect`, `shows no banner while the connection works`, `speaks Hebrew`, `Re-check of a connection Etsy refused says to reconnect, in plain words`, `Disconnect that cannot reach the server says so instead of nothing` |
