import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useMinutes } from "./bi.ts";
import { LocaleProvider } from "../../i18n/LocaleProvider.tsx";
import type { Locale } from "../../i18n/locale.ts";
import { memoryStorage } from "../../lib/storage.ts";

function minutesIn(locale: Locale, value: number): string {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <LocaleProvider initialLocale={locale} storage={memoryStorage()}>
      {children}
    </LocaleProvider>
  );
  return renderHook(() => useMinutes(), { wrapper }).result.current(value);
}

describe("useMinutes", () => {
  it("writes a sample age in English", () => {
    expect(minutesIn("en", 12)).toBe("12 min");
  });

  it("writes it in Hebrew, never with the English unit", () => {
    const hebrew = minutesIn("he", 12);
    expect(hebrew).toContain("12");
    expect(hebrew).not.toMatch(/min/);
  });
});
