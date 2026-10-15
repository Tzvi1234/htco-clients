import { expect, test, type Page } from "@playwright/test";

import { checkpoint, openAccountMenu, openApp, pageTitle } from "./support.ts";

/** Where the main navigation sits: the start side of the screen (wide screens only). */
async function navigationSide(page: Page): Promise<"left" | "right"> {
  const box = await page.getByRole("navigation", { name: /Main|ראשי/ }).boundingBox();
  const width = page.viewportSize()?.width ?? 0;
  if (box === null) throw new Error("the main navigation is not on screen");
  return box.x + box.width / 2 < width / 2 ? "left" : "right";
}

const root = (page: Page) => page.locator("html");

test("switching to Hebrew mirrors the app right to left, and English restores it (AC-3.3.1)", async ({
  page,
}) => {
  const wide = (page.viewportSize()?.width ?? 0) >= 640;
  await openApp(page, "/", "signed-in");
  await expect(pageTitle(page, "Overview")).toBeVisible();
  await expect(root(page)).toHaveAttribute("dir", "ltr");
  if (wide) expect(await navigationSide(page)).toBe("left");

  await openAccountMenu(page);
  await page.getByRole("menuitemradio", { name: "עברית" }).click();

  await expect(root(page)).toHaveAttribute("lang", "he");
  await expect(root(page)).toHaveAttribute("dir", "rtl");
  await expect(pageTitle(page, "סקירה")).toBeVisible();
  if (wide) expect(await navigationSide(page)).toBe("right");
  await checkpoint(page, "overview-hebrew");

  await openAccountMenu(page, "חשבון והעדפות");
  await page.getByRole("menuitemradio", { name: "English" }).click();

  await expect(root(page)).toHaveAttribute("lang", "en");
  await expect(root(page)).toHaveAttribute("dir", "ltr");
  await expect(pageTitle(page, "Overview")).toBeVisible();
  if (wide) expect(await navigationSide(page)).toBe("left");
});

/** The app ground's colour, which the light and dark token sets define differently. */
async function ground(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
}

test("the theme follows the system until the user picks one, which is remembered (AC-3.3.3)", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await openApp(page, "/settings", "signed-in");
  await expect(pageTitle(page, "Settings")).toBeVisible();
  await expect(root(page)).not.toHaveAttribute("data-theme");
  const light = await ground(page);

  // By default the system decides.
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => ground(page)).not.toBe(light);
  const dark = await ground(page);
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => ground(page)).toBe(light);

  // The user's choice wins over the system, and survives a reload.
  await page.getByText("Dark", { exact: true }).click();
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => ground(page)).toBe(dark);
  await checkpoint(page, "settings-dark");

  await openApp(page, "/settings", "signed-in");
  await expect(pageTitle(page, "Settings")).toBeVisible();
  await expect(root(page)).toHaveAttribute("data-theme", "dark");

  // Back to the system.
  await page.getByText("Match the system", { exact: true }).click();
  await expect(root(page)).not.toHaveAttribute("data-theme");
  await expect.poll(() => ground(page)).toBe(light);
});
