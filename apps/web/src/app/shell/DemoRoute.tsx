import type { ComponentType } from "react";

import type { AreaId } from "./nav.ts";
import { useNavLabels } from "./useNavLabels.ts";
import { DemoScreen } from "../../shared/ui/DemoScreen.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { DemoFrame } from "../../shared/ui/kit/Demo.tsx";

/**
 * The Design 1C demo screens drawn so far: each feature folder may export `demoScreens` from a
 * `demoScreens.tsx`, keyed "area/tab" ("work/tasks"). Collected at build time, so a feature adds
 * its screens without touching this file.
 */
const modules = import.meta.glob<{ demoScreens?: Record<string, ComponentType> }>(
  "../../features/*/demoScreens.tsx",
  { eager: true },
);
const SCREENS: Record<string, ComponentType> = Object.assign(
  {},
  ...Object.values(modules).map((module) => module.demoScreens ?? {}),
);

/**
 * A tab of the Design 1C navigation with no real screen yet: the demo's full screen with its
 * sample data inside the demo frame when it is drawn, else the DemoScreen placeholder.
 */
export function DemoRoute({ area, tab }: { area: AreaId; tab: string }) {
  const labels = useNavLabels();
  const title = labels.tab(area, tab);
  const Screen = SCREENS[`${area}/${tab}`];
  if (Screen === undefined) return <DemoScreen title={title} />;
  return (
    <>
      <PageHeader title={title} />
      <DemoFrame>
        <Screen />
      </DemoFrame>
    </>
  );
}
