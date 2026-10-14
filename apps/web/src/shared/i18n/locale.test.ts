import { describe, expect, it } from "vitest";

import { applyLocale, directionOf, initialLocale, rememberLocale } from "./locale.ts";
import { memoryStorage } from "../lib/storage.ts";

describe("locale", () => {
  it("is right-to-left for Hebrew and left-to-right for English", () => {
    expect(directionOf("he")).toBe("rtl");
    expect(directionOf("en")).toBe("ltr");
  });

  it("applies lang and dir to the document root (AC-3.3.1)", () => {
    const root = document.createElement("html");

    applyLocale("he", root);
    expect([root.lang, root.dir]).toEqual(["he", "rtl"]);

    applyLocale("en", root);
    expect([root.lang, root.dir]).toEqual(["en", "ltr"]);
  });

  it("prefers the remembered choice", () => {
    const storage = memoryStorage();
    rememberLocale("en", storage);

    expect(initialLocale(storage, ["he-IL"])).toBe("en");
  });

  it.each([
    [["he-IL", "en-US"], "he"],
    [["iw"], "he"],
    [["en-GB"], "en"],
    [["fr-FR"], "en"],
    [[], "en"],
  ] as const)(
    "follows the browser languages %j without a remembered choice",
    (languages, locale) => {
      expect(initialLocale(memoryStorage(), languages)).toBe(locale);
    },
  );

  it("ignores a remembered value that is not a supported locale", () => {
    const storage = memoryStorage();
    storage.setItem("htco.locale", "de");

    expect(initialLocale(storage, ["he"])).toBe("he");
  });
});
