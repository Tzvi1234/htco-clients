import { describe, expect, it } from "vitest";

import {
  applyTweaks,
  changedTweaks,
  DEFAULT_TWEAKS,
  readTweaks,
  TWEAK_STORAGE_KEYS,
  writeTweak,
  type Tweaks,
} from "./tweaks.ts";
import { memoryStorage } from "../lib/storage.ts";

describe("the tweaks preference (client ADR-0008)", () => {
  it("starts at the demo's defaults: system theme, SBB palette, every level normal", () => {
    expect(readTweaks(memoryStorage())).toEqual({
      theme: "system",
      palette: "sbb",
      contrast: 1,
      glass: 1,
      borders: 1,
    } satisfies Tweaks);
    expect(DEFAULT_TWEAKS).toEqual(readTweaks(undefined));
  });

  it("reads what this origin remembered, one key per tweak", () => {
    const storage = memoryStorage();
    writeTweak(storage, "palette", "d4");
    writeTweak(storage, "glass", 3);
    writeTweak(storage, "theme", "dark");

    expect(readTweaks(storage)).toMatchObject({ palette: "d4", glass: 3, theme: "dark" });
    expect(storage.getItem("htco.palette")).toBe("d4");
    expect(storage.getItem("htco.glass")).toBe("3");
    // The theme keeps the key the settings page has always used.
    expect(storage.getItem("htco.theme")).toBe("dark");
  });

  it("ignores unknown or out-of-range values, tweak by tweak", () => {
    const storage = memoryStorage();
    storage.setItem("htco.palette", "neon");
    storage.setItem("htco.contrast", "4");
    storage.setItem("htco.borders", "2");
    storage.setItem("htco.glass", "two");

    expect(readTweaks(storage)).toEqual({ ...DEFAULT_TWEAKS, borders: 2 });
  });

  it("names every storage key under htco.", () => {
    expect(Object.values(TWEAK_STORAGE_KEYS)).toEqual([
      "htco.theme",
      "htco.palette",
      "htco.contrast",
      "htco.glass",
      "htco.borders",
    ]);
  });

  it("works when storage throws (private windows)", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readTweaks(broken)).toEqual(DEFAULT_TWEAKS);
    expect(() => {
      writeTweak(broken, "glass", 2);
    }).not.toThrow();
  });
});

describe("applyTweaks", () => {
  it("writes the data attributes the token stylesheet reads", () => {
    const root = document.createElement("html");
    applyTweaks({ theme: "dark", palette: "plain", contrast: 2, glass: 3, borders: 1 }, root);

    expect(Object.fromEntries(Object.entries(root.dataset))).toEqual({
      theme: "dark",
      pal: "plain",
      t1: "2",
      t2: "3",
      t3: "1",
    });
  });

  it("removes data-theme to follow the system", () => {
    const root = document.createElement("html");
    applyTweaks({ ...DEFAULT_TWEAKS, theme: "light" }, root);
    applyTweaks(DEFAULT_TWEAKS, root);

    expect(root.hasAttribute("data-theme")).toBe(false);
    expect(root.dataset["pal"]).toBe("sbb");
  });
});

describe("changedTweaks", () => {
  it("counts the tweaks away from their defaults, as the top bar's badge shows", () => {
    expect(changedTweaks(DEFAULT_TWEAKS)).toBe(0);
    expect(changedTweaks({ ...DEFAULT_TWEAKS, glass: 2, palette: "d4", theme: "dark" })).toBe(3);
  });

  it("does not count contrast and borders while Design 4 sets them", () => {
    expect(changedTweaks({ ...DEFAULT_TWEAKS, palette: "d4", contrast: 3, borders: 2 })).toBe(1);
  });
});
