import { expect, test } from "@playwright/test";

import { checkpoint, openApp, pageTitle } from "./support.ts";

// The incident center and the notification bell (platform slice 6.5) on the demo's incidents:
// three open (one critical, one high), one resolved on evidence. Axe and a screenshot at each
// stop, in Hebrew and English, light and dark.

for (const [locale, scheme] of [
  ["he", "light"],
  ["en", "light"],
  ["he", "dark"],
] as const) {
  test(`the incident center, its most urgent incident and the bell, ${locale} ${scheme}`, async ({
    page,
  }) => {
    const he = locale === "he";
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript((value) => {
      localStorage.setItem("htco.locale", value);
    }, locale);
    await openApp(page, "/incidents", "shops");
    await expect(pageTitle(page, he ? "תקלות" : "Incidents")).toBeVisible();
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    await expect(page.getByRole("table", { name: he ? "תקלות" : "Incidents" })).toBeVisible();
    await checkpoint(page, `incidents-${locale}-${scheme}`);

    await page
      .getByRole("button", { name: he ? "פתיחת הדחופה ביותר" : "Open the most urgent" })
      .click();
    const detail = page.getByRole("region", {
      name: he ? "אוטומציה נכשלה סופית" : "Automation gave up",
    });
    await expect(detail).toBeVisible();
    // The detail takes focus, so a keyboard or a screen reader arrives at it.
    await expect(detail.getByRole("heading", { level: 2 })).toBeFocused();
    await checkpoint(page, `incident-detail-${locale}-${scheme}`);

    await page.getByRole("button", { name: he ? /^התראות/ : /^Notifications/ }).click();
    await expect(page.getByRole("dialog", { name: he ? "התראות" : "Notifications" })).toBeVisible();
    await checkpoint(page, `notifications-${locale}-${scheme}`);
  });
}
