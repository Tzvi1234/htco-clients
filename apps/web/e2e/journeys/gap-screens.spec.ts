import { expect, test, type Page } from "@playwright/test";

import { checkpoint, openApp } from "./support.ts";

// The audit gap screens (PR #84): Admin › Audit log, Health's failed emails, Shipping's Tracking
// Sync panel and the order sheet's parcels, on the demo's data. Axe and a screenshot at each, in
// English and Hebrew, light and dark, at the desktop and phone viewports, so overflow and RTL are
// checked rather than assumed.

const WORDS = {
  en: {
    audit: "Audit records",
    activity: /Activity/,
    emails: "Failed emails",
    tracking: "Tracking",
    sync: "Tracking sync",
    shipped: "Shipped",
    order: /^Order /,
  },
  he: {
    audit: "רשומות ביקורת",
    activity: /פעילות/,
    emails: "מיילים שנכשלו",
    tracking: "מעקב",
    sync: "סנכרון מעקב",
    shipped: "נשלח",
    order: /^הזמנה /,
  },
} as const;

/** No pointer hover or focus left behind: the screenshot shows the screen's state only. */
async function settle(page: Page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
}

for (const [locale, scheme] of [
  ["en", "light"],
  ["en", "dark"],
  ["he", "light"],
  ["he", "dark"],
] as const) {
  const words = WORDS[locale];
  test.describe(`${locale} ${scheme}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.addInitScript((value) => {
        localStorage.setItem("htco.locale", value);
      }, locale);
    });

    test(`the audit log (AC-3.9.3), ${locale} ${scheme}`, async ({ page }) => {
      await openApp(page, "/admin/audit", "shops");
      const table = page.getByRole("table", { name: words.audit });
      await expect(table).toBeVisible({ timeout: 20_000 });
      await settle(page);
      // The records themselves: on a phone the filters fill the first screen.
      await table.scrollIntoViewIfNeeded();
      await checkpoint(page, `audit-${locale}-${scheme}`);
    });

    test(`the failed emails on Health (AC-6.4.3), ${locale} ${scheme}`, async ({ page }) => {
      await openApp(page, "/admin/health", "shops");
      await page.getByRole("tab", { name: words.activity }).click();
      const panel = page.getByRole("region", { name: words.emails });
      await expect(panel.locator("table, ul").first()).toBeVisible({ timeout: 20_000 });
      await settle(page);
      await panel.scrollIntoViewIfNeeded();
      await checkpoint(page, `failed-emails-${locale}-${scheme}`);
    });

    test(`the Tracking Sync panel on Shipping, ${locale} ${scheme}`, async ({ page }) => {
      await openApp(page, "/commerce/shipping", "shops");
      await page.getByRole("tab", { name: new RegExp(`^${words.tracking}`) }).click();
      const panel = page.getByRole("region", { name: words.sync, exact: true });
      await expect(panel.locator("[data-tracking-sync]")).toBeVisible({ timeout: 20_000 });
      await settle(page);
      await panel.scrollIntoViewIfNeeded();
      await checkpoint(page, `tracking-sync-${locale}-${scheme}`);
    });

    test(`the order sheet's parcels (AC-6.1.2), ${locale} ${scheme}`, async ({ page }) => {
      await openApp(page, "/commerce/orders", "shops");
      // A shipped order: its number button in the table, or the whole row on phones.
      const open = page
        .locator(`tr:has-text("${words.shipped}") button, li:has-text("${words.shipped}") > button`)
        .first();
      await expect(open).toBeVisible({ timeout: 20_000 });
      await open.click();
      const sheet = page.getByRole("dialog", { name: words.order });
      const parcels = sheet.getByRole("region", { name: words.tracking, exact: true });
      await expect(parcels.getByRole("listitem").first()).toBeVisible({ timeout: 20_000 });
      await parcels.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await checkpoint(page, `order-parcels-${locale}-${scheme}`);
    });
  });
}
