// Load the DTCG token sources for one theme with Style Dictionary, which merges the files and
// resolves references, and return a typed, flat list of tokens with their raw values.
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";

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
  // Style Dictionary reads `source` as glob patterns, which need forward slashes.
  const source = ["base.json", `semantic.${theme}.json`, ...overlays].map((name) =>
    join(tokensDir, name).replaceAll("\\", "/"),
  );
  const dictionary = new StyleDictionary({
    source,
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
    return reference?.[1] === undefined ? typed : { ...typed, alias: reference[1].split(".") };
  });
}
