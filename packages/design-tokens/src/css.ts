// CSS custom properties for the web app: light on :root, dark on [data-theme="dark"] and, when
// the user has not chosen a theme, on a dark system preference.
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
  layers
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

function cssValue(token: Token): string {
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
      return String(token.value);
    case "shadow":
      return shadow(token.value);
  }
}

const declarations = (tokens: Token[], indent: string): string =>
  tokens
    .map((token) => `${indent}--${publishedPath(token).join("-")}: ${cssValue(token)};`)
    .join("\n");

export function renderCss(light: Token[], dark: Token[]): string {
  const root = light.filter(isPublished);
  const darkThemed = dark.filter((token) => isPublished(token) && isThemed(token));
  return [
    `/* ${GENERATED_HEADER} */`,
    "",
    ":root {",
    declarations(root, "  "),
    "}",
    "",
    '[data-theme="dark"] {',
    declarations(darkThemed, "  "),
    "}",
    "",
    "@media (prefers-color-scheme: dark) {",
    '  :root:not([data-theme="light"]) {',
    declarations(darkThemed, "    "),
    "  }",
    "}",
    "",
  ].join("\n");
}
