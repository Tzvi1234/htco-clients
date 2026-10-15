import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

/** The built app page carries the CSP (vite.config.ts); Storybook's own pages need inline scripts. */
function withoutContentSecurityPolicy(plugins: PluginOption[] | undefined): PluginOption[] {
  return (plugins ?? []).filter(
    (plugin) =>
      !(
        typeof plugin === "object" &&
        plugin !== null &&
        "name" in plugin &&
        plugin.name === "htco-content-security-policy"
      ),
  );
}

// Component previews for the design system (slice 3.4). The stories reuse the app's Vite config
// (React, Lingui macros, Tailwind with the token CSS), so they render exactly as the app does.
const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"],
  core: { disableTelemetry: true },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: withoutContentSecurityPolicy(viteConfig.plugins),
  }),
};

export default config;
