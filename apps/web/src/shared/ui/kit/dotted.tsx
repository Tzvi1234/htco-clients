import type { ReactNode } from "react";

import { TrendGlyph } from "./glyphs.tsx";
import { cx } from "../../lib/cx.ts";

// The demo's dotted art, kept for the Demo screens only: the matrix (`matrix()`) and the dotted
// strip (`.dbar`, an uptime bar's days). Real data uses the charts in `./charts/` (bars, a line,
// horizontal bars). The dots are decorative; the words beside them carry the meaning. They grow
// in as they appear (not under reduced motion, see kit.css).

const GROW = "motion-safe:animate-[htco-dot-in_420ms_var(--motion-easing-enter)_both]";

/**
 * The matrix: a dot field with two axes, a block of accent dots growing from the centre into
 * the quadrant on the reading side's start, an ink marker, the four axis words and the value
 * pill ("92% – Within policy"). In right-to-left the field mirrors with its words.
 */
export function Matrix({
  width = 208,
  height = 160,
  k = 5,
  value,
  caption,
  top,
  start,
  end,
  bottom,
  label,
  marker = true,
}: {
  width?: number;
  height?: number;
  /** How many rings of the quadrant glow. */
  k?: number;
  value: string;
  caption: ReactNode;
  top: ReactNode;
  start: ReactNode;
  end: ReactNode;
  bottom: ReactNode;
  /** The chart in words, for screen readers; without it the words around it are read. */
  label?: string;
  marker?: boolean;
}) {
  const p = 8;
  const cols = Math.floor(width / p);
  const rows = Math.floor(height / p);
  const cx0 = Math.floor(cols / 2);
  const cy0 = Math.floor(rows / 2);
  const dots: ReactNode[] = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const x = i * p + 4;
      const y = j * p + 4;
      const key = `${String(i)}-${String(j)}`;
      if (j === cy0) {
        dots.push(
          <circle key={key} cx={x} cy={y} r={i === cx0 ? 1.6 : 0.9} fill="var(--text-primary)" />,
        );
        continue;
      }
      if (i === cx0 && j > cy0) {
        dots.push(<circle key={key} cx={x} cy={y} r={0.9} fill="var(--text-primary)" />);
        continue;
      }
      const di = cx0 - 1 - i;
      const dj = cy0 - 1 - j;
      if (di >= 0 && dj >= 0 && di < k && dj < k) {
        const d = Math.max(di, dj);
        dots.push(
          <circle
            key={key}
            cx={x}
            cy={y}
            r={(3.3 - d * 0.42).toFixed(2)}
            fill="var(--accent-mark)"
            opacity={(1 - d * 0.13).toFixed(2)}
            className={cx("origin-center [transform-box:fill-box]", GROW)}
            style={{ animationDelay: `${String(120 + d * 70)}ms` }}
          />,
        );
        continue;
      }
      const far = Math.hypot(i - cx0, j - cy0) / Math.hypot(cx0, cy0);
      dots.push(
        <circle
          key={key}
          cx={x}
          cy={y}
          r={0.8}
          fill="var(--border-hover)"
          opacity={(0.75 - far * 0.45).toFixed(2)}
        />,
      );
    }
  if (marker)
    dots.push(
      <circle
        key="marker"
        cx={(cx0 - k - 1) * p + 4}
        cy={(cy0 - k + 2) * p + 4}
        r={5}
        fill="var(--text-primary)"
      />,
    );
  const words = label === undefined ? undefined : true;
  return (
    <div
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      className="relative grid grid-cols-[auto_auto_auto] grid-rows-[auto_auto_auto] items-center justify-center gap-x-2.5 gap-y-1.5 text-caption"
    >
      <div aria-hidden={words} className="col-start-2 text-center">
        {top}
      </div>
      <div
        aria-hidden={words}
        className="col-start-1 row-start-2 max-w-[72px] text-center break-words"
      >
        {start}
      </div>
      <svg
        aria-hidden="true"
        className="col-start-2 row-start-2 rtl:-scale-x-100"
        width={cols * p}
        height={rows * p}
        viewBox={`0 0 ${String(cols * p)} ${String(rows * p)}`}
      >
        {dots}
      </svg>
      <div
        aria-hidden={words}
        className="col-start-3 row-start-2 max-w-[72px] text-center break-words"
      >
        {end}
      </div>
      <div aria-hidden={words} className="col-start-2 row-start-3 text-center">
        {bottom}
      </div>
      <div
        aria-hidden={words}
        className="absolute -inset-e-1.5 top-6 flex h-7 items-center gap-1.5 rounded-pill bg-[color-mix(in_srgb,var(--bg-raised)_88%,transparent)] px-3 whitespace-nowrap"
      >
        <TrendGlyph size={12} />
        <span className="ltr tabular">{value}</span>
        <span className="text-muted">%</span> – {caption}
      </div>
    </div>
  );
}

/**
 * Dotted progress: `filled` ink dots of `count`, the first `accent` ones in the accent, and
 * `marks` (an uptime bar's bad days) in the accent too. Dots fill in one after another.
 */
export function DotBar({
  count,
  filled,
  accent = 0,
  marks,
  label,
}: {
  count: number;
  filled: number;
  accent?: number;
  marks?: readonly number[];
  label?: string;
}) {
  return (
    <div
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      className="flex flex-wrap gap-[3px]"
    >
      {Array.from({ length: count }, (_, index) => {
        const marked = marks?.includes(index) ?? false;
        const tone =
          marked || index < accent
            ? "bg-accent-mark"
            : index < filled
              ? "bg-inverse"
              : "bg-line-strong";
        return (
          <i
            key={index}
            className={cx(
              "block size-1.5 rounded-pill motion-safe:animate-[htco-dot-in_280ms_both]",
              tone,
            )}
            style={{ animationDelay: `${String(index * 12)}ms` }}
          />
        );
      })}
    </div>
  );
}
