import { expect, test } from "@playwright/test";

import { openApp, pageTitle } from "./support.ts";

// On a touch screen every control's target is at least 44 × 44 px (WCAG 2.5.5, the platforms'
// 44 pt), without changing how it looks: an invisible layer extends the small ones (styles.css,
// "Touch"). Measured on the phone with a coarse pointer, on the screens with the most controls.
test.use({ hasTouch: true, isMobile: true });

test("every control on a touch screen has a 44 px target (round 2)", async ({ page }, info) => {
  test.skip(info.project.name !== "journeys-phone", "touch targets are measured on the phone");
  for (const [path, title, as] of [
    ["/", "Home", "signed-in"],
    ["/settings", "Settings", "shops"],
    ["/shops", "Shops", "shops"],
  ] as const) {
    await openApp(page, path, as);
    await expect(pageTitle(page, title)).toBeVisible();
    const small = await page.evaluate(() => {
      const controls = document.querySelectorAll(
        "a[href], button, [role=button], [role=link], [role=tab], [role=radio], [role=switch], [role=checkbox]",
      );
      const found: string[] = [];
      for (const element of controls) {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (box.width === 0 || box.height === 0 || style.visibility === "hidden") continue;
        if (style.pointerEvents === "none" || element.closest("[inert], [aria-hidden='true']")) {
          continue;
        }
        let width = box.width;
        let height = box.height;
        const layer = getComputedStyle(element, "::after");
        if (layer.content !== "none" && layer.position === "absolute") {
          const px = (value: string) => (value.endsWith("px") ? parseFloat(value) : 0);
          width = Math.max(width, box.width - px(layer.left) - px(layer.right));
          height = Math.max(height, box.height - px(layer.top) - px(layer.bottom));
        }
        if (width < 43.5 || height < 43.5) {
          const name = element.getAttribute("aria-label") ?? element.textContent;
          found.push(`${name.trim().slice(0, 40)} (${String(width)}×${String(height)})`);
        }
      }
      return found;
    });
    expect(small, path).toEqual([]);
  }
});
