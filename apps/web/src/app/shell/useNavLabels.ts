import { useLingui } from "@lingui/react/macro";

import type { AreaId, NavArea } from "./nav.ts";

/** The names of the areas and their tabs in the active language (the demo's wording). */
export function useNavLabels() {
  const { t } = useLingui();
  const areas: Record<AreaId, string> = {
    home: t({ message: "Home", context: "navigation" }),
    office: t({ message: "Office", context: "navigation" }),
    work: t({ message: "Work", context: "navigation" }),
    commerce: t({ message: "Commerce", context: "navigation" }),
    customers: t({ message: "Customers", context: "navigation" }),
    finance: t({ message: "Finance", context: "navigation" }),
    admin: t({ message: "Admin", context: "navigation" }),
  };
  const tabs: Record<AreaId, Record<string, string>> = {
    home: {},
    office: {
      floor: t({ message: "Floor", context: "navigation" }),
      chat: t({ message: "Chat", context: "navigation" }),
      team: t({ message: "Team room", context: "navigation" }),
      aiops: t({ message: "AI ops", context: "navigation" }),
      eng: t({ message: "Engineering", context: "navigation" }),
    },
    work: {
      tasks: t({ message: "Tasks", context: "navigation" }),
      approvals: t({ message: "Approvals", context: "navigation" }),
      activity: t({ message: "Activity", context: "navigation" }),
    },
    commerce: {
      shops: t({ message: "Shops", context: "navigation" }),
      orders: t({ message: "Orders", context: "navigation" }),
      products: t({ message: "Products", context: "navigation" }),
      shipping: t({ message: "Shipping", context: "navigation" }),
      incidents: t({ message: "Incidents", context: "navigation" }),
      suppliers: t({ message: "Suppliers", context: "navigation" }),
    },
    customers: {
      tickets: t({ message: "Tickets", context: "navigation" }),
      customers: t({ message: "Customers", context: "navigation" }),
      mail: t({ message: "Mail", context: "navigation" }),
      marketing: t({ message: "Marketing", context: "navigation" }),
    },
    finance: {
      overview: t({ message: "Overview", context: "navigation" }),
      ledger: t({ message: "Ledger", context: "navigation" }),
    },
    admin: {
      health: t({ message: "Health", context: "navigation" }),
      automations: t({ message: "Automations", context: "navigation" }),
      members: t({ message: "Members & access", context: "navigation" }),
      settings: t({ message: "Settings", context: "navigation" }),
    },
  };
  return {
    area: (area: NavArea | AreaId): string => areas[typeof area === "string" ? area : area.id],
    tab: (area: AreaId, tab: string): string => tabs[area][tab] ?? tab,
    group: (group: NavArea["group"]): string =>
      group === "workspace"
        ? t({ message: "Workspace", context: "navigation" })
        : group === "system"
          ? t({ message: "System", context: "navigation" })
          : "",
  };
}
