import type { ComponentType } from "react";

import type { AreaId } from "./nav.ts";
import { useNavLabels } from "./useNavLabels.ts";
import { AutomationsDemo, HealthDemo } from "../../features/admin/AdminDemos.tsx";
import {
  CustomersDemo,
  MailDemo,
  MarketingDemo,
  TicketsDemo,
} from "../../features/customers/CustomersDemos.tsx";
import { FinanceOverviewDemo, LedgerDemo } from "../../features/finance/FinanceDemos.tsx";
import { DemoScreen } from "../../shared/ui/DemoScreen.tsx";

/** The demo's full screens for tabs that are designed but not built yet, by `area/tab`. */
const DEMO_SCREENS: Partial<Record<string, ComponentType<{ title: string }>>> = {
  "customers/tickets": TicketsDemo,
  "customers/customers": CustomersDemo,
  "customers/mail": MailDemo,
  "customers/marketing": MarketingDemo,
  "finance/overview": FinanceOverviewDemo,
  "finance/ledger": LedgerDemo,
  "admin/health": HealthDemo,
  "admin/automations": AutomationsDemo,
};

/**
 * A tab of the Design 1C navigation with no screen yet: the demo's screen in the demo frame
 * when it has one here, else the DemoScreen frame with its title.
 */
export function DemoRoute({ area, tab }: { area: AreaId; tab: string }) {
  const labels = useNavLabels();
  const title = labels.tab(area, tab);
  const Screen = DEMO_SCREENS[`${area}/${tab}`];
  return Screen === undefined ? <DemoScreen title={title} /> : <Screen title={title} />;
}
