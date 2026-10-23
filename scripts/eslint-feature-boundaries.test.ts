import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import { featureBoundaries } from "./eslint-feature-boundaries.ts";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester();

const SHOPS = "/repo/apps/web/src/features/shops/ShopsPage.tsx";
const FLOOR = "/repo/apps/web/src/features/office/floor3d/scene.ts";
const KIT = "/repo/apps/web/src/shared/ui/kit/live.tsx";
const ROUTER = "/repo/apps/web/src/app/router.tsx";

describe("feature-boundaries (CLIENT_ARCHITECTURE §4)", () => {
  tester.run("feature-boundaries", featureBoundaries, {
    valid: [
      // Inside one feature, and from a feature's subfolder back into it.
      { filename: SHOPS, code: 'import { ShopCard } from "./ShopCard.tsx";' },
      { filename: FLOOR, code: 'import { palette } from "../FloorPage.tsx";' },
      // Another feature through its entry point.
      { filename: SHOPS, code: 'import { useCodeMessage } from "../auth/index.ts";' },
      // Shared code and packages.
      { filename: SHOPS, code: 'import { cx } from "../../shared/lib/cx.ts";' },
      { filename: SHOPS, code: 'import { useQuery } from "@tanstack/react-query";' },
      { filename: KIT, code: 'import { cx } from "../../lib/cx.ts";' },
      // The app composes the features (routes, shell); the rule is about features and shared.
      { filename: ROUTER, code: 'import { ShopsPage } from "../features/shops/ShopsPage.tsx";' },
    ],
    invalid: [
      {
        filename: SHOPS,
        code: 'import { LiveNote } from "../commerce/live.tsx";',
        errors: [{ messageId: "internal" }],
      },
      {
        filename: FLOOR,
        code: 'import { useAgent } from "../../work/agents.ts";',
        errors: [{ messageId: "internal" }],
      },
      {
        filename: SHOPS,
        code: 'export { FormAlert } from "../auth/AuthLayout.tsx";',
        errors: [{ messageId: "internal" }],
      },
      {
        filename: SHOPS,
        code: 'export * from "../auth/AuthLayout.tsx";',
        errors: [{ messageId: "internal" }],
      },
      {
        filename: SHOPS,
        code: 'const page = import("../team/TeamPage.tsx");',
        languageOptions: { ecmaVersion: 2022, sourceType: "module" },
        errors: [{ messageId: "internal" }],
      },
      // Shared code never reaches up into a feature, not even through its entry point.
      {
        filename: KIT,
        code: 'import { NoShopYet } from "../../../features/shops/index.ts";',
        errors: [{ messageId: "shared" }],
      },
    ],
  });
});
