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
