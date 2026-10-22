import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import { logicalProperties } from "./eslint-logical-properties.ts";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

const error = (utility: string, logical: string) => ({
  messageId: "physical",
  data: { utility, logical },
});
const deprecated = (utility: string, logical: string) => ({
  messageId: "deprecated",
  data: { utility, logical },
});
const unpaired = (utility: string) => ({ messageId: "unpaired", data: { utility } });
const style = (property: string, logical: string) => ({
  messageId: "style",
  data: { property, logical },
});

describe("logical-properties (AC-3.1.1)", () => {
  tester.run("logical-properties", logicalProperties, {
    valid: [
      'const a = <div className="ms-4 me-2 ps-3 pe-1 inset-s-0 inset-e-0 text-start" />;',
      'const b = "border-s border-e rounded-s-card rounded-ee-card scroll-ms-2 float-start";',
      'const c = "inset-x-0 mx-auto px-4 border-x space-x-2";',
      // Prose is not a class list.
      "const d = t`Codes stay left-to-right in Hebrew`;",
      'const e = "margin-left";',
      'const e2 = "keeps codes left-to-right and mirrors right-to-left";',
      // Alignment and grid lines that only contain "start"/"end" are already logical.
      'const f = "items-start justify-end self-start col-start-2 row-end-1 place-content-end";',
      // Physical-only utilities paired with their right-to-left counterpart.
      'const g = "-translate-x-1/2 rtl:translate-x-1/2";',
      'const h = "group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 translate-x-0";',
      'const i = "origin-left rtl:origin-right";',
      // Logical inline styles, and physical keys outside a `style` attribute.
      "const j = <div style={{ insetInlineStart: 0, marginInlineEnd: 4, textAlign: 'start' }} />;",
      "const k = { left: 0, right: 1 };",
      "const l = <div data={{ left: 0 }} />;",
    ],
    invalid: [
      {
        code: 'const a = <div className="ml-4" />;',
        output: 'const a = <div className="ms-4" />;',
        errors: [error("ml-4", "ms-4")],
      },
      {
        code: 'const b = "flex left-0";',
        output: 'const b = "flex inset-s-0";',
        errors: [error("left-0", "inset-s-0")],
      },
      {
        code: 'const c = "lg:hover:pr-2";',
        output: 'const c = "lg:hover:pe-2";',
        errors: [error("lg:hover:pr-2", "lg:hover:pe-2")],
      },
      {
        code: 'const d = "-mr-1";',
        output: 'const d = "-me-1";',
        errors: [error("-mr-1", "-me-1")],
      },
      {
        code: 'const e = "text-right";',
        output: 'const e = "text-end";',
        errors: [error("text-right", "text-end")],
      },
      {
        code: 'const f = "border-l";',
        output: 'const f = "border-s";',
        errors: [error("border-l", "border-s")],
      },
      {
        code: 'const g = "rounded-tr-card";',
        output: 'const g = "rounded-se-card";',
        errors: [error("rounded-tr-card", "rounded-se-card")],
      },
      {
        code: 'const h = "right-[3px]";',
        output: 'const h = "inset-e-[3px]";',
        errors: [error("right-[3px]", "inset-e-[3px]")],
      },
      {
        code: "const i = `pl-${size}`;",
        output: "const i = `ps-${size}`;",
        errors: [error("pl-", "ps-")],
      },
      // The deprecated logical insets move to Tailwind 4.2's names.
      {
        code: 'const j = "absolute end-2.5 top-2.5 -start-5 sm:end-6";',
        output: 'const j = "absolute inset-e-2.5 top-2.5 -inset-s-5 sm:inset-e-6";',
        errors: [
          deprecated("end-2.5", "inset-e-2.5"),
          deprecated("-start-5", "-inset-s-5"),
          deprecated("sm:end-6", "sm:inset-e-6"),
        ],
      },
      { code: 'const k = "-translate-x-1/2";', errors: [unpaired("-translate-x-1/2")] },
      { code: 'const l = "origin-right";', errors: [unpaired("origin-right")] },
      { code: 'const m = "bg-linear-to-r from-ink";', errors: [unpaired("bg-linear-to-r")] },
      {
        code: "const n = <div style={{ left: 0, marginRight: 4 }} />;",
        output: "const n = <div style={{ insetInlineStart: 0, marginInlineEnd: 4 }} />;",
        errors: [style("left", "insetInlineStart"), style("marginRight", "marginInlineEnd")],
      },
      {
        code: "const o = <p style={{ textAlign: 'right' }} />;",
        output: 'const o = <p style={{ textAlign: "end" }} />;',
        errors: [style('textAlign: "right"', '"end"')],
      },
    ],
  });
});
