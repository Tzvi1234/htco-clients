// The Design 1C demo's office as sample data: the 16 AI employees with their permanent names
// and titles (platform ADR-0012), the seven departments, the three machine rooms and the
// approvals that wait for the owner. Only demo frames and Demo-labelled parts show it; nothing
// here is live. Names and titles are messages, so they read in Hebrew and English.
import { msg } from "@lingui/core/macro";
import type { MessageDescriptor } from "@lingui/core";

import type { AgentStatus } from "../ui/kit/kit.tsx";

export type DeptId = "exec" | "studio" | "proc" | "oa" | "mkt" | "cs" | "eng";

export interface Dept {
  id: DeptId;
  code: string;
  name: MessageDescriptor;
}

export const DEPTS: readonly Dept[] = [
  { id: "exec", code: "EXE", name: msg`Executive Office` },
  { id: "studio", code: "PRD", name: msg`Product Studio` },
  { id: "proc", code: "PRC", name: msg`Procurement & Finance` },
  { id: "oa", code: "ORD", name: msg`Order Assurance` },
  { id: "mkt", code: "MKT", name: msg`Marketing` },
  { id: "cs", code: "SUP", name: msg`Customer Support` },
  { id: "eng", code: "ENG", name: msg`Engineering` },
];

export type AgentId =
  | "maya"
  | "noa"
  | "omer"
  | "lia"
  | "shon"
  | "noam"
  | "nika"
  | "daniel"
  | "tom"
  | "roni"
  | "eitan"
  | "gal"
  | "dana"
  | "alex"
  | "amir"
  | "iris";

export interface Agent {
  id: AgentId;
  name: MessageDescriptor;
  role: MessageDescriptor;
  dept: DeptId;
  status: AgentStatus;
  task: MessageDescriptor;
}

export const AGENTS: readonly Agent[] = [
  {
    id: "maya",
    name: msg`Maya`,
    role: msg`General Manager`,
    dept: "exec",
    status: "running",
    task: msg`Coordinating late orders`,
  },
  {
    id: "noa",
    name: msg`Noa`,
    role: msg`Quality & Operations Supervisor`,
    dept: "exec",
    status: "waityou",
    task: msg`Awaiting refund approval`,
  },
  {
    id: "omer",
    name: msg`Omer`,
    role: msg`Continuous Optimization Officer`,
    dept: "exec",
    status: "idle",
    task: msg`No active task`,
  },
  {
    id: "lia",
    name: msg`Lia`,
    role: msg`Owner Assistant`,
    dept: "exec",
    status: "queued",
    task: msg`Weekly summary draft`,
  },
  {
    id: "shon",
    name: msg`Shon`,
    role: msg`Product Intelligence`,
    dept: "studio",
    status: "waitext",
    task: msg`Waiting for trend data`,
  },
  {
    id: "noam",
    name: msg`Noam`,
    role: msg`SEO & Copywriting`,
    dept: "studio",
    status: "idle",
    task: msg`No active task`,
  },
  {
    id: "nika",
    name: msg`Nika`,
    role: msg`Creative & GPT Image Specialist`,
    dept: "studio",
    status: "running",
    task: msg`4 star-map mockups`,
  },
  {
    id: "daniel",
    name: msg`Daniel`,
    role: msg`Catalog & Pricing Architect`,
    dept: "studio",
    status: "idle",
    task: msg`No active task`,
  },
  {
    id: "tom",
    name: msg`Tom`,
    role: msg`Procurement & Supplier Quotes`,
    dept: "proc",
    status: "waitext",
    task: msg`Waiting for Gelato quote`,
  },
  {
    id: "roni",
    name: msg`Roni`,
    role: msg`Finance Controller`,
    dept: "proc",
    status: "idle",
    task: msg`No active task`,
  },
  {
    id: "eitan",
    name: msg`Eitan`,
    role: msg`Fulfillment Inspector`,
    dept: "oa",
    status: "blocked",
    task: msg`Tracking sync is down`,
  },
  {
    id: "gal",
    name: msg`Gal`,
    role: msg`Marketing & Growth`,
    dept: "mkt",
    status: "offline",
    task: msg`Offline since 18:00`,
  },
  {
    id: "dana",
    name: msg`Dana`,
    role: msg`Customer Service`,
    dept: "cs",
    status: "idle",
    task: msg`No active task`,
  },
  {
    id: "alex",
    name: msg`Alex`,
    role: msg`Lead Software & Platform Engineer`,
    dept: "eng",
    status: "running",
    task: msg`Deploying api v1.14`,
  },
  {
    id: "amir",
    name: msg`Amir`,
    role: msg`Debugger & Reliability Engineer`,
    dept: "eng",
    status: "failed",
    task: msg`tracking.sync retry failed`,
  },
  {
    id: "iris",
    name: msg`Iris`,
    role: msg`Agent Systems & Experience Engineer`,
    dept: "eng",
    status: "idle",
    task: msg`No active task`,
  },
];

export function agent(id: AgentId): Agent {
  const found = AGENTS.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`No agent ${id}`);
  return found;
}

export function dept(id: DeptId): Dept {
  const found = DEPTS.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`No department ${id}`);
  return found;
}

/** An employee's badge code, as on the demo's cards: department code and seat number. */
export function badge(a: Agent): string {
  return `${dept(a.dept).code}-${String(AGENTS.indexOf(a) + 1).padStart(2, "0")}`;
}

/** The three machine rooms beside the departments. */
export const SERVICES: readonly {
  name: MessageDescriptor;
  items: string;
  status: AgentStatus;
}[] = [
  {
    name: msg`Automations`,
    items: "etsy.order_intake · tracking.sync · quality.nightly_audit",
    status: "failed",
  },
  {
    name: msg`AI Tools`,
    items: "Jev decision advisor · GPT Images · MCP gateway",
    status: "running",
  },
  { name: msg`Infrastructure`, items: "api · postgres · agent-worker", status: "running" },
];

export type Risk = "low" | "med" | "high";

/** The approvals waiting for the owner in the demo. */
export const APPROVALS: readonly {
  id: string;
  by: AgentId;
  what: MessageDescriptor;
  risk: Risk;
  policy: string;
  age: string;
  value: string;
}[] = [
  {
    id: "AP-118",
    by: "noa",
    what: msg`Partial refund 15% ($7.20) on order #3152 for Emma R.`,
    risk: "low",
    policy: "refunds.partial ≤ $20",
    age: "12 min",
    value: "$7.20",
  },
  {
    id: "AP-119",
    by: "tom",
    what: msg`Switch linen towels to Gelato (−$2.10 per unit)`,
    risk: "med",
    policy: "suppliers.change",
    age: "38 min",
    value: "−$2.10",
  },
  {
    id: "AP-120",
    by: "nika",
    what: msg`Publish 4 new images to the star map listing`,
    risk: "high",
    policy: "listings.publish",
    age: "42 min",
    value: "4 img",
  },
];
