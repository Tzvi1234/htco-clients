import { describe, expect, it } from "vitest";

import { renderCss } from "../src/css.ts";
import { renderKotlin } from "../src/kotlin.ts";
import { renderXaml } from "../src/xaml.ts";
import { aColor, aTheme } from "./fixtures.ts";

const light = aTheme("#f4f7fa", "#0a1a2c");
const dark = aTheme("#030f1f", "#eef4fa");

describe("renderCss", () => {
  const css = renderCss(light, dark);
  const block = (selector: string): string => {
    const start = css.indexOf(`${selector} {`);
    return css.slice(start, css.indexOf("}", start));
  };

  it("puts the light theme and the primitives on :root, with brand-book names", () => {
    const root = block(":root");

    expect(root).toContain("--bg-canvas: #f4f7fa;");
    expect(root).toContain("--text-primary: #0a1a2c;");
    expect(root).toContain("--space-4: 16px;");
    expect(root).toContain("--radius-md: 12px;");
    expect(root).toContain("--font-size-body: 16px;");
    expect(root).toContain("--font-tracking-label: 0.02rem;");
    expect(root).toContain("--font-weight-semibold: 600;");
    expect(root).toContain("--motion-duration-fast: 120ms;");
    expect(root).toContain("--motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);");
    expect(root).toContain("--elevation-1: 0px 1px 2px 0px rgba(3, 15, 31, 0.06);");
  });

  it("quotes font names but not generic families", () => {
    expect(css).toContain(
      '--font-family-latin: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;',
    );
  });

  it("has a dark theme for data-theme and for the system preference, with colours only", () => {
    const explicit = block('[data-theme="dark"]');
    const system = block(':root:not([data-theme="light"])');

    for (const dark of [explicit, system]) {
      expect(dark).toContain("--bg-canvas: #030f1f;");
      expect(dark).toContain("--elevation-1:");
      expect(dark).not.toContain("--space-4");
    }
    expect(css).toContain("@media (prefers-color-scheme: dark)");
  });

  it("never publishes palette, brand or breakpoint primitives", () => {
    expect(css).not.toMatch(/--palette-|--color-brand-|--breakpoint-/);
  });

  it("keeps a semantic alias as a link to its target", () => {
    const [canvas] = light;
    if (canvas === undefined) throw new Error("fixture");
    const withAlias = renderCss(
      [{ ...canvas, path: ["color", "bg", "app"], alias: ["color", "bg", "canvas"] }],
      [],
    );
    expect(withAlias).toContain("--bg-app: var(--bg-canvas);");
  });

  it("writes an empty shadow as none", () => {
    const flat = renderCss([{ path: ["elevation", "panel"], type: "shadow", value: [] }], []);
    expect(flat).toContain("--elevation-panel: none;");
  });
});

describe("renderCss with overlays", () => {
  const overlay = aTheme("#ffffff", "#000000").slice(0, 1);
  const overlayDark = aTheme("#111111", "#eeeeee").slice(0, 1);
  const css = renderCss(light, dark, [
    { layer: "glass", overlays: [{ when: '[data-t2="2"]', light: overlay, dark: overlayDark }] },
  ]);

  it("declares the cascade layers in order, the base first", () => {
    expect(css).toContain("@layer htco-tokens.base, htco-tokens.glass;");
    expect(css.indexOf("@layer htco-tokens.base {")).toBeLessThan(
      css.indexOf("@layer htco-tokens.glass {"),
    );
  });

  it("applies an overlay on its attributes, light and dark, with only the tokens it sets", () => {
    const start = css.indexOf("@layer htco-tokens.glass {");
    const glass = css.slice(start);
    expect(glass).toContain(':root[data-t2="2"] {\n    --bg-canvas: #ffffff;\n  }');
    expect(glass).toContain(
      ':root[data-t2="2"][data-theme="dark"] {\n    --bg-canvas: #111111;\n  }',
    );
    expect(glass).toContain(
      ':root[data-t2="2"]:not([data-theme="light"]) {\n      --bg-canvas: #111111;',
    );
    expect(glass).not.toContain("--space-4");
  });
});

describe("renderKotlin", () => {
  const kotlin = renderKotlin(light, dark);

  it("declares the package and the Compose imports it uses", () => {
    expect(kotlin).toContain("package app.htco.designsystem.tokens");
    expect(kotlin).toContain("import androidx.compose.ui.graphics.Color");
    expect(kotlin).toContain("import androidx.compose.ui.unit.dp");
  });

  it("has light and dark colour objects with camelCase names", () => {
    expect(kotlin).toMatch(/object Light \{[^}]*val bgCanvas = Color\(0xFFF4F7FA\)/);
    expect(kotlin).toMatch(/object Dark \{[^}]*val bgCanvas = Color\(0xFF030F1F\)/);
  });

  it("writes spacing and shapes in dp, type in sp, motion as easing and milliseconds", () => {
    expect(kotlin).toContain("val space4 = 16.dp");
    expect(kotlin).toContain("val md = 12.dp");
    expect(kotlin).toContain("val sizeBody = 16.sp");
    expect(kotlin).toContain("val trackingLabel = 0.32.sp");
    expect(kotlin).toContain("val weightSemibold = FontWeight(600)");
    expect(kotlin).toContain("val durationFastMillis = 120");
    expect(kotlin).toContain("val easingStandard = CubicBezierEasing(0.2f, 0f, 0f, 1f)");
  });

  it("leaves out primitives and the web-only tokens", () => {
    expect(kotlin).not.toMatch(/palette|brandNavy|breakpoint|fontFamily|familyLatin|elevation/i);
  });
});

describe("renderXaml", () => {
  const xaml = renderXaml(light, dark);

  it("is a resource dictionary with light and dark theme dictionaries of brushes", () => {
    expect(xaml.startsWith('<?xml version="1.0" encoding="utf-8"?>')).toBe(true);
    expect(xaml).toMatch(
      /<ResourceDictionary x:Key="Light">[\s\S]*<SolidColorBrush x:Key="HtcoBgCanvasBrush" Color="#FFF4F7FA" \/>/,
    );
    expect(xaml).toMatch(
      /<ResourceDictionary x:Key="Dark">[\s\S]*<SolidColorBrush x:Key="HtcoBgCanvasBrush" Color="#FF030F1F" \/>/,
    );
  });

  it("writes theme-independent sizes as doubles and radii as corner radii", () => {
    expect(xaml).toContain('<x:Double x:Key="HtcoSpace4">16</x:Double>');
    expect(xaml).toContain('<x:Double x:Key="HtcoFontSizeBody">16</x:Double>');
    expect(xaml).toContain('<CornerRadius x:Key="HtcoRadiusMd">12</CornerRadius>');
  });

  it("has balanced element tags", () => {
    const opened = xaml.match(/<(?![?!/])[A-Za-z:.]+(?=[\s>])(?![^>]*\/>)/g) ?? [];
    const closed = xaml.match(/<\/[A-Za-z:.]+>/g) ?? [];

    expect(opened).toHaveLength(closed.length);
  });
});

describe("glass colours", () => {
  it("are written as the design's color-mix of their base, following the base everywhere", () => {
    const [canvas] = light;
    if (canvas?.type !== "color") throw new Error("fixture");
    const css = renderCss(
      [
        {
          ...canvas,
          path: ["color", "bg", "panel"],
          mix: { base: ["color", "bg", "panel-base"], amount: 0.52, with: aColor("#000000", 0) },
        },
        {
          ...canvas,
          path: ["color", "bg", "card"],
          mix: { base: ["color", "bg", "panel-base"], amount: 0.3, with: aColor("#fffaf6", 0.08) },
        },
      ],
      [],
    );
    expect(css).toContain("--bg-panel: color-mix(in srgb, var(--bg-panel-base) 52%, transparent);");
    expect(css).toContain(
      "--bg-card: color-mix(in srgb, var(--bg-panel-base) 30%, rgba(255, 250, 246, 0.08));",
    );
  });

  it("write translucent colours in the legacy syntax, which browsers keep at 8-bit alpha like the design", () => {
    expect(renderCss(aTheme("#ffffff", "#000000"), [])).toContain("rgba(3, 15, 31, 0.06)");
  });
});
