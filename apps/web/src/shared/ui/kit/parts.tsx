import {
  isValidElement,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { SwitchButton, SwitchField } from "react-aria-components";

import { TrendGlyph } from "./glyphs.tsx";
import { cx } from "../../lib/cx.ts";
import { REDUCED_MOTION_QUERY } from "../../lib/useMediaQuery.ts";

// The small parts every Design 1C screen is made of, after the demo's CSS classes (`.cb`,
// `.kdisc`, `.pill`, `.chip`, `.dot`, `.idb`, `.kv`, `.kv2`, `.sec`, `.card`, `.tile`, `.tg`,
// `.svcrow`, `.kpis`). Tokens only: the demo's olive, blue, red and orange are the semantic
// success, info, danger and attention colours of the palette in use.

/** Numbers, codes and Latin names inside any text keep their own direction. */
export function N({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("ltr inline-block tabular", className)}>{children}</span>;
}

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** The `.cb` look, for a link that reads as a circle button (a route behind a gear). */
export function circleStyle(active = false, size: "sm" | "md" = "md"): string {
  return cx(
    size === "md" ? "size-10" : "size-8",
    "relative inline-flex shrink-0 items-center justify-center rounded-pill border",
    "transition-[background-color,border-color,scale] duration-[var(--motion-duration-fast)] ease-standard active:scale-95 disabled:opacity-45",
    active
      ? "border-inverse bg-inverse text-on-inverse"
      : "border-line-strong text-primary hover:border-line-hover",
    FOCUS,
  );
}

/** `.cb`: the 40 px round outline button of panel headers, named by its label (also its tooltip). */
export function CircleButton({
  label,
  icon,
  active = false,
  size = "md",
  className,
  children,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label: string;
  icon?: ReactNode;
  /** Ink when on (a chosen view, a pressed toggle). */
  active?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active ? true : undefined}
      className={cx(circleStyle(active, size), className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/**
 * `.kdisc`: the 40 px ink disc. With a label it is a button (a composer's send); without, a
 * decorative disc around a glyph (add, next). `accent` fills it with the accent instead.
 */
export function InkDisc({
  label,
  children,
  accent = false,
  className,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label?: string;
  accent?: boolean;
}) {
  const look = cx(
    "flex size-10 shrink-0 items-center justify-center rounded-pill",
    accent ? "bg-accent text-on-accent" : "bg-inverse text-on-inverse",
    className,
  );
  if (label === undefined)
    return (
      <span aria-hidden="true" className={look}>
        {children}
      </span>
    );
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        look,
        "transition-[background-color,scale] duration-[var(--motion-duration-fast)] active:scale-95",
        !accent && "hover:bg-inverse-hover",
        FOCUS,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** The `.pill` look: a 32 px outlined capsule (a button or link that reads as a pill adds hover). */
export const PILL =
  "inline-flex h-8 min-w-0 items-center justify-center gap-2 rounded-pill border border-line-strong px-3.5 text-body-sm whitespace-nowrap transition-[background-color,border-color] duration-[var(--motion-duration-fast)]";

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
    <span style={style} className={cx(PILL, wide && "w-full", className)}>
      {children}
    </span>
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

export type DotTone = "attention" | "success" | "info" | "ink" | "danger" | "muted";

const DOT: Record<DotTone, string> = {
  attention: "bg-attention-fill",
  success: "bg-success",
  info: "bg-info",
  ink: "bg-inverse",
  danger: "bg-danger",
  muted: "bg-faint",
};

/** `.dot`: a 6 px dot; colour is never the only signal, so it sits beside words. */
export function Dot({ tone = "muted", className }: { tone?: DotTone; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("inline-block size-1.5 shrink-0 rounded-pill", DOT[tone], className)}
    />
  );
}

/** `.idb`: a small label over a large light identifier ("Shop:" over "HTZ Prints"). */
export function IdBlock({
  label,
  value,
  valueId,
  size = "md",
  wrap = false,
  children,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  /** The id of the value element, so a region can be named by it. */
  valueId?: string;
  size?: "md" | "lg";
  /** Long values (a sentence) wrap instead of being cut. */
  wrap?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("min-w-0 text-center", className)}>
      <div className="text-caption font-light text-muted">{label}</div>
      <div
        id={valueId}
        className={cx(
          "font-display font-light tracking-[-0.01em]",
          wrap ? "text-balance" : "truncate",
          size === "lg" ? "text-display leading-[1.25]" : "text-number-lg leading-[1.25]",
        )}
      >
        {value}
      </div>
      {children}
    </div>
  );
}

/**
 * The middle dot between two facts on one line ("On · 2 devices"), with the same space on both
 * sides. Screen readers hear a comma instead of "dot".
 */
export function Sep({ className }: { className?: string }) {
  return (
    <>
      <span aria-hidden="true" className={cx("mx-1 text-muted", className)}>
        ·
      </span>
      <span className="sr-only">, </span>
    </>
  );
}

/**
 * A quiet line of help at the foot of a panel: what to do next, or what is safe to know
 * (contextual help, so a screen never leaves the owner guessing).
 */
export function Note({
  icon,
  children,
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cx(
        "m-0 flex items-start gap-2.5 rounded-card bg-raised px-4 py-3 text-start text-body-sm text-secondary",
        className,
      )}
    >
      {icon === undefined ? null : (
        <span aria-hidden="true" className="mt-0.5 flex shrink-0 text-icon">
          {icon}
        </span>
      )}
      <span className="min-w-0 text-pretty">{children}</span>
    </p>
  );
}

export type Pair = readonly [ReactNode, ReactNode];

/** `.kv`: label and value pairs, two to a row, the second aligned to the end. */
export function KV({ items, className }: { items: readonly Pair[]; className?: string }) {
  return (
    <dl className={cx("m-0 grid grid-cols-[1fr_auto] gap-4", className)}>
      {items.map(([label, value], index) => (
        <div key={index} className={cx("min-w-0", index % 2 === 1 && "text-end")}>
          <dt className="mb-0.5 text-caption font-light text-muted">{label}</dt>
          <dd className="m-0 text-body leading-snug break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * `.kv2`: two labelled pills side by side ("Status:" / "Last sync:"). Each value is drawn in a
 * full-width pill, unless it is a `Pill` already (one with its own classes).
 */
export function KV2({ items, className }: { items: readonly Pair[]; className?: string }) {
  return (
    <div className={cx("grid grid-cols-2 gap-2", className)}>
      {items.map(([label, value], index) => (
        <div key={index} className="min-w-0">
          <div className="mb-1.5 text-center text-caption font-light text-muted">{label}</div>
          {isValidElement(value) && value.type === Pill ? value : <Pill wide>{value}</Pill>}
        </div>
      ))}
    </div>
  );
}

/** `.sec`: a quiet label over a group. */
export function SectionLabel({
  children,
  id,
  className,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div id={id} className={cx("mb-2 text-caption font-light text-muted", className)}>
      {children}
    </div>
  );
}

/** `.card`: a bordered 16 px card; `raised` fills it (`.card.r`), `dashed` for a placeholder. */
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

function animates(): boolean {
  const reduce =
    typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
  return !reduce && typeof window.requestAnimationFrame === "function";
}

/** Counts a number up to its value once, keeping its prefix and suffix ("$842", "1,204"). */
export function CountUp({ value, duration = 700 }: { value: string; duration?: number }) {
  const match = /^([^\d]*)([\d][\d,]*(?:\.\d+)?)(.*)$/.exec(value);
  // Starts from zero only where it will animate; otherwise the value shows as is.
  const [shown, setShown] = useState<string | null>(() =>
    match === null || !animates() ? null : `${match[1] ?? ""}0${match[3] ?? ""}`,
  );
  useEffect(() => {
    if (match === null || !animates()) return;
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

/**
 * `.tile`: a bordered card with a small label over a large light number. `count` counts a
 * number up as it appears (and keeps it left-to-right).
 */
export function Tile({
  label,
  value,
  sub,
  count = false,
  className,
  children,
}: {
  label?: ReactNode;
  value?: ReactNode;
  sub?: ReactNode;
  count?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        "flex min-w-0 flex-col gap-1 rounded-card border border-line p-4 transition-colors duration-[var(--motion-duration-fast)] hover:bg-hover",
        className,
      )}
    >
      {label === undefined ? null : (
        <span className="truncate text-caption font-light text-muted">{label}</span>
      )}
      {value === undefined ? null : (
        <span className="font-display text-display-sm leading-[1.2] font-light whitespace-nowrap">
          {count && typeof value === "string" ? (
            <span className="ltr inline-block">
              <CountUp value={value} />
            </span>
          ) : (
            value
          )}
        </span>
      )}
      {sub === undefined ? null : <span className="text-caption text-secondary">{sub}</span>}
      {children}
    </div>
  );
}

/** The demo's toggle (`.tg`) as a switch with a name. */
export function Toggle({
  label,
  isSelected,
  onChange,
  isDisabled = false,
}: {
  label: string;
  isSelected: boolean;
  onChange?: (value: boolean) => void;
  isDisabled?: boolean;
}) {
  return (
    <SwitchField
      aria-label={label}
      isSelected={isSelected}
      {...(onChange === undefined ? {} : { onChange })}
      isDisabled={isDisabled}
      className="shrink-0"
    >
      <SwitchButton className="group block cursor-default outline-none">
        <span
          className={cx(
            "relative block h-6 w-10 rounded-pill border border-line-strong transition-colors duration-[var(--motion-duration-fast)]",
            "group-data-[selected]:border-inverse group-data-[selected]:bg-inverse",
            "group-data-[focus-visible]:outline-2 group-data-[focus-visible]:outline-offset-2 group-data-[focus-visible]:outline-focus",
            "after:absolute after:inset-s-[3px] after:top-[3px] after:size-4 after:rounded-pill after:bg-line-hover after:transition-[inset-inline-start] after:duration-[var(--motion-duration-fast)] after:content-['']",
            "group-data-[selected]:after:inset-s-[19px] group-data-[selected]:after:bg-on-inverse",
          )}
        />
      </SwitchButton>
    </SwitchField>
  );
}

/** A row of the demo's service and setting lists (`.svcrow`), with a divider between rows. */
export function ListRow({
  title,
  line,
  lead,
  end,
  wrapLine = false,
  className,
}: {
  title: ReactNode;
  line?: ReactNode;
  lead?: ReactNode;
  end?: ReactNode;
  /** The line wraps instead of being cut (a date that must be read whole). */
  wrapLine?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx("flex items-center gap-3 py-2.5 [&+&]:border-t [&+&]:border-line", className)}
    >
      {lead}
      <div className="min-w-0 flex-1">
        <div className="truncate text-body">{title}</div>
        {line === undefined ? null : (
          <div className={cx("text-caption text-secondary", wrapLine ? "text-pretty" : "truncate")}>
            {line}
          </div>
        )}
      </div>
      {end}
    </div>
  );
}

/** The four numbers under a hero (`.kpis`); phones scroll them sideways. */
export function Kpis({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div
      role="list"
      aria-label={label}
      // Phones scroll the numbers sideways: the region takes focus so keys can scroll it.
      tabIndex={0}
      className="grid grid-cols-4 border-t border-line outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:overflow-x-auto max-sm:[scrollbar-width:none]"
    >
      {children}
    </div>
  );
}

export function Kpi({
  label,
  value,
  delta,
  trend,
}: {
  label: ReactNode;
  value: ReactNode;
  delta?: ReactNode;
  trend?: "up" | "down";
}) {
  return (
    <div
      role="listitem"
      className="min-w-0 px-6 pt-4 pb-5 text-center max-lg:px-2.5 max-sm:shrink-0 max-sm:basis-[42%] max-sm:snap-start [&+&]:border-s [&+&]:border-line"
    >
      <div className="text-caption font-light text-muted">{label}</div>
      <div className="font-display text-number-lg leading-[1.3] font-light tracking-[-0.01em]">
        {value}
      </div>
      {delta === undefined ? null : (
        <div className="inline-flex items-center gap-1 text-caption whitespace-nowrap text-secondary">
          {trend === undefined ? null : <TrendGlyph up={trend === "up"} />}
          {delta}
        </div>
      )}
    </div>
  );
}

/** The chat's typing dots, named for screen readers ("Amir is typing…"). */
export function Typing({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="inline-flex h-9 items-center gap-1 rounded-[20px] bg-raised px-4"
    >
      {[0, 200, 400].map((delay) => (
        <i
          key={delay}
          className="size-1.5 rounded-pill bg-line-hover motion-safe:animate-[htco-typing_1.2s_infinite]"
          style={{ animationDelay: `${String(delay)}ms` }}
        />
      ))}
    </div>
  );
}
