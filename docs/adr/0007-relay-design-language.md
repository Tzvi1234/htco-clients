# Client ADR-0007: The Relay design language

- **Status:** Superseded by [client ADR-0008](0008-design-1c.md) (Design 1C)
- **Date:** 2026-10-15
- **Deciders:** Owner, engineering
- **Supersedes:** [client ADR-0005](0005-brand-palette-from-logo.md) (brand palette measured from the logo)

## Context

The owner rejected the first design system (midnight navy, turquoise, amber, calm cards) as generic. He asked for a complete replacement built from two references, using only these two, pulled from Mobbin:

- **Attio** (CRM) for layout, sizes, rules, objects, tables and icons.
- **Figma** for colour, the colourful hand-drawn illustration style, and brand screens such as sign-in.

He also asked for:

- a language unique to HTCO and not "vibe-coded";
- transitions, an intro and strict UX rules;
- the logo's shape kept, recoloured with Codex.

A Codex review of the first plan flagged four problems:

- a FigJam imitation (dot grids, stickies, collaborator cursors);
- Figma's exact signature palette;
- five contrast failures;
- an intro too long for a daily tool.

## Decision

- **Name and concept: Relay.** Work passes through the office the way the logo's interlocked C and O pass into each other. An order or a listing is handed from an AI employee, through policy, to the owner.
- **Three devices, all from the logo:**
  - the **handoff rings** (brand art only);
  - **work traces**: an AI employee is a small pointer with a coloured flag, never a face;
  - the **decision ring**: a saffron marker loop, the only hand-drawn mark in the product, drawn only around what waits for the owner and always beside words.
- **Two worlds.** Work screens follow Attio: dense, neutral, precise. Colour there is limited to small tags, object icons and the decision ring. Brand moments (sign-in, empty states, the intro) carry the colourful flat illustration with ink outlines.
- **Colour.**
  - Graphite neutrals.
  - Iris `#4C3AC7` for actions, links, selection and the logo's CO (`#684FF0` and `#8B7CFF` in the dark theme).
  - Saffron `#F2B72F` for the logo's dot and the decision ring. The functional "needs you" dot is `#8A5A00` in the light theme, for 3:1.
  - Seven tag hues: iris, saffron, coral, mint, sky, rose, slate. Each has its own dark-theme tints.
  - Seven presence colours for AI employees.
  - An illustration palette that never carries text.
  - Danger `#C9363E`, distinct from coral.
  - Every pair in `packages/design-tokens/src/contrast.ts` (164 per theme) is checked in CI.
- **Type.** UI uses Inter (Latin) and Heebo (Hebrew): 14 px base, 13 px in tables and the sidebar, 12 px captions. Display (page greetings, sign-in, big numbers) uses Rubik in both scripts, so a mixed Hebrew and English headline does not split into two styles. Rubik's rounded geometry rhymes with the logo's circles.
- **Logo.**
  - **Geometry:** the official geometry, traced once by Codex into a vector (`assets/brand/htco-logo.svg`), not regenerated as a raster.
  - **Colours:** HT in ink (`#16161A`, or `#F2F2F5` on dark), CO in iris, the dot in saffron.
  - **Files:** light, dark and "CO." mark files. The web app draws the same geometry inline in token colours.
- **Motion.**
  - The intro plays at most 600 ms, once per device and intro version, and never blocks the shell.
  - Page entrances take 160 ms (opacity plus 4 px).
  - The decision ring draws on in 400 ms.
  - The sign-in art plays once and never loops.
  - There are no table-row staggers.
  - Reduced motion removes travel and drawing entirely.

## Revision — round 2 (2026-10-15, owner feedback)

- **Solid colour or glass only:** no blurred glows, gradient fills or faded tinted chips. Tags and object icons are solid fills with white glyphs and text. The aura became solid organic shapes.
- **Icons:** Phosphor instead of Lucide (duotone in navigation, filled on solid tiles).
- **App frame:** the work floats on a white panel over a pale app ground. On phones, a floating tab bar and denser-is-fewer layouts.
- **Overview** became a dashboard: four key numbers with honest empty values, getting started, and the AI office card.
- **Empty states** show the shape of what will appear.
- **Sign-in** says "HT-Commerce", carries the logo large above the title, and uses 44 px fields with icons and a show-password control. The brand panel keeps its first design.
- A public **front door** (`/welcome`): what HTCO is, the web app to open now, and the Windows and Android apps marked "In development" until they exist. A signed-out visitor at the bare address lands there.

## Revision — round 3 (2026-10-15, owner feedback)

- **The app ground became deep ink**, with the sidebar on it and the work on a floating white panel. The phone tab bar is ink too.
- **Icons are monochrome.** The coloured icon tiles read as generic; colour stays in solid accent surfaces such as the solid iris AI office card.
- **The key numbers became one divided card.**
- **The sign-in form side is calm and centred**, with the logo large above the form; the scattered shapes there were removed. The brand panel keeps its first design, with a cleaner ring interlock.
- **The front door became bold blocks of solid colour** (an iris hero with the product preview rising out of it, solid pastel job tiles, an ink "How it works" band, platform cards), inspired by landing pages on Mobbin.

## Alternatives

| Option | Why not |
|---|---|
| Keep navy and turquoise, restyle components | The owner rejected the look, not the components |
| Figma's own palette (`#A259FF`, `#FFC700`, `#F24E1E`) | Reads as a Figma copy |
| A FigJam canvas (dot grid, stickies, live cursors) on sign-in | Imitation, and implies live activity that is not happening |
| Image-generated logo | Cannot guarantee exact geometry or crisp small sizes (the first attempt had jagged edges) |
| Bricolage Grotesque with Rubik for display | Mixed-script headlines would visibly split |

## Consequences

- Positive: a language owned by HTCO, with Attio's density for daily work and Figma's warmth only where it helps. One token change re-themes web, Android and Windows.
- Negative:
  - The live design-system reference on Claude Design shows the old language until it is rebuilt.
  - Android and Windows token outputs change before those apps exist.
  - Seven presence colours cannot identify 16 employees alone, so presence always pairs colour with a name and a title.
