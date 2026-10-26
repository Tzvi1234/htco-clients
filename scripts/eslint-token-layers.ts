// ESLint rule: what stacks above the page uses a layer role (`z-raised`, `z-sticky`, `z-popover`,
// `z-overlay`, `z-toast`; the `layer` tokens in design/tokens/base.json), never a number
// (`z-50`, `z-[40]`), so the order of bars, menus, dialogs and toasts has one source. A tie-break
// inside one component (`z-[1]` to `z-[9]`, `z-0`, negative values) stays allowed. Autofixed
// where the number has a role.
import type { Rule } from "eslint";

// Literal value -> its role, matching the tokens.
const ROLES: Readonly<Record<string, string>> = {
  "10": "raised",
  "20": "sticky",
  "30": "popover",
  "50": "overlay",
  "60": "toast",
};

// `z-50` or `z-[50]`; negative values (`-z-10`) start with a minus and do not match.
const LITERAL = /^z-(?:(\d+)|\[(\d+)\])$/;

/** Splits `md:data-[a]:z-50` into its variants and utility, at top-level colons only. */
function splitVariants(token: string): { variants: string; utility: string } {
  let depth = 0;
  let end = 0;
  for (let index = 0; index < token.length; index++) {
    const char = token[index];
    if (char === "[") depth++;
    else if (char === "]") depth = Math.max(0, depth - 1);
    else if (char === ":" && depth === 0) end = index + 1;
  }
  return { variants: token.slice(0, end), utility: token.slice(end) };
}

function finding(token: string): { value: string; fixed: string | undefined } | undefined {
  const { variants, utility } = splitVariants(token);
  const match = LITERAL.exec(utility);
  if (match === null) return undefined;
  const value = match[1] ?? match[2] ?? "";
  if (Number(value) < 10) return undefined;
  const role = ROLES[value];
  return { value, fixed: role === undefined ? undefined : `${variants}z-${role}` };
}

export const tokenLayers: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: { description: "Require layer role tokens instead of numeric z-index utilities" },
    messages: {
      literal: "`{{utility}}` is a numeric layer; use a layer role ({{roles}}).",
    },
    schema: [],
  },
  create(context) {
    const source = context.sourceCode;
    const roles = Object.values(ROLES)
      .map((role) => `z-${role}`)
      .join(", ");

    function check(node: Rule.Node, text: string): void {
      // A string with a capital outside brackets is prose, never a class list.
      if (/[A-Z]/.test(text.replace(/\[[^\]]*\]/g, ""))) return;
      for (const token of text.split(/\s+/)) {
        const found = finding(token);
        if (found === undefined) continue;
        const fixable = found.fixed !== undefined;
        context.report({
          node,
          messageId: "literal",
          data: { utility: token, roles },
          ...(fixable
            ? {
                fix: (fixer: Rule.RuleFixer) =>
                  fixer.replaceText(
                    node,
                    source
                      .getText(node)
                      .replace(
                        /(?<=^|[\s"'`}])([^\s"'`{}$]+)(?=$|[\s"'`$])/g,
                        (part) => finding(part)?.fixed ?? part,
                      ),
                  ),
              }
            : {}),
        });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value);
      },
      TemplateElement(node) {
        // Translated text (t`…`) is prose, not classes.
        const template = node.parent;
        if (template.parent?.type === "TaggedTemplateExpression") return;
        check(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};
