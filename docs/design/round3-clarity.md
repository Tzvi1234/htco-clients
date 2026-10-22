# Round 3: clarity (2026-10-22)

The owner's brief asked for calm: keep Design 1C and its navigation, make the navigation and the top bar frosted glass, improve the motion, add orange as a deliberate third colour, move all personalisation into Settings, and redesign the screens with real features so a simple user sees at once what matters. The decisions are in [ADR-0009](../adr/0009-clarity-round-3.md).

The work is split in two pull requests:

- **Part A** (this record's first section): the shell, Settings, the landing page `/welcome` and the sign-in screens.
- **Part B**: the content of Home, Shops, Orders, Products, Shipping and Customers, after the live Etsy data (#35).

## Part A

### What moved where

| Before | After |
|---|---|
| Top bar: language switch, tweaks button (contrast, glass, borders, palette, theme) | Gone. Settings holds exactly three personal settings: theme, palette, language |
| Account menu: language and theme | Settings, Security, Sign out |
| Palettes SBB, Design 4, Plain ground | Gray (`sbb`, default) and Cream (`d4`, now with the logo's orange); a stored `plain` becomes Gray |
| Glass as a tweak, with the bloom ground | Always on for the sidebar, flyout, phone tab bar and sheet, and the top bar; solid under "reduce transparency" |
| Settings: three columns of panels, each scrolling on its own | One page that scrolls as a whole: Appearance and language first, then Access and security beside Connections, then "Coming later" (business details and notifications, demos) |
| Landing: a grid of boxes and a carousel | One flowing page: a layered hero, four lines of what works today, the planned office passing sideways on ink with an approval the scroll decides, a rail of three steps, and an orange close |
| Sign-in: office render with a caption and demo numbers over it | The render alone; the form's parts rise one after another |

No new sub-tabs or screens were needed: Settings fits one page once the personal settings come first and the planned ones are grouped apart.

### Motion

- Sidebar groups, the flyout and the phone sheet open in 300 ms and close in 200 ms on one spring-like, critically damped curve. They are CSS transitions, so toggling again mid-way turns them around. Rows stagger 25 ms apart. Under reduced motion there is no travel and no stagger (checked in `e2e/journeys/clarity.spec.ts`).
- The sheet's grabber closes on a slow drag past 96 px or on a quick flick, and an upward drag meets friction.
- Screen to screen: the old screen settles back and fades, the new one arrives from a soft blur, from the inline end when it comes later in the navigation and from the start when earlier. The current tab's ink pill glides between tabs of one area.

### The landing page (scroll-craft)

Grammar: a chaptered composition on one ground, each chapter in its own colour (ground, ground, ink, ground, orange) and with its own device: a layered parallax hero (four planes: the office plan, the logo's orange sun, the robot carrying an order, the parcel), wiping lines, a pinned sideways pan, a filling rail, and a rising close. The peak is the ink chapter; its signature is an example approval that waits in orange and is decided by the scroll: the orange sweeps the Approve button and the request becomes "Approved by you". No assets were generated; the existing renders in `apps/web/src/assets/hero/` are used. Everything uses scroll-driven CSS animations; under reduced motion or without support, the page stands still in its final composition and nothing pins. The bar over the page turns to dark glass over the ink chapter and to a nearly solid ground over the orange one, so its words keep AA contrast.

### Impeccable scores (part A screens)

Critique is Impeccable's heuristic score (0 to 40); audit is its technical score (0 to 20). Before is the main branch at d08da9c, after is this pull request; both were taken from screenshots at 1440×900 and 375×812 in Hebrew, light and dark.

| Screen | Critique before | Critique after | Audit before | Audit after | Main changes |
|---|---|---|---|---|---|
| Shell (sidebar, flyout, top bar, tab bar) | 30 | 35 | 16 | 18 | Glass by default, spring motion with exits, no personalisation in the bar, 12 px meta text |
| Settings | 22 | 34 | 14 | 18 | Three clear settings first, no inner scrolling, planned settings grouped apart |
| Landing `/welcome` | 26 | 35 | 15 | 18 | One composition instead of boxes, orange chapters, scroll choreography, carousel dots gone |
| Sign-in | 33 | 35 | 17 | 18 | Clean render, staggered form, spring step dots |

Commands run on these screens: critique, audit, distill (the tweaks and the boxes removed), clarify (setting names and lines), harden (migration, storage blocked, reduce transparency, RTL pan), onboard (Settings shows the three choices first), layout, typeset (type ramp tokens; one 84 px hero size on purpose), colorize (orange for selection, the peak and the close), animate, delight (the scroll-decided approval), adapt (phone compositions checked), optimize (scroll-driven CSS, no scroll listeners except the landing bar's one per frame), quieter (Settings), bolder and overdrive (the landing page), polish, then a final critique and audit. The detector reported no anti-patterns on the changed files; its advisories were the type sizes on the landing page, now on the ramp except the hero.

### Carried over from round 2

- The landing carousel's dots failed target size: the carousel is gone.
- 11 px meta text in the shell (group labels, the flyout's "Area", the keyboard hint, the tab bar labels) is now 12 px.
- The chat composer is not on a part A screen.

### Left for later

- Home and the office floor still pick the lilac renders under the Cream palette; they belong to part B.
- The other screens keep the fill-the-window layout; part B can opt them into `scroll: "page"`.
