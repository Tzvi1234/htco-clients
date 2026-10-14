import { describe, expect, it } from "vitest";

import { applyTheme, initialTheme, rememberTheme } from "./theme.ts";
import { memoryStorage } from "../lib/storage.ts";

describe("theme (AC-3.3.3)", () => {
  it("follows the system by default", () => {
    expect(initialTheme(memoryStorage())).toBe("system");
  });

  it("uses the choice remembered on this device", () => {
    const storage = memoryStorage();
    rememberTheme("dark", storage);

    expect(initialTheme(storage)).toBe("dark");
  });

  it("ignores an unknown remembered value", () => {
    const storage = memoryStorage();
    storage.setItem("htco.theme", "sepia");

    expect(initialTheme(storage)).toBe("system");
  });

  it("sets data-theme for an explicit choice and removes it to follow the system", () => {
    const root = document.createElement("html");

    applyTheme("dark", root);
    expect(root.dataset["theme"]).toBe("dark");

    applyTheme("light", root);
    expect(root.dataset["theme"]).toBe("light");

    applyTheme("system", root);
    expect(root.hasAttribute("data-theme")).toBe(false);
  });
});
