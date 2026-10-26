import { Trans, useLingui } from "@lingui/react/macro";

import { useAgents, type AgentId } from "../../shared/demo/office.ts";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  CircleButton,
  DataTable,
  DemoFrame,
  Dot,
  DotBar,
  FilterGlyph,
  IdBlock,
  KV,
  KV2,
  PlusGlyph,
  SectionLabel,
  Status,
  StatusGlyph,
  Strip,
  StripCard,
  Toggle,
  Who,
  Zoom,
  useStatusLabels,
  type AgentStatus,
  useZoomLabels,
  ChatGlyph,
} from "../../shared/ui/kit/index.ts";

const Code = ({ children, size = "text-body-sm" }: { children: string; size?: string }) => (
  <span className={`ltr font-mono ${size}`}>{children}</span>
);
const L = ({ children }: { children: string | number }) => <span className="ltr">{children}</span>;

/** Thirty days as dots, the bad days in the accent (`upbar()`). */
function UptimeBar({ bad, label }: { bad: readonly number[]; label: string }) {
  return <DotBar count={30} filled={30} marks={bad} label={label} />;
}

/** Admin › Automations (`P.automations`): the deterministic automations and their runs. */
export function AutomationsDemo({ title }: { title: string }) {
  const { t } = useLingui();
  const words = useStatusLabels();
  const { byId } = useAgents();
  const zoom = useZoomLabels();
  const automations: [string, string, string, AgentStatus, string, AgentId, boolean][] = [
    [
      "a1",
      "etsy.order_intake",
      t`Pull Etsy orders every 15 minutes`,
      "running",
      "07:58",
      "maya",
      true,
    ],
    [
      "a2",
      "tracking.sync",
      t`Sync tracking numbers from carriers`,
      "failed",
      "08:12",
      "eitan",
      true,
    ],
    [
      "a3",
      "quality.nightly_audit",
      t`Nightly listing quality audit`,
      "idle",
      "03:00",
      "noa",
      false,
    ],
  ];
  const runs: [string, string, AgentStatus, string][] = [
    ["R-981", "tracking.sync", "failed", "08:42"],
    ["R-980", "etsy.order_intake", "running", "08:28"],
    ["R-979", "tracking.sync", "failed", "08:12"],
    ["R-978", "etsy.order_intake", "idle", "07:58"],
    ["R-977", "tracking.sync", "failed", "07:42"],
    ["R-976", "etsy.order_intake", "idle", "07:43"],
    ["R-975", "quality.nightly_audit", "idle", "03:00"],
    ["R-974", "tracking.sync", "idle", "07:12"],
  ];
  return (
    <DemoFrame title={title} layout="l2rs">
      <Panel>
        <PanelHeader
          title={<Trans>Automations</Trans>}
          meta={<L>3</L>}
          actions={<CircleButton label={t`New automation`} icon={<PlusGlyph />} />}
        />
        <DataTable
          label={t`Automations`}
          phoneHidden={[1, 3, 4]}
          head={[t`Name`, t`Description`, t`Status`, t`Last run`, t`Owner`, t`On`]}
          rows={automations.map(([key, name, description, state, time, owner, on]) => ({
            key,
            selected: key === "a2",
            cells: [
              <Code key="n">{name}</Code>,
              description,
              <Status key="s" live status={state} label={words[state]} />,
              <L key="t">{time}</L>,
              <Who key="o" name={byId(owner).name} />,
              <Toggle key="g" label={name} isSelected={on} />,
            ],
          }))}
        />
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Automation details</Trans>}
          actions={<CircleButton label={t`Chat with Amir`} icon={<ChatGlyph />} />}
        />
        <PanelBody className="justify-between gap-5">
          <IdBlock label={t`Automation:`} value={<Code size="text-[26px]">tracking.sync</Code>} />
          <KV
            items={[
              [t`Schedule`, t`Every 30 min`],
              [t`Runs today`, <L key="a">18</L>],
              [t`Failures`, <L key="b">3</L>],
              [t`Error`, <Code key="c">exit 502</Code>],
            ]}
          />
          <div>
            <SectionLabel>
              <Trans>Last 30 runs</Trans>
            </SectionLabel>
            <UptimeBar bad={[25, 27, 29]} label={t`Last 30 runs`} />
          </div>
          <KV2
            items={[
              [
                t`Status:`,
                <>
                  <StatusGlyph live status="failed" />
                  {words.failed}
                </>,
              ],
              [
                t`Assigned:`,
                <>
                  <Dot tone="ink" />
                  {byId("amir").name}
                </>,
              ],
            ]}
          />
        </PanelBody>
      </Panel>
      <Strip
        title={<Trans>Recent runs</Trans>}
        meta={<L>8</L>}
        zoom={<Zoom labels={zoom} page={0} />}
        actions={<CircleButton label={t`Filter`} icon={<FilterGlyph />} />}
      >
        {runs.map(([id, name, state, time], index) => (
          <StripCard
            key={id}
            topStart={<L>{id}</L>}
            topEnd={<L>{time}</L>}
            line={
              <Status live status={state} label={state === "idle" ? t`Succeeded` : words[state]} />
            }
            selected={index === 0}
          >
            <span className="mt-2 max-w-full truncate">
              <Code size="text-caption">{name}</Code>
            </span>
          </StripCard>
        ))}
      </Strip>
    </DemoFrame>
  );
}
