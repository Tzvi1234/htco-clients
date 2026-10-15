import { describe, expect, it } from "vitest";

import { TWEAKS_BOOT_SCRIPT } from "./boot.ts";
import { applyTweaks, readTweaks } from "./tweaks.ts";

/** Runs the inline script index.html carries, as the browser does before the first paint. */
function boot(): Record<string, string | undefined> {
  const root = document.documentElement;
  for (const name of ["theme", "pal", "t1", "t2", "t3"]) root.removeAttribute(`data-${name}`);
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call -- runs index.html's inline script as the browser does
  new Function(TWEAKS_BOOT_SCRIPT)();
  return Object.fromEntries(Object.entries(root.dataset));
}

/** What the app applies once it starts, for the same stored values. */
function app(): Record<string, string | undefined> {
  const root = document.createElement("html");
  applyTweaks(readTweaks(localStorage), root);
  return Object.fromEntries(Object.entries(root.dataset));
}

describe("the tweaks boot script (before first paint, client ADR-0008)", () => {
  it("applies the defaults when nothing is remembered", () => {
    expect(boot()).toEqual({ pal: "sbb", t1: "1", t2: "1", t3: "1" });
  });

  it("applies what this origin remembered, exactly as the app will", () => {
    localStorage.setItem("htco.theme", "dark");
    localStorage.setItem("htco.palette", "d4");
    localStorage.setItem("htco.contrast", "3");
    localStorage.setItem("htco.glass", "2");
    localStorage.setItem("htco.borders", "2");

    expect(boot()).toEqual({ theme: "dark", pal: "d4", t1: "3", t2: "2", t3: "2" });
    expect(boot()).toEqual(app());
  });

  it("ignores values the app would ignore", () => {
    localStorage.setItem("htco.theme", "sepia");
    localStorage.setItem("htco.palette", "neon");
    localStorage.setItem("htco.glass", "9");

    expect(boot()).toEqual(app());
  });

  it("leaves the page usable when storage is blocked", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("blocked");
      },
    });
    try {
      expect(boot()).toEqual({ pal: "sbb", t1: "1", t2: "1", t3: "1" });
    } finally {
      if (original !== undefined) Object.defineProperty(window, "localStorage", original);
    }
  });
});
