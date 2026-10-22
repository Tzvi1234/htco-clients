import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ThemePreference } from "./theme.ts";
import {
  applyTweaks,
  readTweaks,
  REDUCED_TRANSPARENCY_QUERY,
  TWEAK_STORAGE_KEYS,
  writeTweak,
  type TweakName,
  type Tweaks,
} from "./tweaks.ts";
import type { SettingsStorage } from "../lib/storage.ts";
import { useMediaQuery } from "../lib/useMediaQuery.ts";

interface TweaksState {
  tweaks: Tweaks;
  setTweak: <Name extends TweakName>(name: Name, value: Tweaks[Name]) => void;
}

const TweaksContext = createContext<TweaksState | null>(null);

interface TweaksProviderProps {
  initialTweaks: Tweaks;
  storage: SettingsStorage | undefined;
  root?: HTMLElement;
  children: ReactNode;
}

const STORAGE_KEYS = new Set(Object.values(TWEAK_STORAGE_KEYS));

/**
 * The appearance (theme and palette), one preference for every interface on this origin
 * (client ADR-0008): applied to the document root, remembered, and followed when another tab of
 * the app or the landing page changes them.
 */
export function TweaksProvider({
  initialTweaks,
  storage,
  root = document.documentElement,
  children,
}: TweaksProviderProps) {
  const [tweaks, setTweaks] = useState(() => {
    applyTweaks(initialTweaks, root);
    return initialTweaks;
  });

  const update = useCallback(
    (next: Tweaks) => {
      applyTweaks(next, root);
      setTweaks(next);
    },
    [root],
  );

  const setTweak = useCallback(
    <Name extends TweakName>(name: Name, value: Tweaks[Name]) => {
      writeTweak(storage, name, value);
      setTweaks((current) => {
        const next = { ...current, [name]: value };
        applyTweaks(next, root);
        return next;
      });
    },
    [root, storage],
  );

  // Another tab on this origin (the app or the landing page) changed a tweak.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || STORAGE_KEYS.has(event.key)) update(readTweaks(storage));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [storage, update]);

  // The device's "reduce transparency" changed while the app is open: the glass follows at once.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const list = window.matchMedia(REDUCED_TRANSPARENCY_QUERY);
    const onChange = () => {
      applyTweaks(tweaks, root);
    };
    list.addEventListener("change", onChange);
    return () => {
      list.removeEventListener("change", onChange);
    };
  }, [root, tweaks]);

  const state = useMemo(() => ({ tweaks, setTweak }), [tweaks, setTweak]);
  return <TweaksContext value={state}>{children}</TweaksContext>;
}

export function useTweaks(): TweaksState {
  const state = use(TweaksContext);
  if (state === null) throw new Error("useTweaks needs a TweaksProvider");
  return state;
}

/** The theme part of the tweaks: system, light or dark (the Settings page and account menu). */
export function useTheme(): { theme: ThemePreference; setTheme: (theme: ThemePreference) => void } {
  const { tweaks, setTweak } = useTweaks();
  const setTheme = useCallback(
    (theme: ThemePreference) => {
      setTweak("theme", theme);
    },
    [setTweak],
  );
  return { theme: tweaks.theme, setTheme };
}

export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

/** The device's own theme now, following it live (what "System" shows while it is chosen). */
export function useSystemTheme(): "light" | "dark" {
  return useMediaQuery(DARK_SCHEME_QUERY) ? "dark" : "light";
}
