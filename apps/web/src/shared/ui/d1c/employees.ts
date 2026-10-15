import { useLingui } from "@lingui/react/macro";

import type { WorkState } from "./Parts.tsx";

/** The office's departments (platform ADR-0012), as the demo groups its employees. */
export type Department = "exec" | "studio" | "proc" | "oa" | "mkt" | "cs" | "eng";

export interface Employee {
  id: string;
  name: string;
  title: string;
  department: Department;
  /** The demo's sample state; the office shows only recorded activity once it is built. */
  state: WorkState;
}

/**
 * The sixteen AI employees with their permanent names and titles, in the demo's order, and the
 * demo's sample states. Demo screens use them until the office records real activity.
 */
export function useEmployees() {
  const { t } = useLingui();
  const list: Employee[] = [
    { id: "maya", name: t`Maya`, title: t`General Manager`, department: "exec", state: "running" },
    {
      id: "noa",
      name: t`Noa`,
      title: t`Quality & Operations Supervisor`,
      department: "exec",
      state: "waityou",
    },
    {
      id: "omer",
      name: t`Omer`,
      title: t`Continuous Optimization Officer`,
      department: "exec",
      state: "idle",
    },
    { id: "lia", name: t`Lia`, title: t`Owner Assistant`, department: "exec", state: "queued" },
    {
      id: "shon",
      name: t`Shon`,
      title: t`Product Intelligence`,
      department: "studio",
      state: "waitext",
    },
    { id: "noam", name: t`Noam`, title: t`SEO & Copywriting`, department: "studio", state: "idle" },
    {
      id: "nika",
      name: t`Nika`,
      title: t`Creative & GPT Image Specialist`,
      department: "studio",
      state: "running",
    },
    {
      id: "daniel",
      name: t`Daniel`,
      title: t`Catalog & Pricing Architect`,
      department: "studio",
      state: "idle",
    },
    {
      id: "tom",
      name: t`Tom`,
      title: t`Procurement & Supplier Quotes`,
      department: "proc",
      state: "waitext",
    },
    { id: "roni", name: t`Roni`, title: t`Finance Controller`, department: "proc", state: "idle" },
    {
      id: "eitan",
      name: t`Eitan`,
      title: t`Fulfillment Inspector`,
      department: "oa",
      state: "blocked",
    },
    { id: "gal", name: t`Gal`, title: t`Marketing & Growth`, department: "mkt", state: "offline" },
    { id: "dana", name: t`Dana`, title: t`Customer Service`, department: "cs", state: "idle" },
    {
      id: "alex",
      name: t`Alex`,
      title: t`Lead Software & Platform Engineer`,
      department: "eng",
      state: "running",
    },
    {
      id: "amir",
      name: t`Amir`,
      title: t`Debugger & Reliability Engineer`,
      department: "eng",
      state: "failed",
    },
    {
      id: "iris",
      name: t`Iris`,
      title: t`Agent Systems & Experience Engineer`,
      department: "eng",
      state: "idle",
    },
  ];
  const byId = (id: string): Employee => {
    const found = list.find((employee) => employee.id === id);
    if (found === undefined) throw new Error(`No employee ${id}`);
    return found;
  };
  return { list, byId };
}

/** The demo's words for each work state. */
export function useStateWords(): Record<WorkState, string> {
  const { t } = useLingui();
  return {
    idle: t`Idle`,
    queued: t`Queued`,
    running: t`Running`,
    waitext: t`Waiting (external)`,
    waityou: t`Waiting for you`,
    blocked: t`Blocked`,
    failed: t`Failed`,
    offline: t`Offline`,
  };
}
