// Kotlin objects for Jetpack Compose. Pixel values become dp (and sp for type); 1rem is 16.
// Font families, elevation and breakpoints stay on the web: Android uses font resources and its
// own elevation model.
import { argb, camel, GENERATED_HEADER, isNative, publishedPath } from "./publish.ts";
import type { Dimension, Token } from "./tokens.ts";

const PACKAGE = "app.htco.designsystem.tokens";
const REM_IN_PX = 16;

/** Theme-independent groups and the Kotlin object each one becomes. */
const OBJECTS: [group: string, name: string][] = [
  ["space", "HtcoSpacing"],
  ["radius", "HtcoRadius"],
  ["size", "HtcoSize"],
  ["border-width", "HtcoBorderWidth"],
  ["font", "HtcoType"],
  ["motion", "HtcoMotion"],
];

const number = (value: number): string => String(Math.round(value * 1000) / 1000);
const pixels = ({ value, unit }: Dimension): number => (unit === "rem" ? value * REM_IN_PX : value);

/** A member name without the group; a leading digit keeps the group (`space.4` is `space4`). */
function memberName(token: Token): string {
  const [group = "", ...rest] = token.path;
  const name = camel(rest);
  return /^\d/.test(name) ? camel([group, ...rest]) : name;
}

function member(token: Token): string | undefined {
  switch (token.type) {
    case "dimension": {
      const unit = token.path[0] === "font" ? "sp" : "dp";
      return `val ${memberName(token)} = ${number(pixels(token.value))}.${unit}`;
    }
    case "fontWeight":
      return `val ${memberName(token)} = FontWeight(${String(token.value)})`;
    case "duration": {
      const millis = token.value.unit === "s" ? token.value.value * 1000 : token.value.value;
      return `val ${memberName(token)}Millis = ${number(millis)}`;
    }
    case "cubicBezier":
      return `val ${memberName(token)} = CubicBezierEasing(${token.value.map((n) => `${number(n)}f`).join(", ")})`;
    case "color":
    case "fontFamily":
    case "number":
    case "shadow":
      return undefined;
  }
}

const colorObject = (name: string, tokens: Token[]): string[] => [
  `    object ${name} {`,
  ...tokens.flatMap((token) =>
    token.type === "color"
      ? [`        val ${camel(publishedPath(token))} = Color(0x${argb(token.value).slice(1)})`]
      : [],
  ),
  "    }",
];

export function renderKotlin(light: Token[], dark: Token[]): string {
  const published = (tokens: Token[]) => tokens.filter(isNative);
  const lines = [
    `// ${GENERATED_HEADER}`,
    `package ${PACKAGE}`,
    "",
    "import androidx.compose.animation.core.CubicBezierEasing",
    "import androidx.compose.ui.graphics.Color",
    "import androidx.compose.ui.text.font.FontWeight",
    "import androidx.compose.ui.unit.dp",
    "import androidx.compose.ui.unit.sp",
    "",
    "object HtcoColors {",
    ...colorObject("Light", published(light)),
    "",
    ...colorObject("Dark", published(dark)),
    "}",
  ];
  for (const [group, name] of OBJECTS) {
    const members = published(light)
      .filter((token) => token.path[0] === group)
      .flatMap((token) => member(token) ?? []);
    if (members.length > 0) {
      lines.push("", `object ${name} {`, ...members.map((line) => `    ${line}`), "}");
    }
  }
  return `${lines.join("\n")}\n`;
}
