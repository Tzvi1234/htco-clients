import { useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { CircleButton } from "./Bits.tsx";
import { MinusGlyph, PlusGlyph } from "./glyphs.tsx";
import { cx } from "../../lib/cx.ts";
import { Panel } from "../Panel.tsx";

/**
 * The demo's strip (`stripP()`): a full-width panel along the bottom with a title, the zoom
 * track in the middle, actions at the end, and eight small cards. Phones scroll the cards
 * sideways and leave the zoom out.
 */
export function Strip({
  title,
  meta,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useLingui();
  return (
    <Panel className={cx("lg:col-span-full", className)}>
      <header className="grid h-14 shrink-0 grid-cols-[1fr_auto] items-center ps-6 pe-2 sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h2 className="m-0 truncate text-body-sm font-normal">{title}</h2>
          {meta === undefined ? null : (
            <span className="text-caption font-light text-muted">{meta}</span>
          )}
        </div>
        <div aria-hidden="true" className="flex items-center gap-4 max-sm:hidden">
          <CircleButton label={t`Zoom out`} icon={<MinusGlyph />} tabIndex={-1} />
          <div className="relative h-px w-40 bg-line-strong">
            <span className="absolute start-0 top-1/2 -ms-[9px] -mt-[9px] flex size-[18px] items-center justify-center rounded-pill bg-[#cfcfcf]">
              <span className="size-2 rounded-pill bg-inverse" />
            </span>
          </div>
          <CircleButton label={t`Zoom in`} icon={<PlusGlyph />} tabIndex={-1} />
        </div>
        <div className="flex items-center justify-self-end gap-1">{actions}</div>
      </header>
      <div className="grid min-h-0 grow auto-cols-[136px] grid-flow-col gap-2 overflow-x-auto px-2 pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-8 sm:overflow-visible">
        {children}
      </div>
    </Panel>
  );
}

/** `.sc`: a strip card: two small facts on top, a picture or avatar, one or two lines. */
export function StripCard({
  topStart,
  topEnd,
  middle,
  line,
  task,
  selected = false,
}: {
  topStart: ReactNode;
  topEnd: ReactNode;
  middle: ReactNode;
  line?: ReactNode;
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
        <span>{topStart}</span>
        <span className="font-light text-muted">{topEnd}</span>
      </div>
      {middle}
      {line === undefined ? null : <div className="mt-2.5 text-caption">{line}</div>}
      {task === undefined ? null : (
        <div className="mt-1.5 w-full truncate text-caption leading-[1.3] text-secondary">{task}</div>
      )}
    </div>
  );
}
