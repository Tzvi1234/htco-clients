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
import { DemoRoute, loadDemoScreens } from "./shell/DemoRoute.tsx";
import { AREAS, navDirection, sameArea } from "./shell/nav.ts";
import { AcceptInvitePage } from "../features/auth/AcceptInvitePage.tsx";
import { ForgotPasswordPage } from "../features/auth/ForgotPasswordPage.tsx";
import { ResetPasswordPage } from "../features/auth/ResetPasswordPage.tsx";
import { SecondFactorPage } from "../features/auth/SecondFactorPage.tsx";
import { SignInPage } from "../features/auth/SignInPage.tsx";
import { OrdersPage } from "../features/commerce/OrdersPage.tsx";
import { OrderIncidents } from "../features/incidents/OrderIncidents.tsx";
import { AutomationsPage } from "../features/admin/AutomationsPage.tsx";
import { OperationsPage } from "../features/admin/OperationsPage.tsx";
import { ProductsPage } from "../features/commerce/ProductsPage.tsx";
import { ShippingPage } from "../features/commerce/ShippingPage.tsx";
import { CustomersPage } from "../features/customers/CustomersPage.tsx";
import { IncidentsPage } from "../features/incidents/IncidentsPage.tsx";
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
        // The area's demo screens are their own chunk, fetched when one of its tabs opens.
        loader: () => loadDemoScreens(area.id),
        component: function Demo() {
          return <DemoRoute area={area.id} tab={tab.id} />;
        },
      }),
    ),
);

/** `?shop=`: the shop a commerce screen opens on, as a shop's notification names it. */
function shopSearch(search: Record<string, unknown>): { shop?: string } {
  return typeof search["shop"] === "string" ? { shop: search["shop"] } : {};
}

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
        staticData: { layout: "panels", scroll: "page" },
        component: OverviewPage,
      }),
      createRoute({
        getParentRoute: () => appRoute,
        path: "/shops",
        staticData: { layout: "panels", scroll: "page" },
        component: ShopsPage,
      }),
      // The shop's live data from Etsy (platform: dashboard data, slice 4.6).
      createRoute({
        getParentRoute: () => appRoute,
        path: "/commerce/orders",
        staticData: { layout: "panels", scroll: "page" },
        // The order sheet links to the order's incidents (slice 6.3).
        component: () => (
          <OrdersPage
            orderIncidents={(order, shop) => (
              <OrderIncidents
                organizationId={shop.organizationId}
                shopId={shop.id}
                receiptId={order.order_id}
              />
            )}
          />
        ),
      }),
      createRoute({
        getParentRoute: () => appRoute,
        path: "/commerce/products",
        validateSearch: shopSearch,
        staticData: { layout: "panels", scroll: "page" },
        component: ProductsPage,
      }),
      createRoute({
        getParentRoute: () => appRoute,
        path: "/commerce/shipping",
        validateSearch: shopSearch,
        staticData: { layout: "panels", scroll: "page" },
        component: ShippingPage,
      }),
      // The incident center (platform slice 6.5); a notification opens `/incidents/{id}` and
      // may name the workspace (`?workspace=`) for a user in several.
      createRoute({
        getParentRoute: () => appRoute,
        path: "/incidents/{-$incidentId}",
        validateSearch: (search: Record<string, unknown>): { workspace?: string } =>
          typeof search["workspace"] === "string" ? { workspace: search["workspace"] } : {},
        staticData: { layout: "panels", scroll: "page" },
        component: IncidentsPage,
      }),
      createRoute({
        getParentRoute: () => appRoute,
        path: "/customers/customers",
        validateSearch: shopSearch,
        staticData: { layout: "panels", scroll: "page" },
        component: CustomersPage,
      }),
      // Queue, execution and sync health (platform slice 5.9), for the Owner and Admins.
      createRoute({
        getParentRoute: () => appRoute,
        path: "/admin/health",
        staticData: { layout: "panels", scroll: "page" },
        component: OperationsPage,
      }),
      // The office's automations (platform slices 5.1, 5.9 and 5.11), on the health read.
      createRoute({
        getParentRoute: () => appRoute,
        path: "/admin/automations",
        staticData: { layout: "panels", scroll: "page" },
        component: AutomationsPage,
      }),
      createRoute({
        getParentRoute: () => appRoute,
        path: "/settings",
        staticData: { layout: "panels", scroll: "page" },
        component: SettingsPage,
      }),
      createRoute({
        getParentRoute: () => appRoute,
        path: "/settings/security",
        staticData: { layout: "panels", scroll: "page" },
        component: SecurityPage,
      }),
      createRoute({
        getParentRoute: () => appRoute,
        path: "/settings/team",
        staticData: { layout: "panels", scroll: "page" },
        component: TeamPage,
      }),
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

/**
 * The View Transition of a screen change (styles.css, "Screen to screen"): its type says which
 * way it travels in the navigation. Asked on every change, so turning on reduced motion while
 * the app is open stops it at once; a change of search or hash alone does not animate.
 */
export function screenTransition(info: {
  fromLocation?: { pathname: string };
  toLocation: { pathname: string };
  pathChanged: boolean;
}): string[] | false {
  if (!info.pathChanged || !viewTransitions()) return false;
  const [from, to] = [info.fromLocation?.pathname, info.toLocation.pathname];
  return [navDirection(from, to), ...(sameArea(from, to) ? ["same-area"] : [])];
}

export function createAppRouter(context: RouterContext, history?: RouterHistory) {
  return createRouter({
    routeTree,
    context,
    ...(history === undefined ? {} : { history }),
    defaultErrorComponent: RouteError,
    defaultPreload: "intent",
    // Screens change with a short, direction-aware transition (styles.css); never under
    // reduced motion.
    defaultViewTransition: { types: screenTransition },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
  interface StaticDataRouteOption {
    /** "panels": the screen lays out its own Design 1C panels; otherwise the shell gives it one. */
    layout?: "panels";
    /** "page": on wide screens the screen scrolls as one page, never inside a panel (round 3). */
    scroll?: "page";
  }
  interface HistoryState {
    /** Set by the Etsy callback for the Shops page's confirmation, in that workspace. */
    etsy?: { outcome: "connected" | "reconnected"; organizationId: string };
  }
}
