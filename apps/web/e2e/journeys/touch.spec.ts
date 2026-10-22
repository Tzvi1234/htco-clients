import { expect, test } from "@playwright/test";

import { openApp, pageTitle } from "./support.ts";

// On a touch screen every control's target is at least 44 × 44 px (WCAG 2.5.5, the platforms'
// 44 pt), without changing how it looks: an invisible layer extends the small ones (styles.css,
// "Touch"). Measured on the phone with a coarse pointer, on the screens with the most controls.
test.use({ hasTouch: true, isMobile: true });

test("every control on a touch screen has a 44 px target that covers no other (round 2)", async ({
  page,
}, info) => {
  test.skip(!info.project.name.startsWith("journeys"), "touch targets are measured in the app");
  for (const [path, title, as] of [
    ["/", "Home", "signed-in"],
    ["/settings", "Settings", "shops"],
    ["/shops", "Shops", "shops"],
  ] as const) {
    await openApp(page, path, as);
    await expect(pageTitle(page, title)).toBeVisible();
    const { small, overlaps } = await page.evaluate(() => {
      const controls = [
        ...document.querySelectorAll(
          "a[href], button, [role=button], [role=link], [role=tab], [role=radio], [role=switch], [role=checkbox]",
        ),
      ].filter((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          box.width > 0 &&
          box.height > 0 &&
          style.visibility !== "hidden" &&
          style.pointerEvents !== "none" &&
          element.closest("[inert], [aria-hidden='true']") === null
        );
      });
      const px = (value: string) => (value.endsWith("px") ? parseFloat(value) : 0);
      const name = (element: Element) =>
        (element.getAttribute("aria-label") ?? element.textContent).trim().slice(0, 40);
      // The target: the control's box, grown by its touch layer (::after, or ::before where
      // ::after draws something) when it has one.
      const targets = controls.map((element) => {
        const box = element.getBoundingClientRect();
        let [left, right, top, bottom] = [box.left, box.right, box.top, box.bottom];
        for (const part of ["::after", "::before"]) {
          const layer = getComputedStyle(element, part);
          if (layer.content === "none" || layer.position !== "absolute") continue;
          left = Math.min(left, box.left + px(layer.left));
          right = Math.max(right, box.right - px(layer.right));
          top = Math.min(top, box.top + px(layer.top));
          bottom = Math.max(bottom, box.bottom - px(layer.bottom));
        }
        // A layer is cut off where a scrolling ancestor clips it; taps there never reach it.
        for (let node = element.parentElement; node !== null; node = node.parentElement) {
          const style = getComputedStyle(node);
          if (style.overflowX === "visible" && style.overflowY === "visible") continue;
          const clip = node.getBoundingClientRect();
          left = Math.max(left, clip.left);
          right = Math.min(right, clip.right);
          top = Math.max(top, clip.top);
          bottom = Math.min(bottom, clip.bottom);
        }
        // The control itself, cut off the same way.
        const own = {
          left: Math.max(box.left, left),
          right: Math.min(box.right, right),
          top: Math.max(box.top, top),
          bottom: Math.min(box.bottom, bottom),
        };
        // The target that can really be tapped, after clipping. A control that is itself partly
        // scrolled out of its container is measured when it is scrolled into view, not here.
        const whole =
          own.left === box.left &&
          own.right === box.right &&
          own.top === box.top &&
          own.bottom === box.bottom;
        const size = whole ? { width: right - left, height: bottom - top } : undefined;
        return { element, box: own, size, left, right, top, bottom };
      });
      const small = targets.flatMap(({ element, size }) =>
        size !== undefined && (size.width < 43.5 || size.height < 43.5)
          ? [`${name(element)} (${String(size.width)}×${String(size.height)})`]
          : [],
      );
      // A target never covers another control, or a tap meant for it lands on its neighbour.
      // (The floating tab bar lies over the scrolling page by design; it is left out.)
      const floating = (element: Element) => {
        for (let node: Element | null = element; node !== null; node = node.parentElement) {
          if (getComputedStyle(node).position === "fixed") return true;
        }
        return false;
      };
      const overlaps: string[] = [];
      for (const a of targets) {
        for (const b of targets) {
          if (a === b || a.element.contains(b.element) || b.element.contains(a.element)) continue;
          if (floating(a.element) !== floating(b.element)) continue;
          const x = Math.min(a.right, b.box.right) - Math.max(a.left, b.box.left);
          const y = Math.min(a.bottom, b.box.bottom) - Math.max(a.top, b.box.top);
          if (x > 1 && y > 1) overlaps.push(`${name(a.element)} covers ${name(b.element)}`);
        }
      }
      return { small, overlaps };
    });
    expect(small, path).toEqual([]);
    expect(overlaps, path).toEqual([]);
  }
});
