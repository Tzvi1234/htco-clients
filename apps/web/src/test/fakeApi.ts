import { createApiClient, type ApiClient } from "@htco/api-client";

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
  role: "owner" | "admin" | "support" | "viewer";
  password: string;
  failures: number;
  sessions: { id: string; current: boolean; revoked: boolean }[];
}

const PROBLEMS = "https://ht-co.app/problems/";

function json(status: number, body: unknown): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": status >= 400 ? "application/problem+json" : "application/json" },
  });
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
    if (!state.signedIn) return problem(401, "session-ended");

    switch (route) {
      case "GET /v1/auth/session":
        return json(200, { user_id: user, assurance: state.assurance });
      case "GET /v1/me":
        return json(200, {
          user_id: user,
          assurance: state.assurance,
          memberships: [{ organization_id: org, role: state.role }],
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
        state.signedIn = false;
        return json(204, null);
      case "GET /v1/shops":
        return json(200, { items: [], next_cursor: null });
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
