import { createApiClient, type ApiClient, type components } from "@htco/api-client";

import { personSteps, type FakeIncident, type FakeNotification } from "./fakeIncidents.ts";
import {
  DEAD_EXECUTION,
  DEAD_EXECUTION_JOB,
  fakeAutomations,
  fakeChain,
  fakeHealth,
  fakeOperations,
  fakeRuns,
  type FakeOperations,
} from "./fakeOperations.ts";
import { fakeShopData, type FakePeriod } from "./fakeShopData.ts";

type IntegrationView = components["schemas"]["IntegrationView"];
type CapabilityView = components["schemas"]["CapabilityView"];

/** The rebuilds started: each request's key and body, and each execution's state. */
export interface FakeRecounts {
  started: { key: string | null; body: unknown; workspace: string }[];
  executions: Map<string, { state: string; shop_id: string; key: string }>;
  /** Moves every unfinished rebuild (`pending` or `running`, the platform's words) on. */
  finish: (state: string) => void;
}

function fakeRecounts(): FakeRecounts {
  const executions = new Map<string, { state: string; shop_id: string; key: string }>();
  return {
    started: [],
    executions,
    finish: (state) => {
      for (const execution of executions.values())
        if (execution.state === "pending" || execution.state === "running") execution.state = state;
    },
  };
}

/** The API's sign-in, MFA and identity endpoints in memory, for the web app's tests. */
export interface FakeBackend {
  client: ApiClient;
  state: FakeState;
  requests: Request[];
}

export interface FakeState {
  signedIn: boolean;
  assurance: "aal1" | "aal2";
  enrolled: boolean;
  role: "owner" | "admin" | "support" | "developer" | "viewer";
  password: string;
  failures: number;
  sessions: { id: string; current: boolean; revoked: boolean }[];
  members: {
    id: string;
    user_id: string;
    display_name: string | null;
    role: string;
    /** The shops granted to the member (Owners and Admins see every shop anyway). */
    shop_ids?: string[];
  }[];
  invited: { email: unknown; role: unknown }[];
  inviteLink: string;
  /** False: signed in, but not a member of any organization (403 no-membership). */
  member: boolean;
  /** True: changing a member answers 403 mfa-required (the session lost its second factor). */
  memberChangesRefused?: boolean;
  /** True: sign-out fails with 503 and the session stays. */
  signOutFails: boolean;
  /** Extra organizations the user is Owner of, by ID. */
  otherOrgs: string[];
  accepted?: Record<string, unknown>;
  /** True: the members list never answers (a slow read, to see what renders meanwhile). */
  membersHang?: boolean;
  /** Emails a password reset link was asked for (the same answer for any email). */
  resetRequests: unknown[];
  /** True: asking for a reset link answers 429. */
  resetThrottled: boolean;
  /** True: the user has an authenticator app, so the reset needs its code. */
  resetNeedsCode: boolean;
  reset?: Record<string, unknown>;
  /** The organization's shops and their Etsy connections. */
  shops: { id: string; name: string; status: string }[];
  integrations: IntegrationView[];
  /** "fail": connection details answer 500; "hang": they never answer. */
  integrationsTrouble?: "fail" | "hang" | undefined;
  /** True once the user confirmed a code in the last ten minutes (POST /v1/auth/step-up). */
  steppedUp: boolean;
  /** Where `POST /v1/shops/etsy/connect` sends the browser. */
  authorizationUrl: string;
  /** True: Etsy is unavailable (503 etsy-unavailable) when starting a connection. */
  etsyDown: boolean;
  /** A problem slug the Etsy callback answers with instead of connecting. */
  callbackProblem?: string;
  /** The bodies the Etsy callback received, in order. */
  callbacks: unknown[];
  /** Shops re-checked (`POST …/capability-checks`) and disconnected, in order. */
  rechecks: string[];
  disconnects: string[];
  /** Shops removed with `DELETE /v1/shops/{shop_id}`. */
  removals: string[];
  /** True: a re-check answers 429 capability-check-too-soon (Retry-After 30). */
  recheckTooSoon: boolean;
  /**
   * The shops' live Etsy data (`GET /v1/shops/{id}/overview|orders|…`): "unavailable" answers
   * 503 etsy-data-unavailable, "stale" marks the data stale, "quiet" is a shop without orders,
   * "hang" never answers, "history" is a shop whose orders are all older than 30 days (the
   * owner's live shop), "partial" says a read was cut at its cap.
   */
  liveTrouble?:
    | "unavailable"
    | "stale"
    | "quiet"
    | "hang"
    | "partial"
    | "no-sales"
    | "truncated"
    | "history"
    | undefined;
  /** Workspaces whose shop list answers 500. */
  shopsFailFor?: string[];
  /** Shops whose statistics (`GET /v1/shops/{id}/stats`) answer 503 etsy-data-unavailable. */
  statsFailFor?: string[];
  /** True: the shops are busy, 160 orders in 30 days (more than one page of 100). */
  liveBusy?: boolean;
  /** The organization's incidents (`GET /v1/incidents`), newest first as the API sends them. */
  incidents: FakeIncident[];
  /** "fail": the incident center answers 503 incidents-unavailable; "hang": it never answers;
   * "forbidden": the role may not view incidents (403). */
  incidentsTrouble?: "fail" | "hang" | "forbidden" | undefined;
  /** Workspaces whose incident center answers 503 incidents-unavailable (the others as usual). */
  incidentsFailFor?: string[] | undefined;
  /** How many incidents one page of `GET /v1/incidents` holds (the API's `limit`, 200). */
  incidentPageSize?: number | undefined;
  /** Incidents (by id) that belong to another workspace; the rest are the first workspace's. */
  incidentWorkspaces?: Record<string, string> | undefined;
  /** Notifications (by id) that belong to another workspace; the rest are the first's. */
  notificationWorkspaces?: Record<string, string> | undefined;
  /** A 409 problem the next incident step answers with instead of moving it. */
  stepProblem?: "illegal-incident-step" | "evidence-required" | "incident-moved" | undefined;
  /** The steps asked for (`POST /v1/incidents/{id}/transitions`), in order. */
  steps: { id: string; to_state: unknown; note: unknown }[];
  /** The user's notifications (`GET /v1/notifications`), newest first. */
  notifications: FakeNotification[];
  /** "fail": the notifications answer 503 incidents-unavailable. */
  notificationsTrouble?: "fail" | undefined;
  /** Workspaces whose notifications answer 503 (the others answer as usual). */
  notificationsFailFor?: string[] | undefined;
  /** "fail": `POST /v1/notifications/read` answers 503. */
  readTrouble?: "fail" | undefined;
  /** The query strings of `GET /v1/incidents`, in order (which workspace, shop and order). */
  incidentLists: string[];
  /** The sales counters' rebuilds (`POST /v1/automations/product-sales-counters/executions`). */
  recounts: FakeRecounts;
  /** True: the server makes the run but its answer is lost (a 503 after the insert). */
  recountLoseAnswer?: boolean | undefined;
  /** True: newer runs push the rebuilds off the list's first page (it lists none). */
  recountListHides?: boolean | undefined;
  /** True: the counters are still a draft, so the engine refuses the run (409). */
  recountRefused?: boolean | undefined;
  /** True: the recount answers 409 idempotency-in-progress (its first request is still being
   * handled, and has made the run). */
  recountInProgress?: boolean | undefined;
  /** True: reading an execution (`GET /v1/executions/{id}`) answers 503 for now. */
  executionReadFails?: boolean | undefined;
  /** The bodies of `POST /v1/notifications/read`, in order. */
  reads: unknown[];
  /** The workspace of each `POST /v1/notifications/read`, in the same order as `reads`. */
  readWorkspaces: string[];
  /**
   * True: orders, Home's sales and the statistics come from the stored order history (slice
   * 5.6), synced four minutes ago (40 with "stale"); one order comes with its status timeline.
   * False or unset: read live from Etsy, as before the history is complete.
   */
  orderStore?: boolean;
  /** The Orders screen's bulk actions (slice 5.7): each export's body, each re-sync's IDs. */
  exports: unknown[];
  resyncs: number[][];
  /** The queue, execution and sync health (Admin › Health, slice 5.9) and its retries. */
  operations: FakeOperations;
  /** "fail": `GET /v1/operations/health` answers 503 (the registry and the runs still answer). */
  healthTrouble?: "fail" | undefined;
  /** True: automations are not set up on this server (503 automations-unavailable). */
  automationsOff?: boolean;
}

const PROBLEMS = "https://ht-co.app/problems/";

function json(status: number, body: unknown): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": status >= 400 ? "application/problem+json" : "application/json" },
  });
}

const CALLBACK_STATUS: Record<string, number> = {
  "etsy-state-rejected": 400,
  "etsy-authorization-refused": 400,
  "etsy-unreachable": 502,
  "etsy-no-shop": 409,
  "etsy-shop-connected-elsewhere": 409,
  "web-session-required": 403,
  "etsy-unavailable": 503,
};

const DAY = 86_400_000;

/** What the read-only probes found for a healthy shop whose buyer addresses Etsy shares. */
export function fakeCapabilities(
  checkedAt: string,
  overrides: Partial<Record<CapabilityView["capability"], [CapabilityView["state"], string]>> = {},
): CapabilityView[] {
  const found: Record<CapabilityView["capability"], [CapabilityView["state"], string]> = {
    granted_scopes: ["available", "verified_by_reads"],
    shop_details: ["available", "read_ok"],
    receipts_read: ["available", "read_ok"],
    buyer_address: ["available", "address_fields_present"],
    listings_read: ["available", "read_ok"],
    webhooks: ["unavailable", "not_configured"],
    shipment_write: ["unknown", "no_safe_probe"],
    ...overrides,
  };
  return Object.entries(found).map(([capability, [state, detail]]) => ({
    capability: capability as CapabilityView["capability"],
    state,
    detail,
    checked_at: checkedAt,
  }));
}

/** An Etsy connection in the given health; "expiring" runs out in five days. */
export function fakeIntegration(
  shopId: string,
  health: IntegrationView["token_health"],
  overrides: Partial<IntegrationView> = {},
): IntegrationView {
  const now = Date.now();
  const status: IntegrationView["status"] =
    health === "needs_reauth"
      ? "needs_reauth"
      : health === "disconnected"
        ? "disconnected"
        : "connected";
  return {
    shop_id: shopId,
    provider: "etsy",
    status,
    etsy_shop_id: 41_870_022,
    scopes: ["shops_r", "transactions_r", "listings_r"],
    token_health: health,
    access_expires_at: new Date(now + 3_600_000).toISOString(),
    // Half a day short of whole days, so the count of days left is stable while a test runs.
    refresh_expires_at: new Date(now + (health === "expiring" ? 4.5 : 80) * DAY).toISOString(),
    failure_count: health === "needs_reauth" ? 3 : 0,
    last_successful_call_at: new Date(now - 4 * 60_000).toISOString(),
    connected_at: "2026-10-01T09:00:00Z",
    updated_at: "2026-10-15T09:00:00Z",
    disconnected_at: null,
    purge_after: null,
    capabilities:
      health === "disconnected" ? [] : fakeCapabilities(new Date(now - 4 * 60_000).toISOString()),
    ...overrides,
  };
}

/** `?demo=shops`: four shops, one in each connection state, for reviewing the shop cards. */
export function demoShops(): Pick<FakeState, "shops" | "integrations"> {
  const shops = [
    { id: "d0000000-0000-7000-8000-000000000001", name: "Willow & Wick", status: "active" },
    { id: "d0000000-0000-7000-8000-000000000002", name: "Linen Lane Studio", status: "active" },
    { id: "d0000000-0000-7000-8000-000000000003", name: "Paper Fox Prints", status: "active" },
    { id: "d0000000-0000-7000-8000-000000000004", name: "Old Harbor Goods", status: "active" },
  ];
  const [a, b, c, d] = shops.map((shop) => shop.id) as [string, string, string, string];
  return {
    shops,
    integrations: [
      fakeIntegration(a, "ok"),
      fakeIntegration(b, "expiring", {
        etsy_shop_id: 39_002_114,
        capabilities: fakeCapabilities(new Date(Date.now() - 4 * 60_000).toISOString(), {
          buyer_address: ["unavailable", "address_fields_hidden"],
        }),
      }),
      fakeIntegration(c, "needs_reauth", {
        etsy_shop_id: 50_331_907,
        last_successful_call_at: new Date(Date.now() - 2 * DAY).toISOString(),
      }),
      fakeIntegration(d, "disconnected", {
        etsy_shop_id: 28_640_515,
        scopes: [],
        last_successful_call_at: null,
        disconnected_at: new Date(Date.now() - 2 * DAY).toISOString(),
        purge_after: new Date(Date.now() + 28 * DAY).toISOString(),
      }),
    ],
  };
}

function problem(status: number, type: string, extra: Record<string, string> = {}): Response {
  return json(status, {
    type: PROBLEMS + type,
    title: type,
    status,
    detail: type,
    request_id: "r",
    ...extra,
  });
}

/** 409 shop-not-connected with its reason, as the API answers it. */
function notConnected(integration: IntegrationView): Response {
  return problem(409, "shop-not-connected", {
    reason: integration.status === "disconnected" ? "disconnected" : "needs_reauth",
  });
}

export function fakeBackend(initial: Partial<FakeState> = {}): FakeBackend {
  const state: FakeState = {
    signedIn: false,
    assurance: "aal1",
    enrolled: false,
    role: "owner",
    password: "correct horse battery",
    failures: 0,
    sessions: [
      { id: "11111111-1111-7111-8111-111111111111", current: true, revoked: false },
      { id: "22222222-2222-7222-8222-222222222222", current: false, revoked: false },
    ],
    members: [
      {
        id: "b0000000-0000-7000-8000-000000000001",
        user_id: "a1b2c3d4-0000-7000-8000-000000000001",
        display_name: "Tzvi Weiss",
        role: "owner",
      },
    ],
    invited: [],
    member: true,
    signOutFails: false,
    otherOrgs: [],
    inviteLink: "https://example.supabase.co/auth/v1/verify?token=t&type=invite",
    resetRequests: [],
    resetThrottled: false,
    resetNeedsCode: false,
    shops: [],
    integrations: [],
    steppedUp: false,
    authorizationUrl: "https://www.etsy.com/oauth/connect?response_type=code&state=s-1",
    etsyDown: false,
    callbacks: [],
    rechecks: [],
    disconnects: [],
    removals: [],
    recheckTooSoon: false,
    incidents: [],
    steps: [],
    notifications: [],
    reads: [],
    recounts: fakeRecounts(),
    readWorkspaces: [],
    incidentLists: [],
    exports: [],
    resyncs: [],
    operations: fakeOperations(),
    ...initial,
  };
  const requests: Request[] = [];
  const user = "a1b2c3d4-0000-7000-8000-000000000001";
  const org = "a0000000-0000-7000-8000-000000000000";

  async function handle(request: Request): Promise<Response> {
    requests.push(request);
    const url = new URL(request.url);
    const route = `${request.method} ${url.pathname.replace(/^\/api/, "")}`;
    const body: Record<string, unknown> =
      request.method === "POST" || request.method === "PATCH"
        ? ((await request.json().catch(() => ({}))) as Record<string, unknown>)
        : {};
    const unsafe = request.method !== "GET";
    if (unsafe && request.headers.get("X-HTCO-CSRF") !== "1") return problem(403, "csrf-failed");

    if (route === "POST /v1/auth/sign-in") {
      if (state.failures >= 5) return problem(429, "too-many-attempts");
      if (body["password"] !== state.password) {
        state.failures += 1;
        return problem(401, "sign-in-refused");
      }
      state.signedIn = true;
      return json(200, { user_id: user, assurance: state.assurance });
    }
    if (route === "POST /v1/auth/invitations/accept") {
      if (body["access_token"] !== "invite-at") return problem(401, "invitation-refused");
      if (body["password"] === state.password) return problem(422, "same-password");
      state.accepted = body;
      state.signedIn = true;
      return json(200, { user_id: user, assurance: state.assurance });
    }
    if (route === "POST /v1/auth/password/forgot") {
      if (state.resetThrottled) return problem(429, "too-many-attempts");
      if (body["email"] === "bad@x.y") return problem(422, "validation-error");
      state.resetRequests.push(body["email"]);
      return new Response(null, { status: 202 });
    }
    if (route === "POST /v1/auth/password/reset") {
      if (body["access_token"] !== "reset-at") return problem(401, "reset-link-refused");
      if (state.resetNeedsCode && body["code"] === undefined)
        return problem(403, "mfa-code-required");
      if (state.resetNeedsCode && body["code"] !== "123456")
        return problem(401, "mfa-code-refused");
      if (String(body["password"]).includes("weak")) return problem(422, "weak-password");
      if (body["password"] === state.password) return problem(422, "same-password");
      state.reset = body;
      state.signedIn = true;
      if (state.resetNeedsCode) state.assurance = "aal2";
      return json(200, { user_id: user, assurance: state.assurance });
    }
    if (!state.signedIn) return problem(401, "session-ended");

    const orgRoute = /^(GET|POST) \/v1\/organizations\/([^/]+)\/(members|invitations)$/.exec(route);
    if (orgRoute !== null) {
      if (orgRoute[3] === "members" && route.startsWith("GET") && state.membersHang === true)
        return new Promise<Response>(() => undefined);
      if (orgRoute[3] === "members")
        return json(200, {
          items: state.members.map((m) => ({ ...m, shop_ids: m.shop_ids ?? [] })),
        });
      state.invited.push({ email: body["email"], role: body["role"] });
      const member = {
        id: `b0000000-0000-7000-8000-00000000000${String(state.members.length + 1)}`,
        user_id: `a1b2c3d4-0000-7000-8000-00000000000${String(state.members.length + 1)}`,
        display_name: null,
        role: String(body["role"]),
      };
      state.members.push(member);
      return json(201, { ...member, shop_ids: [], invite_link: state.inviteLink });
    }

    // Changing a role, removing a member, granting and revoking shops (slice 2.6).
    const memberRoute =
      /^(PATCH|DELETE|PUT) \/v1\/organizations\/[^/]+\/members\/([^/]+)(?:\/shops\/([^/]+))?$/.exec(
        route,
      );
    if (memberRoute !== null) {
      const [, method, memberId, shopId] = memberRoute;
      const member = state.members.find((m) => m.id === memberId);
      if (member === undefined) return problem(404, "not-found");
      if (state.role !== "owner" && state.role !== "admin") return problem(403, "forbidden");
      if (state.memberChangesRefused === true) return problem(403, "mfa-required");
      if (member.role === "owner") return problem(403, "forbidden");
      if (shopId !== undefined) {
        if (!state.shops.some((shop) => shop.id === shopId)) return problem(404, "not-found");
        const granted = (member.shop_ids ?? []).filter((id) => id !== shopId);
        member.shop_ids = method === "PUT" ? [...granted, shopId] : granted;
        return json(204, null);
      }
      if (method === "DELETE") {
        state.members = state.members.filter((m) => m !== member);
        return json(204, null);
      }
      if (method === "PATCH") {
        const role = String(body["role"]);
        if (role === "owner" && state.role !== "owner") return problem(403, "forbidden");
        member.role = role;
        // The signed-in user's own membership: /v1/me answers with the new role.
        if (member.user_id === user) state.role = role as FakeState["role"];
        return json(200, { ...member, shop_ids: member.shop_ids ?? [] });
      }
    }

    // Re-checking what HTCO may do (slice 4.5) and disconnecting (slice 4.7).
    const shopRoute =
      /^POST \/v1\/shop-integrations\/([^/]+)\/(capability-checks|disconnect)$/.exec(route);
    if (shopRoute !== null) {
      const [, shopId, action] = shopRoute;
      const index = state.integrations.findIndex((i) => i.shop_id === shopId);
      const integration = state.integrations[index];
      if (integration === undefined) return problem(404, "not-found");
      if (action === "capability-checks") {
        if (state.role !== "owner" && state.role !== "admin") return problem(403, "forbidden");
        if (integration.status !== "connected") return notConnected(integration);
        if (state.recheckTooSoon)
          return new Response(
            JSON.stringify({
              type: PROBLEMS + "capability-check-too-soon",
              title: "Checked moments ago",
              status: 429,
              detail: "x",
              request_id: "r",
            }),
            {
              status: 429,
              headers: { "content-type": "application/problem+json", "retry-after": "30" },
            },
          );
        state.rechecks.push(String(shopId));
        const checkedAt = new Date().toISOString();
        const capabilities = fakeCapabilities(checkedAt);
        state.integrations[index] = {
          ...integration,
          capabilities,
          last_successful_call_at: checkedAt,
        };
        return json(200, { shop_id: shopId, capabilities });
      }
      if (state.role !== "owner") return problem(403, "forbidden");
      if (state.assurance !== "aal2") return problem(403, "mfa-required");
      if (!state.steppedUp) return problem(403, "step-up-required");
      state.disconnects.push(String(shopId));
      const now = Date.now();
      const disconnected: IntegrationView = {
        ...integration,
        status: "disconnected",
        token_health: "disconnected",
        access_expires_at: null,
        refresh_expires_at: null,
        disconnected_at: new Date(now).toISOString(),
        purge_after: new Date(now + 30 * DAY).toISOString(),
      };
      state.integrations[index] = disconnected;
      return json(200, disconnected);
    }

    // Removing a shop with all its data: the Owner, a second factor, a recent step-up.
    const removal = /^DELETE \/v1\/shops\/([^/]+)$/.exec(route);
    if (removal !== null) {
      const shopId = removal[1] ?? "";
      if (!state.shops.some((shop) => shop.id === shopId)) return problem(404, "not-found");
      if (state.role !== "owner") return problem(403, "forbidden");
      if (state.assurance !== "aal2") return problem(403, "mfa-required");
      if (!state.steppedUp) return problem(403, "step-up-required");
      state.removals.push(shopId);
      state.shops = state.shops.filter((shop) => shop.id !== shopId);
      state.integrations = state.integrations.filter((i) => i.shop_id !== shopId);
      return new Response(null, { status: 204 });
    }

    const center = incidentCenter(route, body, url);
    if (center !== undefined) return center;

    const bulk = /^POST \/v1\/shops\/([^/]+)\/order-(exports|resyncs)$/.exec(route);
    if (bulk !== null) {
      const shop = state.shops.find((s) => s.id === bulk[1]);
      if (shop === undefined) return problem(404, "not-found");
      if (bulk[2] === "resyncs") {
        if (!(state.role === "owner" || state.role === "admin"))
          return problem(403, "orders-action-forbidden");
        const ids = Array.isArray(body["order_ids"]) ? (body["order_ids"] as number[]) : [];
        state.resyncs.push(ids);
        return json(202, { queued: new Set(ids).size });
      }
      state.exports.push(body);
      const contact = state.role === "owner" || state.role === "admin" || state.role === "support";
      const every = fakeShopData(shop.id, shop.name, Date.now(), contact).ordersFor(
        null,
        10_000,
        0,
        (body["period"] as FakePeriod | undefined) ?? "30d",
      ).items;
      const chosen = Array.isArray(body["order_ids"]) ? (body["order_ids"] as number[]) : [];
      const rows = every.filter((o) => chosen.length === 0 || chosen.includes(o.order_id));
      const head = contact ? "order,state,total,buyer_name" : "order,state,total";
      const text = [
        head,
        ...rows.map((o) =>
          [o.order_id, o.state, o.total.amount, ...(contact ? [o.buyer ?? ""] : [])].join(","),
        ),
      ].join("\r\n");
      return new Response(text, {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": 'attachment; filename="orders-30d.csv"',
          "x-orders-exported": String(rows.length),
          "cache-control": "no-store",
        },
      });
    }

    // The operations calls name their workspace: a member of several who names none gets 400.
    const operational =
      route === "GET /v1/operations/health" ||
      /^POST \/v1\/operations\/dead-letters\/[^/]+\/retry$/.test(route) ||
      /^GET \/v1\/executions\/[^/]+$/.test(route) ||
      /^POST \/v1\/automations\/[^/]+\/executions\/[^/]+\/retry$/.test(route) ||
      route === "GET /v1/automations" ||
      /^GET \/v1\/automations\/[^/]+\/executions$/.test(route);
    const named = url.searchParams.get("organization_id");
    if (operational && named === null && state.otherOrgs.length > 0)
      return problem(400, "organization-required");
    const workspace = named ?? org;
    const admin = workspace === org ? state.role === "owner" || state.role === "admin" : true;
    // The registry and the runs: every role that sees the office (the runs of granted shops).
    if (route === "GET /v1/automations") {
      if (state.automationsOff === true) return problem(503, "automations-unavailable");
      return json(200, { items: fakeAutomations() });
    }
    // The sales counters' runs are the recounts this fake started (#73), so it answers before the
    // generic runs of #72, which would otherwise shadow it.
    if (route === "GET /v1/automations/product-sales-counters/executions") {
      if (!admin) return problem(403, "forbidden");
      return json(200, {
        items:
          state.recountListHides === true
            ? []
            : [...state.recounts.executions.keys()].reverse().map(recountView),
        next_cursor: null,
      });
    }
    const runs = /^GET \/v1\/automations\/([^/]+)\/executions$/.exec(route);
    if (runs !== null) {
      const ops = workspace === org ? state.operations : fakeOperations("calm");
      return json(200, { items: fakeRuns(runs[1] ?? "", state.shops, ops), next_cursor: null });
    }
    if (route === "GET /v1/operations/health") {
      if (!admin) return problem(403, "forbidden");
      if (state.healthTrouble === "fail") return problem(503, "operations-unavailable");
      // Another workspace of the user runs calmly: switching shows its own numbers.
      const ops = workspace === org ? state.operations : fakeOperations("calm");
      return json(200, fakeHealth(workspace, state.shops, ops));
    }
    const deadRetry = /^POST \/v1\/operations\/dead-letters\/([^/]+)\/retry$/.exec(route);
    if (deadRetry !== null) {
      if (!admin) return problem(403, "forbidden");
      const id = deadRetry[1] ?? "";
      if (id === DEAD_EXECUTION_JOB)
        return problem(409, "retry-through-execution", { execution_id: DEAD_EXECUTION });
      if (!state.operations.dead.includes(id)) return problem(409, "job-not-dead");
      state.operations.dead = state.operations.dead.filter((d) => d !== id);
      return json(202, { job_id: id, state: "queued" });
    }
    const chain = /^GET \/v1\/executions\/([^/]+)$/.exec(route);
    if (chain !== null) {
      if (state.executionReadFails === true) return problem(503, "unavailable");
      const recount = state.recounts.executions.get(chain[1] ?? "");
      if (recount !== undefined)
        return json(200, {
          ...fakeChain(chain[1] ?? "", state.operations),
          automation_id: "product-sales-counters",
          state: recount.state,
          output: recount.state === "succeeded" ? { rebuilt: 7, moved: 3 } : null,
        });
      return json(200, fakeChain(chain[1] ?? "", state.operations));
    }
    if (route === "POST /v1/automations/product-sales-counters/executions") {
      if (!admin) return problem(403, "forbidden");
      const key = request.headers.get("Idempotency-Key");
      state.recounts.started.push({ key, body, workspace });
      if (state.recountRefused === true) return problem(409, "automation-refused");
      const known = [...state.recounts.executions].find(([, e]) => e.key === key);
      const id =
        known?.[0] ??
        `e9000000-0000-7000-8000-${String(state.recounts.executions.size + 1).padStart(12, "0")}`;
      if (known === undefined)
        state.recounts.executions.set(id, {
          state: "pending",
          shop_id: String(body["shop_id"]),
          key: key ?? "",
        });
      if (state.recountInProgress === true) return problem(409, "idempotency-in-progress");
      if (state.recountLoseAnswer === true) return problem(503, "unavailable");
      return json(202, recountView(id));
    }
    const executionRetry = /^POST \/v1\/automations\/([^/]+)\/executions\/([^/]+)\/retry$/.exec(
      route,
    );
    if (executionRetry !== null) {
      if (!admin) return problem(403, "forbidden");
      const id = executionRetry[2] ?? "";
      if (state.operations.hold !== undefined) await state.operations.hold;
      if (id !== DEAD_EXECUTION || state.operations.retriedExecutions.includes(id))
        return problem(409, "execution-not-dead-lettered");
      state.operations.retriedExecutions.push(id);
      return json(200, {
        id,
        automation_id: executionRetry[1] ?? "",
        state: "retry_scheduled",
      });
    }
    const one = /^GET \/v1\/shops\/([^/]+)\/orders\/(\d+)$/.exec(route);
    if (one !== null) return orderDetail(one[1] ?? "", Number(one[2]));
    const live =
      /^GET \/v1\/shops\/([^/]+)\/(overview|orders|listings|reviews|shipping|stats)$/.exec(route);
    if (live !== null) return liveData(live[1] ?? "", live[2] ?? "", url);

    switch (route) {
      case "GET /v1/auth/session":
        return json(200, { user_id: user, assurance: state.assurance });
      case "GET /v1/me":
        if (!state.member) return problem(403, "no-membership");
        return json(200, {
          user_id: user,
          assurance: state.assurance,
          memberships: [
            { organization_id: org, role: state.role },
            ...state.otherOrgs.map((id) => ({ organization_id: id, role: "owner" })),
          ],
        });
      case "GET /v1/auth/mfa":
        return json(200, {
          assurance: state.assurance,
          enrolled: state.enrolled,
          factors: state.enrolled ? [{ id: "f1", name: "Phone", verified: true }] : [],
        });
      case "POST /v1/auth/mfa/enroll":
        return json(200, {
          factor_id: "f1",
          qr_code: "data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg'/>",
          secret: "JBSWY3DPEHPK3PXP",
          uri: "otpauth://totp/HTCO:owner?secret=JBSWY3DPEHPK3PXP",
        });
      case "POST /v1/auth/mfa/verify":
      case "POST /v1/auth/step-up":
        if (route.endsWith("step-up") && !state.enrolled) return problem(409, "mfa-not-enrolled");
        if (body["code"] !== "123456") return problem(401, "mfa-code-refused");
        state.enrolled = true;
        state.assurance = "aal2";
        state.steppedUp = true;
        return route.endsWith("step-up") ? json(204, null) : json(200, { assurance: "aal2" });
      case "GET /v1/auth/sessions":
        return json(200, {
          items: state.sessions
            .filter((s) => !s.revoked)
            .map((s) => ({
              id: s.id,
              created_at: "2026-10-15T08:00:00Z",
              last_seen_at: "2026-10-15T09:00:00Z",
              user_agent: s.current ? "Firefox on Windows" : "Chrome on Android",
              current: s.current,
            })),
        });
      case "POST /v1/auth/sign-out":
        if (state.signOutFails) return problem(503, "auth-unavailable");
        state.signedIn = false;
        return json(204, null);
      case "GET /v1/shops": {
        // Pages of 50 (the API's default), the cursor being the next index.
        const start = Number(url.searchParams.get("cursor") ?? "0");
        const end = start + Number(url.searchParams.get("limit") ?? "50");
        const organizationId = url.searchParams.get("organization_id") ?? org;
        if (state.shopsFailFor?.includes(organizationId) === true)
          return problem(500, "internal-error");
        return json(200, {
          items: state.shops.slice(start, end).map((shop) => ({
            ...shop,
            organization_id: organizationId,
            marketplace: "etsy",
          })),
          next_cursor: end < state.shops.length ? String(end) : null,
        });
      }
      case "GET /v1/shop-integrations":
        if (state.role !== "owner" && state.role !== "admin") return problem(403, "forbidden");
        if (state.integrationsTrouble === "hang") return new Promise<Response>(() => undefined);
        if (state.integrationsTrouble === "fail") return problem(500, "internal-error");
        return json(200, { items: state.integrations });
      case "POST /v1/shops/etsy/connect":
        if (state.role !== "owner") return problem(403, "forbidden");
        if (state.assurance !== "aal2") return problem(403, "mfa-required");
        if (!state.steppedUp) return problem(403, "step-up-required");
        if (state.etsyDown) return problem(503, "etsy-unavailable");
        return json(200, { authorization_url: state.authorizationUrl });
      case "POST /v1/integrations/etsy/callback": {
        state.callbacks.push(body);
        const slug = state.callbackProblem;
        if (slug !== undefined) return problem(CALLBACK_STATUS[slug] ?? 500, slug);
        const existing = state.shops.find((shop) => shop.name === "Willow & Wick");
        const shop = existing ?? {
          id: "d0000000-0000-7000-8000-000000000001",
          name: "Willow & Wick",
          status: "active",
        };
        if (existing === undefined) state.shops.push(shop);
        const integration = fakeIntegration(shop.id, "ok");
        state.integrations = [
          ...state.integrations.filter((i) => i.shop_id !== shop.id),
          integration,
        ];
        return json(200, {
          shop: { ...shop, organization_id: org, marketplace: "etsy" },
          integration,
          reconnected: existing !== undefined,
        });
      }
      default: {
        const revoke = /^DELETE \/v1\/auth\/sessions\/(.+)$/.exec(route);
        const target = state.sessions.find((s) => s.id === revoke?.[1] && !s.revoked);
        if (target !== undefined) {
          target.revoked = true;
          return json(204, null);
        }
        return problem(404, "not-found");
      }
    }
  }

  /** A rebuild as the API's `ExecutionView` shows it. */
  function recountView(id: string) {
    const execution = state.recounts.executions.get(id);
    const at = new Date().toISOString();
    return {
      id,
      automation_id: "product-sales-counters",
      automation_version: 1,
      shop_id: execution?.shop_id ?? null,
      trigger: "user_action",
      actor_kind: "user",
      actor_id: user,
      state: execution?.state ?? "pending",
      attempts: execution?.state === "pending" ? 0 : 1,
      correlation_id: `req-${id}`,
      last_error: execution?.state === "dead_lettered" ? "JobError" : null,
      created_at: at,
      updated_at: at,
    };
  }

  /** May the role move incidents? Owners and Admins (the API's update-incidents capability). */
  const updates = () => state.role === "owner" || state.role === "admin";

  /** The incident center and the notification inbox (slices 6.3 to 6.5). */
  function incidentCenter(
    route: string,
    body: Record<string, unknown>,
    url: URL,
  ): Response | Promise<Response> | undefined {
    if (/^(GET|POST) \/v1\/incidents/.test(route)) {
      if (state.incidentsTrouble === "hang") return new Promise<Response>(() => undefined);
      if (state.incidentsTrouble === "fail") return problem(503, "incidents-unavailable");
      if (state.incidentsTrouble === "forbidden") return problem(403, "forbidden");
      if (state.incidentsFailFor?.includes(url.searchParams.get("organization_id") ?? org) === true)
        return problem(503, "incidents-unavailable");
    }
    // Every call names its workspace; an incident or notification of another one is not there.
    const asked = url.searchParams.get("organization_id") ?? org;
    const inWorkspace = (incident: FakeIncident) =>
      (state.incidentWorkspaces?.[incident.id] ?? org) === asked;
    const noticeHere = (notice: FakeNotification) =>
      (state.notificationWorkspaces?.[notice.id] ?? org) === asked;
    const shaped = (incident: FakeIncident): FakeIncident => ({
      ...incident,
      can_update: incident.can_update && updates(),
      next_states: incident.can_update && updates() ? incident.next_states : [],
    });
    if (route === "GET /v1/incidents") {
      state.incidentLists.push(url.search);
      const all = url.searchParams.get("state") === "all";
      const shop = url.searchParams.get("shop_id");
      const receipt = url.searchParams.get("receipt_id");
      const items = state.incidents
        .filter(inWorkspace)
        .filter((incident) => all || incident.is_open)
        .filter((incident) => shop === null || incident.shop_id === shop)
        .filter((incident) => receipt === null || String(incident.receipt_id) === receipt)
        .map((incident) => {
          const summary: Partial<FakeIncident> = { ...incident };
          delete summary.details;
          delete summary.history;
          delete summary.can_update;
          delete summary.next_states;
          return summary;
        });
      // Keyset pages as the API sends them: the cursor here is the next page's offset.
      const size = Math.min(
        Number(url.searchParams.get("limit") ?? 200),
        state.incidentPageSize ?? 200,
      );
      const from = Number(url.searchParams.get("cursor") ?? 0);
      const page = items.slice(from, from + size);
      const more = from + size < items.length;
      return json(200, { items: page, next_cursor: more ? String(from + size) : null });
    }
    const one = /^GET \/v1\/incidents\/([^/]+)$/.exec(route);
    if (one !== null) {
      const incident = state.incidents.find(
        (candidate) => candidate.id === one[1] && inWorkspace(candidate),
      );
      return incident === undefined ? problem(404, "not-found") : json(200, shaped(incident));
    }
    const step = /^POST \/v1\/incidents\/([^/]+)\/transitions$/.exec(route);
    if (step !== null) {
      const id = step[1] ?? "";
      state.steps.push({ id, to_state: body["to_state"], note: body["note"] });
      const index = state.incidents.findIndex(
        (candidate) => candidate.id === id && inWorkspace(candidate),
      );
      const incident = state.incidents[index];
      if (incident === undefined) return problem(404, "not-found");
      if (!updates()) return problem(403, "forbidden");
      if (state.stepProblem !== undefined) return problem(409, state.stepProblem);
      const target = String(body["to_state"]);
      if (target === "resolved") return problem(409, "evidence-required");
      if (!personSteps(incident.state).includes(target))
        return problem(409, "illegal-incident-step");
      const at = new Date().toISOString();
      const note = body["note"];
      const moved: FakeIncident = {
        ...incident,
        state: target,
        updated_at: at,
        history: [
          ...incident.history,
          {
            from_state: incident.state,
            to_state: target,
            actor_kind: "user",
            actor_id: user,
            at,
            note: typeof note === "string" && note !== "" ? note : null,
            evidence: null,
          },
        ],
        next_states: personSteps(target),
      };
      state.incidents[index] = moved;
      return json(200, shaped(moved));
    }
    if (route === "GET /v1/notifications") {
      if (state.notificationsTrouble === "fail") return problem(503, "incidents-unavailable");
      if (state.notificationsFailFor?.includes(url.searchParams.get("organization_id") ?? ""))
        return problem(503, "incidents-unavailable");
      const unreadOnly = url.searchParams.get("unread_only") === "true";
      const here = state.notifications.filter(noticeHere);
      return json(200, {
        items: here.filter((n) => !unreadOnly || n.read_at === null),
        unread_count: here.filter((n) => n.read_at === null).length,
      });
    }
    if (route === "POST /v1/notifications/read") {
      if (state.readTrouble === "fail") return problem(503, "incidents-unavailable");
      state.reads.push(body);
      state.readWorkspaces.push(asked);
      const ids = Array.isArray(body["ids"]) ? (body["ids"] as unknown[]) : undefined;
      const at = new Date().toISOString();
      state.notifications = state.notifications.map((n) =>
        n.read_at === null && noticeHere(n) && (ids === undefined || ids.includes(n.id))
          ? { ...n, read_at: at }
          : n,
      );
      return json(204, null);
    }
    return undefined;
  }

  /** When the stored history last synced (slice 5.6), and the answer as the store gives it. */
  function syncedAt(): string {
    return new Date(Date.now() - (state.liveTrouble === "stale" ? 40 : 4) * 60_000).toISOString();
  }
  function fromStore<T extends { source: string; fetched_at: string; stale: boolean }>(
    body: T,
    stored: number,
  ): T {
    if (state.orderStore !== true) return body;
    const at = syncedAt();
    return {
      ...body,
      source: "htco_store",
      fetched_at: at,
      stale: state.liveTrouble === "stale",
      sync: { state: "complete", orders_stored: stored, last_synced_at: at },
      last_synced_at: at,
    };
  }

  /** One order with its status timeline, as the stored history recorded it (invented). */
  function orderDetail(shopId: string, orderId: number): Response {
    const shop = state.shops.find((s) => s.id === shopId);
    if (shop === undefined) return problem(404, "not-found");
    const integration = state.integrations.find((i) => i.shop_id === shopId);
    if (integration !== undefined && integration.status !== "connected")
      return notConnected(integration);
    const contact = state.role === "owner" || state.role === "admin" || state.role === "support";
    const data = fakeShopData(shopId, shop.name, Date.now(), contact, state.liveBusy === true);
    const every = data.ordersFor(null, 10_000, 0, "all");
    const order = every.items.find((o) => o.order_id === orderId);
    if (order === undefined) return problem(404, "not-found");
    const stored = state.orderStore === true;
    const at = syncedAt();
    const step = (from: string | null, to: string, source: string, when: string) => ({
      from_state: from,
      to_state: to,
      state:
        to === "ingested" || to === "awaiting_shipment"
          ? "paid"
          : to === "delivered"
            ? "shipped"
            : to === "cancelled"
              ? "canceled"
              : to,
      source,
      observed_at: when,
    });
    const placed = order.created_at;
    const timeline = !stored
      ? []
      : order.state === "unpaid"
        ? [step(null, "unpaid", "webhook", placed)]
        : [
            step(null, "paid", "webhook", placed),
            step("paid", "ingested", "webhook", placed),
            ...(order.state === "canceled"
              ? [step("ingested", "cancelled", "reconciliation", order.updated_at)]
              : [step("ingested", "awaiting_shipment", "webhook", placed)]),
            ...(order.state === "shipped" || order.state === "refunded"
              ? [
                  step(
                    "awaiting_shipment",
                    "shipped",
                    "webhook",
                    order.shipments[0]?.shipped_at ?? order.updated_at,
                  ),
                ]
              : []),
            ...(order.state === "refunded"
              ? [
                  step(
                    "shipped",
                    "refunded",
                    "reconciliation",
                    order.refunds[0]?.refunded_at ?? order.updated_at,
                  ),
                ]
              : []),
          ];
    return json(200, {
      source: stored ? "htco_store" : "etsy_live",
      fetched_at: stored ? at : new Date(Date.now() - 90_000).toISOString(),
      stale: false,
      shop_id: shopId,
      order,
      timeline,
      buyer_details: contact,
      sync: stored ? { state: "complete", orders_stored: every.total, last_synced_at: at } : null,
      last_synced_at: stored ? at : null,
    });
  }

  /** A connected shop's invented Etsy data, as the API answers it. */
  function liveData(shopId: string, view: string, url: URL): Response | Promise<Response> {
    const shop = state.shops.find((s) => s.id === shopId);
    if (shop === undefined) return problem(404, "not-found");
    const integration = state.integrations.find((i) => i.shop_id === shopId);
    if (integration !== undefined && integration.status !== "connected")
      return notConnected(integration);
    const trouble = state.liveTrouble;
    if (trouble === "hang") return new Promise<Response>(() => undefined);
    if (trouble === "unavailable") return problem(503, "etsy-data-unavailable");
    const contact = state.role === "owner" || state.role === "admin" || state.role === "support";
    const data = fakeShopData(
      shopId,
      shop.name,
      Date.now(),
      contact,
      state.liveBusy === true,
      trouble !== "history",
    );
    const mark = <T extends { stale: boolean; fetched_at: string }>(body: T): T =>
      trouble === "stale"
        ? { ...body, stale: true, fetched_at: new Date(Date.now() - 40 * 60_000).toISOString() }
        : body;
    if (view === "overview") {
      const overview = mark(data.overview);
      if (trouble === "quiet" && overview.sales !== null) {
        const none = { orders: 0, units: 0, revenue: { amount: "0.00", currency: "USD" } };
        return json(200, {
          ...overview,
          profile: { ...overview.profile, sold_count: 0 },
          sales: {
            ...overview.sales,
            today: none,
            last_7_days: none,
            last_30_days: none,
            daily: overview.sales.daily.map((d) => ({ ...d, orders: 0, revenue: "0.00" })),
            awaiting_shipment: 0,
            overdue: 0,
            top_listings: [],
          },
        });
      }
      const body = trouble === "no-sales" ? { ...overview, sales: null } : overview;
      if (state.orderStore !== true || body.sales === null) return json(200, body);
      // Home's sales from the stored history; the profile is still read live.
      const at = syncedAt();
      const stored = data.ordersFor(null, 10_000, 0, "all").total;
      return json(200, {
        ...body,
        sales_source: "htco_store",
        sync: { state: "complete", orders_stored: stored, last_synced_at: at },
        last_synced_at: at,
      });
    }
    if (view === "orders") {
      const period = url.searchParams.get("period") ?? "30d";
      if (!["30d", "90d", "12m", "all"].includes(period)) return problem(422, "validation-error");
      const page = data.ordersFor(
        url.searchParams.get("state"),
        Number(url.searchParams.get("limit") ?? "50"),
        Number(url.searchParams.get("offset") ?? "0"),
        period as FakePeriod,
      );
      if (trouble === "quiet")
        return json(200, {
          ...page,
          items: [],
          total: 0,
          counts: { unpaid: 0, paid: 0, shipped: 0, canceled: 0, refunded: 0, overdue: 0 },
        });
      const stored = data.ordersFor(null, 10_000, 0, "all").total;
      return json(
        200,
        fromStore(mark(trouble === "partial" ? { ...page, partial: true } : page), stored),
      );
    }
    if (view === "listings")
      return json(
        200,
        mark(
          trouble === "truncated"
            ? {
                ...data.listings,
                // A larger catalog than one read; the sold-out listing is not among those read.
                items: data.listings.items.filter((l) => l.quantity > 0 || l.is_digital),
                total_count: data.listings.total_count + 300,
                truncated: true,
              }
            : data.listings,
        ),
      );
    if (view === "reviews") return json(200, mark(data.reviews));
    if (view === "stats") {
      if (state.statsFailFor?.includes(shopId) === true)
        return problem(503, "etsy-data-unavailable");
      if (trouble === "quiet")
        return json(200, {
          ...data.stats(),
          profile: { ...data.overview.profile, sold_count: 0 },
          sales: {
            ...data.stats().sales,
            orders: 0,
            units: 0,
            revenue: { amount: "0.00", currency: "USD" },
            average_order_value: null,
            monthly: [],
            best_month: null,
            top_products: [],
            countries: [],
            first_order_at: null,
            receipts_read: 0,
          },
        });
      const stats = data.stats(trouble === "partial" ? 120 : undefined);
      return json(
        200,
        fromStore(
          mark(
            trouble === "partial" && stats.sales !== null
              ? { ...stats, sales: { ...stats.sales, partial: true } }
              : stats,
          ),
          data.ordersFor(null, 10_000, 0, "all").total,
        ),
      );
    }
    return json(200, mark(data.shipping));
  }

  return {
    client: createApiClient({ baseUrl: "http://localhost/api", fetch: handle }),
    state,
    requests,
  };
}
