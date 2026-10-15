import { defineConfig, devices } from "@playwright/test";

const CI = process.env["CI"] !== undefined;

/**
 * Browser tests outside Vitest (`pnpm test:e2e`). Screenshots differ between operating systems
 * and font rasterizers, so baselines are made and compared only in the Playwright Docker image
 * that CI uses (`mcr.microsoft.com/playwright`, Linux); elsewhere the screenshot assertions are
 * skipped and every other check (axe, behaviour) still runs. How to update baselines:
 * docs/features/web-shell/operations.md.
 */
export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFileName}/{arg}{ext}",
  ignoreSnapshots: process.platform !== "linux",
  // CI never writes a missing baseline; a missing or different screenshot fails the run.
  updateSnapshots: CI ? "none" : "missing",
  fullyParallel: true,
  forbidOnly: CI,
  retries: 0,
  workers: CI ? 4 : "50%",
  reporter: CI ? [["list"], ["html", { open: "never" }]] : "list",
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0 },
  },
  use: {
    ...devices["Desktop Chrome"],
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    {
      // Every Storybook story in he/en × light/dark: axe and a screenshot (AC-3.4.1, AC-3.4.3).
      name: "components",
      testDir: "e2e/components",
      use: { baseURL: "http://127.0.0.1:6006", viewport: { width: 800, height: 600 } },
    },
  ],
  webServer: [
    {
      // The built Storybook (`pnpm storybook:build`), served as static files.
      command:
        "node node_modules/vite/bin/vite.js preview --outDir storybook-static --host 127.0.0.1 --port 6006 --strictPort",
      url: "http://127.0.0.1:6006/index.json",
      reuseExistingServer: !CI,
    },
  ],
});
