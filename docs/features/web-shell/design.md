# Web shell — Design

## Repository tooling (slice 3.1, part 1)

| Concern | Tool | Where |
|---|---|---|
| Packages and lockfile | pnpm 12.10.1 (pinned with its hash), one workspace | `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` |
| Supply chain | `minimumReleaseAge: 10080` (seven days), `trustPolicy: no-downgrade`, `blockExoticSubdeps`, `strictDepBuilds` | `pnpm-workspace.yaml` |
| Types | TypeScript 6.0.3, strict plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `erasableSyntaxOnly` | `tsconfig.base.json`, `tsconfig.json` |
| Lint | ESLint 10, typescript-eslint `strictTypeChecked` and `stylisticTypeChecked` with the project service | `eslint.config.js` |
| Formatting | Prettier 3 (print width 100); Markdown and token sources are not reformatted | `.prettierrc.json`, `.prettierignore` |
| Tests | Vitest 5 with shuffled order | `vitest.config.ts` |
| Repository scripts | TypeScript run directly by Node 24: Conventional Commits title check, SHA-pin check, test-integrity check | `scripts/` |
| CI | `checks`, `tests`, `security`, `workflows`, `test-integrity`, `pr-title`, aggregated by `ci-gate` | `.github/workflows/ci.yml` |
| Updates | Renovate with a seven-day minimum release age; TypeScript held below 7 | `.github/renovate.json5` |

## Web app (slice 3.3, part 1)

```text
apps/web/src/
  main.tsx            reads the device settings, mounts <App>
  app/                App (providers), router, RouteStates (not found, route error), shell/
  features/           overview, shops, settings
  shared/i18n/        locale (pure), i18n (Lingui catalogs), LocaleProvider (Lingui + React Aria + <html lang dir>)
  shared/theme/       theme (pure), ThemeProvider (<html data-theme>)
  shared/ui/          Button, Ltr, EmptyState, ErrorState, Banner, Logo, PageHeader
  shared/lib/         storage (guarded localStorage), useOnline, cx
  locales/{en,he}/    messages.po
```

- **Tokens only.** `src/styles.css` maps every Tailwind theme namespace (colours, fonts, text sizes, radii by role, shadows, breakpoints) to the generated token variables and clears Tailwind's defaults, so a non-token colour or radius class does not exist. Radii are named by role (`rounded-control`, `rounded-button`, `rounded-card`, `rounded-dialog`, `rounded-pill`) because the token names (`--radius-sm`…) would collide with Tailwind's own variables.
- **Direction.** `LocaleProvider` sets `lang` and `dir` on `<html>`; layout uses logical utilities only, enforced by `htco/logical-properties` (`scripts/eslint-logical-properties.ts`).
- **Theme.** No `data-theme` means "follow the system" (the token CSS has a `prefers-color-scheme` block); light or dark set the attribute. Both choices are remembered per device in `localStorage` (`htco.locale`, `htco.theme`), guarded for blocked storage.
- **Fonts** are self-hosted from `@fontsource-variable` (Outfit, Heebo, JetBrains Mono), so the CSP needs no third-party font origin.
- **Navigation** is the Design 1C sidebar from 640 px and a tab bar below (see "Design 1C shell" below); only one is rendered, so there is never a duplicate landmark.

## Design 1C shell and tweaks (client ADR-0008)

```text
apps/web/src/
  app/shell/          nav.ts (seven areas and their tabs), useNavLabels, ShellState (collapsed sidebar,
                      flyout, palette), AppShell, Sidebar, Flyout, TopBar, TabBar (phones), CommandMenu,
                      ShopSwitcher, UserMenu, DemoRoute
  shared/theme/       tweaks.ts (the shared preference), boot.ts (the inline script before first paint),
                      ThemeProvider.tsx (TweaksProvider, useTweaks, useTheme, useSystemTheme)
  shared/ui/          Panel, PanelHeader, PanelBody, Segmented, LevelDots, SoonTag, DemoBadge, DemoScreen,
                      Toast (ToastProvider, useToast), icons (the prototype's glyphs), Logo
  shared/ui/kit/      the screen kit, one module per family, imported from kit/index.ts:
                      layout (Screen grids l3 … lc3s, Stack), parts (CircleButton, InkDisc, Pill, Chip,
                      Dot, IdBlock, KV, KV2, SectionLabel, Chip (tone, size), TEXT_LINK, Card, Tile, CountUp, Toggle, ListRow,
                      Typing, N), status (StatusGlyph, Status, the nine statuses), avatar (Avatar, Who,
                      Avatars), charts/ (BarChart, LineChart, HBarList,
                      ProgressBar), dotted (Matrix, DotBar: Demo screens only), table (DataTable), strip (Strip,
                      StripCards, StripCard, Zoom), thumb (ProductThumb), form (PillField, ChoiceChips, FilterChips,
                      PillSelect, CodeBoxes), demo (DemoFrame, DemoPart, DemoTag), glyphs, bi (sample
                      text in both languages), kit.css (live motion and the chat, row and stage patterns)
  shared/demo/        office.ts: the 16 employees, departments and machine rooms (the demo's roster)
  features/*/demoScreens.tsx   each area's drawn demo screens by "area/tab", collected by DemoRoute
```

- **One preference.** `readTweaks`, `writeTweak` and `applyTweaks` read and write `htco.theme` and `htco.palette`, and set `data-theme`, `data-pal` and (under reduce transparency) `data-solid` on `<html>`; `migrateAppearance` turns a stored `plain` into `sbb` and forgets `htco.contrast`, `htco.glass` and `htco.borders` (round 3, ADR-0009). Settings is the only place that changes them, with the language. Another tab's change arrives through the `storage` event.
- **Before the first paint.** `TWEAKS_BOOT_SCRIPT` is injected into `index.html` by the `htco-tweaks-boot` Vite plugin; the CSP plugin hashes every inline script of the built page into `script-src`. The boot test runs the script and `applyTweaks` on the same stored values and expects the same attributes.
- **The title lives in the top bar.** `PageHeader` portals its h1 into the top bar's slot (`TopBarSlotContext`) under the crumbs, and renders its description and actions at the top of the page. Outside a shell (stories, the landing page) it renders in place.
- **Panels.** A route without `staticData.layout` gets one panel from the shell (the Etsy callback); a route with `layout: "panels"` lays out its own `Panel`s on one of the kit's `Screen` grids, as every Design 1C screen does.
- **One demo treatment.** A tab that is designed but not built renders its feature's `demoScreens.tsx` entry (collected by `DemoRoute` with `import.meta.glob`; `DemoScreen` is only the fallback for a tab with nothing drawn). The screen sits in `DemoFrame`: the content dimmed a little, `inert` and hidden from assistive technology (or, with `views`, only view controls marked `data-demo-view` work), a press says "Demo — coming soon" in a toast, and the large black DEMO pill ("Sample data · coming soon") is portalled into the top bar and centred there (under the header on phones). A planned part of a real screen is a `DemoPart`: the same dimming, a small Demo tag, the content inert and hidden, "Demo — coming soon" for screen readers.
- **One code entry.** `CodeBoxes` (kit/form.tsx) draws the demo's six boxes over one real `one-time-code` input; sign-in, the authenticator setup, password reset and the shops' step-up dialog all use it.
- **Collapsed sidebar.** Below 1360 px the sidebar starts as a rail until the user chooses (`htco.sidebar`: `mini` or `open`). Collapsed sub-lists are `inert` and hidden from assistive technology, so only what is visible can be reached.
- **Phones.** Under 640 px the shell renders the top bar (with search and the account), the screen and the tab bar; the sidebar is not rendered, so there is one `Main` navigation landmark at every width. The top bar is an iOS-style header: it stays on top over a frosted ground and, once the page scrolls past 24 px, the large title shrinks to an inline one, the crumbs fold away and a hairline appears (`data-scrolled`). On the tab bar one ink pill with the accent dot slides to the current item ("More" for areas off the bar), the content fades out under the bar, and the sheet of every area has a grabber that closes it when dragged down.
- **Sign-in screens** (`features/auth/AuthLayout.tsx`, the demo's `loginHTML()`): two panels, the form on the physical left and the office render on the right in both languages (the grid is left-to-right; each panel keeps the page direction inside). The render is a large, slightly turned crop leaving through the right edge; the demo's four office numbers under it are dimmed and labelled Demo, since there is no live office before sign-in. The authenticator code uses six boxes drawn over one real `one-time-code` input, so typing, paste, autofill and screen readers behave as one field. Forgot, reset, accept-invite, the authenticator setup, no-workspace and not-found share the layout; a screen that fails inside the shell shows one centred panel.
- **Landing page** (`/welcome`): one flowing page (round 3): a layered hero whose planes part on scroll, what works in the web app today, what is coming (labelled) on ink with an example approval that the scroll decides, how it works and the apps on orange (web ready, Windows and Android in development). Its glass bar keeps a language switch and follows the theme and palette chosen in the app. The scroll effects are scroll-driven CSS animations; under reduced motion or without support the page stands still and nothing pins (`docs/design/round3-clarity.md`).
- **Motion.** Route changes cross-fade through View Transitions on the root (`defaultViewTransition`, off under reduced motion); no element gets its own `view-transition-name`, because that would cut glass panels off from the bloom behind them; everything else is CSS on the `motion.*` tokens, removed under reduced motion.

## API client and sign-in (slices 3.6 and 3.5, web)

```text
packages/api-client/  openapi.yaml (pinned), generated/schema.d.ts, src/index.ts (createApiClient)
apps/web/src/
  shared/api/         ApiError, ApiProvider, query factories (session, me, mfa, sessions), needsSecondFactor, safeRedirect
  features/auth/      AuthLayout, SignInPage, SecondFactorPage (set up or confirm), AcceptInvitePage,
                      ForgotPasswordPage, ResetPasswordPage, linkTokens (fragment tokens, password checks)
  features/security/  SecurityPage (two-factor status, signed-in devices)
  test/fakeApi.ts     the API's auth endpoints in memory
```

- **Same origin.** The app calls `/api/...`; in development Vite proxies it to `http://127.0.0.1:8000`, in production the edge routes it to the API (slice 3.8). Cookies stay first-party and `SameSite=Strict` works.
- **Guards.** A pathless `signed-in` route reads the session (401 becomes `null`) and redirects to `/sign-in?redirect=...`; a pathless `app` route reads `/v1/me` and sends an Owner or Admin without `aal2` to `/security/setup`. Both read the cache (`staleTime: "static"`); sign-in, the second factor and sign-out remove the `auth` queries, and a 401 from any query does the same and returns to sign-in.
- **Redirects** after sign-in accept only a same-site path (`safeRedirect`: one leading `/`, no `//`, no backslash).
- **Errors** are mapped from the problem type's last segment (`sign-in-refused`, `too-many-attempts`, `csrf-failed`, `mfa-code-refused`) to calm messages that never say whether the email exists. 4xx responses are not retried.

## Decisions and alternatives

| Decision | Alternatives considered | Why |
|---|---|---|
| TypeScript 6.0 for compiler and lint | TypeScript 7 for compiling, 6 for lint, side by side | Two TypeScript packages fight over the `tsc` binary and the peer resolution; at this size the native compiler's speed buys nothing, and one version keeps lint and compiler in agreement. |
| Code-based TanStack routes | File-based routes with the router plugin | Three routes do not justify a code generator; switch when the route tree grows. |
| Lingui macros compiled natively by `@lingui/vite-plugin` (`macroTransform`) | Babel or SWC plugin | No Babel in the Vite 8 toolchain. |
| Catalog origins without line numbers (`formatter({ lineNumbers: false })`) | Line numbers (Lingui's default) | Reformatting code shifted line numbers and put the catalogs out of sync in CI; file names are enough to find a message. |
| `semver@6.3.1` excluded from `trustPolicy` | Drop `eslint-plugin-react-hooks` | The npm team's 2023 ReDoS backport predates provenance on the 6.x line; the exclusion names that exact version only. |
| Repository scripts in TypeScript, run by Node | Reuse the platform's Python scripts | Each repository builds with its own toolchain (ADR-0001 in `htco-platform`); the scripts are small and tested here. |
| `uvx` for actionlint and zizmor in CI | Release binaries with checksums | The same versions as the platform repository, no Python project needed. |
