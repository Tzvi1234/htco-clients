import type { ReactNode } from "react";

import { UpGlyph } from "./glyphs.tsx";

/**
 * The demo's dot matrix (`matrix()`): a field of dots with two axes, a glowing quadrant in the
 * accent and a marker, four axis words and a value pill ("92% – Within policy").
 */
export function Matrix({
  width = 208,
  height = 160,
  strength = 5,
  value,
  caption,
  top,
  left,
  right,
  bottom,
  label,
}: {
  width?: number;
  height?: number;
  /** How many rings of the quadrant glow. */
  strength?: number;
  value: string;
  caption: ReactNode;
  top: ReactNode;
  left: ReactNode;
  right: ReactNode;
  bottom: ReactNode;
  /** The chart in words, for screen readers. */
  label: string;
}) {
  const p = 8;
  const cols = Math.floor(width / p);
  const rows = Math.floor(height / p);
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  const dots: ReactNode[] = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const x = i * p + 4;
      const y = j * p + 4;
      const key = `${i}-${j}`;
      if (j === cy) {
        dots.push(
          <circle key={key} cx={x} cy={y} r={i === cx ? 1.6 : 0.9} fill="var(--text-primary)" />,
        );
        continue;
      }
      if (i === cx && j > cy) {
        dots.push(<circle key={key} cx={x} cy={y} r={0.9} fill="var(--text-primary)" />);
        continue;
      }
      const di = cx - 1 - i;
      const dj = cy - 1 - j;
      if (di >= 0 && dj >= 0 && di < strength && dj < strength) {
        const d = Math.max(di, dj);
        dots.push(
          <circle
            key={key}
            cx={x}
            cy={y}
            r={(3.3 - d * 0.42).toFixed(2)}
            fill="var(--accent-mark)"
            opacity={(1 - d * 0.13).toFixed(2)}
            style={{ animationDelay: `${d * 60}ms` }}
            className="motion-safe:animate-[htco-dot-rise_420ms_var(--motion-easing-enter)_both]"
          />,
        );
        continue;
      }
      const far = Math.hypot(i - cx, j - cy) / Math.hypot(cx, cy);
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
  const mx = (cx - strength - 1) * p + 4;
  const my = (cy - strength + 2) * p + 4;
  return (
    <div
      role="img"
      aria-label={label}
      className="relative grid grid-cols-[auto_auto_auto] grid-rows-[auto_auto_auto] items-center justify-center gap-x-2.5 gap-y-1.5 text-caption"
    >
      <div aria-hidden="true" className="col-start-2 text-center">
        {top}
      </div>
      <div aria-hidden="true" className="col-start-1 row-start-2">
        {left}
      </div>
      <svg
        aria-hidden="true"
        className="col-start-2 row-start-2"
        width={cols * p}
        height={rows * p}
        viewBox={`0 0 ${cols * p} ${rows * p}`}
      >
        {dots}
        <circle cx={mx} cy={my} r={5} fill="var(--text-primary)" />
      </svg>
      <div aria-hidden="true" className="col-start-3 row-start-2">
        {right}
      </div>
      <div aria-hidden="true" className="col-start-2 row-start-3 text-center">
        {bottom}
      </div>
      <div
        aria-hidden="true"
        className="absolute -end-1.5 top-6 flex h-7 items-center gap-1.5 rounded-pill bg-[color-mix(in_srgb,var(--bg-raised)_88%,transparent)] px-3 whitespace-nowrap"
      >
        <UpGlyph />
        <span className="ltr">{value}</span>
        <span className="text-muted">%</span> – {caption}
      </div>
    </div>
  );
}

/**
 * The demo's dot columns (`dotcols()`): one column of dots per value, filled to its height,
 * darker towards the top; the `highlight` column in the accent. Columns rise in one by one.
 */
export function DotColumns({
  values,
  rows = 12,
  highlight = -1,
  pitch = 10,
  gap = 14,
  labels,
  label,
}: {
  values: readonly number[];
  rows?: number;
  highlight?: number;
  pitch?: number;
  gap?: number;
  labels?: readonly string[];
  label: string;
}) {
  const max = Math.max(...values);
  const W = values.length * gap;
  const H = rows * pitch;
  return (
    <div role="img" aria-label={label} className="flex flex-col items-center">
      <svg
        aria-hidden="true"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ direction: "ltr" }}
      >
        {values.map((v, i) => {
          const n = Math.round((v / max) * rows);
          const x = i * gap + gap / 2;
          return (
            <g
              key={i}
              style={{ animationDelay: `${i * 50}ms` }}
              className="motion-safe:animate-[htco-dot-rise_480ms_var(--motion-easing-enter)_both]"
            >
              {Array.from({ length: rows }, (_, j) => {
                const y = H - j * pitch - pitch / 2;
                return j < n ? (
                  <circle
                    key={j}
                    cx={x}
                    cy={y}
                    r={2.6}
                    fill={i === highlight ? "var(--accent-mark)" : "var(--text-primary)"}
                    opacity={i === highlight ? 1 : (0.25 + 0.6 * (j / rows)).toFixed(2)}
                  />
                ) : (
                  <circle key={j} cx={x} cy={y} r={0.8} fill="var(--border-hover)" />
                );
              })}
            </g>
          );
        })}
      </svg>
      {labels === undefined ? null : (
        <div
          aria-hidden="true"
          dir="ltr"
          className="mt-2 grid text-center text-[11px] text-muted"
          style={{ gridTemplateColumns: `repeat(${values.length}, ${gap}px)` }}
        >
          {labels.map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      )}
    </div>
  );
}
