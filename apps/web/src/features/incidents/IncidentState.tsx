import { useLingui } from "@lingui/react/macro";

import { cx } from "../../shared/lib/cx.ts";
import { Dot, Status, type AgentStatus, type DotTone } from "../../shared/ui/kit/index.ts";

// The words and marks of an incident (platform slice 6.5): its state as the kit's status glyph
// plus its word (AC-6.5.1: never colour alone), its severity as a dot plus its word, and the
// names of causes, evidence and actors in the user's language.

/** The platform's incident states, in the machine's order (`htco_domain.incidents`). */
export const INCIDENT_STATES = [
  "detected",
  "triaged",
  "investigating",
  "remediation_proposed",
  "auto_remediating",
  "approval_required",
  "developer_required",
  "verifying",
  "resolved",
  "escalated",
] as const;

export type IncidentStateId = (typeof INCIDENT_STATES)[number];

/**
 * Each state's glyph from the kit (kit/status.tsx), so its shape carries the meaning as well as
 * its colour: new is a dashed ring, sorted an empty ring, work in hand a filled dot, a fix that
 * needs the owner the orange halo, waiting on someone else the half disc, escalated the ink
 * square, and resolved the filled check.
 */
const GLYPH: Record<IncidentStateId, AgentStatus> & Partial<Record<string, AgentStatus>> = {
  detected: "queued",
  triaged: "idle",
  investigating: "running",
  remediation_proposed: "waityou",
  auto_remediating: "running",
  approval_required: "waityou",
  developer_required: "waitext",
  verifying: "waitext",
  resolved: "delivered",
  escalated: "blocked",
};

export function useIncidentWords() {
  const { t } = useLingui();
  const states: Partial<Record<string, string>> = {
    detected: t({ message: "Detected", context: "incident state" }),
    triaged: t({ message: "Triaged", context: "incident state" }),
    investigating: t({ message: "Investigating", context: "incident state" }),
    remediation_proposed: t({ message: "Fix proposed", context: "incident state" }),
    auto_remediating: t({ message: "Fixing automatically", context: "incident state" }),
    approval_required: t({ message: "Needs approval", context: "incident state" }),
    developer_required: t({ message: "Needs a developer", context: "incident state" }),
    verifying: t({ message: "Verifying", context: "incident state" }),
    resolved: t({ message: "Resolved", context: "incident state" }),
    escalated: t({ message: "Escalated", context: "incident state" }),
  };
  const causes: Partial<Record<string, string>> = {
    tracking_missing: t`Tracking missing`,
    sync_drift: t`Out of sync with Etsy`,
    tracking_mismatch: t`Tracking mismatch`,
    automation_dead_lettered: t`Automation gave up`,
  };
  const severities: Partial<Record<string, string>> = {
    low: t({ message: "Low", context: "severity" }),
    medium: t({ message: "Medium", context: "severity" }),
    high: t({ message: "High", context: "severity" }),
    critical: t({ message: "Critical", context: "severity" }),
  };
  const evidence: Partial<Record<string, string>> = {
    tracking_present: t`Tracking found in Etsy`,
    order_closed: t`The order was cancelled or refunded`,
    drift_cleared: t`Etsy and HTCO agree again`,
  };
  const sources: Partial<Record<string, string>> = {
    etsy_receipt: t`Etsy receipt`,
    reconciliation: t`Reconciliation`,
    sla_inspector: t`Shipping window check`,
    tracking_relay: t`Tracking relay`,
    automation_engine: t`Automations`,
  };
  return {
    state: (state: string): string => states[state] ?? state,
    cause: (cause: string): string => causes[cause] ?? t`Incident`,
    severity: (severity: string): string => severities[severity] ?? severity,
    evidence: (kind: string): string => evidence[kind] ?? kind,
    source: (source: string): string => sources[source] ?? source,
  };
}

/** An incident's state: the kit's status glyph and the state's word (AC-6.5.1). */
export function IncidentState({ state, className }: { state: string; className?: string }) {
  const words = useIncidentWords();
  const glyph = GLYPH[state] ?? "idle";
  return (
    <Status
      status={glyph}
      label={words.state(state)}
      {...(className === undefined ? {} : { className })}
    />
  );
}

// One emphasis colour: orange marks what needs him (high and critical; the word and the weight
// tell them apart), everything else is quiet (Pixel's review of #48: no red beside orange).
const SEVERITY_TONE: Partial<Record<string, DotTone>> = {
  critical: "attention",
  high: "attention",
  medium: "muted",
  low: "muted",
};

/** The severity's rank, most urgent first (for "open the most urgent"). */
export const SEVERITY_RANK: Partial<Record<string, number>> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** An incident's severity: a dot and its word; high and critical are set heavier too. */
export function Severity({ severity }: { severity: string }) {
  const words = useIncidentWords();
  const urgent = severity === "critical" || severity === "high";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 text-caption whitespace-nowrap",
        urgent ? "font-medium text-primary" : "text-secondary",
      )}
    >
      <Dot tone={SEVERITY_TONE[severity] ?? "muted"} className="size-2" />
      {words.severity(severity)}
    </span>
  );
}
