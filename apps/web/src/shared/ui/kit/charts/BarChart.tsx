import { useState } from "react";

import { cx } from "../../../lib/cx.ts";
import { chartSummary, scaleMax, tipAt } from "./scale.ts";

/**
 * Column bars for counts over time (orders per day or month). The bars share the tertiary
 * orange: the `highlight` one (the current or best period) in the full fill, the others in a
 * lighter wash of it. Every bar carries its value as text above it, so the colour is never the
 * only way to read it; hovering or tapping a bar shows its full label and value.
 *
 * Time reads in the language's direction: the values come oldest first and the columns follow
 * the document's `dir`, so in Hebrew the newest period sits at the left and in English at the
 * right. The chart is one image for screen readers, named by `label` with every value.
 */
export function BarChart({
  values,
  labels,
  tips,
  highlight = -1,
  label,
  format = String,
  valueLabels = "all",
  height = 112,
  className,
}: {
  /** The counts, oldest first. */
  values: readonly number[];
  /** The axis label under each bar (a day number, a short month); "" leaves one out. */
  labels: readonly string[];
  /** The full name of each bar for its tip and the spoken summary ("March 2026"); `labels` without it. */
  tips?: readonly string[];
  /** The bar to mark in full orange: the current or the best period. */
  highlight?: number;
  /** What the chart shows ("Orders per day, last 7 days"); the values are added to it. */
  label: string;
  /** How a value reads ("12", "$1,240"). */
  format?: (value: number) => string;
  /** Which values show above the bars: all of them, or the highlighted and the highest only. */
  valueLabels?: "all" | "key";
  /** The plot's height in px. */
  height?: number;
  className?: string;
}) {
  const [active, setActive] = useState(-1);
  const max = scaleMax(values);
  const names = tips ?? labels;
  const top = values.reduce((best, v, i) => (v > (values[best] ?? 0) ? i : best), 0);
  return (
    <div
      role="img"
      aria-label={chartSummary(label, names, values, format)}
      className={cx("k-chart @container flex w-full min-w-0 flex-col", className)}
    >
      <div className="relative pt-5" style={{ height }}>
        <ChartGrid />
        <ol className="relative m-0 flex h-full list-none items-end gap-[clamp(3px,1.4%,10px)] p-0">
          {values.map((value, i) => {
            const on = i === highlight;
            const shown = valueLabels === "all" || on || i === top;
            const pct = max === 0 ? 0 : (value / max) * 100;
            return (
              <li
                key={i}
                tabIndex={-1}
                data-bar={i}
                data-highlight={on ? "" : undefined}
                onFocus={() => {
                  setActive(i);
                }}
                onBlur={() => {
                  setActive(-1);
                }}
                className="group relative flex h-full min-w-0 flex-1 cursor-default flex-col items-center justify-end outline-none"
              >
                <span
                  className="relative flex w-full max-w-7 flex-col items-center justify-end"
                  style={{ height: `${String(pct)}%` }}
                >
                  {shown ? (
                    <span
                      data-value
                      className={cx(
                        "ltr tabular absolute bottom-full mb-1 text-caption leading-none whitespace-nowrap",
                        on ? "font-medium text-primary" : "text-muted",
                      )}
                    >
                      {format(value)}
                    </span>
                  ) : null}
                  <span
                    className={cx(
                      "k-bar block w-full rounded-t-tag motion-safe:animate-[htco-bar-in_520ms_var(--motion-easing-enter)_both]",
                      value === 0 ? "h-0.5 rounded-[1px] bg-line-strong" : "h-full",
                      value !== 0 && (on ? "bg-tertiary" : "k-bar-soft"),
                    )}
                    style={{ animationDelay: `${String(i * 28)}ms` }}
                  />
                  <ChartTip
                    open={active === i}
                    at={tipAt(i, values.length)}
                    name={names[i] ?? ""}
                    value={format(value)}
                    className="mb-5"
                  />
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <ChartAxis labels={labels} highlight={highlight} />
    </div>
  );
}

/** Three hairlines behind a plot: its top, middle and baseline, the baseline a little stronger. */
export function ChartGrid() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-5 bottom-0">
      <span className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
      <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-line" />
      <span className="absolute inset-x-0 bottom-0 border-t border-line-strong" />
    </span>
  );
}

/**
 * The labels under the columns, one per column in the same direction. Under a chart narrower
 * than 28rem with more than eight columns, every other label steps aside so none is cut.
 */
export function ChartAxis({
  labels,
  highlight = -1,
  gap = true,
}: {
  labels: readonly string[];
  highlight?: number;
  /** Whether the columns above keep a gap between them (bars do, a line's points do not). */
  gap?: boolean;
}) {
  return (
    <ol
      aria-hidden="true"
      className={cx(
        "m-0 mt-1.5 flex list-none p-0 text-center text-caption leading-tight",
        gap && "gap-[clamp(3px,1.4%,10px)]",
      )}
    >
      {labels.map((text, i) => (
        <li
          key={i}
          data-axis={i}
          className={cx(
            "min-w-0 flex-1 overflow-hidden whitespace-nowrap",
            i === highlight ? "font-medium text-primary" : "text-muted",
            // A narrow chart with many columns names every other one, counted from the newest.
            labels.length > 8 && (labels.length - 1 - i) % 2 === 1 && "@max-md:invisible",
          )}
        >
          {text}
        </li>
      ))}
    </ol>
  );
}

/** The tip above a hovered or tapped column: its name and value. */
export function ChartTip({
  open,
  at,
  name,
  value,
  className,
}: {
  open: boolean;
  at: "start" | "middle" | "end";
  name: string;
  value: string;
  className?: string;
}) {
  return (
    <span
      data-tip
      className={cx(
        "pointer-events-none absolute bottom-full z-raised flex flex-col items-center rounded-[8px] bg-inverse px-2.5 py-1.5 text-center text-caption whitespace-nowrap text-on-inverse shadow-sm",
        "opacity-0 transition-opacity duration-[var(--motion-duration-fast)] group-hover:opacity-100",
        at === "start"
          ? "inset-s-0"
          : at === "end"
            ? "inset-e-0"
            : "inset-s-1/2 -translate-x-1/2 rtl:translate-x-1/2",
        open && "opacity-100",
        className,
      )}
    >
      <span>{name}</span>
      <span className="ltr tabular font-medium">{value}</span>
    </span>
  );
}
