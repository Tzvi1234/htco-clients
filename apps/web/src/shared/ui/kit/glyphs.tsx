import type { ReactNode, SVGProps } from "react";

// More of Design 1C's own glyphs (the demo's `I` set) for the screen kit: solid shapes and
// strokes on a 24 grid, decorative and in the current text colour. The shell's glyphs are in
// ../icons.tsx. `flip` glyphs point along the reading direction and mirror in RTL.
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

/** The demo's small trend arrows (12 grid): up in the success colour, down in danger. */
export function TrendGlyph({ up = true }: { up?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      width={10}
      height={10}
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
