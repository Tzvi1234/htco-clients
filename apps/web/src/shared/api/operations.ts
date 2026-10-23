// Queue, execution and sync health for the Owner and Admins (platform slice 5.9): the admin
// screen's read, the audited retry of a dead job, and one execution's chain view (slice 5.18).
import type { ApiClient, components } from "@htco/api-client";
import { queryOptions } from "@tanstack/react-query";

import { ApiError, apiError } from "./api.tsx";

export type OperationsHealth = components["schemas"]["OperationsHealthView"];
export type DeadJob = OperationsHealth["dead_letters"][number];
export type ExecutionChain = components["schemas"]["ExecutionChainView"];

export const operationsKeys = {
  health: ["operations", "health"] as const,
  execution: (id: string) => ["operations", "execution", id] as const,
};

function retry(failures: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failures < 2;
}

export function operationsHealthQuery(api: ApiClient) {
  return queryOptions({
    queryKey: operationsKeys.health,
    queryFn: async (): Promise<OperationsHealth> => {
      const { data, error, response } = await api.GET("/v1/operations/health");
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    // The queue moves; the screen follows every half minute.
    refetchInterval: 30_000,
    retry,
  });
}

export function executionChainQuery(api: ApiClient, executionId: string) {
  return queryOptions({
    queryKey: operationsKeys.execution(executionId),
    queryFn: async (): Promise<ExecutionChain> => {
      const { data, error, response } = await api.GET("/v1/executions/{execution_id}", {
        params: { path: { execution_id: executionId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    retry,
  });
}

/** Send a dead job back to the queue (audited by the server). */
export async function retryDeadJob(api: ApiClient, jobId: string): Promise<void> {
  const { data, error, response } = await api.POST("/v1/operations/dead-letters/{job_id}/retry", {
    params: { path: { job_id: jobId } },
  });
  if (data === undefined) throw apiError(response, error);
}

/** Send a dead-lettered execution back to its retry (audited by the server). */
export async function retryExecution(
  api: ApiClient,
  automationId: string,
  executionId: string,
): Promise<void> {
  const { data, error, response } = await api.POST(
    "/v1/automations/{automation_id}/executions/{execution_id}/retry",
    { params: { path: { automation_id: automationId, execution_id: executionId } } },
  );
  if (data === undefined) throw apiError(response, error);
}
