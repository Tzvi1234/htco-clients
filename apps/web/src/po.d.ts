// Lingui's Vite plugin compiles `.po` catalogs when they are imported.
declare module "*.po" {
  import type { Messages } from "@lingui/core";

  export const messages: Messages;
}
