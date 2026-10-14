import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { CSRF_HEADER, createApiClient } from "../src/index.ts";
import { GENERATED_PATH, renderSchema } from "../src/generate.ts";

function recordingFetch(status = 200, body: unknown = {}) {
  const requests: Request[] = [];
  const fetch = (input: Request | string | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init);
    requests.push(request);
    return Promise.resolve(
      new Response(status === 204 ? null : JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
    );
  };
  return { requests, fetch };
}

describe("the API client", () => {
  it("calls the API under /api on the same origin", async () => {
    const { requests, fetch } = recordingFetch(200, { status: "ok" });
    const client = createApiClient({ baseUrl: "https://app.test/api", fetch });

    const { data } = await client.GET("/healthz");

    expect(data).toEqual({ status: "ok" });
    expect(requests[0]?.url).toBe("https://app.test/api/healthz");
    expect(requests[0]?.credentials).toBe("same-origin");
  });

  it("sends the CSRF header on unsafe requests only (AC-3.5.2)", async () => {
    const { requests, fetch } = recordingFetch(204);
    const client = createApiClient({ baseUrl: "https://app.test/api", fetch });

    await client.GET("/v1/auth/session");
    await client.POST("/v1/auth/sign-out");

    expect(requests[0]?.headers.get(CSRF_HEADER)).toBeNull();
    expect(requests[1]?.headers.get(CSRF_HEADER)).toBe("1");
  });
});

describe("the generated types (AC-3.6.1)", () => {
  it("match the pinned OpenAPI document; run `pnpm --filter @htco/api-client generate`", async () => {
    const committed = await readFile(GENERATED_PATH, "utf8");
    expect(committed).toBe(await renderSchema());
  });
});
