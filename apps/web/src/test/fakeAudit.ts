// Invented audit records and failed emails for the in-memory API (platform PR #222): what
// `GET /v1/audit-log` and `GET /v1/operations/email-failures` answer, already redacted the way
// the server redacts them (`<redacted>` values, masked addresses). Nothing here is real data.
import type { components } from "@htco/api-client";

type AuditEntry = components["schemas"]["AuditEntryView"];
type FailedEmail = components["schemas"]["FailedEmailView"];

const OWNER = "a1b2c3d4-0000-7000-8000-000000000001";
const MEMBER = "a1b2c3d4-0000-7000-8000-000000000002";

const iso = (now: number, minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
const id = (n: number) => `0a000000-0000-7000-8000-${String(n).padStart(12, "0")}`;

/** The organization's audit records, newest first, as many as `count` (older ones repeat). */
export function fakeAuditEntries(
  organizationId: string,
  shops: readonly { id: string }[],
  now = Date.now(),
  count = 9,
): AuditEntry[] {
  const shop = shops[0]?.id ?? "d0000000-0000-7000-8000-000000000001";
  const other = shops[1]?.id ?? shop;
  const base: Omit<AuditEntry, "id" | "occurred_at">[] = [
    {
      actor_kind: "user",
      actor_id: OWNER,
      action: "shop.capabilities_checked",
      entity_type: "shop",
      entity_id: shop,
      before: null,
      after: { shop_id: shop, receipts_read: "available" },
      correlation_id: "req-7f3a",
    },
    {
      actor_kind: "user",
      actor_id: OWNER,
      action: "membership.role_changed",
      entity_type: "membership",
      entity_id: "b0000000-0000-7000-8000-000000000002",
      before: { role: "support" },
      after: { role: "admin" },
      correlation_id: "req-19c0",
    },
    {
      actor_kind: "user",
      actor_id: OWNER,
      action: "relay.code_revealed",
      entity_type: "relay_item",
      entity_id: "0c000000-0000-7000-8000-000000000001",
      before: null,
      after: { shop_id: shop, tracking_code: "<redacted>" },
      correlation_id: null,
    },
    {
      actor_kind: "user",
      actor_id: OWNER,
      action: "job.dead_letter_retried",
      entity_type: "job",
      entity_id: "0b000000-0000-7000-8000-0000000000d1",
      before: { state: "dead" },
      after: { state: "queued" },
      correlation_id: "req-2b11",
    },
    {
      actor_kind: "system",
      actor_id: "maintenance",
      action: "shop.needs_reauth",
      entity_type: "shop",
      entity_id: other,
      before: { status: "connected" },
      after: { status: "needs_reauth" },
      correlation_id: null,
    },
    {
      actor_kind: "user",
      actor_id: MEMBER,
      action: "orders.exported",
      entity_type: "shop",
      entity_id: shop,
      before: null,
      after: { period: "30d", rows: 42 },
      correlation_id: "req-5e02",
    },
    {
      actor_kind: "user",
      actor_id: OWNER,
      action: "membership.created",
      entity_type: "membership",
      entity_id: "b0000000-0000-7000-8000-000000000002",
      before: null,
      after: { role: "support", email: "<redacted>" },
      correlation_id: "req-0d4c",
    },
    {
      actor_kind: "employee",
      actor_id: "eitan",
      action: "automation.execution_retried",
      entity_type: "execution",
      entity_id: "0e000000-0000-7000-8000-0000000000e2",
      before: { state: "dead_lettered" },
      after: { state: "retry_scheduled" },
      correlation_id: "corr-demo",
    },
    {
      actor_kind: "user",
      actor_id: OWNER,
      action: "organization.created",
      entity_type: "organization",
      entity_id: organizationId,
      before: null,
      after: { name: "HTCO" },
      correlation_id: null,
    },
  ];
  // Minutes ago grow with each record, so the newest is first: hours, then days.
  const steps = [3, 26, 75, 160, 600, 1500, 3000, 9000, 30000];
  return Array.from({ length: count }, (_, n) => {
    const template = base[n % base.length] as (typeof base)[number];
    const minutes = (steps[n % steps.length] ?? 0) + Math.floor(n / steps.length) * 40_000;
    return { ...template, id: id(n + 1), occurred_at: iso(now, minutes) };
  });
}

/** What the audit view's filters keep, the way the API filters (shop: its own or named). */
export function filterAudit(entries: readonly AuditEntry[], query: URLSearchParams): AuditEntry[] {
  const shop = query.get("shop_id");
  const kind = query.get("actor_kind");
  const actor = query.get("actor_id");
  const action = query.get("action");
  const since = query.get("since");
  const until = query.get("until");
  return entries.filter((entry) => {
    if (shop !== null) {
      const named = [entry.before, entry.after].some((side) => side?.["shop_id"] === shop);
      if (!(entry.entity_type === "shop" && entry.entity_id === shop) && !named) return false;
    }
    if (kind !== null && entry.actor_kind !== kind) return false;
    if (actor !== null && entry.actor_id !== actor) return false;
    if (action !== null) {
      const family = action.endsWith("*") ? action.slice(0, -1) : null;
      if (family === null ? entry.action !== action : !entry.action.startsWith(family))
        return false;
    }
    if (since !== null && Date.parse(entry.occurred_at) < Date.parse(since)) return false;
    if (until !== null && Date.parse(entry.occurred_at) >= Date.parse(until)) return false;
    return true;
  });
}

/** Emails refused for good and skipped, newest first; the address masked by the server. */
export function fakeEmailFailures(
  shops: readonly { id: string }[],
  now = Date.now(),
): FailedEmail[] {
  const shop = shops[0]?.id ?? null;
  return [
    {
      id: id(101),
      kind: "incident.opened",
      status: "failed",
      reason: "recipient_rejected",
      created_at: iso(now, 18),
      recipient_user_id: OWNER,
      recipient: "o***@e***.test",
      shop_id: shop,
      incident_id: "e0000000-0000-7000-8000-000000000001",
      receipt_id: 3_120_455_901,
    },
    {
      id: id(102),
      kind: "relay.tracking_needed",
      status: "failed",
      reason: "domain_not_verified",
      created_at: iso(now, 340),
      recipient_user_id: MEMBER,
      recipient: "s***@e***.test",
      shop_id: shop,
      incident_id: null,
      receipt_id: null,
    },
    {
      id: id(103),
      kind: "incident.opened",
      status: "skipped",
      reason: "no_verified_address",
      created_at: iso(now, 95),
      recipient_user_id: MEMBER,
      recipient: null,
      shop_id: shop,
      incident_id: "e0000000-0000-7000-8000-000000000002",
      receipt_id: null,
    },
  ];
}

/** One cursor page (the cursor is the next page's offset here). */
export function page<T>(items: readonly T[], query: URLSearchParams, fallback: number) {
  const size = Number(query.get("limit") ?? fallback);
  const from = Number(query.get("cursor") ?? 0);
  const next = from + size < items.length ? String(from + size) : null;
  return { items: items.slice(from, from + size), next_cursor: next };
}
