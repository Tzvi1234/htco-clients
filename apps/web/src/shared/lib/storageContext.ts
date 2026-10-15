import { createContext, use } from "react";

import type { SettingsStorage } from "./storage.ts";

/** This device's settings storage, for components deep in the tree (the sidebar's width). */
export const SettingsStorageContext = createContext<SettingsStorage | undefined>(undefined);

export function useSettingsStorage(): SettingsStorage | undefined {
  return use(SettingsStorageContext);
}
