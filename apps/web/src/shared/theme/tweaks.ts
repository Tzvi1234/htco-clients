// The design tweaks (client ADR-0008): one shared preference for every HTCO interface on this
// origin (the web app and the landing page share dash.ht-co.app's localStorage; the native apps
// will store the same keys and values). Each tweak is remembered under its own key and applied
// as data attributes on <html>, which the token stylesheet reads:
//
//   htco.theme    system | light | dark   data-theme (absent for system)
//   htco.palette  sbb | d4 | plain        data-pal
//   htco.contrast 1 | 2 | 3               data-t1   element vs ground contrast
//   htco.glass    1 | 2 | 3               data-t2   frosted glass
//   htco.borders  1 | 2 | 3               data-t3   element borders
//
// index.html applies the same attributes before the first paint (boot.ts); keep them in step.
import { readSetting, writeSetting, type SettingsStorage } from "../lib/storage.ts";
import { THEME_PREFERENCES, type ThemePreference } from "./theme.ts";

/** SBB (gray and orange), Design 4 (cream and lilac), and SBB on its plain ground (no bloom). */
export const PALETTES = ["sbb", "d4", "plain"] as const;
export type Palette = (typeof PALETTES)[number];

export const LEVELS = [1, 2, 3] as const;
export type Level = (typeof LEVELS)[number];

export interface Tweaks {
  theme: ThemePreference;
  palette: Palette;
  /** Tweak 1: element vs ground contrast (the default palettes only). */
  contrast: Level;
  /** Tweak 2: frosted glass, with the designed ground behind it unless the palette is plain. */
  glass: Level;
  /** Tweak 3: element borders (the default palettes only). */
  borders: Level;
}

export type TweakName = keyof Tweaks;

export const DEFAULT_TWEAKS: Readonly<Tweaks> = {
  theme: "system",
  palette: "sbb",
  contrast: 1,
  glass: 1,
  borders: 1,
};

export const TWEAK_STORAGE_KEYS: Readonly<Record<TweakName, string>> = {
  theme: "htco.theme",
  palette: "htco.palette",
  contrast: "htco.contrast",
  glass: "htco.glass",
  borders: "htco.borders",
};

const isTheme = (value: string | null): value is ThemePreference =>
  THEME_PREFERENCES.some((theme) => theme === value);
const isPalette = (value: string | null): value is Palette =>
  PALETTES.some((palette) => palette === value);
const level = (value: string | null): Level | undefined =>
  LEVELS.find((candidate) => String(candidate) === value);

/** Contrast and borders come from the palette itself in Design 4 (as in the demo). */
export const levelsApply = (palette: Palette): boolean => palette !== "d4";

/** The remembered tweaks, each falling back to its default on its own. */
export function readTweaks(storage: SettingsStorage | undefined): Tweaks {
  const read = (name: TweakName) => readSetting(storage, TWEAK_STORAGE_KEYS[name]);
  const theme = read("theme");
  const palette = read("palette");
  return {
    theme: isTheme(theme) ? theme : DEFAULT_TWEAKS.theme,
    palette: isPalette(palette) ? palette : DEFAULT_TWEAKS.palette,
    contrast: level(read("contrast")) ?? DEFAULT_TWEAKS.contrast,
    glass: level(read("glass")) ?? DEFAULT_TWEAKS.glass,
    borders: level(read("borders")) ?? DEFAULT_TWEAKS.borders,
  };
}

export function writeTweak<Name extends TweakName>(
  storage: SettingsStorage | undefined,
  name: Name,
  value: Tweaks[Name],
): void {
  writeSetting(storage, TWEAK_STORAGE_KEYS[name], String(value));
}

/** The device asks for less transparency: frosted glass then stays off, whatever the tweak. */
export const REDUCED_TRANSPARENCY_QUERY = "(prefers-reduced-transparency: reduce)";

function prefersSolid(): boolean {
  return (
    typeof window.matchMedia === "function" && window.matchMedia(REDUCED_TRANSPARENCY_QUERY).matches
  );
}

/**
 * The attributes the token stylesheet reads; "system" removes data-theme. Under the device's
 * "reduce transparency" glass is applied as off (level 1), so every surface is solid with the
 * contrast it was solved for; the remembered choice itself is kept.
 */
export function applyTweaks(tweaks: Tweaks, root: HTMLElement, solid = prefersSolid()): void {
  if (tweaks.theme === "system") root.removeAttribute("data-theme");
  else root.dataset["theme"] = tweaks.theme;
  root.dataset["pal"] = tweaks.palette;
  root.dataset["t1"] = String(tweaks.contrast);
  root.dataset["t2"] = solid ? "1" : String(tweaks.glass);
  root.dataset["t3"] = String(tweaks.borders);
}

/** How many tweaks differ from their defaults (and apply), for the top bar's badge. */
export function changedTweaks(tweaks: Tweaks): number {
  const names: TweakName[] = levelsApply(tweaks.palette)
    ? ["theme", "palette", "contrast", "glass", "borders"]
    : ["theme", "palette", "glass"];
  return names.filter((name) => tweaks[name] !== DEFAULT_TWEAKS[name]).length;
}
