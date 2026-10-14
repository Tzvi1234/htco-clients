// Per-device settings (language, theme). Storage can be missing or blocked (private windows,
// strict privacy settings), so every access is guarded and a failure means "no setting".

export type SettingsStorage = Pick<Storage, "getItem" | "setItem">;

export function readSetting(storage: SettingsStorage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeSetting(
  storage: SettingsStorage | undefined,
  key: string,
  value: string,
): void {
  try {
    storage?.setItem(key, value);
  } catch {
    // Not remembered on this device; the choice still applies to this visit.
  }
}

/** The browser's localStorage, or undefined where it cannot be reached. */
export function deviceStorage(): SettingsStorage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** An in-memory storage for tests and for browsers without localStorage. */
export function memoryStorage(): SettingsStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}
