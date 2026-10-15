import { defineConfig, devices } from "@playwright/test";

const CI = process.env["CI"] !== undefined;

/** The projects named with `--project` on the command line; empty means all of them. */
const NAMED = process.argv.flatMap((arg, index, args) => {
  if (arg === "--project") return [args[index + 1] ?? ""];
  return arg.startsWith("--project=") ? [arg.slice("--project=".length)] : [];
});

/** A web server starts only when a project that needs it runs (journeys need no Storybook). */
const needed = (prefix: string) =>
  NAMED.length === 0 || NAMED.some((name) => name.startsWith(prefix));

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
  // A missing baseline is written for review and still fails the test; a screenshot that differs
  // from its baseline fails and never overwrites it (CI uploads both for review).
  updateSnapshots: "missing",
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
      use: { baseURL: "http://127.0.0.1:6006" },
    },
    // Journeys through the app on its in-memory API, each with axe and screenshots, on a wide
    // screen and a phone (slice 3.3 part 2).
    ...(
      [
        ["journeys-desktop", { width: 1440, height: 900 }],
        ["journeys-phone", { width: 375, height: 812 }],
      ] as const
    ).map(([name, viewport]) => ({
      name,
      testDir: "e2e/journeys",
      // A journey is several screens long, and the development server compiles each module on
      // its first request, so the first journeys in a run are slow.
      timeout: 90_000,
      snapshotPathTemplate: "{testDir}/__screenshots__/{testFileName}/{arg}-{projectName}{ext}",
      use: {
        baseURL: "http://127.0.0.1:5173",
        viewport,
        locale: "en-US",
        timezoneId: "Asia/Jerusalem",
        colorScheme: "light" as const,
      },
    })),
  ],
  webServer: [
    ...(needed("journeys")
      ? [
          {
            // The app's development server: `?demo` runs it on the in-memory API (src/main.tsx).
            command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort",
            url: "http://127.0.0.1:5173",
            reuseExistingServer: !CI,
          },
        ]
      : []),
    ...(needed("components")
      ? [
          {
            // The built Storybook (`pnpm storybook:build`), served as static files.
            command:
              "node node_modules/vite/bin/vite.js preview --outDir storybook-static --host 127.0.0.1 --port 6006 --strictPort",
            url: "http://127.0.0.1:6006/index.json",
            reuseExistingServer: !CI,
          },
        ]
      : []),
  ],
});
