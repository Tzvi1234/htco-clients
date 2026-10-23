import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { GENERATED_DIR, renderAll } from "../src/build.ts";
import { loadTokens } from "../src/tokens.ts";

// Rendering loads every palette and tweak overlay, which takes a few seconds on a busy machine.
describe("the generated outputs", { timeout: 60_000 }, () => {
  it("are exactly what the token sources produce (AC-3.2.1)", async () => {
    const outputs = await renderAll();

    for (const [name, content] of Object.entries(outputs)) {
      const committed = readFileSync(join(GENERATED_DIR, name), "utf8");
      expect(committed, `${name} is stale: run \`pnpm tokens\` and commit the result`).toBe(
        content,
      );
    }
  });

  it("are the CSS, Kotlin and XAML files", async () => {
    expect(Object.keys(await renderAll()).sort()).toEqual([
      "HtcoTokens.kt",
      "HtcoTokens.xaml",
      "htco-tokens.css",
    ]);
  });
});

describe("loadTokens", () => {
  it("resolves semantic references to concrete values with a type", async () => {
    const tokens = await loadTokens("light");
    const panel = tokens.find((token) => token.path.join(".") === "color.bg.panel");

    expect(panel).toMatchObject({ type: "color", value: { hex: "#ffffff" } });
  });

  it("remembers when a semantic token names another one, and resolves it too", async () => {
    const tokens = await loadTokens("light");
    const canvas = tokens.find((token) => token.path.join(".") === "color.bg.canvas");

    expect(canvas).toMatchObject({ alias: ["color", "bg", "panel"], value: { hex: "#ffffff" } });
  });

  it("applies overlays in order, a later file winning", async () => {
    const tokens = await loadTokens("light", undefined, ["modes/palette-d4.light.json"]);
    const value = (name: string) =>
      tokens.find((token) => token.path.join(".") === name)?.type === "color"
        ? tokens.find((token) => token.path.join(".") === name)
        : undefined;

    expect(value("color.bg.ground")).toMatchObject({ value: { hex: "#f3f4ee" } });
    expect(value("color.bg.canvas")).toMatchObject({ value: { hex: "#ffffff" } });
  });

  it("gives the same token paths in both themes", async () => {
    const paths = async (theme: "light" | "dark") =>
      (await loadTokens(theme)).map((token) => token.path.join(".")).sort();

    expect(await paths("dark")).toEqual(await paths("light"));
  });
});
