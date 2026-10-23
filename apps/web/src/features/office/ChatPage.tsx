import { useLingui } from "@lingui/react/macro";
import { useEffect, useRef, useState } from "react";

import { CONVERSATIONS } from "./data.ts";
import { RiskChip } from "../../shared/demo/AgentBits.tsx";
import { agent, dept, type AgentId } from "../../shared/demo/office.ts";
import { cx } from "../../shared/lib/cx.ts";
import { GearIcon, MoreIcon, SearchIcon } from "../../shared/ui/icons.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import { StarMapThumb } from "./thumbs.tsx";
import {
  Avatar,
  Card,
  Chip,
  CircleButton,
  ClipGlyph,
  DemoFrame,
  DocGlyph,
  Dot,
  DownloadGlyph,
  InkDisc,
  KV,
  KV2,
  ListRow,
  N,
  PILL,
  Pill,
  PlusGlyph,
  SendGlyph,
  Stack,
  Status,
  StatusGlyph,
  Typing,
  useStatusLabels,
} from "../../shared/ui/kit/index.ts";

/**
 * Office › Chat (Design 1C `P.chat`), a demo frame: conversations with the AI employees, the
 * thread with tool evidence, attachments and an approval card, and the agent beside it.
 */
export function ChatPage() {
  const { t } = useLingui();
  const [chat, setChat] = useState<AgentId>("maya");
  const c = agent(chat);
  return (
    <DemoFrame title={t(c.name)} views layout="l3">
      <Conversations chat={chat} onChat={setChat} />
      <Thread chat={chat} />
      <Stack className="max-sm:hidden">
        <AgentCard id={chat} />
        <Shared />
      </Stack>
    </DemoFrame>
  );
}

function Conversations({ chat, onChat }: { chat: AgentId; onChat: (id: AgentId) => void }) {
  const { t } = useLingui();
  return (
    <Panel className="office-chat-list">
      <PanelHeader
        title={t`Conversations`}
        meta={<N>8</N>}
        actions={<CircleButton label={t`New chat`} icon={<PlusGlyph />} />}
      />
      <div className="px-4 pb-2">
        <div className={cx(PILL, "h-10 w-full justify-start text-muted")}>
          <SearchIcon size={14} />
          {t`Search agents`}
        </div>
      </div>
      <ul className="k-scroll m-0 min-h-0 grow list-none px-2 pb-2" data-demo-view="">
        {CONVERSATIONS.map((item) => {
          const a = agent(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-current={chat === item.id ? "true" : undefined}
                className={cx("k-row k-accent", chat === item.id && "k-sel")}
                onClick={() => {
                  onChat(item.id);
                }}
              >
                <Avatar initial={t(a.name).charAt(0)} status={a.status} />
                <span className="k-grow">
                  <span className="k-nm">
                    <span>{t(a.name)}</span>
                    <small>
                      <N>{typeof item.at === "string" ? item.at : t(item.at)}</N>
                    </small>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="k-ln">{t(item.last)}</span>
                    {item.unread > 0 ? (
                      <span className={cx("k-cnt", a.status === "waityou" && "k-o")}>
                        {item.unread}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function Thread({ chat }: { chat: AgentId }) {
  const { t } = useLingui();
  const c = agent(chat);
  const thread = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = thread.current;
    if (el !== null) el.scrollTop = el.scrollHeight;
  }, [chat]);
  const name = t(c.name);
  return (
    <Panel className="office-thread">
      <PanelHeader
        title={
          <>
            {name} · <span className="font-light text-muted">{t(c.role)}</span>
          </>
        }
        actions={
          <>
            <Status status={c.status} live />
            <span className="w-3" />
            <CircleButton label={t`More`} icon={<MoreIcon />} />
          </>
        }
      />
      {/* Focusable so the conversation scrolls from the keyboard too. */}
      <div
        className="k-thread"
        ref={thread}
        key={chat}
        role="log"
        tabIndex={0}
        aria-label={t`Conversation with ${name}`}
      >
        <div className="k-daysep">{t`Today`}</div>
        {chat === "maya" ? <MayaThread /> : <ShortThread chat={chat} />}
      </div>
      <div className="k-composer">
        <CircleButton label={t`Attach`} icon={<ClipGlyph />} />
        <input dir="auto" aria-label={t`Message ${name}`} placeholder={t`Message ${name}…`} />
        <InkDisc label={t`Send`} accent>
          <SendGlyph size={14} />
        </InkDisc>
      </div>
    </Panel>
  );
}

function MayaThread() {
  const { t } = useLingui();
  const maya = t`Maya`;
  return (
    <>
      <div className="k-msg">
        <div className="k-meta">
          {maya} · <N>09:12</N>
        </div>
        <div className="k-bub">{t`Good morning Tzvi. Overnight order intake is done — here is what I found.`}</div>
      </div>
      <div className="k-msg">
        <Card className="k-tool">
          <div className="k-hd">
            <span>{t`Tool call · evidence`}</span>
            <span>
              {t`source:`} <span className="k-code">etsy.order_intake</span> · <N>07:58</N>
            </span>
          </div>
          <div className="k-big">
            <b className="font-display">
              <N>37</N>
            </b>
            <span>{t`orders checked in Etsy`}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Chip>
              <Dot tone="attention" />
              {t`2 late`} · <N>#3152 · #3160</N>
            </Chip>
            <Button>{t`View evidence`}</Button>
          </div>
        </Card>
      </div>
      <div className="k-msg k-me">
        <div className="k-meta">
          {t`Tzvi`} · <N>09:13</N>
        </div>
        <div className="k-bub">{t`Which ones are late? Can we do something for the customers?`}</div>
      </div>
      <div className="k-msg">
        <div className="k-meta">
          {maya} · <N>09:14</N>
        </div>
        <div className="k-bub">
          {t`#3152 (Emma R.) and #3160 (Liam K.) — a print delay at the supplier. I suggest a 15% partial refund on #3152, it is 4 days late.`}
        </div>
      </div>
      <div className="k-msg">
        <div className="k-att">
          <div className="k-attc">
            <div className="k-th">
              <StarMapThumb size={48} />
            </div>
            <div>
              <div className="k-fn">
                <N>star-map-3152.png</N>
              </div>
              <div className="k-fs">
                {t`Listing image`} · <N>1.2 MB</N>
              </div>
            </div>
          </div>
          <div className="k-attc">
            <div className="k-th flex items-center justify-center bg-raised">
              <DocGlyph size={20} />
            </div>
            <div>
              <div className="k-fn">
                <N>late-orders-oct15.csv</N>
              </div>
              <div className="k-fs">
                {t`2 rows`} · <N>4 KB</N>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="k-msg">
        <Card raised className="k-apc">
          <div className="flex items-center justify-between">
            <span className="k-lb">{t`Approval request`}</span>
            <span className="k-lb">
              <N>AP-118</N>
            </span>
          </div>
          <div className="k-id font-display">
            {t`Partial refund`} <N>$7.20</N>
          </div>
          <div className="text-body-sm">
            {t`Order`} <N>#3152</N> · <N>Emma R.</N> · {t`15% of $48.00`}
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col items-start gap-1.5">
              <RiskChip risk="low" />
              <Chip>
                {t`Policy`} <span className="k-code">refunds.partial ≤ $20</span>
              </Chip>
            </div>
            <div className="flex gap-1.5">
              <Button size="lg">{t`Reject`}</Button>
              <Button variant="primary" size="lg">
                {t`Approve`}
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <div className="k-msg">
        <div className="k-meta">{t`${maya} is typing…`}</div>
        <Typing label={t`${maya} is typing…`} />
      </div>
    </>
  );
}

function ShortThread({ chat }: { chat: AgentId }) {
  const { t } = useLingui();
  const c = agent(chat);
  const item = CONVERSATIONS.find((x) => x.id === chat);
  if (item === undefined) return null;
  return (
    <>
      <div className="k-msg">
        <div className="k-meta">
          {t(c.name)} · <N>{typeof item.at === "string" ? item.at : t(item.at)}</N>
        </div>
        <div className="k-bub">{t(item.last)}</div>
      </div>
      <div className="k-msg">
        <Card className="k-tool">
          <div className="k-hd">
            <span>{t`Current task`}</span>
            <Status status={c.status} live />
          </div>
          <div className="mt-2 text-[15px]">{t(c.task)}</div>
        </Card>
      </div>
    </>
  );
}

export function AgentCard({ id, title }: { id: AgentId; title?: string }) {
  const { t } = useLingui();
  const statusLabels = useStatusLabels();
  const a = agent(id);
  return (
    <Panel>
      <PanelHeader
        title={<N>{title ?? "Claude · agent-worker"}</N>}
        actions={<CircleButton label={t`Agent settings`} icon={<GearIcon />} />}
      />
      <PanelBody className="justify-between">
        <div className="flex items-center justify-center gap-4">
          <Avatar initial={t(a.name).charAt(0)} size="lg" ink />
          <div className="text-start">
            <div className="text-caption font-light text-muted">{t`Agent:`}</div>
            <div className="font-display text-number-lg leading-tight font-light">{t(a.name)}</div>
          </div>
        </div>
        <div className="text-center text-body-sm">{t(a.role)}</div>
        <KV
          items={[
            [t`Department`, t(dept(a.dept).name)],
            [t`Spent today`, <N key="spent">$0.84</N>],
          ]}
        />
        <KV2
          items={[
            [
              t`Status:`,
              <Pill wide key="status">
                <StatusGlyph status={a.status} live />
                {statusLabels[a.status]}
              </Pill>,
            ],
            [
              t`Autonomy:`,
              <Pill wide key="autonomy">
                <Dot tone="attention" />
                {t`Asks first`}
              </Pill>,
            ],
          ]}
        />
      </PanelBody>
    </Panel>
  );
}

function Shared() {
  const { t } = useLingui();
  const items = [
    { icon: "doc", name: "late-orders-oct15.csv", kind: t`File`, size: "4 KB" },
    { icon: "thumb", name: "star-map-3152.png", kind: t`File`, size: "1.2 MB" },
    { icon: "search", name: "etsy.order_intake", kind: t`Evidence`, size: "07:58" },
  ] as const;
  return (
    <Panel>
      <PanelHeader title={t`Shared in this chat`} meta={<N>3</N>} />
      <PanelBody className="pt-0">
        {items.map((item) => (
          <ListRow
            key={item.name}
            lead={
              <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-line bg-raised">
                {item.icon === "doc" ? (
                  <DocGlyph size={14} />
                ) : item.icon === "search" ? (
                  <SearchIcon size={14} />
                ) : (
                  <StarMapThumb size={28} />
                )}
              </span>
            }
            title={<N className="text-body-sm">{item.name}</N>}
            line={
              <>
                {item.kind} · <N>{item.size}</N>
              </>
            }
            end={<DownloadGlyph size={14} />}
          />
        ))}
      </PanelBody>
    </Panel>
  );
}
