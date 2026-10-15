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
