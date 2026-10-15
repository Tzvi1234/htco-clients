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
import { DemoRoute } from "./shell/DemoRoute.tsx";
import { AREAS } from "./shell/nav.ts";
import { AcceptInvitePage } from "../features/auth/AcceptInvitePage.tsx";
import { ForgotPasswordPage } from "../features/auth/ForgotPasswordPage.tsx";
import { ResetPasswordPage } from "../features/auth/ResetPasswordPage.tsx";
import { SecondFactorPage } from "../features/auth/SecondFactorPage.tsx";
import { SignInPage } from "../features/auth/SignInPage.tsx";
import { OverviewPage } from "../features/overview/OverviewPage.tsx";
import { SecurityPage } from "../features/security/SecurityPage.tsx";
import { SettingsPage } from "../features/settings/SettingsPage.tsx";
import {
  EtsyCallbackPage,
  etsyReturn,
  type EtsyReturn,
} from "../features/shops/EtsyCallbackPage.tsx";
import { ShopsPage } from "../features/shops/ShopsPage.tsx";
import { TeamPage } from "../features/team/TeamPage.tsx";
import { WelcomePage } from "../features/welcome/WelcomePage.tsx";
import { meQuery, needsSecondFactor, sessionQuery } from "../shared/api/api.tsx";
import { REDUCED_MOTION_QUERY } from "../shared/lib/useMediaQuery.ts";

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

/** Asks for a password reset email (AC-3.5.6). */
const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});

/** Where the emailed reset link lands: the user chooses a new password and is signed in. */
const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: ResetPasswordPage,
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

/**
 * Every tab of the Design 1C navigation that has no screen yet: a route that renders the
 * DemoScreen frame with the tab's title (app/shell/nav.ts). A screen replaces its route here.
 */
const demoRoutes = AREAS.flatMap((area) =>
  area.tabs
    .filter((tab) => !tab.built)
    .map((tab) =>
      createRoute({
        getParentRoute: () => appRoute,
        path: tab.to,
        staticData: { layout: "panels" },
        component: function Demo() {
          return <DemoRoute area={area.id} tab={tab.id} />;
        },
      }),
    ),
);

/** An area's own address opens its first tab; the demo's addresses lead to existing screens. */
const redirects = [
  ...AREAS.filter((area) => area.tabs.length > 0).map((area) => [`/${area.id}`, area.to] as const),
  ["/commerce/shops", "/shops"],
  ["/admin/members", "/settings/team"],
  ["/admin/settings", "/settings"],
].map(([from, to]) =>
  createRoute({
    getParentRoute: () => appRoute,
    path: from,
    beforeLoad: () => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's redirect
      throw redirect({ to, replace: true });
    },
  }),
);

const routeTree = rootRoute.addChildren([
  welcomeRoute,
  signInRoute,
  acceptInviteRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  signedInRoute.addChildren([
    secondFactorRoute,
    appRoute.addChildren([
      createRoute({
        getParentRoute: () => appRoute,
        path: "/",
        staticData: { layout: "panels" },
        component: OverviewPage,
      }),
      createRoute({ getParentRoute: () => appRoute, path: "/shops", component: ShopsPage }),
      createRoute({ getParentRoute: () => appRoute, path: "/settings", component: SettingsPage }),
      createRoute({
        getParentRoute: () => appRoute,
        path: "/settings/security",
        component: SecurityPage,
      }),
      createRoute({ getParentRoute: () => appRoute, path: "/settings/team", component: TeamPage }),
      // Etsy sends the owner back here; it needs the session cookie, so it is signed in.
      createRoute({
        getParentRoute: () => appRoute,
        path: "/integrations/etsy/callback",
        validateSearch: (search: Record<string, unknown>): EtsyReturn => etsyReturn(search),
        component: EtsyCallbackPage,
      }),
      ...demoRoutes,
      ...redirects,
    ]),
  ]),
]);

/** Whether route changes animate: not when the user asks for reduced motion. */
export function viewTransitions(): boolean {
  if (typeof window.matchMedia !== "function") return true;
  return !window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function createAppRouter(context: RouterContext, history?: RouterHistory) {
  return createRouter({
    routeTree,
    context,
    ...(history === undefined ? {} : { history }),
    defaultErrorComponent: RouteError,
    defaultPreload: "intent",
    // Screens change with a short cross-fade (styles.css); never under reduced motion.
    defaultViewTransition: viewTransitions(),
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
  interface StaticDataRouteOption {
    /** "panels": the screen lays out its own Design 1C panels; otherwise the shell gives it one. */
    layout?: "panels";
  }
  interface HistoryState {
    /** Set by the Etsy callback for the Shops page's confirmation, in that workspace. */
    etsy?: { outcome: "connected" | "reconnected"; organizationId: string };
  }
}
