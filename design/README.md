# HTCO Design System — Relay

| | |
|---|---|
| **Status** | Version 2, "Relay" ([client ADR-0007](../docs/adr/0007-relay-design-language.md)); replaces version 1 |
| **Source of truth** | This repository: [`tokens/`](tokens/README.md) (DTCG 2025.10), this brand book and [`COMPONENT_SPEC.md`](COMPONENT_SPEC.md) |
| **References** | Attio (layout, sizes, tables, objects, icons) and Figma (colour, illustration, brand moments), pulled from Mobbin and nothing else |
| **Brand assets** | [`../assets/brand/`](../assets/brand/) |
| **Contrast check** | `pnpm check` (164 token pairs per theme, in `packages/design-tokens`); `pnpm tokens` rebuilds the platform outputs |

HTCO is the operating system for a marketplace business: verified orders, fulfillment and money, plus an AI workforce that acts under policy and asks before anything risky. The brand promise is **autonomy you can audit**, said to the owner as "Your shop runs. You decide."

## The idea: Relay

Work passes through the office the way the logo's interlocked C and O pass into each other. An order or a listing is handed from an AI employee, through policy, to the owner. Three devices carry the idea, all from the logo:

| Device | What it is | Where |
|---|---|---|
| **Handoff rings** | Two interlocked rings and the dot: work moving from an employee, through policy, to you | Brand art only (sign-in, empty states) |
| **Work traces** | An AI employee is a small pointer with a coloured flag (its presence colour), with the employee's name and title where space allows. Never a face, photo or mascot | Records an employee is working on; brand art |
| **The decision ring** | A loose saffron marker loop, the only hand-drawn mark in the product | Only around what waits for the owner's decision, always beside words such as "Needs you" |

## Two worlds

- **Work screens are Attio-calm:** white or graphite surfaces, dense type, thin lines, one primary action per region. Colour appears only as small tags, object icons, status dots and the decision ring.
- **Brand moments are Figma-warm:** sign-in, empty states, the intro and future onboarding or celebrations use flat shapes in the illustration palette with 2 px ink outlines. They show HTCO's own objects (receipts, listing tiles, the handoff rings and the decision card), never generic stickies or clip-art, and never text inside the art.

## The logo

- The official geometry is kept exactly: block **H** and **T**, the interlocked **C** and **O** with their knockout gaps, and the dot. It is traced once into a vector, [`htco-logo.svg`](../assets/brand/htco-logo.svg); the original raster stays as the geometry source.
- Colours: **HT** ink `#16161A` (`#F2F2F5` on dark), **CO** iris `#4C3AC7` (`#8B7CFF` on dark), **dot** saffron `#F2B72F`. Files: `htco-logo-light.svg`, `htco-logo-dark.svg`, and `htco-mark.svg` ("CO.", for icons and the favicon).
- The web app draws the same geometry inline (`Logo`), taking its colours from the tokens, so it follows the theme. Minimum height 16 px for the full logo; under that, use the mark. Clear space is the dot's diameter.
- Never redraw, re-typeset, outline, add effects to or recolour it outside these tokens.

## Colour

| Role | Light | Dark | Job |
|---|---|---|---|
| Iris | `#4C3AC7` | `#684FF0` fill, `#8B7CFF` text and focus | Primary actions, links, selection, focus, the logo's CO |
| Saffron | `#F2B72F` ring; `#8A5A00` dot and text | `#F2B72F` | The logo's dot; "needs you" only |
| Graphite | `#16161A` → `#FFFFFF` | `#F2F2F5` → `#0B0B0E` | Text, surfaces, lines |
| Danger | `#C9363E` | `#F0646B` / `#FF8A8F` | Failures and destructive actions |
| Success | `#138A66` | `#2DBE8C` | Outcomes that went well |

- **Surfaces:**
  - `bg-canvas` for pages;
  - `bg-sidebar` for the sidebar and inspectors;
  - `bg-surface` for cards and tables;
  - `bg-raised` for menus and dialogs;
  - `bg-sunken` for table headers and wells;
  - `bg-hover` for hover;
  - `bg-selected` (iris tint) for selection;
  - `bg-brand` for brand-moment grounds.
- **Text:** `text-primary`, `text-secondary` and `text-muted`, each at least 4.5:1 on every surface. **Lines:** `border-subtle` for dividers, `border-strong` for card and chip outlines, `border-control` for inputs (3:1).
- **Tags:**
  - Hues: iris, saffron, coral, mint, sky, rose, slate. Each has a soft tint, a darker text colour and a dot, with its own dark-theme values.
  - Tags are for values (stages, categories, ranges), not decoration.
  - Colour is never the only signal.
- **Presence:** seven flag colours for AI employees, white names on top (4.5:1). Seven colours cannot identify 16 employees, so a flag always shows the name.
- **Illustration:** iris, saffron, coral, mint, sky and rose fills plus ink and paper, used only in brand art and never for text.
- **The saffron rule:** saffron means "needs you" and nothing else in the product. Under 5% of any work screen.

## Typography

| Family | Token | Use |
|---|---|---|
| Inter | `--font-family-latin` | English UI text and all numbers |
| Heebo | `--font-family-hebrew` | Hebrew UI text |
| Rubik | `--font-family-display` | Greetings, sign-in, big numbers and brand moments, in Hebrew and English alike |
| JetBrains Mono | `--font-family-mono` | Receipt numbers, tracking codes, SKUs and IDs; always left-to-right, never Hebrew |

- Scale (size/line height in px):

  | Token | Size | Use |
  |---|---|---|
  | `caption` | 12/16 | Captions |
  | `body-sm` | 13/18 | Tables, sidebar, chips |
  | `body` | 14/20 | UI default |
  | `title-sm` | 16/24 | |
  | `title` | 20/28 | |
  | `display-sm` | 28/32 | |
  | `display` | 40/44 | |
  | `hero` | 56/60 | |

  Never below 12 px.
- Weights: 400 for text, 500 for labels, buttons and table names, 600 for titles. Display sizes are set 0.03 rem tighter.
- Numbers in tables, metrics and money use tabular figures (`tabular`).
- Sentence case everywhere. Hebrew is never set in the mono face.

## Layout and sizes (from Attio)

- **App frame:**
  - sidebar 248 px (`size-sidebar`), a 56 px rail from 640 px, a bottom bar on phones;
  - each page has a 48 px header with the object icon, the title and actions;
  - tables run full-bleed, other content has 24–32 px gutters.
- **Sidebar, top to bottom:**
  - the logo;
  - **Quick actions** (Ctrl+K or ⌘K);
  - the main items, then small section labels ("Records", "Workspace") with their items;
  - the connected shop card;
  - the account.
  - Items are 32 px with a 16 px icon and a 14 px label. The current item gets a neutral fill and its object colour on the icon.
- **Record table:**
  - a 32 px header on `bg-sunken`, with a 13 px icon plus label per column;
  - 36 px compact or 44 px comfortable rows;
  - 1 px horizontal lines and optional vertical ones;
  - a sticky first column with a checkbox;
  - values shown as tags, status as a dot plus a word;
  - a "+ Add calculation" footer when totals exist.
  - Column resize, reorder, hide, saved views, bulk actions, keyboard cell navigation and virtualization come with the first data table, and a 360–480 px record inspector with the first record view.
- **Controls:**
  - buttons 28, 32 or 40 px with radius 8;
  - inputs 32 px (40 px on sign-in) with radius 6;
  - tags 20 px with radius 4;
  - cards radius 12, dialogs radius 16.
  - Cards have a 1 px line and the faintest shadow; menus and dialogs float with `elevation-3`.
- **Object icons:** each record type has a 20 px (or 28 px) rounded tile in its hue: Overview iris, Shops coral, Security mint, Settings slate. Later records get their own hue once.
- Spacing on a 4 px grid (`space-*`). Breakpoints 640, 900, 1200, 1600.

## Iconography

Lucide outline icons at 16 px (13–15 px inside tiles) with a 1.75–2 px stroke, everywhere. Directional icons mirror in right-to-left layouts; logos, media controls, time axes and codes do not. No emoji in the product.

## Motion

| Moment | Motion | Time |
|---|---|---|
| Intro (once per device and intro version) | The sidebar slides in 8 px from the inline-start edge and fades; the logo's dot drops into place | 280 ms and 520 ms, never blocking |
| Page entrance | Opacity plus 4 px rise | 160 ms (`motion-duration-base`) |
| Menus, dialogs, quick actions | Opacity plus 4 px | 120–160 ms |
| Decision ring | Draws on along its path | 400 ms (`motion-duration-draw`) |
| Brand art | Pieces rise 12 px in turn, the ring draws, the dot drops; once, never looping | ≈ 1 s in total |
| Buttons | Press to 98% | 120 ms |

- Opacity and short travel only; no scaling menus, no parallax, no row staggers, nothing tied to scrolling.
- **Reduced motion** removes every animation (travel and drawing), not only shortens it.
- Motion explains a change. The office never shows invented activity: brand art is an illustration, and real presence follows only recorded events.

## UX rules

1. **One dominant action per region.** A table may offer create, import and bulk actions together; only one is primary.
2. **Keyboard first.** Quick actions on Ctrl+K or ⌘K; every action is reachable without a mouse; the 2 px iris focus ring is always visible.
3. **Status is a dot plus a word.** Colour is never the only signal.
4. **The decision ring means "needs you".** Never decorative, always beside words.
5. **AI actions are governed in the open.** A proposed action shows the records affected, the reason, the policy used and a preview or diff. Approval states its scope (once, batch, time-limited, or a policy change). Every action has an actor, an audit entry and, where possible, undo. An AI draft never silently becomes a committed marketplace action.
6. **Say where data comes from and how fresh it is** ("Etsy · 4 min ago"). Say "Estimated" when a figure is not verified. Show sync conflicts, stale data and partial failure, each with a retry.
7. **Empty states teach:** brand art, one sentence and one action, or say plainly when the action is not available yet.
8. **Loading** uses skeletons in the shape of what is coming, never a full-page spinner. **Errors** are inline: the cause and the next step, never an apology.
9. **Right-to-left by construction:** logical CSS only, mirrored directional icons, codes in an LTR isolate. Hebrew and English are both first-class; test both directions and both themes.
10. **Destructive actions** confirm in words that say what will happen.

## Voice and content

- Calm, precise, honest. Say what happened, what it means and what the person can do: "No tracking for receipt 3412987711 after 6 days. Re-running the sync."
- Buttons are verbs: "Approve fix", "Connect shop". Hebrew buttons and instructions use the gender-neutral infinitive or plural: "לאשר תיקון", "הזינו את הקוד".
- No exclamation marks, no emoji, no hype.
- System messages are in the third person ("Noa flagged a size claim"). AI employees speaking in a conversation use the first person, factually, and attach receipts.
- AI employees have permanent first names and titles ([platform ADR-0012](https://github.com/Tzvi1234/htco-platform/blob/main/docs/adr/0012-living-office-organization.md)), shown as "Maya · General Manager". Names and titles come from the platform's registry, never hard-coded in a client; brand art shows roles without names.

## People, AI employees and the office

| Actor | Looks like |
|---|---|
| Person (user) | Photo, or initials on a neutral disc |
| AI employee | Presence pointer and flag in the employee's colour with the name, or an employee token (a rounded square in the presence colour with initials and a small role glyph); never a face |
| Decision Advisor (Jev) | An employee token labelled "Shared service" |
| Automation | A dashed neutral token with a workflow glyph |
| System | A plain neutral disc |

Employee states are viewing, drafting, waiting and committed. Each shows in words beside the token, and only from recorded events. When the agent worker is offline, every employee shows Offline.

## Platforms

One visual language, native behaviour: React Aria Components with these tokens on the web; WinUI 3 resource dictionaries on Windows (compact density); Jetpack Compose on Android with the same colours, type, shapes and components. The web leads (platform ADR-0016).

## Accessibility

WCAG 2.2 AA on every platform. Text pairs are at least 4.5:1, and controls, focus, dots, tag dots and presence flags at least 3:1, in both themes, checked in CI. Focus is always visible. Screen readers get the same information as sight. Brand art is decorative (`aria-hidden`); everything it suggests is also said in words.
