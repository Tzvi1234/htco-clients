import { AiOpsPage } from "./AiOpsPage.tsx";
import { ChatPage } from "./ChatPage.tsx";
import { EngineeringPage } from "./EngineeringPage.tsx";
import { FloorPage } from "./FloorPage.tsx";
import { TeamRoomPage } from "./TeamRoomPage.tsx";

/**
 * The Office area's demo screens by `area/tab` (app/shell/DemoRoute.tsx). Chat and the team
 * room are titled by what they show (the agent, the thread), so they set their own titles.
 */
export const demoScreens = {
  "office/floor": FloorPage,
  "office/chat": ChatPage,
  "office/team": TeamRoomPage,
  "office/aiops": AiOpsPage,
  "office/eng": EngineeringPage,
};
