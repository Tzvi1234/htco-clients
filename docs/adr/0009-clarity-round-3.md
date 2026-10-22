# ADR-0009: Clarity round 3 (shell, settings, landing, sign-in)

- Status: accepted (the owner's brief of 2026-10-22)
- Builds on: [ADR-0008](0008-design-1c.md) (Design 1C)

## Context

The owner keeps the Design 1C language and its navigation, and asked for calm: frosted glass on the navigation and the top bar by default, a much better open and close motion, screen-to-screen transitions, orange as a deliberate third colour next to gray, black and white, and all personalisation in one place. The tweaks panel (contrast, glass, borders) had grown into a set of choices he no longer wants to make.

## Decision

1. **Three personal settings, in Settings only.** Theme (System, the default, which follows `prefers-color-scheme` live; Light; Dark), palette (Gray `sbb`, the default; Cream `d4`) and language (עברית, English). The top bar loses the language switch and the tweaks button, and the account menu loses its language and theme sections; it leads to Settings. The landing page and the sign-in screens keep a language switch, because a visitor has no Settings.
2. **The tweaks are retired as user options.** `htco.contrast`, `htco.glass` and `htco.borders` are forgotten on start (`migrateAppearance`), a stored `plain` palette becomes `sbb` (it was SBB without the blooms, which only showed behind the glass tweak), and `data-t1`…`data-t3` are no longer set. The token modes stay generated and contrast-checked, so nothing that reads them breaks.
3. **Glass is fixed on for the navigation and the top bar.** `[data-glass]` scopes the glass level 2 tokens (a new generated cascade layer, `nav-glass`) and adds the blur; it is checked for contrast over the plain ground in both palettes and themes. The device's "reduce transparency" sets `data-solid` on `<html>` (also in the pre-paint boot script), which turns it solid. Panels stay solid: glass is used where content passes beneath it.
4. **Orange is the tertiary colour** (`color.tertiary.*`, the same orange in both palettes): emphasis, "needs you", key numbers and selection, never decoration. Design 4's cream ground keeps the logo's orange as its accent and attention; lilac and lemon are retired from it.
5. **Navigation motion is transitions, not keyframes**, on one spring-like, critically damped curve (`motion.easing.spring`), so a group, the flyout or a pill toggled again mid-way turns around from where it is. Opening takes 300 ms, closing 200 ms; reduced motion removes the travel and the stagger.
6. **Screen to screen**: the router runs each change as a View Transition typed by its direction in the navigation; the screen settles back and the next one arrives from the inline end (later in the navigation) or the start (earlier), and the current tab's pill glides between tabs of one area.
7. **A screen may scroll as one page** (`staticData.scroll: "page"`): on wide screens the top bar and the sidebar then stay put and no panel scrolls on its own. Settings uses it; the other screens keep the fill-the-window layout until they are redesigned.

## Consequences

- Design 4's lilac look is gone for the owner; anyone on `plain` moves to Gray without seeing a change.
- The native apps will offer the same three settings and read the same keys.
- The screens redesigned next (part B) can opt into page scrolling and use the `tertiary` tokens.
