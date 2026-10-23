import "./flow.css";

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { TrendGlyph } from "./glyphs.tsx";
import { useLocale } from "../../i18n/LocaleProvider.tsx";
import { directionOf } from "../../i18n/locale.ts";
import { cx } from "../../lib/cx.ts";
import { Panel } from "../Panel.tsx";

// The clarity layout (round 3): a screen that scrolls as one page instead of panels that scroll
// on their own. Every redesigned screen reads the same way:
// - Focus: one panel on top that says what matters now, with its few key figures and the one
//   primary action.
// - Then the work: rows of panels grouped by what goes together (FlowRow), a side column
//   (Aside), and sub-tabs when there is too much for one page (SubTabs and TabPanel).
// No panel here ever scrolls inside itself; long lists page with "Show more".

/**
 * The screen: one column of panels, 8 px apart, entering one after another. Its route says
 * `scroll: "page"` (app/router.tsx), so the shell scrolls the whole page under the sticky glass
 * top bar; nothing in here scrolls on its own.
 */
export function Flow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-page-scroll=""
      className={cx("k-flow flex grow flex-col gap-2 [&>*]:shrink-0", className)}
    >
      {children}
    </div>
  );
}

const ROWS = {
  /** The work beside a 340 px side column (the side column stays in view). */
  "main-side": "lg:grid-cols-[minmax(0,1fr)_340px]",
  /** A 340 px side column first (a list beside its details). */
  "side-main": "lg:grid-cols-[340px_minmax(0,1fr)]",
  halves: "md:grid-cols-2",
  thirds: "md:grid-cols-2 xl:grid-cols-3",
} as const;

/** A row of panels that belong together; phones stack them. */
export function FlowRow({
  layout,
  children,
  className,
}: {
  layout: keyof typeof ROWS;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("grid grid-cols-1 items-start gap-2", ROWS[layout], className)}>
      {children}
    </div>
  );
}

/**
 * A side column beside the main panel (under it on phones). It is not sticky: a sticky column
 * taller than the screen would hide its own end, and it never scrolls on its own.
 */
export function Aside({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("k-aside flex min-w-0 flex-col gap-2", className)}>{children}</div>;
}

/** A panel's body that grows with its content (never a scroller). */
export function FlowBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("flex flex-col px-6 pb-6 max-sm:px-4", className)}>{children}</div>;
}

/**
 * The focus panel at the top of a screen: its title (light, larger than a panel title), a quiet
 * meta beside it, one sentence of what matters now, the key figures, and the primary action.
 * `aside` takes the art or a small chart at the end; `end` sits at the header's end (the shop).
 */
export function Focus({
  title,
  meta,
  lead,
  figures,
  actions,
  aside,
  end,
  footer,
  label,
  titleId,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  lead?: ReactNode;
  figures?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  end?: ReactNode;
  footer?: ReactNode;
  /** The panel's name when the title is not plain text. */
  label?: string;
  titleId?: string;
  className?: string;
}) {
  return (
    <Panel
      {...(label === undefined ? {} : { label })}
      className={cx("k-focus shrink-0", className)}
    >
      <div className="flex gap-6 p-6 max-sm:flex-col max-sm:gap-5 max-sm:p-5">
        <div className="flex min-w-0 grow flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div className="flex min-w-0 flex-col gap-1">
              <h2
                id={titleId}
                className="m-0 font-display text-title-lg leading-[1.2] font-light text-balance"
              >
                {title}
              </h2>
              {meta === undefined ? null : (
                <div className="text-caption font-light text-muted">{meta}</div>
              )}
            </div>
            {end}
          </div>
          {lead === undefined ? null : (
            <p className="m-0 max-w-[62ch] text-body text-pretty text-secondary">{lead}</p>
          )}
          {figures}
          {actions === undefined ? null : (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
          {footer}
        </div>
        {aside === undefined ? null : (
          <div className="flex shrink-0 items-center justify-center max-lg:hidden">{aside}</div>
        )}
      </div>
    </Panel>
  );
}

/** The focus panel's key figures: label over a large light number, hairlines between them. */
export function Figures({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="list"
      aria-label={label}
      className={cx("k-figures flex flex-wrap gap-y-4 max-sm:grid max-sm:grid-cols-2", className)}
    >
      {children}
    </div>
  );
}

/**
 * One key figure. `tone="tertiary"` marks the one that needs the owner (in the orange tertiary text
 * colour, with its dot: colour never alone); `note` says what it is against (yesterday, a share).
 */
export function Figure({
  label,
  value,
  note,
  trend,
  tone,
}: {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  trend?: "up" | "down" | undefined;
  tone?: "tertiary" | undefined;
}) {
  return (
    <div
      role="listitem"
      className="k-figure flex min-w-[120px] flex-col gap-0.5 pe-8 max-sm:min-w-0 max-sm:pe-3"
    >
      <span className="inline-flex items-center gap-1.5 truncate text-caption font-light text-muted">
        {tone === "tertiary" ? (
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-pill bg-tertiary" />
        ) : null}
        {label}
      </span>
      <span
        className={cx(
          "font-display text-number-lg leading-[1.25] tracking-[-0.01em] whitespace-nowrap",
          // The figure that needs the owner is set heavier as well as in orange (round 4).
          tone === "tertiary" ? "font-normal text-tertiary-text" : "font-light",
        )}
      >
        {value}
      </span>
      {note === undefined ? null : (
        <span className="inline-flex items-center gap-1 truncate text-caption text-secondary">
          {trend === undefined ? null : <TrendGlyph up={trend === "up"} />}
          {note}
        </span>
      )}
    </div>
  );
}

export interface SubTab<K extends string> {
  id: K;
  label: ReactNode;
  /** A small count beside the label (left-to-right). */
  count?: number | undefined;
  /** A tab whose content is all Demo: its tag sits beside the label. */
  demo?: ReactNode;
}

const tabId = (base: string, id: string) => `${base}-tab-${id}`;
const panelId = (base: string, id: string) => `${base}-panel-${id}`;

/**
 * Sub-tabs inside a screen (WAI-ARIA tabs, selection follows focus): pills on one line, the
 * chosen one under an orange-tinted capsule that glides to it (a transition, so a quick second press
 * retargets it from where it is; nothing moves under reduced motion). The arrow keys move along
 * the reading direction, Home and End jump to the ends. Pair with `TabPanel`.
 */
export function SubTabs<K extends string>({
  label,
  idBase,
  tabs,
  value,
  onChange,
  className,
}: {
  label: string;
  idBase: string;
  tabs: readonly SubTab<K>[];
  value: K;
  onChange: (value: K) => void;
  className?: string;
}) {
  const { locale } = useLocale();
  const rtl = directionOf(locale) === "rtl";
  const list = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState<{ start: number; width: number } | null>(null);
  const index = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === value),
  );

  useLayoutEffect(() => {
    const element = list.current;
    if (element === null) return;
    const measure = () => {
      const tab = element.children.item(index + 1);
      if (!(tab instanceof HTMLElement) || tab.offsetWidth === 0) {
        setMark(null);
        return;
      }
      // Exact (fractional) boxes, not the rounded offsets: the capsule fits its tab to the pixel.
      const box = element.getBoundingClientRect();
      const own = tab.getBoundingClientRect();
      const start = rtl
        ? box.right - element.clientLeft - own.right - element.scrollLeft
        : own.left - box.left - element.clientLeft + element.scrollLeft;
      setMark({ start, width: own.width });
    };
    measure();
    // The capsule follows its tab's own size too: a web font that arrives late widens the label
    // while the list keeps its width (a stretched list on phones).
    let live = true;
    // Test environments may have no font loading at all.
    if ("fonts" in document)
      void document.fonts.ready.then(() => {
        if (live) measure();
      });
    if (typeof ResizeObserver === "undefined")
      return () => {
        live = false;
      };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const tab of element.children) observer.observe(tab);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [index, rtl, tabs.length, locale]);

  const keys = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    const last = tabs.length - 1;
    const next =
      event.key === forward
        ? (index + 1) % tabs.length
        : event.key === back
          ? (index + last) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    const tab = tabs[next];
    if (tab === undefined) return;
    onChange(tab.id);
    document.getElementById(tabId(idBase, tab.id))?.focus();
  };

  // The glide is drawn once it is measured; until then (and in tests) the chosen pill is tinted.
  const measured = mark !== null;
  return (
    <div
      ref={list}
      role="tablist"
      aria-label={label}
      onKeyDown={keys}
      className={cx(
        "k-tabs relative flex max-w-full shrink-0 items-center gap-1 self-start rounded-pill border border-line-strong p-1",
        "max-sm:self-stretch max-sm:overflow-x-auto max-sm:[scrollbar-width:none]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="k-tabs-mark pointer-events-none absolute inset-y-1 rounded-pill bg-tertiary-subtle"
        style={
          measured
            ? { insetInlineStart: `${String(mark.start)}px`, width: `${String(mark.width)}px` }
            : { opacity: 0 }
        }
      />
      {tabs.map((tab) => {
        const on = tab.id === value;
        return (
          <button
            key={tab.id}
            id={tabId(idBase, tab.id)}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={panelId(idBase, tab.id)}
            tabIndex={on ? 0 : -1}
            onClick={() => {
              onChange(tab.id);
            }}
            className={cx(
              "k-tab relative z-[1] inline-flex h-9 shrink-0 items-center gap-2 rounded-pill px-4 text-body-sm whitespace-nowrap outline-none",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              on ? "font-medium text-tertiary-text" : "text-primary hover:bg-hover",
              on && !measured && "bg-tertiary-subtle",
            )}
          >
            {on ? (
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-pill bg-tertiary" />
            ) : null}
            {tab.label}
            {tab.count === undefined ? null : (
              <span
                className={cx("ltr text-caption tabular", on ? "text-tertiary-text" : "text-muted")}
              >
                {tab.count}
              </span>
            )}
            {tab.demo}
          </button>
        );
      })}
    </div>
  );
}

/** The content of the chosen sub-tab; it eases in when the tab changes. */
export function TabPanel({
  idBase,
  tab,
  children,
  className,
}: {
  idBase: string;
  tab: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      key={tab}
      role="tabpanel"
      id={panelId(idBase, tab)}
      aria-labelledby={tabId(idBase, tab)}
      className={cx("k-tabpanel flex min-w-0 flex-col gap-2", className)}
    >
      {children}
    </div>
  );
}
