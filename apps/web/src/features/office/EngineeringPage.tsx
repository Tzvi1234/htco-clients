import { useLingui } from "@lingui/react/macro";

import { AgentWho } from "../../shared/demo/AgentBits.tsx";
import { agent, type AgentId } from "../../shared/demo/office.ts";
import { MoreIcon } from "../../shared/ui/icons.tsx";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Avatar,
  ChatGlyph,
  CircleButton,
  DataTable,
  DemoFrame,
  Dot,
  IdBlock,
  KV,
  KV2,
  Matrix,
  N,
  Pill,
  Sep,
  Status,
  StatusGlyph,
  useStatusLabels,
  type AgentStatus,
} from "../../shared/ui/kit/index.ts";

/**
 * Office › Engineering (Design 1C `P.eng`), a demo frame: the open incident, changes and
 * deploys, and the engineering team with its reliability matrix.
 */
export function EngineeringPage() {
  const { t } = useLingui();
  const statusLabels = useStatusLabels();
  const yesterday = t`Yesterday`;
  const deploys: [string, string, string, AgentStatus, AgentId, string][] = [
    ["D-412", t`api v1.14 — order cache`, "api", "running", "alex", "08:30"],
    ["D-411", t`Carrier token rotation`, "agent-worker", "failed", "amir", "08:21"],
    ["D-410", t`Agent latency metric`, "agent-worker", "idle", "iris", yesterday],
    ["D-409", t`Index on orders.status`, "postgres", "idle", "alex", yesterday],
    ["D-408", t`Webhook retries`, "api", "idle", "alex", "13.10"],
    ["D-407", t`New MCP tool: Etsy listings`, "mcp", "idle", "iris", "12.10"],
    ["D-406", t`Nightly postgres backup`, "postgres", "idle", "amir", "11.10"],
  ];
  const timeline: [string, string][] = [
    ["08:12", t`tracking.sync started failing with 502`],
    ["08:14", t`Amir took the incident`],
    ["08:21", t`Carrier token rotation failed (D-411)`],
  ];
  return (
    <DemoFrame title={t({ message: "Engineering", context: "navigation" })} views layout="l3">
      <Panel>
        <PanelHeader
          title={t`Open incident`}
          actions={<CircleButton label={t`Chat with Amir`} icon={<ChatGlyph />} />}
        />
        <PanelBody className="justify-between">
          <IdBlock label={t`Incident:`} value={<N>INC-07</N>}>
            <div className="mt-1 text-body-sm">
              <N>tracking.sync</N>
              <Sep />
              <N>502</N>
            </div>
          </IdBlock>
          <ol aria-label={t`Timeline`} className="m-0 list-none p-0">
            {timeline.map(([time, text]) => (
              <li key={time} className="k-tl">
                <span className="k-tm">
                  <N>{time}</N>
                </span>
                <span className="text-body-sm">{text}</span>
              </li>
            ))}
          </ol>
          <KV
            items={[
              [t({ message: "Owner", context: "responsible, he" }), t`Amir`],
              [t`Opened`, <N key="o">08:12</N>],
              [t`Impact`, t`2 orders`],
              [t`Severity`, <N key="s">P2</N>],
            ]}
          />
          <KV2
            items={[
              [
                t`Status:`,
                <Pill wide key="s">
                  <StatusGlyph status="failed" />
                  {statusLabels.failed}
                </Pill>,
              ],
              [
                t`Next:`,
                <Pill wide key="n">
                  <Dot tone="info" />
                  {t`Rotate token`}
                </Pill>,
              ],
            ]}
          />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader
          title={t`Changes & deploys`}
          meta={<N>7</N>}
          actions={<CircleButton label={t`More`} icon={<MoreIcon />} />}
        />
        <DataTable
          label={t`Changes & deploys`}
          head={[t`ID`, t`Change`, t`Service`, t`Status`, t`Engineer`, t`Time`]}
          ends={[5]}
          phoneHidden={[2, 4]}
          rows={deploys.map(([id, change, service, status, who, time]) => ({
            key: id,
            cells: [
              <N key="id">{id}</N>,
              change,
              <N key="sv">{service}</N>,
              <Status key="st" status={status} live />,
              <AgentWho key="w" id={who} />,
              <N key="t">{time}</N>,
            ],
          }))}
        />
      </Panel>

      <Panel className="max-sm:hidden">
        <PanelHeader title={t`Engineering team`} meta={<N>3</N>} />
        <div className="px-2 pb-2">
          {(["alex", "amir", "iris"] as const).map((id) => {
            const a = agent(id);
            return (
              <div key={id} className="k-row k-click">
                <Avatar initial={t(a.name).charAt(0)} status={a.status} />
                <div className="k-grow">
                  <div className="k-nm">
                    <span>{t(a.name)}</span>
                  </div>
                  <div className="k-ln">{t(a.role)}</div>
                  <div className="mt-1.5">
                    <Status status={a.status} live />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <PanelBody className="justify-end">
          <Matrix
            top={t`Reliability`}
            start={t`Uptime`}
            end={t`Speed`}
            bottom={t`Errors`}
            value="96"
            caption={t`Stable`}
            k={4}
            width={176}
            height={128}
          />
        </PanelBody>
      </Panel>
    </DemoFrame>
  );
}
