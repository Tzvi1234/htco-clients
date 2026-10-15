import { cx } from "../../lib/cx.ts";
import { StatusGlyph, type AgentStatus } from "./status.tsx";

const SIZE = {
  xs: "size-5 text-[10px]",
  sm: "size-7 text-caption",
  md: "size-10 text-[15px]",
  lg: "size-16 text-[24px] font-light",
} as const;

export type AvatarSize = keyof typeof SIZE;

/**
 * A round initial (`.av`): raised for people and employees, ink (`.av.k`) for the owner and
 * shops. `status` adds the small status glyph at the end corner.
 */
export function Avatar({
  initial,
  size = "md",
  ink = false,
  status,
  className,
}: {
  initial: string;
  size?: AvatarSize;
  ink?: boolean;
  status?: AgentStatus | undefined;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-avatar=""
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center rounded-pill border",
        SIZE[size],
        ink
          ? "border-inverse bg-inverse text-on-inverse"
          : cx("bg-raised text-primary", size === "xs" ? "border-line-strong" : "border-line"),
        className,
      )}
    >
      {initial}
      {status === undefined ? null : (
        <span className="absolute -end-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-pill bg-panel">
          <StatusGlyph status={status} size={8} />
        </span>
      )}
    </span>
  );
}

/** The first letter of a name, as the demo's avatars show it. */
export const initialOf = (name: string): string => Array.from(name).at(0) ?? "";

/** `.who2`: a tiny avatar and the name. */
export function Who({
  name,
  ink = false,
  className,
}: {
  name: string;
  ink?: boolean;
  className?: string;
}) {
  return (
    <span className={cx("inline-flex min-w-0 items-center gap-2 whitespace-nowrap", className)}>
      <Avatar initial={initialOf(name)} size="xs" ink={ink} />
      <span className="truncate">{name}</span>
    </span>
  );
}

/** Overlapping avatars (`.avs`): the people in a thread. */
export function Avatars({
  initials,
  size = "sm",
}: {
  initials: readonly string[];
  size?: AvatarSize;
}) {
  return (
    <span aria-hidden="true" className="inline-flex">
      {initials.map((initial, index) => (
        <span
          key={`${initial}-${String(index)}`}
          className={cx("flex rounded-pill ring-2 ring-panel", index > 0 && "-ms-1.5")}
        >
          <Avatar initial={initial} size={size} />
        </span>
      ))}
    </span>
  );
}
