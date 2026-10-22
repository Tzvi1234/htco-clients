// The appearance preference (client ADR-0008, round 3 in ADR-0009): one shared preference for
// every HTCO interface on this origin (the web app and the landing page share dash.ht-co.app's
// localStorage; the native apps will store the same keys and values). Since round 3 the owner
// chooses only two things here, each remembered under its own key and applied as a data
// attribute on <html>, which the token stylesheet reads:
//
//   htco.theme    system | light | dark   data-theme (absent for system: follows the device live)
//   htco.palette  sbb | d4                data-pal   (gray, or cream; both with the logo's orange)
//
// The language is the third setting (htco.locale, i18n/locale.ts). The contrast, glass and
// border tweaks are retired: the navigation and the top bar are always frosted glass, and the
// device's "reduce transparency" sets data-solid, which makes them solid. Values remembered by
// earlier versions are migrated (migrateAppearance): the "plain" palette becomes "sbb" (it was
// SBB without the blooms, which only showed behind the retired glass tweak) and the retired keys
// are forgotten.
//
// index.html applies the same attributes before the first paint (boot.ts); keep them in step.
import { forgetSetting, readSetting, writeSetting, type SettingsStorage } from "../lib/storage.ts";
import { THEME_PREFERENCES, type ThemePreference } from "./theme.ts";

/** SBB (gray, black, white and orange) and Design 4's cream ground with the same orange. */
export const PALETTES = ["sbb", "d4"] as const;
export type Palette = (typeof PALETTES)[number];

export interface Tweaks {
  theme: ThemePreference;
  palette: Palette;
}

export type TweakName = keyof Tweaks;

export const DEFAULT_TWEAKS: Readonly<Tweaks> = { theme: "system", palette: "sbb" };

export const TWEAK_STORAGE_KEYS: Readonly<Record<TweakName, string>> = {
  theme: "htco.theme",
  palette: "htco.palette",
};

/** Keys of the tweaks retired in round 3, forgotten on migration. */
export const RETIRED_KEYS = ["htco.contrast", "htco.glass", "htco.borders"] as const;

/** Stored palettes that no longer exist, and the palette each now means. */
const RENAMED_PALETTES: Readonly<Record<string, Palette>> = { plain: "sbb" };

const isTheme = (value: string | null): value is ThemePreference =>
  THEME_PREFERENCES.some((theme) => theme === value);
const isPalette = (value: string | null): value is Palette =>
  PALETTES.some((palette) => palette === value);

function paletteOf(value: string | null): Palette {
  if (isPalette(value)) return value;
  return (value === null ? undefined : RENAMED_PALETTES[value]) ?? DEFAULT_TWEAKS.palette;
}

/** The remembered appearance, each part falling back to its default on its own. */
export function readTweaks(storage: SettingsStorage | undefined): Tweaks {
  const theme = readSetting(storage, TWEAK_STORAGE_KEYS.theme);
  return {
    theme: isTheme(theme) ? theme : DEFAULT_TWEAKS.theme,
    palette: paletteOf(readSetting(storage, TWEAK_STORAGE_KEYS.palette)),
  };
}

/**
 * Rewrites what an earlier version remembered: a renamed palette is stored under its new name,
 * and the retired tweaks are forgotten. Running it again changes nothing.
 */
export function migrateAppearance(storage: SettingsStorage | undefined): void {
  const palette = readSetting(storage, TWEAK_STORAGE_KEYS.palette);
  if (palette !== null && !isPalette(palette) && RENAMED_PALETTES[palette] !== undefined) {
    writeSetting(storage, TWEAK_STORAGE_KEYS.palette, paletteOf(palette));
  }
  for (const key of RETIRED_KEYS) {
    if (readSetting(storage, key) !== null) forgetSetting(storage, key);
  }
}

export function writeTweak<Name extends TweakName>(
  storage: SettingsStorage | undefined,
  name: Name,
  value: Tweaks[Name],
): void {
  writeSetting(storage, TWEAK_STORAGE_KEYS[name], value);
}

/** The device asks for less transparency: the navigation's glass then becomes solid. */
export const REDUCED_TRANSPARENCY_QUERY = "(prefers-reduced-transparency: reduce)";

function prefersSolid(): boolean {
  return (
    typeof window.matchMedia === "function" && window.matchMedia(REDUCED_TRANSPARENCY_QUERY).matches
  );
}

/** The attributes the retired tweaks set; removed so no old rule can match. */
const RETIRED_ATTRIBUTES = ["data-t1", "data-t2", "data-t3"] as const;

/**
 * The attributes the token stylesheet reads: "system" removes data-theme (the stylesheet then
 * follows the device's light or dark setting as it changes), and the device's "reduce
 * transparency" sets data-solid.
 */
export function applyTweaks(tweaks: Tweaks, root: HTMLElement, solid = prefersSolid()): void {
  if (tweaks.theme === "system") root.removeAttribute("data-theme");
  else root.dataset["theme"] = tweaks.theme;
  root.dataset["pal"] = tweaks.palette;
  if (solid) root.dataset["solid"] = "";
  else root.removeAttribute("data-solid");
  for (const name of RETIRED_ATTRIBUTES) root.removeAttribute(name);
}
