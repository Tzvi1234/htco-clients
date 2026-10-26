// The tools an automation's details panel offers (Admin › Automations), by automation ID: a
// self-contained component given the workspace and its shops, such as the Product Sales
// Counters' "Recount sales" (lyra's SalesCounters). The panel renders nothing for an
// automation that has none. The server decides who may use a tool; the tool says why not.
import type { ComponentType } from "react";

import type { components } from "@htco/api-client";

export type ToolShop = components["schemas"]["ShopView"];

export interface AutomationToolProps {
  organizationId: string;
  /** The workspace's shops, the ones the member sees. */
  shops: readonly ToolShop[];
}

export const AUTOMATION_TOOLS: Partial<Record<string, ComponentType<AutomationToolProps>>> = {};
