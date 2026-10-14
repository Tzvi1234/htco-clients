import { defineConfig } from "@lingui/conf";
import { formatter } from "@lingui/format-po";

// English is the source language; every message also needs a Hebrew translation
// (`src/shared/i18n/catalogs.test.ts` fails on a missing one).
export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "he"],
  catalogs: [{ path: "<rootDir>/src/locales/{locale}/messages", include: ["src"] }],
  // Origins without line numbers: reformatting code must not put the catalogs out of sync.
  format: formatter({ lineNumbers: false }),
});
