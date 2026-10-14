import {
  createRootRoute,
  createRoute,
  createRouter,
  type RouterHistory,
} from "@tanstack/react-router";

import { NotFound, RouteError } from "./RouteStates.tsx";
import { AppShell } from "./shell/AppShell.tsx";
import { OverviewPage } from "../features/overview/OverviewPage.tsx";
import { SettingsPage } from "../features/settings/SettingsPage.tsx";
import { ShopsPage } from "../features/shops/ShopsPage.tsx";

const rootRoute = createRootRoute({ component: AppShell, notFoundComponent: NotFound });

const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: "/", component: OverviewPage }),
  createRoute({ getParentRoute: () => rootRoute, path: "/shops", component: ShopsPage }),
  createRoute({ getParentRoute: () => rootRoute, path: "/settings", component: SettingsPage }),
]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    ...(history === undefined ? {} : { history }),
    defaultErrorComponent: RouteError,
    defaultPreload: "intent",
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
