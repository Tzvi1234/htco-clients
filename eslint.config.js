// ESLint for every TypeScript file in the repository: the strictest type-aware rule sets of
// typescript-eslint, React hooks rules for the web app, and logical (RTL-safe) CSS utilities.
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

import { logicalProperties } from "./scripts/eslint-logical-properties.ts";

export default defineConfig(
  globalIgnores([
    "**/node_modules/",
    "**/dist/",
    "**/coverage/",
    "packages/*/generated/",
    "apps/web/playwright-report/",
    "apps/web/test-results/",
    "apps/web/storybook-static/",
  ]),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat["recommended-latest"]],
    languageOptions: { globals: globals.browser },
    plugins: { htco: { rules: { "logical-properties": logicalProperties } } },
    rules: { "htco/logical-properties": "error" },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
