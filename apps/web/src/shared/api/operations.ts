// Queue, execution and sync health for the Owner and Admins (platform slice 5.9): the admin
// screen's read, the audited retry of a dead job, and one execution's chain view (slice 5.18).
// Every call names its workspace (the API answers 400 to a member of several who names none),
// and every key carries it, so switching workspace never shows the other one's cached data.
import type { ApiClient, components } from "@htco/api-client";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { ApiError, apiError } from "./api.tsx";
import { IDEMPOTENCY_HEADER } from "./idempotency.ts";

export type OperationsHealth = components["schemas"]["OperationsHealthView"];
export type DeadJob = OperationsHealth["dead_letters"][number];
export type ExecutionChain = components["schemas"]["ExecutionChainView"];

export const operationsKeys = {
  /** Everything operational, removed when the session ends (`forgetSession`). */
  all: ["operations"] as const,
  health: (organizationId: string) => ["operations", organizationId, "health"] as const,
  execution: (organizationId: string, id: string) =>
    ["operations", organizationId, "execution", id] as const,
};

function retry(failures: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failures < 2;
}

export function operationsHealthQuery(api: ApiClient, organizationId: string) {
  return queryOptions({
    queryKey: operationsKeys.health(organizationId),
    queryFn: async (): Promise<OperationsHealth> => {
      const { data, error, response } = await api.GET("/v1/operations/health", {
        params: { query: { organization_id: organizationId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    // The queue moves; the screen follows every half minute.
    refetchInterval: 30_000,
    retry,
  });
}

export function executionChainQuery(api: ApiClient, organizationId: string, executionId: string) {
  return queryOptions({
    queryKey: operationsKeys.execution(organizationId, executionId),
    queryFn: async (): Promise<ExecutionChain> => {
      const { data, error, response } = await api.GET("/v1/executions/{execution_id}", {
        params: {
          path: { execution_id: executionId },
          query: { organization_id: organizationId },
        },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    retry,
  });
}

/**
 * Send a dead job back to the queue (audited by the server). `key` is the press's
 * Idempotency-Key, the same when the person retries a request that failed (platform PR #223).
 */
export async function retryDeadJob(
  api: ApiClient,
  organizationId: string,
  jobId: string,
  key: string,
): Promise<void> {
  const { data, error, response } = await api.POST("/v1/operations/dead-letters/{job_id}/retry", {
    params: { path: { job_id: jobId }, query: { organization_id: organizationId } },
    headers: { [IDEMPOTENCY_HEADER]: key },
  });
  if (data === undefined) throw apiError(response, error);
}

/** Send a dead-lettered execution back to its retry (audited by the server). */
export async function retryExecution(
  api: ApiClient,
  organizationId: string,
  automationId: string,
  executionId: string,
): Promise<void> {
  const { data, error, response } = await api.POST(
    "/v1/automations/{automation_id}/executions/{execution_id}/retry",
    {
      params: {
        path: { automation_id: automationId, execution_id: executionId },
        query: { organization_id: organizationId },
      },
    },
  );
  if (data === undefined) throw apiError(response, error);
}

// --- Failed emails (platform PR #222, AC-6.4.3 and AC-6.5.6) ------------------------------------

export type FailedEmail = components["schemas"]["FailedEmailView"];
export type FailedEmailList = components["schemas"]["FailedEmailList"];
export type FailedStatus = components["schemas"]["FailedStatus"];

/** One page of the failed emails. */
export const EMAIL_FAILURES_PAGE = 25;

export const emailFailureKeys = {
  list: (organizationId: string, status: FailedStatus) =>
    ["operations", organizationId, "email-failures", status] as const,
};

/**
 * Emails refused for good (`failed`) or never sent (`skipped`), newest first: the recipient as a
 * member ID and an address the server masked (`o***@e***.test`), never the full address or the
 * body. The pages leave the cache as soon as the panel closes.
 */
export function emailFailuresQuery(api: ApiClient, organizationId: string, status: FailedStatus) {
  return infiniteQueryOptions({
    queryKey: emailFailureKeys.list(organizationId, status),
    queryFn: async ({ pageParam }): Promise<FailedEmailList> => {
      const { data, error, response } = await api.GET("/v1/operations/email-failures", {
        params: {
          query: {
            organization_id: organizationId,
            status,
            limit: EMAIL_FAILURES_PAGE,
            ...(pageParam === null ? {} : { cursor: pageParam }),
          },
        },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_cursor,
    gcTime: 0,
    retry,
  });
}

// --- Sales counters (Phase 5 activation step 2b) -------------------------------------------------

export type Execution = components["schemas"]["ExecutionView"];

/** The automation that keeps each product's sales; its rebuild recounts a shop from its orders. */
export const SALES_COUNTERS = "product-sales-counters";

export const recountKeys = {
  runs: (organizationId: string) => ["operations", organizationId, "recounts"] as const,
  /** Each shop's tracked run (shop → execution id), kept in the cache across remounts and
   * removed with the session like every `operations` key. */
  tracked: (organizationId: string) =>
    ["operations", organizationId, "recounts", "tracked"] as const,
};

/** The platform's unfinished execution states (`htco_domain.automations`): the worker has not
 * finished the run yet (quill on #73: a new run is `pending`, never "queued"). */
const IN_FLIGHT = new Set(["pending", "running", "waiting", "retry_scheduled"]);

/** A run still on its way (the worker has not finished it). */
export function inFlight(state: string | undefined): boolean {
  return state !== undefined && IN_FLIGHT.has(state);
}

/** Per shop: the run being followed, and the Idempotency-Key of a request not yet answered. */
export interface Tracked {
  runs: Record<string, string>;
  keys: Record<string, string>;
}

/** Each shop's tracked recount: a store in the query cache, never fetched. */
export function trackedRecountsQuery(organizationId: string) {
  return queryOptions({
    queryKey: recountKeys.tracked(organizationId),
    queryFn: (): Tracked => ({ runs: {}, keys: {} }),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * One recount, read by its own id (`GET /v1/executions/{id}`, the same key and cache as the
 * execution sheet) and followed every few seconds while it is on its way, so it never drops out
 * of view when newer runs push it off the list's first page (Codex on #73).
 */
export function recountRunQuery(api: ApiClient, organizationId: string, executionId: string) {
  return queryOptions({
    ...executionChainQuery(api, organizationId, executionId),
    refetchInterval: (query) => (inFlight(query.state.data?.state) ? 2_000 : false),
  });
}

/** The newest runs of the sales counters: where a shop's last run is found after a reload. */
export function recountRunsQuery(api: ApiClient, organizationId: string) {
  return queryOptions({
    queryKey: recountKeys.runs(organizationId),
    queryFn: async (): Promise<Execution[]> => {
      const { data, error, response } = await api.GET(
        "/v1/automations/{automation_id}/executions",
        {
          params: {
            path: { automation_id: SALES_COUNTERS },
            query: { organization_id: organizationId, limit: 20 },
          },
        },
      );
      if (data === undefined) throw apiError(response, error);
      return data.items;
    },
    retry,
  });
}

/**
 * Recount one shop's product sales from its stored orders (the Owner and Admins, audited by the
 * server). `key` is made once per confirm sheet, so a second press or a retry starts nothing new.
 */
export async function startRecount(
  api: ApiClient,
  organizationId: string,
  shopId: string,
  key: string,
): Promise<Execution> {
  const { data, error, response } = await api.POST("/v1/automations/{automation_id}/executions", {
    params: { path: { automation_id: SALES_COUNTERS }, header: { "Idempotency-Key": key } },
    body: { organization_id: organizationId, shop_id: shopId, payload: { rebuild: true } },
  });
  if (data === undefined) throw apiError(response, error);
  return data;
}
