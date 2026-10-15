import type { ReactNode, SVGProps } from "react";

// Design 1C's own glyphs, copied from the design: solid shapes on a 24 grid for areas and
// actions, thin strokes on a 12 grid for chevrons. They take the current text colour and are
// decorative (`aria-hidden`); the control around them carries the name.
type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> & { size?: number };

function glyph(viewBox: string, body: ReactNode, stroke?: { width: number }) {
  return function Glyph({ size = 16, className, ...props }: IconProps) {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={viewBox}
        width={size}
        height={size}
        className={className}
        {...(stroke === undefined
          ? { fill: "currentColor" }
          : {
              fill: "none",
              stroke: "currentColor",
              strokeWidth: stroke.width,
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

export type IconComponent = ReturnType<typeof glyph>;

export const HomeIcon = glyph(
  "0 0 24 24",
  <path d="M12 3.2l8.6 7.4c.4.3.1.9-.4.9H19V20a1 1 0 01-1 1h-3.5v-5.5a1 1 0 00-1-1h-3a1 1 0 00-1 1V21H6a1 1 0 01-1-1v-8.5H3.8c-.5 0-.8-.6-.4-.9z" />,
);
export const GridIcon = glyph(
  "0 0 24 24",
  <>
    <rect x="3" y="3" width="8" height="8" rx="2.5" />
    <rect x="13" y="3" width="8" height="8" rx="2.5" />
    <rect x="3" y="13" width="8" height="8" rx="2.5" />
    <rect x="13" y="13" width="8" height="8" rx="4" />
  </>,
);
export const BoltIcon = glyph(
  "0 0 24 24",
  <path d="M13.6 2.3L4.8 13.1c-.4.5 0 1.2.6 1.2h5.4l-1.3 7.1c-.1.7.8 1.1 1.2.5l8.6-10.9c.4-.5 0-1.2-.6-1.2h-5.3l1.4-7c.2-.7-.7-1.1-1.2-.5z" />,
);
export const BagIcon = glyph(
  "0 0 24 24",
  <path
    fillRule="evenodd"
    d="M8 7V6.5a4 4 0 018 0V7h2.6c.5 0 .9.4 1 .9l1 12a1 1 0 01-1 1.1H4.4a1 1 0 01-1-1.1l1-12c.1-.5.5-.9 1-.9zm2 0h4v-.5a2 2 0 00-4 0z"
  />,
);
export const ChatIcon = glyph(
  "0 0 24 24",
  <path d="M5 3.5h14a2 2 0 012 2v10a2 2 0 01-2 2h-7.6l-4.8 3.6c-.5.4-1.1 0-1.1-.6v-3H5a2 2 0 01-2-2v-10a2 2 0 012-2z" />,
);
export const PieIcon = glyph(
  "0 0 24 24",
  <>
    <path d="M10.8 3.6a.6.6 0 01.7.6v8.1h8.1c.4 0 .7.3.6.7A9 9 0 1110.8 3.6z" />
    <path d="M13.6 2.5a.6.6 0 01.7-.6 8.6 8.6 0 017.8 7.8.6.6 0 01-.6.7h-7.3a.6.6 0 01-.6-.6z" />
  </>,
);
export const PulseIcon = glyph(
  "0 0 24 24",
  <path
    fillRule="evenodd"
    d="M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3zm1.3 11.6l2.5-3.4 2.6 2.6 4.2-5.3 1.2 1-5.3 6.6-2.6-2.6-1.4 2z"
  />,
);
export const BellIcon = glyph(
  "0 0 24 24",
  <path d="M12 2.5a6.5 6.5 0 016.5 6.5v3.8l1.7 2.6c.4.6 0 1.4-.8 1.4H4.6c-.8 0-1.2-.8-.8-1.4l1.7-2.6V9A6.5 6.5 0 0112 2.5zM9.5 18.5h5a2.5 2.5 0 01-5 0z" />,
);
export const SearchIcon = glyph(
  "0 0 24 24",
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5L21 21" />
  </>,
  { width: 2 },
);
export const GearIcon = glyph(
  "0 0 24 24",
  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z" />,
);
/** Down chevron (12 grid); rotates 180° when its list is open. */
export const ChevronIcon = glyph("0 0 12 12", <path d="M3 4.5l3 3 3-3" />, { width: 1.4 });
/** The crumb separator: points to the inline end, so it mirrors in right-to-left layouts. */
export const CrumbIcon = glyph("0 0 12 12", <path d="M4.5 2.5l3.5 3.5-3.5 3.5" />, {
  width: 1.4,
});
export const ArrowEndIcon = glyph("0 0 24 24", <path d="M9.5 6l6 6-6 6" />, { width: 1.6 });
export const CheckIcon = glyph("0 0 24 24", <path d="M5 12.5l4.5 4.5L19 7.5" />, { width: 2.4 });
export const CloseIcon = glyph("0 0 24 24", <path d="M6 6l12 12M18 6L6 18" />, { width: 2 });
export const MoreIcon = glyph(
  "0 0 24 24",
  <>
    <circle cx="5.5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="18.5" cy="12" r="1.8" />
  </>,
);
/** The sidebar toggle: a window with its sidebar. */
export const SidebarIcon = glyph(
  "0 0 24 24",
  <>
    <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" />
    <path d="M9.5 4.5v15" />
  </>,
  { width: 1.6 },
);
/** The tweaks control: two sliders. */
export const TweaksIcon = glyph(
  "0 0 24 24",
  <>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2.2" />
    <circle cx="9" cy="17" r="2.2" />
  </>,
  { width: 1.7 },
);
/** The theme follows the device: a half-filled circle. */
export const SystemThemeIcon = glyph(
  "0 0 24 24",
  <>
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 4a8 8 0 010 16z" />
  </>,
);
export const SunIcon = glyph(
  "0 0 24 24",
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
export const MoonIcon = glyph(
  "0 0 24 24",
  <path d="M20.2 14.6A8.5 8.5 0 019.4 3.8a.6.6 0 00-.8-.7A9 9 0 1020.9 15.4a.6.6 0 00-.7-.8z" />,
);
