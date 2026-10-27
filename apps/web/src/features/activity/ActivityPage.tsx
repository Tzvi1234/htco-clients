import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";

import { activityQuery, taskTrailQuery, type ActivityQuery, type ActivityRecord } from "./api.ts";
import { ApiError, meQuery, shopsQuery, useApi } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { PHONE_QUERY, useMediaQuery } from "../../shared/lib/useMediaQuery.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { WorkspacePicker, pickWorkspace } from "../../shared/ui/WorkspacePicker.tsx";
import {
  Aside,
  BackGlyph,
  CloseGlyph,
  DataTable,
  Figure,
  Figures,
  FilterChips,
  Flow,
  FlowBody,
  FlowRow,
  Focus,
  KV,
  N,
  Note,
  SectionLabel,
  Sep,
  Status,
  type AgentStatus,
} from "../../shared/ui/kit/index.ts";

/**
 * Work › Activity (platform slice 7.8): what the office did, from recorded activity only. Saved
 * views (today in the user's time zone, failed automations of the last 7 days, everything
 * recent), an actor filter taken from a record, the server's cursor for older records, and a
 * task's trail across actors. Every answer says where it comes from and when it was read; an
 * empty one says "no recorded activity", never that nothing happened.
 */
export type ActivityView = "today" | "failed" | "recent";

export interface ActivitySearch {
  workspace?: string;
  view?: ActivityView;
  actor?: string;
  task?: string;
}

const VIEWS: readonly ActivityView[] = ["today", "failed", "recent"];
const ACTOR = /^(user|employee|automation|advisor|system):[A-Za-z0-9][A-Za-z0-9_.:#/-]{0,199}$/;
const ID = /^[0-9a-f-]{36}$/;

export function activitySearch(search: Record<string, unknown>): ActivitySearch {
  const pick = (name: string, ok: (v: string) => boolean) => {
    const value = search[name];
    return typeof value === "string" && ok(value) ? { [name]: value } : {};
  };
  return {
    ...pick("workspace", () => true),
    ...pick("view", (v) => (VIEWS as readonly string[]).includes(v)),
    ...pick("actor", (v) => ACTOR.test(v)),
    ...pick("task", (v) => ID.test(v)),
  };
}

const WEEK_MS = 7 * 86_400_000;

/** The user's time zone and today's date in it (YYYY-MM-DD). */
function useToday(): { timezone: string; day: string } {
  const [today] = useState(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
    return { timezone, day };
  });
  return today;
}

export function ActivityPage() {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const ids = (me.data?.memberships ?? []).map((m) => m.organization_id);
  const search: ActivitySearch = useSearch({ strict: false });
  const navigate = useNavigate();
  const organizationId = pickWorkspace(ids, search.workspace ?? null);
  return (
    <>
      <PageHeader title={<Trans>Activity</Trans>} />
      <Flow>
        {ids.length > 1 ? (
          <div className="shrink-0 motion-safe:animate-enter">
            <WorkspacePicker
              ids={ids}
              value={organizationId ?? null}
              onChange={(id) => {
                void navigate({ to: "/work/activity", search: { workspace: id } });
              }}
            />
          </div>
        ) : null}
        {organizationId === undefined ? null : (
          <Log key={organizationId} organizationId={organizationId} search={search} />
        )}
      </Flow>
    </>
  );
}

function useWords() {
  const { t } = useLingui();
  const outcomes: Partial<Record<string, string>> = {
    succeeded: t({ message: "Succeeded", context: "activity outcome" }),
    failed: t({ message: "Failed", context: "activity outcome" }),
    denied: t({ message: "Denied", context: "activity outcome" }),
    pending: t({ message: "Pending", context: "activity outcome" }),
  };
  const kinds: Partial<Record<string, string>> = {
    user: t({ message: "Person", context: "actor kind" }),
    employee: t({ message: "AI employee", context: "actor kind" }),
    automation: t({ message: "Automation", context: "actor kind" }),
    advisor: t({ message: "Advisor", context: "actor kind" }),
    system: "HTCO",
  };
  return {
    outcome: (o: string) => outcomes[o] ?? o,
    kind: (k: string) => kinds[k] ?? k,
  };
}

// Never colour alone: the glyph's shape and the word. Orange (waityou) is kept for what needs
// him; a failure is the ink square, as an escalated incident.
const OUTCOME_GLYPH: Partial<Record<string, AgentStatus>> = {
  succeeded: "delivered",
  failed: "blocked",
  denied: "blocked",
  pending: "queued",
};

function Outcome({ outcome }: { outcome: string }) {
  const words = useWords();
  return <Status status={OUTCOME_GLYPH[outcome] ?? "idle"} label={words.outcome(outcome)} />;
}

/** "etsy-order-intake", or the employee's name; the user himself is "You". */
function useActorName(): (record: Pick<ActivityRecord, "actor" | "actor_kind">) => string {
  const { t } = useLingui();
  const me = useQuery(meQuery(useApi()));
  return ({ actor, actor_kind }) => {
    const id = actor.slice(actor.indexOf(":") + 1);
    if (actor_kind === "user") return id === me.data?.user_id ? t`You` : t`A team member`;
    if (actor_kind === "employee") return id.charAt(0).toUpperCase() + id.slice(1);
    if (actor_kind === "system") return "HTCO";
    return id;
  };
}

function useTime(): (iso: string) => string {
  const { locale } = useLocale();
  return (iso) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
}

function Log({ organizationId, search }: { organizationId: string; search: ActivitySearch }) {
  const { t } = useLingui();
  const api = useApi();
  const navigate = useNavigate();
  const phone = useMediaQuery(PHONE_QUERY);
  const today = useToday();
  const words = useWords();
  const actorName = useActorName();
  const time = useTime();
  const view = search.view ?? "today";
  // Pages walked so far; a change of view or actor starts again from the newest.
  const [cursors, setCursors] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  // Fixed when the screen opens, so the query key stays the same between renders.
  const [since] = useState(() => new Date(Date.now() - WEEK_MS).toISOString());
  const query: ActivityQuery = {
    timezone: today.timezone,
    actor: search.actor,
    ...(view === "today" ? { day: today.day } : {}),
    ...(view === "failed" ? { actorKind: "automation", outcome: "failed" } : {}),
    cursor: cursors.at(-1),
  };
  const sinceParam = view === "failed" ? since : undefined;
  const page = useQuery(activityQuery(api, organizationId, { ...query, since: sinceParam }));
  const shops = useQuery(shopsQuery(api, organizationId));
  const shopName = (id: string | null) =>
    id === null ? t`The whole workspace` : (shops.data?.find((s) => s.id === id)?.name ?? "–");

  const go = (changes: { [K in keyof ActivitySearch]?: ActivitySearch[K] | undefined }) => {
    setCursors([]);
    setSelected(undefined);
    void navigate({
      to: "/work/activity",
      search: (previous: ActivitySearch) => {
        const merged = { ...previous, ...changes };
        const next: ActivitySearch = {};
        for (const [key, value] of Object.entries(merged))
          if (typeof value === "string") Object.assign(next, { [key]: value });
        return next;
      },
      resetScroll: false,
    });
  };

  if (page.isError && page.data === undefined)
    return (
      <Panel>
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
        >
          <h2 className="m-0 font-display text-title-sm font-light">
            <Trans>Activity could not be loaded</Trans>
          </h2>
          <p className="m-0 max-w-[44ch] text-body-sm text-secondary">
            {page.error instanceof ApiError && page.error.status === 403 ? (
              <Trans>Your role does not include activity. Ask an Owner or Admin.</Trans>
            ) : (
              <Trans>The activity log is not answering. Check your connection and try again.</Trans>
            )}
          </p>
          {page.error instanceof ApiError && page.error.status === 403 ? null : (
            <Button variant="primary" size="lg" onPress={() => void page.refetch()}>
              <Trans>Try again</Trans>
            </Button>
          )}
        </div>
      </Panel>
    );

  const data = page.data;
  const items = data?.items ?? [];
  const failed = items.filter((r) => r.outcome === "failed" || r.outcome === "denied").length;
  const actors = new Set(items.map((r) => r.actor)).size;
  const more = data?.next_cursor !== null && data?.next_cursor !== undefined;
  const record = items.find((r) => r.id === selected);
  const only =
    search.actor === undefined
      ? undefined
      : actorName({ actor: search.actor, actor_kind: search.actor.split(":")[0] ?? "" });
  const viewLabels: Record<ActivityView, string> = {
    today: t`Today`,
    failed: t`Failed automations, 7 days`,
    recent: t`Everything recent`,
  };

  return (
    <>
      <Focus
        meta={
          data === undefined ? undefined : (
            <Trans>From recorded activity, read at {time(data.read_at)}</Trans>
          )
        }
        title={
          data === undefined ? (
            <Trans>Activity</Trans>
          ) : items.length === 0 ? (
            <Trans>No recorded activity</Trans>
          ) : more || cursors.length > 0 ? (
            <Trans>{items.length} records on this page</Trans>
          ) : (
            <Plural value={items.length} one="# record" other="# records" />
          )
        }
        lead={
          data === undefined ? undefined : items.length === 0 ? (
            <Trans>
              Nothing was recorded for this view. HTCO shows only what was recorded, never a guess.
            </Trans>
          ) : (
            <Trans>
              Every operation of the office leaves one record: who acted, what they did and how it
              ended. Choose one to see its details and its task.
            </Trans>
          )
        }
        figures={
          data === undefined ? (
            <Skeleton label={t`Loading activity…`} />
          ) : (
            <Figures label={t`Key figures`}>
              <Figure label={<Trans>Records</Trans>} value={<N>{items.length}</N>} />
              <Figure
                label={<Trans>Failed or denied</Trans>}
                value={<N>{failed}</N>}
                tone={failed > 0 ? "tertiary" : undefined}
              />
              <Figure label={<Trans>Actors</Trans>} value={<N>{actors}</N>} />
            </Figures>
          )
        }
      />
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <FilterChips
          label={t`Saved views`}
          value={view}
          onChange={(next) => {
            go({ view: next === "today" ? undefined : next });
          }}
          options={VIEWS.map((id) => ({ id, label: viewLabels[id] }))}
        />
        {only === undefined ? null : (
          <Button
            variant="ghost"
            size="sm"
            aria-label={t`Only ${only}, show every actor`}
            onPress={() => {
              go({ actor: undefined });
            }}
          >
            <Trans>Only {only}</Trans>
            <CloseGlyph size={12} />
          </Button>
        )}
      </div>
      <FlowRow layout="main-side">
        <Panel>
          <PanelHeader title={viewLabels[view]} meta={<Trans>Newest first</Trans>} />
          {data === undefined ? (
            <Skeleton rows={5} />
          ) : items.length === 0 ? (
            <Empty />
          ) : (
            <DataTable
              flow
              label={t`Activity records`}
              head={[t`When`, t`Who`, t`What happened`, t`Outcome`]}
              phoneHidden={[0, 1, 3]}
              rows={items.map((r) => ({
                key: r.id,
                selected: r.id === selected,
                onSelect: () => {
                  setSelected(r.id);
                },
                cells: [
                  <span key="when" className="tabular text-secondary">
                    {time(r.occurred_at)}
                  </span>,
                  <span key="who" className="flex min-w-0 flex-col">
                    <bdi className="block max-w-[180px] truncate">{actorName(r)}</bdi>
                    <span className="text-caption text-muted">{words.kind(r.actor_kind)}</span>
                  </span>,
                  <span key="what" className="flex min-w-0 flex-col">
                    <bdi className="block max-w-[420px] truncate text-body-sm max-sm:whitespace-normal">
                      {r.summary}
                    </bdi>
                    {phone ? (
                      <span className="text-caption text-secondary">
                        <bdi>{actorName(r)}</bdi>
                        <Sep />
                        {time(r.occurred_at)}
                        <Sep />
                        {words.outcome(r.outcome)}
                      </span>
                    ) : null}
                  </span>,
                  <Outcome key="outcome" outcome={r.outcome} />,
                ],
              }))}
            />
          )}
          {cursors.length > 0 || more ? (
            <div className="flex flex-wrap gap-2 px-6 pb-5">
              {cursors.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    setCursors([]);
                    setSelected(undefined);
                  }}
                >
                  <BackGlyph size={14} />
                  <Trans>Back to the newest</Trans>
                </Button>
              ) : null}
              {more ? (
                <Button
                  size="sm"
                  onPress={() => {
                    const next = data.next_cursor;
                    if (typeof next === "string") setCursors((c) => [...c, next]);
                    setSelected(undefined);
                  }}
                >
                  <Trans>Show older</Trans>
                </Button>
              ) : null}
            </div>
          ) : null}
        </Panel>
        <Aside>
          {search.task === undefined ? null : (
            <TaskTrail
              organizationId={organizationId}
              taskId={search.task}
              onClose={() => {
                go({ task: undefined });
              }}
            />
          )}
          {record === undefined ? (
            search.task === undefined ? (
              <Panel className="max-sm:hidden">
                <FlowBody className="gap-2 pt-6">
                  <p className="m-0 text-body-sm text-secondary">
                    <Trans>Choose a record to see who acted, its identifiers and its task.</Trans>
                  </p>
                </FlowBody>
              </Panel>
            ) : null
          ) : (
            <RecordPanel
              key={record.id}
              record={record}
              shopName={shopName}
              onlyActor={() => {
                go({ actor: record.actor });
              }}
              showTrail={(task) => {
                go({ task });
              }}
            />
          )}
        </Aside>
      </FlowRow>
    </>
  );
}

function Skeleton({ label, rows = 1 }: { label?: string; rows?: number }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-3 p-6 max-sm:p-4">
      {label === undefined ? null : <span className="text-caption text-muted">{label}</span>}
      {Array.from({ length: rows }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="h-9 rounded-pill bg-hover motion-safe:animate-pulse"
          style={{ width: `${String(100 - ((i * 13) % 35))}%` }}
        />
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <h3 className="m-0 font-display text-title-sm font-light">
        <Trans>Nothing recorded here</Trans>
      </h3>
      <p className="m-0 max-w-[46ch] text-body-sm text-pretty text-secondary">
        <Trans>Try another saved view, or every actor.</Trans>
      </p>
    </div>
  );
}

function RecordPanel({
  record,
  shopName,
  onlyActor,
  showTrail,
}: {
  record: ActivityRecord;
  shopName: (id: string | null) => string;
  onlyActor: () => void;
  showTrail: (task: string) => void;
}) {
  const heading = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const words = useWords();
  const actorName = useActorName();
  const time = useTime();
  // The panel takes focus when chosen, so keyboards, screen readers and phones arrive at it.
  useEffect(() => {
    const node = headingRef.current;
    if (node === null) return;
    node.focus({ preventScroll: true });
    if (typeof node.scrollIntoView === "function") node.scrollIntoView({ block: "nearest" });
  }, []);
  return (
    <Panel labelledBy={heading}>
      <FlowBody className="gap-5 pt-6">
        <div className="flex flex-col gap-2">
          <h2
            id={heading}
            ref={headingRef}
            tabIndex={-1}
            className="m-0 scroll-mt-28 font-display text-title-sm font-light text-pretty outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <bdi>{record.summary}</bdi>
          </h2>
          <Outcome outcome={record.outcome} />
        </div>
        <KV
          items={[
            [<Trans key="l">Who</Trans>, <bdi key="v">{actorName(record)}</bdi>],
            [<Trans key="l">Kind of actor</Trans>, words.kind(record.actor_kind)],
            [<Trans key="l">When</Trans>, time(record.occurred_at)],
            [<Trans key="l">Shop</Trans>, shopName(record.shop_id)],
          ]}
        />
        <div>
          <SectionLabel>
            <Trans>Identifiers</Trans>
          </SectionLabel>
          <dl className="m-0 flex flex-col gap-1.5">
            {(
              [
                ["action", record.action],
                ["correlation", record.correlation_id],
                ["causation", record.causation_id],
              ] as const
            ).map(([key, value]) =>
              value === null ? null : (
                <div key={key} className="flex items-baseline justify-between gap-4 text-body-sm">
                  <dt className="text-secondary">
                    {key === "action" ? (
                      <Trans>Action</Trans>
                    ) : key === "correlation" ? (
                      <Trans>Correlation</Trans>
                    ) : (
                      <Trans>Caused by</Trans>
                    )}
                  </dt>
                  <dd className="m-0 min-w-0 truncate">
                    <N className="font-mono text-caption">{value}</N>
                  </dd>
                </div>
              ),
            )}
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onPress={onlyActor}>
            <Trans>Only this actor</Trans>
          </Button>
          {record.task_id === null ? null : (
            <Button
              variant="primary"
              size="sm"
              onPress={() => {
                if (record.task_id !== null) showTrail(record.task_id);
              }}
            >
              <Trans>Show the task's trail</Trans>
            </Button>
          )}
        </div>
      </FlowBody>
    </Panel>
  );
}

function TaskTrail({
  organizationId,
  taskId,
  onClose,
}: {
  organizationId: string;
  taskId: string;
  onClose: () => void;
}) {
  const { t } = useLingui();
  const api = useApi();
  const trail = useQuery(taskTrailQuery(api, organizationId, taskId));
  // Opened from a record: the trail comes into view and takes focus (on phones it sits under
  // the list).
  const startRef = useRef<HTMLOListElement>(null);
  const loaded = trail.data !== undefined;
  useEffect(() => {
    const node = startRef.current;
    if (node === null) return;
    node.focus({ preventScroll: true });
    if (typeof node.scrollIntoView === "function") node.scrollIntoView({ block: "nearest" });
  }, [taskId, loaded]);
  const actorName = useActorName();
  const time = useTime();
  const words = useWords();
  return (
    <Panel label={t`Task trail`}>
      <PanelHeader
        title={<Trans>Task trail</Trans>}
        meta={<Trans>Oldest first</Trans>}
        actions={
          <Button variant="ghost" size="sm" aria-label={t`Close the trail`} onPress={onClose}>
            <CloseGlyph size={12} />
          </Button>
        }
      />
      <FlowBody className="gap-3">
        {trail.isPending ? (
          <Skeleton rows={3} />
        ) : trail.data === undefined ? (
          <Note>
            {trail.error instanceof ApiError && trail.error.status === 403 ? (
              <Trans>This task's trail is not available to you.</Trans>
            ) : (
              <Trans>The trail could not be loaded. Try again shortly.</Trans>
            )}
          </Note>
        ) : trail.data.items.length === 0 ? (
          <Note>
            <Trans>No recorded activity for this task.</Trans>
          </Note>
        ) : (
          <ol
            ref={startRef}
            tabIndex={-1}
            aria-label={t`Task trail`}
            className="m-0 flex scroll-mt-28 list-none flex-col p-0 outline-none"
          >
            {trail.data.items.map((r, index, all) => (
              <li
                key={r.id}
                className="relative flex flex-col gap-0.5 border-s border-line ps-4 pb-4 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className={
                    index === all.length - 1
                      ? "absolute -inset-s-[4.5px] top-1.5 size-2 rounded-pill border border-panel bg-tertiary"
                      : "absolute -inset-s-[4.5px] top-1.5 size-2 rounded-pill border border-panel bg-line-hover"
                  }
                />
                <bdi className="text-body-sm text-pretty">{r.summary}</bdi>
                <span className="text-caption text-secondary">
                  <bdi>{actorName(r)}</bdi>
                  <Sep />
                  {time(r.occurred_at)}
                  <Sep />
                  {words.outcome(r.outcome)}
                </span>
              </li>
            ))}
          </ol>
        )}
        {trail.data === undefined ? null : (
          <p className="m-0 text-caption text-muted">
            <Trans>From recorded activity, read at {time(trail.data.read_at)}</Trans>
          </p>
        )}
      </FlowBody>
    </Panel>
  );
}
