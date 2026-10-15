import type { SVGProps } from "react";

// The Design 1C demo's action glyphs that the shell's icon set does not carry yet (icons.tsx):
// copied from the design, decorative, taking the current text colour.
type GlyphProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> & { size?: number };

function base(size: number, props: GlyphProps, viewBox = "0 0 24 24") {
  return {
    "aria-hidden": true,
    focusable: false,
    viewBox,
    width: size,
    height: size,
    ...props,
  } as const;
}

const stroke = (width: number) =>
  ({
    fill: "none",
    stroke: "currentColor",
    strokeWidth: width,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }) as const;

export function PlusGlyph({ size = 16, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props)} {...stroke(1.6)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusGlyph({ size = 16, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props)} {...stroke(1.6)}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function FilterGlyph({ size = 16, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props)} fill="currentColor">
      <path d="M4 5.5A1.5 1.5 0 015.5 4h13a1.5 1.5 0 011.1 2.5L14.5 12v6.2a1 1 0 01-.6.9l-3 1.4a1 1 0 01-1.4-.9V12L4.4 6.5A1.5 1.5 0 014 5.5z" />
    </svg>
  );
}

export function DownloadGlyph({ size = 16, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props)} {...stroke(1.8)}>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

export function UpGlyph({ size = 12, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props, "0 0 12 12")} {...stroke(1.4)} stroke="var(--success-dot)">
      <path d="M6 10V2M2.5 5.5L6 2l3.5 3.5" />
    </svg>
  );
}

export function XGlyph({ size = 16, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props)} {...stroke(2)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function CheckGlyph({ size = 16, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props)} {...stroke(2.4)}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ChatGlyph({ size = 16, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props)} fill="currentColor">
      <path d="M5 3.5h14a2 2 0 012 2v10a2 2 0 01-2 2h-7.6l-4.8 3.6c-.5.4-1.1 0-1.1-.6v-3H5a2 2 0 01-2-2v-10a2 2 0 012-2z" />
    </svg>
  );
}

export function SearchGlyph({ size = 16, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props)} {...stroke(2)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </svg>
  );
}

export function RefreshGlyph({ size = 16, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props)} {...stroke(1.7)}>
      <path d="M19.5 12a7.5 7.5 0 01-13.2 4.9M4.5 12a7.5 7.5 0 0113.2-4.9" />
      <path d="M18 3.5v4h-4M6 20.5v-4h4" />
    </svg>
  );
}

export function PlugGlyph({ size = 16, ...props }: GlyphProps) {
  return (
    <svg {...base(size, props)} fill="currentColor">
      <path d="M8.5 2.5a1 1 0 011 1V7h5V3.5a1 1 0 112 0V7h1a1 1 0 011 1v3.5a6 6 0 01-5 5.9V20.5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-3.1a6 6 0 01-5-5.9V8a1 1 0 011-1h1V3.5a1 1 0 011-1z" />
    </svg>
  );
}
