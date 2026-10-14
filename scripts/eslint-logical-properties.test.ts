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

describe("logical-properties (AC-3.1.1)", () => {
  tester.run("logical-properties", logicalProperties, {
    valid: [
      'const a = <div className="ms-4 me-2 ps-3 pe-1 start-0 end-0 text-start" />;',
      'const b = "border-s border-e rounded-s-card rounded-ee-card scroll-ms-2 float-start";',
      'const c = "inset-x-0 mx-auto px-4 border-x space-x-2";',
      // Prose is not a class list.
      "const d = t`Codes stay left-to-right in Hebrew`;",
      'const e = "margin-left";',
    ],
    invalid: [
      { code: 'const a = <div className="ml-4" />;', errors: [error("ml-4", "ms-4")] },
      { code: 'const b = "flex left-0";', errors: [error("left-0", "start-0")] },
      { code: 'const c = "lg:hover:pr-2";', errors: [error("lg:hover:pr-2", "lg:hover:pe-2")] },
      { code: 'const d = "-mr-1";', errors: [error("-mr-1", "-me-1")] },
      { code: 'const e = "text-right";', errors: [error("text-right", "text-end")] },
      { code: 'const f = "border-l";', errors: [error("border-l", "border-s")] },
      {
        code: 'const g = "rounded-tr-card";',
        errors: [error("rounded-tr-card", "rounded-se-card")],
      },
      { code: 'const h = "right-[3px]";', errors: [error("right-[3px]", "end-[3px]")] },
      { code: "const i = `pl-${size}`;", errors: [error("pl-", "ps-")] },
    ],
  });
});
