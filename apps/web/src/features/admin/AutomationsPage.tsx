import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";

import { ApiError, meQuery, useApi } from "../../shared/api/api.tsx";
import {
  automationRunsQuery,
  automationsQuery,
  type Automation,
} from "../../shared/api/automations.ts";
import { useLiveShops } from "../../shared/api/live.ts";
import { operationsHealthQuery, type OperationsHealth } from "../../shared/api/operations.ts";
import { useCount } from "../../shared/i18n/format.ts";
import { PHONE_QUERY, useMediaQuery } from "../../shared/lib/useMediaQuery.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Aside,
  BackGlyph,
  Chip,
  DataTable,
  Figure,
  Figures,
  Flow,
  FlowRow,
  Focus,
  KV,
  LiveSkeleton,
  N,
  NextGlyph,
  SectionLabel,
  Status,
  SubTabs,
  TabPanel,
} from "../../shared/ui/kit/index.ts";
import { WorkspacePicker, pickWorkspace } from "../../shared/ui/WorkspacePicker.tsx";

import { AUTOMATION_TOOLS } from "./automationTools.tsx";
import { Code, ExecutionSheet, StateWord, useAgo } from "./execution.tsx";

type Metrics = OperationsHealth["automations"][number];

/**
 * Admin › Automations (platform slices 5.1, 5.9 and 5.11): every automation of the reviewed
 * registry with its readiness and trigger kinds, and, for the Owner and Admins, the last seven
 * days' runs, success, retries and dead letters from the same health read as Admin › Health (one
 * cached query, never a second call). The chosen automation shows its facts and latest runs; a
 * run opens its execution sheet, where a dead-lettered one can be retried. Only recorded state.
 */
export function AutomationsPage() {
  const { t } = useLingui();
  const api = useApi();
  const me = useQuery(meQuery(api));
  const ids = (me.data?.memberships ?? []).map((m) => m.organization_id);
  const [chosen, setChosen] = useState<string | null>(null);
  const organizationId = pickWorkspace(ids, chosen);
  return (
    <>
      <PageHeader title={t`Automations`} />
      <Flow>
        {ids.length > 1 ? (
          <div className="shrink-0 motion-safe:animate-enter">
            <WorkspacePicker ids={ids} value={chosen} onChange={setChosen} />
          </div>
        ) : null}
        {organizationId === undefined ? (
          ids.length > 1 ? (
            <p className="m-0 px-4 text-body-sm text-secondary">
              <Trans>Choose the workspace whose automations you want to see.</Trans>
            </p>
          ) : (
            <Panel>
              <PanelHeader title={<Trans>Automations</Trans>} />
              <LiveSkeleton rows={6} label={t`Loading the automations`} />
            </Panel>
          )
        ) : (
          <WorkspaceAutomations key={organizationId} organizationId={organizationId} />
        )}
      </Flow>
    </>
  );
}

function WorkspaceAutomations({ organizationId }: { organizationId: string }) {
  const { t } = useLingui();
  const api = useApi();
  const registry = useQuery(automationsQuery(api, organizationId));
  // The same query, key and cache as Admin › Health: no second health call.
  const health = useQuery(operationsHealthQuery(api, organizationId));
  if (registry.isError)
    return (
      <Panel>
        <PanelHeader title={<Trans>Automations</Trans>} />
        <Problem error={registry.error} onRetry={() => void registry.refetch()} />
      </Panel>
    );
  // Wait for the health read too, unless it failed: then the registry shows without metrics.
  if (registry.data === undefined || (health.data === undefined && !health.isError))
    return (
      <Panel>
        <PanelHeader title={<Trans>Automations</Trans>} />
        <LiveSkeleton rows={6} label={t`Loading the automations`} />
      </Panel>
    );
  return (
    <Automations
      organizationId={organizationId}
      automations={registry.data}
      health={health.data}
      healthError={health.isError ? health.error : null}
    />
  );
}

function Problem({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useLingui();
  const status = error instanceof ApiError ? error.status : 0;
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="m-0 max-w-[52ch] text-body-sm text-secondary">
        {status === 403
          ? t`Your role does not see the office's automations.`
          : status === 503
            ? t`Automations are not set up on this server yet.`
            : t`The automations could not be loaded. Try again shortly.`}
      </p>
      {status === 403 ? null : (
        <Button onPress={onRetry}>
          <Trans>Try again</Trans>
        </Button>
      )}
    </div>
  );
}

/** Trigger kinds and side effects in the user's words, never the registry's. */
function useWords() {
  const { t } = useLingui();
  const triggers: Record<string, string> = {
    event: t`Event`,
    schedule: t`Schedule`,
    workflow: t`Workflow`,
    agent_tool: t`AI employee`,
    user_action: t`A person`,
  };
  const effects: Record<string, string> = {
    internal: t`Inside HTCO only`,
    external_read: t`Reads from the marketplace`,
    external_write: t`Writes to the marketplace`,
  };
  return {
    trigger: (kind: string) => triggers[kind] ?? kind,
    effect: (kind: string) => effects[kind] ?? kind,
  };
}

function Readiness({ automation }: { automation: Automation }) {
  const { t } = useLingui();
  return automation.readiness === "ready" ? (
    <Status live status="running" label={t({ message: "Live", context: "automation" })} />
  ) : (
    <Status
      status="idle"
      label={t`Draft · Phase ${automation.activation_phase}`}
      className="text-secondary"
    />
  );
}

function Automations({
  organizationId,
  automations,
  health,
  healthError,
}: {
  organizationId: string;
  automations: readonly Automation[];
  health: OperationsHealth | undefined;
  healthError: Error | null;
}) {
  const { t } = useLingui();
  const count = useCount();
  const words = useWords();
  const metrics = new Map<string, Metrics>(
    (health?.automations ?? []).map((m) => [m.automation_id, m] as const),
  );
  const nameOf = (id: string) => automations.find((a) => a.id === id)?.name ?? id;
  const live = automations.filter((a) => a.readiness === "ready");
  const dead = automations.filter((a) => (metrics.get(a.id)?.dead_lettered ?? 0) > 0);
  const total = (pick: (m: Metrics) => number) =>
    [...metrics.values()].reduce((n, m) => n + pick(m), 0);
  const runs = total((m) => m.executions);
  const succeeded = total((m) => m.succeeded);
  const deadRuns = total((m) => m.dead_lettered);
  // The dead-lettered run to open: the lead automation's latest, else any dead letter's.
  const deadRun =
    health?.executions.find(
      (e) => e.state === "dead_lettered" && e.automation_id === dead[0]?.id,
    ) ?? health?.executions.find((e) => e.state === "dead_lettered");
  const deadExecution =
    deadRun?.id ?? health?.dead_letters.find((d) => d.execution_id)?.execution_id;
  const [selected, setSelected] = useState<string | undefined>(
    dead[0]?.id ?? live[0]?.id ?? automations[0]?.id,
  );
  const [opened, setOpened] = useState<string | null>(null);
  // The clarity pattern (Pixel on #72): what needs him first, then every automation.
  const [tab, setTab] = useState<"needs" | "all">(dead.length > 0 ? "needs" : "all");
  const tabs = useId();
  const listRef = useRef<HTMLDivElement>(null);
  // Phones: the detail sits under the list; this takes him back to it.
  const backToList = () => {
    const list = listRef.current;
    if (list === null) return;
    list.focus({ preventScroll: true });
    if (typeof list.scrollIntoView === "function") list.scrollIntoView({ block: "start" });
  };
  const listed = tab === "needs" ? dead : automations;
  const listTitle = tab === "needs" ? t`Automations that need you` : t`All automations`;
  const current = automations.find((a) => a.id === selected);
  const percent = (value: string | null | undefined) =>
    value == null ? "—" : `${String(Number(value))}%`;
  const overall =
    runs === 0 ? null : (Math.round((succeeded / runs) * 1000) / 10).toFixed(1).replace(/\.0$/, "");
  const shown = health !== undefined;

  return (
    <>
      <Focus
        title={t`Automations`}
        meta={
          <span className="text-caption font-light text-muted">
            <Trans>Last 7 days</Trans>
          </span>
        }
        lead={
          !shown ? (
            <Plural
              value={live.length}
              one="One automation is live. Its runs and their success are for the Owner and Admins."
              other="# automations are live. Their runs and success are for the Owner and Admins."
            />
          ) : dead.length === 1 ? (
            <Trans>
              One automation has a dead-lettered run: {nameOf(dead[0]?.id ?? "")}. Open it, read its
              error, then retry it.
            </Trans>
          ) : dead.length > 1 ? (
            <Plural
              value={dead.length}
              one="One automation has dead-lettered runs."
              other="# automations have dead-lettered runs. Open each, read its error, then retry it."
            />
          ) : (
            <Plural
              value={live.length}
              one="The live automation runs: no dead-lettered run in the last seven days."
              other="All # live automations run: no dead-lettered run in the last seven days."
            />
          )
        }
        actions={
          shown && dead.length > 0 && deadExecution != null ? (
            <Button
              variant="primary"
              onPress={() => {
                setOpened(deadExecution);
              }}
            >
              <Trans>Open the dead-lettered run</Trans>
              <NextGlyph size={14} />
            </Button>
          ) : undefined
        }
        figures={
          <Figures label={t`Automation numbers`}>
            <Figure
              label={t({ message: "Live", context: "automation" })}
              value={<N>{count(live.length)}</N>}
            />
            {shown ? (
              <>
                <Figure label={<Trans>Runs</Trans>} value={<N>{count(runs)}</N>} />
                <Figure
                  label={<Trans>Success</Trans>}
                  value={<N>{overall === null ? "—" : `${overall}%`}</N>}
                />
                <Figure
                  label={<Trans>Retries</Trans>}
                  value={<N>{count(total((m) => m.retries))}</N>}
                />
                <Figure
                  label={<Trans>Dead letters</Trans>}
                  value={<N>{count(deadRuns)}</N>}
                  tone={deadRuns > 0 ? "tertiary" : undefined}
                />
              </>
            ) : null}
          </Figures>
        }
      />
      <SubTabs
        label={t`Automation views`}
        idBase={tabs}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "needs", label: <Trans>Needs you</Trans>, count: dead.length },
          { id: "all", label: <Trans>All</Trans>, count: automations.length },
        ]}
      />
      <TabPanel idBase={tabs} tab={tab}>
        <FlowRow layout="main-side">
          <Panel>
            <div
              ref={listRef}
              tabIndex={-1}
              className="scroll-mt-28 outline-none"
              aria-label={listTitle}
            >
              <PanelHeader title={listTitle} meta={<N>{count(listed.length)}</N>} />
            </div>
            {healthError === null ? null : (
              <p className="m-0 px-6 pb-3 text-body-sm text-secondary">
                {healthError instanceof ApiError && healthError.status === 403
                  ? t`Only the workspace Owner and Admins see the success rate, retries and dead letters.`
                  : t`The runs and their success could not be loaded; the list is the registry's.`}
              </p>
            )}
            <DataTable
              flow
              label={t`Automations`}
              phoneHidden={[2, 3, 4, 5, 6]}
              head={[
                t`Automation`,
                t`Status`,
                t`Triggers`,
                ...(shown ? [t`Runs`, t`Success`, t`Retries`, t`Dead letters`] : []),
              ]}
              ends={shown ? [3, 4, 5, 6] : []}
              rows={listed.map((a) => {
                const m = metrics.get(a.id);
                const others = a.callable_from.filter((kind) => kind !== a.primary_trigger);
                return {
                  key: a.id,
                  selected: a.id === selected,
                  onSelect: () => {
                    setSelected(a.id);
                  },
                  cells: [
                    <span key="n" className="flex min-w-0 flex-col">
                      <span>{a.name}</span>
                      <Code>{a.id}</Code>
                    </span>,
                    <Readiness key="r" automation={a} />,
                    <span key="t">
                      {words.trigger(a.primary_trigger)}
                      {others.length === 0 ? null : (
                        <span className="text-muted">
                          {" · "}
                          {others.map(words.trigger).join(", ")}
                        </span>
                      )}
                    </span>,
                    ...(shown
                      ? [
                          <N key="x">{m === undefined ? "—" : count(m.executions)}</N>,
                          <N key="s">{percent(m?.success_rate)}</N>,
                          <N key="y">{m === undefined ? "—" : count(m.retries)}</N>,
                          m === undefined ? (
                            <N key="d">—</N>
                          ) : m.dead_lettered > 0 ? (
                            <Chip key="d" className="ltr">
                              {count(m.dead_lettered)}
                            </Chip>
                          ) : (
                            <N key="d">0</N>
                          ),
                        ]
                      : []),
                  ],
                };
              })}
            />
            {listed.length === 0 ? (
              <p className="m-0 px-6 pt-2 pb-6 text-body-sm text-secondary max-sm:px-4">
                <Trans>Nothing needs you: no automation has a dead-lettered run.</Trans>
              </p>
            ) : null}
          </Panel>
          <Aside>
            {current === undefined ? null : (
              <Details
                key={current.id}
                organizationId={organizationId}
                automation={current}
                onOpen={setOpened}
                onBack={backToList}
              />
            )}
          </Aside>
        </FlowRow>
      </TabPanel>
      {opened === null ? null : (
        <ExecutionSheet
          organizationId={organizationId}
          executionId={opened}
          onClose={() => {
            setOpened(null);
          }}
        />
      )}
    </>
  );
}

/** The chosen automation: what it is, its latest runs, and its tools (Recount sales). */
function Details({
  organizationId,
  automation,
  onOpen,
  onBack,
}: {
  organizationId: string;
  automation: Automation;
  onOpen: (executionId: string) => void;
  onBack: () => void;
}) {
  const { t } = useLingui();
  const api = useApi();
  const phone = useMediaQuery(PHONE_QUERY);
  const words = useWords();
  const count = useCount();
  const since = useAgo();
  const runs = useQuery(automationRunsQuery(api, organizationId, automation.id));
  const { shops } = useLiveShops();
  const Tool = AUTOMATION_TOOLS[automation.id];
  return (
    <Panel label={automation.name}>
      {phone ? (
        <div className="px-4 pt-4">
          <Button variant="ghost" size="sm" onPress={onBack}>
            <BackGlyph size={14} />
            <Trans>Back to list</Trans>
          </Button>
        </div>
      ) : null}
      <PanelHeader title={automation.name} meta={<Readiness automation={automation} />} />
      <PanelBody scroll={false} className="gap-6 pt-0">
        <KV
          items={[
            [t`Automation`, <Code key="i">{automation.id}</Code>],
            [t`Version`, <N key="v">{count(automation.version)}</N>],
            [t`Starts on`, words.trigger(automation.primary_trigger)],
            [t`Effect`, words.effect(automation.side_effect)],
            [t`Approval`, automation.approval_required ? t`Each run is approved` : t`Not needed`],
            [
              t`Started by hand`,
              automation.user_triggerable ? t`Owner and Admins` : t`Never: it runs on its own`,
            ],
          ]}
        />
        <div>
          <SectionLabel>
            <Trans>Latest runs</Trans>
          </SectionLabel>
          {runs.isError ? (
            <p role="alert" className="m-0 text-body-sm text-secondary">
              {t`The runs could not be loaded. Try again shortly.`}
            </p>
          ) : runs.data === undefined ? (
            <LiveSkeleton rows={3} label={t`Loading the runs`} />
          ) : runs.data.length === 0 ? (
            <p className="m-0 text-body-sm text-secondary">
              {automation.readiness === "ready"
                ? t`No run yet in this workspace.`
                : t`It has not run: it goes live in its phase.`}
            </p>
          ) : (
            <ol aria-label={t`Latest runs`} className="m-0 flex list-none flex-col p-0">
              {runs.data.map((run) => (
                <li key={run.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => {
                      onOpen(run.id);
                    }}
                    aria-label={t`Open the run of ${since(run.created_at)}`}
                    className="flex w-full items-center justify-between gap-3 rounded-tag py-2.5 text-start outline-none hover:bg-raised focus-visible:outline-2 focus-visible:outline-focus"
                  >
                    <StateWord state={run.state} />
                    <span className="flex items-baseline gap-3 text-caption text-muted">
                      {run.attempts > 1 ? (
                        <Plural value={run.attempts} one="# attempt" other="# attempts" />
                      ) : null}
                      <time dateTime={run.created_at ?? undefined}>{since(run.created_at)}</time>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
        {Tool === undefined || shops === undefined ? null : (
          <Tool
            organizationId={organizationId}
            shops={shops.filter((s) => s.organization_id === organizationId)}
          />
        )}
      </PanelBody>
    </Panel>
  );
}
