import type { ReactNode } from "react";

import { cx } from "../../lib/cx.ts";

/**
 * The demo's matrix chart (`matrix()`): a dot field with two axes, a block of accent dots
 * growing from the centre into one quadrant, an ink marker, and the value pill. The axis words
 * sit on the four sides. Decorative dots; the value and caption carry the meaning.
 */
export function MatrixChart({
  width = 168,
  height = 144,
  k = 5,
  value,
  caption,
  top,
  start,
  end,
  bottom,
}: {
  width?: number;
  height?: number;
  k?: number;
  value: string;
  caption: ReactNode;
  top: ReactNode;
  start: ReactNode;
  end: ReactNode;
  bottom: ReactNode;
}) {
  const p = 8;
  const cols = Math.floor(width / p);
  const rows = Math.floor(height / p);
  const cx0 = Math.floor(cols / 2);
  const cy0 = Math.floor(rows / 2);
  const dots: ReactNode[] = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * p + 4;
      const y = j * p + 4;
      const key = `${String(i)}-${String(j)}`;
      if (j === cy0) {
        dots.push(
          <circle key={key} cx={x} cy={y} r={i === cx0 ? 1.6 : 0.9} className="fill-primary" />,
        );
        continue;
      }
      if (i === cx0 && j > cy0) {
        dots.push(<circle key={key} cx={x} cy={y} r={0.9} className="fill-primary" />);
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
            r={3.3 - d * 0.42}
            opacity={1 - d * 0.13}
            className="fill-accent-mark animate-[htco-dot-in_420ms_var(--motion-easing-enter)_both]"
            style={{
              animationDelay: `${String(120 + d * 70)}ms`,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
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
          opacity={0.75 - far * 0.45}
          className="fill-line-hover"
        />,
      );
    }
  }
  const mx = (cx0 - k - 1) * p + 4;
  const my = (cy0 - k + 2) * p + 4;
  return (
    <div className="relative grid grid-cols-[auto_auto_auto] grid-rows-[auto_auto_auto] items-center justify-center gap-x-2.5 gap-y-1.5 text-caption">
      <div className="col-start-2 text-center">{top}</div>
      <div className="col-start-1 row-start-2 max-w-[64px] text-center break-words">{start}</div>
      <svg
        aria-hidden="true"
        className="col-start-2 row-start-2 rtl:-scale-x-100"
        width={cols * p}
        height={rows * p}
        viewBox={`0 0 ${String(cols * p)} ${String(rows * p)}`}
      >
        {dots}
        <circle cx={mx} cy={my} r={5} className="fill-primary" />
      </svg>
      <div className="col-start-3 row-start-2 max-w-[64px] text-center break-words">{end}</div>
      <div className="col-start-2 row-start-3 text-center">{bottom}</div>
      <div className="absolute -end-1.5 top-6 flex h-7 items-center gap-1.5 rounded-pill bg-raised px-3 text-caption whitespace-nowrap">
        <UpIcon />
        <span className="ltr">{value}</span>
        <span className="text-muted">%</span> – {caption}
      </div>
    </div>
  );
}

export function UpIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      width={size}
      height={size}
      fill="none"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 stroke-success"
    >
      <path d="M6 10V2M2.5 5.5L6 2l3.5 3.5" />
    </svg>
  );
}

/**
 * Dotted columns (`dotcols()`): one column of dots per value, the highlighted one in the accent,
 * with optional labels under them. Columns grow in from the base.
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
  /** What the chart says, for screen readers. */
  label: string;
}) {
  const max = Math.max(...values);
  const w = values.length * gap;
  const h = rows * pitch;
  return (
    <div
      role="img"
      aria-label={label}
      className="flex max-w-full flex-col items-center overflow-hidden"
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${String(w)} ${String(h)}`}
        direction="ltr"
        className="max-w-full"
      >
        {values.map((value, i) => {
          const n = Math.round((value / max) * rows);
          return Array.from({ length: rows }, (_, j) => {
            const y = h - j * pitch - pitch / 2;
            const x = i * gap + gap / 2;
            const key = `${String(i)}-${String(j)}`;
            if (j < n)
              return (
                <circle
                  key={key}
                  cx={x}
                  cy={y}
                  r={2.6}
                  opacity={i === highlight ? 1 : 0.25 + 0.6 * (j / rows)}
                  className={cx(
                    i === highlight ? "fill-accent-mark" : "fill-primary",
                    "animate-[htco-dot-in_320ms_both]",
                  )}
                  style={{
                    animationDelay: `${String(i * 30 + j * 14)}ms`,
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                />
              );
            return <circle key={key} cx={x} cy={y} r={0.8} className="fill-line-strong" />;
          });
        })}
      </svg>
      {labels === undefined ? null : (
        <div
          dir="ltr"
          className="mt-2 grid text-center text-[11px] text-muted"
          style={{ gridTemplateColumns: `repeat(${String(values.length)}, ${String(gap)}px)` }}
        >
          {labels.map((text, index) => (
            <span key={index}>{text}</span>
          ))}
        </div>
      )}
    </div>
  );
}
