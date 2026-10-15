import { expect } from "storybook/test";

import { useLocale } from "../shared/i18n/LocaleProvider.tsx";

/**
 * Story text in the story's language. Stories are previews, not product copy, so their sample
 * text stays out of the Lingui catalogs.
 */
export function useBi(): (english: string, hebrew: string) => string {
  const { locale } = useLocale();
  return (english, hebrew) => (locale === "he" ? hebrew : english);
}

/**
 * The one focus ring (styles.css): a solid outline of at least 2 px in `--border-focus`, drawn
 * for keyboard focus (AC-3.4.2). Colours are read once their short transition has ended.
 */
export async function expectFocusRing(element: Element): Promise<void> {
  await expect(element).toHaveAttribute("data-focus-visible", "true");
  await transitionsEnded(element);
  const style = getComputedStyle(element);
  await expect(style.outlineStyle).toBe("solid");
  await expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
  await expect(style.outlineColor).toBe(focusColour());
}

/** Resolves once the element's running transitions (colours, rings) have finished. */
export async function transitionsEnded(element: Element): Promise<void> {
  await Promise.all(element.getAnimations().map((animation) => animation.finished));
}

/** `--border-focus` as the browser resolves it, for comparing with computed colours. */
export function focusColour(): string {
  const probe = document.createElement("span");
  probe.style.color = "var(--border-focus)";
  document.body.append(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}
