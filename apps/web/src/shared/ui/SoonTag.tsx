import { useLingui } from "@lingui/react/macro";

import { cx } from "../lib/cx.ts";

/**
 * "Soon" beside a navigation item whose screen is not built yet. It takes the item's own text
 * colour, so it reads on a plain row and on the current item's inverse pill alike.
 */
export function SoonTag({ className }: { className?: string }) {
  const { t } = useLingui();
  return (
    <span
      className={cx(
        "inline-flex h-[18px] shrink-0 items-center rounded-pill border border-current px-1.5 text-caption leading-none font-normal",
        className,
      )}
    >
      {t`Soon`}
    </span>
  );
}

/**
 * The mark on a screen that only shows the design so far: no real data behind it yet.
 * Screens built from the Design 1C demo carry it until their data arrives.
 */
export function DemoBadge({ className }: { className?: string }) {
  const { t } = useLingui();
  return (
    <span
      className={cx(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-pill border border-line-strong px-2.5 text-caption text-secondary",
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent-mark" />
      {t`Demo — coming soon`}
    </span>
  );
}
