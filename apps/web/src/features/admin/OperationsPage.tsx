import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";

import { ApiError, useApi } from "../../shared/api/api.tsx";
import { useLiveShops } from "../../shared/api/live.ts";
import {
  executionChainQuery,
  operationsHealthQuery,
  operationsKeys,
  retryDeadJob,
  retryExecution,
  type DeadJob,
  type OperationsHealth,
} from "../../shared/api/operations.ts";
import { useCount } from "../../shared/i18n/format.ts";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { ago, useNow } from "../../shared/lib/time.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Chip,
  DataTable,
  Figure,
  Figures,
  Flow,
  Focus,
  LiveSkeleton,
  N,
  Status,
} from "../../shared/ui/kit/index.ts";

/** A time as "4 minutes ago", in the user's language. */
function useAgo(): (iso: string | null | undefined) => string {
  const { locale } = useLocale();
  const now = useNow(30_000);
  return (iso) => (iso == null ? "—" : ago(iso, Math.max(now, Date.parse(iso)), locale));
}

const Code = ({ children }: { children: string }) => (
  <span className="ltr font-mono text-caption">{children}</span>
);

/**
 * Admin › Health (platform slice 5.9): what the queue, the workers, the shops' syncs and the
 * automations are doing, for the Owner and Admins. One focus panel says what needs you (dead
 * letters, a stopped worker, a stale shop); the panels below list each part. A dead job can be
 * sent back to the queue (audited by the server); an execution opens in its chain view, where a
 * dead-lettered one can be retried. Only recorded state: IDs, kinds, states, counts and error
 * codes, never a payload or a buyer.
 */
export function OperationsPage() {
  const { t } = useLingui();
  const api = useApi();
  const health = useQuery(operationsHealthQuery(api));
  return (
    <>
      <PageHeader title={t`Health`} />
      <Flow>
        {health.isError ? (
          <Panel>
            <PanelHeader title={<Trans>Health</Trans>} />
            <Problem error={health.error} onRetry={() => void health.refetch()} />
          </Panel>
        ) : health.data === undefined ? (
          <Panel>
            <PanelHeader title={<Trans>Health</Trans>} />
            <LiveSkeleton rows={8} label={t`Loading the queue and sync health`} />
          </Panel>
        ) : (
          <Health health={health.data} />
        )}
      </Flow>
    </>
  );
}

function Problem({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useLingui();
  const status = error instanceof ApiError ? error.status : 0;
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="m-0 max-w-[52ch] text-body-sm text-secondary">
        {status === 403
          ? t`Only the workspace Owner and Admins see the queue and sync health.`
          : status === 503
            ? t`The queue and sync health are not available on this server yet.`
            : t`The queue and sync health could not be loaded. Try again shortly.`}
      </p>
      {status === 403 ? null : (
        <Button onPress={onRetry}>
          <Trans>Try again</Trans>
        </Button>
      )}
    </div>
  );
}

function Health({ health }: { health: OperationsHealth }) {
  const { t } = useLingui();
  const count = useCount();
  const since = useAgo();
  const [opened, setOpened] = useState<string | null>(null);
  const { shops } = useLiveShops();
  const shopName = (id: string | null) =>
    id === null ? "—" : (shops?.find((s) => s.id === id)?.name ?? id.slice(0, 8));
  const stopped = health.workers.filter((w) => !w.alive);
  const stale = health.shops.filter((s) => s.stale);
  const dead = health.dead_letters.length;
  const waiting = health.jobs
    .filter((j) => j.state === "queued" || j.state === "retry_scheduled")
    .reduce((n, j) => n + j.count, 0);
  const running = health.jobs.filter((j) => j.state === "running").reduce((n, j) => n + j.count, 0);
  const alive = health.workers.length - stopped.length;

  return (
    <>
      <Focus
        title={t`Queue and sync`}
        meta={
          <span className="text-caption font-light text-muted">
            <time dateTime={health.generated_at}>{t`checked ${since(health.generated_at)}`}</time>
          </span>
        }
        lead={
          dead > 0 ? (
            <Plural
              value={dead}
              one="One job ran out of retries. Look at its error, then retry it."
              other="# jobs ran out of retries. Look at their errors, then retry them."
            />
          ) : health.workers.length > 0 && alive === 0 ? (
            <Trans>No worker is running: jobs wait until one starts.</Trans>
          ) : stale.length > 0 ? (
            <Plural
              value={stale.length}
              one="One shop has not synced within its window."
              other="# shops have not synced within their window."
            />
          ) : (
            <Trans>
              Everything runs: no dead letters, the workers beat and every shop is in sync.
            </Trans>
          )
        }
        figures={
          <Figures label={t`Queue numbers`}>
            <Figure
              label={<Trans>Workers running</Trans>}
              value={<N>{`${count(alive)}/${count(health.workers.length)}`}</N>}
              tone={stopped.length > 0 ? "tertiary" : undefined}
            />
            <Figure label={<Trans>Waiting</Trans>} value={<N>{count(waiting)}</N>} />
            <Figure label={<Trans>Running</Trans>} value={<N>{count(running)}</N>} />
            <Figure
              label={<Trans>Dead letters</Trans>}
              value={<N>{count(dead)}</N>}
              tone={dead > 0 ? "tertiary" : undefined}
            />
            <Figure
              label={<Trans>Stale shops</Trans>}
              value={<N>{count(stale.length)}</N>}
              tone={stale.length > 0 ? "tertiary" : undefined}
            />
          </Figures>
        }
      />
      <DeadLetters letters={health.dead_letters} onOpen={setOpened} shopName={shopName} />
      <Automations health={health} />
      <Panel>
        <PanelHeader title={<Trans>Workers</Trans>} />
        {health.workers.length === 0 ? (
          <Empty>{t`No worker has beaten in the last seven days.`}</Empty>
        ) : (
          <DataTable
            flow
            label={t`Workers`}
            head={[t`Worker`, t`Status`, t`Last beat`, t`Release`]}
            rows={health.workers.map((w) => ({
              key: w.worker_id,
              cells: [
                <Code key="w">{w.worker_id}</Code>,
                <Status
                  key="s"
                  live={w.alive}
                  status={w.alive ? "running" : "offline"}
                  label={w.alive ? t`Running` : w.stopping ? t`Stopping` : t`Stopped`}
                />,
                <time key="t" dateTime={w.last_beat_at}>
                  {since(w.last_beat_at)}
                </time>,
                <Code key="r">{w.release ?? "—"}</Code>,
              ],
            }))}
          />
        )}
      </Panel>
      <Panel>
        <PanelHeader title={<Trans>Shop syncs</Trans>} meta={<Trans>Twice a day</Trans>} />
        {health.shops.length === 0 ? (
          <Empty>{t`No reconciliation has run yet.`}</Empty>
        ) : (
          <DataTable
            flow
            label={t`Shop syncs`}
            head={[t`Shop`, t`Run`, t`Last success`, t`Drifts today`, t`Status`]}
            ends={[3]}
            rows={health.shops.map((s) => ({
              key: `${s.shop_id}-${s.kind}`,
              cells: [
                <span key="n" dir="auto">
                  {shopName(s.shop_id)}
                </span>,
                s.kind === "sweep" ? t`Full sweep` : t`Reconcile`,
                <time key="t" dateTime={s.last_succeeded_at ?? undefined}>
                  {since(s.last_succeeded_at)}
                </time>,
                <N key="d">{count(s.drifts_last_day)}</N>,
                s.stale ? (
                  <Status key="s" status="waityou" label={t`Stale`} />
                ) : (
                  <Status key="s" status="delivered" label={t`In sync`} />
                ),
              ],
            }))}
          />
        )}
      </Panel>
      <Panel>
        <PanelHeader title={<Trans>Webhook intake</Trans>} meta={<Trans>Last 24 hours</Trans>} />
        {health.webhooks.length === 0 ? (
          <Empty>{t`No Etsy notice has arrived yet.`}</Empty>
        ) : (
          <DataTable
            flow
            label={t`Webhook intake`}
            head={[t`Event`, t`Received`, t`Not processed yet`]}
            ends={[1, 2]}
            rows={health.webhooks.map((w) => ({
              key: `${w.source}-${w.event_type}`,
              cells: [
                <Code key="e">{w.event_type}</Code>,
                <N key="r">{count(w.received_last_day)}</N>,
                <N key="u">{count(w.unprocessed)}</N>,
              ],
            }))}
          />
        )}
      </Panel>
      <Panel>
        <PanelHeader title={<Trans>Recent executions</Trans>} />
        {health.executions.length === 0 ? (
          <Empty>{t`No automation has run yet.`}</Empty>
        ) : (
          <DataTable
            flow
            label={t`Recent executions`}
            head={[t`Automation`, t`State`, t`Attempts`, t`Started`]}
            ends={[2]}
            rows={health.executions.map((e) => ({
              key: e.id,
              cells: [
                <button
                  key="a"
                  type="button"
                  onClick={() => {
                    setOpened(e.id);
                  }}
                  aria-label={t`Open the execution of ${e.automation_id}`}
                  className="-mx-1 rounded-tag px-1 underline decoration-line-strong underline-offset-[3px] outline-none hover:decoration-current focus-visible:outline-2 focus-visible:outline-focus"
                >
                  <Code>{e.automation_id}</Code>
                </button>,
                <Code key="s">{e.state}</Code>,
                <N key="n">{count(e.attempts)}</N>,
                <time key="t" dateTime={e.created_at}>
                  {since(e.created_at)}
                </time>,
              ],
            }))}
          />
        )}
      </Panel>
      <Panel>
        <PanelHeader title={<Trans>Outbox failures</Trans>} />
        {health.outbox_failures.length === 0 ? (
          <Empty>{t`Every message was delivered.`}</Empty>
        ) : (
          <DataTable
            flow
            label={t`Outbox failures`}
            head={[t`Destination`, t`Status`, t`Attempts`, t`Last error`]}
            ends={[2]}
            rows={health.outbox_failures.map((o) => ({
              key: o.id,
              cells: [
                <Code key="d">{o.destination}</Code>,
                o.status === "dead" ? t`Gave up` : t`Retrying`,
                <N key="n">{count(o.attempts)}</N>,
                <Code key="e">{o.last_error ?? "—"}</Code>,
              ],
            }))}
          />
        )}
      </Panel>
      {opened === null ? null : (
        <ExecutionSheet
          executionId={opened}
          onClose={() => {
            setOpened(null);
          }}
        />
      )}
    </>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="m-0 px-6 pt-1 pb-6 text-body-sm text-secondary">{children}</p>;
}

/** Dead letters with their last error; a job is retried here, an execution in its sheet. */
function DeadLetters({
  letters,
  onOpen,
  shopName,
}: {
  letters: readonly DeadJob[];
  onOpen: (executionId: string) => void;
  shopName: (id: string | null) => string;
}) {
  const { t } = useLingui();
  const api = useApi();
  const client = useQueryClient();
  const count = useCount();
  const since = useAgo();
  const [busy, setBusy] = useState<string | null>(null);
  const [said, setSaid] = useState<{ id: string; ok: boolean; text: string } | null>(null);
  const retry = async (job: DeadJob) => {
    setBusy(job.id);
    setSaid(null);
    try {
      await retryDeadJob(api, job.id);
      setSaid({
        id: job.id,
        ok: true,
        text: t`Queued again. It runs as soon as a worker is free.`,
      });
      await client.invalidateQueries({ queryKey: operationsKeys.health });
    } catch (error) {
      const type = error instanceof ApiError ? error.type : undefined;
      setSaid({
        id: job.id,
        ok: false,
        text:
          type === "job-not-dead"
            ? t`This job is no longer dead-lettered.`
            : type === "forbidden"
              ? t`Only the Owner and Admins retry jobs.`
              : t`The job could not be retried. Try again shortly.`,
      });
    } finally {
      setBusy(null);
    }
  };
  return (
    <Panel>
      <PanelHeader
        title={<Trans>Dead letters</Trans>}
        meta={letters.length === 0 ? undefined : <N>{count(letters.length)}</N>}
      />
      {said === null ? null : (
        <p
          role={said.ok ? "status" : "alert"}
          className="m-0 px-6 pb-3 text-body-sm text-secondary"
        >
          {said.text}
        </p>
      )}
      {letters.length === 0 ? (
        <Empty>{t`No job ran out of retries.`}</Empty>
      ) : (
        <DataTable
          flow
          label={t`Dead letters`}
          head={[t`Job`, t`Shop`, t`Attempts`, t`Last error`, t`When`, ""]}
          ends={[2]}
          rows={letters.map((job) => ({
            key: job.id,
            cells: [
              <Code key="k">{job.kind}</Code>,
              <span key="s" dir="auto">
                {shopName(job.shop_id)}
              </span>,
              <N key="a">{count(job.attempts)}</N>,
              <Code key="e">{job.last_error ?? "—"}</Code>,
              <time key="t" dateTime={job.finished_at}>
                {since(job.finished_at)}
              </time>,
              job.execution_id === null ? (
                <Button
                  key="r"
                  size="sm"
                  isDisabled={busy !== null}
                  onPress={() => void retry(job)}
                  aria-label={t`Retry the job ${job.kind}`}
                >
                  {busy === job.id ? t`Retrying…` : t`Retry`}
                </Button>
              ) : (
                <Button
                  key="o"
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    onOpen(job.execution_id ?? "");
                  }}
                >
                  <Trans>Open the execution</Trans>
                </Button>
              ),
            ],
          }))}
        />
      )}
    </Panel>
  );
}

function Automations({ health }: { health: OperationsHealth }) {
  const { t } = useLingui();
  const count = useCount();
  const { locale } = useLocale();
  const seconds = (value: number | null) =>
    value === null
      ? "—"
      : new Intl.NumberFormat(locale, {
          style: "unit",
          unit: value < 60 ? "second" : "minute",
          unitDisplay: "narrow",
          maximumFractionDigits: 1,
        }).format(value < 60 ? value : value / 60);
  return (
    <Panel>
      <PanelHeader title={<Trans>Automations</Trans>} meta={<Trans>Last 7 days</Trans>} />
      {health.automations.length === 0 ? (
        <Empty>{t`No automation has run in the last seven days.`}</Empty>
      ) : (
        <DataTable
          flow
          label={t`Automations`}
          head={[t`Automation`, t`Runs`, t`Success`, t`Retries`, t`Dead letters`, t`p50`, t`p95`]}
          ends={[1, 2, 3, 4, 5, 6]}
          rows={health.automations.map((a) => ({
            key: a.automation_id,
            cells: [
              <Code key="a">{a.automation_id}</Code>,
              <N key="r">{count(a.executions)}</N>,
              <N key="s">{a.success_rate === null ? "—" : `${a.success_rate}%`}</N>,
              <N key="t">{count(a.retries)}</N>,
              a.dead_lettered > 0 ? (
                <Chip key="d" className="ltr">
                  {count(a.dead_lettered)}
                </Chip>
              ) : (
                <N key="d">0</N>
              ),
              <N key="p5">{seconds(a.p50_seconds)}</N>,
              <N key="p9">{seconds(a.p95_seconds)}</N>,
            ],
          }))}
        />
      )}
    </Panel>
  );
}

/** One execution's chain (`GET /v1/executions/{id}`): its trigger, steps, actions and events. */
function ExecutionSheet({ executionId, onClose }: { executionId: string; onClose: () => void }) {
  const { t } = useLingui();
  const api = useApi();
  const client = useQueryClient();
  const since = useAgo();
  const chain = useQuery(executionChainQuery(api, executionId));
  const [said, setSaid] = useState<string | null>(null);
  const retry = async (automationId: string) => {
    try {
      await retryExecution(api, automationId, executionId);
      setSaid(t`The execution goes back to its retry.`);
      await client.invalidateQueries({ queryKey: operationsKeys.execution(executionId) });
      await client.invalidateQueries({ queryKey: operationsKeys.health });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      setSaid(
        status === 503
          ? t`Retrying executions is off on this server.`
          : t`The execution could not be retried. Try again shortly.`,
      );
    }
  };
  return (
    <ModalOverlay
      isOpen
      isDismissable
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      className="fixed inset-0 z-overlay flex items-end justify-center bg-[color-mix(in_srgb,var(--bg-ground)_60%,transparent)] sm:items-center"
    >
      <Modal className="w-full sm:max-w-[600px] animate-[htco-sheet-in_var(--motion-duration-slow)_var(--motion-easing-enter)_both] p-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        <Dialog className="outline-none" aria-label={t`Execution`}>
          <Panel>
            <PanelHeader
              title={
                chain.data === undefined ? (
                  <Trans>Execution</Trans>
                ) : (
                  <Code>{chain.data.automation_id}</Code>
                )
              }
              meta={chain.data === undefined ? undefined : <Code>{chain.data.state}</Code>}
              actions={
                <Button variant="ghost" onPress={onClose}>
                  <Trans>Close</Trans>
                </Button>
              }
            />
            <div className="flex max-h-[70dvh] flex-col gap-3 overflow-auto px-6 pb-6">
              {said === null ? null : (
                <p role="status" className="m-0 text-body-sm text-secondary">
                  {said}
                </p>
              )}
              {chain.isError ? (
                <p role="alert" className="m-0 text-body-sm text-secondary">
                  {t`The execution could not be read.`}
                </p>
              ) : chain.data === undefined ? (
                <LiveSkeleton rows={4} label={t`Loading the execution`} />
              ) : (
                <>
                  {chain.data.state === "dead_lettered" ? (
                    <Button
                      variant="primary"
                      onPress={() => void retry(chain.data.automation_id)}
                      className="self-start"
                    >
                      <Trans>Retry the execution</Trans>
                    </Button>
                  ) : null}
                  <ol className="m-0 flex list-none flex-col gap-2 p-0" aria-label={t`Chain`}>
                    {chain.data.entries.map((entry) => (
                      <li
                        key={`${entry.kind}-${entry.id}-${entry.at}`}
                        className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-line pb-2 last:border-b-0"
                      >
                        <span className="flex min-w-0 items-baseline gap-2">
                          <Chip>{entry.kind}</Chip>
                          <Code>{entry.name}</Code>
                          {entry.state === null ? null : (
                            <span className="text-caption text-muted">
                              <Code>{entry.state}</Code>
                            </span>
                          )}
                        </span>
                        <time dateTime={entry.at} className="text-caption text-muted">
                          {since(entry.at)}
                        </time>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </Panel>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
