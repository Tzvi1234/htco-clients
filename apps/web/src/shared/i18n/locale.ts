import { readSetting, writeSetting, type SettingsStorage } from "../lib/storage.ts";

export const LOCALES = ["en", "he"] as const;
export type Locale = (typeof LOCALES)[number];

const STORAGE_KEY = "htco.locale";

function isLocale(value: string | null): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

export function directionOf(locale: Locale): "ltr" | "rtl" {
  return locale === "he" ? "rtl" : "ltr";
}

/** The remembered choice on this device, else Hebrew for a Hebrew browser, else English. */
export function initialLocale(
  storage: SettingsStorage | undefined,
  languages: readonly string[],
): Locale {
  const remembered = readSetting(storage, STORAGE_KEY);
  if (isLocale(remembered)) return remembered;
  const [preferred = ""] = languages;
  // `iw` is the legacy code for Hebrew that some browsers still report.
  return /^(?:he|iw)\b/i.test(preferred) ? "he" : "en";
}

export function rememberLocale(locale: Locale, storage: SettingsStorage | undefined): void {
  writeSetting(storage, STORAGE_KEY, locale);
}

/** `lang` and `dir` on the root mirror the whole layout through logical CSS properties. */
export function applyLocale(locale: Locale, root: HTMLElement): void {
  root.lang = locale;
  root.dir = directionOf(locale);
}
