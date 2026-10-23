import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import { tokenRadii } from "./eslint-token-radii.ts";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

const error = (utility: string, role: string) => ({
  messageId: "literal",
  data: { utility, role },
});

describe("token-radii (DESIGN.md radius roles)", () => {
  tester.run("token-radii", tokenRadii, {
    valid: [
      'const a = <div className="rounded-tag rounded-control rounded-card rounded-panel" />;',
      'const b = "rounded-menu-item rounded-pill rounded-s-card rounded-ee-control";',
      // Off-scale values have no role yet; they are reported in the audit, not here.
      'const c = "rounded-[8px] rounded-[10px] rounded-[2px]";',
      // Prose is not a class list.
      "const d = t`Corners are rounded-[4px] in the spec`;",
    ],
    invalid: [
      {
        code: 'const a = <a className="rounded-[4px] py-1" />;',
        output: 'const a = <a className="rounded-tag py-1" />;',
        errors: [error("rounded-[4px]", "rounded-tag")],
      },
      {
        code: 'const b = "h-5 rounded-[6px] border";',
        output: 'const b = "h-5 rounded-control border";',
        errors: [error("rounded-[6px]", "rounded-control")],
      },
      {
        code: 'const c = "flex h-9 rounded-[12px] px-3";',
        output: 'const c = "flex h-9 rounded-menu-item px-3";',
        errors: [error("rounded-[12px]", "rounded-menu-item")],
      },
      {
        code: 'const d = "rounded-[16px] md:rounded-[22px]";',
        output: 'const d = "rounded-card md:rounded-panel";',
        errors: [
          error("rounded-[16px]", "rounded-card"),
          error("md:rounded-[22px]", "rounded-panel"),
        ],
      },
      {
        code: 'const e = "rounded-s-[6px]";',
        output: 'const e = "rounded-s-control";',
        errors: [error("rounded-s-[6px]", "rounded-s-control")],
      },
    ],
  });
});
