import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";

import { applyTheme, rememberTheme, type ThemePreference } from "./theme.ts";
import type { SettingsStorage } from "../lib/storage.ts";

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

interface ThemeProviderProps {
  initialTheme: ThemePreference;
  storage: SettingsStorage | undefined;
  root?: HTMLElement;
  children: ReactNode;
}

/** System, light or dark; applied to the document root and remembered on this device. */
export function ThemeProvider({
  initialTheme,
  storage,
  root = document.documentElement,
  children,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(() => {
    applyTheme(initialTheme, root);
    return initialTheme;
  });

  const setTheme = useCallback(
    (next: ThemePreference) => {
      applyTheme(next, root);
      rememberTheme(next, storage);
      setThemeState(next);
    },
    [root, storage],
  );

  const state = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext value={state}>{children}</ThemeContext>;
}

export function useTheme(): ThemeState {
  const state = use(ThemeContext);
  if (state === null) throw new Error("useTheme needs a ThemeProvider");
  return state;
}
