import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";

import { seriousViolations } from "../axe.ts";

/**
 * Opens the app on the in-memory API (`?demo`, development server only; `src/test/fakeApi.ts`):
 * signed in as an Owner with the authenticator app set up, or signed out. The fake lives in the
 * page, so a journey stays in one page load; `path` may carry a `#fragment`.
 */
export async function openApp(
  page: Page,
  path: string,
  as: "signed-in" | "signed-out",
): Promise<void> {
  // Dates on screen (signed-in devices) do not move between runs.
  await page.clock.setFixedTime(new Date("2026-10-15T09:00:00Z"));
  const [route = "/", fragment] = path.split("#");
  const demo = as === "signed-in" ? "demo" : "demo=signed-out";
  await page.goto(`${route}?${demo}${fragment === undefined ? "" : `#${fragment}`}`);
}

/** The page's title: every screen has exactly one h1. */
export function pageTitle(page: Page, name: string): Locator {
  return page.getByRole("heading", { level: 1, name, exact: true });
}

/**
 * A stop in a journey: no serious or critical axe violation on the whole page, and a screenshot
 * at this project's viewport (1440×900 or 375×812).
 */
export async function checkpoint(page: Page, name: string): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const results = await new AxeBuilder({ page })
    // React Aria's hidden live region announces a pending button's end through
    // `aria-labelledby` pointing at that button; after a submit that navigates (sign-in, MFA,
    // accepting an invitation) the button is gone while the announcement waits 7 s to be
    // removed. It has no content of its own; everything else on the page is checked.
    .exclude('[data-live-announcer] > [role="log"] > [role="img"]')
    .analyze();
  expect(seriousViolations(results), `axe on "${name}"`).toEqual([]);
  await expect(page).toHaveScreenshot(`${name}.png`);
}

/** Opens the account menu (sidebar on wide screens, tab bar on phones). */
export async function openAccountMenu(page: Page, label = "Account and preferences") {
  await page.getByRole("button", { name: label }).click();
}
