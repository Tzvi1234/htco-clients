import { createApiClient, type ApiClient, type components } from "@htco/api-client";

type IntegrationView = components["schemas"]["IntegrationView"];

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
  members: { id: string; user_id: string; display_name: string | null; role: string }[];
  invited: { email: unknown; role: unknown }[];
  inviteLink: string;
  /** False: signed in, but not a member of any organization (403 no-membership). */
  member: boolean;
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
      fakeIntegration(b, "expiring", { etsy_shop_id: 39_002_114 }),
      fakeIntegration(c, "needs_reauth", {
        etsy_shop_id: 50_331_907,
        last_successful_call_at: new Date(Date.now() - 2 * DAY).toISOString(),
      }),
      fakeIntegration(d, "disconnected", {
        etsy_shop_id: 28_640_515,
        scopes: [],
        last_successful_call_at: null,
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
      request.method === "POST"
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
        return json(200, { items: state.members.map((m) => ({ ...m, shop_ids: [] })) });
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

  return {
    client: createApiClient({ baseUrl: "http://localhost/api", fetch: handle }),
    state,
    requests,
  };
}
