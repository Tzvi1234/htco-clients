import { fileURLToPath } from "node:url";

import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vitest/config";

import { withSecurityPolicies } from "./src/shared/security/csp.ts";
import { TWEAKS_BOOT_SCRIPT } from "./src/shared/theme/boot.ts";

// Explicit, so the config is found when Vitest runs from the repository root.
const LINGUI_CONFIG = fileURLToPath(new URL("lingui.config.ts", import.meta.url));

/**
 * The tweaks (palette, theme, contrast, glass, borders) apply before the first paint: a small
 * inline script reads them from localStorage (src/shared/theme/boot.ts, client ADR-0008).
 */
function tweaksBootScript(): Plugin {
  return {
    name: "htco-tweaks-boot",
    transformIndexHtml: {
      order: "pre",
      handler: () => [{ tag: "script", children: TWEAKS_BOOT_SCRIPT, injectTo: "head" }],
    },
  };
}

/**
 * The built page carries the CSP, allowing its one inline script by hash; the dev server does
 * not, because Vite injects inline scripts of its own.
 */
function contentSecurityPolicy(): Plugin {
  return {
    name: "htco-content-security-policy",
    apply: "build",
    transformIndexHtml: { order: "post", handler: (html) => withSecurityPolicies(html) },
  };
}

export default defineConfig({
  // Lingui macros are compiled natively; no Babel.
  plugins: [
    react(),
    lingui({ macroTransform: true, configPath: LINGUI_CONFIG }),
    tailwindcss(),
    tweaksBootScript(),
    contentSecurityPolicy(),
  ],
  build: {
    // The CSP allows no inline scripts or styles, so nothing is inlined into the HTML.
    assetsInlineLimit: 0,
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: true,
    // The web app calls the API on its own origin under /api (as in production, where the
    // ingress routes /api to the API), so the session cookie stays first-party.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    name: "web",
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["src/test/setup.ts"],
    sequence: { shuffle: true },
    restoreMocks: true,
    css: false,
  },
});
