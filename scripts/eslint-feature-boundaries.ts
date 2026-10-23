// ESLint rule: the web app's layers (CLIENT_ARCHITECTURE §4). A feature uses another feature only
// through that feature's public entry point, `features/<name>/index.ts`, never its internals; and
// `shared/` (the kit, the API layer, formatters) never imports a feature, so shared code stays
// below every feature and no import cycle can run through it.
import path from "node:path";

import type { Rule } from "eslint";

/** The feature name and the path inside it, or undefined when the file is not in a feature. */
function inFeature(file: string): { feature: string; rest: string } | undefined {
  const match = /\/src\/features\/([^/]+)\/(.+)$/.exec(file);
  if (match === null) return undefined;
  const [, feature = "", rest = ""] = match;
  return { feature, rest };
}

const slashes = (file: string) => file.split(path.sep).join("/");

export const featureBoundaries: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Features import each other only through their index.ts" },
    messages: {
      internal:
        "`{{source}}` reaches into the {{feature}} feature; import from `features/{{feature}}/index.ts`, or move the part to `shared/`.",
      shared: "`shared/` never imports a feature (`{{source}}`); move the part to `shared/`.",
    },
    schema: [],
  },
  create(context) {
    const file = slashes(context.filename);
    const from = inFeature(file);
    const inShared = file.includes("/src/shared/");
    if (from === undefined && !inShared) return {};

    function check(node: Rule.Node, source: unknown): void {
      if (typeof source !== "string" || !source.startsWith(".")) return;
      const target = inFeature(slashes(path.resolve(path.dirname(context.filename), source)));
      if (target === undefined) return;
      if (inShared) {
        context.report({ node, messageId: "shared", data: { source } });
        return;
      }
      if (target.feature === from?.feature || target.rest === "index.ts") return;
      context.report({ node, messageId: "internal", data: { source, feature: target.feature } });
    }

    return {
      ImportDeclaration(node) {
        check(node, node.source.value);
      },
      ExportNamedDeclaration(node) {
        if (node.source !== null && node.source !== undefined) check(node, node.source.value);
      },
      ExportAllDeclaration(node) {
        check(node, node.source.value);
      },
      ImportExpression(node) {
        if (node.source.type === "Literal") check(node, node.source.value);
      },
    };
  },
};
