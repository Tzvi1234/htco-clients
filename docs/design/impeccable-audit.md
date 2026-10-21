# Impeccable audit — the web app (October 2026)

A design-quality pass over every screen of `apps/web` with the Impeccable skill (v4.7.0:
critique, audit, polish, layout, typeset, animate, adapt, harden), inside the pinned Design 1C
brief ([client ADR-0008](../adr/0008-design-1c.md)): a refinement, not a redesign. The visual
system is recorded in [`DESIGN.md`](../../DESIGN.md) and the product in
[`PRODUCT.md`](../../PRODUCT.md).

## Method

- **Coverage:** 35 routes (home; office floor, chat, team, AI ops, engineering; work tasks,
  approvals, activity; shops with and without shops, the Etsy callback; orders, products,
  shipping, suppliers; tickets, customers, mail, marketing; finance overview and ledger; health,
  automations, members, settings, security; sign-in, two-step code, forgot, reset, accept invite,
  no workspace, not found; the landing page) in six variants: 1440×900 Hebrew and English,
  375×812 Hebrew, dark, frosted glass and Design 4 — 210 screenshots, on the in-memory API
  (`?demo`). The live Etsy shop was never called.
- **Evidence:** the Impeccable detector (source and rendered URLs), axe-core on every route and
  variant, a DOM scan (targets under 24 px or 44 px on phones, text under 11 px, clipped text,
  horizontal overflow, console errors), a keyboard walk recording the focus indicator of every
  stop, and a design review of each screenshot.
- **Run notes:** the critique ran in a single context (the subagent running it had no further
  subagents for isolated assessments A and B), with the detector run before the design review was
  written up. No interview was possible; PRODUCT.md is written from the repository and the brief.

## Scores

| Measure | Before | After |
|---|---|---|
| Audit health (5 dimensions × 4) | **13/20** (Acceptable) | **18/20** (Excellent) |
| Nielsen heuristics (10 × 4) | **30/40** | **33/40** |

### Audit health

| # | Dimension | Before | After | Key finding |
|---|---|---|---|---|
| 1 | Accessibility | 1 | 3 | No visible keyboard focus on almost every control; no skip link; chat threads unreachable by keyboard |
| 2 | Performance | 3 | 3 | Lazy demo screens, `webp` art, transform/opacity motion; one dead animation |
| 3 | Theming | 3 | 4 | Token-only, 114 modes contrast-checked; radius utilities outside the token scale rendered square |
| 4 | Responsive | 3 | 4 | Phone layout complete; dates cut mid-value; shop cards' rows not level |
| 5 | Implementation integrity | 3 | 4 | Coherent Design 1C system; English units in Hebrew, Demo tags over sample text |

### Heuristics

| # | Heuristic | Before | After | Note |
|---|---|---|---|---|
| 1 | Visibility of system status | 3 | 4 | Focus position now always visible; live dots, Demo/Soon marks already honest |
| 2 | Match with the real world | 3 | 4 | Minutes in the user's language |
| 3 | User control and freedom | 3 | 3 | Escape on every overlay; sign-out per device |
| 4 | Consistency and standards | 3 | 4 | One Demo-tag placement rule; one radius scale |
| 5 | Error prevention | 3 | 3 | Double submit guarded; pending states |
| 6 | Recognition rather than recall | 3 | 3 | Labelled icons, crumbs, Soon tags |
| 7 | Flexibility and efficiency | 3 | 3 | Ctrl K palette, collapsible sidebar; skip link added |
| 8 | Aesthetic and minimalist design | 4 | 4 | The owner's calm, ordered design |
| 9 | Error recovery | 3 | 3 | Problem messages with a next step |
| 10 | Help and documentation | 2 | 2 | No in-app help yet (planned with the office) |

## Design specificity verdict

Pass. Design 1C is authored for this product: the office of named AI employees, the approvals
against policies, the label-over-value facts, the DEMO and Soon conventions and the bilingual
mirror do not read as a template. The detector's `nested-cards` findings (cards inside panels)
and the label-over-value "kicker" pattern are the brief's own structure, not defects; the logo's
dot drop keeps its overshoot as the brand's one authored moment.

## Findings and fixes

P0 blocks a task, P1 is a WCAG AA failure or a significant defect, P2 a visible flaw with a
workaround, P3 polish. Every item marked **Fixed** is in this pull request.

### P0

1. **No visible keyboard focus on almost every control** (sidebar areas and tabs, the shop card,
   quick actions, the account card, the language switch, every 40 px circle button, panel
   actions, the hero arrows). Tailwind 4's `outline-none` sets the outline style that
   `focus-visible:outline-2` relies on, and it also beat the global ring in the base layer, so
   the "one focus ring everywhere" never drew. WCAG 2.4.7. **Fixed:** the ring moved out of the
   cascade layers (`styles.css`), so no utility can hide it; fields keep their pill focus, menu
   and list items their highlight. A journey test walks the shell by keyboard on both viewports.

### P1

2. **No way to skip the navigation** (13 stops before the screen). WCAG 2.4.1. **Fixed:** a
   "Skip to content" / "דילוג לתוכן" link, shown on focus, moves focus to `main`.
3. **Sidebar rows, the account card, the phone sheet's rows and menu items rendered with square
   corners** (`rounded-3xl`, `rounded-xl` are not token radii, so Tailwind emitted nothing):
   square hover fills and rings against the design's capsules. **Fixed:** explicit 24 px and
   12 px radii.
4. **Chat and team-room threads could not be scrolled by keyboard** (axe
   `scrollable-region-focusable`). **Fixed:** the thread is a focusable, named `log`.
5. **English units inside Hebrew** ("12 min", "38 min", "42 min" on Home and Approvals).
   **Fixed:** `useMinutes` formats with `Intl` ("12 דק׳"), not isolated left-to-right.

### P2

6. **Shop cards side by side had misaligned rows**: the parcel absorbed the leftover height, so a
   card with Reconnect had a smaller parcel and every row below sat higher. **Fixed:** one art
   height for every card (`clamp(72px, 100dvh − 820px, 160px)` on wide screens).
7. **Demo tags sat on top of sample text** (Settings › Connections: the tag overlapped
   "Connected"; Shops › Top listings: the tag was centred over two cards' edges). **Fixed:** the
   tags sit in a column beside the statuses, and in the strip's corner.
8. **Small targets under 24 px** (WCAG 2.5.8): the tweaks' level switches (22 px), "Forgot
   password?", "Back to sign-in", "Reset", the getting-started links (16 px). **Fixed:** 24 px
   targets without moving the text.
9. **A device's "Last active" date was cut mid-value on phones** ("…026 באוק׳ 15"). **Fixed:**
   that line wraps.
10. **Uncaught `AbortError: Transition was skipped`** on the reset and invitation links (the
    fragment is cleared right after the page opens). **Fixed:** that replace skips the view
    transition.
11. **The sent-mail mark never animated** (its keyframes were missing) and used an overshooting
    curve. **Fixed:** keyframes added on the system's enter curve.
12. **Browser-drawn parts in browser defaults:** selection, caret and scrollbars. **Fixed:**
    themed from the palette (accent wash selection, ink caret, hairline scrollbars).

### P3 and accepted exceptions

- Demo screens and parts are dimmed by design (opacity 0.78 and 0.62), so their muted sample text
  measures about 3:1 (axe `color-contrast` on office screens). The content is sample data marked
  Demo and is inert or view-only; kept as the brief's convention.
- 40 px circle buttons are under 44 px on phones; they pass WCAG 2.5.8 (24 px) and match the
  design. Kept.
- The office floor's 11 px room labels are part of the drawn map. Kept.
- Help and documentation (heuristic 10) waits for the planned in-app help.

## Verification

- Unit and component tests: all passing, with new tests for the skip link and minutes.
- Journeys: a new keyboard test asserts a solid 2 px ring on every stop of the shell (1440×900
  and 375×812).
- Screenshots: before and after sets of the 210 captures were reviewed side by side; baselines in
  CI were regenerated where the focus ring, radii, the shop cards or the Demo tags changed.

## Remaining findings for the next rounds

Round 2 fixed or answered each of these: see [round2-review.md](round2-review.md).

Round 1 (this pass) fixed the shell and the real screens' defects above. Left for round 2 (other
design skills) and round 3 (a fresh Impeccable pass):

- **Demo screens' contrast:** muted sample text under the Demo dimming measures about 3:1 (axe on
  the office screens). Consider dimming with a veil that keeps text at 4.5:1, or exempting
  inert demo content explicitly.
- **Phone targets:** 40 px circle buttons and the 5 px hero dots (24 px hit area) are under the
  44 px phone guideline; a coarse-pointer hit-area extension would keep the look.
- **Empty space in tall panels:** Etsy callback, Security's two-step panel, Eng › incident and
  the empty Shops "how to connect" panel leave large voids at 1440×900; group content or pin the
  footer facts.
- **Settings › Security line:** "Two-step sign-in on · 2 devices" spacing around the middle dot.
- **Help and documentation** (heuristic 10 scored 2): no contextual help yet.
- **Office floor:** 11 px room labels on the map; check legibility at 375 px.
- **Bounce curve on the logo's dot drop** kept as the brand's one authored moment; confirm with
  the owner.
- **Impeccable sidecar** (`.impeccable/design.json`) not written: the repository's no-junk rule;
  decide whether the live panel is wanted.
