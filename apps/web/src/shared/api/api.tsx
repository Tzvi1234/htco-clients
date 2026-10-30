import { createApiClient, type ApiClient, type components } from "@htco/api-client";
import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { createContext, use, type ReactNode } from "react";

export type SessionView = components["schemas"]["SessionView"];
export type Me = components["schemas"]["Me"];
export type MfaView = components["schemas"]["MfaView"];
export type SessionItem = components["schemas"]["SessionItem"];

/**
 * A failed API call; `type` is the problem type's last segment (`sign-in-refused`). `reason`
 * is the problem's own reason when it has one: `shop-not-connected` says `needs_reauth`
 * (reconnect the shop), `disconnected` or `not_connected`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly type: string | undefined;
  readonly reason: string | undefined;

  constructor(status: number, type: string | undefined, reason?: string) {
    super(`API error ${String(status)}${type === undefined ? "" : ` (${type})`}`);
    this.status = status;
    this.type = type;
    this.reason = reason;
  }
}

export function apiError(response: Response, body: unknown): ApiError {
  const problem = typeof body === "object" && body !== null ? body : {};
  const type =
    "type" in problem && typeof problem.type === "string"
      ? problem.type.split("/").at(-1)
      : undefined;
  const reason =
    "reason" in problem && typeof problem.reason === "string" ? problem.reason : undefined;
  return new ApiError(response.status, type, reason);
}

/** The shop's connection must be renewed: the API says so, or answers a shop-not-connected. */
export function needsReconnecting(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.type === "shop-not-connected" &&
    error.reason !== "disconnected"
  );
}

const ApiContext = createContext<ApiClient | undefined>(undefined);

export function ApiProvider({ client, children }: { client: ApiClient; children: ReactNode }) {
  return <ApiContext value={client}>{children}</ApiContext>;
}

export function useApi(): ApiClient {
  const client = use(ApiContext);
  if (client === undefined) throw new Error("useApi needs an ApiProvider");
  return client;
}

export { createApiClient, type ApiClient };

export const authKeys = {
  session: ["auth", "session"] as const,
  me: ["auth", "me"] as const,
  mfa: ["auth", "mfa"] as const,
  sessions: ["auth", "sessions"] as const,
};

/**
 * Forget everything of the session that ended: every cached answer belongs to that user and role
 * (shops, members, orders with buyer details, incidents, notifications, the operations health of
 * the Owner and Admins), and every mutation holds what was submitted and what came back (an
 * invitation's link, an authenticator's enrolment), so none may reach the next user on this tab
 * (Codex reviews of #35, #60 and #62; Sage's security review of #48; Quill's review of #62).
 * In-flight reads are cancelled first, so a late answer cannot land in the next session's cache;
 * a mutation still in flight loses its callbacks, so its answer reaches nobody.
 */
export function forgetSession(client: QueryClient): void {
  void client.cancelQueries();
  client.removeQueries();
  const mutations = client.getMutationCache();
  // A mutation still in flight keeps running: strip its callbacks first, so its late answer
  // runs no onSuccess or onSettled and writes nothing into the next session (local Codex review
  // of #62). The answer then lands on a mutation that nothing holds any more.
  for (const mutation of mutations.getAll())
    if (mutation.state.status === "pending")
      mutation.setOptions(
        mutation.options.mutationFn === undefined
          ? {}
          : { mutationFn: mutation.options.mutationFn },
      );
  mutations.clear();
}

/**
 * The `meta` of a mutation that runs without a session (sign-in, an invitation, a password
 * reset): its 401 refuses what was typed or the link, it does not end a session.
 */
export const PUBLIC_AUTH = { publicAuth: true } as const;

/**
 * True when a failed call proves the session ended (expired, revoked elsewhere): a 401 from an
 * authenticated call. A 401 that refuses a credential the user just gave (`mfa-code-refused` on a
 * step-up, `etsy-authorization-refused` on the Etsy callback) is an answer about that credential,
 * and a public auth mutation's 401 never is about a session (Codex post-merge review, finding 1).
 */
export function sessionEnded(error: unknown, meta?: Record<string, unknown>): boolean {
  if (!(error instanceof ApiError) || error.status !== 401) return false;
  if (meta?.["publicAuth"] === true) return false;
  return !(error.type?.endsWith("-refused") ?? false);
}

/** Who is signed in on this browser; `null` when nobody is. */
export function sessionQuery(api: ApiClient) {
  return queryOptions({
    queryKey: authKeys.session,
    queryFn: async (): Promise<SessionView | null> => {
      const { data, error, response } = await api.GET("/v1/auth/session");
      if (response.status === 401) return null;
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    staleTime: 30_000,
  });
}

export function meQuery(api: ApiClient) {
  return queryOptions({
    queryKey: authKeys.me,
    queryFn: async (): Promise<Me> => {
      const { data, error, response } = await api.GET("/v1/me");
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    staleTime: 30_000,
  });
}

export function mfaQuery(api: ApiClient) {
  return queryOptions({
    queryKey: authKeys.mfa,
    queryFn: async (): Promise<MfaView> => {
      const { data, error, response } = await api.GET("/v1/auth/mfa");
      if (data === undefined) throw apiError(response, error);
      return data;
    },
  });
}

export function sessionsQuery(api: ApiClient) {
  return queryOptions({
    queryKey: authKeys.sessions,
    queryFn: async (): Promise<SessionItem[]> => {
      const { data, error, response } = await api.GET("/v1/auth/sessions");
      if (data === undefined) throw apiError(response, error);
      return data.items;
    },
  });
}

/** Owners and Admins must sign in with their second factor (FR-IAM-02, AC-3.5.3). */
export function needsSecondFactor(me: Me, session: SessionView): boolean {
  const privileged = me.memberships.some((m) => m.role === "owner" || m.role === "admin");
  return privileged && session.assurance !== "aal2";
}

/** Only same-site paths are followed after sign-in, never `//host` or absolute URLs. */
export function safeRedirect(target: unknown): string {
  return typeof target === "string" && /^\/(?!\/)/.test(target) && !target.includes("\\")
    ? target
    : "/";
}

export type ShopView = components["schemas"]["ShopView"];
export type IntegrationView = components["schemas"]["IntegrationView"];
export type CapabilityView = components["schemas"]["CapabilityView"];

export const shopKeys = {
  all: ["shops"] as const,
  list: (organizationId: string) => ["shops", organizationId] as const,
  integrations: (organizationId: string) => ["shops", organizationId, "integrations"] as const,
};

/** Every shop of the organization the user may see, following the API's pages. */
export function shopsQuery(api: ApiClient, organizationId: string) {
  async function page(cursor: string | null): Promise<components["schemas"]["ShopList"]> {
    const { data, error, response } = await api.GET("/v1/shops", {
      params: {
        query: { organization_id: organizationId, ...(cursor === null ? {} : { cursor }) },
      },
    });
    if (data === undefined) throw apiError(response, error);
    return data;
  }
  return queryOptions({
    queryKey: shopKeys.list(organizationId),
    queryFn: async (): Promise<ShopView[]> => {
      const shops: ShopView[] = [];
      let cursor: string | null = null;
      do {
        const next = await page(cursor);
        shops.push(...next.items);
        cursor = next.next_cursor;
      } while (cursor !== null);
      return shops;
    },
  });
}

/** Each shop's marketplace connection: status, scopes and token health, never a token. */
export function integrationsQuery(api: ApiClient, organizationId: string) {
  return queryOptions({
    queryKey: shopKeys.integrations(organizationId),
    queryFn: async (): Promise<IntegrationView[]> => {
      const { data, error, response } = await api.GET("/v1/shop-integrations", {
        params: { query: { organization_id: organizationId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data.items;
    },
  });
}
