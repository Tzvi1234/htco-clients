import type { ReactNode, SVGProps } from "react";

// The Design 1C demo's own glyphs (its `I` set) for the screen kit: solid shapes and strokes on
// a 24 grid, decorative and in the current text colour. The shell's glyphs are in ../icons.tsx.
// `flip` glyphs point along the reading direction and mirror in RTL.
type GlyphProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> & { size?: number };

function glyph(body: ReactNode, stroke?: number, flip = false) {
  return function Glyph({ size = 16, className, ...props }: GlyphProps) {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
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

export type Glyph = ReturnType<typeof glyph>;

export const BackGlyph = glyph(<path d="M14.5 6l-6 6 6 6" />, 1.6, true);
export const NextGlyph = glyph(<path d="M9.5 6l6 6-6 6" />, 1.6, true);
export const PlusGlyph = glyph(<path d="M12 5v14M5 12h14" />, 1.6);
/** A passkey: biometric sign-in (Face ID, Touch ID, Windows Hello, a fingerprint). */
export const FingerprintGlyph = glyph(
  <path d="M7.5 5.5A8 8 0 0 1 20 12v1.5M4 9.5a8 8 0 0 0-.5 3.5M8 19.5A9 9 0 0 1 7 12a5 5 0 0 1 10 0v1.5M12 12v2.5a8 8 0 0 0 2 5.5M10.5 21a10 10 0 0 1-1.5-6.5V12a3 3 0 0 1 6 0M17.5 20a12 12 0 0 0 1-4" />,
  1.5,
);
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
export const PlugGlyph = glyph(
  <path d="M8.5 2.5a1 1 0 011 1V7h5V3.5a1 1 0 112 0V7h1a1 1 0 011 1v3.5a6 6 0 01-5 5.9V20.5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-3.1a6 6 0 01-5-5.9V8a1 1 0 011-1h1V3.5a1 1 0 011-1z" />,
);
