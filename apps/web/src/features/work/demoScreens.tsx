import { Trans, useLingui } from "@lingui/react/macro";
import type { ComponentType, ReactNode } from "react";

import { APPROVALS, useAgent, type AgentId, type Risk } from "./agents.ts";
import { cx } from "../../shared/lib/cx.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Avatar,
  Card,
  ChatGlyph,
  CheckGlyph,
  Chip,
  CircleButton,
  CloseGlyph,
  CountUp,
  DemoFrame,
  Dot,
  FilterGlyph,
  IdBlock,
  InkDisc,
  KV,
  KV2,
  Matrix,
  Pill,
  PlusGlyph,
  Screen,
  SectionLabel,
  Status,
  Strip,
  StripCard,
  Who,
  Zoom,
  bi,
  initialOf,
  useBi,
  useMinutes,
  type AgentStatus,
  type Bi,
  type DotTone,
  MoreGlyph,
} from "../../shared/ui/kit/index.ts";

const ltr = (text: ReactNode) => <span className="ltr">{text}</span>;

/** `.pb`: a panel body with the demo's 24 px gutters. */
function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("flex min-h-0 grow flex-col px-6 pb-6", className)}>{children}</div>;
}

/* ------------------------------------------------------------------ Tasks */

type TaskRow = [id: string, name: Bi, agent: AgentId, status?: AgentStatus];

const TASKS: Record<"queued" | "running" | "wait", readonly TaskRow[]> = {
  queued: [
    ["T-2044", bi("סיכום שבועי לבעלים", "Weekly owner summary"), "lia"],
    ["T-2045", bi("תמחור מחדש של ספלים", "Reprice mugs"), "daniel"],
    ["T-2046", bi("מילות מפתח לפורטרטים", "Keywords for portraits"), "noam"],
  ],
  running: [
    ["T-2041", bi("טיפול בהזמנות באיחור", "Resolve late orders"), "maya"],
    ["T-2042", bi("4 הדמיות למפת כוכבים", "4 star map mockups"), "nika"],
    ["T-2043", bi("פריסת api v1.14", "Deploy api v1.14"), "alex"],
  ],
  wait: [
    ["T-2039", bi("החזר חלקי #3152", "Partial refund #3152"), "noa", "waityou"],
    ["T-2038", bi("הצעת מחיר Gelato", "Gelato quote"), "tom", "waitext"],
    ["T-2037", bi("סנכרון מעקב", "Tracking sync"), "eitan", "blocked"],
  ],
};

const DONE: readonly [string, AgentId, Bi][] = [
  ["T-2036", "dana", bi("3 פניות נסגרו", "3 tickets closed")],
  ["T-2035", "maya", bi("קליטת הזמנות", "Order intake")],
  ["T-2034", "noam", bi("כותרות SEO", "SEO titles")],
  ["T-2033", "roni", bi("התאמת תשלומים", "Payout match")],
  ["T-2032", "nika", bi("באנר לחנות", "Shop banner")],
  ["T-2031", "iris", bi("מדד זמן תגובה", "Latency metric")],
  ["T-2030", "daniel", bi("מחירי מגבות", "Towel prices")],
  ["T-2029", "omer", bi("דוח שיפור", "Improvement report")],
];

const TIMES = ["09:20", "08:47", "08:30"];

function TaskColumn({
  title,
  rows,
  status,
  highlightFirst = false,
}: {
  title: ReactNode;
  rows: readonly TaskRow[];
  status?: AgentStatus;
  highlightFirst?: boolean;
}) {
  const { t } = useLingui();
  const text = useBi();
  const agent = useAgent();
  return (
    <Panel>
      <PanelHeader
        title={title}
        meta={ltr(rows.length)}
        actions={<CircleButton label={t`New task`} icon={<PlusGlyph />} />}
      />
      <Body className="gap-2 overflow-auto">
        {rows.map(([id, name, who, own], i) => (
          <div
            key={id}
            style={{ animationDelay: `${String(120 + i * 60)}ms` }}
            className={cx(
              "flex flex-col gap-2 rounded-card border px-4 py-3.5 transition-[background-color,translate] duration-[var(--motion-duration-fast)] motion-safe:animate-enter hover:-translate-y-px",
              highlightFirst && i === 0 ? "border-raised bg-raised" : "border-line hover:bg-hover",
            )}
          >
            <div className="flex items-center justify-between text-caption text-secondary">
              {ltr(id)}
              <Status live status={own ?? status ?? "queued"} />
            </div>
            <div className="text-body">{text(name)}</div>
            <div className="flex items-center justify-between text-caption text-secondary">
              <Who name={agent(who).name} />
              {ltr(TIMES[i])}
            </div>
          </div>
        ))}
        <button
          type="button"
          aria-label={t`New task`}
          className="flex min-h-20 items-center justify-center rounded-card border border-dashed max-sm:hidden border-line transition-colors hover:bg-hover"
        >
          <InkDisc>
            <PlusGlyph size={14} />
          </InkDisc>
        </button>
      </Body>
    </Panel>
  );
}

function TasksDemo() {
  const { t } = useLingui();
  const text = useBi();
  const agent = useAgent();
  return (
    <Screen layout="lc3s">
      <div className="-mx-2 flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 sm:contents [&>*]:max-sm:w-[85%] [&>*]:max-sm:shrink-0 [&>*]:max-sm:snap-center">
        <TaskColumn title={<Trans>Queued</Trans>} rows={TASKS.queued} status="queued" />
        <TaskColumn
          title={<Trans>Running</Trans>}
          rows={TASKS.running}
          status="running"
          highlightFirst
        />
        <TaskColumn title={<Trans>Waiting / blocked</Trans>} rows={TASKS.wait} />
      </div>
      <Strip
        title={<Trans>Completed today</Trans>}
        meta={ltr(8)}
        zoom={<Zoom page={0} labels={{ less: t`Fewer`, more: t`More` }} />}
        actions={<CircleButton label={t`Filter`} icon={<FilterGlyph />} />}
      >
        {DONE.map(([id, who, name], i) => {
          const person = agent(who);
          return (
            <StripCard
              key={id}
              selected={i === 0}
              topStart={ltr(id)}
              topEnd={person.name}

              line={<span className="block truncate">{text(name)}</span>}
              task={
                <span className="inline-flex items-center gap-1.5">
                  <CheckGlyph size={10} />
                  <Trans>Done</Trans>
                </span>
              }
            >
              {<Avatar initial={initialOf(person.name)} />}
            </StripCard>
          );
        })}
      </Strip>
    </Screen>
  );
}

/* -------------------------------------------------------------- Approvals */

const RISK_DOT: Record<Risk, DotTone> = { low: "success", med: "info", high: "attention" };

function useRiskLabels(): Record<Risk, string> {
  const { t } = useLingui();
  return { low: t`Low`, med: t`Medium`, high: t`High` };
}

function DecisionButtons({ large = false }: { large?: boolean }) {
  return (
    <div className="flex shrink-0 gap-1.5">
      <Button size={large ? "lg" : "md"}>
        <Trans>Reject</Trans>
      </Button>
      <Button variant="primary" size={large ? "lg" : "md"}>
        <Trans>Approve</Trans>
      </Button>
    </div>
  );
}

const PAST: readonly [AgentId, Bi, "ok" | "no", Bi | string][] = [
  [
    "dana",
    bi(
      "מענה ללקוחה \u2068Sofia M.\u2069 עם קוד הנחה 10%",
      "Reply to Sofia M. with a 10% discount code",
    ),
    "ok",
    "07:40",
  ],
  [
    "roni",
    bi("תשלום חשבונית Printful ‏$312.40", "Pay Printful invoice $312.40"),
    "ok",
    bi("אתמול", "Yesterday"),
  ],
  [
    "gal",
    bi("קמפיין פרסום Etsy Ads ‏$15 ליום", "Etsy Ads campaign at $15/day"),
    "no",
    bi("אתמול", "Yesterday"),
  ],
];

function ApprovalsDemo() {
  const { t } = useLingui();
  const text = useBi();
  const minutes = useMinutes();
  const agent = useAgent();
  const risk = useRiskLabels();
  const selected = APPROVALS[0];
  if (selected === undefined) return null;
  const requester = agent(selected.by);
  return (
    <Screen layout="l3">
      <Panel>
        <PanelHeader
          title={<Trans>Summary</Trans>}
          actions={<CircleButton label={t`Filter`} icon={<FilterGlyph />} />}
        />
        <Body className="justify-between gap-6">
          <IdBlock label={<Trans>Pending:</Trans>} value={ltr(<CountUp value="3" />)} />
          <KV
            items={[
              [<Trans>Low risk</Trans>, ltr(1)],
              [<Trans>Medium risk</Trans>, ltr(1)],
              [<Trans>High risk</Trans>, ltr(1)],
              [<Trans>Oldest</Trans>, minutes(42)],
            ]}
          />
          <div className="max-sm:hidden">
            <Matrix
              top={<Trans>Decision value</Trans>}
              start={<Trans>Urgent</Trans>}
              end={<Trans>Reversible</Trans>}
              bottom={<Trans>Risk</Trans>}
              value="92"
              caption={<Trans>Within policy</Trans>}
              k={4}
              label={t`Decision value 92%, within policy`}
            />
          </div>
        </Body>
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Pending decisions</Trans>}
          meta={ltr(3)}
          actions={<CircleButton label={t`More`} icon={<MoreGlyph size={16} />} />}
        />
        <div className="min-h-0 grow overflow-auto px-2 pb-2 [scrollbar-width:thin]">
          {APPROVALS.map((item, i) => {
            const by = agent(item.by);
            return (
              <div
                key={item.id}
                style={{ animationDelay: `${String(120 + i * 60)}ms` }}
                className={cx(
                  "flex items-center gap-3 rounded-card p-4 transition-colors motion-safe:animate-enter max-sm:flex-wrap",
                  item.id === selected.id ? "bg-selected" : "hover:bg-hover",
                )}
              >
                <Avatar initial={initialOf(by.name)} status={by.status} />
                <div className="min-w-0 grow">
                  <div className="truncate text-caption font-light text-muted">
                    {by.name} · {by.role} · {ltr(item.id)} · {minutes(item.minutes)}
                  </div>
                  <div className="mt-1 mb-1.5 text-body">{text(item.what)}</div>
                  <div className="flex flex-wrap gap-1.5">
                    <Chip>
                      <Dot tone={RISK_DOT[item.risk]} />
                      <Trans>Risk</Trans> {risk[item.risk]}
                    </Chip>
                    <Chip>
                      <Trans>Policy</Trans>{" "}
                      <code className="ltr font-mono text-caption">{item.policy}</code>
                    </Chip>
                  </div>
                </div>
                <DecisionButtons />
              </div>
            );
          })}
          <SectionLabel className="px-4 pt-4">
            <Trans>Decided today</Trans>
          </SectionLabel>
          {PAST.map(([who, what, decision, time]) => {
            const by = agent(who);
            return (
              <div
                key={text(what)}
                className="flex items-center gap-3 rounded-card px-4 py-3 opacity-75"
              >
                <Avatar initial={initialOf(by.name)} size="sm" />
                <div className="min-w-0 grow">
                  <div className="text-body-sm">{text(what)}</div>
                  <div className="truncate text-caption text-secondary">
                    {by.name} · {ltr(text(time))}
                  </div>
                </div>
                <span className="inline-flex h-8 items-center gap-2 text-body-sm text-secondary">
                  {decision === "ok" ? <CheckGlyph size={14} /> : <CloseGlyph size={14} />}
                  {decision === "ok" ? <Trans>Approved</Trans> : <Trans>Rejected</Trans>}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Request details</Trans>}
          actions={<CircleButton label={t`Chat with requester`} icon={<ChatGlyph />} />}
        />
        <Body className="justify-between gap-5 overflow-auto">
          <IdBlock label={<Trans>Approval ID:</Trans>} value={ltr(selected.id)}>
            <div className="mt-1 px-2 text-body-sm">{text(selected.what)}</div>
          </IdBlock>
          <KV
            items={[
              [<Trans>Requested by</Trans>, requester.name],
              [<Trans>Value</Trans>, ltr(selected.value)],
              [
                <Trans>Policy</Trans>,
                <code className="ltr font-mono text-caption">{selected.policy}</code>,
              ],
              [
                <Trans>Version</Trans>,
                <code className="ltr font-mono text-caption">2026-10-15.1</code>,
              ],
            ]}
          />
          <Card className="text-caption leading-normal text-secondary max-sm:hidden">
            <SectionLabel className="mb-1">
              <Trans>Evidence</Trans>
            </SectionLabel>
            {text(
              bi(
                "etsy.order_intake · 37 הזמנות נבדקו · 2 באיחור · ספק: Printful",
                "etsy.order_intake · 37 orders checked · 2 late · supplier: Printful",
              ),
            )}
          </Card>
          <KV2
            items={[
              [
                <Trans>Risk:</Trans>,
                <Pill wide>
                  <Dot tone={RISK_DOT[selected.risk]} />
                  {risk[selected.risk]}
                </Pill>,
              ],
              [
                <Trans>Reversible:</Trans>,
                <Pill wide>
                  <Dot tone="success" />
                  <Trans>Yes, 24 h</Trans>
                </Pill>,
              ],
            ]}
          />
          <div className="flex justify-center">
            <DecisionButtons large />
          </div>
        </Body>
      </Panel>
    </Screen>
  );
}

/** In the demo frame: dimmed, inert, the DEMO pill in the top bar (app/shell/DemoRoute.tsx). */
const framed =
  (Content: ComponentType) =>
  ({ title }: { title: string }) => (
    <DemoFrame title={title}>
      <Content />
    </DemoFrame>
  );

export const demoScreens = {
  "work/tasks": framed(TasksDemo),
  "work/approvals": framed(ApprovalsDemo),
};
