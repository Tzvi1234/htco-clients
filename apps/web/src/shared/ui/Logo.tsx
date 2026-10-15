import { useId } from "react";

import { cx } from "../lib/cx.ts";

// The Design 1C logo (client ADR-0008), drawn by the owner: block H and T, the interlocked C and
// O cut by each other's circles, and the dot cut into the O. The same geometry is in
// assets/brand/htco-logo.svg. Colours come from the palette's tokens (logo.ht, logo.co,
// logo.dot), so the logo follows the palette and the theme.
const H = "M203 321h118v172h170V321h119v446H491V590H321v177H203z";
const T = "M621 321h400v93H850v353H730V414H621z";
const C_RING =
  "M1100 314a225 225 0 1 1 0 450a225 225 0 1 1 0-450zM1100 421a117 117 0 1 0 0 234a117 117 0 1 0 0-234z";
const O_RING =
  "M1381 311a226 226 0 1 1 0 452a226 226 0 1 1 0-452zM1381 415a117 122 0 1 0 0 244a117 122 0 1 0 0-244z";

const VIEW_BOX = { full: [190, 300, 1530, 475], mark: [862, 300, 858, 475] } as const;

/**
 * The HTCO logo: HT in ink, CO in the accent (orange, or lilac in Design 4), the dot in ink (or
 * lemon). `mark` is the "CO." mark for small places (the collapsed sidebar, the favicon).
 * `inverse` sets it on the inverse fill. `animated` plays the intro: the dot drops into place.
 */
export function Logo({
  variant = "full",
  height = 22,
  animated = false,
  inverse = false,
  className,
}: {
  variant?: "full" | "mark";
  height?: number;
  animated?: boolean;
  /** On the inverse (ink) fill: HT and the dot in the fill's text colour. */
  inverse?: boolean;
  className?: string;
}) {
  const id = useId();
  const [x, y, w, h] = VIEW_BOX[variant];
  const mask = (suffix: string, cx: number, cy: number, r: number) => (
    <mask id={`${id}-${suffix}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
      <rect width="1920" height="1080" fill="#fff" />
      <circle cx={cx} cy={cy} r={r} fill="#000" />
    </mask>
  );
  const ink = inverse ? "var(--inverse-text)" : "var(--logo-ht)";
  const co = inverse ? "var(--accent-on-inverse)" : "var(--logo-co)";
  const dot = inverse ? "var(--inverse-text)" : "var(--logo-dot)";
  return (
    <svg
      role="img"
      aria-label="HTCO"
      viewBox={`${String(x)} ${String(y)} ${String(w)} ${String(h)}`}
      height={height}
      width={Math.round((w / h) * height)}
      className={cx("block shrink-0", className)}
    >
      <defs>
        {mask("ht", 1100, 539, 241)}
        {mask("c", 1381, 537, 241)}
        {mask("o", 1621, 648, 102)}
      </defs>
      {variant === "full" ? (
        <g fill={ink} mask={`url(#${id}-ht)`}>
          <path d={H} />
          <path d={T} />
        </g>
      ) : null}
      <g mask={`url(#${id}-c)`}>
        <path fill={co} fillRule="evenodd" d={C_RING} />
      </g>
      <g mask={`url(#${id}-o)`}>
        <path fill={co} fillRule="evenodd" d={O_RING} />
      </g>
      <circle
        cx="1621"
        cy="648"
        r="88"
        fill={dot}
        className={cx(animated && "animate-dot-drop [transform-box:fill-box] origin-center")}
      />
    </svg>
  );
}
