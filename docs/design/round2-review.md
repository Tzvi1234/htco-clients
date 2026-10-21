# Design round 2 — Hebrew RTL, ui-ux-pro-max and the designer skills (October 2026)

The second pass of the web app's design-quality program, after the Impeccable pass of round 1
([impeccable-audit.md](impeccable-audit.md)). Three skill sets were applied to every screen of
`apps/web`, inside the pinned Design 1C brief ([client ADR-0008](../adr/0008-design-1c.md)):
refinement, not redesign. The palette, Outfit and Heebo, the tweaks, the layouts and the
Demo/Soon conventions are unchanged. Round 3 (a fresh Impeccable pass) finalises.

## Method

- **Skills:** `hebrew-rtl-best-practices` (with its logical-properties map and domain
  checklist); `ui-ux-pro-max` 2.5.0 (its priority checklist, and its local, read-only UX search
  for touch, contrast, empty states and density); the designer skills: the seven visual
  critiques (affordance, brand consistency, colour, composition, information density,
  typography, visual hierarchy), ui-design (spacing system, typography scale, visual hierarchy,
  dark mode, responsive design, layout grid, readable measure, data visualisation),
  interaction-design (form design, loading states, error handling, feedback, micro-interactions,
  animation, navigation, Fitts's law), inclusive-interaction (touch targets, keyboard, motion
  sensitivity, feedback and status), accessible-content (headings, form labels, tables,
  readable content), cognitive-accessibility (cognitive load, error prevention, wayfinding),
  adaptive-interfaces (responsive review, information density, user preferences) and
  design-systems (accessibility audit, tokens, motion, theming, localisation), and UX writing.
- **Coverage:** the 35 routes of round 1 in six variants (1440×900 Hebrew and English, 375×812
  Hebrew, dark, frosted glass, Design 4) on the in-memory API (`?demo`, `?demo=shops`,
  `?demo=mfa`, `?demo=no-workspace`); the live Etsy shop was never called.
- **Evidence:** a DOM and axe-core scan of every route (Hebrew desktop, Hebrew phone with a touch
  pointer, English dark): heading levels, targets under 24 px (pointer) and 44 px (touch,
  counting an extended hit layer), text under 12 px, inputs' `dir`, horizontal overflow, axe
  WCAG 2.2 AA; and a review of each screenshot against the skills' checklists.

| Measure (35 routes × 3 variants) | Before | After |
|---|---|---|
| axe `color-contrast` nodes (office demo screens) | 343 | **0** |
| Phone targets under 44 px (Hebrew, touch) | 202 | **4** (the chat composer's field, the floor's two status bubbles) |
| axe `target-size` nodes | 30 | 15 (the landing page's carousel dots, see "Remaining") |
| Pages with one `h1` and no skipped heading level | 35 | 35 |
| Physical or deprecated layout in stylesheets, class lists and inline styles | 8 + 51 | **0** (the floor map's projected labels are physical by intent, and say why) |

## 1. Hebrew RTL (`hebrew-rtl-best-practices`)

What already held: `lang`/`dir` on `<html>` (`applyLocale`), logical utilities in class lists
(an ESLint rule since slice 3.1), `Ltr`/`N` isolation of codes and numbers, mirrored flyout and
sidebar motion (`--htco-direction`), `Intl` minutes, the crumb chevron mirrored.

Fixed:

- **A guard that fails on physical directions, in three places** (`scripts/`):
  - `eslint-logical-properties.ts` now also checks inline `style` objects (`left`,
    `marginRight`, `textAlign: "left"`… → `insetInlineStart`, `marginInlineEnd`, `"start"`),
    requires an `rtl:`/`ltr:` partner for the utilities that have no logical form
    (`translate-x-*`, `origin-left`, `bg-linear-to-r`), and moves Tailwind 4.2's deprecated
    `start-*`/`end-*` insets to `inset-s-*`/`inset-e-*` — every finding is autofixed. 51 insets
    were migrated.
  - `css-logical-properties.ts` (new, run by Vitest): no `margin-left`, `right:`,
    `text-align: left`, physical radii or asymmetric four-value `margin`/`padding`/`inset` in
    any stylesheet, unless the block says `/* physical: why */`.
  - Physical by intent, and commented: the office floor's 3D labels (placed in projected screen
    pixels), its legend and ticker (they sit in the render's two empty corners), and the floor
    render's department spots (a picture of a place).
- **Icons mirror themselves.** `CrumbIcon`, `ArrowEndIcon`, the new `ArrowStartIcon` and
  `SidebarIcon` flip in right-to-left layouts by themselves (as the kit's Back/Next glyphs
  already did); call sites no longer add `rtl:-scale-x-100`, and the landing page's "previous"
  arrow is a real back arrow instead of a double-flipped forward one. Marks with a fixed meaning
  (check, close, play, search, the down chevron, send ↑) never flip. A test holds both lists.
- **The landing carousel's dots follow the reading direction** (they were forced
  left-to-right while their arrows mirrored).
- **Arrow keys follow the reading direction:** Home's concept tabs are a real WAI-ARIA tablist
  (one tab stop; ← and → move along the reading direction, so → goes back in Hebrew; Home/End).
- **Bidi isolation:** a device's "Last active" date is formatted with `Intl` and isolated in
  `<bdi>` inside the Hebrew sentence; `code`, `samp` and `pre` are left-to-right isolates
  everywhere; `kbd` is an isolate that keeps the page's direction (so `ms-auto` on "Ctrl K"
  still resolves on the page's side — a logical margin resolves against the element's own
  direction).
- **Fields:** every free-text field picks its direction from what is typed (`dir="auto"`:
  names, the chat composer, the command search); email, password and code fields stay
  left-to-right; an empty field's placeholder rests on the page's side.
- **Hebrew typography:** Hebrew running text gets `line-height: 1.5` (Latin keeps 1.4); Hebrew
  is never tracked tighter than normal (the display and number titles' negative tracking
  applies to Latin only; Hebrew's wider emphasis tracking, the DEMO pill, stays); Hebrew
  captions set light (12 px and under) read at 350 instead of Heebo's thin 300.
- **Punctuation:** a one-letter prefix joins a Latin word, a number or a code with the maqaf
  (ב־Etsy, ל־HTCO, ב־12, קוד ה־QR — 25 translations used a hyphen-minus); the trademark notice
  quotes with gershayim (״Etsy״). `hebrewTypography.test.ts` checks every Hebrew translation
  and the Hebrew sample data of the demo screens (no hyphen after a prefix, no ASCII `'`/`"`,
  no `...`).
- **Tables:** numbers and times sit at the end of their column (Engineering's times,
  Customers' order counts), in tabular figures.

## 2. ui-ux-pro-max

Its priority checklist, applied as review (the brief's identity wins over its style and
palette suggestions):

| Priority | Result |
|---|---|
| 1 Accessibility | Contrast of demo text fixed (below); focus ring, skip link, labels, heading order already held. |
| 2 Touch & interaction | **Every control on a touch screen reaches 44 × 44 px** without changing its look (below). Press feedback and pending buttons already held. |
| 3 Performance | No change needed (lazy demo screens, `webp`, transform/opacity motion). |
| 4 Style | One icon family per level; false hover fills removed from static rows (Security's devices, Shops' connecting steps). |
| 5 Layout & responsive | No horizontal scroll on any route at 375 px; tall panels filled (below). |
| 6 Typography & colour | Hebrew typography (above); room labels at the 12 px caption size. |
| 7 Animation | Already 150–300 ms on one curve, reduced motion removes travel. |
| 8 Forms & feedback | `dir="auto"` fields; contextual help notes (below). |
| 9 Navigation | Tab-bar ≤5, current state visible; carousel keyboard fixed. |
| 10 Charts | Charts carry `role="img"` and a label; legends and numbers labelled. |

**Touch targets** (`styles.css`, base layer): on a coarse pointer every link, button, tab,
radio, switch, checkbox, menu item and option gets an invisible layer centred on it that
extends its hit area to 44 × 44 px (`inset: min(0px, (100% − 44px) / 2)`); the control's own
position still wins (the layer is in the base layer), and a control that draws with `::after`
sets `data-hit="own"` (Home's dots, the floor's speech bubbles). On a touch screen the carousel
dots only show the position: they are 6 px apart, and the 44 px arrows beside them move.
A phone journey (`e2e/journeys/touch.spec.ts`) measures every control on Home, Settings and Shops.

## 3. The designer skills

### Visual critique (all seven)

| Critique | Findings | Fixed |
|---|---|---|
| Affordance | Static rows lit on hover (Security's devices, Shops' steps) read as clickable. | Hover fill removed from non-interactive rows. |
| Brand consistency | Token-only, Design 1C intact; maqaf/quotes inconsistent in Hebrew copy. | Punctuation (above). |
| Colour | Demo text ~3:1 after the dimming (axe, 343 nodes); hierarchy by gray only. | Demo legibility (below): 0 contrast failures; secondary still lighter than primary. |
| Composition | Voids in tall panels (Etsy callback, Security, Shops' guide, Engineering's incident); "·" with 8 px on one side and 4 px on the other. | Panels grouped and given useful content (below); `Sep` with equal space. |
| Information density | Comfortable on desktop, phones show fewer things (already). | — |
| Typography | 11 px room labels on the floor; Heebo light thin at captions; Hebrew in negative tracking. | 12 px labels; 350 Hebrew captions; normal tracking for Hebrew. |
| Visual hierarchy | Clear entry points (titles, KPI numbers, ink CTAs). | — |

### UI design

Spacing on the 4/8 px scale; type scale 12/13/14/16/20/24/28/32/40/48/56; the readable measure
holds (descriptions capped at 340–560 px); dark mode is tonal (no shadows on panels), each
mode contrast-checked by `pnpm tokens`. Data visualisation: charts are labelled images, the
matrix and dotted bars keep their numbers beside them.

### Interaction design

Loading states (skeleton shop panels, the callback's waiting dots), errors with a next step,
feedback through status text and glyphs (never colour alone), motion on one curve, Fitts's law
(primary actions full-width on phones, the composer's send at its end). Fixed: the hero's
tablist keyboard, touch targets, contextual help.

### Inclusive interaction, accessible content, cognitive accessibility

Keyboard: one focus ring, skip link, arrow-key tablist (fixed). Motion: reduced motion removes
travel. Headings: one `h1` per page, no skipped levels (all 35 routes). Forms: visible labels,
`autocomplete` on sign-in, errors tied to fields. Tables: `scope="col"`, a name per table,
numbers at the end. Wayfinding: crumbs, the current tab inked, the title in the top bar.

### Adaptive interfaces — the device's preferences (`styles.css`)

- `prefers-contrast: more` — secondary and muted text move toward the ink (82 %) and hairlines
  become strong lines, in every palette and theme.
- `prefers-reduced-transparency: reduce` — frosted glass turns solid even when the tweak asks
  for it.
- `forced-colors: active` — controls keep a `ButtonText` edge and the focus ring uses
  `Highlight`.

### Design systems and UX writing

Two kit parts were added instead of one-off markup: `Sep` (the "·" between facts, equal space,
a comma for screen readers) and `Note` (a quiet line of help at a panel's foot). New copy is
short, says what to do and what is safe ("Don’t recognise a device? Sign it out here. Only
that device is signed out; this one stays signed in.").

## Round 1's remaining findings

| Finding | Fixed |
|---|---|
| Muted sample text on dimmed Demo screens (~3:1) | Demo content draws its secondary and muted text from the ink at a fixed strength (78 % in a frame, 85 % in a part) so it keeps 4.5:1 after the dimming in every mode; demo parts dim to 0.7 (was 0.62). The DEMO pill and Demo tags still say "demo", and primary text stays ink. axe: 343 → 0. |
| 40 px circle buttons and carousel dots under 44 px on phones | The touch hit layer (above); 202 → 4 small phone targets. |
| Large empty areas in tall panels | Etsy callback: a reassurance note at the foot ("HTCO never writes to your shop…"). Security: the second factor reads as one centred group; the devices panel ends with help. Shops' "How connecting works": the three steps are a centred stepper with connectors, the facts close the panel. Engineering's incident: its own timeline (opened, taken, the failed rotation). |
| Spacing around "·" | `Sep` (Settings › Security line, Engineering's incident). |
| Office floor 11 px room labels | 12 px (labels, bubbles, tags). Phones already hide the map labels and show the list. |
| Help and documentation (heuristic 10) | Contextual help notes on Security and the Etsy callback; in-app help still waits for the office. |

## Remaining for round 3 (Impeccable)

- **Landing carousel dots** stay 6 px with a 12 × 24 px target (axe `target-size`): their
  equivalent is the 40 px arrows (WCAG 2.5.8's equivalent exception); on touch screens they
  only show the position. Consider the Home pattern (one tab stop) or larger spacing.
- **The chat composer's field** (21 px tall inside its 56 px pill) and the floor's status
  bubbles are the only touch targets under 44 px; the composer pill could take the focus and
  the tap.
- **Hebrew captions at 350** and Hebrew `line-height: 1.5` change every Hebrew screen slightly;
  confirm with the owner.
- **11 px meta text** remains in chat and team threads (times, file sizes, typing) and in
  Soon/Demo tags — the design's smallest step; consider 12 px.
- **Help and documentation** beyond contextual notes.
- **The bounce on the logo's dot** and the Impeccable sidecar (from round 1).

## Verification

- Unit and component tests: the logical-layout rule (class lists, inline styles, deprecated
  insets, unpaired physical-only utilities, autofix output), the stylesheet scanner and a scan
  of every stylesheet, icon mirroring, Hebrew punctuation over the catalog and the sample data,
  `dir` on fields, and the tablist's arrow keys in English and Hebrew.
- Journeys: a phone journey with a touch pointer measures every control's target on Home,
  Settings and Shops. Screenshot baselines regenerated from CI's Linux run and reviewed (the
  Hebrew leading and caption weight move every Hebrew story; the demo stories show the darker
  sample text; the Etsy callback shows its note).
- After screenshots: 35 routes × 6 variants, compared with round 1's.
