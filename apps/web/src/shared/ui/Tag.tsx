import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

export type Hue = "iris" | "saffron" | "coral" | "mint" | "sky" | "rose" | "slate";

const TINTS: Record<Hue, string> = {
  iris: "bg-tag-iris text-tag-iris-text",
  saffron: "bg-tag-saffron text-tag-saffron-text",
  coral: "bg-tag-coral text-tag-coral-text",
  mint: "bg-tag-mint text-tag-mint-text",
  sky: "bg-tag-sky text-tag-sky-text",
  rose: "bg-tag-rose text-tag-rose-text",
  slate: "bg-tag-slate text-tag-slate-text",
};

const DOTS: Record<Hue, string> = {
  iris: "bg-tag-iris-dot",
  saffron: "bg-tag-saffron-dot",
  coral: "bg-tag-coral-dot",
  mint: "bg-tag-mint-dot",
  sky: "bg-tag-sky-dot",
  rose: "bg-tag-rose-dot",
  slate: "bg-tag-slate-dot",
};

/** A value chip, Attio style: 20 px, a soft tint and darker text, optionally a dot. */
export function Tag({
  hue,
  dot = false,
  children,
}: {
  hue: Hue;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex h-5 items-center gap-1.5 rounded-tag px-1.5 text-body-sm font-medium whitespace-nowrap",
        TINTS[hue],
      )}
    >
      {dot ? <span aria-hidden="true" className={cx("size-1.5 rounded-pill", DOTS[hue])} /> : null}
      {children}
    </span>
  );
}

/** A record type's icon on its tinted tile (Shops, Security, Settings): 20 or 28 px. */
export function ObjectIcon({
  hue,
  icon,
  size = "sm",
}: {
  hue: Hue;
  icon: ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-grid shrink-0 place-items-center rounded-control",
        size === "sm" ? "size-5" : "size-7",
        TINTS[hue],
      )}
    >
      {icon}
    </span>
  );
}
