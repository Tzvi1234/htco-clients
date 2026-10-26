import { expect, test } from "@playwright/test";

import { checkpoint, openApp, pageTitle } from "./support.ts";

// Admin › Automations on the demo's registry: three live order automations and two drafts, one
// dead-lettered run. Axe and a screenshot at each stop, in Hebrew and English, light and dark.

for (const [locale, scheme] of [
  ["he", "light"],
  ["en", "light"],
  ["he", "dark"],
] as const) {
  test(`the automations, the chosen one's runs and the dead-lettered run, ${locale} ${scheme}`, async ({
    page,
  }) => {
    const he = locale === "he";
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript((value) => {
      localStorage.setItem("htco.locale", value);
    }, locale);
    await openApp(page, "/admin/automations", "shops");
    await expect(pageTitle(page, he ? "אוטומציות" : "Automations")).toBeVisible();
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    await expect(page.getByRole("table", { name: he ? "אוטומציות" : "Automations" })).toBeVisible();
    await expect(
      page.getByRole("list", { name: he ? "הרצות אחרונות" : "Latest runs" }),
    ).toBeVisible();
    await checkpoint(page, `automations-${locale}-${scheme}`);

    await page
      .getByRole("button", {
        name: he ? "פתחו את ההרצה שנכשלה סופית" : "Open the dead-lettered run",
      })
      .click();
    await expect(page.getByRole("dialog", { name: he ? "הרצה" : "Execution" })).toBeVisible();
    await checkpoint(page, `automations-sheet-${locale}-${scheme}`);
  });
}
