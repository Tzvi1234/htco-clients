import { expect, test } from "@playwright/test";

import { checkpoint, openApp, pageTitle } from "./support.ts";

// Admin › Health › Sales counters (Phase 5 activation step 2b): the Owner recounts a shop's
// product sales after a confirm sheet. Axe and a screenshot at each stop, in English and Hebrew,
// light and dark.

for (const [locale, scheme] of [
  ["en", "light"],
  ["he", "dark"],
] as const) {
  test(`the sales counters and the recount's confirm sheet, ${locale} ${scheme}`, async ({
    page,
  }) => {
    const he = locale === "he";
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript((value) => {
      localStorage.setItem("htco.locale", value);
    }, locale);
    await openApp(page, "/admin/health", "shops");
    await expect(pageTitle(page, he ? "בריאות מערכת" : "Health")).toBeVisible();
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    const panel = page.getByRole("region", { name: he ? "מוני מכירות" : "Sales counters" });
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toBeVisible();
    await checkpoint(page, `recount-${locale}-${scheme}`);

    await panel
      .getByRole("button", { name: he ? "ספירה מחדש של המכירות" : "Recount sales" })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await checkpoint(page, `recount-sheet-${locale}-${scheme}`);
  });
}
