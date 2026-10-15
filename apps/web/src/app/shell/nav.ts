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
      ...soon("commerce", "orders", "products", "shipping", "suppliers"),
    ],
  },
  {
    id: "customers",
    group: "workspace",
    icon: ChatIcon,
    to: "/customers/tickets",
    tabs: soon("customers", "tickets", "customers", "mail", "marketing"),
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
      ...soon("admin", "health", "automations"),
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
