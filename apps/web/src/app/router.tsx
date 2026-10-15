import type { ApiClient } from "@htco/api-client";
import type { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  type RouterHistory,
} from "@tanstack/react-router";

import { NotFound, RouteError } from "./RouteStates.tsx";
import { AppShell } from "./shell/AppShell.tsx";
import { AcceptInvitePage } from "../features/auth/AcceptInvitePage.tsx";
import { SecondFactorPage } from "../features/auth/SecondFactorPage.tsx";
import { SignInPage } from "../features/auth/SignInPage.tsx";
import { OverviewPage } from "../features/overview/OverviewPage.tsx";
import { SecurityPage } from "../features/security/SecurityPage.tsx";
import { SettingsPage } from "../features/settings/SettingsPage.tsx";
import { ShopsPage } from "../features/shops/ShopsPage.tsx";
import { TeamPage } from "../features/team/TeamPage.tsx";
import { WelcomePage } from "../features/welcome/WelcomePage.tsx";
import { meQuery, needsSecondFactor, sessionQuery } from "../shared/api/api.tsx";

export interface RouterContext {
  queryClient: QueryClient;
  api: ApiClient;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: NotFound,
});

/** The public front door: what HTCO is, the web app, and the apps that follow. */
const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/welcome",
  component: WelcomePage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in",
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  component: SignInPage,
});

/** Where an invitation link lands: the new member sets a password and is signed in. */
const acceptInviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accept-invite",
  component: AcceptInvitePage,
});

/**
 * Everything below needs a signed-in session; a visitor goes to sign-in and comes back. The
 * guards read the cached session (`staleTime: "static"`); sign-in, MFA and any 401 drop it.
 */
const signedInRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "signed-in",
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.query({
      ...sessionQuery(context.api),
      staleTime: "static",
    });
    if (session === null) {
      // The bare address opens the front door; any other page goes to sign-in and comes back.
      // TanStack Router's redirect is thrown by design.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (location.pathname === "/") throw redirect({ to: "/welcome" });
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    }
    return { session };
  },
});

const secondFactorRoute = createRoute({
  getParentRoute: () => signedInRoute,
  path: "/security/setup",
  component: SecondFactorPage,
});

/** The dashboard: Owners and Admins only after their second factor (AC-3.5.3). */
const appRoute = createRoute({
  getParentRoute: () => signedInRoute,
  id: "app",
  component: AppShell,
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.query({ ...meQuery(context.api), staleTime: "static" });
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's redirect
    if (needsSecondFactor(me, context.session)) throw redirect({ to: "/security/setup" });
  },
});

const routeTree = rootRoute.addChildren([
  welcomeRoute,
  signInRoute,
  acceptInviteRoute,
  signedInRoute.addChildren([
    secondFactorRoute,
    appRoute.addChildren([
      createRoute({ getParentRoute: () => appRoute, path: "/", component: OverviewPage }),
      createRoute({ getParentRoute: () => appRoute, path: "/shops", component: ShopsPage }),
      createRoute({ getParentRoute: () => appRoute, path: "/settings", component: SettingsPage }),
      createRoute({
        getParentRoute: () => appRoute,
        path: "/settings/security",
        component: SecurityPage,
      }),
      createRoute({ getParentRoute: () => appRoute, path: "/settings/team", component: TeamPage }),
    ]),
  ]),
]);

export function createAppRouter(context: RouterContext, history?: RouterHistory) {
  return createRouter({
    routeTree,
    context,
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
