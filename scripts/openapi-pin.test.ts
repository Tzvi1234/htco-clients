import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { asPinned, checkPin, firstDifference, parsePin, rawUrl } from "./openapi-pin.ts";

// Architecture audit 2026-10-23, finding 8.1: the pinned OpenAPI copy must not drift from the
// platform commit it names.

const SHA = "94b4da74739578fc6ecf7e02f0256864df7ebfe6";
const PIN = {
  repository: "Tzvi1234/htco-platform",
  commit: SHA,
  path: "packages/contracts/openapi.yaml",
};
const PLATFORM = "openapi: 3.1.0\npaths:\n  /healthz:\n    get:\n      tags:\n      - health\n";

function repository(copy: string): string {
  const root = mkdtempSync(join(tmpdir(), "openapi-pin-"));
  mkdirSync(join(root, "packages", "api-client"), { recursive: true });
  writeFileSync(join(root, "packages", "api-client", "openapi.pin.json"), JSON.stringify(PIN));
  writeFileSync(join(root, "packages", "api-client", "openapi.yaml"), copy);
  return root;
}

const serving = (text: string, status = 200): typeof fetch =>
  ((url: string) => {
    expect(url).toBe(rawUrl(PIN));
    return Promise.resolve(new Response(text, { status }));
  }) as typeof fetch;

describe("the pinned OpenAPI copy (finding 8.1)", () => {
  it("names the platform file at a full commit", () => {
    expect(parsePin(JSON.stringify(PIN))).toEqual(PIN);
    expect(rawUrl(PIN)).toBe(
      `https://raw.githubusercontent.com/Tzvi1234/htco-platform/${SHA}/packages/contracts/openapi.yaml`,
    );
  });

  it.each([
    [{ ...PIN, commit: "main" }, /full 40-character SHA/],
    [{ ...PIN, commit: SHA.slice(0, 12) }, /full 40-character SHA/],
    [{ ...PIN, repository: "htco-platform" }, /owner\/name/],
    [{ ...PIN, path: "../secrets" }, /relative path/],
  ])("refuses a pin that can move or escape: %j", (pin, message) => {
    expect(() => parsePin(JSON.stringify(pin))).toThrow(message);
  });

  it("passes when the copy is the platform's file as Prettier formats it here", async () => {
    const copy = await asPinned(PLATFORM);
    expect(copy).toContain("      tags:\n        - health\n");
    expect(await checkPin(repository(copy), serving(PLATFORM))).toBeUndefined();
  });

  it("fails, naming the first differing line, when the copy drifted", async () => {
    const copy = (await asPinned(PLATFORM)).replace("/healthz", "/livez");
    const problem = await checkPin(repository(copy), serving(PLATFORM));
    expect(problem).toMatch(/differs from Tzvi1234\/htco-platform@94b4da747395/);
    expect(problem).toMatch(/first at line 3/);
  });

  it("fails when the pinned commit cannot be read", async () => {
    await expect(checkPin(repository(""), serving("", 404))).rejects.toThrow(/answered 404/);
  });

  it("finds the first differing line, and none when equal", () => {
    expect(firstDifference("a\nb\nc", "a\nb\nc")).toBeUndefined();
    expect(firstDifference("a\nb\nc", "a\nx\nc")).toBe(2);
    expect(firstDifference("a\nb", "a\nb\nc")).toBe(3);
  });
});
