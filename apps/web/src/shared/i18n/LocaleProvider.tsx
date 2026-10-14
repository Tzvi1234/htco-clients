import { I18nProvider as LinguiProvider } from "@lingui/react";
import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";
import { I18nProvider as AriaProvider } from "react-aria-components";

import { activateLocale, i18n, intlLocaleOf } from "./i18n.ts";
import { applyLocale, rememberLocale, type Locale } from "./locale.ts";
import type { SettingsStorage } from "../lib/storage.ts";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleState | null>(null);

interface LocaleProviderProps {
  initialLocale: Locale;
  storage: SettingsStorage | undefined;
  root?: HTMLElement;
  children: ReactNode;
}

/**
 * The active language for Lingui messages, React Aria (dates, numbers, direction) and the
 * document root (`lang`, `dir`). A change is remembered on this device.
 */
export function LocaleProvider({
  initialLocale,
  storage,
  root = document.documentElement,
  children,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState(() => {
    activateLocale(initialLocale);
    applyLocale(initialLocale, root);
    return initialLocale;
  });

  const setLocale = useCallback(
    (next: Locale) => {
      activateLocale(next);
      applyLocale(next, root);
      rememberLocale(next, storage);
      setLocaleState(next);
    },
    [root, storage],
  );

  const state = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return (
    <LocaleContext value={state}>
      <LinguiProvider i18n={i18n}>
        <AriaProvider locale={intlLocaleOf(locale)}>{children}</AriaProvider>
      </LinguiProvider>
    </LocaleContext>
  );
}

export function useLocale(): LocaleState {
  const state = use(LocaleContext);
  if (state === null) throw new Error("useLocale needs a LocaleProvider");
  return state;
}
