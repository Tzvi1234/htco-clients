import type { ReactNode } from "react";

import { cx } from "../../lib/cx.ts";

export interface Column<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Numbers and amounts align to the end (`td.e`). */
  end?: boolean;
  /** False: left out on phones, which show fewer columns. */
  phone?: boolean;
  /** "wide": only on wide screens (from 1600 px), like the demo's shop column. */
  only?: "wide";
  className?: string;
}

/**
 * The demo's table (`.tw table`): a scrolling body with a sticky light header, 48 px rows with
 * hairlines, a hover fill, and the selected rows raised with round ends.
 */
export function DataTable<Row>({
  label,
  columns,
  rows,
  rowKey,
  selected,
  className,
}: {
  /** The table's name, for screen readers. */
  label: string;
  columns: readonly Column<Row>[];
  rows: readonly Row[];
  rowKey: (row: Row) => string;
  selected?: (row: Row) => boolean;
  className?: string;
}) {
  return (
    <div className={cx("min-h-0 grow overflow-auto px-3 pb-3 [scrollbar-width:thin]", className)}>
      <table aria-label={label} className="w-full border-separate border-spacing-0 text-body-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cx(
                  "sticky top-0 z-1 h-9 border-b border-line bg-table-head px-3 max-xl:px-[9px] text-start text-caption font-light whitespace-nowrap text-muted",
                  column.end && "text-end",
                  column.phone === false && "max-sm:hidden",
                  column.only === "wide" && "max-xl:hidden",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const on = selected?.(row) ?? false;
            return (
              <tr
                key={rowKey(row)}
                aria-selected={selected === undefined ? undefined : on}
                className="group"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cx(
                      "h-12 border-b px-3 whitespace-nowrap max-xl:px-[9px] transition-colors duration-[var(--motion-duration-fast)]",
                      "group-hover:bg-hover",
                      on
                        ? "border-transparent bg-selected group-hover:bg-selected first:rounded-s-[12px] last:rounded-e-[12px]"
                        : "border-line",
                      column.end && "tabular text-end",
                      column.phone === false && "max-sm:hidden",
                      column.only === "wide" && "max-xl:hidden",
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
