// ESLint rule: Tailwind utilities must use logical directions (start and end), never physical
// ones (left and right), so every layout mirrors in right-to-left languages (AC-3.1.1).
import type { Rule } from "eslint";

// Physical utility -> its logical equivalent. Longer prefixes first.
const LOGICAL: readonly (readonly [string, string])[] = [
  ["rounded-tl", "rounded-ss"],
  ["rounded-tr", "rounded-se"],
  ["rounded-bl", "rounded-es"],
  ["rounded-br", "rounded-ee"],
  ["rounded-l", "rounded-s"],
  ["rounded-r", "rounded-e"],
  ["border-l", "border-s"],
  ["border-r", "border-e"],
  ["scroll-ml", "scroll-ms"],
  ["scroll-mr", "scroll-me"],
  ["scroll-pl", "scroll-ps"],
  ["scroll-pr", "scroll-pe"],
  ["text-left", "text-start"],
  ["text-right", "text-end"],
  ["float-left", "float-start"],
  ["float-right", "float-end"],
  ["clear-left", "clear-start"],
  ["clear-right", "clear-end"],
  ["left", "start"],
  ["right", "end"],
  ["ml", "ms"],
  ["mr", "me"],
  ["pl", "ps"],
  ["pr", "pe"],
];

// Utilities that are complete on their own; the others need a value (`ml-4`, `left-0`).
const STANDALONE = new Set([
  "border-l",
  "border-r",
  "rounded-l",
  "rounded-r",
  "rounded-tl",
  "rounded-tr",
  "rounded-bl",
  "rounded-br",
  "text-left",
  "text-right",
  "float-left",
  "float-right",
  "clear-left",
  "clear-right",
]);

/** The logical replacement for one class token, or undefined when it is not physical. */
export function logicalReplacement(token: string): string | undefined {
  const variantEnd = token.lastIndexOf(":") + 1;
  const variants = token.slice(0, variantEnd);
  let utility = token.slice(variantEnd);
  const negative = utility.startsWith("-") ? "-" : "";
  utility = utility.slice(negative.length);
  for (const [physical, logical] of LOGICAL) {
    if (utility === physical && STANDALONE.has(physical)) {
      return `${variants}${negative}${logical}`;
    }
    if (utility.startsWith(`${physical}-`)) {
      return `${variants}${negative}${logical}${utility.slice(physical.length)}`;
    }
  }
  return undefined;
}

// Class lists hold only these characters; prose with capitals or punctuation is skipped.
const CLASS_LIST = /^[a-z0-9\s\-:[\]()./_%&=#>~*@!',]*$/;

function check(context: Rule.RuleContext, node: Rule.Node, text: string): void {
  if (!CLASS_LIST.test(text)) return;
  for (const token of text.split(/\s+/)) {
    if (token === "") continue;
    const logical = logicalReplacement(token);
    if (logical !== undefined) {
      context.report({ node, messageId: "physical", data: { utility: token, logical } });
    }
  }
}

export const logicalProperties: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Require logical (start/end) Tailwind utilities instead of left/right" },
    messages: {
      physical:
        "`{{utility}}` is a physical direction and will not mirror in right-to-left layouts; use `{{logical}}`.",
    },
    schema: [],
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === "string") check(context, node, node.value);
      },
      TemplateElement(node) {
        // Translated text (t`…`) is prose, not classes.
        const template = node.parent;
        if (template.parent?.type === "TaggedTemplateExpression") return;
        check(context, node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};
