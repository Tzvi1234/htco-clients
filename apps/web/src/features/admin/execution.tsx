// The parts Admin › Health and Admin › Automations share: times as "4 minutes ago", codes,
// execution states as a glyph and a word, and one execution's chain in a sheet (platform slices
// 5.9 and 5.18), where a dead-lettered execution can be retried (audited by the server).
import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";

import { ApiError, useApi } from "../../shared/api/api.tsx";
import {
  executionChainQuery,
  operationsKeys,
  retryExecution,
} from "../../shared/api/operations.ts";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { ago, useNow } from "../../shared/lib/time.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { Chip, LiveSkeleton, Status, type AgentStatus } from "../../shared/ui/kit/index.ts";

/** A time as "4 minutes ago", in the user's language. */
export function useAgo(): (iso: string | null | undefined) => string {
  const { locale } = useLocale();
  const now = useNow(30_000);
  return (iso) => (iso == null ? "—" : ago(iso, Math.max(now, Date.parse(iso)), locale));
}

export const Code = ({ children }: { children: string }) => (
  <span className="ltr font-mono text-caption whitespace-normal [overflow-wrap:anywhere]">
    {children}
  </span>
);

/** An execution's or an action's state: a glyph plus a word in the user's language. */
export function useStateWords(): (state: string) => { status: AgentStatus; label: string } | null {
  const { t } = useLingui();
  const words: Record<string, { status: AgentStatus; label: string }> = {
    pending: { status: "queued", label: t`Pending` },
    running: { status: "running", label: t`Running` },
    waiting: { status: "waitext", label: t`Waiting` },
    succeeded: { status: "delivered", label: t`Succeeded` },
    failed: { status: "failed", label: t`Failed` },
    retry_scheduled: { status: "queued", label: t`Retry scheduled` },
    dead_lettered: { status: "failed", label: t`Dead-lettered` },
    compensated: { status: "idle", label: t`Compensated` },
    cancelled: { status: "offline", label: t`Cancelled` },
  };
  return (state) => words[state] ?? null;
}

export function StateWord({ state }: { state: string }) {
  const word = useStateWords()(state);
  return word === null ? <Code>{state}</Code> : <Status status={word.status} label={word.label} />;
}

/** One execution's chain (`GET /v1/executions/{id}`): its trigger, steps, actions and events. */
export function ExecutionSheet({
  organizationId,
  executionId,
  onClose,
}: {
  organizationId: string;
  executionId: string;
  onClose: () => void;
}) {
  const { t } = useLingui();
  const api = useApi();
  const client = useQueryClient();
  const since = useAgo();
  const chain = useQuery(executionChainQuery(api, organizationId, executionId));
  const [said, setSaid] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const retry = async (automationId: string) => {
    // One request at a time: a double press sends one audited retry (Codex review of #60).
    if (pending) return;
    setPending(true);
    try {
      await retryExecution(api, organizationId, automationId, executionId);
      setSaid(t`The execution goes back to its retry.`);
      await client.invalidateQueries({
        queryKey: operationsKeys.execution(organizationId, executionId),
      });
      await client.invalidateQueries({ queryKey: operationsKeys.health(organizationId) });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      const type = error instanceof ApiError ? error.type : undefined;
      setSaid(
        status === 503
          ? t`Retrying executions is off on this server.`
          : type === "execution-not-dead-lettered"
            ? t`This execution is no longer dead-lettered.`
            : t`The execution could not be retried. Try again shortly.`,
      );
    } finally {
      setPending(false);
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
              meta={chain.data === undefined ? undefined : <StateWord state={chain.data.state} />}
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
                      isPending={pending}
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
                              <StateWord state={entry.state} />
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
