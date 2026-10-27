// The office's automations (platform slices 5.1 and 5.11): the reviewed registry and one
// automation's latest runs, for Admin › Automations. Their metrics, retries and dead letters
// come from the health read (operations.ts), so this file adds no second health call. Every
// call names its workspace and every key carries it, under the same "operations" root that the
// session's end removes (`forgetSession`).
import type { ApiClient, components } from "@htco/api-client";
import { queryOptions } from "@tanstack/react-query";

import { ApiError, apiError } from "./api.tsx";

export type Automation = components["schemas"]["AutomationView"];
export type AutomationRun = components["schemas"]["ExecutionView"];

export const automationKeys = {
  list: (organizationId: string) => ["operations", organizationId, "automations"] as const,
  runs: (organizationId: string, automationId: string) =>
    ["operations", organizationId, "automations", automationId, "runs"] as const,
};

/** How many of one automation's runs the details panel shows, newest first. */
export const RECENT_RUNS = 10;

function retry(failures: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failures < 2;
}

/** Every automation's current version, from the reviewed registry (`GET /v1/automations`). */
export function automationsQuery(api: ApiClient, organizationId: string) {
  return queryOptions({
    queryKey: automationKeys.list(organizationId),
    queryFn: async (): Promise<Automation[]> => {
      const { data, error, response } = await api.GET("/v1/automations", {
        params: { query: { organization_id: organizationId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data.items;
    },
    // The registry changes with a release, not by the minute.
    staleTime: 5 * 60_000,
    retry,
  });
}

/** One automation's latest runs in the workspace (`GET /v1/automations/{id}/executions`). */
export function automationRunsQuery(api: ApiClient, organizationId: string, automationId: string) {
  return queryOptions({
    queryKey: automationKeys.runs(organizationId, automationId),
    queryFn: async (): Promise<AutomationRun[]> => {
      const { data, error, response } = await api.GET(
        "/v1/automations/{automation_id}/executions",
        {
          params: {
            path: { automation_id: automationId },
            query: { organization_id: organizationId, limit: RECENT_RUNS },
          },
        },
      );
      if (data === undefined) throw apiError(response, error);
      return data.items;
    },
    refetchInterval: 30_000,
    retry,
  });
}
