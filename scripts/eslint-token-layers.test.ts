import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import { tokenLayers } from "./eslint-token-layers.ts";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

const ROLES = "z-raised, z-sticky, z-popover, z-overlay, z-toast";
const error = (utility: string) => ({ messageId: "literal", data: { utility, roles: ROLES } });

describe("token-layers (the layer tokens)", () => {
  tester.run("token-layers", tokenLayers, {
    valid: [
      'const a = <div className="fixed z-overlay inset-0" />;',
      'const b = "sticky top-0 z-sticky md:z-raised";',
      // Tie-breaks inside one component, and layers behind the content.
      'const c = "relative z-[1] z-[4] z-0 -z-10";',
      // Prose is not a class list.
      'const d = "Put it on z-50 for now";',
      "const e = t`stack it at z-50`;",
    ],
    invalid: [
      {
        code: 'const a = <div className="fixed inset-0 z-50" />;',
        output: 'const a = <div className="fixed inset-0 z-overlay" />;',
        errors: [error("z-50")],
      },
      {
        code: 'const b = "sticky top-0 z-20 max-sm:z-10";',
        output: 'const b = "sticky top-0 z-sticky max-sm:z-raised";',
        errors: [error("z-20"), error("max-sm:z-10")],
      },
      {
        code: "const c = `absolute ${x} z-[60]`;",
        output: "const c = `absolute ${x} z-toast`;",
        errors: [error("z-[60]")],
      },
      // A number without a role is reported, not guessed.
      {
        code: 'const d = "fixed z-40";',
        output: null,
        errors: [error("z-40")],
      },
    ],
  });
});
