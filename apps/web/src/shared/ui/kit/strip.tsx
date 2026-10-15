import type { CSSProperties, ReactNode } from "react";

import { MinusGlyph, PlusGlyph } from "./glyphs.tsx";
import { CircleButton } from "./parts.tsx";
import { cx } from "../../lib/cx.ts";
import { Panel } from "../Panel.tsx";

/**
 * The strip's zoom (`zoom()`): two circle buttons around a track with a knob that moves between
 * the two pages of cards. Phones leave it out.
 */
export function Zoom({
  labels,
  page,
  onPage,
}: {
  labels: { less: string; more: string };
  page: 0 | 1;
  onPage?: (page: 0 | 1) => void;
}) {
  return (
    <div className="flex items-center gap-4 max-sm:hidden">
      <CircleButton
        label={labels.less}
        icon={<MinusGlyph />}
        onClick={() => {
          onPage?.(0);
        }}
      />
      <div aria-hidden="true" className="relative h-px w-40 bg-line-strong max-lg:w-24">
        <span
          className="absolute top-1/2 -mt-[9px] -ms-[9px] flex size-[18px] items-center justify-center rounded-pill bg-line-strong transition-[inset-inline-start] duration-[var(--motion-duration-base)] ease-standard after:size-2 after:rounded-pill after:bg-inverse after:content-['']"
          style={{ insetInlineStart: page === 1 ? "100%" : "0%" }}
        />
      </div>
      <CircleButton
        label={labels.more}
        icon={<PlusGlyph />}
        onClick={() => {
          onPage?.(1);
        }}
      />
    </div>
  );
}

/**
 * The strip along the bottom of a screen (`stripP()`): a title and meta, the zoom in the
 * middle, actions at the end, and eight small cards. Below 1360 px it shows six; phones scroll
 * the cards sideways.
 */
export function Strip({
  title,
  meta,
  zoom,
  actions,
  children,
  className,
  label,
  cards = true,
}: {
  title: ReactNode;
  meta?: ReactNode;
  zoom?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** The panel's name when the title is not plain text. */
  label?: string;
  /** False when the children lay out their own `StripCards` (inside a DemoPart, say). */
  cards?: boolean;
}) {
  return (
    <Panel {...(label === undefined ? {} : { label })} className={cx("col-span-full", className)}>
      <div className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center ps-6 pe-2 max-sm:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h2 className="m-0 truncate text-body-sm font-normal whitespace-nowrap">{title}</h2>
          {meta === undefined ? null : (
            <span className="truncate text-caption font-light text-muted">{meta}</span>
          )}
        </div>
        {zoom ?? <span className="max-sm:hidden" />}
        <div className="flex items-center justify-self-end gap-1">{actions}</div>
      </div>
      {cards ? <StripCards>{children}</StripCards> : children}
    </Panel>
  );
}

/** The strip's cards: eight across, six below 1360 px, a sideways scroller on phones. */
export function StripCards({ children }: { children: ReactNode }) {
  return (
    <div
      className={cx(
        "grid min-h-0 flex-1 grid-cols-8 gap-2 px-2 pb-2",
        "sm:max-[1359.98px]:grid-cols-6 sm:max-[1359.98px]:[&>:nth-child(n+7)]:hidden",
        "max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:overflow-x-auto max-sm:pb-3 max-sm:[scrollbar-width:none] max-sm:[&>*]:shrink-0 max-sm:[&>*]:basis-[124px] max-sm:[&>*]:snap-start",
      )}
    >
      {children}
    </div>
  );
}

/**
 * `.sc`: a strip card: two small facts on top, a picture or avatar, one or two lines. With
 * `onClick` it is a button that can be chosen (`selected` is then its pressed state).
 */
export function StripCard({
  topStart,
  topEnd,
  children,
  line,
  task,
  selected = false,
  onClick,
  style,
  className,
}: {
  topStart: ReactNode;
  topEnd?: ReactNode;
  children?: ReactNode;
  line?: ReactNode;
  task?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
}) {
  const look = cx(
    "flex min-w-0 flex-col items-center rounded-card border px-3.5 py-3 text-center transition-[background-color,border-color,translate] duration-[var(--motion-duration-fast)] ease-standard",
    selected ? "border-selected bg-selected" : "border-line hover:-translate-y-px hover:bg-hover",
    onClick !== undefined &&
      "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    className,
  );
  const content = (
    <>
      <span className="mb-2.5 flex w-full justify-between gap-1.5 text-caption whitespace-nowrap">
        <span className="truncate">{topStart}</span>
        {topEnd === undefined ? null : <span className="font-light text-muted">{topEnd}</span>}
      </span>
      {children}
      {line === undefined ? null : (
        <span className="mt-2.5 block w-full min-w-0 text-caption">{line}</span>
      )}
      {task === undefined ? null : (
        <span className="mt-1.5 block w-full truncate text-caption leading-[1.3] text-secondary">
          {task}
        </span>
      )}
    </>
  );
  if (onClick === undefined)
    return (
      <div style={style} className={look}>
        {content}
      </div>
    );
  return (
    <button type="button" aria-pressed={selected} style={style} className={look} onClick={onClick}>
      {content}
    </button>
  );
}
