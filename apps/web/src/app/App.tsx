import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, type RouterHistory } from "@tanstack/react-router";
import { useState } from "react";

import { createAppRouter } from "./router.tsx";
import { LocaleProvider } from "../shared/i18n/LocaleProvider.tsx";
import type { Locale } from "../shared/i18n/locale.ts";
import type { SettingsStorage } from "../shared/lib/storage.ts";
import { ThemeProvider } from "../shared/theme/ThemeProvider.tsx";
import type { ThemePreference } from "../shared/theme/theme.ts";

export interface AppProps {
  locale: Locale;
  theme: ThemePreference;
  storage: SettingsStorage | undefined;
  history?: RouterHistory;
}

/** Providers and routes; `main.tsx` passes the device settings, tests pass their own. */
export function App({ locale, theme, storage, history }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [router] = useState(() => createAppRouter(history));
  return (
    <LocaleProvider initialLocale={locale} storage={storage}>
      <ThemeProvider initialTheme={theme} storage={storage}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
