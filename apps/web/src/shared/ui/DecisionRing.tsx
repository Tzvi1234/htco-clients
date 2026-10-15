import type { ReactNode } from "react";

/**
 * The decision ring: a loose saffron marker loop around what waits for the owner's decision.
 * It is the only hand-drawn mark in the product and never decorates; the wrapped content always
 * says in words that it needs the user (design/README.md, "The decision ring").
 */
export function DecisionRing({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-flex">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 48"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -inset-x-2.5 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1.25rem)] overflow-visible"
      >
        <path
          d="M8 26C6 12 34 4 64 5c30 1 52 7 50 20-2 14-30 19-58 18C28 42 5 37 8 24c1-6 9-11 18-13"
          pathLength={1}
          fill="none"
          stroke="var(--attention-ring)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeDasharray="1"
          vectorEffect="non-scaling-stroke"
          className="animate-ring-draw"
        />
      </svg>
    </span>
  );
}
