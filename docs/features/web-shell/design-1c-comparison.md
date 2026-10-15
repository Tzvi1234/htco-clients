# Design 1C: the prototype against the app, value by value

How the app was checked against the owner's prototype ("HTCO · Design 1C", [client ADR-0008](../../adr/0008-design-1c.md)), and what differs.

## Method

The prototype and the app (`?demo`) were opened in Chromium at 1440×900 on the same screen (Admin › Settings), light theme, in all 30 states the prototype has: SBB with every combination of tweaks 1, 2 and 3 (27 states) and Design 4 with each glass level (3). In each state a script compared:

- every design variable resolved to its computed value, against its token: `--ground`, `--panel`, `--raised`, `--line`, `--line2`, `--edge`, `--sb`, `--sb-line`, `--hover`, `--sel`, `--menu-bg`, `--th-bg`, `--card`, `--line-h`, `--line-h2`, `--ink`, `--ink-h`, `--white`, `--accent`, `--accent-fill`, `--on-accent`, `--attn`, `--on-attn`, `--mute`, `--soft`, `--pshadow`, `--sb-shadow`, `--bf`, `--bloom`;
- the rendered background, border colour, shadow, backdrop filter, radius, text colour, font size, weight and letter spacing of the ground, the sidebar, a panel, the shop card, the Quick actions pill, an idle and the current area circle, the current and an idle tab, a group label, the top bar's circle buttons, the language switch and its chosen option, the title and the crumbs.

**Result: no difference except the text colours below.** To get there:

- Glass is written as the prototype writes it: `color-mix(in srgb, var(--bg-panel-base) 52%, transparent)` and so on, so it follows the panel base of every contrast level and palette; strong glass at contrast level 3 keeps the prototype's 44% panel.
- Translucent colours use the legacy `rgba()` syntax, as the prototype does; browsers keep that alpha at 8 bits, which is the value the prototype renders with.
- The bloom's gradients end on the same fully transparent colours; glass has no `brightness()` step, strong glass does.
- A later token file replaces a whole shadow (no layers left over from the base).

Treated as equal: Tailwind's empty ring shadows (transparent, zero size) and equivalent round radii (`999px` against `50%` or half the height). Pixel samples of the sidebar fill, the top bar's ground and the gaps between panels match at 96–100%; what is left is different text (counters, names) and, under glass, differently sized panels blurring the bloom. Side-by-side screenshots of the default, glass, contrast, borders and Design 4 states are kept with the review of this change.

## Text colours raised for WCAG AA

The prototype's `--mute` and `--soft` fail 4.5:1 as text on its own panels. The app uses the lightest gray of the same hue that passes on every surface of each state, so the change is the smallest AA allows. In Design 4, `--soft` passes and is kept exactly. Everything that is not text (icons, placeholders, decoration) keeps the prototype's `--mute` through `icon.faint`.

| Prototype variable → token | Prototype | App | States |
|---|---|---|---|
| `--mute` → `--text-muted` | `#9A9A9A` | `#646464` | SBB, no glass, contrast 1 (any borders) |
| `--soft` → `--text-secondary` | `#6F6F6F` | `#646464` | SBB, no glass, contrast 1 |
| `--mute` → `--text-muted` | `#9A9A9A` | `#5F5F5F` | SBB, no glass, contrast 2 |
| `--soft` → `--text-secondary` | `#6F6F6F` | `#5F5F5F` | SBB, no glass, contrast 2 |
| `--mute` → `--text-muted` | `#9A9A9A` | `#565656` | SBB, no glass, contrast 3 |
| `--soft` → `--text-secondary` | `#6F6F6F` | `#565656` | SBB, no glass, contrast 3 |
| `--mute` → `--text-muted` | `#9A9A9A` | `#464646` | SBB, glass or strong glass (text may sit over the orange bloom) |
| `--soft` → `--text-secondary` | `#6F6F6F` | `#464646` | SBB, glass or strong glass |
| `--mute` → `--text-muted` | `#7A7A74` | `#5C5C58` | Design 4, no glass |
| `--mute` → `--text-muted` | `#7A7A74` | `#575752` | Design 4, glass or strong glass |

The same check found and fixed: the current area's circle outline (gray instead of ink) and the panel tint under strong glass.
