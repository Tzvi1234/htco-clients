import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { overlayPaths } from "../src/build.ts";
import { ALL_MODES, CSS_LAYERS, hasBloom, overlaysFor, type Mode } from "../src/modes.ts";
import { TOKENS_DIR } from "../src/tokens.ts";

const DEFAULT: Mode = { palette: "sbb", theme: "light", contrast: 1, glass: 1, borders: 1 };

describe("overlaysFor", () => {
  it("adds nothing for the default palette at the normal levels", () => {
    expect(overlaysFor(DEFAULT)).toEqual([]);
  });

  it("stacks palette, contrast, borders and glass in cascade order", () => {
    expect(overlaysFor({ ...DEFAULT, theme: "dark", contrast: 3, borders: 2, glass: 2 })).toEqual([
      "modes/contrast-3.dark.json",
      "modes/borders-2.dark.json",
      "modes/glass-2.dark.json",
    ]);
  });

  it("ignores contrast and borders in Design 4, where the palette sets them, but keeps glass", () => {
    expect(overlaysFor({ ...DEFAULT, palette: "d4", contrast: 3, borders: 3, glass: 3 })).toEqual([
      "modes/palette-d4.light.json",
      "modes/glass-3.light.json",
      "modes/glass-3-d4.light.json",
    ]);
  });

  it("treats the plain ground as the default palette's tokens", () => {
    expect(overlaysFor({ ...DEFAULT, palette: "plain", glass: 2 })).toEqual(
      overlaysFor({ ...DEFAULT, glass: 2 }),
    );
  });
});

describe("hasBloom", () => {
  it("shows the designed ground only behind glass, and never on the plain ground", () => {
    expect(hasBloom(DEFAULT)).toBe(false);
    expect(hasBloom({ ...DEFAULT, glass: 2 })).toBe(true);
    expect(hasBloom({ ...DEFAULT, palette: "d4", glass: 3 })).toBe(true);
    expect(hasBloom({ ...DEFAULT, palette: "plain", glass: 3 })).toBe(false);
  });
});

describe("ALL_MODES", () => {
  it("covers 27 tweak combinations per theme for sbb and plain, and the 3 glass levels for d4", () => {
    expect(ALL_MODES).toHaveLength(2 * 27 + 2 * 27 + 2 * 3);
  });
});

describe("the overlay files", () => {
  const rules = CSS_LAYERS.flatMap(({ rules: layerRules }) => layerRules);

  it("exist for every CSS rule and theme", () => {
    for (const { file } of rules) {
      for (const theme of ["light", "dark"] as const) {
        expect(existsSync(join(TOKENS_DIR, file(theme))), file(theme)).toBe(true);
      }
    }
  });

  it("set the same tokens in light and dark, so a dark rule always overrides its light rule", () => {
    for (const { file } of rules) {
      expect([...overlayPaths(file("dark"))].sort(), file("dark")).toEqual(
        [...overlayPaths(file("light"))].sort(),
      );
    }
  });
});

describe("strong glass at contrast level 3", () => {
  it("keeps more of the panel, as the design does, in the default palettes only", () => {
    expect(overlaysFor({ ...DEFAULT, contrast: 3, glass: 3 })).toContain(
      "modes/glass-3-contrast-3.light.json",
    );
    expect(overlaysFor({ ...DEFAULT, palette: "d4", contrast: 3, glass: 3 })).not.toContain(
      "modes/glass-3-contrast-3.light.json",
    );
  });
});

describe("the navigation's fixed glass", () => {
  it("is the glass level 2 overlay scoped to [data-glass], off under reduced transparency", () => {
    const layer = CSS_LAYERS.find(({ layer: name }) => name === "nav-glass");
    expect(layer?.rules.map(({ when, scope, file }) => [when, scope, file("light")])).toEqual([
      [":not([data-solid])", "[data-glass]", "modes/glass-2.light.json"],
      ['[data-pal="d4"]:not([data-solid])', "[data-glass]", "modes/glass-2-d4.light.json"],
    ]);
    expect(CSS_LAYERS.at(-1)?.layer).toBe("nav-glass");
  });
});
