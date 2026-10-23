---
name: HTCO OS — Design 1C
description: The owner's Design 1C for the HTCO web app — white panels on a bright gray ground, orange for what is current and what needs you.
colors:
  ground: "#f5f5f3"
  panel: "#ffffff"
  raised: "#f1f1ef"
  sidebar: "#ffffff"
  hover: "#eeeeec"
  card: "#ffffff"
  ink: "#000000"
  ink-hover: "#262626"
  on-ink: "#ffffff"
  text-secondary: "#575757"
  line: "#e0e0dd"
  line-strong: "#d2d2cf"
  sbb-orange: "#ff7f36"
  orange-text: "#af4000"
  orange-wash: "#ffe0cc"
  success-text: "#347216"
  d4-cream: "#f3f4ee"
  d4-lilac: "#8c76d6"
  d4-lilac-wash: "#d8cfee"
  d4-lemon: "#edd803"
  dark-ground: "#0e0e0f"
  dark-panel: "#1b1b1d"
  dark-ink: "#f7f7f7"
typography:
  hero:
    fontFamily: "Outfit Variable, Heebo Variable, system-ui, sans-serif"
    fontSize: "56px"
    fontWeight: 300
    lineHeight: "60px"
    letterSpacing: "-0.015rem"
  display:
    fontFamily: "Outfit Variable, Heebo Variable, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 300
    lineHeight: "44px"
    letterSpacing: "-0.015rem"
  title:
    fontFamily: "Outfit Variable, Heebo Variable, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 300
    lineHeight: "28px"
  body:
    fontFamily: "Outfit Variable, Heebo Variable, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Outfit Variable, Heebo Variable, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 300
    lineHeight: "16px"
  code:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  tag: "4px"
  control: "6px"
  menu-item: "12px"
  card: "16px"
  panel: "22px"
  pill: "999px"
spacing:
  gap: "8px"
  gutter: "24px"
  side-column: "300px"
  strip-row: "184px"
  sidebar: "264px"
  rail: "72px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "32px"
    padding: "0 16px"
  circle-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "40px"
  panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
  card:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.card}"
  field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px"
  nav-item-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.pill}"
---

# Design System: HTCO OS — Design 1C

The tokens are generated from `design/tokens/` (DTCG) into `@htco/design-tokens/tokens.css`;
the values above are the default mode (SBB, light, tweaks at 1). The palette, theme and tweaks
are attributes on `<html>` (`data-pal`, `data-theme`, `data-t1`…`data-t3`) and every value
follows them. [Client ADR-0008](docs/adr/0008-design-1c.md) records the decisions; the owner's
prototype is the visual source.

## Overview

**Creative North Star: "The Quiet Control Room"**

Design 1C is the owner's own design: floating panels on a calm gray ground, a floating sidebar,
and a top bar that carries the page's light 24 px title. Nothing shouts. What is current is ink
(the selected tab, the primary button, the chosen segment); everything else is gray and hairline.
One accent, orange (lilac in Design 4), marks what needs the owner and what is live.

The density is an operations room's: 300 px side columns, 8 px gaps between panels, 24 px
gutters inside them, label-over-value pairs, round outline buttons in panel headers, and plain
charts in the tertiary orange (bars, a line, horizontal bars). Hebrew and English are equals; the
whole layout mirrors, and time in a chart runs in the reading direction (the newest at the left in
Hebrew).

The design breathes rather than decorates: LED-like pulses on live things, panels that enter one
after another, screens that settle back and arrive along the navigation's direction, and the
navigation and top bar on frosted glass, opening and closing on one spring-like curve (round 3).

**Key Characteristics:**

- Panels on a gray ground; panels never sit inside panels, cards sit inside panels.
- Ink for the current thing; one accent; text grays darkened to pass WCAG AA in every mode.
- Light display type (300) for titles and numbers, regular (400) for body, 12 px light labels.
- Pills and circles for every control; 22 px panels, 16 px cards.
- Demo content is always dimmed and named: DEMO pill, Demo tag, Soon tag.

## Colors

A neutral gray world with a single warm accent; Design 4 swaps it for cream and lilac with a
lemon for attention.

### Primary

- **SBB Orange** (`sbb-orange`): the accent fill and mark — live dots, the current item's mark,
  the attention fill under ink text. Never text on a light ground (1.9:1); as text it becomes
  **Burnt Orange** (`orange-text`).
- **Ink** (`ink`): the current item, the primary button, the chosen segment, focus rings.

### Secondary

- **Design 4 Lilac** (`d4-lilac`) with **Lilac Wash** (`d4-lilac-wash`) for selection, and
  **Lemon** (`d4-lemon`) for attention, on **Cream** (`d4-cream`).

### Neutral

- **Ground** (`ground`) behind everything; **Panel** (`panel`) for the floating surfaces;
  **Raised** (`raised`) for cards, menus and the selected row; **Sidebar** (`sidebar`).
- **Secondary Text** (`text-secondary`): labels and meta lines, darkened from the prototype's
  `#9a9a9a`/`#6f6f6f` to pass AA.
- **Hairlines** (`line`, `line-strong`) for dividers and control outlines.
- Dark theme: light ink (`dark-ink`) on charcoal (`dark-ground`, `dark-panel`), the accent kept.

### Named Rules

**The One Accent Rule.** Orange (or lilac) appears only as a live mark, the attention fill or
the selection wash; it is never decoration and never body text on a light ground.

**The Honest Gray Rule.** A gray that fails 4.5:1 as text is a non-text colour (icons, marks);
text uses the AA-solved `text.*` tokens of the mode in use.

## Typography

**Display Font:** Outfit (Latin and numbers)
**Body Font:** Outfit for English, Heebo for Hebrew (`:root:lang(he)`)
**Label/Mono Font:** JetBrains Mono, only for codes and versions

**Character:** a geometric sans set light for titles and numbers, which makes the big figures
(revenue, counts, identifiers) quiet and precise; Heebo matches its proportions in Hebrew.

### Hierarchy

- **Hero** (300, 56 px, 60 px): the landing page's headline only.
- **Display** (300, 40–48 px): the big identifier and KPI numbers of a panel.
- **Title** (300, 24 px, 28 px): the page title in the top bar.
- **Body** (400, 14 px, 20 px): rows, messages, field values. Panel titles are 13 px regular.
- **Label** (300, 12 px, 16 px): labels over values ("Shop:", "Status:"), meta lines, crumbs.

### Named Rules

**The Label-Over-Value Rule.** Facts are a 12 px light label over a larger value; the label
names, the value speaks. This is the design's own pattern, not an eyebrow over a heading.

**The Tabular Rule.** Numbers in tables, KPIs and timers use tabular figures and are isolated
left-to-right inside Hebrew.

## Layout

The shell is a floating sidebar (264 px, a 72 px rail below 1360 px or by choice, with a flyout
of the area's tabs) beside a column of the top bar (72 px) and the screen. Screens lay out panels
on the demo's grids (`Screen`: `l3`, `l3s`, `l2`, `lc3s`…): 300 px side columns, a 184 px strip
row, 8 px gaps. On those grids, from 1200 px the screen fills the height and each panel scrolls on its own; from
900 px panels sit two to a row; under 640 px (phones) panels stack in the page under an iOS-style
top bar whose large title shrinks on scroll, above a floating tab bar (Home, Office, Work,
Commerce, More). Phones show fewer things, not smaller ones; KPI rows scroll sideways.

**The clarity layout (round 3, `kit/flow.tsx`).** Every screen with a real feature (Home,
Shops, Orders, Products, Shipping, Customers, Members & access, Security) scrolls as one page and
reads the same way: one **focus** panel on top (a light 24 px title, one sentence of what matters
now, up to four key figures with hairlines between them, the one primary action), then the work
in rows of panels grouped by what belongs together, a side column, and
**sub-tabs** (an ink capsule that glides to the chosen pill) when there is too much for one page.
No panel scrolls on its own; long lists page with "Show more". The figure that needs the owner
carries the accent (its text colour and dot), and so does a table row or card that needs him (the
accent's wash). Demo-only tabs carry the Demo tag in the tab.

Inside panels: a 56 px header (title, quiet meta, actions at the end), 24 px gutters, rows with
12 px padding and hairline dividers. Cards side by side keep their rows level.

## Elevation & Depth

Tonal layering first: ground, panel, raised, card. Panels carry no shadow at rest
(`elevation.panel: none`); the sidebar has a soft lift and a top highlight; menus, the palette
and the DEMO pill use the popover shadow (`0 18px 40px -22px rgba(0,0,0,.35)`). The sidebar,
flyout, phone tab bar and top bar are frosted glass (`data-glass`), solid under the device's
"reduce transparency"; panels stay solid.

**The Flat Panels Rule.** Depth comes from tone; a shadow means something floats above the
page (sidebar, menu, dialog, pill).

## Shapes

Circles and capsules from the logo: every button, field, segment and chip is a pill; icon
buttons are 40 px circles with a hairline; panels 22 px, cards 16 px, menu items 12 px, tags
4 px. Only radii that exist as tokens may be used (`rounded-tag/control/card/panel/pill` or an
explicit value) — Tailwind's own radius scale is removed.

## Components

### Buttons

- **Shape:** pills (`rounded.pill`); 28, 32 and 40 px tall.
- **Primary:** ink fill, white text; hover lightens the ink; press scales to 0.98.
- **Secondary:** transparent with a strong hairline; hover darkens the hairline and fills hover.
- **Circle button (`.cb`):** 40 px outline circle with an icon, named by its label and tooltip.
- **Focus:** one 2 px ink ring, 2 px offset, following the control's radius, on every control.

### Charts

- **Kit:** `BarChart` (counts per day or month), `LineChart` (an amount over time, over a soft
  area), `HBarList` (rankings: top products, countries) and `ProgressBar`, hand-drawn in
  `shared/ui/kit/charts/`; no chart library. The dotted matrix and strip are kept for Demo screens.
- **Colour:** the current or best period in the full tertiary orange, the other bars in a lighter
  wash of it (`.k-bar-soft`); the line in `tertiary-text` so it holds 3:1 on every ground. Values,
  axis labels and tips use the text tokens, never orange.
- **Reading:** every bar carries its value as text (or the key ones, for long series) and a tip on
  hover or tap; gridlines are dashed hairlines. Each chart is one image named with every value.
- **Direction:** values come oldest first and the columns follow `dir`, so the newest period is at
  the left in Hebrew and at the right in English. Under 28rem, long axes name every other column.

### Chips and tags

- **Chip:** 24 px raised capsule for facts ("Policy …", "Risk low" with a dot).
- **Choice chips:** outline pills; the chosen one is ink.
- **Demo tag:** 20 px raised capsule with an orange dot and "Demo"; **Soon tag** beside unbuilt
  tabs.

### Cards / Containers

- **Panel:** `panel` fill, 22 px, hairline edge, no shadow, solid.
- **Card / tile:** `raised` fill, 16 px, 16–24 px padding; KPI tiles hold label over number.

### Inputs / Fields

- **Style:** 48 px pill with a strong hairline, 20 px inline padding, 12 px light label above.
- **Focus:** the pill's border turns ink (focus-within); invalid turns danger with a message.

### Navigation

- **Sidebar categories:** 48 px rows with a 40 px icon disc; the other areas' discs are
  light (white with a hairline); the current area is the whole row as an orange-tinted pill,
  its glyph and name in the orange text colour; tabs hang from a hairline
  connector; the current tab is an orange-tinted pill (`tertiary.subtle`) with its label in
  `tertiary.text` and the orange dot (round 4). The flyout follows the same rules.
- **Top bar:** crumbs (12 px) over the light title; approvals and search as 40 px circles, on
  frosted glass; personalisation lives in Settings (theme, palette, language).
- **Phone tab bar:** a floating glass capsule; the current tab is an orange-tinted pill with
  its glyph and label in orange.
- **Primary buttons:** stay ink; their glyph is orange (`tertiary.on-inverse`, checked at 4.5:1
  on the ink).
- **Sub-tabs inside a screen:** the chosen one sits under an orange-tinted capsule that glides
  to it, its label in `tertiary.text`. Filters and segmented choices stay ink.
- **Focus panels:** a soft orange wash from the inline start (the title's side), dropped under
  more contrast and forced colours; the figure that needs the owner is orange and set at 400.
- **Icons:** our line glyphs only; orange is at most the glyph colour, never an orange disc
  behind an icon. See [round 4](docs/design/round4-brightness.md).

### Demo frame (signature)

Unbuilt screens render the prototype's full screen at reduced light (opacity 0.78), inert,
under a large ink **DEMO** pill centred in the top bar; real screens dim unbuilt parts
(opacity 0.7) and tag them "Demo". A press says "Demo — coming soon". Inside demo content,
secondary and muted text are drawn from the ink at a fixed strength (`.k-demo`,
`.k-demo-part`), so sample text keeps 4.5:1 after the dimming in every mode.

## Do's and Don'ts

### Do:

- **Do** build screens from the kit (`apps/web/src/shared/ui/kit/`) and tokens only.
- **Do** keep one ink "current" per group and one accent per meaning.
- **Do** keep the 2 px ink focus ring visible on every control (it lives outside cascade layers
  so utilities cannot hide it).
- **Do** isolate codes, numbers and money left-to-right in Hebrew, and localise units ("12 דק׳").
- **Do** give small text links and segment items at least a 24 px target.
- **Do** let touch screens reach 44 px targets through the hit layer in `styles.css` (a control
  that draws with `::after` sets `data-hit="own"`).
- **Do** keep layout logical: `scripts/eslint-logical-properties.ts` and
  `scripts/css-logical-properties.ts` fail on physical directions; a block that is physical by
  intent says `/* physical: why */`.
- **Do** write Hebrew with the maqaf after a prefix (ב־Etsy) and with ׳ ״ (דק׳, ״Etsy״); Hebrew
  text keeps normal letter-spacing, 1.5 leading and 350 for light captions.
- **Do** use `Sep` for "·" between facts and `Note` for a line of help at a panel's foot.

### Don't:

- **Don't** put panels inside panels, or add shadows to panels at rest.
- **Don't** use orange as text on a light ground, or decorative colour of any kind.
- **Don't** use Tailwind radius names that are not tokens (`rounded-xl`, `rounded-3xl`): they
  render square.
- **Don't** use overshooting (bounce) curves outside the logo's dot drop; motion uses
  `cubic-bezier(.2,.7,.2,1)` at 150/200/280/300 ms and disappears under reduced motion.
- **Don't** let a Demo tag sit on top of real or sample text.
