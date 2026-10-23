// The web app's stylesheets write a font size that is on the type scale as its token
// (`font-size: 12px` -> `var(--font-size-caption)`), so a change to the scale reaches every
// screen (DESIGN.md typography, packages/design-tokens). Sizes off the scale (11px, 12.5px) are
// listed in docs/reviews/2026-10-23-architecture-audit.md until the design gives them a step.
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { stylesheets } from "./css-logical-properties.ts";

const repo = join(import.meta.dirname, "..");

/** `16px` -> `--font-size-title-sm`, read from the generated tokens. */
function typeScale(): Map<string, string> {
  const tokens = readFileSync(
    join(repo, "packages", "design-tokens", "generated", "htco-tokens.css"),
    "utf8",
  );
  const scale = new Map<string, string>();
  for (const [, name, value] of tokens.matchAll(/(--font-size-[a-z-]+):\s*([\d.]+px);/g)) {
    if (name !== undefined && value !== undefined && !scale.has(value)) scale.set(value, name);
  }
  return scale;
}

describe("the web app's stylesheets (type scale)", () => {
  it("write every on-scale font size as its token", () => {
    const scale = typeScale();
    expect(scale.size).toBeGreaterThan(8);
    const root = join(repo, "apps", "web", "src");
    const findings = stylesheets(root).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((text, index) => {
          const size = /font-size:\s*([\d.]+px)\s*[;}]/.exec(text)?.[1];
          if (size === undefined) return [];
          const token = scale.get(size);
          if (token === undefined) return [];
          return [`${relative(root, file)}:${String(index + 1)} ${size} -> var(${token})`];
        }),
    );
    expect(findings).toEqual([]);
  });
});
