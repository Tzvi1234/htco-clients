import { useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { cx } from "../../lib/cx.ts";

/**
 * The demo's work statuses (the office's eight, and "delivered" for shipments). The glyph's
 * shape is the cue that does not rely on colour: filled, ring, dashed ring, half, halo, square,
 * cross, bar, and a filled check. "working" is work in hand outside the office (an incident
 * being investigated or fixed): the filled dot in the info tone, not the office's green.
 */
export type AgentStatus =
  | "running"
  | "idle"
  | "queued"
  | "waitext"
  | "waityou"
  | "blocked"
  | "failed"
  | "offline"
  | "delivered"
  | "working";

/** The office's eight statuses (an employee is never "delivered"). */
export type OfficeStatus = Exclude<AgentStatus, "delivered" | "working">;

/** The office's eight statuses in the demo's order (its legend). */
export const AGENT_STATUSES: readonly OfficeStatus[] = [
  "running",
  "idle",
  "queued",
  "waitext",
  "waityou",
  "blocked",
  "failed",
  "offline",
];

/** The words for each status, in the user's language. */
export function useStatusLabels(): Record<AgentStatus, string> {
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
    working: t`In progress`,
  };
}

const LED = "motion-safe:animate-[htco-led_2.4s_ease-in-out_infinite]";
const HALO =
  "origin-center [transform-box:fill-box] motion-safe:animate-[htco-halo_1.6s_ease-in-out_infinite]";

/**
 * The status glyph (the demo's `sg()`). `live` lets it move as the demo's live elements do:
 * running breathes like an LED and waiting-for-you rings (not under reduced motion).
 */
export function StatusGlyph({
  status,
  size = 10,
  live = false,
}: {
  status: AgentStatus;
  size?: number;
  live?: boolean;
}) {
  const body: Record<AgentStatus, ReactNode> = {
    running: (
      <circle cx="5" cy="5" r="4" fill="var(--success-dot)" className={live ? LED : undefined} />
    ),
    working: <circle cx="5" cy="5" r="4" fill="var(--info-dot)" />,
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
          className={live ? HALO : undefined}
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
    offline: <rect x="1" y="4.2" width="8" height="1.6" rx=".8" fill="var(--icon-faint)" />,
    delivered: (
      <>
        <circle cx="5" cy="5" r="4" fill="var(--text-primary)" />
        <path
          d="M3.2 5.1l1.3 1.3 2.4-2.6"
          stroke="var(--bg-panel)"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 10 10"
      width={size}
      height={size}
      data-status={status}
      className="shrink-0"
    >
      {body[status]}
    </svg>
  );
}

/** A status: its glyph and its word (`.st`); `label` replaces the word ("Active" for running). */
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
  const labels = useStatusLabels();
  return (
    <span
      className={cx("inline-flex items-center gap-1.5 text-caption whitespace-nowrap", className)}
    >
      <StatusGlyph status={status} live={live} />
      {label ?? labels[status]}
    </span>
  );
}
