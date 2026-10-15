import { useLingui } from "@lingui/react/macro";
import type { MouseEvent, ReactNode } from "react";

import { cx } from "../../lib/cx.ts";
import { useToast } from "../Toast.tsx";

/** What a click on a demo control can land on. */
const CONTROL = "button, a, input, select, textarea, label, [role='button'], [role='tab'], tbody tr";

/**
 * A screen that is designed but not built (redesign brief, rule 2): the demo's full screen with
 * its sample data, the light lowered a little and a large "Demo" label over it. Nothing pretends
 * to work: a click on any control only says "Demo — coming soon". Hover stays alive.
 */
export function DemoFrame({ children }: { children: ReactNode }) {
  const { t } = useLingui();
  const toast = useToast();

  function stop(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Element) || target.closest(CONTROL) === null) return;
    event.preventDefault();
    event.stopPropagation();
    toast(t`Demo — coming soon`);
  }

  return (
    <div data-demo-frame="" className="relative flex min-h-0 grow flex-col" onClickCapture={stop}>
      <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center max-sm:sticky max-sm:top-2 max-sm:h-0 max-sm:overflow-visible">
        <p className="m-0 flex h-12 items-center gap-3 rounded-pill bg-inverse ps-5 pe-6 text-on-inverse shadow-popover motion-safe:animate-pop-in max-sm:h-10 max-sm:ps-4 max-sm:pe-5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-pill bg-accent-on-inverse motion-safe:animate-[htco-demo-shimmer_2.4s_ease-in-out_infinite]"
          />
          <span className="font-display text-[26px] leading-none font-light tracking-[0.18em] uppercase max-sm:text-[20px]">
            {t`Demo`}
          </span>
          <span className="text-caption font-light text-on-inverse-muted max-sm:hidden">
            {t`Sample data · coming soon`}
          </span>
        </p>
      </div>
      <div className="flex min-h-0 grow flex-col opacity-[0.78] saturate-[0.85]">{children}</div>
    </div>
  );
}

/**
 * A part of a real screen that shows a planned feature not built yet (brief, rule 3): kept in
 * the design, slightly dimmed and marked "Demo"; its sample values are hidden from assistive
 * technology and cannot be used.
 */
export function DemoPart({
  children,
  className,
  labelPosition = "top",
}: {
  children: ReactNode;
  className?: string;
  labelPosition?: "top" | "center";
}) {
  const { t } = useLingui();
  return (
    <div data-demo-part="" className={cx("relative", className)}>
      <div aria-hidden="true" inert className="h-full opacity-[0.45] saturate-[0.6] select-none">
        {children}
      </div>
      <span
        className={cx(
          "absolute z-10 inline-flex h-6 items-center gap-1.5 rounded-pill border border-line-strong bg-raised px-2.5 text-caption font-normal shadow-1",
          labelPosition === "top"
            ? "end-2 -top-3"
            : "start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2",
        )}
      >
        <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent-mark" />
        {t`Demo`}
      </span>
    </div>
  );
}
