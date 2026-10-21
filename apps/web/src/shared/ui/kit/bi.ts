import { useLocale } from "../../i18n/LocaleProvider.tsx";

/**
 * Sample content of a demo screen in both languages, like the Design 1C demo's own data
 * (`{he, en}`). Interface words use Lingui; records shown only as sample data (names, events)
 * carry both languages with them.
 */
export interface Bi {
  he: string;
  en: string;
}

export const bi = (he: string, en: string): Bi => ({ he, en });

/** Picks the user's language from a sample text. */
export function useBi(): (text: Bi | string) => string {
  const { locale } = useLocale();
  return (text) => (typeof text === "string" ? text : text[locale]);
}

/** "12 min" / "12 דק׳": a sample age in minutes, in the user's language (never isolated
 * left-to-right: the unit is a word of the sentence). */
export function useMinutes(): (minutes: number) => string {
  const { locale } = useLocale();
  const format = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "minute",
    unitDisplay: "short",
  });
  return (minutes) => format.format(minutes);
}
