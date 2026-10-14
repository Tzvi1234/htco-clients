/**
 * The typed HTCO API client for the web app (slice 3.6).
 *
 * The web app calls the API on its own origin under `/api`, so the session cookie
 * (`__Host-htco_session`) travels with every request and no token ever reaches the browser.
 * Unsafe requests carry the CSRF header the API requires (ADR-0006, AC-3.5.2).
 */
import createClient, { type Middleware } from "openapi-fetch";

import type { components, paths } from "../generated/schema.d.ts";

export type { components, paths };
export type Problem = components["schemas"]["Problem"];

export const CSRF_HEADER = "X-HTCO-CSRF";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const csrf: Middleware = {
  onRequest({ request }) {
    if (!SAFE_METHODS.has(request.method)) request.headers.set(CSRF_HEADER, "1");
    return request;
  },
};

export interface ApiClientOptions {
  baseUrl?: string;
  fetch?: (input: Request) => Promise<Response>;
}

export function createApiClient({ baseUrl = "/api", fetch }: ApiClientOptions = {}) {
  const client = createClient<paths>({
    baseUrl,
    credentials: "same-origin",
    ...(fetch === undefined ? {} : { fetch }),
  });
  client.use(csrf);
  return client;
}

export type ApiClient = ReturnType<typeof createApiClient>;
