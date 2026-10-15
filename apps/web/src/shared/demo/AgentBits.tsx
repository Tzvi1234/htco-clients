import { useLingui } from "@lingui/react/macro";

import { agent, type AgentId, type Risk } from "./office.ts";
import { Avatar, Chip, Dot, type DotTone } from "../ui/kit/kit.tsx";

/** An employee's initial in the current language, as the demo's avatars show it. */
export function useAgentInitial(): (id: AgentId) => string {
  const { t } = useLingui();
  return (id) => t(agent(id).name).charAt(0);
}

/** An employee's avatar and name (the demo's `who`). */
export function Who({ id }: { id: AgentId }) {
  const { t } = useLingui();
  const a = agent(id);
  return (
    <span className="k-who">
      <Avatar initial={t(a.name).charAt(0)} size="xs" />
      {t(a.name)}
    </span>
  );
}

const RISK_TONE: Record<Risk, DotTone> = { low: "g", med: "b", high: "o" };

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
