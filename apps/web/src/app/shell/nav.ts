// The app's navigation (Design 1C, client ADR-0008): seven areas, each with its tabs, in the
// demo's order. A tab is `built` when a real screen answers its address; every other tab has a
// route that renders a DemoScreen and shows a "Soon" tag in the navigation until its screen
// lands. To build a screen: set `built: true` here and give its route a component in
// router.tsx (docs/features/web-shell/design.md).
import {
  BagIcon,
  BoltIcon,
  ChatIcon,
  GridIcon,
  HomeIcon,
  PieIcon,
  PulseIcon,
  type IconComponent,
} from "../../shared/ui/icons.tsx";

export type AreaId = "home" | "office" | "work" | "commerce" | "customers" | "finance" | "admin";

export interface NavTab {
  id: string;
  /** The tab's address. */
  to: string;
  built: boolean;
  /** Other addresses that belong to this tab (pages under it, the Etsy callback). */
  also?: readonly string[];
}

export interface NavArea {
  id: AreaId;
  group: "main" | "workspace" | "system";
  icon: IconComponent;
  /** Where the area opens: its first tab, or its own page. */
  to: string;
  tabs: readonly NavTab[];
}

const soon = (area: AreaId, ...ids: string[]): NavTab[] =>
  ids.map((id) => ({ id, to: `/${area}/${id}`, built: false }));

export const AREAS: readonly NavArea[] = [
  { id: "home", group: "main", icon: HomeIcon, to: "/", tabs: [] },
  {
    id: "office",
    group: "workspace",
    icon: GridIcon,
    to: "/office/floor",
    tabs: soon("office", "floor", "chat", "team", "aiops", "eng"),
  },
  {
    id: "work",
    group: "workspace",
    icon: BoltIcon,
    to: "/work/tasks",
    tabs: soon("work", "tasks", "approvals", "activity"),
  },
  {
    id: "commerce",
    group: "workspace",
    icon: BagIcon,
    to: "/shops",
    tabs: [
      { id: "shops", to: "/shops", built: true, also: ["/integrations/etsy/callback"] },
      { id: "orders", to: "/commerce/orders", built: true },
      { id: "products", to: "/commerce/products", built: true },
      { id: "shipping", to: "/commerce/shipping", built: true },
      // Fulfillment's incident center (platform slice 6.5); `/incidents/{id}` opens one.
      { id: "incidents", to: "/incidents", built: true },
      ...soon("commerce", "suppliers"),
    ],
  },
  {
    id: "customers",
    group: "workspace",
    icon: ChatIcon,
    to: "/customers/tickets",
    tabs: [
      ...soon("customers", "tickets"),
      { id: "customers", to: "/customers/customers", built: true },
      ...soon("customers", "mail", "marketing"),
    ],
  },
  {
    id: "finance",
    group: "workspace",
    icon: PieIcon,
    to: "/finance/overview",
    tabs: soon("finance", "overview", "ledger"),
  },
  {
    id: "admin",
    group: "system",
    icon: PulseIcon,
    to: "/admin/health",
    tabs: [
      { id: "health", to: "/admin/health", built: true },
      { id: "automations", to: "/admin/automations", built: true },
      { id: "members", to: "/settings/team", built: true },
      { id: "settings", to: "/settings", built: true },
    ],
  },
];

export function areaOf(id: AreaId): NavArea {
  const area = AREAS.find((candidate) => candidate.id === id);
  if (area === undefined) throw new Error(`No area ${id}`);
  return area;
}

const under = (path: string, base: string): boolean => path === base || path.startsWith(`${base}/`);

/** The area and tab an address belongs to; the longest matching address wins. */
export function locate(pathname: string): { area: NavArea; tab?: NavTab } | undefined {
  if (pathname === "/") return { area: areaOf("home") };
  let best: { area: NavArea; tab: NavTab; length: number } | undefined;
  for (const area of AREAS) {
    for (const tab of area.tabs) {
      for (const base of [tab.to, ...(tab.also ?? [])]) {
        if (under(pathname, base) && (best === undefined || base.length > best.length)) {
          best = { area, tab, length: base.length };
        }
      }
    }
  }
  return best === undefined ? undefined : { area: best.area, tab: best.tab };
}

/** Every place in the navigation, in its order: each area, then its tabs. */
const NAV_ORDER: string[] = AREAS.flatMap((area) => [
  `area:${area.id}`,
  ...area.tabs.map((tab) => `${area.id}/${tab.id}`),
]);

function placeOf(pathname: string): number {
  const located = locate(pathname);
  if (located === undefined) return -1;
  return NAV_ORDER.indexOf(
    located.tab === undefined ? `area:${located.area.id}` : `${located.area.id}/${located.tab.id}`,
  );
}

/**
 * Which way a screen change travels: "forward" to a place later in the navigation, "back" to an
 * earlier one, "fade" when either is outside it or both are the same place.
 */
export function navDirection(from: string | undefined, to: string): "forward" | "back" | "fade" {
  if (from === undefined) return "fade";
  const [a, b] = [placeOf(from), placeOf(to)];
  if (a < 0 || b < 0 || a === b) return "fade";
  return b > a ? "forward" : "back";
}

/** Whether two addresses are tabs of the same area (the current pill glides between them). */
export function sameArea(from: string | undefined, to: string): boolean {
  if (from === undefined) return false;
  const [a, b] = [locate(from), locate(to)];
  return a?.tab !== undefined && b?.tab !== undefined && a.area.id === b.area.id;
}
