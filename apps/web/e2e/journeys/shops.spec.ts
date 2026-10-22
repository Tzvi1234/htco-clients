import { expect, test } from "@playwright/test";

import { checkpoint, openApp, pageTitle } from "./support.ts";

test("the Owner connects an Etsy shop through the code dialog and Etsy (slice 4.3)", async ({
  page,
}) => {
  await openApp(page, "/shops", "signed-in");
  await expect(pageTitle(page, "Shops")).toBeVisible();
  await expect(page.getByText("No shops yet")).toBeVisible();
  await checkpoint(page, "shops-empty");

  await page.getByRole("button", { name: "Connect Etsy shop" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm it is you" });
  await expect(dialog.getByLabel("Code from the app")).toBeFocused();
  await checkpoint(page, "shops-step-up");

  // The demo's "Etsy" sends the browser straight back to the callback, which starts a new page.
  await dialog.getByLabel("Code from the app").fill("123456");
  await dialog.getByRole("button", { name: "Confirm" }).click();

  // A new page load on the development server: allow it time to compile and start.
  await expect(page.getByText("Your Etsy shop is connected.")).toBeVisible({ timeout: 20_000 });
  await expect(page).toHaveURL(/\/shops$/);
  await expect(page.getByRole("article", { name: "Willow & Wick" })).toBeVisible();
  await checkpoint(page, "shops-connected");
});

test("cancelling on Etsy is explained, and the code leaves the address bar", async ({ page }) => {
  await openApp(
    page,
    "/integrations/etsy/callback?error=access_denied&error_description=denied",
    "signed-in",
  );
  await expect(page.getByRole("alert")).toContainText("You cancelled the connection on Etsy.");
  await expect(page).not.toHaveURL(/error=/);
  await checkpoint(page, "etsy-cancelled");
});

for (const [locale, scheme] of [
  ["en", "light"],
  ["en", "dark"],
  ["he", "light"],
  ["he", "dark"],
] as const) {
  test(`shop cards in every connection state, ${locale} ${scheme} (AC-4.6.2)`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript((value) => {
      localStorage.setItem("htco.locale", value);
    }, locale);
    await openApp(page, "/shops", "shops");
    await expect(page.getByRole("article")).toHaveCount(4);
    await checkpoint(page, `shop-cards-${locale}-${scheme}`);
  });
}

for (const locale of ["en", "he"] as const) {
  test(`the statistics' charts run time in the language's direction (${locale})`, async ({
    page,
  }) => {
    await page.addInitScript((value) => {
      localStorage.setItem("htco.locale", value);
    }, locale);
    await openApp(page, "/shops", "shops");
    await page.getByRole("tab", { name: locale === "he" ? "סטטיסטיקה" : "Statistics" }).click();
    // The orders per month: in the focus's side column on wide screens, above the revenue on
    // phones. The newest month (the highlighted bar) sits at the end of the reading direction's
    // start: the right in English, the left in Hebrew.
    const chart = page
      .locator(
        "[role='img'][aria-label^='Orders per month'], [role='img'][aria-label^='הזמנות בחודש']",
      )
      .locator("visible=true")
      .first();
    await expect(chart).toBeVisible();
    const bars = chart.locator("[data-bar]");
    await expect(bars).toHaveCount(12);
    const oldest = await bars.first().boundingBox();
    const newest = await bars.last().boundingBox();
    if (oldest === null || newest === null) throw new Error("the bars have no box");
    if (locale === "he") expect(newest.x).toBeLessThan(oldest.x);
    else expect(newest.x).toBeGreaterThan(oldest.x);
    await expect(bars.last()).toHaveAttribute("data-highlight", "");
    // The revenue line follows the same direction.
    const points = page.locator("[data-point]");
    const first = await points.first().boundingBox();
    const last = await points.last().boundingBox();
    if (first === null || last === null) throw new Error("the points have no box");
    if (locale === "he") expect(last.x).toBeLessThan(first.x);
    else expect(last.x).toBeGreaterThan(first.x);
  });
}
