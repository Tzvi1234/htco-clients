# Client ADR-0008: Design 1C

- **Status:** Accepted
- **Date:** 2026-10-15
- **Deciders:** Owner, engineering
- **Supersedes:** [client ADR-0007](0007-relay-design-language.md) (the Relay design language)

## Context

The owner designed the next look of HTCO himself, as a working prototype: "HTCO · Design 1C". It is a desktop prototype (1280 px and up) of the whole product: a floating sidebar of seven areas, a top bar, panels on a gray ground, a command palette, a toast and a tweaks panel that changes contrast, frosted glass, borders and the palette. He asked for it to replace Relay **1:1**, for every interface (web app, landing page, phone layout, later the native apps), with:

- a third palette option, "Plain ground": the default palette whose ground stays plain gray even with glass on;
- a theme switch (light and dark) in the same tweaks panel, with proper dark variants of both palettes;
- the tweaks as one preference shared by every interface;
- a new logo, the prototype's own;
- motion and feedback on everything interactive;
- the existing screens fitted into the new frame, and every other screen of the prototype given its address now, marked "Soon", for other work to fill.

Relay's owner rules (solid colour only, no blur or gradients) are superseded: glass, blur and the designed "bloom" ground are now allowed, as tweaks.

## Decision

### Tokens

- **Two palettes, each light and dark,** in the DTCG source (`design/tokens`):
  - **SBB** (the default): gray ground `#E5E5E5`, panels `#E1E1E0`, raised `#F0F0EF`, ink `#000`, the accent orange `#FF7F36`. Dark: light ink `#F2F2F2` on charcoal (`#161616` ground, `#1E1E1E` panels), the orange kept.
  - **Design 4**: cream ground `#F3F4EE`, white panels, lilac `#8C76D6` (selection `#D8CFEE`), orchid `#C27BC4`, lemon `#EDD803` for attention. Dark: cream ink on aubergine charcoal (`#15141A`), lilac `#A996E8` and lemon kept.
- **The demo's names stay as primitives** (`palette.sbb.ground`, `palette.d4.lilac`…). Semantic tokens carry the roles (`bg.ground`, `bg.panel`, `bg.raised`, `bg.sidebar`, `bg.menu`, `inverse.bg`, `accent.mark`, `attention.fill`, `border.edge`, `logo.co`…). Relay's names (`bg.canvas`, `bg.surface`, `action.*`, tags, presence colours, illustration) remain as aliases or data colours so existing screens render; a semantic alias is emitted as `var(--target)`, so it follows every palette and tweak.
- **Tweaks are overlays.** Each palette and tweak level is a partial DTCG file in `design/tokens/modes/`. The CSS output puts each group in its own cascade layer (`htco-tokens.base`, `.palette`, `.contrast`, `.borders`, `.glass`), keyed on attributes of `<html>`: `data-pal`, `data-theme`, `data-t1`, `data-t2`, `data-t3`. A later layer always wins; inside a layer the dark rule is one attribute more specific than the light rule, and light and dark files of an overlay set the same tokens (tested).
- **Contrast in every mode.** The check now runs in all 114 modes (3 palettes × 2 themes × the tweak levels that apply). Glass makes surfaces translucent: a translucent background is composited over each backdrop the mode can show (the plain ground, or every bloom colour over both ends of the bloom gradient), and fills inside a panel over the panel composited the same way, before measuring.
- **Honest text colours.** Several of the demo's colours fail WCAG AA as text: `--mute #9A9A9A` (2.1:1 on the panel), `--soft #6F6F6F` (3.8:1), the orange `#FF7F36` (1.9:1), Design 4's `--mute #7A7A74`, lilac and lemon. They keep their look for non-text uses (`icon.faint`, `accent.mark`, `attention.fill`, the logo), and text uses compliant variants solved per mode against every surface (for example `text.muted #646464`, `accent.text #AF4000` in SBB light; darker again on glass and at contrast level 3). The orange stays as a fill under ink text (8.3:1) and as text in dark mode (4.8:1 or more).
- **Type:** Outfit (Latin) and Heebo (Hebrew), weights 300, 400 and 500; titles 24 px light. **Radii:** panels 22, cards 16, pills round. **Motion:** one curve, `cubic-bezier(.2,.7,.2,1)`, 150 / 200 / 280 / 300 ms.

### Tweaks

| Tweak | Attribute | Values | Storage key |
|---|---|---|---|
| Theme | `data-theme` (absent: follow the system) | System · Light · Dark | `htco.theme` |
| Palette and ground | `data-pal` | `sbb` · `d4` · `plain` | `htco.palette` |
| 1 · Element vs ground contrast | `data-t1` | 1 · 2 · 3 (SBB and plain only) | `htco.contrast` |
| 2 · Frosted glass | `data-t2` | 1 (off) · 2 (glass) · 3 (strong glass); the bloom ground behind it unless `plain` | `htco.glass` |
| 3 · Element borders | `data-t3` | 1 · 2 · 3 (SBB and plain only) | `htco.borders` |

- **One preference per origin.** `dash.ht-co.app` serves the app and the landing page, so they share `localStorage`; a change in one tab follows in the others (`storage` event). The native apps will store the same keys and values. The theme keeps its old key, so the Settings page's theme choice and the tweaks are the same preference.
- **Before the first paint.** A small inline script (`shared/theme/boot.ts`) applies the attributes; the Vite config injects it into `index.html`, and the Content Security Policy allows it by its SHA-256 hash, computed from the built page (no `unsafe-inline`).
- **`TweaksPanel` and `TweaksButton`** (`shared/theme/TweaksPanel.tsx`) are the one panel every interface shows.

### Logo

The prototype's `logo()`: block H and T cut by the C's circle, C and O each cut by the next circle, and the dot cut into the O. Colours per palette from `logo.ht`, `logo.co` and `logo.dot` (SBB: ink, orange, ink; Design 4: ink, lilac, lemon; dark: light ink). `Logo` draws it inline (`full` and the "CO." `mark`, the dot dropping in once as the intro); `assets/brand/` holds the light, dark, Design 4 and mark files, and the favicon is the mark. Relay's rule that the logo is never redrawn is superseded by the owner's new logo; the old raster was removed.

### Shell and navigation

- **Seven areas** in the prototype's order and wording (Home; Office, Work, Commerce, Customers, Finance under Workspace; Admin under System) with their tabs (`app/shell/nav.ts`). Built screens keep their addresses (`/`, `/shops`, `/settings`, `/settings/security`, `/settings/team`); every other tab has `/<area>/<tab>`, renders `DemoScreen`, and shows a `SoonTag` in the sidebar, flyout, phone sheet and palette. `/<area>`, `/commerce/shops`, `/admin/members` and `/admin/settings` redirect.
- **Sidebar** 264 px, a 72 px rail below 1360 px unless the user chooses (remembered as `htco.sidebar`), with the flyout of the area's tabs beside the rail. **Top bar** with crumbs and the page's light 24 px title (the page's `PageHeader` places its h1 there), language, approvals, search and tweaks. **Phones** (under 640 px): the top bar, the screen and a floating tab bar (Home, Office, Work, Commerce, More) in the same language.
- **Motion:** sidebar width and label fade, sub-lists opening on grid rows, the flyout sliding in, screens cross-fading through View Transitions, menus and the palette popping in, press feedback on every control. Reduced motion removes all of it.

## Alternatives

| Option | Why not |
|---|---|
| Keep the demo's colours for text and accept the failures | WCAG 2.2 AA is a product rule; the look is kept where colour is not text |
| One CSS file per palette, switched at runtime | Doubles the output and still needs the tweak levels; layers keep one stylesheet and one cascade |
| Tweaks in one JSON value in storage | Separate keys keep the existing `htco.theme` and let each value be validated on its own, in the app and in the boot script alike |
| Framer Motion for the motion system | A heavy dependency for transitions CSS and View Transitions already do |
| Generate the placeholder screens from the demo's HTML | The demo's data is invented; screens are built with real data or say plainly that they are coming |

## Consequences

- Positive: the owner's own design, everywhere, with every combination of palette, theme and tweak checked for contrast in CI. Other work can build screens tab by tab inside a finished frame.
- Negative:
  - Muted text is darker than in the prototype, and on glass muted and secondary text get close; hierarchy then rests on weight and size.
  - Glass with contrast level 3 does not reproduce the prototype's special panel opacity for that pair.
  - The native token outputs carry the default palette only until the native apps add the tweaks.
  - Counters and badges from the prototype (16 employees, 3 approvals) are not shown until real data backs them.
