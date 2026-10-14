// A WinUI 3 ResourceDictionary: colour brushes in Light and Dark theme dictionaries, and the
// theme-independent sizes as doubles and corner radii. The HighContrast dictionary, which maps
// roles to Windows system colours, is designed with the Windows app (Phase 18).
import { argb, GENERATED_HEADER, isPublished, pascal, publishedPath } from "./publish.ts";
import type { Token } from "./tokens.ts";

const brushes = (tokens: Token[]): string[] =>
  tokens.flatMap((token) =>
    token.type === "color" && isPublished(token)
      ? [
          `            <SolidColorBrush x:Key="Htco${pascal(publishedPath(token))}Brush" Color="${argb(token.value)}" />`,
        ]
      : [],
  );

function resource(token: Token): string | undefined {
  if (token.type !== "dimension" || token.value.unit !== "px" || !isPublished(token)) {
    return undefined;
  }
  const [group, kind] = token.path;
  const key = `Htco${pascal(token.path)}`;
  const value = String(token.value.value);
  if (group === "radius") return `    <CornerRadius x:Key="${key}">${value}</CornerRadius>`;
  if (group === "font" && kind !== "size" && kind !== "line-height") return undefined;
  return `    <x:Double x:Key="${key}">${value}</x:Double>`;
}

export function renderXaml(light: Token[], dark: Token[]): string {
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<!-- ${GENERATED_HEADER} -->`,
    "<ResourceDictionary",
    '    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"',
    '    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">',
    "    <ResourceDictionary.ThemeDictionaries>",
    '        <ResourceDictionary x:Key="Light">',
    ...brushes(light),
    "        </ResourceDictionary>",
    '        <ResourceDictionary x:Key="Dark">',
    ...brushes(dark),
    "        </ResourceDictionary>",
    "    </ResourceDictionary.ThemeDictionaries>",
    ...light.flatMap((token) => resource(token) ?? []),
    "</ResourceDictionary>",
    "",
  ].join("\n");
}
