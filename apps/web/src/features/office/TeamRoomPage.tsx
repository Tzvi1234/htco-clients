import { useLingui } from "@lingui/react/macro";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";

import { THREADS, type TeamThread } from "./data.ts";
import { agent, type AgentId } from "../../shared/demo/office.ts";
import { cx } from "../../shared/lib/cx.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Avatar,
  Avatars,
  BellGlyph,
  BoltGlyph,
  Card,
  CheckGlyph,
  Chip,
  CircleButton,
  CloseGlyph,
  DemoFrame,
  Dot,
  EyeGlyph,
  FilterGlyph,
  IdBlock,
  KV,
  KV2,
  N,
  NextGlyph,
  PauseGlyph,
  Pill,
  PlusGlyph,
  Stack,
  Status,
  StatusGlyph,
  Typing,
  initialOf,
  useStatusLabels,
} from "../../shared/ui/kit/index.ts";

/**
 * Office › Team room (Design 1C `P.team`), a demo frame: the owner watches the AI employees
 * talk in threads, with system events between their messages, and can join or pause.
 */
export function TeamRoomPage() {
  const { t } = useLingui();
  const [thread, setThread] = useState<TeamThread["id"]>("t1");
  const current = THREADS.find((x) => x.id === thread) ?? THREADS[0];
  if (current === undefined) return null;
  return (
    <DemoFrame title={t(current.title)} views layout="l3">
      <Panel>
        <PanelHeader
          title={t`Team threads`}
          meta={<N>4</N>}
          actions={<CircleButton label={t`Filter`} icon={<FilterGlyph />} />}
        />
        <ul className="k-scroll m-0 min-h-0 grow list-none px-2 pb-2" data-demo-view="">
          {THREADS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-current={thread === item.id ? "true" : undefined}
                className={cx("k-row", thread === item.id && "k-sel")}
                onClick={() => {
                  setThread(item.id);
                }}
              >
                <span className="k-grow">
                  <span className="k-nm">
                    <span className="truncate">{t(item.title)}</span>
                    <small>
                      <N>{typeof item.at === "string" ? item.at : t(item.at)}</N>
                    </small>
                  </span>
                  <span className="mt-1.5 flex items-center justify-between">
                    <Avatars
                      size="xs"
                      initials={item.people.map((id) => initialOf(t(agent(id).name)))}
                    />
                    {item.live ? (
                      <Status status="running" label={t`Live`} live />
                    ) : (
                      <span className="text-caption whitespace-nowrap text-muted">{t`Closed`}</span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelHeader
          title={t(current.title)}
          actions={
            <Chip>
              <EyeGlyph size={12} />
              {t`Read-only`}
            </Chip>
          }
        />
        {/* Focusable so the conversation scrolls from the keyboard too. */}
        <div
          className="k-thread"
          key={thread}
          role="log"
          tabIndex={0}
          aria-label={t(current.title)}
        >
          {thread === "t1" ? (
            <LiveThread />
          ) : (
            <>
              <div className="k-daysep">{t`Archive`}</div>
              <Event icon={CheckGlyph} time="18:00">
                {t`Thread closed`}
              </Event>
            </>
          )}
        </div>
        <div className="k-ro">
          <span>{t`You are watching agents talk. They keep working.`}</span>
          <div className="flex shrink-0 gap-1.5">
            <Button>
              <PauseGlyph size={14} />
              {t`Pause thread`}
            </Button>
            <Button variant="primary">{t`Join conversation`}</Button>
          </div>
        </div>
      </Panel>

      <Stack className="max-sm:hidden">
        <Participants />
        <LinkedTask />
      </Stack>
    </DemoFrame>
  );
}

function Event({
  icon: Icon,
  time,
  children,
}: {
  icon: ComponentType<{ size?: number }>;
  time: string;
  children: ReactNode;
}) {
  return (
    <div className="k-evt">
      <Icon size={12} />
      <span>
        {children} · <N>{time}</N>
      </span>
    </div>
  );
}

function Say({
  id,
  time,
  children,
  extra,
}: {
  id: AgentId;
  time: string;
  children: ReactNode;
  extra?: ReactNode;
}) {
  const { t } = useLingui();
  const a = agent(id);
  return (
    <div className="k-msg">
      <div className="k-meta">
        <Avatar initial={t(a.name).charAt(0)} size="xs" />
        {t(a.name)} · <span>{t(a.role)}</span> · <N>{time}</N>
      </div>
      <div className="k-bub">{children}</div>
      {extra}
    </div>
  );
}

function LiveThread() {
  const { t } = useLingui();
  const amir = t`Amir`;
  return (
    <>
      <div className="k-daysep">{t`Today`}</div>
      <Event icon={BoltGlyph} time="08:02">
        {t`etsy.order_intake flagged 2 late orders`}
      </Event>
      <Say id="noa" time="08:05">
        {t`Eitan, #3152 and #3160 passed their promised ship date. What is the supplier status?`}
      </Say>
      <Say id="eitan" time="08:09">
        {t`Both printed yesterday, but I have no tracking numbers — tracking.sync has returned nothing since 07:40.`}
      </Say>
      <Event icon={CloseGlyph} time="08:12">
        {t`tracking.sync failed · exit 502`}
      </Event>
      <Say id="maya" time="08:14">
        {t`Noa, prepare a partial refund proposal for #3152 and send it to Tzvi for approval. Amir, can you join?`}
      </Say>
      <Event icon={PlusGlyph} time="08:15">
        {t`Amir joined the thread`}
      </Event>
      <Say
        id="amir"
        time="08:21"
        extra={
          <Card className="k-tool mt-2">
            <div className="k-hd">
              <span>{t`Diagnosis`}</span>
              <span className="k-code">agent-worker</span>
            </div>
            <div className="k-code mt-2 leading-[1.7] text-secondary">
              GET /v2/track?ids=3152,3160 → 502
              <br />
              carrier.token expires_at 2026-10-15T07:38Z
            </div>
          </Card>
        }
      >
        {t`Found it: the carrier API token expired at 07:38, every call gets a 502 from the gateway. Rotating the token and re-running the sync.`}
      </Say>
      <Event icon={BellGlyph} time="08:24">
        {t`Noa sent approval AP-118 to Tzvi`}
      </Event>
      <div className="k-msg">
        <div className="k-meta">
          <Avatar initial={amir.charAt(0)} size="xs" />
          {t`${amir} is typing…`}
        </div>
        <Typing label={t`${amir} is typing…`} />
      </div>
    </>
  );
}

function Participants() {
  const { t } = useLingui();
  const people: AgentId[] = ["noa", "eitan", "maya", "amir"];
  return (
    <Panel>
      <PanelHeader title={t`Participants`} meta={<N>4</N>} />
      <div className="px-2 pb-2">
        {people.map((id) => {
          const a = agent(id);
          return (
            <div key={id} className="k-row k-click">
              <Avatar initial={t(a.name).charAt(0)} size="sm" status={a.status} />
              <div className="k-grow">
                <div className="k-nm text-body-sm">
                  <span>{t(a.name)}</span>
                  <Status status={a.status} live />
                </div>
                <div className="k-ln">{t(a.role)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function LinkedTask() {
  const { t } = useLingui();
  const statusLabels = useStatusLabels();
  const steps = [
    { done: true, label: t`2 late orders flagged`, time: "08:02" },
    { done: true, label: t`Root cause found`, time: "08:21" },
    { done: false, label: t`Refund awaiting approval`, time: "08:24" },
  ];
  return (
    <Panel>
      <PanelHeader
        title={t`Linked task`}
        actions={<CircleButton label={t`To tasks`} icon={<NextGlyph />} />}
      />
      <PanelBody className="justify-between">
        <IdBlock label={t`Task:`} value={<N>T-2041</N>}>
          <div className="mt-1 text-body-sm">{t`Resolve late orders #3152, #3160`}</div>
        </IdBlock>
        <div>
          {steps.map((step) => (
            <div key={step.label} className="flex h-7 items-center gap-2.5 text-body-sm">
              {step.done ? (
                <span className="k-ck k-on" aria-hidden="true">
                  <CheckGlyph size={10} />
                </span>
              ) : (
                <span className="k-ck k-now" aria-hidden="true">
                  <Dot tone="attention" />
                </span>
              )}
              <span className="grow">{step.label}</span>
              <span className="text-caption text-muted">
                <N>{step.time}</N>
              </span>
            </div>
          ))}
        </div>
        <KV
          items={[
            [t({ message: "Owner", context: "responsible, she" }), t`Maya`],
            [
              t`Policy version`,
              <span key="v" className="k-code">
                2026-10-15.1
              </span>,
            ],
          ]}
        />
        <KV2
          items={[
            [
              t`Status:`,
              <Pill wide key="s">
                <StatusGlyph status="blocked" />
                {statusLabels.blocked}
              </Pill>,
            ],
            [
              t`Approval:`,
              <Pill wide key="a">
                <Dot tone="attention" />
                <N>AP-118</N>
              </Pill>,
            ],
          ]}
        />
      </PanelBody>
    </Panel>
  );
}
