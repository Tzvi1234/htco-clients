// WCAG 2.2 contrast for every colour pair the brand book allows, in every mode (palette, theme
// and tweak levels, modes.ts): text at least 4.5:1 on every surface, control boundaries, focus
// rings, status dots and icons at least 3:1, and the named pairs (labels on their fills, coloured
// text on its tint, tags, presence flags).
//
// Frosted glass makes surfaces translucent. A translucent background is composited over what it
// floats on before measuring: panels, the sidebar and menus over every backdrop sample of the
// mode (the plain ground, or the designed bloom's colours over both ends of its gradient), and
// fills inside a panel (raised, hover, selected, tints) over the panel composited the same way.
import type { DtcgColor, Token } from "./tokens.ts";

export type ContrastPair = readonly [foreground: string, background: string, minimum: number];

export interface ContrastFailure {
  foreground: string;
  background: string;
  minimum: number;
  ratio: number;
}

/** Everything text can sit on. `bg.ground` is the backdrop itself (the top bar sits on it). */
const SURFACES = [
  "bg.ground",
  "bg.panel",
  "bg.raised",
  "bg.sidebar",
  "bg.hover",
  "bg.selected",
  "bg.menu",
  "bg.card",
  "bg.table-head",
];
const HUES = ["iris", "saffron", "coral", "mint", "sky", "rose", "slate"];
const PRESENCE = ["iris", "coral", "mint", "sky", "rose", "saffron", "slate"];
const TEXT = [
  "text.primary",
  "text.secondary",
  "text.muted",
  "accent.text",
  "attention.text",
  "success.text",
  "danger.text",
  "info.text",
];
const CONTROLS = [
  "border.control",
  "border.focus",
  "icon.default",
  "icon.muted",
  "attention.dot",
  "success.dot",
  "danger.dot",
  "info.dot",
  "inverse.bg",
];
const NAMED_PAIRS: ContrastPair[] = [
  // The inverse fill: active pills, the current item, primary buttons.
  ["inverse.text", "inverse.bg", 4.5],
  ["inverse.text", "inverse.bg-hover", 4.5],
  ["inverse.text-muted", "inverse.bg", 4.5],
  ["inverse.text-muted", "inverse.bg-hover", 4.5],
  // The current item's accent dot on the inverse fill.
  ["accent.on-inverse", "inverse.bg", 3],
  ["accent.on-inverse", "inverse.bg-hover", 3],
  ["accent.on-fill", "accent.fill", 4.5],
  ["attention.on-fill", "attention.fill", 4.5],
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
  // Tags: their text on their tint, and their dot on the tint and on a plain surface.
  ...HUES.flatMap((hue): ContrastPair[] => [
    [`tag.${hue}.text`, `tag.${hue}.bg`, 4.5],
    [`tag.${hue}.dot`, `tag.${hue}.bg`, 3],
    [`tag.${hue}.dot`, "bg.card", 3],
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

/** Surfaces that float on the backdrop; any other translucent fill sits inside a panel. */
const ON_BACKDROP = new Set([
  "bg.ground",
  "bg.panel",
  "bg.sidebar",
  "bg.menu",
  "bg.card",
  "bg.table-head",
]);

const linear = (channel: number): number => {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const channels = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const luminance = (hex: string): number => {
  const [r, g, b] = channels(hex).map(linear);
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
};

/** The WCAG contrast ratio of two `#rrggbb` colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

/** `colour` at its alpha over the opaque `under`, as `#rrggbb`. */
export function composite(colour: DtcgColor, under: string): string {
  const alpha = colour.alpha ?? 1;
  const top = channels(colour.hex);
  const bottom = channels(under);
  const mixed = top.map((value, index) =>
    Math.round(value * alpha + (bottom[index] ?? 0) * (1 - alpha)),
  );
  return `#${mixed.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Every pair below its minimum. `backdrops` are the opaque colours the mode's surfaces can float
 * on; without them a pair naming a translucent colour is an error, as is a missing colour.
 */
export function contrastFailures(
  tokens: Token[],
  pairs: readonly ContrastPair[],
  backdrops: readonly string[] = [],
): ContrastFailure[] {
  const colours = new Map(
    tokens.flatMap((token) =>
      token.type === "color" && token.path[0] === "color"
        ? [[token.path.slice(1).join("."), token.value] as const]
        : [],
    ),
  );
  const colour = (name: string): DtcgColor => {
    const value = colours.get(name);
    if (value === undefined) throw new Error(`Contrast pair names a missing colour: ${name}`);
    return value;
  };
  const opaque = (name: string): boolean => (colour(name).alpha ?? 1) === 1;
  const floors = (): string[] => {
    if (backdrops.length === 0) throw new Error("Translucent colours need backdrops");
    return [...backdrops];
  };
  /** The opaque colours a background can show, after compositing. */
  const samples = (name: string): string[] => {
    const value = colour(name);
    if (name === "bg.ground" && backdrops.length > 0) return [...backdrops];
    if (opaque(name)) return [value.hex];
    if (backdrops.length === 0) {
      throw new Error(`Contrast pair names a translucent colour: ${name}`);
    }
    const under = ON_BACKDROP.has(name) ? floors() : samples("bg.panel");
    return under.map((below) => composite(value, below));
  };
  return pairs.flatMap(([foreground, background, minimum]) => {
    if (!opaque(foreground)) {
      throw new Error(`Contrast pair names a translucent colour: ${foreground}`);
    }
    const ratios = samples(background).map((hex) => contrastRatio(colour(foreground).hex, hex));
    const ratio = Math.min(...ratios);
    return ratio < minimum ? [{ foreground, background, minimum, ratio }] : [];
  });
}

/**
 * What a mode's surfaces float on: the plain ground, or, with glass over the designed ground,
 * the ground plus every bloom colour composited over both ends of the bloom's gradient.
 */
export function backdropsOf(tokens: Token[], bloom: boolean): string[] {
  const find = (name: string): DtcgColor => {
    const token = tokens.find((candidate) => candidate.path.join(".") === `color.${name}`);
    if (token?.type !== "color") throw new Error(`Missing colour: ${name}`);
    return token.value;
  };
  const ground = find("bg.ground").hex;
  if (!bloom) return [ground];
  const ends = [find("bloom.start").hex, find("bloom.end").hex];
  const blooms = [1, 2, 3, 4, 5].map((index) => find(`bloom.${String(index)}`));
  return [ground, ...ends, ...blooms.flatMap((layer) => ends.map((end) => composite(layer, end)))];
}
