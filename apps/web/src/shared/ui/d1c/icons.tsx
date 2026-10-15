import type { SVGProps } from "react";

// The demo's action glyphs the kit and its screens use (the shell's own are in ../icons.tsx).
type Props = Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> & { size?: number };

function stroked(d: string, width: number, extra?: { flip?: boolean }) {
  return function Glyph({ size = 16, className, ...props }: Props) {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={[extra?.flip === true ? "rtl:-scale-x-100" : "", className ?? ""].join(" ")}
        {...props}
      >
        <path d={d} />
      </svg>
    );
  };
}

function filled(d: string, evenOdd = false) {
  return function Glyph({ size = 16, className, ...props }: Props) {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        {...props}
      >
        <path d={d} {...(evenOdd ? { fillRule: "evenodd" as const } : {})} />
      </svg>
    );
  };
}

export const PlusIcon = stroked("M12 5v14M5 12h14", 1.6);
export const MinusIcon = stroked("M5 12h14", 1.6);
export const RightIcon = stroked("M9.5 6l6 6-6 6", 1.6, { flip: true });
export const ClipIcon = stroked(
  "M20 11.5l-7.8 7.8a5 5 0 01-7.1-7.1l8.1-8.1a3.3 3.3 0 014.7 4.7l-8 8a1.7 1.7 0 01-2.4-2.4l7.4-7.4",
  1.6,
);
export const SendIcon = stroked("M12 19V5M6 11l6-6 6 6", 2);
export const DownloadIcon = stroked("M12 4v11M7 10l5 5 5-5M5 20h14", 1.8);
export const CopyIcon = stroked("M9 9h10v10H9zM5 15V5h10", 1.7);
export const LinkIcon = stroked(
  "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
  1.7,
);
export const FilterIcon = filled(
  "M4 5.5A1.5 1.5 0 015.5 4h13a1.5 1.5 0 011.1 2.5L14.5 12v6.2a1 1 0 01-.6.9l-3 1.4a1 1 0 01-1.4-.9V12L4.4 6.5A1.5 1.5 0 014 5.5z",
);
export const DocIcon = filled(
  "M7 2.5h6.6c.3 0 .5.1.7.3l4.9 4.9c.2.2.3.4.3.7V19.5a2 2 0 01-2 2H7a2 2 0 01-2-2v-15a2 2 0 012-2zm1.5 10h7v1.5h-7zm0 3.5h7v1.5h-7zM13 3.5V8a1 1 0 001 1h4.5z",
  true,
);
export const ShieldIcon = filled(
  "M12 2.5l7.5 3v5.7c0 4.8-3.2 8.8-7.5 10.3-4.3-1.5-7.5-5.5-7.5-10.3V5.5zm-1.2 12.7l5.4-5.4-1.3-1.3-4.1 4.1-2-2-1.3 1.3z",
  true,
);
export const LaptopIcon = filled(
  "M5 5h14a1 1 0 011 1v9H4V6a1 1 0 011-1zm-3 11.5h20l-.6 1.6a1.5 1.5 0 01-1.4.9H4a1.5 1.5 0 01-1.4-.9z",
);
export const PhoneIcon = filled(
  "M8 2.5h8a2 2 0 012 2v15a2 2 0 01-2 2H8a2 2 0 01-2-2v-15a2 2 0 012-2zm2.5 16h3v1.2h-3z",
  true,
);
export const WhatsappIcon = filled(
  "M12 2.5a9.4 9.4 0 00-8.1 14.2L2.6 21.4l4.8-1.3A9.4 9.4 0 1012 2.5zm4.6 13.3c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.7-.1 1.3z",
);
