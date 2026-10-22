import { describe, expect, it } from "vitest";

import {
  applyTweaks,
  DEFAULT_TWEAKS,
  migrateAppearance,
  readTweaks,
  RETIRED_KEYS,
  writeTweak,
} from "./tweaks.ts";
import { memoryStorage, type SettingsStorage } from "../lib/storage.ts";

describe("the appearance preference (round 3: theme and palette)", () => {
  it("defaults to the system theme and the gray palette", () => {
    expect(readTweaks(memoryStorage())).toEqual({ theme: "system", palette: "sbb" });
    expect(DEFAULT_TWEAKS).toEqual(readTweaks(undefined));
  });

  it("remembers each choice under its own key", () => {
    const storage = memoryStorage();
    writeTweak(storage, "palette", "d4");
    writeTweak(storage, "theme", "dark");

    expect(readTweaks(storage)).toEqual({ theme: "dark", palette: "d4" });
    expect(storage.getItem("htco.palette")).toBe("d4");
    expect(storage.getItem("htco.theme")).toBe("dark");
  });

  it("falls back per value when a stored one is unknown", () => {
    const storage = memoryStorage();
    storage.setItem("htco.theme", "sepia");
    storage.setItem("htco.palette", "neon");

    expect(readTweaks(storage)).toEqual(DEFAULT_TWEAKS);
  });

  it("reads defaults when storage throws", () => {
    const broken: SettingsStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readTweaks(broken)).toEqual(DEFAULT_TWEAKS);
    expect(() => {
      migrateAppearance(broken);
    }).not.toThrow();
  });
});

describe("migrating what earlier versions remembered", () => {
  it("reads the retired plain palette as the gray one, and stores it so", () => {
    const storage = memoryStorage();
    storage.setItem("htco.palette", "plain");

    expect(readTweaks(storage).palette).toBe("sbb");
    migrateAppearance(storage);
    expect(storage.getItem("htco.palette")).toBe("sbb");
  });

  it("forgets the retired contrast, glass and border tweaks, and keeps the rest", () => {
    const storage = memoryStorage();
    storage.setItem("htco.theme", "dark");
    storage.setItem("htco.palette", "d4");
    storage.setItem("htco.locale", "he");
    for (const key of RETIRED_KEYS) storage.setItem(key, "3");

    migrateAppearance(storage);

    for (const key of RETIRED_KEYS) expect(storage.getItem(key), key).toBeNull();
    expect(readTweaks(storage)).toEqual({ theme: "dark", palette: "d4" });
    expect(storage.getItem("htco.locale")).toBe("he");
  });

  it("changes nothing the second time, and leaves an unknown palette for readTweaks", () => {
    const storage = memoryStorage();
    storage.setItem("htco.palette", "neon");
    migrateAppearance(storage);
    migrateAppearance(storage);
    expect(storage.getItem("htco.palette")).toBe("neon");
    expect(readTweaks(storage).palette).toBe("sbb");
  });
});

describe("applyTweaks", () => {
  it("sets the palette and an explicit theme, and removes the retired tweak attributes", () => {
    const root = document.createElement("html");
    root.dataset["t1"] = "3";
    root.dataset["t2"] = "3";
    root.dataset["t3"] = "2";

    applyTweaks({ theme: "dark", palette: "d4" }, root, false);

    expect(Object.fromEntries(Object.entries(root.dataset))).toEqual({ theme: "dark", pal: "d4" });
  });

  it("removes data-theme for the system theme, so the stylesheet follows the device live", () => {
    const root = document.createElement("html");
    root.dataset["theme"] = "dark";
    applyTweaks({ theme: "system", palette: "sbb" }, root, false);
    expect(root.hasAttribute("data-theme")).toBe(false);
  });

  it("marks the page solid when the device asks for less transparency", () => {
    const root = document.createElement("html");
    applyTweaks(DEFAULT_TWEAKS, root, true);
    expect(root.dataset["solid"]).toBe("");
    applyTweaks(DEFAULT_TWEAKS, root, false);
    expect(root.hasAttribute("data-solid")).toBe(false);
  });
});
