import type { ApiClient } from "@htco/api-client";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, type RouterHistory } from "@tanstack/react-router";
import { useState } from "react";

import { createAppRouter } from "./router.tsx";
import { ApiError, ApiProvider, createApiClient, forgetSession } from "../shared/api/api.tsx";
import { LocaleProvider } from "../shared/i18n/LocaleProvider.tsx";
import { IntroProvider } from "../shared/motion/intro.tsx";
import type { Locale } from "../shared/i18n/locale.ts";
import type { SettingsStorage } from "../shared/lib/storage.ts";
import { SettingsStorageContext } from "../shared/lib/storageContext.ts";
import { TweaksProvider } from "../shared/theme/ThemeProvider.tsx";
import type { ThemePreference } from "../shared/theme/theme.ts";
import { migrateAppearance, readTweaks } from "../shared/theme/tweaks.ts";

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
  // The theme and the palette are one preference on this origin (client ADR-0008); values an
  // earlier version remembered are migrated first (round 3, ADR-0009).
  const [tweaks] = useState(() => {
    migrateAppearance(storage);
    return { ...readTweaks(storage), theme };
  });
  const [{ queryClient, router }] = useState(() => {
    const client: QueryClient = new QueryClient({
      // A session that ended on the server (revoked elsewhere, expired): back to sign-in.
      queryCache: new QueryCache({
        onError: (error) => {
          if (error instanceof ApiError && error.status === 401) {
            forgetSession(client);
            void appRouter.navigate({ to: "/sign-in" });
          }
        },
      }),
      defaultOptions: {
        queries: {
          // Retry only what may pass on a second try, never an answer given on purpose (4xx).
          // One quick retry: a failing screen says so within a second instead of spinning.
          retry: (count, error) => count < 1 && !(error instanceof ApiError && error.status < 500),
          retryDelay: 500,
        },
      },
    });
    const appRouter = createAppRouter({ queryClient: client, api }, history);
    return { queryClient: client, router: appRouter };
  });
  return (
    <SettingsStorageContext value={storage}>
      <LocaleProvider initialLocale={locale} storage={storage}>
        <TweaksProvider initialTweaks={tweaks} storage={storage}>
          <QueryClientProvider client={queryClient}>
            <ApiProvider client={api}>
              <IntroProvider storage={storage}>
                <RouterProvider router={router} />
              </IntroProvider>
            </ApiProvider>
          </QueryClientProvider>
        </TweaksProvider>
      </LocaleProvider>
    </SettingsStorageContext>
  );
}
