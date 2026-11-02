// The organization's audit records (platform PR #222, AC-3.9.3): `GET /v1/audit-log`, for the
// Owner and Admins, newest first in cursor pages. The server redacts secrets, tokens and buyer
// data before they leave it; the filters stay in the screen's state (never in the address), and
// the pages leave the cache as soon as the screen closes (`gcTime: 0`) and with the session.
import type { ApiClient, components } from "@htco/api-client";
import { infiniteQueryOptions } from "@tanstack/react-query";

import { ApiError, apiError } from "./api.tsx";

export type AuditEntry = components["schemas"]["AuditEntryView"];
export type AuditPage = components["schemas"]["AuditLogPage"];
export type ActorKind = components["schemas"]["ActorKind"];

/** The screen's filters: each one left out asks for every record. */
export interface AuditFilters {
  shopId?: string | undefined;
  actorKind?: ActorKind | undefined;
  actorId?: string | undefined;
  /** An action family as the API takes it (`membership.*`), or one exact action. */
  action?: string | undefined;
  /** Inclusive start of the window (ISO time); the end is now. */
  since?: string | undefined;
}

/** One page of the audit view. */
export const AUDIT_PAGE = 50;

export const auditKeys = {
  all: ["audit"] as const,
  list: (organizationId: string, filters: AuditFilters) =>
    ["audit", organizationId, "list", filters] as const,
};

function retry(failures: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failures < 2;
}

export function auditLogQuery(api: ApiClient, organizationId: string, filters: AuditFilters) {
  return infiniteQueryOptions({
    queryKey: auditKeys.list(organizationId, filters),
    queryFn: async ({ pageParam }): Promise<AuditPage> => {
      const { data, error, response } = await api.GET("/v1/audit-log", {
        params: {
          query: {
            organization_id: organizationId,
            limit: AUDIT_PAGE,
            ...(filters.shopId === undefined ? {} : { shop_id: filters.shopId }),
            ...(filters.actorKind === undefined ? {} : { actor_kind: filters.actorKind }),
            ...(filters.actorId === undefined ? {} : { actor_id: filters.actorId }),
            ...(filters.action === undefined ? {} : { action: filters.action }),
            ...(filters.since === undefined ? {} : { since: filters.since }),
            ...(pageParam === null ? {} : { cursor: pageParam }),
          },
        },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_cursor,
    // Records of who did what: kept only while the view is open.
    gcTime: 0,
    retry,
  });
}
