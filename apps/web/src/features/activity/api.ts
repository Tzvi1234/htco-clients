// The activity query (platform slice 7.8): one page of a workspace's activity records with the
// filters the server applies, and one task's trail. Every call names its workspace.
import type { ApiClient, components } from "@htco/api-client";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { ApiError, apiError } from "../../shared/api/api.tsx";

export type ActivityRecord = components["schemas"]["ActivityRecordView"];
export type ActivityPage = components["schemas"]["ActivityPageView"];

/** What the screen asks for; empty fields are not sent. */
export interface ActivityQuery {
  actor?: string | undefined; // "automation:etsy-order-intake"
  actorKind?: "user" | "employee" | "automation" | "advisor" | "system" | undefined;
  outcome?: "succeeded" | "failed" | "denied" | "pending" | undefined;
  /** The user's day (YYYY-MM-DD) in `timezone`. */
  day?: string | undefined;
  /** From this time on (ISO), instead of a day. */
  since?: string | undefined;
  timezone: string;
  cursor?: string | undefined;
}

/** A page of 50: the list grows with "Show older" through the server's cursor. */
export const ACTIVITY_PAGE = 50;

export const activityKeys = {
  all: ["activity"] as const,
  list: (organizationId: string, query: ActivityQuery) =>
    ["activity", organizationId, "list", query] as const,
  trail: (organizationId: string, taskId: string) =>
    ["activity", organizationId, "trail", taskId] as const,
};

function retry(failures: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failures < 1;
}

export function activityQuery(api: ApiClient, organizationId: string, query: ActivityQuery) {
  return queryOptions({
    queryKey: activityKeys.list(organizationId, query),
    queryFn: async (): Promise<ActivityPage> => {
      const { data, error, response } = await api.GET("/v1/activity", {
        params: {
          query: {
            organization_id: organizationId,
            limit: ACTIVITY_PAGE,
            timezone: query.timezone,
            ...(query.actor === undefined ? {} : { actor: query.actor }),
            ...(query.actorKind === undefined ? {} : { actor_kind: query.actorKind }),
            ...(query.outcome === undefined ? {} : { outcome: query.outcome }),
            ...(query.day === undefined ? {} : { day: query.day }),
            ...(query.since === undefined ? {} : { since: query.since }),
            ...(query.cursor === undefined ? {} : { cursor: query.cursor }),
          },
        },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    placeholderData: keepPreviousData,
    retry,
  });
}

export function taskTrailQuery(api: ApiClient, organizationId: string, taskId: string) {
  return queryOptions({
    queryKey: activityKeys.trail(organizationId, taskId),
    queryFn: async (): Promise<ActivityPage> => {
      const { data, error, response } = await api.GET("/v1/tasks/{task_id}/activity", {
        params: { path: { task_id: taskId }, query: { organization_id: organizationId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    retry,
  });
}
