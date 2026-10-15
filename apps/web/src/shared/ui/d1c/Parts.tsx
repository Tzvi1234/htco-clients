import "./d1c.css";

import type { ReactNode } from "react";
import {
  Button as AriaButton,
  SwitchButton,
  SwitchField,
  type ButtonProps,
} from "react-aria-components";

import { cx } from "../../lib/cx.ts";

// The small parts every Design 1C screen is made of, after the demo's CSS classes (`.cb`,
// `.pill`, `.dot`, `.st`, `.av`, `.idb`, `.kv`, `.kv2`, `.sec`, `.dbar`, `.tile`, `.tg`, `.chip`).
// Tokens only: the demo's olive, blue, red and orange are the semantic success, info, danger
// and attention colours of the palette in use.

/** A 40 px circle button with a line edge (`.cb`), named for screen readers by its label. */
export function CircleButton({
  label,
  icon,
  active = false,
  size = "md",
  className,
  ...props
}: Omit<ButtonProps, "className" | "children" | "aria-label"> & {
  label: string;
  icon: ReactNode;
  active?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <AriaButton
      {...props}
      aria-label={label}
      {...(active ? { "aria-pressed": true } : {})}
      className={cx(
        "relative inline-flex shrink-0 cursor-default items-center justify-center rounded-pill border outline-none",
        size === "md" ? "size-10" : "size-8",
        "transition-[border-color,background-color,scale] duration-[var(--motion-duration-fast)] ease-standard",
        "data-[pressed]:scale-95 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus",
        "data-[disabled]:opacity-45",
        active
          ? "border-inverse bg-inverse text-on-inverse"
          : "border-line-strong text-primary data-[hovered]:border-line-hover",
        className,
      )}
    >
      {icon}
    </AriaButton>
  );
}

export type DotTone = "attention" | "success" | "info" | "ink" | "danger" | "muted";

const DOT: Record<DotTone, string> = {
  attention: "bg-attention",
  success: "bg-success",
  info: "bg-info",
  ink: "bg-inverse",
  danger: "bg-danger",
  muted: "bg-faint",
};

/** The 6 px colour dot (`.dot`); decorative, always beside a word. */
export function Dot({ tone, className }: { tone: DotTone; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("inline-block size-1.5 shrink-0 rounded-pill", DOT[tone], className)}
    />
  );
}

/** A round line pill (`.pill`); `wide` fills its cell (`.pill.w`). */
export function Pill({
  children,
  wide = false,
  className,
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <span
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

/** A filled chip on the raised surface (`.chip`). */
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

/** The demo's work states; the glyph's shape is the cue that does not rely on colour. */
export type WorkState =
  "idle" | "queued" | "running" | "waitext" | "waityou" | "blocked" | "failed" | "offline";

/** The status glyph (`sg()`): filled, ring, dashed ring, half, double, square, cross or bar. */
export function StateGlyph({ state, size = 10 }: { state: WorkState; size?: number }) {
  const body: Record<WorkState, ReactNode> = {
    running: <circle cx="5" cy="5" r="4" className="fill-success" />,
    idle: <circle cx="5" cy="5" r="3.6" fill="none" strokeWidth="1.4" className="stroke-faint" />,
    queued: (
      <circle
        cx="5"
        cy="5"
        r="3.6"
        fill="none"
        strokeWidth="1.4"
        strokeDasharray="1.6 1.4"
        className="stroke-faint"
      />
    ),
    waitext: (
      <>
        <circle cx="5" cy="5" r="3.6" fill="none" strokeWidth="1.4" className="stroke-info" />
        <path d="M5 1.4a3.6 3.6 0 010 7.2z" className="fill-info" />
      </>
    ),
    waityou: (
      <>
        <circle cx="5" cy="5" r="4.6" opacity=".35" className="fill-attention" />
        <circle cx="5" cy="5" r="2.8" className="fill-attention" />
      </>
    ),
    blocked: <rect x="1.5" y="1.5" width="7" height="7" rx="1" className="fill-primary" />,
    failed: (
      <path
        d="M2 2l6 6M8 2L2 8"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="stroke-danger"
      />
    ),
    offline: <rect x="1" y="4.2" width="8" height="1.6" rx=".8" className="fill-faint" />,
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 10 10"
      width={size}
      height={size}
      data-state={state}
      className={cx(
        "shrink-0",
        state === "running" && "animate-[htco-pulse_1.4s_ease-in-out_infinite]",
      )}
    >
      {body[state]}
    </svg>
  );
}

/** A state glyph with its word (`.st`). */
export function StateLabel({ state, children }: { state: WorkState; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-caption whitespace-nowrap">
      <StateGlyph state={state} />
      {children}
    </span>
  );
}

const AVATAR = {
  xs: "size-5 text-[10px] border-line-strong",
  sm: "size-7 text-caption border-line",
  md: "size-10 text-[15px] border-line",
  lg: "size-16 text-title-lg font-light border-line",
} as const;

/**
 * A round initial (`.av`): raised for people and employees, ink (`k`) for the owner and shops.
 * `state` adds the small status badge at the end corner.
 */
export function Avatar({
  initial,
  size = "md",
  ink = false,
  state,
  className,
}: {
  initial: string;
  size?: keyof typeof AVATAR;
  ink?: boolean;
  state?: WorkState | undefined;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center rounded-pill border",
        AVATAR[size],
        ink ? "border-inverse bg-inverse text-on-inverse" : "bg-raised text-primary",
        className,
      )}
    >
      {initial}
      {state === undefined ? null : (
        <span className="absolute -end-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-pill bg-panel">
          <StateGlyph state={state} size={8} />
        </span>
      )}
    </span>
  );
}

/** A tiny avatar and a name (`.who2`). */
export function Who({ name, ink = false }: { name: string; ink?: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar initial={name.slice(0, 1)} size="xs" ink={ink} />
      <span className="truncate">{name}</span>
    </span>
  );
}

/** The centred identity block (`.idb`): a quiet label over a 32 px light value. */
export function IdBlock({
  label,
  value,
  children,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("text-center", className)}>
      <div className="text-caption font-light text-muted">{label}</div>
      <div className="truncate font-display text-number-lg leading-[1.25] font-light">{value}</div>
      {children}
    </div>
  );
}

/** Label and value pairs in two columns, the second aligned to the end (`.kv`). */
export function KV({ items }: { items: readonly (readonly [ReactNode, ReactNode])[] }) {
  return (
    <dl className="m-0 grid grid-cols-[1fr_auto] gap-4">
      {items.map(([label, value], index) => (
        <div key={index} className={cx("min-w-0", index % 2 === 1 && "text-end")}>
          <dt className="mb-0.5 text-caption font-light text-muted">{label}</dt>
          <dd className="m-0 text-body leading-snug break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Two labelled pills side by side (`.kv2`). */
export function KV2({ items }: { items: readonly (readonly [ReactNode, ReactNode])[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(([label, value], index) => (
        <div key={index} className="min-w-0">
          <div className="mb-1.5 text-center text-caption font-light text-muted">{label}</div>
          <Pill wide>{value}</Pill>
        </div>
      ))}
    </div>
  );
}

/** A quiet section label (`.sec`). */
export function SectionLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <div id={id} className="mb-2 text-caption font-light text-muted">
      {children}
    </div>
  );
}

/**
 * Dotted progress (`.dbar`): `filled` ink dots of `count`, the first `accent` ones in the accent.
 * Dots fill in one after another as it enters (not under reduced motion).
 */
export function DotBar({
  count,
  filled,
  accent = 0,
  marks,
  label,
}: {
  count: number;
  filled: number;
  accent?: number;
  /** Indexes drawn in the accent instead (an uptime bar's bad days). */
  marks?: readonly number[];
  label?: string;
}) {
  return (
    <div
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      className="flex flex-wrap gap-[3px]"
    >
      {Array.from({ length: count }, (_, index) => {
        const marked = marks?.includes(index) ?? false;
        const tone =
          marked || index < accent
            ? "bg-accent-mark"
            : index < filled
              ? "bg-inverse"
              : "bg-line-strong";
        return (
          <i
            key={index}
            className={cx("block size-1.5 rounded-pill animate-[htco-dot-in_280ms_both]", tone)}
            style={{ animationDelay: `${String(index * 12)}ms` }}
          />
        );
      })}
    </div>
  );
}

/** A bordered number tile (`.tile`). */
export function Tile({
  label,
  value,
  sub,
  className,
  children,
}: {
  label?: ReactNode;
  value?: ReactNode;
  sub?: ReactNode;
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
        <span className="text-caption font-light text-muted">{label}</span>
      )}
      {value === undefined ? null : (
        <span className="font-display text-display-sm leading-[1.2] font-light">{value}</span>
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
            "after:absolute after:start-[3px] after:top-[3px] after:size-4 after:rounded-pill after:bg-line-hover after:transition-[inset-inline-start] after:duration-[var(--motion-duration-fast)] after:content-['']",
            "group-data-[selected]:after:start-[19px] group-data-[selected]:after:bg-on-inverse",
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
  className,
}: {
  title: ReactNode;
  line?: ReactNode;
  lead?: ReactNode;
  end?: ReactNode;
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
          <div className="truncate text-caption text-secondary">{line}</div>
        )}
      </div>
      {end}
    </div>
  );
}

/** The ink disc button (`.kdisc`), e.g. a composer's send. */
export function InkDisc({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <AriaButton
      aria-label={label}
      className="flex size-10 shrink-0 cursor-default items-center justify-center rounded-pill bg-inverse text-on-inverse outline-none transition-[scale,background-color] duration-[var(--motion-duration-fast)] data-[hovered]:bg-inverse-hover data-[pressed]:scale-95"
    >
      {icon}
    </AriaButton>
  );
}
