// Build the platform outputs from design/tokens into generated/, after checking contrast.
// `pnpm tokens` (from the repository root) runs it; CI fails when the committed outputs drift.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { CONTRAST_PAIRS, contrastFailures } from "./contrast.ts";
import { renderCss } from "./css.ts";
import { renderKotlin } from "./kotlin.ts";
import { loadTokens, TOKENS_DIR } from "./tokens.ts";
import { renderXaml } from "./xaml.ts";

export const GENERATED_DIR = fileURLToPath(new URL("../generated/", import.meta.url));

/** The content of every generated file, by file name. */
export async function renderAll(tokensDir = TOKENS_DIR): Promise<Record<string, string>> {
  const [light, dark] = await Promise.all([
    loadTokens("light", tokensDir),
    loadTokens("dark", tokensDir),
  ]);
  return {
    "htco-tokens.css": renderCss(light, dark),
    "HtcoTokens.kt": renderKotlin(light, dark),
    "HtcoTokens.xaml": renderXaml(light, dark),
  };
}

async function main(): Promise<number> {
  for (const theme of ["light", "dark"] as const) {
    const failures = contrastFailures(await loadTokens(theme), CONTRAST_PAIRS);
    for (const { foreground, background, minimum, ratio } of failures) {
      process.stderr.write(
        `${theme}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1 (needs ${String(minimum)}:1)\n`,
      );
    }
    if (failures.length > 0) return 1;
  }
  mkdirSync(GENERATED_DIR, { recursive: true });
  for (const [name, content] of Object.entries(await renderAll())) {
    writeFileSync(join(GENERATED_DIR, name), content);
  }
  return 0;
}

if (import.meta.main) process.exitCode = await main();
