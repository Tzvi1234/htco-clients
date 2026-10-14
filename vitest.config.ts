import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["scripts/**/*.test.ts", "packages/*/test/**/*.test.ts"],
    // A test that passes on its own but fails in the suite is a bug; never let order hide it.
    sequence: { shuffle: true },
    restoreMocks: true,
  },
});
