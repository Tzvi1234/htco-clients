// The stylesheet half of the logical-layout rule (eslint-logical-properties.ts covers class
// lists and inline styles): a declaration in the web app's CSS may not use a physical direction
// (`margin-left`, `right:`, `text-align: left`, a four-value `margin`/`padding`/`inset` whose
// left and right differ…), so every screen mirrors in right-to-left languages. A rule that is
// physical by intent (a map, a picture, a canvas overlay) says so with a `/* physical: why */`
// comment inside its block. The test (css-logical-properties.test.ts) scans every stylesheet.
// `node scripts/css-logical-properties.ts` prints the findings.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

export interface CssFinding {
  line: number;
  declaration: string;
  logical: string;
}

const PROPERTY: readonly (readonly [RegExp, string])[] = [
  [/^(margin|padding|scroll-margin|scroll-padding)-(left|right)$/, "$1-inline-start/end"],
  [/^border-(left|right)(-(?:color|style|width))?$/, "border-inline-start/end$2"],
  [
    /^border-(top|bottom)-(left|right)-radius$/,
    "border-start-start/start-end/end-start/end-end-radius",
  ],
  [/^(left|right)$/, "inset-inline-start/end"],
];
const VALUE: Readonly<Record<string, string>> = {
  "text-align": "start/end",
  float: "inline-start/inline-end",
  clear: "inline-start/inline-end",
};
const FOUR_VALUES = new Set(["margin", "padding", "inset", "scroll-margin", "scroll-padding"]);

/** Splits a value on top-level spaces (keeps `calc(a - b)` whole). */
function values(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of value.trim()) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (/\s/.test(char) && depth === 0) {
      if (current !== "") parts.push(current);
      current = "";
    } else current += char;
  }
  if (current !== "") parts.push(current);
  return parts;
}

function check(property: string, value: string): string | undefined {
  for (const [pattern, logical] of PROPERTY) {
    if (pattern.test(property)) return property.replace(pattern, logical);
  }
  const logicalValue = VALUE[property];
  if (logicalValue !== undefined && /^(left|right)$/.test(value.trim())) {
    return `${property}: ${logicalValue}`;
  }
  if (FOUR_VALUES.has(property)) {
    const parts = values(value.replace(/!important/, ""));
    if (parts.length === 4 && parts[1] !== parts[3]) {
      return `${property}-block and ${property}-inline (start and end)`;
    }
  }
  return undefined;
}

/** Physical declarations in one stylesheet, except in blocks marked `/* physical: … *\/`. */
export function physicalDeclarations(css: string): CssFinding[] {
  const findings: CssFinding[] = [];
  // Blocks are found by braces; comments are kept so a block can carry its exemption.
  const stack: { exempt: boolean; findings: CssFinding[] }[] = [];
  let line = 1;
  let buffer = "";
  let comment = false;
  for (let index = 0; index < css.length; index++) {
    const char = css[index] ?? "";
    const next = css[index + 1] ?? "";
    if (char === "\n") line++;
    if (comment) {
      buffer += char;
      if (char === "*" && next === "/") {
        buffer += "/";
        index++;
        comment = false;
        if (buffer.includes("physical:") && stack.length > 0) {
          const block = stack[stack.length - 1];
          if (block !== undefined) block.exempt = true;
        }
        buffer = "";
      }
      continue;
    }
    if (char === "/" && next === "*") {
      comment = true;
      buffer = "/*";
      index++;
      continue;
    }
    if (char === "{") {
      stack.push({ exempt: false, findings: [] });
      buffer = "";
      continue;
    }
    if (char === ";" || char === "}") {
      const declaration = buffer.trim();
      const match = /^([a-z-]+)\s*:\s*([\s\S]+)$/.exec(declaration);
      const block = stack[stack.length - 1];
      if (match !== null && block !== undefined) {
        const logical = check(match[1] ?? "", match[2] ?? "");
        if (logical !== undefined) {
          block.findings.push({ line, declaration: declaration.replace(/\s+/g, " "), logical });
        }
      }
      buffer = "";
      if (char === "}") {
        const closed = stack.pop();
        if (closed !== undefined && !closed.exempt) findings.push(...closed.findings);
      }
      continue;
    }
    buffer += char;
  }
  return findings;
}

/** Every stylesheet under a directory. */
export function stylesheets(directory: string): string[] {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

if (import.meta.main) {
  const root = join(import.meta.dirname, "..", "apps", "web", "src");
  let count = 0;
  for (const file of stylesheets(root)) {
    for (const finding of physicalDeclarations(readFileSync(file, "utf8"))) {
      count++;
      console.log(
        `${relative(process.cwd(), file)}:${String(finding.line)}  ${finding.declaration}  → ${finding.logical}`,
      );
    }
  }
  process.exitCode = count === 0 ? 0 : 1;
}
