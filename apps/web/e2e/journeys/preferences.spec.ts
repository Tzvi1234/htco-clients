import { expect, test, type Page } from "@playwright/test";

import { checkpoint, openApp, pageTitle } from "./support.ts";

/** Where the main navigation sits: the start side of the screen (wide screens only). */
async function navigationSide(page: Page): Promise<"left" | "right"> {
  const box = await page.getByRole("navigation", { name: /Main|ראשי/ }).boundingBox();
  const width = page.viewportSize()?.width ?? 0;
  if (box === null) throw new Error("the main navigation is not on screen");
  return box.x + box.width / 2 < width / 2 ? "left" : "right";
}

const root = (page: Page) => page.locator("html");

test("switching to Hebrew in Settings mirrors the app right to left, and English restores it (AC-3.3.1)", async ({
  page,
}) => {
  const wide = (page.viewportSize()?.width ?? 0) >= 640;
  await openApp(page, "/settings", "signed-in");
  await expect(pageTitle(page, "Settings")).toBeVisible();
  await expect(root(page)).toHaveAttribute("dir", "ltr");
  if (wide) expect(await navigationSide(page)).toBe("left");

  await page.getByText("עברית", { exact: true }).click();

  await expect(root(page)).toHaveAttribute("lang", "he");
  await expect(root(page)).toHaveAttribute("dir", "rtl");
  await expect(pageTitle(page, "הגדרות")).toBeVisible();
  if (wide) expect(await navigationSide(page)).toBe("right");
  await checkpoint(page, "settings-hebrew");

  await page.getByText("English", { exact: true }).click();

  await expect(root(page)).toHaveAttribute("lang", "en");
  await expect(root(page)).toHaveAttribute("dir", "ltr");
  await expect(pageTitle(page, "Settings")).toBeVisible();
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
  await page
    .getByRole("region", { name: "Appearance and language" })
    .getByText("System", { exact: true })
    .click();
  await expect(root(page)).not.toHaveAttribute("data-theme");
  await expect.poll(() => ground(page)).toBe(light);
});

test("the palette chosen in Settings shows on the landing page too (one preference)", async ({
  page,
}) => {
  await openApp(page, "/settings", "signed-in");
  await expect(pageTitle(page, "Settings")).toBeVisible();
  await page.getByText("Cream", { exact: true }).click();
  await expect(root(page)).toHaveAttribute("data-pal", "d4");

  await openApp(page, "/welcome", "signed-out");
  await expect(pageTitle(page, "Your shop runs. You decide.")).toBeVisible();
  await expect(root(page)).toHaveAttribute("data-pal", "d4");
  await checkpoint(page, "landing-cream");

  await openApp(page, "/settings", "signed-in");
  await page.getByText("Gray", { exact: true }).click();
  await expect(root(page)).toHaveAttribute("data-pal", "sbb");
});

/**
 * The focused control's name and outline. A React Aria radio keeps focus on its hidden input and
 * marks the visible control around it with `data-focus-visible`, which is what draws the ring.
 */
async function focusRing(page: Page) {
  return page.evaluate(() => {
    const active = document.activeElement;
    // Past the last control the focus leaves the page (the body holds it): not a control.
    if (active === null || active === document.body) return null;
    const element =
      active instanceof HTMLInputElement
        ? (active.closest("[data-focus-visible]") ?? active)
        : active;
    const style = getComputedStyle(element);
    return {
      name: element.getAttribute("aria-label") ?? element.textContent.trim(),
      outline: style.outlineStyle,
      width: style.outlineWidth,
    };
  });
}

test("the keyboard always shows the one focus ring, also on controls that hide the browser's (WCAG 2.4.7)", async ({
  page,
}) => {
  await openApp(page, "/", "signed-in");
  await expect(pageTitle(page, "Home")).toBeVisible();

  // The first stop skips the navigation.
  await page.keyboard.press("Tab");
  expect((await focusRing(page))?.name).toBe("Skip to content");

  // Every later stop up to the screen's own controls draws the ring (sidebar items, the
  // top bar's round buttons, the account card).
  const rings: { name: string; outline: string; width: string }[] = [];
  for (let step = 0; step < 16; step++) {
    await page.keyboard.press("Tab");
    const ring = await focusRing(page);
    if (ring !== null) rings.push(ring);
  }
  expect(rings.length).toBeGreaterThan(5);
  for (const ring of rings) {
    // Solid and at least 2 px wide (browsers round the token's width differently).
    expect(ring.outline, ring.name).toBe("solid");
    expect(Number.parseFloat(ring.width), ring.name).toBeGreaterThanOrEqual(2);
  }
});
