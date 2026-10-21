// The approvals of the Work and Commerce demo screens (demo_noimg.html: APPROVALS), asked by the
// AI employees of the office roster (shared/demo/office.ts), until approvals are built.
import { useAgents, type AgentId, type Risk } from "../../shared/demo/office.ts";
import { bi, type Bi } from "../../shared/ui/kit/index.ts";

export type { AgentId, AgentView, Risk } from "../../shared/demo/office.ts";

/** An employee's name, role and department in the user's language. */
export function useAgent() {
  return useAgents().byId;
}

export interface Approval {
  id: string;
  by: AgentId;
  what: Bi;
  risk: Risk;
  policy: string;
  /** How long it has waited. */
  minutes: number;
  value: string;
}

export const APPROVALS: readonly Approval[] = [
  {
    id: "AP-118",
    by: "noa",
    what: bi(
      "החזר חלקי 15% ($7.20) על הזמנה #3152 של \u2068Emma R.\u2069",
      "Partial refund 15% ($7.20) on order #3152 for Emma R.",
    ),
    risk: "low",
    policy: "refunds.partial ≤ $20",
    minutes: 12,
    value: "$7.20",
  },
  {
    id: "AP-119",
    by: "tom",
    what: bi(
      "מעבר לספק Gelato למגבות מפשתן (−$2.10 ליחידה)",
      "Switch linen towels to Gelato (−$2.10 per unit)",
    ),
    risk: "med",
    policy: "suppliers.change",
    minutes: 38,
    value: "−$2.10",
  },
  {
    id: "AP-120",
    by: "nika",
    what: bi(
      "פרסום 4 תמונות חדשות לליסטינג מפת כוכבים",
      "Publish 4 new images to the star map listing",
    ),
    risk: "high",
    policy: "listings.publish",
    minutes: 42,
    value: "4 img",
  },
];
