import { useState } from "react";

import { cx } from "../../../lib/cx.ts";
import { ChartAxis, ChartGrid, ChartTip } from "./BarChart.tsx";
import { chartSummary, scaleMax, tipAt } from "./scale.ts";

/**
 * A line over a soft area for an amount over time (revenue per month). The line and its points
 * are in the tertiary orange's text tone (AA as a graphic on every ground); the `highlight`
 * point (the current or best period) is a full orange dot with its value beside it, and the
 * highest point carries its value too. Hovering or tapping a column shows its name and value.
 *
 * Time reads in the language's direction like `BarChart`: values oldest first, the newest at
 * the left in Hebrew. The drawing mirrors with the document; the points and labels follow the
 * columns. One image for screen readers, named by `label` with every value.
 */
export function LineChart({
  values,
  labels,
  tips,
  highlight = -1,
  label,
  format = String,
  height = 132,
  className,
}: {
  /** The amounts, oldest first. */
  values: readonly number[];
  /** The axis label under each point; "" leaves one out. */
  labels: readonly string[];
  /** The full name of each point for its tip and the spoken summary. */
  tips?: readonly string[];
  highlight?: number;
  /** What the chart shows; the values are added to it. */
  label: string;
  format?: (value: number) => string;
  height?: number;
  className?: string;
}) {
  const [active, setActive] = useState(-1);
  const max = scaleMax(values);
  const names = tips ?? labels;
  const n = values.length;
  const top = values.reduce((best, v, i) => (v > (values[best] ?? 0) ? i : best), 0);
  const y = (v: number) => (max === 0 ? 100 : 100 - (v / max) * 100);
  const x = (i: number) => ((i + 0.5) / Math.max(1, n)) * 100;
  const line = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)} ${y(v).toFixed(2)}`)
    .join(" ");
  const area = n === 0 ? "" : `${line} L${x(n - 1).toFixed(2)} 100 L${x(0).toFixed(2)} 100 Z`;
  return (
    <div
      role="img"
      aria-label={chartSummary(label, names, values, format)}
      className={cx("k-chart @container flex w-full min-w-0 flex-col", className)}
    >
      <div className="relative pt-5" style={{ height }}>
        <ChartGrid />
        <div className="relative h-full">
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible rtl:-scale-x-100"
          >
            <path d={area} className="k-area" />
            <path
              d={line}
              fill="none"
              stroke="var(--tertiary-text)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <ol className="absolute inset-0 m-0 flex list-none p-0">
            {values.map((value, i) => {
              const on = i === highlight;
              const pct = max === 0 ? 0 : (value / max) * 100;
              return (
                <li
                  key={i}
                  tabIndex={-1}
                  data-point={i}
                  data-highlight={on ? "" : undefined}
                  onFocus={() => {
                    setActive(i);
                  }}
                  onBlur={() => {
                    setActive(-1);
                  }}
                  className="group relative h-full min-w-0 flex-1 cursor-default outline-none"
                >
                  <span
                    className="absolute inset-x-0 bottom-0 flex flex-col items-center"
                    style={{ height: `${String(pct)}%` }}
                  >
                    <span
                      className={cx(
                        "absolute top-0 -translate-y-1/2 rounded-pill ring-2 ring-[var(--bg-panel)]",
                        on
                          ? "size-2.5 bg-tertiary"
                          : "size-2 bg-[var(--tertiary-text)] opacity-0 group-hover:opacity-100",
                        active === i && "opacity-100",
                      )}
                    />
                    {on || i === top ? (
                      <span
                        data-value
                        className={cx(
                          "ltr tabular absolute bottom-full mb-2 text-caption leading-none whitespace-nowrap",
                          on ? "font-medium text-primary" : "text-muted",
                          tipAt(i, n) === "start"
                            ? "inset-s-0"
                            : tipAt(i, n) === "end"
                              ? "inset-e-0"
                              : "",
                        )}
                      >
                        {format(value)}
                      </span>
                    ) : null}
                    <ChartTip
                      open={active === i}
                      at={tipAt(i, n)}
                      name={names[i] ?? ""}
                      value={format(value)}
                      className="mb-3"
                    />
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <ChartAxis labels={labels} highlight={highlight} gap={false} />
    </div>
  );
}
