import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";

import type { AreaId } from "./nav.ts";
import { readSetting, writeSetting } from "../../shared/lib/storage.ts";
import { useSettingsStorage } from "../../shared/lib/storageContext.ts";
import { NARROW_QUERY, useMediaQuery } from "../../shared/lib/useMediaQuery.ts";

/** "mini" or "open" once the user has chosen; until then the width decides (the demo's rule). */
export const SIDEBAR_KEY = "htco.sidebar";

interface ShellState {
  /** The sidebar is collapsed to its 72 px rail. */
  mini: boolean;
  toggleMini: () => void;
  /** The area whose tabs the flyout lists beside the collapsed sidebar. */
  flyout: AreaId | null;
  setFlyout: (area: AreaId | null) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

const ShellContext = createContext<ShellState | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const storage = useSettingsStorage();
  const narrow = useMediaQuery(NARROW_QUERY);
  const [chosen, setChosen] = useState(() => {
    const value = readSetting(storage, SIDEBAR_KEY);
    return value === "mini" || value === "open" ? value : null;
  });
  const [flyout, setFlyout] = useState<AreaId | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const mini = chosen === null ? narrow : chosen === "mini";

  const toggleMini = useCallback(() => {
    const next = mini ? "open" : "mini";
    writeSetting(storage, SIDEBAR_KEY, next);
    setChosen(next);
    setFlyout(null);
  }, [mini, storage]);

  const state = useMemo(
    () => ({ mini, toggleMini, flyout, setFlyout, paletteOpen, setPaletteOpen }),
    [mini, toggleMini, flyout, paletteOpen],
  );
  return <ShellContext value={state}>{children}</ShellContext>;
}

export function useShell(): ShellState {
  const state = use(ShellContext);
  if (state === null) throw new Error("useShell needs a ShellProvider");
  return state;
}
