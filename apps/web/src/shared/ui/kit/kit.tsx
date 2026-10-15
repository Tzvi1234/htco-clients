import "./kit.css";

import { useLingui } from "@lingui/react/macro";
import { use, type ComponentType, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { TrendGlyph } from "./glyphs.tsx";
import { cx } from "../../lib/cx.ts";
import { TopBarSlotContext } from "../PageHeader.tsx";
import { useToast } from "../Toast.tsx";

/**
 * The Design 1C screen kit: the demo's panel patterns as small components on the tokens
 * (kit.css). Screens compose them inside `Panel`s (../Panel.tsx).
 */

/** Numbers, codes and Latin names inside any text keep their own direction. */
export function N({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("ltr inline-block tabular", className)}>{children}</span>;
}

/** The demo's 40 px circle button (`.cb`): an icon with a name. */
export function Cb({
  label,
  icon: Icon,
  onClick,
  on = false,
  className,
  children,
}: {
  label: string;
  icon?: ComponentType<{ size?: number }>;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  on?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={on ? true : undefined}
      onClick={onClick}
      className={cx("k-cb", on && "k-on", className)}
    >
      {Icon === undefined ? null : <Icon size={16} />}
      {children}
    </button>
  );
}

/** A small label over a large light value (the demo's `.idb`). */
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
    <div className={cx("k-idb", className)}>
      <div className="k-lb">{label}</div>
      <div className="k-id font-display">{value}</div>
      {children}
    </div>
  );
}

/** Label–value pairs, two to a row, the second at the end (`.kv`). */
export function KV({ items }: { items: readonly (readonly [ReactNode, ReactNode])[] }) {
  return (
    <dl className="k-kv m-0">
      {items.map(([label, value], index) => (
        <div key={index}>
          <dt className="k-lb">{label}</dt>
          <dd className="k-v m-0">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Two labelled pills side by side (`.kv2`). */
export function KV2({ items }: { items: readonly (readonly [ReactNode, ReactNode])[] }) {
  return (
    <div className="k-kv2">
      {items.map(([label, value], index) => (
        <div key={index} className="min-w-0">
          <div className="k-lb">{label}</div>
          {value}
        </div>
      ))}
    </div>
  );
}

export type DotTone = "o" | "g" | "b" | "k" | "r" | "mute";

export function Dot({ tone = "mute" }: { tone?: DotTone }) {
  return <span aria-hidden="true" className={cx("k-dot", tone !== "mute" && `k-${tone}`)} />;
}

/** A rounded label (`.pill`), full width in a `KV2`. */
export function Pill({
  children,
  wide = false,
  className,
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return <span className={cx("k-pill", wide && "k-w", className)}>{children}</span>;
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("k-chip", className)}>{children}</span>;
}

/** The office's eight statuses; the glyph's shape is the cue that does not rely on colour. */
export type AgentStatus =
  "running" | "idle" | "queued" | "waitext" | "waityou" | "blocked" | "failed" | "offline";

export const AGENT_STATUSES: readonly AgentStatus[] = [
  "running",
  "idle",
  "queued",
  "waitext",
  "waityou",
  "blocked",
  "failed",
  "offline",
];

export function useStatusLabel(): (status: AgentStatus) => string {
  const { t } = useLingui();
  return (status) =>
    ({
      idle: t`Idle`,
      queued: t`Queued`,
      running: t`Running`,
      waitext: t`Waiting (external)`,
      waityou: t`Waiting for you`,
      blocked: t`Blocked`,
      failed: t`Failed`,
      offline: t`Offline`,
    })[status];
}

/** The status glyph (`sg`): `live` lets running breathe and waiting-for-you ring. */
export function StatusGlyph({
  status,
  size = 10,
  live = false,
}: {
  status: AgentStatus;
  size?: number;
  live?: boolean;
}) {
  const body = {
    running: (
      <circle
        cx="5"
        cy="5"
        r="4"
        fill="var(--success-dot)"
        className={live ? "k-live-running" : undefined}
      />
    ),
    idle: <circle cx="5" cy="5" r="3.6" fill="none" stroke="var(--icon-faint)" strokeWidth="1.4" />,
    queued: (
      <circle
        cx="5"
        cy="5"
        r="3.6"
        fill="none"
        stroke="var(--icon-faint)"
        strokeWidth="1.4"
        strokeDasharray="1.6 1.4"
      />
    ),
    waitext: (
      <>
        <circle cx="5" cy="5" r="3.6" fill="none" stroke="var(--info-dot)" strokeWidth="1.4" />
        <path d="M5 1.4a3.6 3.6 0 010 7.2z" fill="var(--info-dot)" />
      </>
    ),
    waityou: (
      <>
        <circle
          cx="5"
          cy="5"
          r="4.6"
          fill="var(--attention-fill)"
          opacity=".35"
          className={live ? "k-live-ring" : undefined}
        />
        <circle cx="5" cy="5" r="2.8" fill="var(--attention-fill)" />
      </>
    ),
    blocked: <rect x="1.5" y="1.5" width="7" height="7" rx="1" fill="var(--text-primary)" />,
    failed: (
      <path
        d="M2 2l6 6M8 2L2 8"
        stroke="var(--danger-dot)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    ),
    offline: <rect x="1" y="4.2" width="8" height="1.6" rx=".8" fill="var(--icon-muted)" />,
  }[status];
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" width={size} height={size} className="shrink-0">
      {body}
    </svg>
  );
}

/** A status: its glyph and its word (`.st`). */
export function Status({
  status,
  label,
  live = false,
  className,
}: {
  status: AgentStatus;
  label?: ReactNode;
  live?: boolean;
  className?: string;
}) {
  const statusLabel = useStatusLabel();
  return (
    <span className={cx("k-st", className)}>
      <StatusGlyph status={status} live={live} />
      {label ?? statusLabel(status)}
    </span>
  );
}

/** An initial in a circle (`.av`), optionally with its status at the corner. */
export function Avatar({
  initial,
  size,
  ink = false,
  status,
  className,
}: {
  initial: string;
  size?: "xs" | "sm" | "lg";
  ink?: boolean;
  status?: AgentStatus | undefined;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx("k-av", size !== undefined && `k-${size}`, ink && "k-k", className)}
    >
      {initial}
      {status === undefined ? null : (
        <span className="k-sd">
          <StatusGlyph status={status} size={8} />
        </span>
      )}
    </span>
  );
}

/** The four numbers under a hero (`.kpis`); on phones they scroll sideways. */
export function Kpis({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div role="list" aria-label={label} className="k-kpis">
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
    <div role="listitem" className="k-kpi">
      <div className="k-lb">{label}</div>
      <div className="k-n font-display">{value}</div>
      {delta === undefined ? null : (
        <div className="k-d">
          {trend === undefined ? null : <TrendGlyph up={trend === "up"} />}
          {delta}
        </div>
      )}
    </div>
  );
}

/** The demo's slider between two pages of cards (`.zoom`). */
export function Zoom({
  page,
  onPage,
  labels,
  icons,
}: {
  page: 0 | 1;
  onPage: (page: 0 | 1) => void;
  labels: { less: string; more: string };
  icons: { less: ComponentType<{ size?: number }>; more: ComponentType<{ size?: number }> };
}) {
  return (
    <div className="k-zoom">
      <Cb
        label={labels.less}
        icon={icons.less}
        onClick={() => {
          onPage(0);
        }}
      />
      <div className="k-track" aria-hidden="true">
        <span className="k-knob" style={{ insetInlineStart: page === 1 ? "100%" : "0%" }} />
      </div>
      <Cb
        label={labels.more}
        icon={icons.more}
        onClick={() => {
          onPage(1);
        }}
      />
    </div>
  );
}

/** A dotted progress bar (`dbar`): `filled` in ink, the first `accent` in the accent. */
export function DotBar({
  count,
  filled,
  accent = 0,
  label,
}: {
  count: number;
  filled: number;
  accent?: number;
  label?: string;
}) {
  return (
    <div
      className="k-dbar"
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
    >
      {Array.from({ length: count }, (_, index) => (
        <i key={index} className={index < accent ? "k-o" : index < filled ? "k-f" : undefined} />
      ))}
    </div>
  );
}

/** Columns of dots, one per value (`dotcols`); `highlight` marks one column in the accent. */
export function DotColumns({
  values,
  rows = 12,
  highlight = -1,
  pitch = 10,
  gap = 14,
  labels,
  label,
}: {
  values: readonly number[];
  rows?: number;
  highlight?: number;
  pitch?: number;
  gap?: number;
  labels?: readonly string[];
  label?: string;
}) {
  const max = Math.max(...values);
  const width = values.length * gap;
  const height = rows * pitch;
  return (
    <div className="flex flex-col items-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${String(width)} ${String(height)}`}
        className="k-grow-in ltr"
        role={label === undefined ? undefined : "img"}
        aria-label={label}
        aria-hidden={label === undefined ? true : undefined}
      >
        {values.flatMap((value, column) => {
          const filled = Math.round((value / max) * rows);
          return Array.from({ length: rows }, (_, row) => {
            const y = height - row * pitch - pitch / 2;
            const x = column * gap + gap / 2;
            if (row < filled)
              return (
                <circle
                  key={`${String(column)}-${String(row)}`}
                  cx={x}
                  cy={y}
                  r={2.6}
                  fill={column === highlight ? "var(--accent-mark)" : "var(--text-primary)"}
                  opacity={column === highlight ? 1 : 0.25 + 0.6 * (row / rows)}
                  style={{ animationDelay: `${String(column * 30 + row * 12)}ms` }}
                />
              );
            return (
              <circle
                key={`${String(column)}-${String(row)}`}
                cx={x}
                cy={y}
                r={0.8}
                fill="var(--border-hover)"
              />
            );
          });
        })}
      </svg>
      {labels === undefined ? null : (
        <div
          aria-hidden="true"
          className="ltr mt-2 grid text-center text-[11px] text-muted"
          style={{ gridTemplateColumns: `repeat(${String(values.length)}, ${String(gap)}px)` }}
        >
          {labels.map((text, index) => (
            <span key={index}>{text}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The demo's matrix chart (`matrix`): a dot field with a quadrant of accent dots growing from
 * the centre, four axis labels and a value pill.
 */
export function Matrix({
  width = 208,
  height = 160,
  k = 5,
  value,
  caption,
  top,
  start,
  end,
  bottom,
  marker = true,
}: {
  width?: number;
  height?: number;
  k?: number;
  value: string;
  caption: ReactNode;
  top: ReactNode;
  start: ReactNode;
  end: ReactNode;
  bottom: ReactNode;
  marker?: boolean;
}) {
  const p = 8;
  const cols = Math.floor(width / p);
  const rows = Math.floor(height / p);
  const cx0 = Math.floor(cols / 2);
  const cy0 = Math.floor(rows / 2);
  const dots: ReactNode[] = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const x = i * p + 4;
      const y = j * p + 4;
      const key = `${String(i)}-${String(j)}`;
      if (j === cy0) {
        dots.push(
          <circle key={key} cx={x} cy={y} r={i === cx0 ? 1.6 : 0.9} fill="var(--text-primary)" />,
        );
        continue;
      }
      if (i === cx0 && j > cy0) {
        dots.push(<circle key={key} cx={x} cy={y} r={0.9} fill="var(--text-primary)" />);
        continue;
      }
      const di = cx0 - 1 - i;
      const dj = cy0 - 1 - j;
      if (di >= 0 && dj >= 0 && di < k && dj < k) {
        const d = Math.max(di, dj);
        dots.push(
          <circle
            key={key}
            cx={x}
            cy={y}
            r={3.3 - d * 0.42}
            fill="var(--accent-mark)"
            opacity={1 - d * 0.13}
            style={{ animationDelay: `${String(d * 70)}ms` }}
          />,
        );
        continue;
      }
      const far = Math.hypot(i - cx0, j - cy0) / Math.hypot(cx0, cy0);
      dots.push(
        <circle
          key={key}
          cx={x}
          cy={y}
          r={0.8}
          fill="var(--border-hover)"
          opacity={0.75 - far * 0.45}
        />,
      );
    }
  if (marker)
    dots.push(
      <circle
        key="marker"
        cx={(cx0 - k - 1) * p + 4}
        cy={(cy0 - k + 2) * p + 4}
        r={5}
        fill="var(--text-primary)"
      />,
    );
  return (
    <div className="k-mx">
      <div className="k-t">{top}</div>
      <div />
      <div style={{ gridColumn: 1, gridRow: 2 }}>{start}</div>
      <svg
        aria-hidden="true"
        className="k-grow-in ltr"
        style={{ gridColumn: 2, gridRow: 2 }}
        width={cols * p}
        height={rows * p}
        viewBox={`0 0 ${String(cols * p)} ${String(rows * p)}`}
      >
        {dots}
      </svg>
      <div style={{ gridColumn: 3, gridRow: 2 }}>{end}</div>
      <div className="k-b" style={{ gridRow: 3 }}>
        {bottom}
      </div>
      <div className="k-vp">
        <TrendGlyph />
        <N>{value}</N>
        <span className="k-mute">%</span> – {caption}
      </div>
    </div>
  );
}

/** A table in the demo's style (`.tw table`): sticky light headers, 48 px rows. */
export function Table({
  heads,
  rows,
  ends = [],
  label,
}: {
  heads: readonly ReactNode[];
  rows: readonly (readonly ReactNode[])[];
  ends?: readonly number[];
  label?: string;
}) {
  return (
    <div className="k-tw">
      <table className="k-table" aria-label={label}>
        <thead>
          <tr>
            {heads.map((head, index) => (
              <th key={index} className={ends.includes(index) ? "k-e" : undefined}>
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, index) => (
                <td key={index} className={ends.includes(index) ? "k-e tabular" : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Tile({
  label,
  value,
  sub,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="k-tile">
      <span className="k-lb">{label}</span>
      <span className="k-n font-display">{value}</span>
      {sub === undefined ? null : <span className="text-caption text-secondary">{sub}</span>}
    </div>
  );
}

/** The chat's typing dots. */
export function Typing({ label }: { label: string }) {
  return (
    <div className="k-typing" role="img" aria-label={label}>
      <i />
      <i />
      <i />
    </div>
  );
}

const INTERACTIVE = "a, button, input, select, textarea, [role='button'], [role='link'], tr";

/**
 * A full screen of the Design 1C demo whose feature is not built yet: the demo's design with its
 * sample data, dimmed a little under a large "Demo" label. Nothing in it pretends to work: an
 * action shows "Demo — coming soon"; controls marked `data-demo-view` only change the view
 * (selecting a row, map or list, pausing an animation).
 */
export function DemoFrame({ children, className }: { children: ReactNode; className?: string }) {
  const { t } = useLingui();
  const toast = useToast();
  const label = t`Demo`;
  // The large label sits in the top bar, between the page title and the language switch.
  const slot = use(TopBarSlotContext);
  const header = slot?.closest("header") ?? null;
  const pill = (
    <div className={cx("k-demo-label", header !== null && "k-demo-top")}>
      <i aria-hidden="true" />
      <span>{label.toUpperCase()}</span>
      <small>{t`Sample data · coming soon`}</small>
    </div>
  );
  return (
    <div
      role="region"
      aria-label={t`Demo — coming soon`}
      data-demo=""
      className={cx("k-demo", className)}
      onClickCapture={(event) => {
        const target = event.target as Element;
        const control = target.closest(INTERACTIVE);
        if (control === null || control.closest("[data-demo-view]")) return;
        event.preventDefault();
        event.stopPropagation();
        toast(t`Demo — coming soon`);
      }}
      onSubmitCapture={(event) => {
        event.preventDefault();
      }}
    >
      {header === null ? pill : createPortal(pill, header)}
      <span className="sr-only">{t`Demo — coming soon`}</span>
      <div className="k-demo-body">{children}</div>
    </div>
  );
}

/**
 * A part of a real screen that needs a feature we plan but have not built: the demo's design,
 * dimmed a little, with a small "Demo" label. It is inert and hidden from assistive technology,
 * which hears "Demo — coming soon" instead.
 */
export function DemoPart({
  children,
  className,
  edge = false,
  as: Element = "div",
}: {
  children: ReactNode;
  className?: string;
  /** The label sits on the part's top edge (over a divider) instead of inside its corner. */
  edge?: boolean;
  as?: "div" | "section";
}) {
  const { t } = useLingui();
  // Sample data is out of reach, as in DemoScreen: not focusable, not read as real data.
  return (
    <>
      <Element
        data-demo-part=""
        inert
        aria-hidden="true"
        className={cx("k-demopart", edge && "k-edge", className)}
      >
        <span className="k-demotag">
          <i />
          {t`Demo`}
        </span>
        {children}
      </Element>
      <span className="sr-only">{t`Demo — coming soon`}</span>
    </>
  );
}
