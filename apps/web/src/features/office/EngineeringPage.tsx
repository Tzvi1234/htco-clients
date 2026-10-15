import { useLingui } from "@lingui/react/macro";

import { Who } from "../../shared/demo/AgentBits.tsx";
import { agent, type AgentId } from "../../shared/demo/office.ts";
import { MoreIcon } from "../../shared/ui/icons.tsx";
import { ChatGlyph } from "../../shared/ui/kit/glyphs.tsx";
import {
  Avatar,
  Cb,
  DemoFrame,
  Dot,
  IdBlock,
  KV,
  KV2,
  Matrix,
  N,
  Pill,
  Status,
  StatusGlyph,
  Table,
  useStatusLabel,
  type AgentStatus,
} from "../../shared/ui/kit/kit.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";

/**
 * Office › Engineering (Design 1C `P.eng`), a demo frame: the open incident, changes and
 * deploys, and the engineering team with its reliability matrix.
 */
export function EngineeringPage() {
  const { t } = useLingui();
  const statusLabel = useStatusLabel();
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
  return (
    <>
      <PageHeader title={t({ message: "Engineering", context: "navigation" })} />
      <DemoFrame>
        <div className="k-grid k-l3 k-enter">
          <Panel>
            <PanelHeader
              title={t`Open incident`}
              actions={<Cb label={t`Chat with Amir`} icon={ChatGlyph} />}
            />
            <div className="k-pb k-between">
              <IdBlock label={t`Incident:`} value={<N>INC-07</N>}>
                <div className="mt-1 text-body-sm">
                  <N>tracking.sync</N> · <N>502</N>
                </div>
              </IdBlock>
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
                      {statusLabel("failed")}
                    </Pill>,
                  ],
                  [
                    t`Next:`,
                    <Pill wide key="n">
                      <Dot tone="b" />
                      {t`Rotate token`}
                    </Pill>,
                  ],
                ]}
              />
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title={t`Changes & deploys`}
              meta={<N>7</N>}
              actions={<Cb label={t`More`} icon={MoreIcon} />}
            />
            <Table
              label={t`Changes & deploys`}
              heads={[t`ID`, t`Change`, t`Service`, t`Status`, t`Engineer`, t`Time`]}
              rows={deploys.map(([id, change, service, status, who, time]) => [
                <N key="id">{id}</N>,
                change,
                <N key="sv">{service}</N>,
                <Status key="st" status={status} live />,
                <Who key="w" id={who} />,
                <N key="t">{time}</N>,
              ])}
            />
          </Panel>

          <Panel className="k-phone-hide">
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
            <div className="k-pb justify-end">
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
            </div>
          </Panel>
        </div>
      </DemoFrame>
    </>
  );
}
