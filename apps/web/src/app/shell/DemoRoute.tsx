import type { ComponentType } from "react";

import type { AreaId } from "./nav.ts";
import { useNavLabels } from "./useNavLabels.ts";
import { DemoScreen } from "../../shared/ui/DemoScreen.tsx";

/** A drawn demo screen: it renders its own `DemoFrame` (kit/demo.tsx) with the tab's title. */
export type DemoScreenComponent = ComponentType<{ title: string }>;

interface DemoModule {
  demoScreens?: Record<string, DemoScreenComponent>;
}

/**
 * The Design 1C demo screens drawn so far: each area's feature folder may export `demoScreens`
 * from a `demoScreens.tsx`, keyed "area/tab" ("work/tasks"). Found at build time, but each area's
 * module is its own chunk, downloaded only when one of its tabs opens (`loadDemoScreens`, the
 * route's loader), so sign-in and the real screens never carry the demos.
 */
const modules = import.meta.glob<DemoModule>("../../features/*/demoScreens.tsx");
const loaded = new Map<string, DemoModule>();

const pathOf = (area: AreaId) => `../../features/${area}/demoScreens.tsx`;

/** Loads an area's demo screens before its route renders; a no-op once loaded or when none. */
export async function loadDemoScreens(area: AreaId): Promise<void> {
  const path = pathOf(area);
  const load = modules[path];
  if (load === undefined || loaded.has(path)) return;
  loaded.set(path, await load());
}

/**
 * A tab of the Design 1C navigation with no real screen yet: the demo's full screen with its
 * sample data in the demo frame (dimmed, inert, the DEMO pill in the top bar) when it is drawn,
 * else the DemoScreen placeholder.
 */
export function DemoRoute({ area, tab }: { area: AreaId; tab: string }) {
  const labels = useNavLabels();
  const title = labels.tab(area, tab);
  const Screen = loaded.get(pathOf(area))?.demoScreens?.[`${area}/${tab}`];
  return Screen === undefined ? <DemoScreen title={title} /> : <Screen title={title} />;
}
