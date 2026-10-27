import type { ReactNode, SVGProps } from "react";

// HTCO's one icon set: Design 1C's own glyphs, solid shapes on a 24 grid for areas, objects and
// actions, strokes for marks and arrows, and thin strokes on a 12 grid for chevrons. They take the
// current text colour and are decorative (`aria-hidden`); the control around them carries the
// name. Orange is at most the glyph's colour, never a disc behind it (round 4).
// Directional glyphs (`flip`: they point along the reading direction, or draw the layout) mirror
// in right-to-left layouts themselves, so call sites never add `rtl:-scale-x-100`; marks with a
// fixed meaning (check, close, play, clock, search) never flip.
type GlyphProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> & { size?: number };

function svgGlyph(viewBox: string, body: ReactNode, stroke?: number, flip = false) {
  return function Glyph({ size = 16, className, ...props }: GlyphProps) {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={viewBox}
        width={size}
        height={size}
        className={[flip ? "rtl:-scale-x-100" : "", className ?? ""].join(" ").trim() || undefined}
        {...(stroke === undefined
          ? { fill: "currentColor" }
          : {
              fill: "none",
              stroke: "currentColor",
              strokeWidth: stroke,
              strokeLinecap: "round" as const,
              strokeLinejoin: "round" as const,
            })}
        {...props}
      >
        {body}
      </svg>
    );
  };
}

/** A glyph on the 24 grid: solid (`fill`) unless a stroke width is given. */
function glyph(body: ReactNode, stroke?: number, flip = false) {
  return svgGlyph("0 0 24 24", body, stroke, flip);
}

export type Glyph = ReturnType<typeof glyph>;

export const BackGlyph = glyph(<path d="M14.5 6l-6 6 6 6" />, 1.6, true);
export const NextGlyph = glyph(<path d="M9.5 6l6 6-6 6" />, 1.6, true);
export const PlusGlyph = glyph(<path d="M12 5v14M5 12h14" />, 1.6);
export const MinusGlyph = glyph(<path d="M5 12h14" />, 1.6);
export const CheckGlyph = glyph(<path d="M5 12.5l4.5 4.5L19 7.5" />, 2.4);
export const CloseGlyph = glyph(<path d="M6 6l12 12M18 6L6 18" />, 2);
export const ClipGlyph = glyph(
  <path d="M20 11.5l-7.8 7.8a5 5 0 01-7.1-7.1l8.1-8.1a3.3 3.3 0 014.7 4.7l-8 8a1.7 1.7 0 01-2.4-2.4l7.4-7.4" />,
  1.6,
);
export const SendGlyph = glyph(<path d="M12 19V5M6 11l6-6 6 6" />, 2);
export const DocGlyph = glyph(
  <path
    fillRule="evenodd"
    d="M7 2.5h6.6c.3 0 .5.1.7.3l4.9 4.9c.2.2.3.4.3.7V19.5a2 2 0 01-2 2H7a2 2 0 01-2-2v-15a2 2 0 012-2zm1.5 10h7v1.5h-7zm0 3.5h7v1.5h-7zM13 3.5V8a1 1 0 001 1h4.5z"
  />,
);
export const MoveGlyph = glyph(
  <path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3" />,
  1.5,
);
export const DownloadGlyph = glyph(<path d="M12 4v11M7 10l5 5 5-5M5 20h14" />, 1.8);
export const PauseGlyph = glyph(
  <>
    <rect x="6" y="5" width="4" height="14" rx="1.2" />
    <rect x="14" y="5" width="4" height="14" rx="1.2" />
  </>,
);
export const PlayGlyph = glyph(
  <path d="M8 5.5v13a1 1 0 001.5.9l10-6.5a1 1 0 000-1.7l-10-6.5A1 1 0 008 5.5z" />,
);
export const EyeGlyph = glyph(
  <>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </>,
  1.6,
);
export const FilterGlyph = glyph(
  <path d="M4 5.5A1.5 1.5 0 015.5 4h13a1.5 1.5 0 011.1 2.5L14.5 12v6.2a1 1 0 01-.6.9l-3 1.4a1 1 0 01-1.4-.9V12L4.4 6.5A1.5 1.5 0 014 5.5z" />,
);
export const BellGlyph = glyph(
  <path d="M12 2.5a6.5 6.5 0 016.5 6.5v3.8l1.7 2.6c.4.6 0 1.4-.8 1.4H4.6c-.8 0-1.2-.8-.8-1.4l1.7-2.6V9A6.5 6.5 0 0112 2.5zM9.5 18.5h5a2.5 2.5 0 01-5 0z" />,
);
/** Approvals: a check cut out of a disc (the bell is the notifications'). */
export const ApprovalGlyph = glyph(
  <path
    fillRule="evenodd"
    d="M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19zm4.3 6.4l-5.7 5.7-2.9-2.9-1.4 1.4 4.3 4.3 7.1-7.1z"
  />,
);
export const BoltGlyph = glyph(
  <path d="M13.6 2.3L4.8 13.1c-.4.5 0 1.2.6 1.2h5.4l-1.3 7.1c-.1.7.8 1.1 1.2.5l8.6-10.9c.4-.5 0-1.2-.6-1.2h-5.3l1.4-7c.2-.7-.7-1.1-1.2-.5z" />,
);
export const ChatGlyph = glyph(
  <path d="M5 3.5h14a2 2 0 012 2v10a2 2 0 01-2 2h-7.6l-4.8 3.6c-.5.4-1.1 0-1.1-.6v-3H5a2 2 0 01-2-2v-10a2 2 0 012-2z" />,
);

export const CopyGlyph = glyph(<path d="M9 9h10v10H9zM5 15V5h10" />, 1.7);
export const LinkGlyph = glyph(
  <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />,
  1.7,
);
export const ShieldGlyph = glyph(
  <path
    fillRule="evenodd"
    d="M12 2.5l7.5 3v5.7c0 4.8-3.2 8.8-7.5 10.3-4.3-1.5-7.5-5.5-7.5-10.3V5.5zm-1.2 12.7l5.4-5.4-1.3-1.3-4.1 4.1-2-2-1.3 1.3z"
  />,
);
export const LaptopGlyph = glyph(
  <path d="M5 5h14a1 1 0 011 1v9H4V6a1 1 0 011-1zm-3 11.5h20l-.6 1.6a1.5 1.5 0 01-1.4.9H4a1.5 1.5 0 01-1.4-.9z" />,
);
export const PhoneGlyph = glyph(
  <path
    fillRule="evenodd"
    d="M8 2.5h8a2 2 0 012 2v15a2 2 0 01-2 2H8a2 2 0 01-2-2v-15a2 2 0 012-2zm2.5 16h3v1.2h-3z"
  />,
);
export const WhatsappGlyph = glyph(
  <path d="M12 2.5a9.4 9.4 0 00-8.1 14.2L2.6 21.4l4.8-1.3A9.4 9.4 0 1012 2.5zm4.6 13.3c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.7-.1 1.3z" />,
);

/** The demo's small trend arrows (12 grid): up in the success colour, down in danger. */
export function TrendGlyph({ up = true, size = 10 }: { up?: boolean; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      width={size}
      height={size}
      className="shrink-0"
      fill="none"
      stroke={up ? "var(--success-dot)" : "var(--danger-dot)"}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={up ? "M6 10V2M2.5 5.5L6 2l3.5 3.5" : "M6 2v8M2.5 6.5L6 10l3.5-3.5"} />
    </svg>
  );
}
export const SearchGlyph = glyph(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5L21 21" />
  </>,
  2,
);
export const RefreshGlyph = glyph(
  <>
    <path d="M19.5 12a7.5 7.5 0 01-13.2 4.9M4.5 12a7.5 7.5 0 0113.2-4.9" />
    <path d="M18 3.5v4h-4M6 20.5v-4h4" />
  </>,
  1.7,
);
/** The lock of a password field. */
export const LockGlyph = glyph(
  <path
    fillRule="evenodd"
    d="M12 2.5a4.5 4.5 0 014.5 4.5v2.5h.5a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8a2 2 0 012-2h.5V7A4.5 4.5 0 0112 2.5zm0 2A2.5 2.5 0 009.5 7v2.5h5V7A2.5 2.5 0 0012 4.5zm0 9a1.5 1.5 0 00-.8 2.8V18h1.6v-1.7a1.5 1.5 0 00-.8-2.8z"
  />,
);
/** The envelope of an email field. */
export const MailGlyph = glyph(
  <path
    fillRule="evenodd"
    d="M5 4.5h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2v-11a2 2 0 012-2zm-.4 2.7l7.4 5.6 7.4-5.6v1.9l-7.4 5.6-7.4-5.6z"
  />,
);
/**
 * Offline or out of date: a cloud with an exclamation mark cut out of it, its bar 2.6 and its
 * dot 3 units wide so it reads at 16 px (Pixel's design notes).
 */
export const CloudAlertGlyph = glyph(
  <path
    fillRule="evenodd"
    d="M7 19a4.5 4.5 0 01-.6-9 6 6 0 0111.4-1.6A5 5 0 0117.5 19zM12 8.2a1.3 1.3 0 00-1.3 1.3v3.2a1.3 1.3 0 002.6 0V9.5A1.3 1.3 0 0012 8.2zm0 6.9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
  />,
);
export const PlugGlyph = glyph(
  <path d="M8.5 2.5a1 1 0 011 1V7h5V3.5a1 1 0 112 0V7h1a1 1 0 011 1v3.5a6 6 0 01-5 5.9V20.5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-3.1a6 6 0 01-5-5.9V8a1 1 0 011-1h1V3.5a1 1 0 011-1z" />,
);

/* ------------------------------------------------------------------ the shell's glyphs */

export const HomeGlyph = glyph(
  <path d="M12 3.2l8.6 7.4c.4.3.1.9-.4.9H19V20a1 1 0 01-1 1h-3.5v-5.5a1 1 0 00-1-1h-3a1 1 0 00-1 1V21H6a1 1 0 01-1-1v-8.5H3.8c-.5 0-.8-.6-.4-.9z" />,
);
export const GridGlyph = glyph(
  <>
    <rect x="3" y="3" width="8" height="8" rx="2.5" />
    <rect x="13" y="3" width="8" height="8" rx="2.5" />
    <rect x="3" y="13" width="8" height="8" rx="2.5" />
    <rect x="13" y="13" width="8" height="8" rx="4" />
  </>,
);
export const BagGlyph = glyph(
  <path
    fillRule="evenodd"
    d="M8 7V6.5a4 4 0 018 0V7h2.6c.5 0 .9.4 1 .9l1 12a1 1 0 01-1 1.1H4.4a1 1 0 01-1-1.1l1-12c.1-.5.5-.9 1-.9zm2 0h4v-.5a2 2 0 00-4 0z"
  />,
);
export const PieGlyph = glyph(
  <>
    <path d="M10.8 3.6a.6.6 0 01.7.6v8.1h8.1c.4 0 .7.3.6.7A9 9 0 1110.8 3.6z" />
    <path d="M13.6 2.5a.6.6 0 01.7-.6 8.6 8.6 0 017.8 7.8.6.6 0 01-.6.7h-7.3a.6.6 0 01-.6-.6z" />
  </>,
);
export const PulseGlyph = glyph(
  <path
    fillRule="evenodd"
    d="M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3zm1.3 11.6l2.5-3.4 2.6 2.6 4.2-5.3 1.2 1-5.3 6.6-2.6-2.6-1.4 2z"
  />,
);
export const GearGlyph = glyph(
  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z" />,
);
/** Down chevron (12 grid); rotates 180° when its list is open. */
export const ChevronGlyph = svgGlyph("0 0 12 12", <path d="M3 4.5l3 3 3-3" />, 1.4);
/** The crumb separator: points to the inline end, so it mirrors in right-to-left layouts. */
export const CrumbGlyph = svgGlyph("0 0 12 12", <path d="M4.5 2.5l3.5 3.5-3.5 3.5" />, 1.4, true);
export const MoreGlyph = glyph(
  <>
    <circle cx="5.5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="18.5" cy="12" r="1.8" />
  </>,
);
/** The sidebar toggle: a window with its sidebar at the inline start (mirrors with it). */
export const SidebarGlyph = glyph(
  <>
    <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" />
    <path d="M9.5 4.5v15" />
  </>,
  1.6,
  true,
);
/** The tweaks control: two sliders. */
export const TweaksGlyph = glyph(
  <>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2.2" />
    <circle cx="9" cy="17" r="2.2" />
  </>,
  1.7,
);
/** The theme follows the device: a half-filled circle. */
export const SystemThemeGlyph = glyph(
  <>
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 4a8 8 0 010 16z" />
  </>,
);
export const SunGlyph = glyph(
  <>
    <circle cx="12" cy="12" r="4.2" />
    <path
      d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </>,
);
export const MoonGlyph = glyph(
  <path d="M20.2 14.6A8.5 8.5 0 019.4 3.8a.6.6 0 00-.8-.7A9 9 0 1020.9 15.4a.6.6 0 00-.7-.8z" />,
);
