// ESLint rule: a corner radius that has a role token is written with that role, never as a
// literal (`rounded-[6px]` -> `rounded-control`), so a change to the shape scale reaches every
// screen (DESIGN.md `rounded`, apps/web/src/styles.css "Radii by role"). Autofixed.
// Values without a role (8px, 10px…) are left alone; give them a role first.
import type { Rule } from "eslint";

// Literal pixel value -> its role, matching the tokens in styles.css.
const ROLES: Readonly<Record<string, string>> = {
  "4": "tag",
  "6": "control",
  "12": "menu-item",
  "16": "card",
  "22": "panel",
};

// The corner or side (`s`, `ee`, `t`…), then the literal value.
const LITERAL = /^rounded(-(?:[setbrl]|ss|se|es|ee|tl|tr|bl|br))?-\[(\d+)px\]$/;

/** Splits `md:data-[a]:rounded-[4px]` into its variants and utility, at top-level colons only,
 * so arbitrary variants with nested brackets (`[&>[data-active]+span]:`) stay whole. */
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

function replacement(token: string): { role: string; fixed: string } | undefined {
  const { variants, utility } = splitVariants(token);
  const match = LITERAL.exec(utility);
  if (match === null) return undefined;
  const [, side = "", value = ""] = match;
  const role = ROLES[value];
  if (role === undefined) return undefined;
  const fixed = `rounded${side}-${role}`;
  return { role: fixed, fixed: `${variants}${fixed}` };
}

export const tokenRadii: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: { description: "Require radius role tokens instead of literal radii" },
    messages: {
      literal: "`{{utility}}` is a literal radius with a role; use `{{role}}`.",
    },
    schema: [],
  },
  create(context) {
    const source = context.sourceCode;

    // Each token is checked on its own, so other class syntax in the list never hides one; a
    // string with a capital outside brackets is prose (a message, a title), never a class list.
    function check(node: Rule.Node, text: string): void {
      if (/[A-Z]/.test(text.replace(/\[[^\]]*\]/g, ""))) return;
      for (const token of text.split(/\s+/)) {
        const found = replacement(token);
        if (found === undefined) continue;
        context.report({
          node,
          messageId: "literal",
          data: { utility: token, role: found.role },
          fix: (fixer) =>
            fixer.replaceText(
              node,
              source
                .getText(node)
                .replace(
                  /(?<=^|[\s"'`}])([^\s"'`{}$]+)(?=$|[\s"'`$])/g,
                  (part) => replacement(part)?.fixed ?? part,
                ),
            ),
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
