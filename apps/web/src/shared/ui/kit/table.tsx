import type { KeyboardEvent, ReactNode } from "react";

import { cx } from "../../lib/cx.ts";

export interface TableRow {
  key: string;
  cells: readonly ReactNode[];
  selected?: boolean;
  /** Choosing the row (click, Enter or Space) when the table offers it. */
  onSelect?: () => void;
  className?: string;
}

/**
 * The demo's table (`.tw table`): a scrolling body with a sticky quiet head, 48 px rows with a
 * hairline under each, the hover fill, and the chosen rows raised with round ends. `ends` are
 * columns aligned to the end (numbers, money); phones leave out `phoneHidden` columns (fewer
 * things, not smaller ones) and only wide screens (from 1600 px) show `wideOnly` ones. Rows
 * rise in one after another.
 */
export function DataTable({
  label,
  head,
  rows,
  ends = [],
  phoneHidden = [],
  wideOnly = [],
  className,
}: {
  /** The table's name, for screen readers. */
  label: string;
  head: readonly ReactNode[];
  rows: readonly TableRow[];
  ends?: readonly number[];
  phoneHidden?: readonly number[];
  wideOnly?: readonly number[];
  className?: string;
}) {
  const keyed = (row: TableRow) => (event: KeyboardEvent) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      row.onSelect?.();
    }
  };
  const column = (index: number) =>
    cx(
      ends.includes(index) ? "text-end" : "text-start",
      phoneHidden.includes(index) && "max-sm:hidden",
      wideOnly.includes(index) && "max-xl:hidden",
    );
  return (
    <div className={cx("min-h-0 flex-1 overflow-auto px-3 pb-3 [scrollbar-width:thin]", className)}>
      <table aria-label={label} className="w-full border-separate border-spacing-0 text-body-sm">
        <thead>
          <tr>
            {head.map((cell, index) => (
              <th
                key={index}
                scope="col"
                className={cx(
                  "sticky top-0 z-[1] h-9 border-b border-line bg-table-head px-3 text-caption font-light whitespace-nowrap text-muted max-xl:px-[9px]",
                  column(index),
                )}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.key}
              data-selected={row.selected === true ? true : undefined}
              tabIndex={row.onSelect === undefined ? undefined : 0}
              onClick={row.onSelect}
              onKeyDown={row.onSelect === undefined ? undefined : keyed(row)}
              style={{ animationDelay: `${String(Math.min(rowIndex, 12) * 24)}ms` }}
              className={cx(
                "group/row outline-none motion-safe:animate-[htco-row-in_280ms_var(--motion-easing-enter)_both]",
                row.onSelect !== undefined && "cursor-pointer",
                "focus-visible:[&>td]:bg-hover",
                row.className,
              )}
            >
              {row.cells.map((cell, index) => (
                <td
                  key={index}
                  className={cx(
                    "h-12 border-b border-line px-3 whitespace-nowrap transition-colors duration-[var(--motion-duration-fast)] max-xl:px-[9px]",
                    "group-hover/row:bg-hover",
                    column(index),
                    ends.includes(index) && "tabular",
                    row.selected === true &&
                      "border-b-transparent bg-selected group-hover/row:bg-selected first:rounded-s-[12px] last:rounded-e-[12px]",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
