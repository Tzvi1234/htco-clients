// The Design 1C modes (client ADR-0008): a palette, a theme and three tweak levels. Each is a
// set of overlay files in design/tokens/modes/ applied over the default palette's semantic
// tokens, and on the web a set of `data-*` attributes on <html>:
//
//   data-pal   sbb (default) | plain | d4     the palette ("plain": sbb without the bloom)
//   data-theme light | dark (absent: follow the system)
//   data-t1    1 | 2 | 3   element vs ground contrast (default palette only)
//   data-t2    1 | 2 | 3   frosted glass (any palette)
//   data-t3    1 | 2 | 3   element borders (default palette only)
import type { Theme } from "./tokens.ts";

export const PALETTES = ["sbb", "plain", "d4"] as const;
export type Palette = (typeof PALETTES)[number];
export const LEVELS = [1, 2, 3] as const;
export type Level = (typeof LEVELS)[number];

export interface Mode {
  palette: Palette;
  theme: Theme;
  contrast: Level;
  glass: Level;
  borders: Level;
}

/** Contrast and borders come from the palette itself in Design 4 (as in the demo). */
export const tweaksApply = (palette: Palette): boolean => palette !== "d4";

/** The overlay files a mode applies over `semantic.<theme>.json`, in cascade order. */
export function overlaysFor(mode: Mode): string[] {
  const { palette, theme, contrast, glass, borders } = mode;
  const files: string[] = [];
  if (palette === "d4") files.push(`modes/palette-d4.${theme}.json`);
  if (tweaksApply(palette) && contrast > 1)
    files.push(`modes/contrast-${String(contrast)}.${theme}.json`);
  if (tweaksApply(palette) && borders > 1)
    files.push(`modes/borders-${String(borders)}.${theme}.json`);
  if (glass > 1) {
    files.push(`modes/glass-${String(glass)}.${theme}.json`);
    if (palette === "d4") files.push(`modes/glass-${String(glass)}-d4.${theme}.json`);
  }
  // The design keeps more of the panel under strong glass at contrast level 3.
  if (tweaksApply(palette) && glass === 3 && contrast === 3) {
    files.push(`modes/glass-3-contrast-3.${theme}.json`);
  }
  return files;
}

/** Whether the ground behind glass is the designed bloom (not the plain ground). */
export const hasBloom = (mode: Mode): boolean => mode.glass > 1 && mode.palette !== "plain";

/** Every distinct mode; for Design 4 only glass varies. */
export const ALL_MODES: Mode[] = PALETTES.flatMap((palette) =>
  (["light", "dark"] as const).flatMap((theme) =>
    LEVELS.flatMap((glass) =>
      (tweaksApply(palette) ? LEVELS : ([1] as const)).flatMap((contrast) =>
        (tweaksApply(palette) ? LEVELS : ([1] as const)).map((borders): Mode => ({
          palette,
          theme,
          contrast,
          glass,
          borders,
        })),
      ),
    ),
  ),
);

export const modeName = ({ palette, theme, contrast, glass, borders }: Mode): string =>
  `${palette} ${theme} t1=${String(contrast)} t2=${String(glass)} t3=${String(borders)}`;

/**
 * The CSS cascade layers, in order, and the condition (attributes on :root) under which each
 * overlay applies. Light and dark files of one overlay set the same tokens, and a dark rule is
 * always one attribute more specific than its light rule, so the theme resolves inside a layer.
 */
export interface CssRule {
  when: string;
  file: (theme: Theme) => string;
  /** A descendant selector the overlay is scoped to (the tokens then apply inside it only). */
  scope?: string;
}

/**
 * The navigation and the top bar are frosted glass whatever the tweaks (round 3): the glass
 * level 2 overlay, scoped to `[data-glass]`, over the plain ground (no bloom). The device's
 * "reduce transparency" sets `data-solid` on <html>, which turns it off.
 */
export const NAV_GLASS_SCOPE = "[data-glass]";

/** The modes the scoped nav glass is checked in: each palette and theme, glass 2, no bloom. */
export const NAV_GLASS_MODES: Mode[] = (["sbb", "d4"] as const).flatMap((palette) =>
  (["light", "dark"] as const).map(
    (theme): Mode => ({ palette, theme, contrast: 1, glass: 2, borders: 1 }),
  ),
);

export const CSS_LAYERS: { layer: string; rules: CssRule[] }[] = [
  {
    layer: "palette",
    rules: [{ when: '[data-pal="d4"]', file: (theme) => `modes/palette-d4.${theme}.json` }],
  },
  {
    layer: "contrast",
    rules: [2, 3].map((level) => ({
      when: `:not([data-pal="d4"])[data-t1="${String(level)}"]`,
      file: (theme: Theme) => `modes/contrast-${String(level)}.${theme}.json`,
    })),
  },
  {
    layer: "borders",
    rules: [2, 3].map((level) => ({
      when: `:not([data-pal="d4"])[data-t3="${String(level)}"]`,
      file: (theme: Theme) => `modes/borders-${String(level)}.${theme}.json`,
    })),
  },
  {
    layer: "glass",
    rules: [
      ...[2, 3].map((level) => ({
        when: `[data-t2="${String(level)}"]`,
        file: (theme: Theme) => `modes/glass-${String(level)}.${theme}.json`,
      })),
      ...[2, 3].map((level) => ({
        when: `[data-pal="d4"][data-t2="${String(level)}"]`,
        file: (theme: Theme) => `modes/glass-${String(level)}-d4.${theme}.json`,
      })),
      {
        when: ':not([data-pal="d4"])[data-t1="3"][data-t2="3"]',
        file: (theme: Theme) => `modes/glass-3-contrast-3.${theme}.json`,
      },
    ],
  },
  {
    layer: "nav-glass",
    rules: [
      {
        when: ":not([data-solid])",
        scope: NAV_GLASS_SCOPE,
        file: (theme: Theme) => `modes/glass-2.${theme}.json`,
      },
      {
        when: '[data-pal="d4"]:not([data-solid])',
        scope: NAV_GLASS_SCOPE,
        file: (theme: Theme) => `modes/glass-2-d4.${theme}.json`,
      },
    ],
  },
];
