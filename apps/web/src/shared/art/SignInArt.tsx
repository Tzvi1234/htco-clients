import { cx } from "../lib/cx.ts";

const INK = "var(--illustration-ink)";
const PAPER = "var(--illustration-paper)";

/*
 * The sign-in art: HTCO's relay in one picture. An order (the receipt) and a listing travel
 * along dashed traces into the handoff rings, where AI employees (the small flagged pointers)
 * work on them, and arrive at the owner's decision, circled by the saffron ring. Textless, so it
 * reads the same in Hebrew and English; it mirrors in right-to-left layouts and plays once.
 */
export function SignInArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 520 440"
      className={cx("block h-auto w-full rtl:-scale-x-100", className)}
    >
      <defs>
        <pattern id="relay-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="520" height="440" fill="url(#relay-grid)" />

      {/* Traces from the work into the rings, and from the rings to the decision. */}
      <g
        fill="none"
        stroke="var(--icon-muted)"
        strokeWidth="2"
        strokeDasharray="5 7"
        strokeLinecap="round"
      >
        <path d="M126 112c50 0 60 92 118 96" />
        <path d="M126 320c56 0 64-92 118-100" />
        <path d="M352 214c40 0 44-6 70-6" />
      </g>

      {/* The receipt: an order arriving. */}
      <g className="animate-art-in">
        <path
          d="M40 60h86v100l-10.75-8-10.75 8-10.75-8-10.75 8-10.75-8-10.75 8-10.75-8-10.75 8z"
          fill={PAPER}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect x="54" y="76" width="40" height="8" rx="4" fill={INK} />
        <rect x="54" y="94" width="58" height="6" rx="3" fill="var(--illustration-iris)" />
        <rect x="54" y="108" width="44" height="6" rx="3" fill="var(--illustration-mint)" />
        <rect x="54" y="122" width="30" height="6" rx="3" fill="var(--illustration-coral)" />
        <Pointer x={118} y={40} fill="var(--illustration-mint)" />
      </g>

      {/* The listing: a product on its tile. */}
      <g className="animate-art-in [animation-delay:90ms]">
        <rect
          x="36"
          y="262"
          width="92"
          height="108"
          rx="14"
          fill={PAPER}
          stroke={INK}
          strokeWidth="2.5"
        />
        <rect x="47" y="273" width="70" height="58" rx="9" fill="var(--illustration-rose)" />
        <circle
          cx="68"
          cy="296"
          r="10"
          fill="var(--illustration-saffron)"
          stroke={INK}
          strokeWidth="2.5"
        />
        <path d="M47 331l24-22 18 13 28-22v31z" fill="var(--illustration-coral)" />
        <rect x="47" y="342" width="52" height="6" rx="3" fill={INK} />
        <rect x="47" y="354" width="32" height="6" rx="3" fill="var(--illustration-sky)" />
      </g>

      {/* The handoff rings: the logo's interlocked C and O. */}
      <g className="animate-art-in [animation-delay:180ms]">
        <circle cx="262" cy="214" r="50" fill="none" stroke={INK} strokeWidth="30" />
        <circle
          cx="262"
          cy="214"
          r="50"
          fill="none"
          stroke="var(--illustration-iris)"
          strokeWidth="24"
        />
        <circle cx="326" cy="214" r="50" fill="none" stroke={INK} strokeWidth="30" />
        <circle
          cx="326"
          cy="214"
          r="50"
          fill="none"
          stroke="var(--illustration-sky)"
          strokeWidth="24"
        />
        {/* The interlock: the first ring passes over the second at the top crossing. Its ink
            outline is redrawn only across the crossing, then its colour over a longer arc, so
            the band stays seamless. */}
        <path d="M262 164A50 50 0 0 1 308.98 196.9" fill="none" stroke={INK} strokeWidth="30" />
        <path
          d="M253.32 164.76A50 50 0 0 1 311.24 205.32"
          fill="none"
          stroke="var(--illustration-iris)"
          strokeWidth="24"
        />
        <circle
          cx="378"
          cy="250"
          r="15"
          fill="var(--illustration-saffron)"
          stroke={INK}
          strokeWidth="2.5"
          className="animate-dot-drop [animation-delay:620ms] [transform-box:fill-box] origin-center"
        />
      </g>

      {/* The decision: a card with its approve control, circled by the saffron ring. */}
      <g className="animate-art-in [animation-delay:270ms]">
        <rect
          x="402"
          y="150"
          width="92"
          height="118"
          rx="14"
          fill={PAPER}
          stroke={INK}
          strokeWidth="2.5"
        />
        <rect x="415" y="166" width="48" height="7" rx="3.5" fill={INK} />
        <rect x="415" y="182" width="64" height="6" rx="3" fill="var(--border-strong)" />
        <rect x="415" y="195" width="52" height="6" rx="3" fill="var(--border-strong)" />
        <rect
          x="415"
          y="226"
          width="66"
          height="26"
          rx="8"
          fill="var(--illustration-iris)"
          stroke={INK}
          strokeWidth="2.5"
        />
        <path
          d="M437 239l6 6 12-12"
          fill="none"
          stroke={PAPER}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M402 242c-2-16 26-24 54-23 28 1 46 8 44 22-2 15-28 21-52 20-26-1-46-8-44-21 1-6 7-11 16-14"
          pathLength={1}
          fill="none"
          stroke="var(--illustration-saffron)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1"
          className="animate-ring-draw [animation-delay:620ms]"
        />
      </g>
    </svg>
  );
}

/** An AI employee at work: a pointer with a coloured flag (never a face). */
function Pointer({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g transform={`translate(${String(x)} ${String(y)})`}>
      <path
        d="M0 0l16 6-7 3-3 7z"
        fill={fill}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="14" y="12" width="34" height="14" rx="7" fill={fill} stroke={INK} strokeWidth="2" />
    </g>
  );
}
