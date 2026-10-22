import { createApiClient, type ApiClient, type components } from "@htco/api-client";

import { fakeShopData } from "./fakeShopData.ts";

type IntegrationView = components["schemas"]["IntegrationView"];
type CapabilityView = components["schemas"]["CapabilityView"];

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
  /** True: a re-check answers 429 capability-check-too-soon (Retry-After 30). */
  recheckTooSoon: boolean;
  /**
   * The shops' live Etsy data (`GET /v1/shops/{id}/overview|orders|…`): "unavailable" answers
   * 503 etsy-data-unavailable, "stale" marks the data stale, "quiet" is a shop without orders,
   * "hang" never answers.
   */
  liveTrouble?: "unavailable" | "stale" | "quiet" | "hang" | undefined;
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

function problem(status: number, type: string): Response {
  return json(status, {
    type: PROBLEMS + type,
    title: type,
    status,
    detail: type,
    request_id: "r",
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
    recheckTooSoon: false,
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
        if (integration.status !== "connected") return problem(409, "shop-not-connected");
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

    const live = /^GET \/v1\/shops\/([^/]+)\/(overview|orders|listings|reviews|shipping)$/.exec(
      route,
    );
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

  /** A connected shop's invented Etsy data, as the API answers it. */
  function liveData(shopId: string, view: string, url: URL): Response | Promise<Response> {
    const shop = state.shops.find((s) => s.id === shopId);
    if (shop === undefined) return problem(404, "not-found");
    const integration = state.integrations.find((i) => i.shop_id === shopId);
    if (integration !== undefined && integration.status !== "connected")
      return problem(409, "shop-not-connected");
    const trouble = state.liveTrouble;
    if (trouble === "hang") return new Promise<Response>(() => undefined);
    if (trouble === "unavailable") return problem(503, "etsy-data-unavailable");
    const contact = state.role === "owner" || state.role === "admin" || state.role === "support";
    const data = fakeShopData(shopId, shop.name, Date.now(), contact);
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
      return json(200, overview);
    }
    if (view === "orders") {
      const page = data.ordersFor(
        url.searchParams.get("state"),
        Number(url.searchParams.get("limit") ?? "50"),
        Number(url.searchParams.get("offset") ?? "0"),
      );
      if (trouble === "quiet")
        return json(200, {
          ...page,
          items: [],
          total: 0,
          counts: { unpaid: 0, paid: 0, shipped: 0, canceled: 0, refunded: 0, overdue: 0 },
        });
      return json(200, mark(page));
    }
    if (view === "listings") return json(200, mark(data.listings));
    if (view === "reviews") return json(200, mark(data.reviews));
    return json(200, mark(data.shipping));
  }

  return {
    client: createApiClient({ baseUrl: "http://localhost/api", fetch: handle }),
    state,
    requests,
  };
}
