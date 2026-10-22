import { Trans, useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { useAgents } from "../../shared/demo/office.ts";
import { cx } from "../../shared/lib/cx.ts";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  BoltIcon,
  ChatIcon,
  CheckIcon,
  GearIcon,
  MoreIcon,
  SearchIcon,
} from "../../shared/ui/icons.tsx";
import {
  Avatar,
  CircleButton,
  ClipGlyph,
  DataTable,
  DemoFrame,
  DocGlyph,
  Dot,
  DotColumns,
  FilterGlyph,
  IdBlock,
  InkDisc,
  KV,
  KV2,
  ListRow,
  Matrix,
  NextGlyph,
  PlusGlyph,
  SendGlyph,
  Stack,
  Status,
  StatusGlyph,
  useStatusLabels,
  type AgentStatus,
} from "../../shared/ui/kit/index.ts";

const L = ({ children }: { children: ReactNode }) => <span className="ltr">{children}</span>;

/** A row of a list panel (`.row`): name and time, a line, and what sits under them. */
function ListItem({
  name,
  time,
  line,
  lead,
  foot,
  selected = false,
}: {
  name: ReactNode;
  time: ReactNode;
  line: ReactNode;
  lead?: ReactNode;
  foot?: ReactNode;
  selected?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex items-center gap-3 rounded-card p-3 transition-colors duration-[var(--motion-duration-fast)]",
        selected ? "bg-selected" : "hover:bg-hover",
      )}
    >
      {lead}
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2 text-body">
          <span className="truncate">{name}</span>
          <small className="text-caption font-light text-muted">{time}</small>
        </div>
        <div className="truncate text-caption text-secondary">{line}</div>
        {foot}
      </div>
    </div>
  );
}

function Bubble({
  meta,
  children,
  me = false,
}: {
  meta: ReactNode;
  children: ReactNode;
  me?: boolean;
}) {
  return (
    <div className={cx("flex max-w-[72%] flex-col", me ? "items-end self-end" : "items-start")}>
      <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted">{meta}</div>
      <div
        className={cx(
          "rounded-[20px] px-4 py-3 text-body leading-[1.45]",
          me ? "bg-inverse text-on-inverse" : "bg-raised",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Event({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "flex h-7 items-center gap-2 self-center rounded-pill border border-dashed border-line-strong px-3.5 text-caption text-secondary",
        className,
      )}
    >
      <BoltIcon size={12} />
      {children}
    </div>
  );
}

function DaySeparator({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center gap-3 self-center text-[11px] text-muted before:h-0 before:flex-1 before:border-t before:border-dashed before:border-line-strong after:h-0 after:flex-1 after:border-t after:border-dashed after:border-line-strong">
      {children}
    </div>
  );
}

/** Customers › Tickets (`P.tickets`): the queue, the open conversation, and the customer. */
export function TicketsDemo({ title }: { title: string }) {
  const { t } = useLingui();
  const words = useStatusLabels();
  const { byId } = useAgents();
  const tickets: [string, string, string, AgentStatus, string][] = [
    ["TK-88", "Emma R.", t`Where is my order? #3152`, "waityou", "09:05"],
    ["TK-87", "Liam K.", t`Shipping address update`, "running", "08:50"],
    ["TK-86", "Sofia M.", t`Question about A3 print size`, "queued", "08:12"],
    ["TK-85", "Noah B.", t`Mug arrived cracked`, "waitext", t`Yesterday`],
  ];
  const dana = byId("dana").name;
  return (
    <DemoFrame title={title} layout="l3">
      <Panel>
        <PanelHeader
          title={<Trans>Tickets</Trans>}
          meta={<L>4</L>}
          actions={<CircleButton label={t`Filter`} icon={<FilterGlyph />} />}
        />
        <div className="min-h-0 overflow-auto px-2 pb-2">
          {tickets.map(([id, customer, subject, state, time], index) => (
            <ListItem
              key={id}
              name={<L>{customer}</L>}
              time={<L>{time}</L>}
              line={subject}
              selected={index === 0}
              foot={
                <div className="mt-1.5 flex justify-between">
                  <Status live status={state} label={words[state]} />
                  <span className="ltr text-caption text-muted">{id}</span>
                </div>
              }
            />
          ))}
        </div>
      </Panel>
      <Panel>
        <PanelHeader
          title={t`Where is my order? #3152`}
          actions={
            <span className="me-4">
              <Status live status="waityou" label={words.waityou} />
            </span>
          }
        />
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-6 pb-4">
          <DaySeparator>
            <Trans>Today</Trans>
          </DaySeparator>
          <Bubble
            meta={
              <>
                <L>Emma R.</L> · <L>09:05</L>
              </>
            }
          >
            <Trans>
              Hi, my order was supposed to ship 4 days ago and I have no tracking number. Can you
              check?
            </Trans>
          </Bubble>
          <Event>
            <Trans>Dana linked task T-2041</Trans> · <L>09:06</L>
          </Event>
          <Bubble
            me
            meta={
              <>
                {dana} · {t`Draft`}
              </>
            }
          >
            <Trans>
              Hi Emma, your print is ready and ships today. To make up for the delay we will refund
              15% — as soon as Tzvi approves.
            </Trans>
          </Bubble>
          <div
            className="inline-flex h-9 items-center gap-1 self-start rounded-[20px] bg-raised px-4"
            aria-hidden="true"
          >
            {[0, 1, 2].map((i) => (
              <i
                key={i}
                className="size-1.5 animate-[htco-typing_1.2s_infinite] rounded-pill bg-line-hover"
                style={{ animationDelay: `${String(i * 0.2)}s` }}
              />
            ))}
          </div>
        </div>
        <div className="mx-4 mb-4 flex h-14 shrink-0 items-center gap-2 rounded-pill border border-line-strong px-2">
          <CircleButton label={t`Attach`} icon={<ClipGlyph />} />
          <span className="flex-1 px-2 text-body text-muted">{t`Edit reply…`}</span>
          <InkDisc label={t`Send`}>
            <SendGlyph size={14} />
          </InkDisc>
        </div>
      </Panel>
      <Panel className="max-sm:hidden">
        <PanelHeader
          title={<Trans>Customer</Trans>}
          actions={<CircleButton label={t`Customers`} icon={<NextGlyph />} />}
        />
        <PanelBody className="justify-between gap-6">
          <IdBlock label={t`Customer:`} value={<L>Emma R.</L>} />
          <KV
            items={[
              [t`Orders`, <L key="a">3</L>],
              [t`Lifetime value`, <L key="b">$156</L>],
              [t`Customer since`, <L key="c">03.2025</L>],
              [t`Last order`, <L key="d">#3152</L>],
            ]}
          />
          <KV2
            items={[
              [
                t`Handled by:`,
                <>
                  <Dot tone="ink" />
                  {dana}
                </>,
              ],
              [
                t`Satisfaction:`,
                <>
                  <Dot tone="success" />
                  <L>4.8</L>
                </>,
              ],
            ]}
          />
        </PanelBody>
      </Panel>
    </DemoFrame>
  );
}

const CUSTOMERS = ["Emma R.", "Liam K.", "Sofia M.", "Noah B.", "Olivia P.", "Ava T."];
const COUNTRIES = ["US", "UK", "DE", "US", "CA", "AU"];
const ORDER_COUNTS = [3, 2, 1, 4, 2, 1];
const TOTALS = [156, 88, 42, 214, 96, 24];

/** The customers' health as the demo draws it (a customer store arrives with Phase 5). */
export function CustomerHealthPanel() {
  const { t } = useLingui();
  return (
    <Panel className="h-full w-full">
      <PanelHeader title={<Trans>Customers</Trans>} />
      <PanelBody className="justify-between gap-6">
        <IdBlock label={t`Active customers:`} value={<L>1,486</L>} />
        <KV
          items={[
            [t`New this month`, <L key="a">112</L>],
            [t`Returning`, <L key="b">31%</L>],
            [t`Avg. value`, <L key="c">$52</L>],
            [t`Open tickets`, <L key="d">4</L>],
          ]}
        />
        <Matrix
          k={4}
          top={t`Loyalty`}
          start={t`Frequency`}
          end={t`Value`}
          bottom={t`Recency`}
          value="74"
          caption={t`Healthy`}
        />
      </PanelBody>
    </Panel>
  );
}

/** Every customer as the demo draws it. */
export function AllCustomersPanel() {
  const { t } = useLingui();
  return (
    <Panel className="h-full w-full">
      <PanelHeader
        title={<Trans>All customers</Trans>}
        meta={<L>6</L>}
        actions={
          <span className="flex h-10 w-[220px] items-center gap-2 rounded-pill border border-line-strong px-3.5 text-body-sm text-muted max-md:hidden">
            <SearchIcon size={14} />
            {t`Search customer`}
          </span>
        }
      />
      <DataTable
        label={t`All customers`}
        ends={[2, 3]}
        phoneHidden={[1, 4, 5]}
        head={[t`Customer`, t`Country`, t`Orders`, t`Total`, t`Last order`, t`Shop`, t`Ticket`]}
        rows={CUSTOMERS.map((name, i) => ({
          key: name,
          cells: [
            <L key="n">{name}</L>,
            <L key="c">{COUNTRIES[i]}</L>,
            <L key="o">{ORDER_COUNTS[i]}</L>,
            <L key="t">${TOTALS[i]}</L>,
            <L key="l">#{3152 + i * 4}</L>,
            <L key="s">{i % 2 === 1 ? "HTZ Home" : "HTZ Prints"}</L>,
            i === 0 ? (
              <Status key="k" live status="waityou" label={<L>TK-88</L>} />
            ) : (
              <span key="k" className="text-muted">
                —
              </span>
            ),
          ],
        }))}
      />
    </Panel>
  );
}

/** Customers › Mail (`P.mail`): the inbox, the open message, and the assistant's notes. */
export function MailDemo({ title }: { title: string }) {
  const { t } = useLingui();
  const { byId } = useAgents();
  const lia = byId("lia");
  const mail: [string, string, string][] = [
    ["Etsy", t`Your weekly sales summary`, "07:00"],
    ["Printful", t`October invoice #4471`, "06:12"],
    ["Gelato", t`Quote: linen tea towels`, t`Yesterday`],
    ["Emma R.", t`Where is my order?`, t`Yesterday`],
  ];
  const notes = [
    t`Sales up 12% this week`,
    t`2 late orders need a reply`,
    t`Printful invoice matches orders`,
  ];
  return (
    <DemoFrame title={title} layout="l3">
      <Panel>
        <PanelHeader
          title={<Trans>Inbox</Trans>}
          meta={<L>4</L>}
          actions={<CircleButton label={t`Compose`} icon={<PlusGlyph />} />}
        />
        <div className="min-h-0 overflow-auto px-2 pb-2">
          {mail.map(([from, subject, time], index) => (
            <ListItem
              key={from}
              lead={<Avatar initial={from.slice(0, 1)} />}
              name={<L>{from}</L>}
              time={<L>{time}</L>}
              line={subject}
              selected={index === 0}
            />
          ))}
        </div>
      </Panel>
      <Panel>
        <PanelHeader
          title={t`Your weekly sales summary`}
          meta={<L>Etsy</L>}
          actions={<CircleButton label={t`More`} icon={<MoreIcon />} />}
        />
        <PanelBody className="gap-4 pt-2">
          <div className="max-w-[720px] rounded-card bg-raised p-4 text-body leading-relaxed">
            <Trans>
              Hello, the summary is attached. Lia (Owner Assistant) already filed it and flagged 2
              points to review.
            </Trans>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-3 rounded-card border border-line-strong py-2 ps-2 pe-3.5">
              <span className="flex size-12 items-center justify-center rounded-[12px] bg-raised">
                <DocGlyph size={20} />
              </span>
              <div>
                <div className="text-body-sm">
                  <L>summary.pdf</L>
                </div>
                <div className="text-[11px] text-muted">
                  <L>220 KB</L>
                </div>
              </div>
            </div>
          </div>
          <Event className="self-start">
            <Trans>Lia filed under Finance › Ledger</Trans> · <L>07:02</L>
          </Event>
        </PanelBody>
      </Panel>
      <Panel className="max-sm:hidden">
        <PanelHeader
          title={<Trans>Lia’s notes</Trans>}
          actions={<CircleButton label={t`Chat with Lia`} icon={<ChatIcon />} />}
        />
        <PanelBody className="justify-between gap-6">
          <div className="flex items-center justify-center gap-4">
            <Avatar initial={lia.name.slice(0, 1)} size="lg" ink />
            <div>
              <div className="text-caption font-light text-muted">{t`Agent:`}</div>
              <div className="font-display text-number-lg leading-[1.2] font-light">{lia.name}</div>
            </div>
          </div>
          <div>
            {notes.map((note, i) => (
              <ListRow
                key={note}
                lead={
                  i < 2 ? (
                    <span className="flex size-[18px] items-center justify-center rounded-pill border border-accent-mark">
                      <Dot tone="attention" />
                    </span>
                  ) : (
                    <span className="flex size-[18px] items-center justify-center rounded-pill bg-inverse text-on-inverse">
                      <CheckIcon size={10} />
                    </span>
                  )
                }
                title={<span className="text-body-sm">{note}</span>}
              />
            ))}
          </div>
          <KV2
            items={[
              [
                t`Filed in:`,
                <>
                  <Dot tone="ink" />
                  {t`Ledger`}
                </>,
              ],
              [
                t`Needs reply:`,
                <>
                  <Dot tone="attention" />
                  {t`No`}
                </>,
              ],
            ]}
          />
        </PanelBody>
      </Panel>
    </DemoFrame>
  );
}

/** Customers › Marketing (`P.marketing`): the active campaign, clicks per day, and the others. */
export function MarketingDemo({ title }: { title: string }) {
  const { t } = useLingui();
  const words = useStatusLabels();
  const { byId } = useAgents();
  const campaigns: [string, string, AgentStatus, string][] = [
    ["Q4-HOME", t`Holiday towels`, "idle", t`$3 / day`],
    ["EMAIL-10", t`October newsletter`, "queued", "1,486"],
  ];
  return (
    <DemoFrame title={title} layout="l3">
      <Panel>
        <PanelHeader
          title={<Trans>Active campaign</Trans>}
          actions={<CircleButton label={t`Settings`} icon={<GearIcon />} />}
        />
        <PanelBody className="justify-between gap-6">
          <IdBlock label={t`Campaign:`} value={<L>Q4-STAR</L>} />
          <KV
            items={[
              [t`Budget`, <L key="a">{t`$5 / day`}</L>],
              [t`ROAS`, <L key="b">3.4×</L>],
              [t`Clicks`, <L key="c">412</L>],
              [t`Sales`, <L key="d">18</L>],
            ]}
          />
          <KV2
            items={[
              [
                t`Owner:`,
                <>
                  <StatusGlyph live status="offline" />
                  {byId("gal").name}
                </>,
              ],
              [
                t`Channel:`,
                <>
                  <Dot tone="attention" />
                  <L>Etsy Ads</L>
                </>,
              ],
            ]}
          />
        </PanelBody>
      </Panel>
      <Panel>
        <PanelHeader title={<Trans>Clicks per day</Trans>} meta={<L>1–15.10</L>} />
        <PanelBody className="items-center justify-center">
          <DotColumns
            label={t`Clicks per day, 1 to 15 October: 18 to 41, highest today`}
            values={[18, 22, 25, 21, 30, 28, 33, 26, 31, 35, 29, 27, 34, 38, 41]}
            rows={14}
            highlight={14}
            pitch={12}
            gap={30}
            labels={["1", "", "", "", "5", "", "", "", "", "10", "", "", "", "", "15"]}
          />
        </PanelBody>
      </Panel>
      <Stack className="max-sm:hidden">
        {campaigns.map(([id, name, state, reach]) => (
          <Panel key={id}>
            <PanelHeader
              title={name}
              actions={<CircleButton label={t`Settings`} icon={<GearIcon />} />}
            />
            <PanelBody className="justify-between gap-4">
              <IdBlock label={t`Campaign:`} value={<L>{id}</L>} />
              <KV2
                items={[
                  [
                    t`Status:`,
                    <>
                      <StatusGlyph live status={state} />
                      {words[state]}
                    </>,
                  ],
                  [
                    t`Reach:`,
                    <>
                      <Dot tone="ink" />
                      <L>{reach}</L>
                    </>,
                  ],
                ]}
              />
            </PanelBody>
          </Panel>
        ))}
      </Stack>
    </DemoFrame>
  );
}
