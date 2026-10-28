import { expect, test } from "@playwright/test";

import { checkpoint, openApp, pageTitle } from "./support.ts";

// The AutoVA tracking relay (platform slice 6.10) on the demo's relay: two orders waiting for a
// number, one ready for Etsy. Paste → checked → the copy, with axe and a screenshot at each stop.
// Every number here is invented (src/test/fakeRelay.ts).

for (const locale of ["he", "en"] as const) {
  test(`the owner pastes a number, then reveals and copies one into Etsy (${locale})`, async ({
    page,
    context,
  }) => {
    const he = locale === "he";
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript((value) => {
      localStorage.setItem("htco.locale", value);
    }, locale);
    await openApp(page, "/commerce/tracking", "shops");
    await expect(pageTitle(page, he ? "מספרי מעקב" : "Tracking")).toBeVisible();
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    const panel = page.getByRole("region", {
      name: he ? "הזמנה #3481220917" : "Order #3481220917",
    });
    await expect(panel).toBeVisible();
    await checkpoint(page, `relay-paste-${locale}`);

    await panel.getByRole("radio", { name: "Yun Express" }).check({ force: true });
    await panel
      .getByRole("textbox", { name: he ? "מספר מעקב" : "Tracking number" })
      .fill("YT2410000000005521");
    await panel.getByRole("button", { name: he ? "בדיקה ושמירה" : "Check and save" }).click();
    await expect(page.getByText(he ? /^נבדק ונשמר/ : /^Checked and saved/)).toBeVisible();

    await page.getByRole("tab", { name: he ? /העתקה ל־Etsy/ : /Copy into Etsy/ }).click();
    await page.getByRole("row", { name: /#3480977163/ }).click();
    const ready = page.getByRole("region", {
      name: he ? "הזמנה #3480977163" : "Order #3480977163",
    });
    await expect(
      ready.getByText(he ? "מוסתר עד שחושפים אותו" : "Hidden until you reveal it"),
    ).toBeVisible();
    await ready.getByRole("button", { name: he ? "חשיפת המספר" : "Reveal the number" }).click();
    await expect(ready.getByText("YT2410000000004417")).toBeVisible();
    await ready.getByRole("button", { name: he ? "העתקה ללוח" : "Copy to clipboard" }).click();
    await expect(ready.getByRole("status")).toContainText(he ? "הועתק" : "Copied");
    await checkpoint(page, `relay-copy-${locale}`);
  });
}
