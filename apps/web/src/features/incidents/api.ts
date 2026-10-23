// The incident center and the notification inbox (platform slices 6.3 to 6.5): the queries and
// the two writes. Every call names its workspace, so a user in several never gets a 400.
import type { ApiClient, components } from "@htco/api-client";
import { queryOptions } from "@tanstack/react-query";

import { ApiError, apiError } from "../../shared/api/api.tsx";

export type IncidentSummary = components["schemas"]["IncidentSummaryView"];
export type IncidentDetail = components["schemas"]["IncidentDetailView"];
export type HistoryEntry = components["schemas"]["HistoryEntryView"];
export type Evidence = components["schemas"]["EvidenceView"];
export type Notification = components["schemas"]["NotificationView"];
export type Inbox = components["schemas"]["InboxView"];
export type Step = components["schemas"]["TransitionRequest"]["to_state"];

/** Incidents and notifications move on their own; the screens look again every minute. */
const REFRESH_MS = 60_000;

export const incidentKeys = {
  all: ["incidents"] as const,
  list: (organizationId: string, state: "open" | "all") =>
    ["incidents", organizationId, "list", state] as const,
  one: (organizationId: string, id: string) => ["incidents", organizationId, "one", id] as const,
  order: (organizationId: string, shopId: string, receiptId: number) =>
    ["incidents", organizationId, "order", shopId, receiptId] as const,
  inbox: (organizationId: string) => ["incidents", organizationId, "inbox"] as const,
};

/** A refusal given on purpose (no role, no such incident) is not asked again. */
function retry(failures: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failures < 1;
}

export function incidentsQuery(api: ApiClient, organizationId: string, state: "open" | "all") {
  return queryOptions({
    queryKey: incidentKeys.list(organizationId, state),
    queryFn: async (): Promise<IncidentSummary[]> => {
      const { data, error, response } = await api.GET("/v1/incidents", {
        params: { query: { organization_id: organizationId, state } },
      });
      if (data === undefined) throw apiError(response, error);
      return data.items;
    },
    refetchInterval: REFRESH_MS,
    retry,
  });
}

/** More than enough for one order; an order with more is a problem of its own. */
const ORDER_INCIDENTS_LIMIT = 20;

/**
 * One order's incidents, open and resolved: the API filters by shop and receipt in its own
 * workspace, so the order sheet never loads the whole history (review of #48).
 */
export function orderIncidentsQuery(
  api: ApiClient,
  organizationId: string,
  shopId: string,
  receiptId: number,
) {
  return queryOptions({
    queryKey: incidentKeys.order(organizationId, shopId, receiptId),
    queryFn: async (): Promise<IncidentSummary[]> => {
      const { data, error, response } = await api.GET("/v1/incidents", {
        params: {
          query: {
            organization_id: organizationId,
            state: "all",
            shop_id: shopId,
            receipt_id: receiptId,
            limit: ORDER_INCIDENTS_LIMIT,
          },
        },
      });
      if (data === undefined) throw apiError(response, error);
      return data.items;
    },
    refetchInterval: REFRESH_MS,
    retry,
  });
}

export function incidentQuery(api: ApiClient, organizationId: string, id: string) {
  return queryOptions({
    queryKey: incidentKeys.one(organizationId, id),
    queryFn: async (): Promise<IncidentDetail> => {
      const { data, error, response } = await api.GET("/v1/incidents/{incident_id}", {
        params: { path: { incident_id: id }, query: { organization_id: organizationId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    refetchInterval: REFRESH_MS,
    retry,
  });
}

/** One step along the incident's machine; the API answers with the incident as it now is. */
export async function moveIncident(
  api: ApiClient,
  organizationId: string,
  id: string,
  step: Step,
): Promise<IncidentDetail> {
  const { data, error, response } = await api.POST("/v1/incidents/{incident_id}/transitions", {
    params: { path: { incident_id: id }, query: { organization_id: organizationId } },
    body: { to_state: step },
  });
  if (data === undefined) throw apiError(response, error);
  return data;
}

export function inboxQuery(api: ApiClient, organizationId: string) {
  return queryOptions({
    queryKey: incidentKeys.inbox(organizationId),
    queryFn: async (): Promise<Inbox> => {
      const { data, error, response } = await api.GET("/v1/notifications", {
        params: { query: { organization_id: organizationId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    refetchInterval: REFRESH_MS,
    retry,
  });
}

/** Marks the given notifications read, or all of the workspace's when `ids` is left out. */
export async function markRead(
  api: ApiClient,
  organizationId: string,
  ids?: string[],
): Promise<void> {
  const { error, response } = await api.POST("/v1/notifications/read", {
    params: { query: { organization_id: organizationId } },
    body: ids === undefined ? {} : { ids },
  });
  if (!response.ok) throw apiError(response, error);
}
