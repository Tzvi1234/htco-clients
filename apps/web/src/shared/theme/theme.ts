import { readSetting, writeSetting, type SettingsStorage } from "../lib/storage.ts";

export const THEME_PREFERENCES = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

const STORAGE_KEY = "htco.theme";

function isThemePreference(value: string | null): value is ThemePreference {
  return THEME_PREFERENCES.some((preference) => preference === value);
}

/** The choice remembered on this device, else the system theme. */
export function initialTheme(storage: SettingsStorage | undefined): ThemePreference {
  const remembered = readSetting(storage, STORAGE_KEY);
  return isThemePreference(remembered) ? remembered : "system";
}

export function rememberTheme(
  preference: ThemePreference,
  storage: SettingsStorage | undefined,
): void {
  writeSetting(storage, STORAGE_KEY, preference);
}

/**
 * The token stylesheet follows `prefers-color-scheme` unless `data-theme` names a theme, so
 * "system" removes the attribute and an explicit choice sets it.
 */
export function applyTheme(preference: ThemePreference, root: HTMLElement): void {
  if (preference === "system") root.removeAttribute("data-theme");
  else root.dataset["theme"] = preference;
}
