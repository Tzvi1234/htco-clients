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

// Pixel's design notes: on a phone the detail sits under the list, so a link to an incident that
// is not available left its message out of sight. It comes into view with focus and a way back,
// and the Back chevron points along the reading direction (right in Hebrew).
for (const locale of ["en", "he"] as const) {
  test(`a link to an unavailable incident shows why, on a phone too (${locale})`, async ({
    page,
  }) => {
    const he = locale === "he";
    await page.addInitScript((value) => {
      localStorage.setItem("htco.locale", value);
    }, locale);
    await openApp(page, "/incidents/e0000000-0000-7000-8000-0000000000ff", "shops");
    const message = page.getByRole("alert").filter({
      hasText: he ? "התקלה הזו אינה זמינה לך." : "This incident is not available to you.",
    });
    await expect(message).toBeVisible();
    if ((page.viewportSize()?.width ?? 0) >= 640) return;
    await expect(message).toBeFocused();
    await expect(message).toBeInViewport();
    const back = page.getByRole("button", { name: he ? "חזרה לרשימה" : "Back to list" });
    await expect(back).toBeInViewport();
    const flip = await back.locator("svg").evaluate((svg) => getComputedStyle(svg).scale);
    expect(flip).toBe(he ? "-1 1" : "none");
    await back.click();
    const list = page.locator(":focus");
    await expect(list).toHaveAccessibleName(he ? "תקלות פתוחות" : "Open incidents");
    await expect(list).toBeInViewport();
  });
}
