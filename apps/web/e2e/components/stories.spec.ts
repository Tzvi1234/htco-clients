import { readFileSync } from "node:fs";

import AxeBuilder from "@axe-core/playwright";
import { expect, test as base, type Page } from "@playwright/test";

import { seriousViolations } from "../axe.ts";

interface IndexEntry {
  id: string;
  title: string;
  name: string;
  type: "story" | "docs";
}

// The stories of the built Storybook (`pnpm storybook:build` writes storybook-static/).
const index = JSON.parse(
  readFileSync(new URL("../../storybook-static/index.json", import.meta.url), "utf8"),
) as { entries: Record<string, IndexEntry> };
const stories = Object.values(index.entries).filter((entry) => entry.type === "story");

/** The built Storybook, served by the `components` project's web server (playwright.config.ts). */
const STORYBOOK = "http://127.0.0.1:6006";

const LOCALES = ["en", "he"] as const;
const THEMES = ["light", "dark"] as const;

/** Waits until the story has rendered and its play function (if any) has finished. */
async function storyReady(page: Page): Promise<void> {
  const phase = await page.waitForFunction(() => {
    const preview = (
      window as unknown as { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } }
    ).__STORYBOOK_PREVIEW__;
    const current = preview?.currentRender?.phase;
    return current === "finished" || current === "errored" || current === "aborted"
      ? current
      : false;
  });
  expect(await phase.jsonValue()).toBe("finished");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/**
 * One page per worker, reused by its tests: Storybook's bundle then loads from the browser cache
 * instead of once per test, which keeps the 4 × stories cases fast. Every test still navigates,
 * so each story starts from a fresh document.
 */
const test = base.extend<object, { storyPage: Page }>({
  storyPage: [
    async ({ browser }, use) => {
      const context = await browser.newContext({
        viewport: { width: 800, height: 600 },
        reducedMotion: "reduce",
      });
      await use(await context.newPage());
      await context.close();
    },
    { scope: "worker" },
  ],
});

test("the built Storybook has stories", () => {
  expect(stories.length).toBeGreaterThan(0);
});

for (const story of stories) {
  for (const locale of LOCALES) {
    for (const theme of THEMES) {
      test(`${story.title} / ${story.name} (${locale}, ${theme})`, async ({ storyPage: page }) => {
        await page.goto(
          `${STORYBOOK}/iframe.html?id=${story.id}&viewMode=story&globals=locale:${locale};theme:${theme}`,
        );
        await storyReady(page);
        const frame = page.locator("[data-story-frame]");
        await expect(frame).toBeVisible();

        // AC-3.4.1: no serious or critical axe violation in any language or theme.
        const results = await new AxeBuilder({ page }).include("#storybook-root").analyze();
        expect(seriousViolations(results)).toEqual([]);

        // AC-3.4.3: the component's look in he/en × light/dark.
        await expect(frame).toHaveScreenshot(`${story.id}--${locale}-${theme}.png`);
      });
    }
  }
}
