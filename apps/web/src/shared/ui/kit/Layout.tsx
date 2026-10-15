import type { ReactNode } from "react";

import { cx } from "../../lib/cx.ts";

/**
 * The demo's screen grids (`.l3`, `.l2`, `.l2rs`, `.lc2s`, `.lc3s`): 300 px side columns beside
 * the sidebar, an optional 184 px strip row, 8 px gaps. From 1200 px the panels fill the height
 * like the demo; narrower screens stack them in a scrolling column, phones in the page.
 */
const GRIDS = {
  l3: "lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)]",
  l2: "lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]",
  l2r: "lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)]",
  l2rs: "lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)_184px]",
  lc2s: "lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)_184px]",
  lc3s: "lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)_184px]",
} as const;

export type ScreenLayout = keyof typeof GRIDS;

/** Panels enter one after another (60 ms apart); nothing moves under reduced motion. */
const STAGGER =
  "[&>*]:motion-safe:animate-enter [&>*:nth-child(2)]:[animation-delay:60ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:180ms] [&>*:nth-child(5)]:[animation-delay:240ms]";

export function Screen({
  layout,
  children,
  className,
}: {
  layout: ScreenLayout;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex min-h-0 grow flex-col gap-2 sm:max-lg:overflow-auto lg:grid",
        GRIDS[layout],
        STAGGER,
        className,
      )}
    >
      {children}
    </div>
  );
}

/** `.stack`: two panels sharing one column, half and half. */
export function Stack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("flex min-h-0 flex-col gap-2 lg:grid lg:grid-rows-2", className)}>
      {children}
    </div>
  );
}
