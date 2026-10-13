# HTCO Design System

| | |
|---|---|
| **Status** | Version 1 — awaiting owner review |
| **Source of truth** | This repository: [`tokens/`](tokens/README.md) (DTCG 2025.10), this brand book and [`COMPONENT_SPEC.md`](COMPONENT_SPEC.md) |
| **Live reference** | [HTCO design system](https://claude.ai/artifact/Bgq6rDafP6qyXiJBCsq8nf) — a private mirror with live previews of every component in both themes, for the owner and invited reviewers |
| **Brand assets** | [`../assets/brand/`](../assets/brand/) |
| **Contrast check** | `node design/tokens/check-contrast.mjs` (202 token pairs, both themes) |

If the live reference and this repository ever disagree, the repository wins and the reference is updated.

HTCO is the operating system for a marketplace business: verified orders, fulfillment and money, plus an AI workforce that acts under policy and asks before anything risky. The brand promise is **autonomy you can audit**. The interface should feel like a calm, well-run office: quiet surfaces, precise numbers, and one unmistakable signal when the owner is needed.

## The logo

- Use only the official file, [`assets/brand/HTCO_Official_Logo.png`](../assets/brand/HTCO_Official_Logo.png): a white **HT**, a turquoise **CO** and an amber dot on midnight navy. Never redraw, recolour, stretch, outline or re-typeset it.
- The file carries its own navy ground. On light surfaces, place it inside a `bg-brand` panel; never cut it out onto white.
- Minimum width 96 px. Keep clear space equal to the dot's diameter on every side.
- App icons (Windows, Android, favicon) are derived from the official file with its geometry preserved, and approved by the owner before use.

## Colour: three brand colours, three jobs

| Colour | Tokens | Its one job |
|---|---|---|
| Midnight navy `#030F1F` | `brand-navy`, `bg-canvas` (dark), `bg-brand` | **The office.** The calm ground everything sits on. |
| Turquoise `#05F7F4` | `brand-turquoise`, `accent-fill`, `action-primary-bg` (dark) | **The system at work.** Primary actions in the dark theme, live and running states, selection, progress. |
| Amber `#F8B857` | `brand-amber`, `attention-dot`, `attention-text`, `attention-subtle` | **You are needed.** The dot from the logo, used only where a human decision waits: approvals, items blocked on the owner. |

Rules:

- Amber is rare. One amber dot per item, and amber covers well under 5% of any screen. It never decorates, never marks system warnings (say those in words), and is never the first chart series.
- Surfaces: page `bg-canvas`, cards and tables `bg-surface`, menus and dialogs `bg-raised`, wells and table headers `bg-sunken`, selected rows `bg-selected`.
- Text: `text-primary` for content, `text-secondary` for supporting copy, `text-muted` for labels and metadata, `text-link` for links. Each holds at least 4.5:1 on `bg-canvas`, `bg-surface` and `bg-raised` in both themes.
- Lines: `border-subtle` for dividers, `border-strong` for card outlines, `border-control` for every input and control boundary (at least 3:1), `border-focus` for the focus ring.
- In the **light theme** the primary button is the navy ink capsule (`action-primary-bg` = navy), because turquoise text or fills on white fail contrast. Turquoise still appears as `accent-fill` indicators and as the deep teal `accent-text` for links.
- In the **dark theme** the primary button is turquoise with navy text (`action-primary-fg`).
- `success-*` and `danger-*` describe outcomes only. Every status pairs a dot with a word; colour is never the only signal.
- Charts use `dataviz-1` to `dataviz-5` in that order, at most five series.

## Typography

| Family | Token | Use |
|---|---|---|
| Inter | `--font-latin` | English text and all numbers |
| Heebo | `--font-hebrew` | Hebrew text (set `lang="he"` and `dir="rtl"`) |
| JetBrains Mono | `--font-mono` | Receipt numbers, tracking codes, SKUs, IDs, code; always left-to-right |

- Scale: `display` 40/48, `display-sm` 32/40, `title` 24/32, `title-sm` 20/28, `body` 16/24, `body-sm` 14/20, `caption` 12/16. Dense product UI uses `body-sm` for body text; never go below 12 px.
- Weights: 400 for text, 500 for labels and buttons, 600 for titles and key numbers. Hierarchy comes from size and weight, not colour.
- Numbers in tables, metrics and money use tabular figures.
- Sentence case everywhere. Uppercase only for short Latin `eyebrow` labels, never in Hebrew.
- Codes inside Hebrew text are wrapped in an LTR isolate so their characters keep their order.

## Voice and content

- Calm, precise, honest. Say what happened, what it means and what the person can do: "No tracking for receipt 3412987711 after 6 days. Re-running the sync."
- Name the source and age of data: "Etsy · 4 min ago". Say "Estimated" when a figure is not verified.
- Buttons are verbs: "Approve fix", "Connect shop". Hebrew buttons use the gender-neutral infinitive: "לאשר תיקון", "לחבר חנות".
- No exclamation marks, no emoji, no hype. Errors explain the cause and the next step without apology.
- System messages are in the third person ("Quality Supervisor flagged a size claim"). Agents speaking in a conversation use the first person, factually, and attach receipts.
- Agents are named by their role ("Quality Supervisor"), never given human names or faces.

## Layout and spacing

- A 4 px grid. Use the `space-*` tokens only: `space-2` inside controls, `space-3` between related items, `space-4` card padding, `space-6` between sections.
- Page gutters: 24 px on web and Windows, 16 px on phones.
- Density: tables 36 px rows on Windows and dense web views, 44 px standard, 56 px on touch. Touch targets are at least 48 px on Android.
- Breakpoints: 640, 900, 1200 and 1600 px. Under 1200 px the sidebar becomes a navigation rail; under 640 px, a bottom bar.
- Lists are one sheet with dividers, not a stack of separate cards. Cards are for objects that stand alone (a metric, an approval, an agent).

## Shape and depth

- Radii by role: `radius-sm` 8 inputs and chips, `radius-md` 12 buttons, `radius-lg` 16 cards, `radius-xl` 24 dialogs and sheets, `radius-full` pills, dots and avatars. The circle is the brand's shape, from the logo's C, O and dot.
- Depth in the light theme comes from soft navy-tinted shadows (`elevation-1` to `elevation-3`); in the dark theme from surface steps and borders. Never stack more than two elevated layers.

## Motion

- Durations 120 ms (state changes), 200 ms (enter and exit), 320 ms (large layout changes), with the standard easing curve.
- Motion explains a change; it never decorates. The office shows movement only for real events.
- Under reduced motion, transitions become instant and shimmer stops.

## Iconography

- Product icons are Lucide outline icons at 1.75 px stroke, 16, 20 or 24 px, on every platform, so the language stays the same everywhere. Operating system chrome keeps its native icons.
- Directional icons (chevrons, arrows) mirror in right-to-left layouts; logos, charts' time axes, media controls and codes do not.
- No emoji in the product.

## The status language

| State | Dot token | Word (example) |
|---|---|---|
| Running | `status-running` (turquoise with a soft halo) | "Running", "Auditing listing 12 of 64" |
| Needs you | `status-needs-you` (the amber dot) | "Needs you", "Waiting for your approval" |
| Waiting | `status-waiting` | "Waiting for supplier" |
| Done | `status-done` | "Delivered", "Resolved on evidence" |
| Failed or blocked | `status-failed` | "Blocked: capability not granted" |
| Offline | hollow ring in `status-waiting` | "Offline · data from 14 min ago" |

## People and agents

- Agents are navy discs with role initials (`AgentAvatar`): a turquoise ring when running, the amber dot when they need a decision, a dashed hollow disc when offline.
- People are photos or initials on neutral discs, so a person and an agent are never confused.
- Workers (deterministic code) appear as dashed neutral discs marked "W" in activity logs.

## Platforms

One visual language, native behaviour:

- **Web:** React Aria Components styled with these tokens; logical CSS properties only, so right-to-left works by construction.
- **Windows:** WinUI 3 controls themed with HTCO resource dictionaries (light, dark, high contrast), compact density by default.
- **Android:** Jetpack Compose with the same colours, type, shapes and components as the web. Android behaviours stay native (back gesture, bottom sheets, system dialogs, biometrics); we do not adopt a separate Material Expressive look.

## Accessibility

- WCAG 2.2 AA on every platform. Every text pair in the design tokens meets 4.5:1 and every control boundary 3:1, in both themes.
- Focus is always visible: a 2 px `border-focus` ring with a 2 px offset.
- Screen readers get the same information as sight: status words, approval reason, impact and risk in reading order, chart data as a table.
- Hebrew and English layouts are both first-class; test every screen in both directions and both themes.

## Components

38 components in nine groups: Actions, Forms, Navigation, Status, Data, Workforce, Decisions, Feedback and Overlays. Each has guidelines and a live preview. Thirty-three come from the product specification's inventory. Five are intentional additions:

- **StatusDot**, the base of the status language.
- **Tabs**, for object detail pages.
- **Toast**, for confirming verified background outcomes.
- **BottomBar**, the phone form of the sidebar.
- **Ltr**, which keeps codes and amounts in order inside right-to-left text.

## Inspiration

Screens studied on Mobbin while shaping this system:

- Jobber's workflow cards, for the order pipeline.
- Shopify's orders table, for density and status pills.
- Revolut Business approvals, for the approval card's evidence and timeline.
- Railway's dashboard, for the developer console.

HTCO borrows their patterns, not their look.
