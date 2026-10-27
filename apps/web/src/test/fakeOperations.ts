// Invented queue, execution and sync health for the in-memory API (platform slice 5.9): what
// `GET /v1/operations/health` answers for a small shop with one dead webhook job, one
// dead-lettered execution, one stopped worker and one outbox failure.
import type { components } from "@htco/api-client";

type Health = components["schemas"]["OperationsHealthView"];
type Chain = components["schemas"]["ExecutionChainView"];

export const DEAD_JOB = "0b000000-0000-7000-8000-0000000000d1";
export const DEAD_EXECUTION_JOB = "0b000000-0000-7000-8000-0000000000d2";
export const DEAD_EXECUTION = "0e000000-0000-7000-8000-0000000000e2";
export const GOOD_EXECUTION = "0e000000-0000-7000-8000-0000000000e1";

/**
 * What the focus panel leads with: dead letters (the default), no worker running, a stale shop,
 * or everything in order. `noWorkers`: no worker has beaten at all (an empty list) while work
 * waits.
 */
export type FakeScene = "dead" | "noWorker" | "noWorkers" | "stale" | "calm";

export interface FakeOperations {
  scene: FakeScene;
  /** Dead jobs still dead (a retry removes one). */
  dead: string[];
  /** Executions sent back to their retry. */
  retriedExecutions: string[];
  /** Set: an execution retry answers only once this promise settles (a slow connection). */
  hold?: Promise<unknown>;
}

export function fakeOperations(scene: FakeScene = "dead"): FakeOperations {
  return {
    scene,
    dead: scene === "dead" ? [DEAD_JOB, DEAD_EXECUTION_JOB] : [],
    retriedExecutions: [],
  };
}

const iso = (now: number, minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

export function fakeHealth(
  organizationId: string,
  shops: readonly { id: string }[],
  ops: FakeOperations,
  now = Date.now(),
): Health {
  const shop = shops[0]?.id ?? null;
  const letters: Health["dead_letters"] = [
    {
      id: DEAD_JOB,
      kind: "etsy.webhook_event",
      shop_id: shop,
      attempts: 8,
      last_error: "MarketplaceUnavailableError",
      finished_at: iso(now, 42),
      execution_id: null,
    },
    {
      id: DEAD_EXECUTION_JOB,
      kind: "automation.execute",
      shop_id: shop,
      attempts: 5,
      last_error: "ShopBusyError",
      finished_at: iso(now, 95),
      execution_id: DEAD_EXECUTION,
    },
  ];
  return {
    organization_id: organizationId,
    generated_at: new Date(now).toISOString(),
    jobs: [
      { kind: "automation.execute", state: "queued", count: 2 },
      { kind: "automation.execute", state: "running", count: 1 },
      { kind: "etsy.order_sync", state: "retry_scheduled", count: 1 },
      ...ops.dead.map((id) => ({
        kind: id === DEAD_JOB ? "etsy.webhook_event" : "automation.execute",
        state: "dead",
        count: 1,
      })),
    ],
    dead_letters: letters.filter((l) => ops.dead.includes(l.id)),
    workers: [
      {
        worker_id: "agent-worker:7f3a",
        release: "a1b2c3d",
        started_at: iso(now, 300),
        last_beat_at: iso(now, 0.3),
        age_seconds: 18,
        alive: ops.scene !== "noWorker",
        stopping: false,
        current_job_id: null,
      },
      {
        worker_id: "agent-worker:19c0",
        release: "a1b2c3d",
        started_at: iso(now, 900),
        last_beat_at: iso(now, 27),
        age_seconds: 1620,
        alive: ops.scene === "calm",
        stopping: false,
        current_job_id: null,
      },
    ].filter(() => ops.scene !== "noWorkers"),
    shops: shops.map((s, i) => ({
      shop_id: s.id,
      resource: "orders",
      kind: "sweep",
      last_started_at: iso(now, i === 0 ? 120 : 900),
      last_succeeded_at: iso(now, i === 0 ? 119 : 899),
      last_error: i === 0 ? null : "ShopBusyError",
      drifts_last_day: i === 0 ? 1 : 0,
      drifts_total: i === 0 ? 3 : 0,
      stale: i !== 0 && ops.scene !== "calm",
    })),
    webhooks: [
      { source: "etsy", event_type: "order.paid", received_last_day: 14, unprocessed: 0 },
      { source: "etsy", event_type: "order.shipped", received_last_day: 9, unprocessed: 1 },
      { source: "etsy", event_type: "listing.updated", received_last_day: 3, unprocessed: 0 },
    ],
    executions: [
      {
        id: GOOD_EXECUTION,
        automation_id: "etsy-order-intake",
        shop_id: shop,
        state: "succeeded",
        attempts: 1,
        last_error: null,
        created_at: iso(now, 6),
        updated_at: iso(now, 6),
      },
      {
        id: DEAD_EXECUTION,
        automation_id: "etsy-order-intake",
        shop_id: shop,
        state: ops.retriedExecutions.includes(DEAD_EXECUTION) ? "retry_scheduled" : "dead_lettered",
        attempts: 5,
        last_error: "ShopBusyError",
        created_at: iso(now, 110),
        updated_at: iso(now, 95),
      },
    ].filter((e) => ops.scene === "dead" || e.id !== DEAD_EXECUTION),
    outbox_failures: [
      {
        id: "0f000000-0000-7000-8000-0000000000f1",
        destination: "events.publish",
        status: "pending",
        attempts: 2,
        last_error: "ConnectionError",
        next_attempt_at: iso(now, -3),
        action_execution_id: null,
      },
    ],
    automations: [
      {
        automation_id: "etsy-order-intake",
        executions: 212,
        succeeded: 209,
        // Only the `dead` scene has a dead-lettered run (Admin › Automations' Needs you tab).
        dead_lettered: ops.scene === "dead" ? 1 : 0,
        retries: 7,
        success_rate: "99.5",
        p50_seconds: 1.4,
        p95_seconds: 6.8,
      },
      {
        automation_id: "product-sales-counters",
        executions: 198,
        succeeded: 198,
        dead_lettered: 0,
        retries: 0,
        success_rate: "100.0",
        p50_seconds: 0.2,
        p95_seconds: 0.6,
      },
    ],
  };
}

export function fakeChain(executionId: string, ops: FakeOperations, now = Date.now()): Chain {
  const dead = executionId === DEAD_EXECUTION && !ops.retriedExecutions.includes(executionId);
  return {
    id: executionId,
    automation_id: "etsy-order-intake",
    shop_id: null,
    state: dead
      ? "dead_lettered"
      : executionId === DEAD_EXECUTION
        ? "retry_scheduled"
        : "succeeded",
    status: dead ? "failed" : "succeeded",
    correlation_id: "corr-demo",
    entries: [
      {
        kind: "trigger",
        id: "wh-1",
        at: iso(now, 110),
        name: "etsy:order.paid",
        state: null,
        status: null,
        detail: {},
      },
      {
        kind: "execution",
        id: "s-1",
        at: iso(now, 110),
        name: "pending → running",
        state: "running",
        status: "active",
        detail: {},
      },
      {
        kind: "action",
        id: "a-1",
        at: iso(now, 109),
        name: "etsy.receipts.read",
        state: "succeeded",
        status: "succeeded",
        detail: {},
      },
      dead
        ? {
            kind: "execution",
            id: "s-2",
            at: iso(now, 95),
            name: "running → dead_lettered",
            state: "dead_lettered",
            status: "failed",
            detail: {},
          }
        : {
            kind: "event",
            id: "e-1",
            at: iso(now, 6),
            name: "orders.ingested.v1",
            state: null,
            status: null,
            detail: {},
          },
    ],
  };
}

type AutomationView = components["schemas"]["AutomationView"];
type ExecutionView = components["schemas"]["ExecutionView"];

const automation = (
  id: string,
  name: string,
  primary: string,
  callable: string[],
  readiness: string,
  phase: number,
  extra: Partial<AutomationView> = {},
): AutomationView => ({
  id,
  name,
  version: 1,
  business_owner: "roni",
  primary_trigger: primary,
  callable_from: callable,
  readiness,
  activation_phase: phase,
  side_effect: "internal",
  approval_required: false,
  user_triggerable: false,
  ...extra,
});

/** What `GET /v1/automations` answers: the three live order automations and two drafts. */
export function fakeAutomations(): AutomationView[] {
  return [
    automation(
      "etsy-order-intake",
      "Etsy Order Intake",
      "event",
      ["event", "schedule", "workflow", "agent_tool"],
      "ready",
      5,
      { business_owner: "maya", side_effect: "external_read" },
    ),
    automation(
      "order-dedup-verification",
      "Order Deduplication & Verification",
      "workflow",
      ["workflow", "schedule", "agent_tool"],
      "ready",
      5,
      { business_owner: "maya" },
    ),
    automation(
      "product-sales-counters",
      "Product Sales Counters",
      "event",
      ["event", "workflow", "user_action"],
      "ready",
      5,
      { user_triggerable: true },
    ),
    automation(
      "incident-detection-escalation",
      "Incident Detection & Escalation",
      "schedule",
      ["event", "schedule", "workflow"],
      "draft",
      6,
      { business_owner: "eitan" },
    ),
    automation(
      "tracking-sync",
      "Tracking Sync",
      "schedule",
      ["schedule", "event", "workflow", "agent_tool"],
      "draft",
      6,
      { business_owner: "eitan", side_effect: "external_write", approval_required: true },
    ),
  ];
}

/** What `GET /v1/automations/{id}/executions` answers for one automation, newest first. */
export function fakeRuns(
  automationId: string,
  shops: readonly { id: string }[],
  ops: FakeOperations,
  now = Date.now(),
): ExecutionView[] {
  const shop = shops[0]?.id ?? null;
  const run = (id: string, state: string, minutesAgo: number, attempts = 1): ExecutionView => ({
    id,
    automation_id: automationId,
    automation_version: 1,
    shop_id: shop,
    trigger: "event",
    actor_kind: "system",
    actor_id: "engine",
    state,
    attempts,
    correlation_id: `corr-${id.slice(-4)}`,
    last_error: state === "dead_lettered" ? "ShopBusyError" : null,
    created_at: iso(now, minutesAgo),
    updated_at: iso(now, minutesAgo),
  });
  if (automationId === "etsy-order-intake")
    return [
      run(GOOD_EXECUTION, "succeeded", 6),
      // Only the `dead` scene has the dead-lettered run (Codex local on #72).
      ...(ops.scene === "dead"
        ? [
            run(
              DEAD_EXECUTION,
              ops.retriedExecutions.includes(DEAD_EXECUTION) ? "retry_scheduled" : "dead_lettered",
              110,
              5,
            ),
          ]
        : []),
    ];
  if (automationId === "product-sales-counters")
    return [
      run("0e000000-0000-7000-8000-0000000000e3", "succeeded", 6),
      run("0e000000-0000-7000-8000-0000000000e4", "succeeded", 48),
    ];
  return [];
}
