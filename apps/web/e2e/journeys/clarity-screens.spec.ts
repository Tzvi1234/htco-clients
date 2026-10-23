import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { openApp } from "./support.ts";
import { seriousViolations } from "../axe.ts";

// The clarity redesign (round 3, docs/design/round3-clarity.md): the screens with real features
// scroll as one page. No panel scrolls on its own, and no table is wider than its panel, at
// 1440×900 and at 375×812, in English and in Hebrew, on every sub-tab, with the demo's data.
// Each view has exactly one focus panel (Settings, by its part A design, has none), and axe
// finds nothing serious in the light and dark themes of both palettes (Gray and Cream).

const SCREENS = [
  ["Home", "/"],
  ["Shops", "/shops"],
  ["Orders", "/commerce/orders"],
  ["Products", "/commerce/products"],
  ["Shipping", "/commerce/shipping"],
  ["Customers", "/customers/customers"],
  ["Members & access", "/settings/team"],
  ["Security", "/settings/security"],
  ["Settings", "/settings"],
] as const;

/** Screens without a focus panel, by design. */
const NO_FOCUS = new Set<string>(["Settings"]);

/** The appearance modes axe also checks, after the default light Gray. */
const MODES = [
  ["dark", "sbb"],
  ["light", "d4"],
  ["dark", "d4"],
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
      if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1)
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
      // Three more appearance modes reload the screen and walk its views again for axe.
      test.slow();
      await page.addInitScript((value) => {
        localStorage.setItem("htco.locale", value);
      }, locale);
      await openApp(page, path, "shops");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForLoadState("networkidle");
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);

      // The first view, then every sub-tab of the screen (each is its own page of panels), in
      // the default light Gray and then in each other appearance mode (Codex review of #57: a
      // reload resets the sub-tab, so every mode walks the views again).
      const tabs = page.locator("#main [role='tablist'] [role='tab']");
      for (const mode of [undefined, ...MODES]) {
        const where = mode === undefined ? path : `${path}, ${mode[0]} ${mode[1]}`;
        if (mode !== undefined) {
          const [theme, palette] = mode;
          await page.evaluate(
            ([t, p]) => {
              localStorage.setItem("htco.theme", t);
              localStorage.setItem("htco.palette", p);
            },
            [theme, palette] as const,
          );
          await page.reload();
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
          await expect(page.locator("html")).toHaveAttribute("data-pal", palette);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          await page.waitForLoadState("networkidle");
          await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
        }
        const count = await tabs.count();
        for (let index = 0; index <= count; index += 1) {
          if (index > 0) {
            await tabs.nth(index - 1).click();
            await page.waitForLoadState("networkidle");
          }
          const view = `${where}, view ${String(index)}`;
          if (mode === undefined) {
            expect(await innerScrollers(page), view).toEqual([]);
            await expect(page.locator("#main .k-focus"), `one focus panel on ${view}`).toHaveCount(
              NO_FOCUS.has(title) ? 0 : 1,
            );
          }
          const results = await new AxeBuilder({ page })
            .exclude('[data-live-announcer] > [role="log"] > [role="img"]')
            .analyze();
          expect(seriousViolations(results), `axe on ${view}`).toEqual([]);
        }
      }
    });
  }
}
