import type { AreaId } from "./nav.ts";
import { useNavLabels } from "./useNavLabels.ts";
import { DemoScreen } from "../../shared/ui/DemoScreen.tsx";

/** A tab of the Design 1C navigation with no screen yet: the DemoScreen frame with its title. */
export function DemoRoute({ area, tab }: { area: AreaId; tab: string }) {
  const labels = useNavLabels();
  return <DemoScreen title={labels.tab(area, tab)} />;
}
