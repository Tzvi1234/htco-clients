import type { components } from "@htco/api-client";

// Invented incidents and notifications for the in-memory API (`?demo=shops`, tests), shaped as
// the platform's incident center answers them (slices 6.3 to 6.5). The incident machine below is
// the platform's (`htco_domain.incidents.INCIDENT_TRANSITIONS`), with the steps a person may take
// (never `detected`, never `resolved`: an incident resolves on evidence only).

export type FakeIncident = components["schemas"]["IncidentDetailView"];
export type FakeNotification = components["schemas"]["NotificationView"];

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const MACHINE: Record<string, readonly string[]> = {
  detected: ["triaged", "verifying", "escalated"],
  triaged: ["investigating", "verifying", "escalated"],
  investigating: ["remediation_proposed", "verifying", "escalated"],
  remediation_proposed: [
    "auto_remediating",
    "approval_required",
    "developer_required",
    "escalated",
  ],
  auto_remediating: ["verifying", "escalated"],
  approval_required: ["verifying", "escalated"],
  developer_required: ["verifying", "escalated"],
  verifying: ["resolved", "investigating", "escalated"],
  escalated: ["triaged", "investigating", "verifying"],
  resolved: [],
};

/** Every state the machine allows from `state`, sorted as the API sorts them. */
export function machineSteps(state: string): string[] {
  return [...(MACHINE[state] ?? [])].sort();
}

/** The steps a person may take from `state` (the API's `next_states` for a role that may update). */
export function personSteps(state: string): string[] {
  return machineSteps(state).filter((s) => s !== "resolved" && s !== "detected");
}

const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

/** One incident; `canUpdate` follows the role (the API computes it per caller). */
export function fakeIncident(
  overrides: Partial<FakeIncident> & { id: string },
  canUpdate = true,
): FakeIncident {
  const state = overrides.state ?? "detected";
  const detectedAt = overrides.detected_at ?? iso(2 * DAY);
  return {
    shop_id: null,
    receipt_id: null,
    cause: "tracking_missing",
    severity: "medium",
    state,
    is_open: state !== "resolved",
    source: "sla_inspector",
    detected_at: detectedAt,
    updated_at: detectedAt,
    resolved_at: null,
    details: {},
    history: [
      {
        from_state: null,
        to_state: "detected",
        actor_kind: "automation",
        actor_id: "incident-detection",
        at: detectedAt,
        note: null,
        evidence: null,
      },
    ],
    can_update: canUpdate,
    next_states: canUpdate ? personSteps(state) : [],
    ...overrides,
  };
}

/** The shop demo's incidents: three open (one high, one escalated), one resolved on evidence. */
export function demoIncidents(shopIds: readonly string[]): FakeIncident[] {
  const [a = null, b = null] = shopIds;
  return [
    fakeIncident({
      id: "e0000000-0000-7000-8000-000000000001",
      shop_id: a,
      receipt_id: 3412880131,
      cause: "tracking_mismatch",
      severity: "high",
      state: "investigating",
      source: "tracking_relay",
      detected_at: iso(26 * HOUR),
      updated_at: iso(5 * HOUR),
      history: [
        {
          from_state: null,
          to_state: "detected",
          actor_kind: "automation",
          actor_id: "tracking-relay",
          at: iso(26 * HOUR),
          note: null,
          evidence: null,
        },
        {
          from_state: "detected",
          to_state: "triaged",
          actor_kind: "user",
          actor_id: "a1b2c3d4-0000-7000-8000-000000000001",
          at: iso(20 * HOUR),
          note: "carrier_number_differs",
          evidence: null,
        },
        {
          from_state: "triaged",
          to_state: "investigating",
          actor_kind: "user",
          actor_id: "a1b2c3d4-0000-7000-8000-000000000001",
          at: iso(5 * HOUR),
          note: null,
          evidence: null,
        },
      ],
    }),
    fakeIncident({
      id: "e0000000-0000-7000-8000-000000000002",
      shop_id: a,
      receipt_id: 3412880117,
      cause: "tracking_missing",
      severity: "medium",
      state: "detected",
      detected_at: iso(3 * DAY + 4 * HOUR),
    }),
    fakeIncident({
      id: "e0000000-0000-7000-8000-000000000003",
      shop_id: b,
      receipt_id: null,
      cause: "automation_dead_lettered",
      severity: "critical",
      state: "escalated",
      source: "automation_engine",
      detected_at: iso(9 * HOUR),
      updated_at: iso(4 * HOUR),
      details: { automation_id: "tracking-synchronization", attempts: 5 },
      history: [
        {
          from_state: null,
          to_state: "detected",
          actor_kind: "automation",
          actor_id: "automation-engine",
          at: iso(9 * HOUR),
          note: null,
          evidence: null,
        },
        {
          from_state: "detected",
          to_state: "escalated",
          actor_kind: "system",
          actor_id: "escalation",
          at: iso(4 * HOUR),
          note: null,
          evidence: null,
        },
      ],
    }),
    fakeIncident({
      id: "e0000000-0000-7000-8000-000000000004",
      shop_id: a,
      receipt_id: 3412880102,
      cause: "tracking_missing",
      severity: "medium",
      state: "resolved",
      detected_at: iso(6 * DAY),
      updated_at: iso(5 * DAY),
      resolved_at: iso(5 * DAY),
      history: [
        {
          from_state: null,
          to_state: "detected",
          actor_kind: "automation",
          actor_id: "incident-detection",
          at: iso(6 * DAY),
          note: null,
          evidence: null,
        },
        {
          from_state: "detected",
          to_state: "verifying",
          actor_kind: "automation",
          actor_id: "tracking-synchronization",
          at: iso(5 * DAY),
          note: null,
          evidence: {
            kind: "tracking_present",
            source: "etsy_receipt",
            reference: "TE-88213",
            observed_at: iso(5 * DAY),
          },
        },
        {
          from_state: "verifying",
          to_state: "resolved",
          actor_kind: "automation",
          actor_id: "tracking-synchronization",
          at: iso(5 * DAY),
          note: null,
          evidence: {
            kind: "tracking_present",
            source: "etsy_receipt",
            reference: "TE-88213",
            observed_at: iso(5 * DAY),
          },
        },
      ],
    }),
  ];
}

/** One notification, unread unless `read_at` says otherwise. */
export function fakeNotification(
  overrides: Partial<FakeNotification> & { id: string; kind: string },
): FakeNotification {
  return {
    params: {},
    shop_id: null,
    incident_id: null,
    created_at: iso(HOUR),
    read_at: null,
    ...overrides,
  };
}

/** The shop demo's notifications: two unread incident ones, then older read ones. */
export function demoNotifications(shopIds: readonly string[]): FakeNotification[] {
  const [a = null, b = null] = shopIds;
  return [
    fakeNotification({
      id: "f0000000-0000-7000-8000-000000000001",
      kind: "incident_opened",
      shop_id: b,
      incident_id: "e0000000-0000-7000-8000-000000000003",
      params: {
        cause: "automation_dead_lettered",
        severity: "critical",
        incident_id: "e0000000-0000-7000-8000-000000000003",
      },
      created_at: iso(9 * HOUR),
    }),
    fakeNotification({
      id: "f0000000-0000-7000-8000-000000000002",
      kind: "incident_opened",
      shop_id: a,
      incident_id: "e0000000-0000-7000-8000-000000000001",
      params: {
        cause: "tracking_mismatch",
        severity: "high",
        receipt_id: "3412880131",
        incident_id: "e0000000-0000-7000-8000-000000000001",
      },
      created_at: iso(26 * HOUR),
    }),
    fakeNotification({
      id: "f0000000-0000-7000-8000-000000000003",
      kind: "alert_ship_by",
      shop_id: a,
      params: { receipt_id: "3412880140", ship_by: "2026-10-25" },
      created_at: iso(2 * DAY),
      read_at: iso(DAY),
    }),
    fakeNotification({
      id: "f0000000-0000-7000-8000-000000000004",
      kind: "sign_in_new_device",
      params: { device: "Chrome on Windows" },
      created_at: iso(3 * DAY),
      read_at: iso(3 * DAY),
    }),
    fakeNotification({
      id: "f0000000-0000-7000-8000-000000000005",
      kind: "incident_resolved",
      shop_id: a,
      incident_id: "e0000000-0000-7000-8000-000000000004",
      params: {
        cause: "tracking_missing",
        receipt_id: "3412880102",
        incident_id: "e0000000-0000-7000-8000-000000000004",
      },
      created_at: iso(5 * DAY),
      read_at: iso(5 * DAY),
    }),
  ];
}
