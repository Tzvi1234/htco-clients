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

  await expect(page.getByText("Your Etsy shop is connected.")).toBeVisible();
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
