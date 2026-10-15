import { useLingui } from "@lingui/react/macro";
import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";

import { cx } from "../../lib/cx.ts";
import { REDUCED_MOTION_QUERY } from "../../lib/useMediaQuery.ts";
import "./kit.css";

// The Design 1C demo's small parts (demo_noimg.html, "pills, buttons, dots", "layout"): each
// keeps the demo's sizes and spacing, drawn from the tokens so both palettes, dark mode and
// every tweak level follow.

/** `.cb`: the 40 px round outline button that sits in panel headers. */
export function CircleButton({
  label,
  icon,
  active = false,
  className,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  /** What it does; also its tooltip. */
  label: string;
  icon: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "relative inline-flex size-10 shrink-0 items-center justify-center rounded-pill border",
        "transition-[background-color,border-color,scale] duration-[var(--motion-duration-fast)] ease-standard active:scale-95",
        active
          ? "border-inverse bg-inverse text-on-inverse"
          : "border-line-strong text-primary hover:border-line-hover hover:bg-hover",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

/** `.idb`: a small label over a large light identifier ("Shop:" over "HTZ Prints"). */
export function IdBlock({
  label,
  id,
  idId,
  children,
  className,
  size = "md",
  wrap = false,
}: {
  label: ReactNode;
  id: ReactNode;
  /** Long identifiers (a sentence) wrap instead of being cut. */
  wrap?: boolean;
  /** The id of the identifier element, so a region can be named by it. */
  idId?: string;
  children?: ReactNode;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className={cx("min-w-0 text-center", className)}>
      <div className="text-caption font-light text-muted">{label}</div>
      <div
        id={idId}
        className={cx(
          "font-display font-light",
          wrap ? "text-balance" : "truncate",
          size === "lg" ? "text-[40px] leading-[1.25]" : "text-number-lg leading-[1.25]",
        )}
      >
        {id}
      </div>
      {children}
    </div>
  );
}

/** `.kv`: label and value pairs in two columns, the second aligned to the end. */
export function KeyValues({
  items,
  className,
}: {
  items: readonly { label: ReactNode; value: ReactNode; key?: string }[];
  className?: string;
}) {
  return (
    <dl className={cx("m-0 grid grid-cols-[1fr_auto] gap-4", className)}>
      {items.map((item, index) => (
        <div
          key={item.key ?? index}
          className={cx("min-w-0", index % 2 === 1 && "text-end")}
        >
          <dt className="mb-0.5 block text-caption font-light text-muted">{item.label}</dt>
          <dd className="m-0 text-body">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** `.kv2`: two labelled full-width pills side by side ("Status:" / "Last sync:"). */
export function PillPair({
  items,
  className,
}: {
  items: readonly { label: ReactNode; pill: ReactNode; key?: string }[];
  className?: string;
}) {
  return (
    <div className={cx("grid grid-cols-2 gap-2", className)}>
      {items.map((item, index) => (
        <div key={item.key ?? index} className="min-w-0">
          <div className="mb-1.5 text-center text-caption font-light text-muted">{item.label}</div>
          {item.pill}
        </div>
      ))}
    </div>
  );
}

/** `.pill`: a 32 px outlined capsule; `wide` fills its cell (`.pill.w`). */
export function Pill({
  children,
  wide = false,
  className,
  style,
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={style}
      className={cx(
        "inline-flex h-8 min-w-0 items-center justify-center gap-2 rounded-pill border border-line-strong px-3.5 text-body-sm whitespace-nowrap",
        wide && "w-full",
        className,
      )}
    >
      {children}
    </span>
  );
}

export type DotTone = "attention" | "good" | "info" | "ink" | "danger" | "faint";

const DOT: Record<DotTone, string> = {
  attention: "bg-attention-fill",
  good: "bg-success",
  info: "bg-info",
  ink: "bg-inverse",
  danger: "bg-danger",
  faint: "bg-faint",
};

/** `.dot`: a 6 px dot; colour is never the only signal, so it sits beside words. */
export function Dot({ tone = "faint", className }: { tone?: DotTone; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("inline-block size-1.5 shrink-0 rounded-pill", DOT[tone], className)}
    />
  );
}

/** `.chip`: a 24 px raised capsule for small facts ("Policy refunds.partial"). */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center gap-1.5 rounded-pill bg-raised px-2.5 text-caption whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

export type WorkStatus =
  | "running"
  | "idle"
  | "queued"
  | "waitext"
  | "waityou"
  | "blocked"
  | "failed"
  | "offline"
  | "delivered";

/** The demo's status glyph (`sg`): the shape is the cue that does not rely on colour. */
export function StatusGlyph({ status, size = 10 }: { status: WorkStatus; size?: number }) {
  const common = {
    "aria-hidden": true,
    focusable: false,
    viewBox: "0 0 10 10",
    width: size,
    height: size,
    className: "shrink-0",
  } as const;
  switch (status) {
    case "running":
      return (
        <svg {...common} className="shrink-0 motion-safe:animate-[htco-led_2.4s_ease-in-out_infinite]">
          <circle cx="5" cy="5" r="4" fill="var(--success-dot)" />
        </svg>
      );
    case "idle":
      return (
        <svg {...common}>
          <circle cx="5" cy="5" r="3.6" fill="none" stroke="var(--icon-faint)" strokeWidth="1.4" />
        </svg>
      );
    case "queued":
      return (
        <svg {...common}>
          <circle
            cx="5"
            cy="5"
            r="3.6"
            fill="none"
            stroke="var(--icon-faint)"
            strokeWidth="1.4"
            strokeDasharray="1.6 1.4"
          />
        </svg>
      );
    case "waitext":
      return (
        <svg {...common}>
          <circle cx="5" cy="5" r="3.6" fill="none" stroke="var(--info-dot)" strokeWidth="1.4" />
          <path d="M5 1.4a3.6 3.6 0 010 7.2z" fill="var(--info-dot)" />
        </svg>
      );
    case "waityou":
      return (
        <svg {...common}>
          <circle
            cx="5"
            cy="5"
            r="4.6"
            fill="var(--attention-fill)"
            opacity=".35"
            className="origin-center motion-safe:animate-[htco-halo_1.6s_ease-in-out_infinite] [transform-box:fill-box]"
          />
          <circle cx="5" cy="5" r="2.8" fill="var(--attention-fill)" />
        </svg>
      );
    case "blocked":
      return (
        <svg {...common}>
          <rect x="1.5" y="1.5" width="7" height="7" rx="1" fill="var(--text-primary)" />
        </svg>
      );
    case "failed":
      return (
        <svg {...common}>
          <path
            d="M2 2l6 6M8 2L2 8"
            stroke="var(--danger-dot)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "offline":
      return (
        <svg {...common}>
          <rect x="1" y="4.2" width="8" height="1.6" rx=".8" fill="var(--icon-faint)" />
        </svg>
      );
    case "delivered":
      return (
        <svg {...common}>
          <circle cx="5" cy="5" r="4" fill="var(--text-primary)" />
          <path
            d="M3.2 5.1l1.3 1.3 2.4-2.6"
            stroke="var(--bg-panel)"
            strokeWidth="1.1"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

/** The words for each status, in the user's language. */
export function useStatusLabels(): Record<WorkStatus, string> {
  const { t } = useLingui();
  return {
    idle: t`Idle`,
    queued: t`Queued`,
    running: t`Running`,
    waitext: t`Waiting (external)`,
    waityou: t`Waiting for you`,
    blocked: t`Blocked`,
    failed: t`Failed`,
    offline: t`Offline`,
    delivered: t`Delivered`,
  };
}

/** `.st`: the status glyph and its word. `label` replaces the word ("Active" for running). */
export function StatusText({
  status,
  label,
  className,
}: {
  status: WorkStatus;
  label?: ReactNode;
  className?: string;
}) {
  const labels = useStatusLabels();
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-caption whitespace-nowrap", className)}>
      <StatusGlyph status={status} />
      {label ?? labels[status]}
    </span>
  );
}

/** Animates a number up to its value once, keeping its prefix and suffix ("$842", "1,204"). */
export function CountUp({ value, duration = 700 }: { value: string; duration?: number }) {
  const match = /^([^\d]*)([\d][\d,]*(?:\.\d+)?)(.*)$/.exec(value);
  const [shown, setShown] = useState(() => (match === null ? value : null));
  useEffect(() => {
    if (match === null) return;
    const reduce =
      typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (reduce || typeof window.requestAnimationFrame !== "function") {
      setShown(value);
      return;
    }
    const [, prefix = "", digits = "0", suffix = ""] = match;
    const target = Number(digits.replaceAll(",", ""));
    const decimals = digits.includes(".") ? (digits.split(".")[1] ?? "").length : 0;
    const grouped = digits.includes(",");
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const n = target * eased;
      const text = grouped
        ? n.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : n.toFixed(decimals);
      setShown(prefix + text + suffix);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
    };
    // The value is the only input; `match` is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);
  return (
    <>
      <span aria-hidden="true">{shown ?? value}</span>
      <span className="sr-only">{value}</span>
    </>
  );
}

/** `.tile`: a bordered card with a small label over a large light number. */
export function Tile({
  label,
  value,
  sub,
  animate = true,
}: {
  label: ReactNode;
  value: string;
  sub?: ReactNode;
  animate?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-card border border-line p-4 transition-colors duration-[var(--motion-duration-fast)] hover:bg-hover">
      <span className="truncate text-caption font-light text-muted">{label}</span>
      <span className="ltr text-[28px] leading-[1.2] font-light whitespace-nowrap">
        {animate ? <CountUp value={value} /> : value}
      </span>
      {sub === undefined ? null : <span className="text-caption text-secondary">{sub}</span>}
    </div>
  );
}

/** `.sec`: a quiet label over a group. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mb-2 text-caption font-light text-muted", className)}>{children}</div>;
}

/** `.card`: a bordered 16 px card; `raised` fills it (`.card.r`). */
export function Card({
  children,
  raised = false,
  dashed = false,
  className,
}: {
  children: ReactNode;
  raised?: boolean;
  dashed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-card border p-4",
        raised ? "border-raised bg-raised" : "border-line-strong",
        dashed && "border-dashed",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** `.kdisc`: the 40 px ink disc around a glyph (add, next). */
export function InkDisc({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "flex size-10 shrink-0 items-center justify-center rounded-pill bg-inverse text-on-inverse",
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface Person {
  /** The initial is the first letter of the name. */
  name: string;
  status?: WorkStatus | undefined;
}

const AVATAR = {
  md: "size-10 text-[15px]",
  sm: "size-7 text-caption",
  xs: "size-5 text-[10px] border-line-strong",
  lg: "size-16 text-[24px] font-light",
} as const;

/** `.av`: a round initial with the person's status glyph on its edge. */
export function Avatar({
  person,
  size = "md",
  showStatus = true,
  className,
}: {
  person: Person;
  size?: keyof typeof AVATAR;
  showStatus?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center rounded-pill border border-line bg-raised",
        AVATAR[size],
        className,
      )}
    >
      {[...person.name][0]}
      {showStatus && person.status !== undefined ? (
        <span className="absolute -end-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-pill bg-panel">
          <StatusGlyph status={person.status} size={8} />
        </span>
      ) : null}
    </span>
  );
}

/** `.who2`: a small avatar and the name. */
export function Who({ person }: { person: Person }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <Avatar person={person} size="xs" showStatus={false} />
      {person.name}
    </span>
  );
}

/** `.dbar`: dotted progress, `filled` of `total`, the first `accent` ones in the accent. */
export function DotBar({
  total,
  filled,
  accent = 0,
  label,
}: {
  total: number;
  filled: number;
  accent?: number;
  label?: string;
}) {
  return (
    <div
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      className="flex flex-wrap gap-[3px]"
    >
      {Array.from({ length: total }, (_, i) => (
        <i
          key={i}
          style={{ animationDelay: `${i * 12}ms` }}
          className={cx(
            "size-1.5 rounded-pill motion-safe:animate-enter",
            i < accent ? "bg-accent-mark" : i < filled ? "bg-inverse" : "bg-line-strong",
          )}
        />
      ))}
    </div>
  );
}
