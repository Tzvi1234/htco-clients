// WCAG 2.2 contrast for every colour pair the brand book allows, in each theme: text at least
// 4.5:1 on every surface, control boundaries, focus rings, status dots and icons at least 3:1,
// and the named pairs (button labels on their fills, badge text on its tint).
import type { Token } from "./tokens.ts";

export type ContrastPair = readonly [foreground: string, background: string, minimum: number];

export interface ContrastFailure {
  foreground: string;
  background: string;
  minimum: number;
  ratio: number;
}

const SURFACES = [
  "bg.canvas",
  "bg.sidebar",
  "bg.surface",
  "bg.raised",
  "bg.sunken",
  "bg.hover",
  "bg.selected",
];
const HUES = ["iris", "saffron", "coral", "mint", "sky", "rose", "slate"];
const PRESENCE = ["iris", "coral", "mint", "sky", "rose", "saffron", "slate"];
const TEXT = [
  "text.primary",
  "text.secondary",
  "text.muted",
  "text.link",
  "accent.text",
  "attention.text",
  "success.text",
  "danger.text",
];
const CONTROLS = [
  "border.control",
  "border.focus",
  "accent.fill",
  "attention.dot",
  "success.dot",
  "danger.dot",
  "icon.default",
  "icon.muted",
  "action.primary.bg",
];
const NAMED_PAIRS: ContrastPair[] = [
  ["text.on-brand", "bg.brand", 4.5],
  ["action.primary.fg", "action.primary.bg", 4.5],
  ["action.primary.fg", "action.primary.bg-hover", 4.5],
  ["action.primary.fg", "action.primary.bg-pressed", 4.5],
  ["action.secondary.fg", "action.secondary.bg", 4.5],
  ["action.secondary.fg", "action.secondary.bg-hover", 4.5],
  ["action.secondary.border", "action.secondary.bg", 3],
  ["action.danger.fg", "action.danger.bg", 4.5],
  ["accent.text", "accent.subtle", 4.5],
  ["attention.text", "attention.subtle", 4.5],
  ["success.text", "success.subtle", 4.5],
  ["danger.text", "danger.subtle", 4.5],
  ["text.primary", "accent.subtle", 4.5],
  ["text.primary", "attention.subtle", 4.5],
  ["text.primary", "success.subtle", 4.5],
  ["text.primary", "danger.subtle", 4.5],
  ["text.on-brand", "bg.canvas", 4.5],
  // Tags: their text on their tint, and their dot on the tint and on a plain surface.
  ...HUES.flatMap((hue): ContrastPair[] => [
    [`tag.${hue}.text`, `tag.${hue}.bg`, 4.5],
    [`tag.${hue}.dot`, `tag.${hue}.bg`, 3],
    [`tag.${hue}.dot`, "bg.surface", 3],
  ]),
  // An AI employee's presence flag: the name on the flag colour.
  ...PRESENCE.map((hue): ContrastPair => [`presence.${hue}.fg`, `presence.${hue}.bg`, 4.5]),
];

/** Pairs of colour token names (without the `color.` prefix) and the minimum ratio. */
export const CONTRAST_PAIRS: ContrastPair[] = [
  ...NAMED_PAIRS,
  ...TEXT.flatMap((text) => SURFACES.map((surface): ContrastPair => [text, surface, 4.5])),
  ...CONTROLS.flatMap((control) => SURFACES.map((surface): ContrastPair => [control, surface, 3])),
];

const linear = (channel: number): number => {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((offset) => linear(parseInt(hex.slice(offset, offset + 2), 16)));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
};

/** The WCAG contrast ratio of two `#rrggbb` colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

/** Every pair below its minimum. A pair naming a missing or translucent colour is an error. */
export function contrastFailures(
  tokens: Token[],
  pairs: readonly ContrastPair[],
): ContrastFailure[] {
  const colours = new Map(
    tokens.flatMap((token) =>
      token.type === "color" && token.path[0] === "color"
        ? [[token.path.slice(1).join("."), token.value] as const]
        : [],
    ),
  );
  const hex = (name: string): string => {
    const colour = colours.get(name);
    if (colour === undefined) throw new Error(`Contrast pair names a missing colour: ${name}`);
    if ((colour.alpha ?? 1) !== 1)
      throw new Error(`Contrast pair names a translucent colour: ${name}`);
    return colour.hex;
  };
  return pairs.flatMap(([foreground, background, minimum]) => {
    const ratio = contrastRatio(hex(foreground), hex(background));
    return ratio < minimum ? [{ foreground, background, minimum, ratio }] : [];
  });
}
