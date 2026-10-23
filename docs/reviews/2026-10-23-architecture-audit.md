# Architecture and design-system audit, 2026-10-23

This audit read the web app on `main` at `4426b27`, after round 4 (#43). It checked the code against these sources:

- [CLAUDE.md](../../CLAUDE.md) and [DESIGN.md](../../DESIGN.md);
- the design rounds [2](../design/round2-review.md), [3](../design/round3-clarity.md) and [4](../design/round4-brightness.md);
- client ADR-0008 and ADR-0009;
- [CLIENT_ARCHITECTURE](../architecture/CLIENT_ARCHITECTURE.md) and [ACCESSIBILITY](../ux/ACCESSIBILITY.md);
- the tokens in `packages/design-tokens` and the kit in `apps/web/src/shared/ui/kit`.

The platform has its own report, `htco-platform/docs/reviews/2026-10-23-architecture-audit.md`. Its P0 also concerns the clients: the Orders screens and their API must move onto the stored order before slice 5.6 builds a second endpoint and slice 5.7 builds a second Orders UI.

Paths below are relative to `apps/web/src` unless they start with another folder.

**Severity** measures the risk to maintainability:

- **P1:** two sources of truth, or a rule that drifts silently.
- **P2:** contained duplication or a gap in a rule.
- **P3:** hygiene.

**Screens.** The real screens have `built: true` in `nav.ts` and `scroll: "page"` in `router.tsx:177-226`: Home, Shops, Orders, Products, Shipping, Customers, Settings, Security and Members. Office, Work, Finance, Admin and the customer demos are demo-only.

## What holds

- **RTL:** no physical classes or properties. ESLint `htco/logical-properties` and `scripts/css-logical-properties.ts` enforce this. The only physical CSS is in `floor.css` (lines 38, 58, 155, 190 and 210), where each use is commented as deliberate because the map is a picture.
- **Hebrew catalog:** complete. `he` and `en` each have 1,225 msgids, with 0 empty and 0 fuzzy entries. Four Hebrew entries contain no Hebrew letters (Android, Etsy, "Etsy:", Windows), which is correct.
- **Orange is the only emphasis colour.** No lilac, hue or brand class is used for emphasis on any screen.
- **One focus panel.** Every real screen has exactly one `<Focus>` inside `<Flow>`. Settings has none, as its Part A design intends.
- **Status words:** the dots checked all have a word beside them (`live.tsx:298`, `ProductsPage:271` "Sold out", the Late columns on Orders and Shipping).
- **Contrast at the token level:** `packages/design-tokens/src/contrast.ts:67-82` checks the round-4 pairs on `tertiary.subtle`, and `tertiary.on-inverse` at 4.5:1. That is 225 pairs × 114 modes, plus the nav glass (`test/contrast.test.ts:97-103`, `:142`).

## Findings

### P1-1: two in-house icon sets, plus Phosphor

- `shared/ui/icons.tsx:13` and `shared/ui/kit/glyphs.tsx:8` each define a `glyph()` helper and duplicate icons:
  - `CheckIcon` and `CheckGlyph`, and `CloseIcon` and `CloseGlyph`, have identical paths.
  - `ArrowEndIcon`/`NextGlyph`, `BellIcon`/`BellGlyph`, `SearchIcon`/`SearchGlyph`, `ChatIcon`/`ChatGlyph` and `BoltIcon`/`BoltGlyph` are the same icons in both sets.
- `@phosphor-icons/react` (`apps/web/package.json:26`) is left over from Relay. Client ADR-0007, which chose it, is superseded, and round 4 says "icons stay ours". Yet Phosphor is still used:
  - imported directly in `features/auth/SecondFactorPage.tsx:2` (`ShieldCheckIcon`);
  - typed into the `icon` props of `shared/ui/Banner.tsx:1`, `EmptyState.tsx:1`, `TextField.tsx:1` and `Tag.tsx:1`.
- **Fix:**
  - One icon module (the kit's glyphs).
  - The `icon` props take the house glyph type.
  - `SecondFactorPage` uses `ShieldGlyph` (`glyphs.tsx:93`).
  - Then drop Phosphor, with the owner's OK.

  This changes visuals, so it goes in a design-cleanup slice before Phase 6 adds screens.

### P1-2: features import each other's internals; commerce and shops import each other

- `features/commerce/live.tsx` works as a shared library. It holds `useMoney`, `useCount`, `useShortDate` (`:235-263`), `LiveNote` and `ReconnectNotice`, and is imported by shops (4 files), overview and customers.
- There is an import cycle: `live.tsx:10-11` imports `shops/connectEtsy` and `shops/time`, while shops imports `commerce/live` and `commerce/refunds`.
- `FormAlert` lives in `features/auth/AuthLayout.tsx:199`, but `commerce/live`, `shops/Capabilities`, `connectEtsy` and `ShopsPage` use it.
- Finance imports `useZoomLabels` from `admin/AdminDemos`, and customers imports `commerce/ShopChips`.
- CLIENT_ARCHITECTURE §4 puts formatters in `shared/i18n`, which has none.
- **Fix (mechanical moves; Phase 6 will add more importers, so do it first):**
  - Formatters go to `shared/i18n/format.ts`.
  - `FormAlert` goes to `shared/ui`.
  - `ago`/`useNow` go to `shared/lib`.
  - `ShopChips` and `LiveNote` go to the kit.
  - Add an ESLint `no-restricted-imports` rule: a feature may not import another feature.

### P1-3: the choice and filter chip is hand-written four times

- The kit has `CHOICE_CHIP` and `ChoiceChips` (`kit/form.tsx:66-76`).
- Raw `<button aria-pressed>` chips appear at:
  - `OrdersPage.tsx:99` (`FilterChip`);
  - `ProductsPage.tsx:219`;
  - `commerce/ShopChips.tsx:20`.
- `WorkspacePicker.tsx:4` has its own `CHIP`, with a different height (h-8, not h-9), different border tokens, `font-medium`, and a ring focus style instead of the outline.
- **Fix:** add one kit `FilterChips` (a toggle with a count slot) and use it in all four places. This is a small refactor, but it changes visuals.

### P2-1: font sizes off the type scale

- **Fixed in #45:**
  - on-scale literals in `kit.css` and `floor.css`;
  - `text-[32px]`, `text-[40px]` and `text-[28px]` in `ChatPage`, `connectEtsy`, `shopActions` and kit `parts.tsx`.

  A new test, `scripts/css-type-scale.test.ts`, keeps the stylesheets on the scale.
- **Open, because each needs a visual decision:**
  - **11px**, which round 3 retired. It survives in:
    - `kit/demo.tsx:144` (`DemoTag`, which appears on every real screen that has a demo part);
    - `shared/ui/SoonTag.tsx:14` (shown in the nav);
    - `CommandMenu.tsx:92` and `:109`;
    - `CustomersDemos:90`, `:119` and `:400`;
    - `kit.css:219`, `:363`, `:412`, `:432` and `:537`.

    Moving these to `text-caption` (12px) changes the screenshots.
  - `text-[24px]` without `leading` in `kit/avatar.tsx:8` and `ProductsPage:370`. Moving it to `text-title-lg` also changes the line height.
  - `floor.css:205` uses 12.5px, and `demo.tsx:45` uses 26, 20 and 15px.

### P2-2: radii

- **Fixed in #44:**
  - Every literal radius that has a role now uses it: 4px is `tag`, 6px is `control`, 16px is `card`, 22px is `panel`, and the new `menu-item` role is 12px.
  - The ESLint rule `htco/token-radii` refuses new ones.
- **Open:** off-scale values that need a role or a snap to the scale:
  - `rounded-[8px]` (`charts/BarChart.tsx:186`);
  - `kit.css:216` (10px), `:421` (20px) and `:310` (2px);
  - `floor.css:172` (18px);
  - `TabBar:65` (28px).

### P2-3: motion and layers

- **Fixed in #44:** `flow.css` now uses `var(--motion-easing-out)`, and BarChart uses `--motion-duration-fast`.
- **Open:**
  - 260ms (`flow.css:37-38`) and 220ms (`:59`) are not on the motion scale, which has 240 screen and 280 slow.
  - `floor.css:176` has a literal shadow, nearly `--elevation-popover`.
  - There are **no z-index tokens.** The ad hoc values are `z-10` (4), `z-20` (5), `z-30` (2), `z-50` (8), `z-60` (1), `z-[1]` (2) and `z-[4]` (1).
- **Fix:** add layer tokens (base, raised, sticky, overlay, toast) and a lint rule. This is a design-token decision.

### P2-4: the same component exists in `shared/ui` and in the kit; several `shared/ui` parts are dead

- `DemoTag` (`kit/demo.tsx:139`: h-5, 11px, "Demo") vs `DemoBadge` (`SoonTag.tsx:27`: h-6, caption, "Demo — coming soon").
- Kit `Status` (`kit/status.tsx:144`) vs shared `StatusDot`/`StatusLabel`, which are used nowhere outside stories.
- `CircleButton` (12 files) vs `IconButton` (unused).
- `Figures`/`Figure` (`flow.tsx`, 10 files) vs `Kpis`/`Kpi` (`parts.tsx:498-512`, unused).
- `Segmented` vs `ChoiceChips`.
- `DecisionRing` is unused outside stories. `Tag` and `ObjectIcon` are used only by `EmptyState` and `HBarList`.
- **Fix:**
  - Delete the unused parts, with their stories and baselines.
  - Keep one Demo marker.
  - Then fold the rest of `shared/ui` into the kit, so there is one component library.

  The deletions change the Storybook baselines, so they go in a separate PR.

### P2-5: more repeated hand-written patterns

- An inline `<span>` duplicates the kit `Chip` classes (`parts.tsx:139`) at `ProductsPage:414` and `ShopCard:300`.
- Orange-tinted status chips are hand-written at `ProductsPage:270` and `commerce/refunds.tsx:41`. Add a `tone="tertiary"` option to `Chip`.
- The text-link class string appears five times: `AuthLayout:194`, `OverviewPage:396` and `:615`, `WelcomePage:59`, and `OrdersPage:230`. Make it a kit `TextLink`.
- 29 files hand-roll cards with `rounded-card` plus a border or a background, for example `ShopCard` (×3) and `live.tsx` (×3). Sweep them onto the kit card.

### P2-6: the no-inner-scroll rule is not guarded on Settings

- `shared/ui/Panel.tsx:68` `PanelBody` scrolls by default (`overflow-auto`), and `SettingsPage` uses it five times (`:72`, `:99`, `:159`, `:214` and `:267`).
- Settings is missing from `SCREENS` in `e2e/journeys/clarity-screens.spec.ts:11-20`.
- **Fix:** add `["Settings", "/settings"]` to `SCREENS`, and drop `overflow-auto` from the default. Verify in CI with the e2e baselines.
- `OrdersPage:684` scrolls inside a modal dialog, which is allowed.
- Demo screens scroll inside panels in many places:
  - `CustomersDemos:145`, `:172` and `:365`;
  - `work/demoScreens:108`, `:283`, `:347` and `:463`;
  - `kit.css:183` (`.k-scroll`) and `:392` (`.k-thread`).

  This is allowed today, but it must go when those screens are built.

### P2-7: the 3D office still uses the retired Cream (`d4`) colours

- `floor3d/palette.ts:3` and `:174-188` use lilac `#8C76D6` as the accent and lemon `0xedd803` for "waiting for you". ADR-0009 §4 retired both, and the generated `d4` tokens now use orange (`--accent-fill: #ff7f36`).
- The text is stale too: the comment at `styles.css` (~line 49, "lilac in Design 4") and the DESIGN.md front matter (`d4-lilac`, `d4-lemon`).
- Office is a demo screen, so this breaks no rule on a real screen yet.
- **Fix:** switch the `d4` values in `palette.ts` to orange. This changes visuals, so it goes in the next Office pass.

### P2-8: contrast tests stop at the tokens

- The screen-level axe run (`clarity-screens.spec.ts:62-66`) covers only the light theme and the default Gray palette. It has no dark theme, no Cream palette and no Settings.
- Colours outside the tokens are never checked:
  - `kit/thumb.tsx:37-77`: 12 light-only colours that also show in dark mode.
  - The text drawn on the 3D canvas (`scene.ts:369-465`).
- **Fix:** run the screen spec in dark and Cream as well, and move the thumbnail colours to tokens.

### P3 findings

- **Uneven feature folders.** The documented rule is "UI, hooks, tests per feature".
  - customers, finance, security and work have no tests; admin has only `demoFrames.test`.
  - Demo files are named two ways: `demoScreens.tsx` plus `XDemos.tsx`, or `demoScreens.tsx` alone.
  - Feature CSS exists in only 4 features.
  - Demo data is spread across `data.ts`, `work/agents.ts`, `shared/demo/office.ts` and `test/fakeShopData.ts`.
  - The feature list in CLIENT_ARCHITECTURE §4 (orders, incidents, approvals…) does not match the real folders.
  - **Fix:** one template (`XPage.tsx`, `demoScreens.tsx`, `x.test.tsx`, optional `x.css`), and update §4.
- **Retired token modes.** ADR-0009 keeps 114 modes generated and checked, although `shared/theme/tweaks.ts:96` never sets the tweak levels t1-t3 or the `plain` palette. The tokens file is 56 KB. Whether to prune them is the owner's decision.
- **Docs:**
  - **Fixed in this PR:**
    - The client ADR index had no row for ADR-0009, and its status line used another format.
    - `design/COMPONENT_SPEC.md` still presented the Relay table as current.
  - **Open:**
    - Round 4 (orange emphasis) has no ADR; decide whether it amends 0009.
    - The orders and statistics screens (#38–#40) have no feature doc.
- **Allowed literals, no action:**
  - the Logo mask `#fff`/`#000` (`Logo.tsx:41-42`, mask luminance);
  - the WebGL palette, which cannot read CSS variables;
  - test fixtures;
  - order numbers such as `#3152`.

## Fixed with this audit

| PR | Change |
|---|---|
| #44 | Radius role tokens (+ `menu-item`) and the `htco/token-radii` ESLint rule; motion tokens in `flow.css` and BarChart. Visually identical |
| #45 | Type-scale tokens in stylesheets and kit parts, and the `css-type-scale` test. Visually identical |
| This PR | This report; client ADR index row for 0009 and its status format; COMPONENT_SPEC's Relay table marked historical |

## Proposed refactors, with a suggested phase

| Refactor | Phase |
|---|---|
| Move the Orders screens and API onto the stored order (platform P0-1) | Before slices 5.6 and 5.7 |
| Feature boundaries: move shared formatters, `FormAlert` and chips out of features; add a no-cross-feature import rule (P1-2) | Design cleanup before Phase 6 screens |
| One icon set, Phosphor dropped (P1-1) | Same cleanup, with the owner's OK |
| Kit `FilterChips`, `TextLink` and Chip `tone`; card sweep (P1-3, P2-5) | Same cleanup |
| Merge `shared/ui` into the kit, delete the dead parts (P2-4) | Same cleanup |
| 11px moved to caption; off-scale radii and durations; z-index layer tokens (P2-1, P2-2, P2-3) | A token round, with new baselines |
| Settings in the clarity spec; `PanelBody` without inner scroll; dark and Cream axe runs (P2-6, P2-8) | Next clarity pass |
| Office palette in orange (P2-7) | Next Office pass |
| One feature-folder template (P3) | With the cleanup |
