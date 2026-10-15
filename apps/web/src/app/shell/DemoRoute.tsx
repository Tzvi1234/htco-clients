import type { ComponentType } from "react";

import type { AreaId } from "./nav.ts";
import { useNavLabels } from "./useNavLabels.ts";
import { OFFICE_SCREENS } from "../../features/office/screens.ts";
import { DemoScreen } from "../../shared/ui/DemoScreen.tsx";

/** The full demo frames built so far, by `area/tab`; each shows the demo's design inertly. */
const SCREENS: Readonly<Record<string, ComponentType>> = {
  ...OFFICE_SCREENS,
};

/** A tab of the Design 1C navigation with no live screen yet: its demo frame, or DemoScreen. */
export function DemoRoute({ area, tab }: { area: AreaId; tab: string }) {
  const labels = useNavLabels();
  const Screen = SCREENS[`${area}/${tab}`];
  if (Screen !== undefined) return <Screen />;
  return <DemoScreen title={labels.tab(area, tab)} />;
}
