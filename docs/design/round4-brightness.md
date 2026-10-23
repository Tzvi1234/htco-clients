# Round 4: brightness and orange emphasis

The owner's request (October 2026, from a reference screenshot whose colour direction only was
taken, not its cards, radii, layout or icon bubbles):

1. Brighter, crisper whites and greys; a clear step between the page ground and the panels.
2. Orange is the app's emphasis colour: where you are, what needs you, key numbers, highlights.
3. Icons stay ours. Orange is at most the glyph colour; never an icon inside an orange disc.

Skills used: Impeccable (`colorize`, `bolder` for the faint orange figures, `polish`), the colour
system and dark-mode guidance (`ui-design:color-system`, `ui-design:dark-mode-design`), taste and
UI/UX checks. The Impeccable detector found 0 anti-patterns in the changed files (advisories only:
the existing spring easing and a 15 px flyout title, both unchanged by this round).

## Tokens: before and after

| Token | SBB light | SBB dark | Design 4 (Cream) dark |
|---|---|---|---|
| `bg.ground` | `#e5e5e5` → `#f5f5f3` | `#161616` → `#0e0e0f` | `#15141a` → `#0f0e13` |
| `bg.panel` | `#e1e1e0` → `#ffffff` | `#1e1e1e` → `#1b1b1d` | `#1e1d24` → `#1c1b22` |
| `bg.raised` | `#f0f0ef` → `#f1f1ef` | `#282828` → `#29292c` | `#26252d` → `#29282f` |
| `bg.hover` | `#e8e8e7` → `#eeeeec` | `#262626` → `#252527` | unchanged |
| `bg.selected` | `bg.raised` | `#2e2e2e` → `#2d2d30` | `accent.subtle` |
| `bg.sidebar` | `#f3f3f2` → `#ffffff` | `#1c1c1c` → `#19191b` | `#1c1b21` → `#1a191f` |
| `bg.card` | `#ffffff` | `#242424` → `#222225` | unchanged |
| `border.subtle` / `border.strong` | `#d3d3d3` / `#c9c9c9` → `#e0e0dd` / `#d2d2cf` | `#2c2c2c` / `#3a3a3a` → `#2e2e31` / `#3e3e42` | `#2d2c34` / `#3d3c45` → `#2f2e36` / `#403f48` |
| `border.sidebar` | `#d2d2d1` → `#e0e0dd` | `#2c2c2c` → `#2e2e31` | follows `border.subtle` |
| `text.primary`, `inverse.bg` | unchanged | `#f2f2f2` → `#f7f7f7` (hover `#d9d9d9` → `#dedede`) | `#f3f4ee` → `#f7f8f2` |
| `text.secondary` | `#646464` → `#575757` | `#c4c4c4` → `#d0d0d0` | `#c2c1c8` → `#cecdd3` |
| `text.muted` | unchanged | `#959595` → `#a3a3a3` | `#a09fa6` → `#aaa9b0` |
| `tertiary.subtle` (`accent.subtle`, `attention.subtle`) | `#ffe6d6` → `#ffe0cc` | `#3a2416` → `#3f2617` | `#3a2416` → `#3f2617` |
| `tertiary.on-inverse` (`accent.on-inverse`) | unchanged `#ff7f36` | `#d64e00` → `#a83d00` | `#d64e00` → `#a83d00` |
| `elevation.panel` | none → a soft two-layer lift (the panel edge on the near-white ground) | none | none |

Design 4 light keeps its brand cream ground (`#f3f4ee`, a brand colour) and white panels; it takes
the stronger orange wash. The frosted navigation's glass tokens are unchanged: they mix the panel
base, so the glass follows the white panel and the brighter ground on its own, and the text solved
for glass still passes over the new composite (checked; a lighter glass orange text was tried and
failed the retired bloom backdrops, so it was not taken).

## Where orange goes

- **Sidebar and flyout:** the current area is the whole row as an orange-tinted pill, its glyph
  and name in `tertiary.text` (no ink disc); the other areas' discs are light (white with a
  hairline, dark glyph). The current tab is an orange-tinted pill with an orange label and dot.
  The flyout's area disc is light with an orange glyph. Shapes, the gliding pill and the
  open/close springs are unchanged.
- **Phone tab bar and its sheet:** the gliding pill is the orange tint, the glyph and label orange.
- **Primary buttons:** stay ink (orange with white text fails AA); their glyph is orange.
- **Sub-tabs in screens:** the gliding capsule is the orange tint with an orange label; filters
  and segmented choices stay ink, so "where you are" (orange) and "what you chose" (ink) differ.
- **Focus panels** (Home, Shops, Statistics, Orders, Products, Shipping, Customers, Members,
  Security): a soft orange wash from the title's side, mirrored in Hebrew; removed under more
  contrast and forced colours.
- **Key figures that need the owner:** orange as before, now set at 400 instead of 300.
- **Forced colours:** the current tab and chosen sub-tab get a Highlight ring, since their tint
  is replaced by system colours.

## Contrast

225 pairs (218 before) in each of the 114 modes and the four nav-glass modes, all passing. New:
the orange on the inverse fill is now a glyph and may be text (4.5:1 on `inverse.bg` and
`inverse.bg-hover`, was 3:1 for a dot), and secondary text, muted text, success, danger, the default icon and the focus
ring are checked on the orange wash.

## Screenshots

Before and after at 1440×900 and 375×812 (Hebrew, light) and 1440×900 (Hebrew, dark) of Home,
Shops, Orders, Statistics, Customers and Settings were reviewed during the round; the committed
Playwright baselines were regenerated in CI.
