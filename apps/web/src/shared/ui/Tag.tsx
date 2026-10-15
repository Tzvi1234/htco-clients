import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

export type Hue = "iris" | "saffron" | "coral" | "mint" | "sky" | "rose" | "slate";

const SOLIDS: Record<Hue, string> = {
  iris: "bg-presence-iris",
  saffron: "bg-presence-saffron",
  coral: "bg-presence-coral",
  mint: "bg-presence-mint",
  sky: "bg-presence-sky",
  rose: "bg-presence-rose",
  slate: "bg-presence-slate",
};

/**
 * A value chip: 20 px, a solid fill in its hue with white text (the owner's rule: solid colour
 * or glass, never a faded tint), optionally a white dot.
 */
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
        "inline-flex h-5 items-center gap-1.5 rounded-tag px-1.5 text-body-sm font-medium whitespace-nowrap text-presence-fg",
        SOLIDS[hue],
      )}
    >
      {dot ? <span aria-hidden="true" className="size-1.5 rounded-pill bg-presence-fg" /> : null}
      {children}
    </span>
  );
}

const TILE = {
  sm: { box: "size-5 rounded-[5px]", glyph: 13 },
  md: { box: "size-8 rounded-control", glyph: 17 },
  lg: { box: "size-10 rounded-button", glyph: 21 },
} as const;

/**
 * A record type's icon (Shops, Orders, Security): a quiet white tile with a hairline and a
 * monochrome duotone Phosphor glyph, at 20, 32 or 40 px. Colour is kept for meaning (status,
 * the decision ring) and for solid accent surfaces, never for icons. Decorative; the label
 * beside it names the record type.
 */
export function ObjectIcon({
  icon: Glyph,
  size = "sm",
}: {
  /** Kept for the record type's identity in future views; icons themselves stay monochrome. */
  hue?: Hue;
  icon: Icon;
  size?: keyof typeof TILE;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-grid shrink-0 place-items-center border border-border-strong bg-surface text-primary shadow-1",
        TILE[size].box,
      )}
    >
      <Glyph size={TILE[size].glyph} weight="duotone" />
    </span>
  );
}
