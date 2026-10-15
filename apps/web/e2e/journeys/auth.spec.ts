import { expect, test } from "@playwright/test";

import { checkpoint, openAccountMenu, openApp, pageTitle } from "./support.ts";

test("an Owner signs in, sets up the authenticator app and lands on the overview", async ({
  page,
}) => {
  await openApp(page, "/sign-in", "signed-out");
  await expect(pageTitle(page, "Sign in to HT-Commerce")).toBeVisible();
  await checkpoint(page, "sign-in");

  await page.getByLabel("Email").fill("owner@example.test");
  await page.getByLabel("Password", { exact: true }).fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  // AC-3.5.3: an Owner without a second factor sets one up before anything else.
  await expect(pageTitle(page, "Set up your authenticator app")).toBeVisible();
  await page.getByRole("button", { name: "Show the QR code" }).click();
  await expect(page.getByRole("img", { name: /QR code/ })).toBeVisible();
  await checkpoint(page, "authenticator-setup");

  await page.getByLabel("Code from the app").fill("123456");
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(pageTitle(page, "Home")).toBeVisible();
  await checkpoint(page, "overview");
});

test("a signed-in user signs out from the account menu", async ({ page }) => {
  await openApp(page, "/", "signed-in");
  await expect(pageTitle(page, "Home")).toBeVisible();

  await openAccountMenu(page);
  await expect(page.getByRole("menu")).toBeVisible();
  await checkpoint(page, "account-menu");
  await page.getByRole("menuitem", { name: "Sign out" }).click();

  await expect(pageTitle(page, "Sign in to HT-Commerce")).toBeVisible();
  await checkpoint(page, "signed-out");
});
