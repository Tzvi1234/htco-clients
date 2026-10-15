import { useCallback, useSyncExternalStore } from "react";

/** Whether a media query matches now, following changes; false where matchMedia is missing. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== "function") return () => undefined;
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => {
        list.removeEventListener("change", onChange);
      };
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => typeof window.matchMedia === "function" && window.matchMedia(query).matches,
    () => false,
  );
}

/** Phones get the tab bar layout; everything from 640 px gets the sidebar (Design 1C). */
export const PHONE_QUERY = "(max-width: 639.98px)";

/** Below this width the sidebar starts collapsed unless the user chose (the demo's 1360 px). */
export const NARROW_QUERY = "(max-width: 1359.98px)";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
