import { describe, expect, it } from "vitest";

import { CONTRAST_PAIRS, contrastFailures, contrastRatio } from "../src/contrast.ts";
import { loadTokens } from "../src/tokens.ts";
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
});

describe.each(["light", "dark"] as const)("the %s theme", (theme) => {
  it("meets WCAG AA for every declared pair (AC-3.2.2)", async () => {
    const failures = contrastFailures(await loadTokens(theme), CONTRAST_PAIRS);

    expect(failures).toEqual([]);
  });

  it("checks 170 pairs: text and controls on every surface, named pairs, tags, presence flags, the ink sidebar", () => {
    expect(CONTRAST_PAIRS).toHaveLength(170);
  });
});
