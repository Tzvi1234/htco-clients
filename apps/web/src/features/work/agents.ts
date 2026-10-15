// The Design 1C demo's AI employees and departments (demo_noimg.html: AG, DEPTS), the sample
// people of the Work and Commerce demo screens until the living office is built.
import type { Person, WorkStatus } from "../../shared/ui/kit/Bits.tsx";
import { bi, useBi, type Bi } from "../../shared/ui/kit/bi.ts";

export type DeptId = "exec" | "studio" | "proc" | "oa" | "mkt" | "cs" | "eng";

export const DEPTS: Record<DeptId, Bi> = {
  exec: bi("משרד המנכ״לית", "Executive Office"),
  studio: bi("סטודיו מוצרים", "Product Studio"),
  proc: bi("רכש וכספים", "Procurement & Finance"),
  oa: bi("הבטחת הזמנות", "Order Assurance"),
  mkt: bi("שיווק", "Marketing"),
  cs: bi("תמיכת לקוחות", "Customer Support"),
  eng: bi("הנדסה", "Engineering"),
};

interface Agent {
  name: Bi;
  role: Bi;
  dept: DeptId;
  status: WorkStatus;
}

const A = (he: string, en: string, rhe: string, ren: string, dept: DeptId, status: WorkStatus) => ({
  name: bi(he, en),
  role: bi(rhe, ren),
  dept,
  status,
});

export const AGENTS = {
  maya: A("מאיה", "Maya", "מנהלת כללית", "General Manager", "exec", "running"),
  noa: A("נועה", "Noa", "מפקחת איכות ותפעול", "Quality & Operations Supervisor", "exec", "waityou"),
  omer: A("עומר", "Omer", "קצין שיפור מתמיד", "Continuous Optimization Officer", "exec", "idle"),
  lia: A("ליה", "Lia", "עוזרת אישית לבעלים", "Owner Assistant", "exec", "queued"),
  shon: A("שון", "Shon", "מודיעין מוצר", "Product Intelligence", "studio", "waitext"),
  noam: A("נועם", "Noam", "SEO וקופירייטינג", "SEO & Copywriting", "studio", "idle"),
  nika: A(
    "ניקה",
    "Nika",
    "מומחית קריאייטיב ו־GPT Image",
    "Creative & GPT Image Specialist",
    "studio",
    "running",
  ),
  daniel: A(
    "דניאל",
    "Daniel",
    "ארכיטקט קטלוג ותמחור",
    "Catalog & Pricing Architect",
    "studio",
    "idle",
  ),
  tom: A("תום", "Tom", "רכש והצעות ספקים", "Procurement & Supplier Quotes", "proc", "waitext"),
  roni: A("רוני", "Roni", "בקר כספים", "Finance Controller", "proc", "idle"),
  eitan: A("איתן", "Eitan", "מפקח הגשמה", "Fulfillment Inspector", "oa", "blocked"),
  gal: A("גל", "Gal", "שיווק וצמיחה", "Marketing & Growth", "mkt", "offline"),
  dana: A("דנה", "Dana", "שירות לקוחות", "Customer Service", "cs", "idle"),
  alex: A(
    "אלכס",
    "Alex",
    "מהנדס תוכנה ופלטפורמה ראשי",
    "Lead Software & Platform Engineer",
    "eng",
    "running",
  ),
  amir: A(
    "אמיר",
    "Amir",
    "מהנדס דיבאג ואמינות",
    "Debugger & Reliability Engineer",
    "eng",
    "failed",
  ),
  iris: A(
    "איריס",
    "Iris",
    "מהנדסת מערכות סוכנים וחוויה",
    "Agent Systems & Experience Engineer",
    "eng",
    "idle",
  ),
} satisfies Record<string, Agent>;

export type AgentId = keyof typeof AGENTS;

export interface AgentView extends Person {
  role: string;
  dept: string;
  status: WorkStatus;
}

/** An agent's name, role and department in the user's language. */
export function useAgent(): (id: AgentId) => AgentView {
  const text = useBi();
  return (id) => {
    const agent = AGENTS[id];
    return {
      name: text(agent.name),
      role: text(agent.role),
      dept: text(DEPTS[agent.dept]),
      status: agent.status,
    };
  };
}

export type Risk = "low" | "med" | "high";

export interface Approval {
  id: string;
  by: AgentId;
  what: Bi;
  risk: Risk;
  policy: string;
  age: string;
  value: string;
}

export const APPROVALS: readonly Approval[] = [
  {
    id: "AP-118",
    by: "noa",
    what: bi(
      "החזר חלקי 15% ($7.20) על הזמנה #3152 של Emma R.",
      "Partial refund 15% ($7.20) on order #3152 for Emma R.",
    ),
    risk: "low",
    policy: "refunds.partial ≤ $20",
    age: "12 min",
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
    age: "38 min",
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
    age: "42 min",
    value: "4 img",
  },
];
