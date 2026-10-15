import type { ComponentType } from "react";

import type { AreaId } from "./nav.ts";
import { useNavLabels } from "./useNavLabels.ts";
import { DemoScreen } from "../../shared/ui/DemoScreen.tsx";

/** A drawn demo screen: it renders its own `DemoFrame` (kit/demo.tsx) with the tab's title. */
export type DemoScreenComponent = ComponentType<{ title: string }>;

/**
 * The Design 1C demo screens drawn so far: each feature folder may export `demoScreens` from a
 * `demoScreens.tsx`, keyed "area/tab" ("work/tasks"). Collected at build time, so a feature adds
 * its screens without touching this file.
 */
const modules = import.meta.glob<{ demoScreens?: Record<string, DemoScreenComponent> }>(
  "../../features/*/demoScreens.tsx",
  { eager: true },
);
const SCREENS: Record<string, DemoScreenComponent> = {};
for (const module of Object.values(modules)) Object.assign(SCREENS, module.demoScreens ?? {});

/**
 * A tab of the Design 1C navigation with no real screen yet: the demo's full screen with its
 * sample data in the demo frame (dimmed, inert, the DEMO pill in the top bar) when it is drawn,
 * else the DemoScreen placeholder.
 */
export function DemoRoute({ area, tab }: { area: AreaId; tab: string }) {
  const labels = useNavLabels();
  const title = labels.tab(area, tab);
  const Screen = SCREENS[`${area}/${tab}`];
  return Screen === undefined ? <DemoScreen title={title} /> : <Screen title={title} />;
}
