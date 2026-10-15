// Load the DTCG token sources for one theme with Style Dictionary, which merges the files and
// resolves references, and return a typed, flat list of tokens with their raw values.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";
import type { DesignTokens } from "style-dictionary/types";

export interface DtcgColor {
  colorSpace: string;
  components: (number | "none")[];
  alpha?: number;
  hex: string;
}

export interface Dimension {
  value: number;
  unit: "px" | "rem";
}

export interface Duration {
  value: number;
  unit: "ms" | "s";
}

export interface ShadowLayer {
  color: DtcgColor;
  offsetX: Dimension;
  offsetY: Dimension;
  blur: Dimension;
  spread: Dimension;
  inset?: boolean;
}

export type Token = {
  path: string[];
  /** Set when the source names another semantic token (`{color.bg.panel}`): CSS keeps the link. */
  alias?: string[];
  /** Set for a colour mixed from another token (frosted glass): CSS writes the color-mix. */
  mix?: Mix;
} & (
  | { type: "color"; value: DtcgColor }
  | { type: "dimension"; value: Dimension }
  | { type: "duration"; value: Duration }
  | { type: "cubicBezier"; value: [number, number, number, number] }
  | { type: "fontFamily"; value: string[] }
  | { type: "fontWeight"; value: number }
  | { type: "shadow"; value: ShadowLayer[] }
  | { type: "number"; value: number }
);

export type Theme = "light" | "dark";

/** `design/tokens/` at the repository root, the single source of truth. */
export const TOKENS_DIR = fileURLToPath(new URL("../../../design/tokens/", import.meta.url));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isColor = (value: unknown): value is DtcgColor =>
  isRecord(value) &&
  typeof value["colorSpace"] === "string" &&
  Array.isArray(value["components"]) &&
  typeof value["hex"] === "string";

const isDimension = (value: unknown): value is Dimension =>
  isRecord(value) &&
  typeof value["value"] === "number" &&
  (value["unit"] === "px" || value["unit"] === "rem");

const isDuration = (value: unknown): value is Duration =>
  isRecord(value) &&
  typeof value["value"] === "number" &&
  (value["unit"] === "ms" || value["unit"] === "s");

const isShadowLayer = (value: unknown): value is ShadowLayer =>
  isRecord(value) &&
  isColor(value["color"]) &&
  ["offsetX", "offsetY", "blur", "spread"].every((key) => isDimension(value[key]));

function toToken(path: string[], declaredType: unknown, value: unknown): Token {
  // Semantic tokens are bare references; after resolution their value says what they are.
  const type = typeof declaredType === "string" ? declaredType : isColor(value) ? "color" : "";
  if (type === "color" && isColor(value)) return { path, type, value };
  if (type === "dimension" && isDimension(value)) return { path, type, value };
  if (type === "duration" && isDuration(value)) return { path, type, value };
  if (type === "fontWeight" && typeof value === "number") return { path, type, value };
  if (type === "number" && typeof value === "number") return { path, type, value };
  if (type === "fontFamily" && Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return { path, type, value };
  }
  if (type === "cubicBezier" && Array.isArray(value) && value.length === 4) {
    const items: readonly unknown[] = value;
    const [x1, y1, x2, y2] = items;
    if (
      typeof x1 === "number" &&
      typeof y1 === "number" &&
      typeof x2 === "number" &&
      typeof y2 === "number"
    ) {
      return { path, type, value: [x1, y1, x2, y2] };
    }
  }
  if (type === "shadow" && Array.isArray(value) && value.every(isShadowLayer)) {
    return { path, type, value };
  }
  throw new Error(
    `${path.join(".")}: unsupported ${type || "untyped"} token ${JSON.stringify(value)}`,
  );
}

/** A reference to another semantic token (not a primitive), which CSS keeps as `var()`. */
const SEMANTIC_REFERENCE = /^\{((?:color|elevation)\.[^{}]+)\}$/;

/**
 * Every token of `theme`: the primitives in `base.json`, `semantic.<theme>.json`, then each
 * overlay (a palette or a tweak level, `modes/*.json`) in order, a later file winning.
 */
export async function loadTokens(
  theme: Theme,
  tokensDir = TOKENS_DIR,
  overlays: readonly string[] = [],
): Promise<Token[]> {
  // A later file replaces a whole token (a shadow's layers are not merged index by index, as
  // Style Dictionary's own deep merge of sources would), so the files are merged here.
  const tokens: DesignTokens = {};
  for (const name of ["base.json", `semantic.${theme}.json`, ...overlays]) {
    const source: unknown = JSON.parse(readFileSync(join(tokensDir, name), "utf8"));
    mergeTokens(tokens, source);
  }
  const dictionary = new StyleDictionary({
    tokens,
    usesDtcg: true,
    log: { verbosity: "silent" },
    platforms: { raw: { transforms: [] } },
  });
  const { allTokens } = await dictionary.getPlatformTokens("raw");
  return allTokens.map((token) => {
    const value: unknown = token.$value;
    const typed = toToken(token.path, token.$type, value);
    const original: unknown = token.original.$value;
    const reference = typeof original === "string" ? SEMANTIC_REFERENCE.exec(original) : null;
    const extensions: unknown = token["$extensions"];
    const mix = isRecord(extensions) ? toMix(extensions[MIX_EXTENSION]) : undefined;
    return {
      ...typed,
      ...(reference?.[1] === undefined ? {} : { alias: reference[1].split(".") }),
      ...(mix === undefined ? {} : { mix }),
    };
  });
}

/** Merge DTCG trees: groups merge, a token (an object with `$value`) is replaced whole. */
function mergeTokens(target: Record<string, unknown>, source: unknown): void {
  if (!isRecord(source)) return;
  for (const [key, value] of Object.entries(source)) {
    const current = target[key];
    if (isRecord(value) && !("$value" in value) && isRecord(current) && !("$value" in current)) {
      mergeTokens(current, value);
    } else {
      target[key] = structuredClone(value);
    }
  }
}

/**
 * `$extensions["app.htco.mix"]`: the colour is `color-mix(in srgb, <base> <amount>, <with>)`,
 * as Design 1C writes its glass, so it follows whatever the base is in the mode (contrast
 * level, palette). `$value` holds the result for the default base.
 */
export const MIX_EXTENSION = "app.htco.mix";

export interface Mix {
  /** The token mixed in, as a path (`color.bg.panel-base`). */
  base: string[];
  /** The share of the base, from 0 to 1. */
  amount: number;
  /** The other colour; usually fully transparent. */
  with: DtcgColor;
}

function toMix(value: unknown): Mix | undefined {
  if (!isRecord(value)) return undefined;
  const { base, amount, with: other } = value;
  if (typeof base !== "string" || typeof amount !== "number" || !isColor(other)) {
    throw new Error(`${MIX_EXTENSION} needs base, amount and with: ${JSON.stringify(value)}`);
  }
  return { base: base.split("."), amount, with: other };
}

/** `color-mix(in srgb, a amount, b)`: premultiplied sRGB, as browsers compute it. */
export function mixColors(a: DtcgColor, amount: number, b: DtcgColor): DtcgColor {
  const channels = (color: DtcgColor) =>
    [1, 3, 5].map((offset) => parseInt(color.hex.slice(offset, offset + 2), 16) / 255);
  const alphaA = (a.alpha ?? 1) * amount;
  const alphaB = (b.alpha ?? 1) * (1 - amount);
  const alpha = alphaA + alphaB;
  const [ca, cb] = [channels(a), channels(b)];
  const components = ca.map((value, index) =>
    alpha === 0 ? 0 : (value * alphaA + (cb[index] ?? 0) * alphaB) / alpha,
  );
  const hex = `#${components
    .map((value) =>
      Math.round(value * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
  return { colorSpace: "srgb", components, alpha, hex };
}
