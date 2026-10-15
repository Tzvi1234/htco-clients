import type { ComponentType } from "react";

import type { AreaId } from "./nav.ts";
import { useNavLabels } from "./useNavLabels.ts";
import { DemoScreen } from "../../shared/ui/DemoScreen.tsx";

/**
 * The Design 1C demo screens drawn so far: each feature folder may export `demoScreens` from a
 * `demoScreens.tsx`, keyed "area/tab" ("work/tasks"). Collected at build time, so a feature adds
 * its screens without touching this file.
 */
const modules = import.meta.glob<{ demoScreens?: Record<string, ComponentType> }>(
  "../../features/*/demoScreens.tsx",
  { eager: true },
);
const SCREENS: Record<string, ComponentType> = {};
for (const module of Object.values(modules)) Object.assign(SCREENS, module.demoScreens ?? {});

/**
 * A tab of the Design 1C navigation with no real screen yet: the demo's full screen with its
 * sample data inside DemoScreen (dimmed, inert, under the DEMO label) when it is drawn, else the
 * DemoScreen placeholder.
 */
export function DemoRoute({ area, tab }: { area: AreaId; tab: string }) {
  const labels = useNavLabels();
  const title = labels.tab(area, tab);
  const Screen = SCREENS[`${area}/${tab}`];
  if (Screen === undefined) return <DemoScreen title={title} />;
  return (
    <DemoScreen title={title} className="flex flex-col">
      <Screen />
    </DemoScreen>
  );
}
