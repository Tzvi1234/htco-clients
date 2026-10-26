import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import app from "./vite.config.ts";

const here = fileURLToPath(new URL(".", import.meta.url));

// Every story as a test in a real browser (slice 3.4): it renders, its play function (keyboard
// and focus interaction tests) passes, and axe finds no violation (AC-3.4.1, AC-3.4.2).
// `pnpm test:storybook`; kept apart from `pnpm test` (jsdom), which needs no browser.
export default defineConfig({
  root: here,
  plugins: [...(app.plugins ?? []), storybookTest({ configDir: `${here}.storybook` })],
  optimizeDeps: {
    // Pre-bundled up front, so the first story does not reload the page mid-run.
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-aria-components",
      "@lingui/core",
      "@lingui/react",
    ],
  },
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
