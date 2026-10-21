// ESLint rule: layout must use logical directions (start and end), never physical ones (left
// and right), so every screen mirrors in right-to-left languages (AC-3.1.1, the Hebrew RTL
// rules in docs/design/round2-review.md). It checks three places:
// - Tailwind class lists: `ml-4`, `left-0`, `text-right`… become `ms-4`, `inset-s-0`,
//   `text-end` (autofixed), and the deprecated `start-*`/`end-*` insets become
//   `inset-s-*`/`inset-e-*` (Tailwind 4.2+).
// - Utilities that have no logical form (`translate-x-*`, `origin-left`, `bg-linear-to-r`) must
//   come with an `rtl:` (or `ltr:`) partner in the same class list.
// - Inline `style` objects: `left`, `marginRight`, `textAlign: "left"`… become their logical
//   properties (`insetInlineStart`, `marginInlineEnd`, `textAlign: "start"`).
// Physical by intent (a map, a picture, a canvas): disable the rule on that line with a reason.
import type { Rule } from "eslint";

type ObjectNode = Extract<Rule.Node, { type: "ObjectExpression" }>;
type Property = Extract<ObjectNode["properties"][number], { type: "Property" }>;

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
  ["left", "inset-s"],
  ["right", "inset-e"],
  // Tailwind 4.2 renamed the logical insets; the old names are deprecated.
  ["start", "inset-s"],
  ["end", "inset-e"],
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

function splitVariants(token: string): { variants: string; negative: string; utility: string } {
  const variantEnd = token.lastIndexOf(":") + 1;
  const variants = token.slice(0, variantEnd);
  const utility = token.slice(variantEnd);
  const negative = utility.startsWith("-") ? "-" : "";
  return { variants, negative, utility: utility.slice(negative.length) };
}

/** The logical replacement for one class token, or undefined when it is not physical. */
export function logicalReplacement(token: string): string | undefined {
  const { variants, negative, utility } = splitVariants(token);
  // "left-to-right" and "right-to-left" are words about direction, not utilities.
  if (/^(?:left|right)-to-(?:left|right)$/.test(utility)) return undefined;
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

// Utilities with no logical form: each needs an `rtl:`/`ltr:` partner of the same family.
const PHYSICAL_ONLY: readonly (readonly [RegExp, string])[] = [
  [/^translate-x-(?!0$)/, "translate-x"],
  [/^origin-(?:left|right|top-left|top-right|bottom-left|bottom-right)$/, "origin"],
  [/^bg-(?:linear|gradient)-to-(?:l|r|tl|tr|bl|br)$/, "bg-linear"],
];

/** The family of a physical-only utility (`translate-x`), or undefined. */
export function physicalOnlyFamily(token: string): string | undefined {
  const { utility } = splitVariants(token);
  const normalised = utility.replace(/^bg-gradient-/, "bg-linear-");
  return PHYSICAL_ONLY.find(([pattern]) => pattern.test(normalised))?.[1];
}

function hasDirectionPartner(tokens: readonly string[], family: string): boolean {
  return tokens.some((token) => {
    if (!/(?:^|:)(?:rtl|ltr):/.test(token)) return false;
    return physicalOnlyFamily(token) === family;
  });
}

// Class lists hold only these characters; prose with capitals or punctuation is skipped.
const CLASS_LIST = /^[a-z0-9\s\-:[\]()./_%&=#>~*@!',]*$/;

// Inline style properties: physical name -> logical name.
const STYLE: Readonly<Record<string, string>> = {
  left: "insetInlineStart",
  right: "insetInlineEnd",
  marginLeft: "marginInlineStart",
  marginRight: "marginInlineEnd",
  paddingLeft: "paddingInlineStart",
  paddingRight: "paddingInlineEnd",
  borderLeft: "borderInlineStart",
  borderRight: "borderInlineEnd",
  borderLeftColor: "borderInlineStartColor",
  borderRightColor: "borderInlineEndColor",
  borderLeftWidth: "borderInlineStartWidth",
  borderRightWidth: "borderInlineEndWidth",
  borderLeftStyle: "borderInlineStartStyle",
  borderRightStyle: "borderInlineEndStyle",
  borderTopLeftRadius: "borderStartStartRadius",
  borderTopRightRadius: "borderStartEndRadius",
  borderBottomLeftRadius: "borderEndStartRadius",
  borderBottomRightRadius: "borderEndEndRadius",
  scrollMarginLeft: "scrollMarginInlineStart",
  scrollMarginRight: "scrollMarginInlineEnd",
  scrollPaddingLeft: "scrollPaddingInlineStart",
  scrollPaddingRight: "scrollPaddingInlineEnd",
};
// Properties whose physical values have logical ones.
const STYLE_VALUES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  textAlign: { left: "start", right: "end" },
  float: { left: "inline-start", right: "inline-end" },
  clear: { left: "inline-start", right: "inline-end" },
};

function propertyName(property: Property): string | undefined {
  if (property.computed) return undefined;
  if (property.key.type === "Identifier") return property.key.name;
  if (property.key.type === "Literal" && typeof property.key.value === "string") {
    return property.key.value;
  }
  return undefined;
}

/** True when an object literal is the value of a JSX `style` attribute. */
function isStyleObject(node: Rule.Node): boolean {
  const container = node.parent;
  if (container === null || (container.type as string) !== "JSXExpressionContainer") return false;
  const attribute = (container as unknown as { parent: { type: string; name?: { name?: string } } })
    .parent;
  return attribute.type === "JSXAttribute" && attribute.name?.name === "style";
}

export const logicalProperties: Rule.RuleModule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: { description: "Require logical (start/end) layout instead of left/right" },
    messages: {
      physical:
        "`{{utility}}` is a physical direction and will not mirror in right-to-left layouts; use `{{logical}}`.",
      deprecated: "`{{utility}}` uses Tailwind's deprecated logical inset name; use `{{logical}}`.",
      unpaired:
        "`{{utility}}` has no logical form; pair it with an `rtl:` variant so it mirrors in right-to-left layouts.",
      style:
        "`{{property}}` is a physical direction and will not mirror in right-to-left layouts; use `{{logical}}`.",
    },
    schema: [],
  },
  create(context) {
    const source = context.sourceCode;

    function check(node: Rule.Node, text: string): void {
      if (!CLASS_LIST.test(text)) return;
      const tokens = text.split(/\s+/).filter((token) => token !== "");
      for (const token of tokens) {
        const logical = logicalReplacement(token);
        if (logical !== undefined) {
          const { utility } = splitVariants(token);
          context.report({
            node,
            messageId: /^(?:start|end)-/.test(utility) ? "deprecated" : "physical",
            data: { utility: token, logical },
            fix: (fixer) => {
              const raw = source.getText(node);
              const fixed = raw.replace(
                /(?<=^|[\s"'`}])([^\s"'`{}$]+)(?=$|[\s"'`$])/g,
                (part) => logicalReplacement(part) ?? part,
              );
              return fixer.replaceText(node, fixed);
            },
          });
          continue;
        }
        const family = physicalOnlyFamily(token);
        if (
          family !== undefined &&
          !/(?:^|:)(?:rtl|ltr):/.test(token) &&
          !hasDirectionPartner(tokens, family)
        ) {
          context.report({ node, messageId: "unpaired", data: { utility: token } });
        }
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
      ObjectExpression(node) {
        if (!isStyleObject(node)) return;
        for (const property of node.properties) {
          if (property.type !== "Property") continue;
          const name = propertyName(property);
          if (name === undefined) continue;
          const logical = STYLE[name];
          if (logical !== undefined) {
            context.report({
              node: property,
              messageId: "style",
              data: { property: name, logical },
              fix: (fixer) => fixer.replaceText(property.key, logical),
            });
            continue;
          }
          const values = STYLE_VALUES[name];
          const value = property.value;
          if (
            values !== undefined &&
            value.type === "Literal" &&
            typeof value.value === "string" &&
            values[value.value] !== undefined
          ) {
            const logicalValue = values[value.value] ?? value.value;
            context.report({
              node: property,
              messageId: "style",
              data: { property: `${name}: "${value.value}"`, logical: `"${logicalValue}"` },
              fix: (fixer) => fixer.replaceText(value, JSON.stringify(logicalValue)),
            });
          }
        }
      },
    };
  },
};
