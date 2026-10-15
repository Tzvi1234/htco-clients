import { useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { cx } from "../../lib/cx.ts";

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
