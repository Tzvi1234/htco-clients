const DAY = 86_400_000;

/** Whole days until `iso`, rounded down so "within N days" is never later than the truth. */
export function daysLeft(iso: string, now: number): number {
  return Math.max(0, Math.floor((Date.parse(iso) - now) / DAY));
}

/** "4 minutes ago", "yesterday": the largest whole unit, in the user's language. */
export function ago(iso: string, now: number, locale: string): string {
  const seconds = Math.round((Date.parse(iso) - now) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units)
    if (Math.abs(seconds) >= size) return format.format(Math.trunc(seconds / size), unit);
  return format.format(0, "second");
}
