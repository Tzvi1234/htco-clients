import type { ComponentType } from "react";

import { AiOpsPage } from "./AiOpsPage.tsx";
import { ChatPage } from "./ChatPage.tsx";
import { EngineeringPage } from "./EngineeringPage.tsx";
import { FloorPage } from "./FloorPage.tsx";
import { TeamRoomPage } from "./TeamRoomPage.tsx";

/** The Office area's demo frames, by tab (app/shell/DemoRoute.tsx). */
export const OFFICE_SCREENS: Readonly<Record<string, ComponentType>> = {
  "office/floor": FloorPage,
  "office/chat": ChatPage,
  "office/team": TeamRoomPage,
  "office/aiops": AiOpsPage,
  "office/eng": EngineeringPage,
};
