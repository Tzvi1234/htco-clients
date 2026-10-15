import { Trans, useLingui } from "@lingui/react/macro";

import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import { ChatIcon, GearIcon } from "../../shared/ui/icons.tsx";
import { MatrixChart } from "../../shared/ui/d1c/Charts.tsx";
import { DemoFrame } from "../../shared/ui/d1c/DemoFrame.tsx";
import { useEmployees, useStateWords } from "../../shared/ui/d1c/employees.ts";
import { FilterIcon, PlusIcon } from "../../shared/ui/d1c/icons.tsx";
import {
  CircleButton,
  Dot,
  DotBar,
  IdBlock,
  KV,
  KV2,
  SectionLabel,
  StateGlyph,
  StateLabel,
  Toggle,
  Who,
  type WorkState,
} from "../../shared/ui/d1c/Parts.tsx";
import { StripCard, StripPanel, ZoomControl } from "../../shared/ui/d1c/Layout.tsx";
import { DataTable } from "../../shared/ui/d1c/Table.tsx";

const Code = ({ children, size = "text-body-sm" }: { children: string; size?: string }) => (
  <span className={`ltr font-mono ${size}`}>{children}</span>
);
const L = ({ children }: { children: string | number }) => <span className="ltr">{children}</span>;

/** Thirty days as dots, the bad days in the accent (`upbar()`). */
function UptimeBar({ bad, label }: { bad: readonly number[]; label: string }) {
  return <DotBar count={30} filled={30} marks={bad} label={label} />;
}

export function useZoomLabels() {
  const { t } = useLingui();
  return { less: t`Show less`, more: t`Show more` };
}

/** Admin › Health (`P.health`): the system's state, its services and their uptime. */
export function HealthDemo({ title }: { title: string }) {
  const { t } = useLingui();
  const words = useStateWords();
  const services: [string, WorkState, string, string][] = [
    ["api", "running", "182 ms", "v1.13"],
    ["postgres", "running", "12 ms", "16.4"],
    ["agent-worker", "running", t`3 jobs`, "v0.42"],
    ["tracking.sync", "failed", "502", "—"],
    ["etsy.order_intake", "running", "07:58", "v2"],
    ["MCP gateway", "running", "41 ms", "v0.9"],
  ];
  const uptime: [string, string, number[]][] = [
    ["api", "99.9%", []],
    ["postgres", "100%", []],
    ["agent-worker", "99.7%", [21]],
    ["tracking.sync", "97.1%", [18, 29]],
  ];
  return (
    <DemoFrame title={title} layout="l3">
      <Panel>
        <PanelHeader
          title={<Trans>Overall</Trans>}
          actions={<CircleButton label={t`Settings`} icon={<GearIcon />} />}
        />
        <PanelBody className="justify-between gap-6">
          <IdBlock label={t`30-day uptime:`} value={<L>99.82%</L>} />
          <KV
            items={[
              [t`Open incidents`, <L key="a">1</L>],
              [t`Response time`, <L key="b">182 ms</L>],
              [t`Queue depth`, <L key="c">3</L>],
              [t`Last backup`, <L key="d">03:00</L>],
            ]}
          />
          <MatrixChart
            top={t`System health`}
            start={t`Uptime`}
            end={t`Capacity`}
            bottom={t`Errors`}
            value="96"
            caption={t`Stable`}
          />
        </PanelBody>
      </Panel>
      <Panel>
        <PanelHeader title={<Trans>Services</Trans>} meta={<L>6</L>} />
        <PanelBody className="pt-0">
          <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-2">
            {services.map(([name, state, metric, version]) => (
              <div
                key={name}
                className="flex min-w-0 flex-col justify-between gap-1 rounded-card border border-line p-4 transition-colors hover:bg-hover"
              >
                <div className="flex items-center justify-between gap-2">
                  <Code>{name}</Code>
                  <StateLabel state={state}>{words[state]}</StateLabel>
                </div>
                <div className="font-display text-display-sm leading-[1.2] font-light">
                  <L>{metric}</L>
                </div>
                <div className="text-caption text-muted">
                  {t`Version`} <L>{version}</L>
                </div>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
      <Panel>
        <PanelHeader title={<Trans>30-day uptime</Trans>} />
        <PanelBody className="justify-between gap-6">
          {uptime.map(([name, value, bad]) => (
            <div key={name}>
              <div className="mb-2 flex justify-between text-body-sm">
                <Code>{name}</Code>
                <span className="text-muted">
                  <L>{value}</L>
                </span>
              </div>
              <UptimeBar bad={bad} label={`${name} ${value}`} />
            </div>
          ))}
        </PanelBody>
      </Panel>
    </DemoFrame>
  );
}

/** Admin › Automations (`P.automations`): the deterministic automations and their runs. */
export function AutomationsDemo({ title }: { title: string }) {
  const { t } = useLingui();
  const words = useStateWords();
  const { byId } = useEmployees();
  const zoom = useZoomLabels();
  const automations: [string, string, string, WorkState, string, string, boolean][] = [
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
  const runs: [string, string, WorkState, string][] = [
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
          actions={<CircleButton label={t`New automation`} icon={<PlusIcon />} />}
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
              <StateLabel key="s" state={state}>
                {words[state]}
              </StateLabel>,
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
          actions={<CircleButton label={t`Chat with Amir`} icon={<ChatIcon />} />}
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
                  <StateGlyph state="failed" />
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
      <StripPanel
        title={<Trans>Recent runs</Trans>}
        meta={<L>8</L>}
        zoom={<ZoomControl label={zoom} page={0} />}
        actions={<CircleButton label={t`Filter`} icon={<FilterIcon />} />}
      >
        {runs.map(([id, name, state, time], index) => (
          <StripCard
            key={id}
            a={<L>{id}</L>}
            b={<L>{time}</L>}
            line={
              <StateLabel state={state}>
                {state === "idle" ? t`Succeeded` : words[state]}
              </StateLabel>
            }
            selected={index === 0}
          >
            <span className="mt-2 max-w-full truncate">
              <Code size="text-caption">{name}</Code>
            </span>
          </StripCard>
        ))}
      </StripPanel>
    </DemoFrame>
  );
}
