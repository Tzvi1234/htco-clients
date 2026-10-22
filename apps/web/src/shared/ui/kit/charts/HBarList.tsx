import type { ReactNode } from "react";

import { cx } from "../../../lib/cx.ts";
import { scaleMax } from "./scale.ts";

export interface HBar {
  key: string;
  /** The row's name (a product, a country). */
  label: ReactNode;
  value: number;
  /** The value as it reads beside the bar ("12 · 40%"). */
  text: ReactNode;
}

/**
 * Horizontal bars for a ranking (top products, countries, reasons): each row's name and value
 * as text, the bar under them growing from the reading side's start. The `highlight` row (the
 * first, the largest, by default) is in the full tertiary orange, the others in its lighter
 * wash. It stays a list for screen readers: the words carry everything, the bars are art.
 */
export function HBarList({
  items,
  label,
  highlight = 0,
  max,
  ranked = false,
  className,
}: {
  items: readonly HBar[];
  /** The list's name for screen readers. */
  label: string;
  highlight?: number;
  /** The value of a full bar; the largest value without it (100 for shares). */
  max?: number;
  /** Numbers the rows 1, 2, 3 at their start. */
  ranked?: boolean;
  className?: string;
}) {
  const top = max ?? scaleMax(items.map((item) => item.value));
  const Tag = ranked ? "ol" : "ul";
  return (
    <Tag aria-label={label} className={cx("m-0 flex list-none flex-col gap-3 p-0", className)}>
      {items.map((item, i) => {
        const pct = top === 0 ? 0 : Math.min(100, (item.value / top) * 100);
        const on = i === highlight;
        return (
          <li
            key={item.key}
            data-row={i}
            data-highlight={on ? "" : undefined}
            className="flex gap-3"
          >
            {ranked ? (
              <span className="ltr tabular w-4 shrink-0 text-body-sm text-muted">{i + 1}</span>
            ) : null}
            <span className="flex min-w-0 grow flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-3 text-body-sm">
                <span dir="auto" className="min-w-0 truncate text-start">
                  {item.label}
                </span>
                <span className="shrink-0 text-caption text-secondary">{item.text}</span>
              </span>
              <span aria-hidden="true" className="block h-1.5 w-full rounded-pill bg-hover">
                <span
                  data-fill
                  className={cx(
                    "block h-full rounded-pill motion-safe:animate-[htco-hbar-in_560ms_var(--motion-easing-enter)_both]",
                    on ? "bg-tertiary" : "k-bar-soft",
                  )}
                  style={{
                    width: `${String(pct === 0 ? 0 : Math.max(2, pct))}%`,
                    animationDelay: `${String(i * 50)}ms`,
                  }}
                />
              </span>
            </span>
          </li>
        );
      })}
    </Tag>
  );
}

/**
 * A plain progress bar ("2 of 3 done", "$12.40 of $50.00"): a hairline track, the done part in
 * ink, or in the tertiary orange when `tone="tertiary"`. Named by `label` for screen readers.
 */
export function ProgressBar({
  value,
  max,
  label,
  tone = "ink",
  className,
}: {
  value: number;
  max: number;
  label?: string;
  tone?: "ink" | "tertiary";
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <span
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      className={cx("block h-1.5 w-full rounded-pill bg-hover", className)}
    >
      <span
        data-fill
        className={cx(
          "block h-full rounded-pill motion-safe:animate-[htco-hbar-in_560ms_var(--motion-easing-enter)_both]",
          tone === "tertiary" ? "bg-tertiary" : "bg-inverse",
        )}
        style={{ width: `${String(pct)}%` }}
      />
    </span>
  );
}
