---
name: design-system
description: How to design and build any HTCO screen or component on web, Android or Windows so it stays faithful to the HTCO design system — tokens, the three brand colours and their jobs, the amber "needs you" rule, typography, status language, components, RTL — and how to find inspiration on Mobbin and keep the live design system reference in sync. Use before creating or changing any UI, choosing colours or spacing, adding a component, or reviewing screenshots.
---

# HTCO design system

Sources of truth, in order (the repository always wins):

1. `design/tokens/` (DTCG): every colour, size, radius, font and duration.
2. `design/README.md`: the brand book (logo, colour jobs, type, voice, layout, motion, iconography, status language, platforms, accessibility).
3. `design/COMPONENT_SPEC.md`: the 38 components and their rules.
4. The live reference with previews in both themes (a private mirror for the owner): https://claude.ai/artifact/Bgq6rDafP6qyXiJBCsq8nf

## The essentials

- **Navy is the ground, turquoise is the system at work, amber means the owner is needed.** Nothing else gets brand colour.
- **Amber is rare:** only for decisions waiting on a person (approvals, items blocked on the owner). One dot per item, well under 5% of a screen.
- **Status is a dot plus a word.** Use `StatusDot` states: running, needs you, waiting, done, failed, offline.
- **Calm and ordered:** one ground, one surface level for content, monochrome text with hierarchy from size and weight, one accent. Lists are one sheet with dividers. No gradients, glows, stock imagery, emoji or decorative colour.
- **Primary action:** navy capsule in light, turquoise in dark (`action-primary-*`). One per view.
- **Type:** Inter for English and numbers, Heebo for Hebrew, JetBrains Mono for codes; tabular numbers for data.
- **Shape:** circles and soft radii from the logo (`radius-*` by role).
- **RTL:** logical properties only; codes and money isolated left-to-right.
- **AI employees** have permanent names and titles ("Maya · General Manager") and are navy discs with initials and an "AI" badge or title, never faces or mascots; Jev is a shared service, automations are dashed discs, tools are never actors (brand book, "People, AI employees and the office").

## Building a screen

1. Find the screen in `docs/ux/NAVIGATION_MAP.md` and its states in the feature's `design.md`.
2. Compose it from existing components. Check each in the component spec.
3. If you need a pattern that does not exist, research it first: search **Mobbin** (screens and flows, iOS and web) for 3–5 strong references of the same job (for example "approval request with evidence and expiry"). Note the links in the feature's `design.md`. Borrow the pattern, never the look.
4. Write the states as stories or previews first (`tdd` skill), then build.
5. Screenshot every state in he/en × light/dark and compare with the design system previews before calling it done (`feature-verification` skill).

## Adding or changing a component

1. Confirm no existing component (or variant) already does the job.
2. Get the owner's agreement for anything that changes the visual language.
3. Specify it in `design/COMPONENT_SPEC.md`: purpose, variants, sizes, states, rules, accessibility, consumer-provided props.
4. Implement it per platform with stories or previews and screenshot tests.
5. Keep the live reference in step when you have access to it (add or edit `components/<Name>/README.md` and `preview.html` there, following that artifact's own format instructions). The repository stays the source of truth; if you cannot update the reference, say so in the pull request.

## Review checklist for any UI change

- [ ] Only semantic tokens; no literal colours or sizes; no left/right.
- [ ] Amber used only for "needs you".
- [ ] Every status has a word; every icon-only control has a name.
- [ ] Contrast passes in both themes; focus ring visible.
- [ ] Hebrew and English both checked; codes and money keep their order.
- [ ] Loading, empty, error, stale, offline and no-permission states exist.
- [ ] Nothing claims success before the server confirms it.
