// Build the platform outputs from design/tokens into generated/, after checking contrast in every
// mode. `pnpm tokens` (from the repository root) runs it; CI fails when the outputs drift.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { backdropsOf, CONTRAST_PAIRS, contrastFailures, type ContrastFailure } from "./contrast.ts";
import { renderCss, type CssLayer } from "./css.ts";
import { renderKotlin } from "./kotlin.ts";
import { ALL_MODES, CSS_LAYERS, hasBloom, modeName, overlaysFor, type Mode } from "./modes.ts";
import { loadTokens, TOKENS_DIR, type Theme, type Token } from "./tokens.ts";
import { renderXaml } from "./xaml.ts";

export const GENERATED_DIR = fileURLToPath(new URL("../generated/", import.meta.url));

/** The token paths an overlay file sets (its leaves), as `a.b.c`. */
export function overlayPaths(file: string, tokensDir = TOKENS_DIR): Set<string> {
  const paths = new Set<string>();
  const walk = (node: unknown, path: string[]): void => {
    if (typeof node !== "object" || node === null) return;
    if ("$value" in node) {
      paths.add(path.join("."));
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (!key.startsWith("$")) walk(child, [...path, key]);
    }
  };
  walk(JSON.parse(readFileSync(join(tokensDir, file), "utf8")), []);
  return paths;
}

async function overlayTokens(file: string, theme: Theme, tokensDir: string): Promise<Token[]> {
  const paths = overlayPaths(file, tokensDir);
  const tokens = await loadTokens(theme, tokensDir, [file]);
  return tokens.filter((token) => paths.has(token.path.join(".")));
}

async function cssLayers(tokensDir: string): Promise<CssLayer[]> {
  return Promise.all(
    CSS_LAYERS.map(async ({ layer, rules }) => ({
      layer,
      overlays: await Promise.all(
        rules.map(async ({ when, file }) => ({
          when,
          light: await overlayTokens(file("light"), "light", tokensDir),
          dark: await overlayTokens(file("dark"), "dark", tokensDir),
        })),
      ),
    })),
  );
}

/** The content of every generated file, by file name. */
export async function renderAll(tokensDir = TOKENS_DIR): Promise<Record<string, string>> {
  const [light, dark, layers] = await Promise.all([
    loadTokens("light", tokensDir),
    loadTokens("dark", tokensDir),
    cssLayers(tokensDir),
  ]);
  return {
    "htco-tokens.css": renderCss(light, dark, layers),
    "HtcoTokens.kt": renderKotlin(light, dark),
    "HtcoTokens.xaml": renderXaml(light, dark),
  };
}

/** Every pair below its minimum in one mode. */
export async function modeFailures(mode: Mode, tokensDir = TOKENS_DIR): Promise<ContrastFailure[]> {
  const tokens = await loadTokens(mode.theme, tokensDir, overlaysFor(mode));
  return contrastFailures(tokens, CONTRAST_PAIRS, backdropsOf(tokens, hasBloom(mode)));
}

async function main(): Promise<number> {
  let failed = false;
  for (const mode of ALL_MODES) {
    for (const { foreground, background, minimum, ratio } of await modeFailures(mode)) {
      failed = true;
      process.stderr.write(
        `${modeName(mode)}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1 (needs ${String(minimum)}:1)\n`,
      );
    }
  }
  if (failed) return 1;
  mkdirSync(GENERATED_DIR, { recursive: true });
  for (const [name, content] of Object.entries(await renderAll())) {
    writeFileSync(join(GENERATED_DIR, name), content);
  }
  return 0;
}

if (import.meta.main) process.exitCode = await main();
