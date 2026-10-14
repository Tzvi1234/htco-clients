import { describe, expect, it } from "vitest";

import { memoryStorage, readSetting, writeSetting } from "./storage.ts";

describe("device settings storage", () => {
  it("reads back what it wrote", () => {
    const storage = memoryStorage();
    writeSetting(storage, "htco.test", "value");

    expect(readSetting(storage, "htco.test")).toBe("value");
  });

  it("treats unavailable storage as empty and never throws", () => {
    const blocked = {
      getItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    };

    expect(readSetting(blocked, "htco.test")).toBeNull();
    expect(() => {
      writeSetting(blocked, "htco.test", "value");
    }).not.toThrow();
    expect(readSetting(undefined, "htco.test")).toBeNull();
  });
});
