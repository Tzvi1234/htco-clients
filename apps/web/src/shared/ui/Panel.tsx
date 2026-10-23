import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

/**
 * A Design 1C panel: the floating surface every screen is built from (radius 22, the panel
 * fill, its edge, glass when tweak 2 is on). Screens lay panels out in a grid with 8 px gaps.
 */
export function Panel({
  as: Element = "section",
  label,
  labelledBy,
  className,
  children,
}: {
  as?: "section" | "div" | "article" | "aside";
  /** The panel's accessible name, when it has no PanelHeader. */
  label?: string;
  /** The id of the element that names the panel (its heading or identifier). */
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Element
      aria-label={label}
      aria-labelledby={labelledBy}
      className={cx(
        "glass relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-panel border border-edge bg-panel shadow-panel",
        className,
      )}
    >
      {children}
    </Element>
  );
}

/** A panel's 56 px header: a small title, a quiet meta line beside it, actions at the end. */
export function PanelHeader({
  title,
  meta,
  actions,
  level = 2,
}: {
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    // A div, not a header: a header outside a sectioning element would be a second banner.
    <div className="flex h-14 shrink-0 items-center justify-between gap-3 ps-6 pe-2">
      <div className="flex min-w-0 items-baseline gap-2.5">
        <Heading className="m-0 truncate text-body-sm font-normal">{title}</Heading>
        {meta === undefined ? null : (
          <span className="truncate text-caption font-light text-muted">{meta}</span>
        )}
      </div>
      {actions === undefined ? null : <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}

/**
 * A panel's body: 24 px gutters. In a panel that fills the window (the demo screens) it
 * scrolls on its own when the content is taller; on a screen that scrolls as one page it must
 * not (`scroll={false}`; round 3, no panel scrolls on its own).
 */
export function PanelBody({
  className,
  scroll = true,
  children,
}: {
  className?: string;
  scroll?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cx("flex min-h-0 grow flex-col px-6 pb-6", scroll && "overflow-auto", className)}
    >
      {children}
    </div>
  );
}
