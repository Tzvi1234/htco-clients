import { Trans, useLingui } from "@lingui/react/macro";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ApiError, useApi } from "../../shared/api/api.tsx";
import { emailFailuresQuery, type FailedStatus } from "../../shared/api/operations.ts";
import { PHONE_QUERY, useMediaQuery } from "../../shared/lib/useMediaQuery.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { PanelEmpty } from "../../shared/ui/EmptyState.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { DataTable, FilterChips, LiveSkeleton, Status } from "../../shared/ui/kit/index.ts";

import { Code, LoadMore, useAgo } from "./execution.tsx";

/**
 * Admin › Health's failed emails (platform PR #222, AC-6.4.3 and AC-6.5.6): emails the provider
 * refused for good, or never sent (skipped), newest first, beside the outbox failures: kind,
 * reason, shop and time, never the address (not even masked) or the body (AC-6.5.6). On phones
 * each email is one stacked row. The Owner and Admins only (the server decides; others get 403).
 */
export function EmailFailures({
  organizationId,
  shopName,
}: {
  organizationId: string;
  shopName: (id: string | null) => string;
}) {
  const { t } = useLingui();
  const api = useApi();
  const since = useAgo();
  const phone = useMediaQuery(PHONE_QUERY);
  const [status, setStatus] = useState<FailedStatus>("failed");
  const emails = useInfiniteQuery(emailFailuresQuery(api, organizationId, status));
  const rows = emails.data?.pages.flatMap((page) => page.items) ?? [];
  const kind: Record<string, string> = {
    "incident.opened": t`Incident opened`,
    "relay.tracking_needed": t`Tracking number needed`,
  };

  let body: ReactNode;
  // A failed next page keeps the pages shown; only a failed first read replaces the list.
  if (emails.isError && emails.data === undefined) {
    const code = emails.error instanceof ApiError ? emails.error.status : 0;
    body = (
      <div role="alert" className="flex flex-col items-center gap-3 px-6 py-8 text-center">
        <p className="m-0 max-w-[52ch] text-body-sm text-secondary">
          {code === 403
            ? t`Only the workspace Owner and Admins see the failed emails.`
            : code === 503
              ? t`The failed emails are not available on this server yet.`
              : t`The failed emails could not be loaded. Try again shortly.`}
        </p>
        {code === 403 ? null : (
          <Button size="touch" onPress={() => void emails.refetch()}>
            <Trans>Try again</Trans>
          </Button>
        )}
      </div>
    );
  } else if (emails.data === undefined) {
    body = <LiveSkeleton rows={3} label={t`Loading the failed emails`} />;
  } else if (rows.length === 0) {
    body =
      status === "failed" ? (
        <PanelEmpty
          title={t`No email was refused.`}
          description={t`An email the provider refuses for good shows here, with its reason.`}
        />
      ) : (
        <PanelEmpty
          title={t`No email was skipped.`}
          description={t`An email that could not be sent, such as to a member without a verified address, shows here.`}
        />
      );
  } else {
    const kindOf = (value: string) => kind[value] ?? <Code>{value}</Code>;
    const state = (value: FailedStatus) =>
      value === "failed" ? (
        <Status status="failed" label={t`Refused`} />
      ) : (
        <Status status="idle" label={t`Skipped`} />
      );
    body = (
      <>
        {phone ? (
          // Phones: one stacked row per email, nothing cut off at 375 px.
          <ul aria-label={t`Failed emails`} className="m-0 flex list-none flex-col px-4 pb-3">
            {rows.map((email) => (
              <li
                key={email.id}
                className="flex min-h-11 flex-col gap-1 border-b border-line py-3 last:border-b-0"
              >
                <span className="flex items-baseline justify-between gap-3 text-body-sm">
                  <span className="min-w-0">{kindOf(email.kind)}</span>
                  <time className="shrink-0 text-caption text-muted" dateTime={email.created_at}>
                    {since(email.created_at)}
                  </time>
                </span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-secondary">
                  {state(email.status)}
                  <Code>{email.reason ?? "—"}</Code>
                  <span dir="auto">{shopName(email.shop_id)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <DataTable
            flow
            label={t`Failed emails`}
            head={[t`Email`, t`Status`, t`Reason`, t`Shop`, t`When`]}
            rows={rows.map((email) => ({
              key: email.id,
              cells: [
                <span key="k">{kindOf(email.kind)}</span>,
                <span key="s">{state(email.status)}</span>,
                <Code key="r">{email.reason ?? "—"}</Code>,
                <span key="sh" dir="auto">
                  {shopName(email.shop_id)}
                </span>,
                <time key="t" dateTime={email.created_at}>
                  {since(email.created_at)}
                </time>,
              ],
            }))}
          />
        )}
        {emails.hasNextPage ? (
          <LoadMore
            pending={emails.isFetchingNextPage}
            failed={emails.isFetchNextPageError}
            onMore={() => void emails.fetchNextPage()}
          />
        ) : null}
      </>
    );
  }
  return (
    <Panel label={t`Failed emails`}>
      <PanelHeader title={<Trans>Failed emails</Trans>} meta={<Trans>Never the address</Trans>} />
      <div className="px-6 pb-3 max-sm:px-4">
        <FilterChips
          label={t`Which emails`}
          value={status}
          onChange={setStatus}
          options={[
            { id: "failed", label: <Trans>Refused</Trans> },
            { id: "skipped", label: <Trans>Skipped</Trans> },
          ]}
        />
      </div>
      {body}
    </Panel>
  );
}
