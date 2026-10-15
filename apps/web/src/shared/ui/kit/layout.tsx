import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../../lib/cx.ts";

/**
 * The demo's screen grids (its `.main` variants): 300 px side columns beside the sidebar, the
 * 184 px strip row, 8 px gaps. From 1200 px the screen fills the height and each panel scrolls
 * on its own; from 900 px the panels sit two to a row and the screen scrolls; phones stack them
 * in the page, each as tall as its content.
 */
const LAYOUTS = {
  l3: "lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)]",
  l3s: "lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)_184px]",
  l2: "lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]",
  l2r: "lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)]",
  l2s: "lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)_184px]",
  l2rs: "lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)_184px]",
  lc2s: "lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)_184px]",
  lc3: "lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)]",
  lc3s: "lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)_184px]",
  /** One panel filling the screen (the floor's map). */
  l1: "lg:grid-cols-[minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]",
} as const;

export type ScreenLayout = keyof typeof LAYOUTS;

/** Panels enter one after another, 40 ms apart; nothing moves under reduced motion. */
const STAGGER =
  "[&>*]:motion-safe:animate-enter [&>*:nth-child(2)]:[animation-delay:40ms] [&>*:nth-child(3)]:[animation-delay:80ms] [&>*:nth-child(4)]:[animation-delay:120ms] [&>*:nth-child(5)]:[animation-delay:160ms]";

export function Screen({
  layout,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  layout: ScreenLayout;
  children: ReactNode;
  /** `data-demo-view` marks a screen whose controls only change the view (kit/demo.tsx). */
  "data-demo-view"?: string;
}) {
  return (
    <div
      {...props}
      data-layout={layout}
      className={cx(
        "grid min-h-0 grow auto-rows-auto grid-cols-1 gap-2 md:grid-cols-2",
        "max-lg:content-start max-lg:overflow-auto max-sm:flex max-sm:flex-col max-sm:overflow-visible",
        STAGGER,
        LAYOUTS[layout],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** `.stack`: two panels sharing one grid cell, one above the other, half and half. */
export function Stack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "grid min-h-0 min-w-0 gap-2 lg:grid-rows-2 max-sm:flex max-sm:flex-col",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A grid child that spans every column (the strip, a wide panel). */
export const SPAN_ALL = "col-span-full";

/** Hidden on phones, which show fewer things rather than smaller ones. */
export const PHONE_HIDE = "max-sm:hidden";
