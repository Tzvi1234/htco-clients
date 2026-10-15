import { cx } from "../lib/cx.ts";

/*
 * Brand-moment art (design/README.md, "Illustration"): flat shapes in the illustration palette
 * with 2 px ink outlines, built from HTCO's own objects — receipts, listing tiles, the handoff
 * rings of the logo's interlocked C and O, and the saffron dot. Decorative only (aria-hidden),
 * never on work surfaces, never animated in a loop.
 */

const INK = "var(--illustration-ink)";
const PAPER = "var(--illustration-paper)";

/** The handoff rings: work passing from an employee, through policy, to the owner (the dot). */
function Rings({ x, y, r, className }: { x: number; y: number; r: number; className?: string }) {
  return (
    <g className={className}>
      <circle cx={x} cy={y} r={r} fill="none" stroke={INK} strokeWidth={r * 0.5 + 4} />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke="var(--illustration-iris)"
        strokeWidth={r * 0.5}
      />
      <circle cx={x + r * 1.25} cy={y} r={r} fill="none" stroke={INK} strokeWidth={r * 0.5 + 4} />
      <circle
        cx={x + r * 1.25}
        cy={y}
        r={r}
        fill="none"
        stroke="var(--illustration-sky)"
        strokeWidth={r * 0.5}
      />
      <circle
        cx={x + r * 2.35}
        cy={y + r * 0.62}
        r={r * 0.42}
        fill="var(--illustration-saffron)"
        stroke={INK}
        strokeWidth="2"
      />
    </g>
  );
}

/** A small receipt: the shape every order arrives as. */
function Receipt({ x, y, className }: { x: number; y: number; className?: string }) {
  return (
    <g className={className} transform={`translate(${String(x)} ${String(y)})`}>
      <path
        d="M0 0h56v64l-7-5-7 5-7-5-7 5-7-5-7 5-7-5-7 5z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="9" y="11" width="26" height="5" rx="2.5" fill={INK} />
      <rect x="9" y="23" width="38" height="4" rx="2" fill="var(--illustration-iris)" />
      <rect x="9" y="33" width="30" height="4" rx="2" fill="var(--illustration-mint)" />
      <rect x="9" y="43" width="20" height="4" rx="2" fill="var(--illustration-coral)" />
    </g>
  );
}

/** A listing tile: the product photo square and its title line. */
function Listing({ x, y, className }: { x: number; y: number; className?: string }) {
  return (
    <g className={className} transform={`translate(${String(x)} ${String(y)})`}>
      <rect width="60" height="70" rx="10" fill={PAPER} stroke={INK} strokeWidth="2" />
      <rect x="7" y="7" width="46" height="38" rx="6" fill="var(--illustration-rose)" />
      <circle
        cx="22"
        cy="22"
        r="7"
        fill="var(--illustration-saffron)"
        stroke={INK}
        strokeWidth="2"
      />
      <path d="M7 45l16-14 12 9 18-15v20H7z" fill="var(--illustration-coral)" />
      <rect x="7" y="52" width="34" height="4" rx="2" fill={INK} />
      <rect x="7" y="60" width="22" height="4" rx="2" fill="var(--illustration-sky)" />
    </g>
  );
}

/** The empty-state illustration: a receipt and a listing handed through the rings. */
export function EmptyArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 120"
      width="240"
      height="120"
      className={cx("block max-w-full", className)}
    >
      <path
        d="M40 96c40 0 40-36 80-36s40 36 80 36"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeDasharray="4 6"
      />
      <Receipt x={14} y={26} className="animate-art-in" />
      <Rings x={98} y={60} r={16} className="animate-art-in [animation-delay:80ms]" />
      <Listing x={168} y={22} className="animate-art-in [animation-delay:160ms]" />
    </svg>
  );
}
