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

// Optional variants, including arbitrary and named ones (`md:`, `data-[selected]:`,
// `max-[800px]:`, `group-hover/row:`), the corner or side (`s`, `ee`, `t`…), then the value.
const LITERAL =
  /^((?:(?:[^\s:[\]]|\[[^\]]*\])+:)*)rounded(-(?:[setbrl]|ss|se|es|ee|tl|tr|bl|br))?-\[(\d+)px\]$/;

function replacement(token: string): { role: string; fixed: string } | undefined {
  const match = LITERAL.exec(token);
  if (match === null) return undefined;
  const [, variants = "", side = "", value = ""] = match;
  const role = ROLES[value];
  if (role === undefined) return undefined;
  const utility = `rounded${side}-${role}`;
  return { role: utility, fixed: `${variants}${utility}` };
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

    // Each token is checked on its own, so other class syntax in the list never hides one.
    function check(node: Rule.Node, text: string): void {
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
