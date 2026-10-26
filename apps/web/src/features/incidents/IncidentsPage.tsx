import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState, type RefObject } from "react";

import {
  incidentKeys,
  incidentQuery,
  incidentsQuery,
  moveIncident,
  type Evidence,
  type HistoryEntry,
  type IncidentDetail,
  type IncidentSummary,
  type Step,
} from "./api.ts";
import { IncidentState, SEVERITY_RANK, Severity, useIncidentWords } from "./IncidentState.tsx";
import { useNow } from "../../shared/lib/time.ts";
import { FormAlert } from "../../shared/ui/FormAlert.tsx";
import { ApiError, meQuery, shopsQuery, useApi } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { PHONE_QUERY, useMediaQuery } from "../../shared/lib/useMediaQuery.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { ArrowEndIcon, ArrowStartIcon } from "../../shared/ui/icons.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { WorkspacePicker, pickWorkspace } from "../../shared/ui/WorkspacePicker.tsx";
import {
  Aside,
  CheckGlyph,
  DataTable,
  Figure,
  Figures,
  Flow,
  FlowBody,
  FlowRow,
  Focus,
  KV,
  N,
  Note,
  SectionLabel,
  Sep,
  SubTabs,
  TabPanel,
} from "../../shared/ui/kit/index.ts";

/**
 * Commerce › Incidents, the incident center (platform slice 6.5), in the clarity layout: the
 * focus says how many incidents are open, the oldest and the urgent ones, with "open the most
 * urgent"; then the incidents in sub-tabs (open, resolved, all) beside the chosen one's
 * evidence, timeline, related order and the steps the user may take. The server decides every
 * step (`next_states`, `can_update`); nobody resolves an incident by hand, it resolves on
 * evidence only. `/incidents/{id}` opens one, the way a notification links to it.
 */
export function IncidentsPage() {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const ids = (me.data?.memberships ?? []).map((m) => m.organization_id);
  const search: { workspace?: string } = useSearch({ strict: false });
  const navigate = useNavigate();
  // The address owns the workspace (Quill's review of #48): `/incidents` and `/incidents/{id}`
  // are one route that never remounts, so a link from another workspace's notification, or a
  // switch here, must not meet a choice kept from before. A switch leaves the open incident.
  const organizationId = pickWorkspace(ids, search.workspace ?? null);
  const switchTo = (id: string) => {
    void navigate({
      to: "/incidents/{-$incidentId}",
      params: { incidentId: undefined },
      search: { workspace: id },
    });
  };
  return (
    <>
      <PageHeader title={<Trans>Incidents</Trans>} />
      <Flow>
        {ids.length > 1 ? (
          <div className="shrink-0 motion-safe:animate-enter">
            <WorkspacePicker ids={ids} value={organizationId ?? null} onChange={switchTo} />
          </div>
        ) : null}
        {organizationId === undefined ? null : (
          <Center key={organizationId} organizationId={organizationId} />
        )}
      </Flow>
    </>
  );
}

type Tab = "open" | "resolved" | "all";

const HOUR = 3_600_000;

/** "3 d", "5 h", "12 min": how long something has been open, in the largest whole unit. */
function useAge(): (iso: string, now: number) => string {
  const { t } = useLingui();
  return (iso, now) => {
    const ms = Math.max(0, now - Date.parse(iso));
    if (ms >= 24 * HOUR) {
      const days = Math.floor(ms / (24 * HOUR));
      return t({ message: `${String(days)} d`, context: "age in days" });
    }
    if (ms >= HOUR) {
      const hours = Math.floor(ms / HOUR);
      return t({ message: `${String(hours)} h`, context: "age in hours" });
    }
    const minutes = Math.max(1, Math.floor(ms / 60_000));
    return t({ message: `${String(minutes)} min`, context: "age in minutes" });
  };
}

function useDateTime(): (iso: string) => string {
  const { locale } = useLocale();
  return (iso) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
}

/** The most urgent open incident: the highest severity, then the oldest. */
function mostUrgent(items: readonly IncidentSummary[]): IncidentSummary | undefined {
  return [...items].sort(
    (a, b) =>
      (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9) ||
      Date.parse(a.detected_at) - Date.parse(b.detected_at),
  )[0];
}

function Center({ organizationId }: { organizationId: string }) {
  const { t } = useLingui();
  const api = useApi();
  const navigate = useNavigate();
  const params: { incidentId?: string } = useParams({ strict: false });
  const selected = params.incidentId;
  const [tab, setTab] = useState<Tab>("open");
  const tabs = useId();
  const open = useQuery(incidentsQuery(api, organizationId, "open"));
  const all = useQuery({ ...incidentsQuery(api, organizationId, "all"), enabled: tab !== "open" });
  const shops = useQuery(shopsQuery(api, organizationId));
  const shopName = (id: string | null) =>
    id === null ? undefined : shops.data?.find((shop) => shop.id === id)?.name;
  const now = useNow(60_000);
  const age = useAge();
  // The detail takes focus when the user picks an incident, so keyboards and screen readers
  // (and phones, where it sits under the list) arrive at it.
  const focusDetailRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  // Phones: the detail sits under the list; this takes him back to it (Pixel's review of #48).
  const backToList = () => {
    const list = listRef.current;
    if (list === null) return;
    list.focus({ preventScroll: true });
    if (typeof list.scrollIntoView === "function") list.scrollIntoView({ block: "start" });
  };

  const choose = (id: string) => {
    focusDetailRef.current = true;
    void navigate({
      to: "/incidents/{-$incidentId}",
      params: { incidentId: id },
      search: (previous: { workspace?: string }) => previous,
      // The page stays where it is; the detail takes focus and scrolls itself into view.
      resetScroll: false,
    });
  };

  if (open.isError)
    return (
      <Panel>
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
        >
          <h2 className="m-0 font-display text-title-sm font-light">
            <Trans>Incidents could not be loaded</Trans>
          </h2>
          <p className="m-0 max-w-[44ch] text-body-sm text-secondary">
            {open.error instanceof ApiError && open.error.status === 403 ? (
              <Trans>Your role does not include incidents. Ask an Owner or Admin.</Trans>
            ) : (
              <Trans>
                The incident center is not answering. Check your connection and try again.
              </Trans>
            )}
          </p>
          {open.error instanceof ApiError && open.error.status === 403 ? null : (
            <Button variant="primary" size="lg" onPress={() => void open.refetch()}>
              <Trans>Try again</Trans>
            </Button>
          )}
        </div>
      </Panel>
    );

  const openItems = open.data?.items ?? [];
  // More than the pages read: the figures say "more than", never a false total.
  const more = open.data?.more === true;
  const items =
    tab === "open"
      ? open.data?.items
      : tab === "resolved"
        ? all.data?.items.filter((incident) => !incident.is_open)
        : all.data?.items;
  const loading = tab === "open" ? open.isPending : all.isPending;
  const urgent = openItems.filter((i) => i.severity === "high" || i.severity === "critical");
  const oldest = openItems.reduce<string | undefined>(
    (first, i) => (first === undefined || i.detected_at < first ? i.detected_at : first),
    undefined,
  );
  const next = mostUrgent(openItems);
  const resolvedCount = all.data?.items.filter((incident) => !incident.is_open).length;

  return (
    <>
      <Focus
        meta={
          tab !== "open" && resolvedCount !== undefined ? (
            <Plural value={resolvedCount} one="# resolved so far" other="# resolved so far" />
          ) : undefined
        }
        title={
          open.isPending ? (
            <Trans>Incident center</Trans>
          ) : openItems.length === 0 ? (
            <Trans>Nothing is open</Trans>
          ) : more ? (
            <Trans>More than {openItems.length} open incidents</Trans>
          ) : (
            <Plural value={openItems.length} one="# open incident" other="# open incidents" />
          )
        }
        lead={
          open.isPending ? undefined : tab === "resolved" ? (
            <Trans>
              Resolved incidents closed themselves when the evidence arrived. Open one to see what
              closed it.
            </Trans>
          ) : openItems.length === 0 ? (
            <Trans>
              Incidents open on their own when an order misses its shipping window or an automation
              gives up, and close themselves once the evidence arrives.
            </Trans>
          ) : urgent.length > 0 ? (
            <Plural
              value={urgent.length}
              one="One is high or critical: start there. Incidents close themselves once the evidence arrives, such as tracking found in Etsy."
              other="# are high or critical: start with the most urgent. Incidents close themselves once the evidence arrives, such as tracking found in Etsy."
            />
          ) : (
            <Trans>
              None is high or critical. Incidents close themselves once the evidence arrives, such
              as tracking found in Etsy.
            </Trans>
          )
        }
        figures={
          open.isPending ? (
            <FocusSkeleton label={t`Loading incidents…`} />
          ) : (
            <Figures label={t`Key figures`}>
              <Figure
                label={<Trans>Open</Trans>}
                value={
                  <N>
                    {openItems.length}
                    {more ? "+" : ""}
                  </N>
                }
              />
              <Figure
                label={<Trans>Oldest open</Trans>}
                value={oldest === undefined ? "–" : age(oldest, now)}
              />
              <Figure
                label={<Trans>High or critical</Trans>}
                value={<N>{urgent.length}</N>}
                tone={urgent.length > 0 ? "tertiary" : undefined}
              />
            </Figures>
          )
        }
        aside={open.isPending ? undefined : <ByState items={openItems} />}
        actions={
          next === undefined ? undefined : (
            <Button
              variant="primary"
              size="lg"
              onPress={() => {
                choose(next.id);
              }}
            >
              <Trans>Open the most urgent</Trans>
              <ArrowEndIcon size={14} />
            </Button>
          )
        }
      />
      <SubTabs
        label={t`Incidents`}
        idBase={tabs}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "open", label: <Trans>Open</Trans>, count: open.data?.items.length },
          { id: "resolved", label: <Trans>Resolved</Trans> },
          { id: "all", label: <Trans>All</Trans> },
        ]}
      />
      <TabPanel idBase={tabs} tab={tab}>
        <FlowRow layout="main-side">
          {all.isError && tab !== "open" ? (
            <Panel>
              <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <p className="m-0 text-body-sm text-secondary">
                  <Trans>These incidents could not be loaded. Try again shortly.</Trans>
                </p>
                <Button onPress={() => void all.refetch()}>
                  <Trans>Try again</Trans>
                </Button>
              </div>
            </Panel>
          ) : loading || items === undefined ? (
            <Panel>
              {/* The focus names what is loading; the list only shows its shape. */}
              <FocusSkeleton rows={4} />
            </Panel>
          ) : items.length === 0 ? (
            <EmptyList tab={tab} />
          ) : (
            <IncidentList
              listRef={listRef}
              tab={tab}
              items={items}
              selected={selected}
              onSelect={choose}
              shopName={shopName}
              ageOf={(iso) => age(iso, now)}
            />
          )}
          <Aside>
            {selected === undefined ? (
              <Panel className="max-sm:hidden">
                <FlowBody className="gap-2 pt-6">
                  <p className="m-0 text-body-sm text-secondary">
                    <Trans>
                      Choose an incident to see its evidence, its timeline and its order.
                    </Trans>
                  </p>
                </FlowBody>
              </Panel>
            ) : (
              <IncidentDetailPanel
                key={selected}
                organizationId={organizationId}
                id={selected}
                shopName={shopName}
                focusOnLoadRef={focusDetailRef}
                onBack={backToList}
              />
            )}
          </Aside>
        </FlowRow>
      </TabPanel>
    </>
  );
}

/**
 * The focus's inline end (desktop): where the open incidents stand, one line per state with its
 * glyph, word and count. Nothing when none is open.
 */
function ByState({ items }: { items: readonly IncidentSummary[] }) {
  const { t } = useLingui();
  const counts = new Map<string, number>();
  for (const incident of items) counts.set(incident.state, (counts.get(incident.state) ?? 0) + 1);
  if (counts.size === 0) return null;
  return (
    <ul
      aria-label={t`Open incidents by state`}
      className="m-0 flex w-56 list-none flex-col gap-2 p-0"
    >
      {[...counts].map(([state, count]) => (
        <li key={state} className="flex items-center justify-between gap-4 text-body-sm">
          <IncidentState state={state} />
          <N>{count}</N>
        </li>
      ))}
    </ul>
  );
}

/** Loading: quiet bars in the shape of what is coming, named for screen readers. */
function FocusSkeleton({ label, rows = 1 }: { label?: string; rows?: number }) {
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

function EmptyList({ tab }: { tab: Tab }) {
  return (
    <Panel>
      <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
        <span aria-hidden="true" className="mb-1 text-success-text">
          <CheckGlyph size={22} />
        </span>
        <h3 className="m-0 font-display text-title-sm font-light">
          {tab === "open" ? (
            <Trans>No open incidents</Trans>
          ) : tab === "resolved" ? (
            <Trans>No resolved incidents yet</Trans>
          ) : (
            <Trans>No incidents yet</Trans>
          )}
        </h3>
        <p className="m-0 max-w-[46ch] text-body-sm text-pretty text-secondary">
          <Trans>
            When an order goes without tracking past its shipping window, or an automation gives up,
            the incident appears here on its own.
          </Trans>
        </p>
      </div>
    </Panel>
  );
}

function IncidentList({
  listRef,
  tab,
  items,
  selected,
  onSelect,
  shopName,
  ageOf,
}: {
  listRef: RefObject<HTMLDivElement | null>;
  tab: Tab;
  items: readonly IncidentSummary[];
  selected: string | undefined;
  onSelect: (id: string) => void;
  shopName: (id: string | null) => string | undefined;
  ageOf: (iso: string) => string;
}) {
  const { t } = useLingui();
  const words = useIncidentWords();
  const phone = useMediaQuery(PHONE_QUERY);
  const title =
    tab === "open"
      ? t`Open incidents`
      : tab === "resolved"
        ? t`Resolved incidents`
        : t`All incidents`;
  return (
    <Panel>
      <div ref={listRef} tabIndex={-1} className="scroll-mt-28 outline-none" aria-label={title}>
        <PanelHeader title={title} meta={<Trans>Newest first</Trans>} />
      </div>
      <DataTable
        flow
        label={t`Incidents`}
        head={[t`Incident`, t`Severity`, t`Shop`, t`Age`, t`State`]}
        phoneHidden={[2, 3]}
        rows={items.map((incident) => {
          const shop = shopName(incident.shop_id) ?? "–";
          const since = ageOf(incident.detected_at);
          return {
            key: incident.id,
            selected: incident.id === selected,
            onSelect: () => {
              onSelect(incident.id);
            },
            cells: [
              <span key="cause" className="flex min-w-0 flex-col">
                <span className="truncate text-body-sm">{words.cause(incident.cause)}</span>
                {phone ? (
                  <span className="truncate text-caption text-secondary">
                    {shop}
                    <Sep />
                    {since}
                  </span>
                ) : incident.receipt_id === null ? null : (
                  <span className="text-caption text-muted">
                    <N>#{incident.receipt_id}</N>
                  </span>
                )}
              </span>,
              <Severity key="severity" severity={incident.severity} />,
              <span key="shop" className="block max-w-[180px] truncate">
                {shop}
              </span>,
              <span key="age" className="tabular">
                {since}
              </span>,
              <IncidentState key="state" state={incident.state} />,
            ],
          };
        })}
      />
    </Panel>
  );
}

/** Who took a step: you, a team member, an automation or HTCO itself. */
function useActor(): (entry: HistoryEntry) => string {
  const { t } = useLingui();
  const me = useQuery(meQuery(useApi()));
  return (entry) => {
    if (entry.actor_kind === "user")
      return entry.actor_id === me.data?.user_id ? t`You` : t`A team member`;
    if (entry.actor_kind === "automation") return t`An automation`;
    if (entry.actor_kind === "agent") return t`An AI employee`;
    return "HTCO";
  };
}

/** What a refused step means, in words (each 409 its own; 403 for a role that may not). */
function useStepProblem(): (error: unknown) => string {
  const { t } = useLingui();
  return (error) => {
    const type = error instanceof ApiError ? error.type : undefined;
    if (type === "illegal-incident-step")
      return t`This step is no longer possible from the incident's current state. It has been reloaded with the steps it allows now.`;
    if (type === "evidence-required")
      return t`An incident closes only on evidence, such as tracking found in Etsy. Nothing was changed.`;
    if (type === "incident-moved")
      return t`This incident changed while you were looking at it. It has been reloaded: check its state, then try again.`;
    if (error instanceof ApiError && error.status === 403)
      return t`Your role can see incidents but not move them. Ask an Owner or Admin.`;
    return t`The step could not be saved. Check your connection and try again.`;
  };
}

function IncidentDetailPanel({
  organizationId,
  id,
  shopName,
  focusOnLoadRef,
  onBack,
}: {
  organizationId: string;
  id: string;
  shopName: (id: string | null) => string | undefined;
  focusOnLoadRef: RefObject<boolean>;
  onBack: () => void;
}) {
  const phone = useMediaQuery(PHONE_QUERY);
  const { t } = useLingui();
  const api = useApi();
  const client = useQueryClient();
  const words = useIncidentWords();
  const actor = useActor();
  const when = useDateTime();
  const problem = useStepProblem();
  const heading = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const incident = useQuery(incidentQuery(api, organizationId, id));
  const [moved, setMoved] = useState<string | null>(null);
  const move = useMutation({
    mutationFn: (step: Step) => moveIncident(api, organizationId, id, step),
    onMutate: () => {
      setMoved(null);
    },
    onSuccess: (after) => {
      client.setQueryData(incidentKeys.one(organizationId, id), after);
      setMoved(words.state(after.state));
      void client.invalidateQueries({ queryKey: ["incidents", organizationId, "list"] });
    },
    onError: (error) => {
      // The incident is not what the screen showed: show what it is now.
      if (
        error instanceof ApiError &&
        (error.type === "illegal-incident-step" || error.type === "incident-moved")
      )
        void client.invalidateQueries({ queryKey: incidentKeys.one(organizationId, id) });
    },
  });

  const data = incident.data;
  useEffect(() => {
    if (data === undefined || !focusOnLoadRef.current) return;
    focusOnLoadRef.current = false;
    // After the route change has settled: focus the heading and bring it into view under the
    // sticky top bar (on phones the detail sits below the list).
    const frame = requestAnimationFrame(() => {
      const heading = headingRef.current;
      if (heading === null) return;
      heading.focus({ preventScroll: true });
      // Test environments may have no scrolling at all.
      if (typeof heading.scrollIntoView === "function") heading.scrollIntoView({ block: "start" });
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [data, focusOnLoadRef]);

  if (incident.isPending)
    return (
      <Panel label={t`Incident`}>
        <FocusSkeleton label={t`Loading the incident…`} rows={3} />
      </Panel>
    );
  // Denied on the latest answer, whatever is cached: a refetch that answers 403 or 404 (access
  // removed, another workspace) never keeps showing the incident (Sage's security review of #48).
  const refused =
    incident.error instanceof ApiError &&
    (incident.error.status === 403 || incident.error.status === 404);
  if (data === undefined || refused)
    return (
      <Panel label={t`Incident`}>
        <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="m-0 text-body-sm text-secondary">
            {refused ? (
              <Trans>This incident is not available to you.</Trans>
            ) : (
              <Trans>The incident could not be loaded. Try again shortly.</Trans>
            )}
          </p>
          {refused ? null : (
            <Button onPress={() => void incident.refetch()}>
              <Trans>Try again</Trans>
            </Button>
          )}
        </div>
      </Panel>
    );

  return (
    <Panel labelledBy={heading}>
      <FlowBody className="gap-6 pt-6">
        <div className="flex flex-col gap-2">
          {phone ? (
            <Button variant="ghost" size="sm" className="self-start" onPress={onBack}>
              <ArrowStartIcon size={14} />
              <Trans>Back to list</Trans>
            </Button>
          ) : null}
          <h2
            id={heading}
            ref={headingRef}
            tabIndex={-1}
            className="m-0 scroll-mt-28 font-display text-title-sm font-light outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            {words.cause(data.cause)}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Severity severity={data.severity} />
            <IncidentState state={data.state} />
          </div>
        </div>
        <KV
          items={[
            [<Trans key="l">Shop</Trans>, shopName(data.shop_id) ?? "–"],
            [
              <Trans key="l">Order</Trans>,
              data.receipt_id === null ? (
                <Trans key="v">None</Trans>
              ) : (
                <Link
                  key="v"
                  to="/commerce/orders"
                  className="text-link underline decoration-line-strong underline-offset-4 hover:decoration-current"
                >
                  <N>#{data.receipt_id}</N>
                </Link>
              ),
            ],
            [<Trans key="l">Detected</Trans>, when(data.detected_at)],
            [
              data.resolved_at === null ? (
                <Trans key="l">Found by</Trans>
              ) : (
                <Trans key="l">Resolved</Trans>
              ),
              data.resolved_at === null ? words.source(data.source) : when(data.resolved_at),
            ],
          ]}
        />
        <EvidenceList entries={data.history} when={when} />
        <Details details={data.details} />
        <Timeline entries={data.history} actor={actor} when={when} />
        <Steps
          incident={data}
          pending={move.isPending}
          onStep={(step) => {
            move.mutate(step);
          }}
        />
        <p
          role="status"
          className={cx("m-0 text-body-sm text-success-text", moved === null && "sr-only")}
        >
          {moved === null ? null : <Trans>Moved to {moved}</Trans>}
        </p>
        {move.isError ? <FormAlert message={problem(move.error)} /> : null}
      </FlowBody>
    </Panel>
  );
}

function EvidenceList({
  entries,
  when,
}: {
  entries: readonly HistoryEntry[];
  when: (iso: string) => string;
}) {
  const { t } = useLingui();
  const words = useIncidentWords();
  const label = useId();
  // The same fact may carry two steps (to verifying, then resolved): it is shown once.
  const seen = new Map<string, Evidence>();
  for (const entry of entries)
    if (entry.evidence !== null)
      seen.set(`${entry.evidence.kind}:${entry.evidence.reference}`, entry.evidence);
  const facts = [...seen.values()];
  return (
    <div>
      <SectionLabel id={label}>
        <Trans>Evidence</Trans>
      </SectionLabel>
      {facts.length === 0 ? (
        <Note>
          <Trans>
            No evidence yet. It closes once the evidence arrives, such as tracking found in Etsy.
          </Trans>
        </Note>
      ) : (
        <ul aria-label={t`Evidence`} className="m-0 flex list-none flex-col gap-2 p-0">
          {facts.map((fact) => (
            <li
              key={`${fact.kind}:${fact.reference}`}
              className="flex flex-col gap-0.5 rounded-card bg-raised px-4 py-3"
            >
              <span className="inline-flex items-center gap-2 text-body-sm">
                <span aria-hidden="true" className="text-success-text">
                  <CheckGlyph size={14} />
                </span>
                {words.evidence(fact.kind)}
              </span>
              <span className="text-caption text-secondary">
                {words.source(fact.source)}
                <Sep />
                <N className="font-mono">{fact.reference}</N>
                <Sep />
                {when(fact.observed_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The incident's own facts (an automation's name, its attempts): codes, shown as they are. */
function Details({ details }: { details: Record<string, unknown> }) {
  const { t } = useLingui();
  // The facts the platform records today get names; any other stays as its code.
  const names: Partial<Record<string, string>> = {
    automation_id: t`Automation`,
    attempts: t`Attempts`,
    ship_by: t`Ship by`,
    tracking_code: t`Tracking number`,
  };
  const entries = Object.entries(details).filter(
    ([, value]) => typeof value === "string" || typeof value === "number",
  );
  if (entries.length === 0) return null;
  return (
    <div>
      <SectionLabel>
        <Trans>Details</Trans>
      </SectionLabel>
      <dl className="m-0 flex flex-col gap-1.5">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-baseline justify-between gap-4 text-body-sm">
            <dt className="text-secondary">
              {names[key] ?? <N className="font-mono text-caption">{key}</N>}
            </dt>
            <dd className="m-0 min-w-0 truncate">
              <N className="font-mono text-caption">{String(value)}</N>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Timeline({
  entries,
  actor,
  when,
}: {
  entries: readonly HistoryEntry[];
  actor: (entry: HistoryEntry) => string;
  when: (iso: string) => string;
}) {
  const { t } = useLingui();
  const newestFirst = [...entries].reverse();
  return (
    <div>
      <SectionLabel>
        <Trans>Timeline</Trans>
      </SectionLabel>
      <ol aria-label={t`Timeline`} className="m-0 flex list-none flex-col p-0">
        {newestFirst.map((entry, index) => (
          <li
            key={`${entry.at}-${entry.to_state}-${String(index)}`}
            className="relative flex flex-col gap-0.5 border-s border-line ps-4 pb-4 last:pb-0"
          >
            <span
              aria-hidden="true"
              className={cx(
                "absolute -inset-s-[4.5px] top-1.5 size-2 rounded-pill border border-panel",
                index === 0 ? "bg-tertiary" : "bg-line-hover",
              )}
            />
            <IncidentState state={entry.to_state} className="text-body-sm" />
            <span className="text-caption text-secondary">
              {actor(entry)}
              <Sep />
              {when(entry.at)}
            </span>
            {entry.note === null ? null : (
              <N className="self-start font-mono text-caption text-muted">{entry.note}</N>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Steps({
  incident,
  pending,
  onStep,
}: {
  incident: IncidentDetail;
  pending: boolean;
  onStep: (step: Step) => void;
}) {
  const { t } = useLingui();
  const words = useIncidentWords();
  const label = useId();
  if (!incident.is_open) return null;
  if (!incident.can_update)
    return (
      <Note>
        <Trans>Your role can see this incident but not move it.</Trans>
      </Note>
    );
  // The server's steps; escalating, the drastic one, comes last.
  const steps = [...(incident.next_states as Step[])].sort(
    (a, b) => Number(a === "escalated") - Number(b === "escalated"),
  );
  return (
    <div className="flex flex-col gap-3">
      {steps.length === 0 ? null : (
        <div role="group" aria-labelledby={label} className="flex flex-col gap-2">
          <SectionLabel id={label} className="mb-0">
            <Trans>Next step</Trans>
          </SectionLabel>
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => (
              <Button
                key={step}
                isDisabled={pending}
                onPress={() => {
                  onStep(step);
                }}
              >
                {t`Move to ${words.state(step)}`}
              </Button>
            ))}
          </div>
        </div>
      )}
      <p className="m-0 text-caption text-muted">
        <Trans>There is no Resolve button: an incident resolves on its own on evidence.</Trans>
      </p>
    </div>
  );
}
