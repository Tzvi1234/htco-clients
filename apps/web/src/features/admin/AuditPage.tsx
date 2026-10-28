import { Trans, useLingui } from "@lingui/react/macro";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ApiError, meQuery, shopsQuery, useApi } from "../../shared/api/api.tsx";
import {
  auditLogQuery,
  type ActorKind,
  type AuditEntry,
  type AuditFilters,
} from "../../shared/api/audit.ts";
import { useCount } from "../../shared/i18n/format.ts";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Chip,
  DataTable,
  Figure,
  Figures,
  FilterChips,
  Flow,
  FlowBody,
  Focus,
  KV,
  LiveSkeleton,
  N,
  PillSelect,
  SectionLabel,
} from "../../shared/ui/kit/index.ts";
import { WorkspacePicker, pickWorkspace } from "../../shared/ui/WorkspacePicker.tsx";

import { Code, useAgo } from "./execution.tsx";

/** The action families the audit writer records (platform audit actions), as the API filters. */
const FAMILIES = [
  "membership",
  "shop",
  "orders",
  "relay",
  "automation",
  "job",
  "incident",
  "organization",
] as const;
type Family = (typeof FAMILIES)[number] | "all";

const RANGES = { day: 1, week: 7, month: 30 } as const;
type Range = keyof typeof RANGES | "all";

const DAY = 86_400_000;

/**
 * Admin › Audit log (AC-3.9.1, AC-3.9.3; platform PR #222): the organization's audit records,
 * newest first, for the Owner and Admins, filtered by shop, actor, action family and time, with
 * "Load more" for the next page. Read-only: nothing here changes a record. The server redacts
 * secrets, tokens and buyer data; the filters stay in this screen (never in the address) and the
 * records leave the cache when it closes.
 */
export function AuditPage() {
  const { t } = useLingui();
  const api = useApi();
  const me = useQuery(meQuery(api));
  const ids = (me.data?.memberships ?? []).map((m) => m.organization_id);
  const [chosen, setChosen] = useState<string | null>(null);
  const organizationId = pickWorkspace(ids, chosen);
  return (
    <>
      <PageHeader title={t`Audit log`} />
      <Flow>
        {ids.length > 1 ? (
          <div className="shrink-0 motion-safe:animate-enter">
            <WorkspacePicker ids={ids} value={chosen} onChange={setChosen} />
          </div>
        ) : null}
        {organizationId === undefined ? (
          ids.length > 1 ? (
            <p className="m-0 px-4 text-body-sm text-secondary">
              <Trans>Choose the workspace whose audit log you want to see.</Trans>
            </p>
          ) : (
            <Panel>
              <PanelHeader title={<Trans>Audit log</Trans>} />
              <LiveSkeleton rows={8} label={t`Loading the audit log`} />
            </Panel>
          )
        ) : (
          <WorkspaceAudit key={organizationId} organizationId={organizationId} />
        )}
      </Flow>
    </>
  );
}

function useActorKinds(): Record<ActorKind, string> {
  const { t } = useLingui();
  return {
    user: t`Person`,
    employee: t`AI employee`,
    automation: t`Automation`,
    advisor: t`Decision Advisor`,
    system: t`System`,
  };
}

function WorkspaceAudit({ organizationId }: { organizationId: string }) {
  const { t } = useLingui();
  const api = useApi();
  const count = useCount();
  const since = useAgo();
  const kinds = useActorKinds();
  const words: Partial<Record<string, string>> = kinds;
  const kindWord = (value: string) => words[value] ?? value;
  const shops = useQuery(shopsQuery(api, organizationId));
  const [shop, setShop] = useState<string>("all");
  const [kind, setKind] = useState<ActorKind | "all">("all");
  const [actor, setActor] = useState<string | undefined>(undefined);
  const [family, setFamily] = useState<Family>("all");
  // The window's start is fixed when it is chosen, so the pages of one view stay one query.
  const [range, setRange] = useState<{ id: Range; since?: string }>({ id: "all" });
  const [opened, setOpened] = useState<string | null>(null);

  const filters: AuditFilters = {
    ...(shop === "all" ? {} : { shopId: shop }),
    ...(kind === "all" ? {} : { actorKind: kind }),
    ...(actor === undefined ? {} : { actorId: actor }),
    ...(family === "all" ? {} : { action: `${family}.*` }),
    ...(range.since === undefined ? {} : { since: range.since }),
  };
  const filtered = Object.keys(filters).length > 0;
  const audit = useInfiniteQuery(auditLogQuery(api, organizationId, filters));
  const records = audit.data?.pages.flatMap((page) => page.items) ?? [];
  const chosen = records.find((record) => record.id === opened);
  const shopName = (id: string) => shops.data?.find((s) => s.id === id)?.name;

  const familyLabel: Record<Family, string> = {
    all: t`Every action`,
    membership: t`Members and roles`,
    shop: t`Shops and connections`,
    orders: t`Orders`,
    relay: t`Tracking relay`,
    automation: t`Automations`,
    job: t`Queue jobs`,
    incident: t`Incidents`,
    organization: t`Workspace`,
  };

  if (audit.isError) return <Problem error={audit.error} onRetry={() => void audit.refetch()} />;

  let list: ReactNode;
  if (audit.data === undefined) list = <LiveSkeleton rows={8} label={t`Loading the audit log`} />;
  else if (records.length === 0)
    list = (
      <p className="m-0 px-6 py-12 text-center text-body-sm text-secondary">
        {filtered ? t`No record matches these filters.` : t`Nothing has been recorded yet.`}
      </p>
    );
  else
    list = (
      <>
        <DataTable
          flow
          label={t`Audit records`}
          phoneHidden={[1, 3]}
          head={[t`When`, t`Actor`, t`Action`, t`Entity`]}
          rows={records.map((record) => ({
            key: record.id,
            selected: record.id === opened,
            onSelect: () => {
              setOpened(record.id === opened ? null : record.id);
            },
            cells: [
              <time key="t" dateTime={record.occurred_at}>
                {since(record.occurred_at)}
              </time>,
              <span key="a" className="inline-flex items-center gap-2">
                <span>{kindWord(record.actor_kind)}</span>
                <Code>{short(record.actor_id)}</Code>
              </span>,
              <Code key="c">{record.action}</Code>,
              <span key="e" className="inline-flex items-center gap-2">
                <Code>{record.entity_type}</Code>
                {record.entity_type === "shop" && shopName(record.entity_id) !== undefined ? (
                  <bdi>{shopName(record.entity_id)}</bdi>
                ) : (
                  <Code>{short(record.entity_id)}</Code>
                )}
              </span>,
            ],
          }))}
        />
        {audit.hasNextPage ? (
          <div className="flex justify-center px-6 pb-6">
            <Button isPending={audit.isFetchingNextPage} onPress={() => void audit.fetchNextPage()}>
              <Trans>Load more</Trans>
            </Button>
          </div>
        ) : null}
      </>
    );

  const newest = records[0];
  return (
    <>
      <Focus
        title={t`Who did what`}
        meta={<Trans>Read only · newest first</Trans>}
        lead={
          <Trans>
            Every change in this workspace, by people, AI employees and automations. Choose a record
            to see what it changed.
          </Trans>
        }
        figures={
          <Figures label={t`Audit numbers`}>
            <Figure
              label={<Trans>Records shown</Trans>}
              value={<N>{audit.data === undefined ? "…" : count(records.length)}</N>}
              {...(audit.hasNextPage ? { note: <Trans>more to load</Trans> } : {})}
            />
            <Figure
              label={<Trans>Newest</Trans>}
              value={
                <span className="text-title-lg">
                  {newest === undefined ? "—" : since(newest.occurred_at)}
                </span>
              }
            />
          </Figures>
        }
      />
      <Panel label={t`Audit filters`}>
        <FlowBody className="gap-4 pt-5">
          <div className="grid gap-4 md:grid-cols-3">
            <PillSelect
              label={t`Shop`}
              value={shop}
              onChange={(next) => {
                setShop(next);
                setOpened(null);
              }}
              options={[
                { id: "all", label: t`Every shop`, textValue: t`Every shop` },
                ...(shops.data ?? []).map((s) => ({
                  id: s.id,
                  label: <bdi>{s.name}</bdi>,
                  textValue: s.name,
                })),
              ]}
            />
            <PillSelect
              label={t`Actor`}
              value={kind}
              onChange={(next) => {
                setKind(next);
                setOpened(null);
              }}
              options={[
                { id: "all", label: t`Anyone`, textValue: t`Anyone` },
                ...(Object.keys(kinds) as ActorKind[]).map((id) => ({
                  id,
                  label: kinds[id],
                  textValue: kinds[id],
                })),
              ]}
            />
            <PillSelect
              label={t`Action`}
              value={family}
              onChange={(next) => {
                setFamily(next);
                setOpened(null);
              }}
              options={(["all", ...FAMILIES] as const).map((id) => ({
                id,
                label: familyLabel[id],
                textValue: familyLabel[id],
              }))}
            />
          </div>
          <FilterChips
            label={t`When`}
            value={range.id}
            onChange={(id) => {
              setRange(
                id === "all"
                  ? { id }
                  : { id, since: new Date(Date.now() - RANGES[id] * DAY).toISOString() },
              );
              setOpened(null);
            }}
            options={[
              { id: "day", label: <Trans>Last 24 hours</Trans> },
              { id: "week", label: <Trans>Last 7 days</Trans> },
              { id: "month", label: <Trans>Last 30 days</Trans> },
              { id: "all", label: <Trans>All time</Trans> },
            ]}
          />
          {actor === undefined ? null : (
            <div className="flex flex-wrap items-center gap-2">
              <Chip>
                <Trans>Actor</Trans> <Code>{short(actor)}</Code>
              </Chip>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => {
                  setActor(undefined);
                }}
              >
                <Trans>Show every actor</Trans>
              </Button>
            </div>
          )}
        </FlowBody>
      </Panel>
      <Panel label={t`Audit records`}>
        <PanelHeader title={<Trans>Records</Trans>} />
        {list}
      </Panel>
      {chosen === undefined ? null : (
        <AuditRecord
          record={chosen}
          kind={kindWord(chosen.actor_kind)}
          onActor={() => {
            setActor(chosen.actor_id);
            setOpened(null);
          }}
        />
      )}
    </>
  );
}

/** The first characters of a long ID, enough to tell records apart; the record shows all. */
function short(id: string): string {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}

/** One record: who, what, when, and its before and after as the server returned them. */
function AuditRecord({
  record,
  kind,
  onActor,
}: {
  record: AuditEntry;
  kind: string;
  onActor: () => void;
}) {
  const { t } = useLingui();
  const { locale } = useLocale();
  const when = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "medium" });
  return (
    <Panel label={t`Audit record`}>
      <PanelHeader title={<Code>{record.action}</Code>} />
      <FlowBody className="gap-5">
        <KV
          items={[
            [
              <Trans key="w">When</Trans>,
              <time key="wv" dateTime={record.occurred_at}>
                {when.format(new Date(record.occurred_at))}
              </time>,
            ],
            [<Trans key="k">Actor</Trans>, kind],
            [<Trans key="i">Actor ID</Trans>, <Code key="iv">{record.actor_id}</Code>],
            [
              <Trans key="e">Entity</Trans>,
              <Code key="ev">{`${record.entity_type} ${record.entity_id}`}</Code>,
            ],
            [
              <Trans key="c">Correlation ID</Trans>,
              <Code key="cv">{record.correlation_id ?? "—"}</Code>,
            ],
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Side label={<Trans>Before</Trans>} value={record.before} />
          <Side label={<Trans>After</Trans>} value={record.after} />
        </div>
        <div>
          <Button variant="secondary" onPress={onActor}>
            <Trans>Show only this actor's records</Trans>
          </Button>
        </div>
      </FlowBody>
    </Panel>
  );
}

function Side({ label, value }: { label: ReactNode; value: Record<string, unknown> | null }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <SectionLabel>{label}</SectionLabel>
      {value === null ? (
        <p className="m-0 text-body-sm text-muted">—</p>
      ) : (
        <pre
          dir="ltr"
          className="m-0 overflow-x-auto rounded-card border border-line bg-raised p-3 text-start font-mono text-caption whitespace-pre-wrap [overflow-wrap:anywhere]"
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}

function Problem({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useLingui();
  const status = error instanceof ApiError ? error.status : 0;
  return (
    <Panel>
      <PanelHeader title={<Trans>Audit log</Trans>} />
      <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <p className="m-0 max-w-[52ch] text-body-sm text-secondary">
          {status === 403
            ? t`Only the workspace Owner and Admins see the audit log.`
            : status === 503
              ? t`The audit log is not available on this server yet.`
              : t`The audit log could not be loaded. Try again shortly.`}
        </p>
        {status === 403 ? null : (
          <Button onPress={onRetry}>
            <Trans>Try again</Trans>
          </Button>
        )}
      </div>
    </Panel>
  );
}
