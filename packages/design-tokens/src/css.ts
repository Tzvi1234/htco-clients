// CSS custom properties for the web app. The default palette's light theme and the primitives
// sit on :root, its dark theme on [data-theme="dark"] and, when the user has not chosen a theme,
// on a dark system preference. Each palette and tweak overlay (modes.ts) follows in its own
// cascade layer, so a later layer wins whatever the selectors; inside a layer the dark rule is
// one attribute more specific than the light one.
import { cssColor, GENERATED_HEADER, isPublished, isThemed, publishedPath } from "./publish.ts";
import type { Dimension, ShadowLayer, Token } from "./tokens.ts";

const GENERIC_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "emoji",
  "math",
  "fangsong",
  "-apple-system",
]);

const dimension = ({ value, unit }: Dimension): string => `${String(value)}${unit}`;

const shadow = (layers: ShadowLayer[]): string =>
  layers.length === 0
    ? "none"
    : layers
        .map((layer) =>
          [
            ...(layer.inset === true ? ["inset"] : []),
            dimension(layer.offsetX),
            dimension(layer.offsetY),
            dimension(layer.blur),
            dimension(layer.spread),
            cssColor(layer.color),
          ].join(" "),
        )
        .join(", ");

const propertyName = (path: string[]): string =>
  `--${(path[0] === "color" ? path.slice(1) : path).join("-")}`;

function cssValue(token: Token): string {
  // A semantic alias stays a link, so it follows its target in every palette and tweak.
  if (token.alias !== undefined) return `var(${propertyName(token.alias)})`;
  // Glass mixes its base in the page, so it follows the base in every palette and tweak.
  if (token.mix !== undefined) {
    const { base, amount, with: other } = token.mix;
    const share = `${String(Math.round(amount * 10000) / 100)}%`;
    const second = (other.alpha ?? 1) === 0 ? "transparent" : cssColor(other);
    return `color-mix(in srgb, var(${propertyName(base)}) ${share}, ${second})`;
  }
  switch (token.type) {
    case "color":
      return cssColor(token.value);
    case "dimension":
      return dimension(token.value);
    case "duration":
      return `${String(token.value.value)}${token.value.unit}`;
    case "cubicBezier":
      return `cubic-bezier(${token.value.join(", ")})`;
    case "fontFamily":
      return token.value
        .map((name) => (GENERIC_FAMILIES.has(name) ? name : JSON.stringify(name)))
        .join(", ");
    case "fontWeight":
    case "number":
      return String(token.value);
    case "shadow":
      return shadow(token.value);
  }
}

const declarations = (tokens: Token[], indent: string): string =>
  tokens
    .map((token) => `${indent}--${publishedPath(token).join("-")}: ${cssValue(token)};`)
    .join("\n");

/** One overlay: the attributes on :root it needs, and the tokens it sets in each theme. */
export interface CssOverlay {
  when: string;
  /** A descendant selector the overlay applies inside (scoped overlays, modes.ts). */
  scope?: string;
  light: Token[];
  dark: Token[];
}

export interface CssLayer {
  layer: string;
  overlays: CssOverlay[];
}

export const LAYER_PREFIX = "htco-tokens";

const block = (selector: string, tokens: Token[], indent: string): string[] => [
  `${indent}${selector} {`,
  declarations(tokens, `${indent}  `),
  `${indent}}`,
];

/** Light on `:root<when>`; dark on `[data-theme="dark"]` and on a dark system preference. */
function themedBlocks(
  when: string,
  light: Token[],
  dark: Token[],
  indent: string,
  scope?: string,
): string[] {
  const inside = scope === undefined ? "" : ` ${scope}`;
  const root = `:root${when}${inside}`;
  const explicit =
    when === "" && scope === undefined
      ? '[data-theme="dark"]'
      : `:root${when}[data-theme="dark"]${inside}`;
  const system = `:root${when}:not([data-theme="light"])${inside}`;
  return [
    ...block(root, light, indent),
    "",
    ...block(explicit, dark, indent),
    "",
    `${indent}@media (prefers-color-scheme: dark) {`,
    ...block(system, dark, `${indent}  `),
    `${indent}}`,
  ];
}

export function renderCss(light: Token[], dark: Token[], layers: CssLayer[] = []): string {
  const root = light.filter(isPublished);
  const darkThemed = dark.filter((token) => isPublished(token) && isThemed(token));
  const lines = [`/* ${GENERATED_HEADER} */`, ""];
  if (layers.length === 0) {
    lines.push(...themedBlocks("", root, darkThemed, ""), "");
    return lines.join("\n");
  }
  const names = ["base", ...layers.map(({ layer }) => layer)];
  lines.push(`@layer ${names.map((name) => `${LAYER_PREFIX}.${name}`).join(", ")};`, "");
  lines.push(`@layer ${LAYER_PREFIX}.base {`, ...themedBlocks("", root, darkThemed, "  "), "}");
  for (const { layer, overlays } of layers) {
    lines.push("", `@layer ${LAYER_PREFIX}.${layer} {`);
    overlays.forEach(({ when, scope, light: overlayLight, dark: overlayDark }, index) => {
      if (index > 0) lines.push("");
      lines.push(...themedBlocks(when, overlayLight, overlayDark, "  ", scope));
    });
    lines.push("}");
  }
  lines.push("");
  return lines.join("\n");
}
