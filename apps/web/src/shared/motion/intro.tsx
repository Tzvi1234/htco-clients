import { createContext, use, useState, type ReactNode } from "react";

import { readSetting, writeSetting, type SettingsStorage } from "../lib/storage.ts";

// Bump when the intro changes, so it plays once more for everyone.
const INTRO_VERSION = "relay-1";
const KEY = "htco.intro";

const IntroContext = createContext(false);

/**
 * Whether this visit plays the intro: once per device and intro version, never blocking (the
 * shell is usable at once), and not at all under reduced motion (the CSS removes the animation).
 */
export function IntroProvider({
  storage,
  children,
}: {
  storage: SettingsStorage | undefined;
  children: ReactNode;
}) {
  const [play] = useState(() => {
    const first = readSetting(storage, KEY) !== INTRO_VERSION;
    if (first) writeSetting(storage, KEY, INTRO_VERSION);
    return first;
  });
  return <IntroContext value={play}>{children}</IntroContext>;
}

export function useIntro(): boolean {
  return use(IntroContext);
}
