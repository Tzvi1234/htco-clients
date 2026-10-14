import type { ApiClient } from "@htco/api-client";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, type RouterHistory } from "@tanstack/react-router";
import { useState } from "react";

import { createAppRouter } from "./router.tsx";
import { ApiError, ApiProvider, createApiClient } from "../shared/api/api.tsx";
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
  /** The API client; tests pass one backed by a fake API. */
  api?: ApiClient;
}

/** Providers and routes; `main.tsx` passes the device settings, tests pass their own. */
export function App({ locale, theme, storage, history, api: given }: AppProps) {
  const [api] = useState(() => given ?? createApiClient());
  const [{ queryClient, router }] = useState(() => {
    const client: QueryClient = new QueryClient({
      // A session that ended on the server (revoked elsewhere, expired): back to sign-in.
      queryCache: new QueryCache({
        onError: (error) => {
          if (error instanceof ApiError && error.status === 401) {
            client.removeQueries({ queryKey: ["auth"] });
            void appRouter.navigate({ to: "/sign-in" });
          }
        },
      }),
      defaultOptions: {
        queries: {
          // Retry only what may pass on a second try, never an answer given on purpose (4xx).
          retry: (count, error) => count < 2 && !(error instanceof ApiError && error.status < 500),
        },
      },
    });
    const appRouter = createAppRouter({ queryClient: client, api }, history);
    return { queryClient: client, router: appRouter };
  });
  return (
    <LocaleProvider initialLocale={locale} storage={storage}>
      <ThemeProvider initialTheme={theme} storage={storage}>
        <QueryClientProvider client={queryClient}>
          <ApiProvider client={api}>
            <RouterProvider router={router} />
          </ApiProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
