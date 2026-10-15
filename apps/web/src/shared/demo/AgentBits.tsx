import { useLingui } from "@lingui/react/macro";

import { agent, type AgentId, type Risk } from "./office.ts";
import { Chip, Dot, initialOf, Who, type DotTone } from "../ui/kit/index.ts";

/** An employee's initial in the current language, as the demo's avatars show it. */
export function useAgentInitial(): (id: AgentId) => string {
  const { t } = useLingui();
  return (id) => initialOf(t(agent(id).name));
}

/** An employee's avatar and name (the demo's `who`). */
export function AgentWho({ id }: { id: AgentId }) {
  const { t } = useLingui();
  return <Who name={t(agent(id).name)} />;
}

const RISK_TONE: Record<Risk, DotTone> = { low: "success", med: "info", high: "attention" };

/** "Risk low / medium / high" with its dot (the demo's `riskPill`). */
export function RiskChip({ risk }: { risk: Risk }) {
  const { t } = useLingui();
  const label = { low: t`Risk Low`, med: t`Risk Medium`, high: t`Risk High` }[risk];
  return (
    <Chip>
      <Dot tone={RISK_TONE[risk]} />
      {label}
    </Chip>
  );
}
