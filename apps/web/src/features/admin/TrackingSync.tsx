import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { ApiError, useApi } from "../../shared/api/api.tsx";
import { automationRunsQuery } from "../../shared/api/automations.ts";
import { operationsHealthQuery } from "../../shared/api/operations.ts";
import { useCount } from "../../shared/i18n/format.ts";
import { cx } from "../../shared/lib/cx.ts";
import { Button, buttonStyle } from "../../shared/ui/Button.tsx";
import { KV, LiveSkeleton, N, SectionLabel, Status } from "../../shared/ui/kit/index.ts";

import { StateWord, useAgo } from "./execution.tsx";

/** Tracking Synchronization's automation id (platform registry, slice 6.1). */
export const TRACKING_SYNC = "tracking-sync";

/**
 * Tracking Synchronization's status (Commerce › Shipping › Tracking): its last seven days from the
 * operations health read (runs, success, dead letters) and its latest runs, for the Owner and
 * Admins. Only recorded runs: no run means it has not run, never "fine".
 */
export function TrackingSyncStatus({ organizationId }: { organizationId: string }) {
  const { t } = useLingui();
  const api = useApi();
  const count = useCount();
  const since = useAgo();
  const health = useQuery(operationsHealthQuery(api, organizationId));
  const runs = useQuery({
    ...automationRunsQuery(api, organizationId, TRACKING_SYNC),
    // The runs follow the health read: a role refused there is not asked again here.
    enabled: health.isSuccess,
  });

  if (health.isError) {
    const status = health.error instanceof ApiError ? health.error.status : 0;
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="m-0 max-w-[62ch] text-body-sm text-secondary">
          {status === 403
            ? t`Only the workspace Owner and Admins see how Tracking Sync runs.`
            : status === 503
              ? t`Tracking Sync's status is not available on this server yet.`
              : t`Tracking Sync's status could not be loaded. Try again shortly.`}
        </p>
        {status === 403 ? null : (
          <Button onPress={() => void health.refetch()}>
            <Trans>Try again</Trans>
          </Button>
        )}
      </div>
    );
  }
  if (health.data === undefined)
    return <LiveSkeleton rows={3} label={t`Loading Tracking Sync's status`} />;

  const week = health.data.automations.find((a) => a.automation_id === TRACKING_SYNC);
  const latest = runs.data ?? [];
  const last = latest[0];
  const failing = (week?.dead_lettered ?? 0) > 0 || last?.state === "dead_lettered";

  return (
    <div
      className="flex flex-col gap-5"
      data-tracking-sync={week === undefined ? "idle" : failing ? "failing" : "running"}
    >
      {week === undefined && latest.length === 0 && runs.data !== undefined ? (
        <p className="m-0 max-w-[62ch] text-body-sm text-secondary">
          <Trans>
            Tracking Sync has not run in the last seven days. Tracking numbers are read from Etsy
            with each order until it does.
          </Trans>
        </p>
      ) : (
        <KV
          items={[
            [
              <Trans key="s">Tracking sync</Trans>,
              week === undefined ? (
                <Status key="sv" status="idle" label={t`Not run this week`} />
              ) : failing ? (
                <Status key="sv" live status="failed" label={t`Failing`} />
              ) : (
                <Status key="sv" live status="running" label={t`Running`} />
              ),
            ],
            [
              <Trans key="r">Runs, 7 days</Trans>,
              <N key="rv">{week === undefined ? "0" : count(week.executions)}</N>,
            ],
            [
              <Trans key="ok">Success</Trans>,
              <N key="okv">
                {week?.success_rate === null || week === undefined ? "—" : `${week.success_rate}%`}
              </N>,
            ],
            [
              <Trans key="d">Dead letters</Trans>,
              <N key="dv">{count(week?.dead_lettered ?? 0)}</N>,
            ],
            [
              <Trans key="l">Last run</Trans>,
              last === undefined ? (
                "—"
              ) : (
                <time key="lv" dateTime={last.created_at ?? undefined}>
                  {since(last.created_at)}
                </time>
              ),
            ],
          ]}
        />
      )}
      {latest.length === 0 ? null : (
        <section aria-label={t`Latest Tracking Sync runs`} className="flex flex-col gap-2">
          <SectionLabel>
            <Trans>Latest runs</Trans>
          </SectionLabel>
          <ol className="m-0 flex list-none flex-col p-0">
            {latest.slice(0, 5).map((run) => (
              <li
                key={run.id}
                className="flex items-center justify-between gap-3 border-t border-line py-2 first:border-t-0"
              >
                <StateWord state={run.state} />
                <span className="text-caption text-muted">
                  <time dateTime={run.created_at ?? undefined}>{since(run.created_at)}</time>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {runs.isError ? (
        <p role="alert" className="m-0 text-caption text-secondary">
          <Trans>The latest runs could not be loaded.</Trans>
        </p>
      ) : null}
      <Link
        to="/admin/automations"
        className={cx(buttonStyle({ variant: "secondary" }), "self-start")}
      >
        <Trans>Open Automations</Trans>
      </Link>
    </div>
  );
}
