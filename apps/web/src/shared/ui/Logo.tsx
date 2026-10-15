import { useId } from "react";

import { cx } from "../lib/cx.ts";

// The official geometry, traced from the original logo into assets/brand/htco-logo.svg (client
// ADR-0007): the block H and T, the interlocked C and O with their knockout gaps, and the dot.
// Only the colours change with the design language.
const C_RING =
  "M1086.14 318.59A197 197 0 1 0 1086.14 620.41L1025.71 548.4A103 103 0 1 1 1025.71 390.6Z";
const O_RING =
  "M1202.5 270.5A198 198 0 1 1 1202.5 666.5A198 198 0 1 1 1202.5 270.5ZM1202.5 363.5A105 105 0 1 0 1202.5 573.5A105 105 0 1 0 1202.5 363.5Z";

const VIEW_BOX = { full: [165.5, 258.5, 1335, 422], mark: [749.5, 258.5, 751, 422] } as const;

/**
 * The HTCO logo in the Relay colours: HT in ink, CO in iris, the dot in saffron. `mark` is the
 * "CO." mark for small places (the collapsed sidebar, the favicon). `animated` plays the intro:
 * the dot drops into place once.
 */
export function Logo({
  variant = "full",
  height = 20,
  animated = false,
  className,
}: {
  variant?: "full" | "mark";
  height?: number;
  animated?: boolean;
  className?: string;
}) {
  const id = useId();
  const [x, y, w, h] = VIEW_BOX[variant];
  const mask = (suffix: string, cx: number, cy: number, r: number) => (
    <mask
      id={`${id}-${suffix}`}
      maskUnits="userSpaceOnUse"
      x="150"
      y="240"
      width="1380"
      height="460"
    >
      <rect x="150" y="240" width="1380" height="460" fill="#fff" />
      <circle cx={cx} cy={cy} r={r} fill="#000" />
    </mask>
  );
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
        {mask("t", 959.5, 469.5, 207)}
        {mask("c", 1202.5, 468.5, 208)}
        {mask("o", 1411.5, 564.5, 87)}
      </defs>
      {variant === "full" ? (
        <g fill="var(--text-primary)">
          <path d="M177.5 280.5H279V430.5H427.5V280.5H530.5V668.5H427.5V513.5H279V668.5H177.5Z" />
          <path
            d="M541.5 280.5H875.5V361.5H740.5V668.5H636.5V361.5H541.5Z"
            mask={`url(#${id}-t)`}
          />
        </g>
      ) : null}
      <g fill="var(--text-link)" fillRule="evenodd">
        <path d={C_RING} mask={`url(#${id}-c)`} />
        <path d={O_RING} mask={`url(#${id}-o)`} />
      </g>
      <circle
        cx="1411.5"
        cy="564.5"
        r="77"
        fill="var(--attention-ring)"
        className={cx(animated && "animate-dot-drop [transform-box:fill-box] origin-center")}
      />
    </svg>
  );
}
