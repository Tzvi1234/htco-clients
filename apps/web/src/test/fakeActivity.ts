// Invented activity records (platform slice 7.8) for tests and the `?demo=shops` screens: the
// API's shape, identifiers and template summaries only. Times are relative to `now`.
import type { components } from "@htco/api-client";

export type FakeActivity = components["schemas"]["ActivityRecordView"];

const MINUTE = 60_000;

export const DEMO_TASK = "f0000000-0000-7000-8000-0000000000a1";

function at(now: number, minutesAgo: number): string {
  return new Date(now - minutesAgo * MINUTE).toISOString();
}

export function fakeActivity(
  id: number,
  minutesAgo: number,
  changes: Partial<FakeActivity> = {},
  now: number = Date.now(),
): FakeActivity {
  const actor = changes.actor ?? "automation:etsy-order-intake";
  return {
    id: `f1000000-0000-7000-8000-${String(id).padStart(12, "0")}`,
    kind: "automation_execution",
    shop_id: null,
    actor,
    actor_kind: actor.split(":")[0] ?? "automation",
    action: "orders.ingested",
    outcome: "succeeded",
    summary: "Order 4000000001 ingested.",
    occurred_at: at(now, minutesAgo),
    correlation_id: `c-${String(id)}`,
    causation_id: null,
    task_id: null,
    ...changes,
  };
}

/** The demo: an intake run, a tracking record, a failed sync, and Shon's task with its trail. */
export function demoActivity(shopId: string | undefined, now: number = Date.now()): FakeActivity[] {
  const shop = shopId ?? null;
  return [
    fakeActivity(1, 4, { shop_id: shop }, now),
    fakeActivity(2, 18, {
      shop_id: shop, actor: "automation:tracking-sync", action: "tracking.recorded",
      summary: "Tracking recorded for order 4000000001.",
    }, now),
    fakeActivity(3, 45, {
      shop_id: shop, actor: "automation:etsy-order-intake", outcome: "failed",
      action: "orders.sync_failed", summary: "Order sync stopped: Etsy did not answer.",
    }, now),
    fakeActivity(4, 70, {
      kind: "task_execution", actor: "employee:shon", actor_kind: "employee",
      action: "tasks.completed", summary: "Task completed: reply to order question.",
      correlation_id: "c-task", task_id: DEMO_TASK,
    }, now),
    fakeActivity(5, 72, {
      kind: "approval", actor: "user:owner", actor_kind: "user", action: "approvals.decided",
      summary: "Approval granted for the reply.", correlation_id: "c-task",
    }, now),
  ]; // prettier-ignore
}
