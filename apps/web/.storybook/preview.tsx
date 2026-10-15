import "@fontsource-variable/heebo";
import "@fontsource-variable/outfit";
import "@fontsource-variable/jetbrains-mono";
import "../src/styles.css";

import type { Decorator, Preview } from "@storybook/react-vite";

import { LocaleProvider } from "../src/shared/i18n/LocaleProvider.tsx";
import { LOCALES, type Locale } from "../src/shared/i18n/locale.ts";
import { applyTheme } from "../src/shared/theme/theme.ts";

type Theme = "light" | "dark";

function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

/**
 * Every story in Hebrew or English (the app's LocaleProvider sets `lang` and `dir` on the root)
 * and in the light or dark theme (`data-theme`, as the app's theme switch does), on the work
 * panel where components live.
 */
const inAppContext: Decorator = (Story, context) => {
  const locale = isLocale(context.globals["locale"]) ? context.globals["locale"] : "en";
  const theme: Theme = context.globals["theme"] === "dark" ? "dark" : "light";
  applyTheme(theme, document.documentElement);
  // The palette (client ADR-0008) for review; screenshots use the default, SBB.
  const palette: unknown = context.globals["palette"];
  document.documentElement.dataset["pal"] =
    palette === "d4" || palette === "plain" ? palette : "sbb";
  return (
    // A new provider per language, so it applies `lang` and `dir` as the app does on start.
    <LocaleProvider key={locale} initialLocale={locale} storage={undefined}>
      <div data-story-frame="" className="bg-canvas p-6 text-primary">
        <Story />
      </div>
    </LocaleProvider>
  );
};

const preview: Preview = {
  decorators: [inAppContext],
  globalTypes: {
    locale: {
      description: "Language and direction",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [
          { value: "en", title: "English (LTR)" },
          { value: "he", title: "עברית (RTL)" },
        ],
        dynamicTitle: true,
      },
    },
    palette: {
      description: "Design 1C palette",
      toolbar: {
        title: "Palette",
        icon: "paintbrush",
        items: [
          { value: "sbb", title: "SBB (gray and orange)" },
          { value: "d4", title: "Design 4 (cream and lilac)" },
          { value: "plain", title: "Plain ground" },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: "en", theme: "light", palette: "sbb" },
  parameters: {
    layout: "fullscreen",
    // AC-3.4.1: an axe violation fails the story's test (Vitest addon) instead of only warning.
    a11y: { test: "error" },
    controls: { expanded: true },
  },
  tags: ["autodocs"],
};

export default preview;
