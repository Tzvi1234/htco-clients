import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useActionKey, useActionKeys } from "./idempotency.ts";

// Platform PR #223: a fresh Idempotency-Key per user action, the same one on a retry of it.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("useActionKey", () => {
  it("keeps the key while the same action is tried again", () => {
    const { result } = renderHook(() => useActionKey());
    const first = result.current.key("job-1");
    expect(first).toMatch(UUID);
    expect(result.current.key("job-1")).toBe(first);
  });

  it("makes a new key for another action, and after the action succeeded", () => {
    const { result } = renderHook(() => useActionKey());
    const first = result.current.key("job-1");
    const other = result.current.key("job-2");
    expect(other).not.toBe(first);
    result.current.reset();
    expect(result.current.key("job-2")).not.toBe(other);
  });

  it("survives a re-render", () => {
    const { result, rerender } = renderHook(() => useActionKey());
    const first = result.current.key();
    rerender();
    expect(result.current.key()).toBe(first);
  });
});

describe("useActionKeys", () => {
  it("keeps one key per job: A, then B, then A again reuses A's key until A succeeds", () => {
    const { result } = renderHook(() => useActionKeys());
    const a = result.current.key("job-a");
    const b = result.current.key("job-b");
    expect(a).toMatch(UUID);
    expect(b).not.toBe(a);
    expect(result.current.key("job-a")).toBe(a);
    result.current.reset("job-a");
    const again = result.current.key("job-a");
    expect(again).not.toBe(a);
    expect(result.current.key("job-b")).toBe(b);
  });
});
