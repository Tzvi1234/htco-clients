import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { openApp } from "./support.ts";
import { seriousViolations } from "../axe.ts";

// The clarity redesign (round 3, docs/design/round3-clarity.md): the screens with real features
// scroll as one page. No panel scrolls on its own, and no table is wider than its panel, at
// 1440×900 and at 375×812, in English and in Hebrew, on every sub-tab, with the demo's data.

const SCREENS = [
  ["Home", "/"],
  ["Shops", "/shops"],
  ["Orders", "/commerce/orders"],
  ["Products", "/commerce/products"],
  ["Shipping", "/commerce/shipping"],
  ["Customers", "/customers/customers"],
  ["Members & access", "/settings/team"],
  ["Security", "/settings/security"],
] as const;

/** Every element inside the screen that scrolls up and down on its own, or a table too wide. */
async function innerScrollers(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const found: string[] = [];
    const main = document.getElementById("main");
    if (main === null) return ["no main"];
    for (const element of main.querySelectorAll<HTMLElement>("*")) {
      // The page itself scrolls (the one column of the screen); nothing inside it may.
      if (element.hasAttribute("data-page-scroll")) continue;
      const style = getComputedStyle(element);
      if (
        /(auto|scroll)/.test(style.overflowY) &&
        element.scrollHeight > element.clientHeight + 1
      )
        found.push(`scrolls: ${element.tagName.toLowerCase()}.${element.className.slice(0, 80)}`);
      const box = element.parentElement;
      if (element.tagName === "TABLE" && box !== null && box.scrollWidth > box.clientWidth + 1)
        found.push(`too wide: ${element.getAttribute("aria-label") ?? "table"}`);
    }
    return found;
  });
}

for (const locale of ["en", "he"] as const) {
  for (const [title, path] of SCREENS) {
    test(`${title} scrolls as one page, no panel on its own (${locale})`, async ({ page }) => {
      await page.addInitScript((value) => {
        localStorage.setItem("htco.locale", value);
      }, locale);
      await openApp(page, path, "shops");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForLoadState("networkidle");
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);

      // The first view, then every sub-tab of the screen (each is its own page of panels).
      const tabs = page.locator("#main [role='tablist'] [role='tab']");
      const count = await tabs.count();
      for (let index = 0; index <= count; index += 1) {
        if (index > 0) {
          await tabs.nth(index - 1).click();
          await page.waitForLoadState("networkidle");
        }
        expect(await innerScrollers(page), `${path}, view ${String(index)}`).toEqual([]);
      }
      const results = await new AxeBuilder({ page })
        .exclude('[data-live-announcer] > [role="log"] > [role="img"]')
        .analyze();
      expect(seriousViolations(results), `axe on ${path}`).toEqual([]);
    });
  }
}
