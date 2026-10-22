# Product

<!-- impeccable:product-schema 1 -->

<!-- Written from the repository (CLAUDE.md, docs/adr/0008-design-1c.md, docs/ux/) and the owner's
brief for the Impeccable pass; no interview was held. Facts marked "(inferred)" come from code
and docs rather than from the owner. -->

## Platform

web

## Users

- **The owner of an Etsy business** (HT Commerce, by H.T.Z Studios), working in Hebrew first and
  in English, on a desktop at 1280 px and wider and on a phone. He supervises shops, a small human
  team and an office of AI employees, and decides what they may do.
- **Team members** invited by the owner with a role (Admin, Operations, Finance, Support, Developer,
  Viewer; the inviter is the Owner) who see what their role allows (inferred from the
  invitation form).

## Product Purpose

HTCO OS is the operating system of an Etsy business: connected shops, orders, products,
shipping, suppliers, customers, finance and an office of 16 AI employees in seven departments
that work, and ask the owner before anything risky. Success is that the owner sees what needs
him at a glance, decides quickly, and trusts that the screen shows only what really happened.

## Positioning

An office of named AI employees with permanent titles, whose actions are approved by the owner
against policies, shown only from recorded activity: never a fake "running" state.

## Operating Context

- The web app (`apps/web`) is the first client; Android and Windows follow the same design.
- `dash.ht-co.app` serves the app and the landing page `/welcome`; both share one preference for
  language, theme and palette (set in Settings).
- Built today: sign-in with two-step codes, password reset, invitations, shops (Etsy connection,
  reconnect, capabilities, disconnect), members and access, settings, security. Every other tab
  of the design exists as a dimmed **Demo** screen until its slice is built.
- The connected Etsy shop is live; development uses an in-memory fake API (`?demo`).

## Capabilities and Constraints

- No business rules in the client; the server decides. Generated API clients only.
- Every string in Hebrew and English (Lingui); right-to-left layout with logical properties;
  codes, numbers and money isolated left-to-right.
- Every screen has loading, empty, error, stale, offline and no-permission states; success is
  shown only when the server confirms it.
- Unbuilt screens show the full design dimmed with a top-bar DEMO pill; unbuilt parts of real
  screens are dimmed and tagged "Demo"; tabs without a screen carry "Soon".

## Brand Commitments

- **Design 1C** is the owner's own design (client ADR-0008), copied 1:1: its palettes (Gray and
  Cream, both with the logo's orange since round 3), the theme, Outfit and Heebo, radii, shell and layouts. Changes refine; they do
  not redesign.
- The logo is the owner's Design 1C logo (`assets/brand/`), never redrawn or recoloured outside
  the `logo.*` tokens.
- Approved deviation: text grays are darkened until they pass WCAG AA in every mode.

## Evidence on Hand

- The owner's prototype (Design 1C demo) and its regenerated transparent renders in
  `apps/web/src/assets/`.
- No testimonials, customer counts or benchmarks exist; none may be invented.

## Product Principles

1. The owner is needed rarely and clearly: what waits for him is obvious and few.
2. Honest status: recorded activity only, demo content always marked.
3. Hebrew and English are equals.
4. Calm, ordered screens: panels on a gray ground, ink for what is current, one accent.

## Accessibility & Inclusion

WCAG 2.2 AA; keyboard and screen-reader paths for every action; contrast checked in all 114
palette, theme and tweak modes; reduced motion removes travel.
