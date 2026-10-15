import { describe, expect, it } from "vitest";

import { modeFailures } from "../src/build.ts";
import { CONTRAST_PAIRS, composite, contrastFailures, contrastRatio } from "../src/contrast.ts";
import { ALL_MODES, modeName } from "../src/modes.ts";
import { loadTokens, mixColors } from "../src/tokens.ts";
import { aColor } from "./fixtures.ts";

describe("contrastRatio (WCAG 2.2)", () => {
  it("is 21 for black on white and 1 for a colour on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#05f7f4", "#05f7f4")).toBe(1);
  });

  it("is symmetric and matches a known value", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
    expect(contrastRatio("#ffffff", "#767676")).toBeCloseTo(4.54, 2);
  });
});

describe("contrastFailures", () => {
  const tokens = [
    { path: ["color", "text", "primary"], type: "color" as const, value: aColor("#767676") },
    { path: ["color", "text", "muted"], type: "color" as const, value: aColor("#8a8a8a") },
    { path: ["color", "bg", "canvas"], type: "color" as const, value: aColor("#ffffff") },
  ];

  it("passes a pair at or above its minimum", () => {
    expect(contrastFailures(tokens, [["text.primary", "bg.canvas", 4.5]])).toEqual([]);
  });

  it("reports a text pair below 4.5:1 (AC-3.2.2)", () => {
    const [failure] = contrastFailures(tokens, [["text.muted", "bg.canvas", 4.5]]);

    expect(failure).toMatchObject({
      foreground: "text.muted",
      background: "bg.canvas",
      minimum: 4.5,
    });
    expect(failure?.ratio).toBeCloseTo(3.45, 2);
  });

  it("refuses a pair that names a missing token", () => {
    expect(() => contrastFailures(tokens, [["text.missing", "bg.canvas", 4.5]])).toThrow(
      "text.missing",
    );
  });

  describe("translucent surfaces (frosted glass)", () => {
    const glass = [
      { path: ["color", "text", "muted"], type: "color" as const, value: aColor("#646464") },
      { path: ["color", "bg", "panel"], type: "color" as const, value: aColor("#ffffff", 0.5) },
      { path: ["color", "bg", "hover"], type: "color" as const, value: aColor("#ffffff", 0.5) },
      { path: ["color", "bg", "ground"], type: "color" as const, value: aColor("#e5e5e5") },
    ];

    it("refuses one without backdrops to measure it on", () => {
      expect(() => contrastFailures(glass, [["text.muted", "bg.panel", 4.5]])).toThrow(
        "translucent",
      );
    });

    it("measures a panel over every backdrop, keeping the worst", () => {
      const [failure] = contrastFailures(
        glass,
        [["text.muted", "bg.panel", 4.5]],
        ["#ffffff", "#000000"],
      );
      // Half white over black is #808080, where #646464 reaches only 1.5:1.
      expect(failure?.ratio).toBeCloseTo(contrastRatio("#646464", "#808080"), 5);
    });

    it("measures a fill inside a panel over the panel over the backdrop", () => {
      const [failure] = contrastFailures(glass, [["text.muted", "bg.hover", 4.5]], ["#000000"]);
      expect(failure?.ratio).toBeCloseTo(contrastRatio("#646464", "#c0c0c0"), 5);
    });

    it("measures text on the ground against every backdrop sample", () => {
      const failures = contrastFailures(glass, [["text.muted", "bg.ground", 4.5]], ["#ffffff"]);
      expect(failures).toEqual([]);
      expect(contrastFailures(glass, [["text.muted", "bg.ground", 4.5]], ["#777777"])).toHaveLength(
        1,
      );
    });
  });
});

describe("composite", () => {
  it("lays a colour at its alpha over an opaque one", () => {
    expect(composite(aColor("#ffffff", 0.5), "#000000")).toBe("#808080");
    expect(composite(aColor("#ff7f36", 1), "#000000")).toBe("#ff7f36");
    expect(composite(aColor("#ff7f36", 0), "#123456")).toBe("#123456");
  });
});

describe.each(["light", "dark"] as const)("the %s theme", (theme) => {
  it("meets WCAG AA for every declared pair (AC-3.2.2)", async () => {
    const failures = contrastFailures(await loadTokens(theme), CONTRAST_PAIRS);

    expect(failures).toEqual([]);
  });

  it("checks 205 pairs: text and controls on every surface, named pairs, tags, presence flags", () => {
    expect(CONTRAST_PAIRS).toHaveLength(205);
  });
});

describe("every Design 1C mode: palette × theme × tweak levels (client ADR-0008)", () => {
  it.each(ALL_MODES.map((mode) => [modeName(mode), mode] as const))(
    "%s meets WCAG AA for every declared pair",
    async (_name, mode) => {
      expect(await modeFailures(mode)).toEqual([]);
    },
  );
});

describe("mixColors (color-mix in srgb)", () => {
  it("mixes a colour with transparency into the same colour at that alpha", () => {
    expect(mixColors(aColor("#e1e1e0"), 0.52, aColor("#000000", 0))).toMatchObject({
      hex: "#e1e1e0",
      alpha: 0.52,
    });
  });

  it("premultiplies a translucent second colour, as browsers do", () => {
    const mixed = mixColors(aColor("#e1e1e0"), 0.3, aColor("#fffaf6", 0.08));
    expect(mixed.alpha).toBeCloseTo(0.356, 3);
    expect(mixed.hex).toBe("#e6e5e3");
  });
});
