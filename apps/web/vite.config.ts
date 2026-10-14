import { fileURLToPath } from "node:url";

import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Explicit, so the config is found when Vitest runs from the repository root.
const LINGUI_CONFIG = fileURLToPath(new URL("lingui.config.ts", import.meta.url));

export default defineConfig({
  // Lingui macros are compiled natively; no Babel.
  plugins: [react(), lingui({ macroTransform: true, configPath: LINGUI_CONFIG }), tailwindcss()],
  build: {
    // The CSP allows no inline scripts or styles, so nothing is inlined into the HTML.
    assetsInlineLimit: 0,
    sourcemap: false,
  },
  server: { port: 5173, strictPort: true },
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
