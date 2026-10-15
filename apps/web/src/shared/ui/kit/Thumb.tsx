import { cx } from "../../lib/cx.ts";

export type ProductKind = "star" | "pet" | "towel" | "mug";

const STARS: readonly [number, number][] = [
  [20, 16],
  [27, 18],
  [24, 23],
  [19, 22],
  [29, 24],
  [22, 19],
];

/**
 * The demo's product thumbnails (`thumb()`): flat studio objects on a light card, the accent
 * as the product colour. Decorative; the product's name is always beside it.
 */
export function ProductThumb({
  kind,
  size = 48,
  radius = 10,
  className,
}: {
  kind: ProductKind;
  size?: number;
  radius?: number;
  /** Sizes the thumbnail per screen width (it fills its box). */
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx("inline-block max-w-full shrink-0 overflow-hidden", className)}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <svg viewBox="0 0 48 48" width="100%" height="100%">
        <rect width="48" height="48" fill="#F0F0EF" />
        {kind === "star" ? (
          <>
            <rect x="12" y="6" width="24" height="36" rx="1" fill="#111" />
            <circle cx="24" cy="20" r="9" fill="none" stroke="#fff" strokeWidth=".5" opacity=".7" />
            {STARS.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r=".8" fill="#fff" />
            ))}
            <rect x="17" y="33" width="14" height="1.2" fill="#fff" opacity=".7" />
            <rect x="19" y="36" width="10" height=".8" fill="#fff" opacity=".5" />
          </>
        ) : null}
        {kind === "pet" ? (
          <>
            <rect x="10" y="8" width="28" height="32" rx="1" fill="#fff" stroke="#D3D3D3" />
            <circle cx="24" cy="22" r="7" fill="var(--accent-mark)" />
            <path d="M18 17l2-5 3 4M30 17l-2-5-3 4" fill="var(--accent-mark)" />
            <rect
              x="15"
              y="32"
              width="18"
              height="4"
              rx="2"
              fill="var(--accent-mark)"
              opacity=".35"
            />
          </>
        ) : null}
        {kind === "towel" ? (
          <>
            <rect x="13" y="7" width="22" height="34" rx="1.5" fill="#E9E5DC" />
            <rect x="13" y="12" width="22" height="2" fill="var(--accent-mark)" />
            <rect x="13" y="16" width="22" height="1" fill="var(--accent-mark)" />
            <rect x="13" y="34" width="22" height="1" fill="var(--accent-mark)" />
            <rect x="13" y="37" width="22" height="2" fill="var(--accent-mark)" />
          </>
        ) : null}
        {kind === "mug" ? (
          <>
            <path d="M33 19h3a4 4 0 010 8h-3" fill="none" stroke="#D0D0D0" strokeWidth="2.4" />
            <rect x="13" y="14" width="21" height="22" rx="3" fill="#fff" stroke="#D3D3D3" />
            <rect x="13" y="22" width="21" height="6" fill="var(--accent-mark)" />
          </>
        ) : null}
      </svg>
    </span>
  );
}
