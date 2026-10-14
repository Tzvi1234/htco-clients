import { i18n } from "@lingui/core";

import type { Locale } from "./locale.ts";
import { messages as en } from "../../locales/en/messages.po";
import { messages as he } from "../../locales/he/messages.po";

// Both catalogs are small and always needed for an instant language switch, so they are
// bundled rather than fetched.
const CATALOGS = { en, he } as const;

/** Make `locale` the language of every Lingui message. */
export function activateLocale(locale: Locale): void {
  i18n.loadAndActivate({ locale, messages: CATALOGS[locale] });
}

/** BCP 47 tag for `Intl` formatters and React Aria (dates, numbers, plural rules). */
export function intlLocaleOf(locale: Locale): string {
  return locale === "he" ? "he-IL" : "en-US";
}

export { i18n };
