import { Trans, useLingui } from "@lingui/react/macro";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ApiError, useApi } from "../../shared/api/api.tsx";
import { emailFailuresQuery, type FailedStatus } from "../../shared/api/operations.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { DataTable, FilterChips, LiveSkeleton, Status } from "../../shared/ui/kit/index.ts";

import { Code, useAgo } from "./execution.tsx";

/**
 * Admin › Health's failed emails (platform PR #222, AC-6.4.3 and AC-6.5.6): emails the provider
 * refused for good, or never sent (skipped), newest first, beside the outbox failures. The
 * recipient is a member ID and an address the server masked; the full address and the body never
 * reach the client. The Owner and Admins only (the server decides; others get 403).
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
  const [status, setStatus] = useState<FailedStatus>("failed");
  const emails = useInfiniteQuery(emailFailuresQuery(api, organizationId, status));
  const rows = emails.data?.pages.flatMap((page) => page.items) ?? [];
  const kind: Record<string, string> = {
    "incident.opened": t`Incident opened`,
    "relay.tracking_needed": t`Tracking number needed`,
  };

  let body: ReactNode;
  if (emails.isError) {
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
          <Button onPress={() => void emails.refetch()}>
            <Trans>Try again</Trans>
          </Button>
        )}
      </div>
    );
  } else if (emails.data === undefined) {
    body = <LiveSkeleton rows={3} label={t`Loading the failed emails`} />;
  } else if (rows.length === 0) {
    body = (
      <p className="m-0 px-6 pt-1 pb-6 text-body-sm text-secondary">
        {status === "failed" ? t`No email was refused.` : t`No email was skipped.`}
      </p>
    );
  } else {
    body = (
      <>
        <DataTable
          flow
          label={t`Failed emails`}
          phoneHidden={[2, 3]}
          head={[t`Email`, t`Status`, t`Reason`, t`Shop`, t`To`, t`When`]}
          rows={rows.map((email) => ({
            key: email.id,
            cells: [
              <span key="k">{kind[email.kind] ?? <Code>{email.kind}</Code>}</span>,
              email.status === "failed" ? (
                <Status key="s" status="failed" label={t`Refused`} />
              ) : (
                <Status key="s" status="idle" label={t`Skipped`} />
              ),
              <Code key="r">{email.reason ?? "—"}</Code>,
              <span key="sh" dir="auto">
                {shopName(email.shop_id)}
              </span>,
              // The server's masked address, or the member ID when there is none to mask.
              <Code key="to">{email.recipient ?? email.recipient_user_id.slice(0, 8)}</Code>,
              <time key="t" dateTime={email.created_at}>
                {since(email.created_at)}
              </time>,
            ],
          }))}
        />
        {emails.hasNextPage ? (
          <div className="flex justify-center px-6 pb-6">
            <Button
              isPending={emails.isFetchingNextPage}
              onPress={() => void emails.fetchNextPage()}
            >
              <Trans>Load more</Trans>
            </Button>
          </div>
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
