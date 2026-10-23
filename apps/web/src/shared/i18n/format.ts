// Numbers, money, dates and Etsy's own words in the user's language.
import { useLingui } from "@lingui/react/macro";

import { useLocale } from "./LocaleProvider.tsx";
import type { MoneyView } from "../api/live.ts";

/**
 * Money in its own currency, symbol first in every language (`$1,284.50`), so the amount reads
 * the same inside Hebrew text; screens put it in `N` (left-to-right).
 */
export function useMoney(): (
  money: MoneyView | undefined,
  options?: { whole?: boolean },
) => string {
  const { locale } = useLocale();
  return (money, options) => {
    if (money === undefined) return "—";
    const amount = Number(money.amount);
    // Hebrew puts the symbol after the number; inside a left-to-right run that reads "116$".
    return new Intl.NumberFormat(locale.startsWith("he") ? "en-US" : locale, {
      style: "currency",
      currency: money.currency,
      currencyDisplay: "narrowSymbol",
      ...(options?.whole === true ? { maximumFractionDigits: 0 } : {}),
    }).format(amount);
  };
}

/** A short date ("15 Oct") in the user's language. */
export function useShortDate(): (iso: string) => string {
  const { locale } = useLocale();
  return (iso) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));
}

/** Whole numbers in the user's language. */
export function useCount(): (n: number) => string {
  const { locale } = useLocale();
  return (n) => new Intl.NumberFormat(locale).format(n);
}

/** The reason Etsy gave, as Etsy wrote it, or "No reason given". */
export function useReason(): (reason: string | null) => string {
  const { t } = useLingui();
  return (reason) => (reason === null || reason.trim() === "" ? t`No reason given` : reason);
}
