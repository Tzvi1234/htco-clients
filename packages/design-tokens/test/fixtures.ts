import type { DtcgColor, Token } from "../src/tokens.ts";

export function aColor(hex: string, alpha = 1): DtcgColor {
  const channel = (offset: number): number => parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return { colorSpace: "srgb", components: [channel(1), channel(3), channel(5)], alpha, hex };
}

export const px = (value: number) => ({ value, unit: "px" as const });

/** A small theme: two semantic colours, one primitive of each other kind. */
export function aTheme(canvas: string, text: string): Token[] {
  return [
    { path: ["color", "bg", "canvas"], type: "color", value: aColor(canvas) },
    { path: ["color", "text", "primary"], type: "color", value: aColor(text) },
    { path: ["palette", "navy", "25"], type: "color", value: aColor("#f4f7fa") },
    { path: ["color", "brand", "navy"], type: "color", value: aColor("#030f1f") },
    { path: ["breakpoint", "sm"], type: "dimension", value: px(640) },
    { path: ["space", "4"], type: "dimension", value: px(16) },
    { path: ["radius", "md"], type: "dimension", value: px(12) },
    { path: ["font", "size", "body"], type: "dimension", value: px(16) },
    { path: ["font", "tracking", "label"], type: "dimension", value: { value: 0.02, unit: "rem" } },
    { path: ["font", "weight", "semibold"], type: "fontWeight", value: 600 },
    {
      path: ["font", "family", "latin"],
      type: "fontFamily",
      value: ["Inter", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
    },
    { path: ["motion", "duration", "fast"], type: "duration", value: { value: 120, unit: "ms" } },
    { path: ["motion", "easing", "standard"], type: "cubicBezier", value: [0.2, 0, 0, 1] },
    {
      path: ["elevation", "1"],
      type: "shadow",
      value: [
        {
          color: aColor("#030f1f", 0.06),
          offsetX: px(0),
          offsetY: px(1),
          blur: px(2),
          spread: px(0),
        },
      ],
    },
  ];
}
