import type { ReactNode } from "react";

import { cx } from "../../lib/cx.ts";
import { MinusIcon, PlusIcon } from "./icons.tsx";
import { CircleButton } from "./Parts.tsx";

/**
 * The demo's screen grids, at the widths its sidebar layout uses (side columns 300 px, the strip
 * 184 px). From 1200 px the screen fills the height and each panel scrolls on its own; narrower,
 * the panels stack and the screen scrolls.
 */
const LAYOUTS = {
  l3: "lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)]",
  l3s: "lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)_184px]",
  l2: "lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]",
  l2r: "lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)]",
  l2s: "lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)_184px]",
  l2rs: "lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)_184px]",
  lc3: "lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)]",
  lc3s: "lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)_184px]",
} as const;

export type ScreenLayout = keyof typeof LAYOUTS;

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
        "grid min-h-0 grow auto-rows-auto grid-cols-1 gap-2 md:grid-cols-2 lg:overflow-visible",
        "max-lg:content-start max-lg:overflow-auto max-sm:overflow-visible",
        "[&>*]:animate-enter [&>*:nth-child(2)]:[animation-delay:40ms] [&>*:nth-child(3)]:[animation-delay:80ms] [&>*:nth-child(4)]:[animation-delay:120ms]",
        LAYOUTS[layout],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Two panels sharing one grid cell, one above the other (`.stack`). */
export function Stack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("grid min-h-0 gap-2 lg:grid-rows-2", className)}>{children}</div>;
}

/** The strip's zoom control (`zoom()`): two circle buttons around a track with a knob. */
export function ZoomControl({
  label,
  page,
  onPage,
}: {
  label: { less: string; more: string };
  page: 0 | 1;
  onPage?: (page: 0 | 1) => void;
}) {
  return (
    <div className="flex items-center gap-4 max-md:hidden">
      <CircleButton label={label.less} icon={<MinusIcon />} onPress={() => onPage?.(0)} />
      <div aria-hidden="true" className="relative h-px w-40 bg-line-strong">
        <span
          className="absolute top-1/2 -mt-[9px] -ms-[9px] flex size-[18px] items-center justify-center rounded-pill bg-line-strong transition-[inset-inline-start] duration-[var(--motion-duration-base)] after:size-2 after:rounded-pill after:bg-inverse after:content-['']"
          style={{ insetInlineStart: page === 1 ? "100%" : "0%" }}
        />
      </div>
      <CircleButton label={label.more} icon={<PlusIcon />} onPress={() => onPage?.(1)} />
    </div>
  );
}

/**
 * The strip along the bottom of a screen (`stripP()`): a title and meta, the zoom control in the
 * middle, actions at the end, and up to eight cards. Phones scroll the cards sideways.
 */
export function StripPanel({
  title,
  meta,
  zoom,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  zoom?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "glass relative col-span-full flex min-h-0 min-w-0 flex-col overflow-hidden rounded-panel border border-edge bg-panel shadow-panel",
        className,
      )}
    >
      <div className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center ps-6 pe-2">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h2 className="m-0 truncate text-body-sm font-normal">{title}</h2>
          {meta === undefined ? null : (
            <span className="text-caption font-light text-muted">{meta}</span>
          )}
        </div>
        {zoom ?? <span />}
        <div className="flex items-center justify-self-end gap-1">{actions}</div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-8 gap-2 px-2 pb-2 max-lg:auto-cols-[132px] max-lg:grid-flow-col max-lg:grid-cols-none max-lg:overflow-x-auto">
        {children}
      </div>
    </section>
  );
}

/** A strip card (`scard()`): two top words, a centre, and one or two lines under it. */
export function StripCard({
  a,
  b,
  children,
  line,
  task,
  selected = false,
}: {
  a: ReactNode;
  b: ReactNode;
  children: ReactNode;
  line: ReactNode;
  task?: ReactNode;
  selected?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex min-w-0 flex-col items-center rounded-card border px-3.5 py-3 text-center transition-colors duration-[var(--motion-duration-fast)]",
        selected ? "border-selected bg-selected" : "border-line hover:bg-hover",
      )}
    >
      <div className="mb-2.5 flex w-full justify-between gap-1.5 text-caption whitespace-nowrap">
        <span className="truncate">{a}</span>
        <span className="font-light text-muted">{b}</span>
      </div>
      {children}
      <div className="mt-2.5 text-caption">{line}</div>
      {task === undefined ? null : (
        <div className="mt-1.5 max-w-full text-caption leading-tight text-secondary">{task}</div>
      )}
    </div>
  );
}
