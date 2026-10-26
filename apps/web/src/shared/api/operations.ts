// Queue, execution and sync health for the Owner and Admins (platform slice 5.9): the admin
// screen's read, the audited retry of a dead job, and one execution's chain view (slice 5.18).
// Every call names its workspace (the API answers 400 to a member of several who names none),
// and every key carries it, so switching workspace never shows the other one's cached data.
import type { ApiClient, components } from "@htco/api-client";
import { queryOptions } from "@tanstack/react-query";

import { ApiError, apiError } from "./api.tsx";

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

/** Send a dead job back to the queue (audited by the server). */
export async function retryDeadJob(
  api: ApiClient,
  organizationId: string,
  jobId: string,
): Promise<void> {
  const { data, error, response } = await api.POST("/v1/operations/dead-letters/{job_id}/retry", {
    params: { path: { job_id: jobId }, query: { organization_id: organizationId } },
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

// --- Sales counters (Phase 5 activation step 2b) -------------------------------------------------

export type Execution = components["schemas"]["ExecutionView"];

/** The automation that keeps each product's sales; its rebuild recounts a shop from its orders. */
export const SALES_COUNTERS = "product-sales-counters";

export const recountKeys = {
  runs: (organizationId: string) => ["operations", organizationId, "recounts"] as const,
};

/** A run still on its way (the worker has not finished it). */
export function inFlight(execution: Execution): boolean {
  return ["queued", "running", "retry_scheduled", "waiting"].includes(execution.state);
}

/** The newest runs of the sales counters, followed every few seconds while one is on its way. */
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
    refetchInterval: (query) => ((query.state.data ?? []).some(inFlight) ? 2_000 : false),
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
