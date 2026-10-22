import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { physicalDeclarations, stylesheets } from "./css-logical-properties.ts";

const lines = (css: string) =>
  physicalDeclarations(css).map(({ line, declaration }) => ({ line, declaration }));

describe("physicalDeclarations", () => {
  it("accepts logical declarations and symmetric shorthands", () => {
    const css = `.a {
  margin-inline-start: 4px;
  padding-inline: 8px 16px;
  inset-inline-end: 0;
  text-align: start;
  margin: 0 8px 8px;
  inset: -8px -3px;
  padding: 1px 2px 3px 2px;
  border-inline-start: 1px solid;
  translate: calc(-12px * var(--htco-direction, 1)) 0;
}`;
    expect(lines(css)).toEqual([]);
  });

  it("finds physical properties, values and asymmetric four-value shorthands", () => {
    const css = `.a {
  margin-left: 4px;
  right: 20px;
  border-right-color: red;
  border-top-left-radius: 4px;
  text-align: left;
  float: right;
  padding: 0 4px 0 8px;
  inset: 0 auto 0 calc(1px + 2px);
}`;
    expect(lines(css).map(({ declaration }) => declaration)).toEqual([
      "margin-left: 4px",
      "right: 20px",
      "border-right-color: red",
      "border-top-left-radius: 4px",
      "text-align: left",
      "float: right",
      "padding: 0 4px 0 8px",
      "inset: 0 auto 0 calc(1px + 2px)",
    ]);
    expect(lines(css)[0]?.line).toBe(2);
  });

  it("skips a block that says why it is physical, and only that block", () => {
    const css = `/* physical: unrelated comment outside any block */
.map-label {
  /* physical: positioned by the 3D projection, which is left-to-right */
  left: 0;
}
.legend {
  left: 20px;
}
@media (max-width: 600px) {
  .legend {
    right: 0;
  }
}`;
    expect(lines(css).map(({ declaration }) => declaration)).toEqual(["left: 20px", "right: 0"]);
  });

  it("ignores physical words in comments and in other properties", () => {
    const css = `.a {
  /* margin-left: 4px; would not mirror */
  transition: left 1s;
  scroll-snap-align: start;
}`;
    expect(lines(css)).toEqual([]);
  });
});

describe("the web app's stylesheets (Hebrew RTL)", () => {
  it("use logical directions, or say why a block is physical", () => {
    const root = join(import.meta.dirname, "..", "apps", "web", "src");
    const files = stylesheets(root);
    expect(files.length).toBeGreaterThan(3);
    const findings = files.flatMap((file) =>
      physicalDeclarations(readFileSync(file, "utf8")).map(
        ({ line, declaration }) => `${relative(root, file)}:${String(line)} ${declaration}`,
      ),
    );
    expect(findings).toEqual([]);
  });
});
