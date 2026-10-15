import { useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { PageHeader } from "./PageHeader.tsx";
import { Panel } from "./Panel.tsx";
import { DemoBadge } from "./SoonTag.tsx";
import { cx } from "../lib/cx.ts";

/**
 * A screen of the Design 1C demo that is not live yet, with its title in the top bar.
 *
 * - Without children: one panel that says plainly the screen is being built.
 * - With children: the demo's own layout (its panels, copied from the prototype), dimmed,
 *   out of reach (`inert`, hidden from assistive technology) and under a large "DEMO" label,
 *   so nobody mistakes invented data for real data. `className` lays the children out (for
 *   example a grid of panels); the route should set `staticData: { layout: "panels" }`.
 *
 * Screens built from the demo replace it route by route (docs/features/web-shell/design.md).
 */
export function DemoScreen({
  title,
  className,
  children,
}: {
  title: string;
  /** The layout of the demo content (children mode). */
  className?: string;
  children?: ReactNode;
}) {
  const { t } = useLingui();
  if (children === undefined || children === null) {
    return (
      <>
        <PageHeader title={title} />
        <Panel label={title} className="grow animate-enter">
          <div className="flex grow flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <DemoBadge />
            <p className="m-0 font-display text-number-lg font-light">{title}</p>
            <p className="m-0 max-w-[420px] text-body-sm font-light text-muted">
              {t`This screen is part of the new design and is being built. Nothing on it is live yet.`}
            </p>
          </div>
        </Panel>
      </>
    );
  }
  return (
    <>
      <PageHeader title={title} />
      <div className="relative flex min-h-0 grow flex-col animate-enter">
        <div
          data-testid="demo-content"
          inert
          aria-hidden="true"
          className={cx("min-h-0 grow opacity-55 saturate-[0.7] select-none", className)}
        >
          {children}
        </div>
        <div
          role="note"
          className="pointer-events-none absolute inset-0 grid place-items-center content-center gap-3"
        >
          <span
            aria-hidden="true"
            className="font-display text-[clamp(64px,12vw,160px)] leading-none font-light tracking-[0.08em] text-secondary"
          >
            {t`DEMO`}
          </span>
          <DemoBadge className="bg-panel" />
        </div>
      </div>
    </>
  );
}
