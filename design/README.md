# HTCO Design System — Design 1C

| | |
|---|---|
| **Status** | Version 3, "Design 1C" ([client ADR-0008](../docs/adr/0008-design-1c.md)); replaces Relay (ADR-0007) |
| **Source** | The owner's prototype "HTCO · Design 1C", copied 1:1; this repository's [`tokens/`](tokens/README.md) (DTCG 2025.10), this brand book and [`COMPONENT_SPEC.md`](COMPONENT_SPEC.md) |
| **Brand assets** | [`../assets/brand/`](../assets/brand/) |
| **Contrast check** | `pnpm check`: 225 token pairs in each of 114 modes (palette × theme × tweaks) and in the navigation's fixed glass over the plain ground (4 more), in `packages/design-tokens` |

HTCO is the operating system for a marketplace business: verified orders, fulfillment and money, plus an AI workforce that acts under policy and asks before anything risky. The promise is **autonomy you can audit**: "Your shop runs. You decide."

## The idea

Calm panels floating on a gray ground. Ink for what is current, one accent for what matters, light type for titles and numbers, round pills for every control. Orange, the logo's colour, is the third colour beside gray, black and white: emphasis, what needs the owner, key numbers and selection, never decoration. The navigation and the top bar are frosted glass.

## The personal settings (round 3)

Three settings, set in Settings only ([ADR-0009](../docs/adr/0009-clarity-round-3.md)). They are one preference for every HTCO interface (the web app, the landing page, the phone layout, later the native apps), remembered per origin and applied as attributes on `<html>` before the first paint.

| Setting | Where | Choices |
|---|---|---|
| Theme | `data-theme` | **System** (no attribute; follows the device live, the default) · Light · Dark |
| Palette | `data-pal` | **Gray** (`sbb`, gray, black and orange, the default) · **Cream** (`d4`, a warm cream ground with the same orange) |
| Language | `lang`, `dir` | עברית · English |

The earlier tweaks (contrast, frosted glass, borders) are no longer choices: their token modes stay generated and checked, but the app sets none of them. Glass is fixed on for the navigation and the top bar (`data-glass`); the device's "reduce transparency" makes it solid (`data-solid`).

## Colour

| Role | SBB light | SBB dark | Design 4 light | Design 4 dark | Token |
|---|---|---|---|---|---|
| Ground | `#ECECEB` | `#0E0E0F` | `#F3F4EE` | `#0F0E13` | `bg.ground` |
| Panel | `#FFFFFF` | `#1B1B1D` | `#FFFFFF` | `#1C1B22` | `bg.panel` |
| Raised (chips, bubbles, selected) | `#F5F5F4` | `#29292C` | `#F3F4EE` | `#29282F` | `bg.raised`, `bg.selected` (D4 `#D8CFEE`) |
| Sidebar | `#FFFFFF` | `#19191B` | `#FFFFFF` | `#1A191F` | `bg.sidebar` |
| Ink (text, current item) | `#000000` | `#F7F7F7` | `#000000` | `#F7F8F2` | `text.primary`, `inverse.bg` |
| Accent | orange `#FF7F36` | orange | lilac `#8C76D6` | lilac `#A996E8` | `accent.mark`, `accent.fill` |
| Attention | orange | orange | lemon `#EDD803` | lemon | `attention.fill` |
| Lines | `#E3E3E2`, `#D4D4D3` | `#2E2E31`, `#3E3E42` | `#E3E4DE`, `#CBCCC6` | `#2F2E36`, `#403F48` | `border.subtle`, `border.strong` |

- **Text is always AA.** The prototype's `--mute`, `--soft`, the orange, lilac and lemon fail 4.5:1 as text on its panels. They keep their look where they are not text (`icon.faint`, `accent.mark`, `attention.fill`, the logo); text uses `text.secondary`, `text.muted`, `accent.text`, `attention.text`, which are solved per mode against every surface, glass included.
- **The inverse fill** (`inverse.bg` with `inverse.text`) marks what is current: the active area circle, the current tab pill (with the accent dot, `accent.on-inverse`), the primary button, the chosen segment.
- **Attention fills** carry ink text (orange or lemon badges and counters). Status is a dot plus a word, never colour alone.
- **Data colours** from Relay (tag and presence hues, illustration) remain for tags, AI employee flags and brand art until those screens are redesigned.

## Glass and the bloom

Tweak 2 makes panels, the sidebar and menus translucent with a backdrop blur (`glass` utility; 18 px, or 30 px with more saturation for strong glass). Behind glass the ground becomes the **bloom**: soft radial glows in the palette (orange, warm white and gray for SBB; lilac, orchid and lemon for Design 4; deep versions in dark) over a gentle gradient. "Plain ground" keeps the gray ground behind the glass. Contrast is checked over every bloom colour.

## The logo

The owner's logo from the prototype: block **H** and **T** cut by the C's circle, **C** and **O** each cut by the next circle, the **dot** cut into the O.

- Colours: SBB HT ink, CO orange, dot ink; Design 4 HT ink, CO lilac, dot lemon; dark themes light ink. In the app the colours come from `logo.ht`, `logo.co` and `logo.dot`, so the logo follows the palette and theme.
- Files: `htco-logo.svg` (and `-light`), `htco-logo-dark.svg`, `htco-logo-d4.svg`, `htco-mark.svg` ("CO.", for the favicon and small places). `Logo` draws the same geometry inline; the dot drops in once as the intro.
- Height 22 px in the sidebar; under 16 px use the mark. Never recolour it outside these tokens.

## Typography

| Family | Token | Use |
|---|---|---|
| Outfit | `--font-family-latin`, `--font-family-display` | Every Latin text and number |
| Heebo | `--font-family-hebrew` | Hebrew text (Outfit carries Latin inside it) |
| JetBrains Mono | `--font-family-mono` | Codes, IDs, tracking numbers; always left-to-right |

- Weights 300 (titles, big numbers, captions), 400 (text), 500 (the current area, badges).
- Sizes: 11 (group labels, counters), 12 (captions, crumbs), 13 (items, buttons, tables), 14 (body), 24 light (page titles), 32 light (key numbers), 48 light (the hero number).
- Sentence case; numbers in tables use tabular figures.

## Layout and shape

- **Frame (from 640 px):** the sidebar floats 8 px from the edges (264 px, radius 22); the top bar sits on the ground (72 px: crumbs, the 24 px title, then approvals and search, on frosted glass); screens are panels in a grid with 8 px gaps under it.
- **Sidebar, top to bottom:** the logo and the collapse button; the shop card; **Quick actions** (Ctrl K); Home, then **Workspace** (Office, Work, Commerce, Customers, Finance) and **System** (Admin), each a 40 px circle icon and a name; the current area opens its tabs on a connector rail with the current tab as an orange-tinted pill with the orange dot (round 4); the owner's card. Below 1360 px it collapses to a 72 px rail (the user's choice is remembered), and an area's tabs open in the 208 px flyout beside it.
- **Phones (under 640 px):** the top bar, the screen, and a floating tab bar (Home, Office, Work, Commerce, More); More opens every area in a sheet.
- **Shapes:** panels 22, cards and menus 16, pills fully round; circle buttons 40 px with a hairline; buttons 32 px (28, 40); inputs 48 px pills on sign-in.
- **Not built yet:** every tab has its address. A tab without a screen renders `DemoScreen` ("Demo — coming soon") and shows a `SoonTag` wherever it is listed.

## Motion

One curve, `cubic-bezier(.2,.7,.2,1)` (`motion.easing.standard`), and four times (`motion.duration.*`): 150 ms feedback, 200 ms entrances, 280 ms layout (sidebar width, flyout, chevrons), 300 ms sub-lists.

| Moment | Motion |
|---|---|
| Sidebar collapse and expand | Width animates; labels fade back in |
| An area's tabs | Grid rows open from 0 to their height; the chevron turns |
| Flyout | Slides 12 px in from the inline start and fades |
| Screens | Cross-fade with a 6 px rise (View Transitions) |
| Menus, palette | Fade with a short drop |
| Navigation groups, the flyout, the phone sheet | Open in 300 ms, close in 200 ms on the spring-like curve, as transitions that turn around mid-way |
| Screen to screen | The old screen settles back, the new one arrives from a soft blur along the navigation's direction |
| Toast | Fades up at the bottom centre, gone after 1.8 s |
| Every control | Hover changes its outline or fill; press scales to 95–98% |

Reduced motion removes every animation and transition, not only shortens them. Nothing moves on scroll, and nothing loops except real activity.

## UX rules

1. **One dominant action per region.** Primary buttons are ink; others are outlined pills.
2. **Keyboard first.** Quick actions on Ctrl+K or ⌘K; every action reachable without a mouse; the 2 px focus ring in ink is always visible.
3. **Status is a dot plus a word.** Colour is never the only signal.
4. **Never invent activity.** Counters, badges and the office show only recorded data; a screen without data says so (`DemoScreen`, empty states).
5. **AI actions are governed in the open:** the records affected, the reason, the policy, a preview; approval states its scope; every action has an actor and an audit entry.
6. **Say where data comes from and how fresh it is.** Show stale data, conflicts and partial failure, each with a retry.
7. **Loading** uses skeletons in the shape of what is coming. **Errors** are inline: the cause and the next step.
8. **Right-to-left by construction:** logical CSS only, mirrored directional icons, codes in an LTR isolate.
9. **Adapt, don't shrink, on phones:** fewer things, not smaller ones.
10. **Destructive actions** confirm in words that say what will happen.

## Voice and content

Calm, precise, honest. Buttons are verbs. Hebrew buttons and instructions use the gender-neutral infinitive or plural. No exclamation marks, no emoji, no hype. AI employees have permanent names and titles from the platform's registry.

## Accessibility

WCAG 2.2 AA on every platform and in every palette, theme and tweak: text pairs at least 4.5:1, controls, focus, dots and icons at least 3:1, checked in CI over glass and the bloom too. Focus is always visible. Screen readers get the same information as sight; decorative art is `aria-hidden`.
