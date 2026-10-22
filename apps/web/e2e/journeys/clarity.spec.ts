import { expect, test, type Page } from "@playwright/test";

import { checkpoint, openApp, pageTitle } from "./support.ts";

/**
 * Round 3 (clarity): no panel the user must scroll inside, on the screens redesigned in part A,
 * at this project's viewport (1440×900 or 375×812) with the demo data. A panel counts when it
 * scrolls itself (overflow auto or scroll) and holds more than it shows.
 */
async function innerScrollers(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("main *, .welcome *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        const scrolls = (value: string) => value === "auto" || value === "scroll";
        const y = scrolls(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
        const x = scrolls(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
        return y || x;
      })
      .map((element) => `${element.tagName.toLowerCase()}.${element.className.slice(0, 60)}`),
  );
}

for (const [path, as, title] of [
  ["/settings", "signed-in", "Settings"],
  ["/welcome", "signed-out", "Your shop runs. You decide."],
  ["/sign-in", "signed-out", "Sign in"],
] as const) {
  test(`${path} has no panel that scrolls on its own`, async ({ page }) => {
    await openApp(page, path, as);
    await expect(pageTitle(page, title)).toBeVisible();
    expect(await innerScrollers(page)).toEqual([]);
  });
}

test("the settings page shows the three personal settings first", async ({ page }) => {
  await openApp(page, "/settings", "signed-in");
  await expect(pageTitle(page, "Settings")).toBeVisible();
  const appearance = page.getByRole("region", { name: "Appearance and language" });
  for (const name of ["Theme", "Palette", "Language"]) {
    await expect(appearance.getByRole("radiogroup", { name })).toBeVisible();
  }
  await checkpoint(page, "settings");
});

test("the navigation opens and closes without motion under reduced motion", async ({ page }) => {
  const wide = (page.viewportSize()?.width ?? 0) >= 640;
  // The sidebar is the wide-screen navigation; phones have the tab bar.
  if (!wide) return;
  // The project runs with reducedMotion "reduce" (playwright.config.ts).
  await openApp(page, "/", "signed-in");
  await expect(pageTitle(page, "Home")).toBeVisible();
  const work = page.getByRole("button", { name: "Work" });
  await work.click();
  await expect(work).toHaveAttribute("aria-expanded", "true");
  const motion = await page.evaluate(() => {
    const list = document.getElementById("sb-work");
    if (list === null) return null;
    const style = getComputedStyle(list);
    const item = list.querySelector("li");
    return {
      duration: Math.max(...style.transitionDuration.split(",").map((part) => parseFloat(part))),
      delay: item === null ? 0 : parseFloat(getComputedStyle(item).transitionDelay),
      // Anything in the sidebar that still moves for longer than the 1 ms the rule leaves.
      animations: document.getAnimations().filter((animation) => {
        const effect = animation.effect;
        const target = effect instanceof KeyframeEffect ? effect.target : null;
        const duration = Number(effect?.getComputedTiming().duration ?? 0);
        return target !== null && list.closest("aside")?.contains(target) === true && duration > 1;
      }).length,
    };
  });
  // The global rule leaves at most 1 ms, and no stagger delay.
  expect(motion?.duration ?? 1).toBeLessThanOrEqual(0.001);
  expect(motion?.delay).toBe(0);
  expect(motion?.animations).toBe(0);
});

test("the navigation springs open with motion allowed, and the glass is frosted", async ({
  page,
}) => {
  const wide = (page.viewportSize()?.width ?? 0) >= 640;
  // The sidebar is the wide-screen navigation; phones have the tab bar.
  if (!wide) return;
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openApp(page, "/", "signed-in");
  await expect(pageTitle(page, "Home")).toBeVisible();
  const style = await page.evaluate(() => {
    const list = document.getElementById("sb-work");
    const sidebar = document.querySelector("aside[data-glass]");
    return {
      transition: list === null ? "" : getComputedStyle(list).transitionProperty,
      glass: sidebar === null ? "" : getComputedStyle(sidebar).backdropFilter,
    };
  });
  expect(style.transition).toContain("grid-template-rows");
  expect(style.glass).toContain("blur");
});

/** The bar's background alpha (1 is solid) and its backdrop filter. */
async function bar(page: Page, selector: string) {
  return page.evaluate((target) => {
    const element = document.querySelector(target);
    if (element === null) return null;
    const style = getComputedStyle(element);
    const alpha = /rgba?\((?:[^,]+,){3}\s*([\d.]+)\)|\/\s*([\d.]+)\)/.exec(style.backgroundColor);
    return {
      alpha: alpha === null ? 1 : Number(alpha[1] ?? alpha[2]),
      filter: style.backdropFilter,
    };
  }, selector);
}

test("the glass bars turn solid when the device asks for less transparency", async ({ page }) => {
  for (const [path, as, title, selector] of [
    ["/settings", "signed-in", "Settings", "header[data-glass]"],
    ["/welcome", "signed-out", "Your shop runs. You decide.", ".w-bar > header"],
  ] as const) {
    await openApp(page, path, as);
    await expect(pageTitle(page, title)).toBeVisible();
    expect((await bar(page, selector))?.alpha, path).toBeLessThan(1);
    // The boot script and the app set this attribute from prefers-reduced-transparency.
    await page.evaluate(() => {
      document.documentElement.dataset["solid"] = "";
    });
    // The bar eases its colour (1 ms under reduced motion), so read it once it has settled.
    await expect.poll(async () => (await bar(page, selector))?.alpha, { message: path }).toBe(1);
    expect((await bar(page, selector))?.filter, path).toBe("none");
  }
});

test("standing still, the landing page's approval example shows its outcome", async ({ page }) => {
  // The project runs with reduced motion, so nothing is scroll-driven.
  await openApp(page, "/welcome", "signed-out");
  await expect(pageTitle(page, "Your shop runs. You decide.")).toBeVisible();
  const decision = page.getByRole("article", { name: "Pause the summer sale on four listings?" });
  await expect(decision.getByText("Approved by you")).toBeVisible();
  const fill = await decision
    .locator(".w-fill")
    .evaluate((element) => getComputedStyle(element).opacity);
  expect(fill).toBe("1");
});
