import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";

import { ApiError, useApi } from "../../shared/api/api.tsx";
import {
  executionChainQuery,
  inFlight,
  recountKeys,
  recountRunsQuery,
  startRecount,
  type Execution,
} from "../../shared/api/operations.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { DataTable, Status } from "../../shared/ui/kit/index.ts";

interface Shop {
  id: string;
  name: string;
}

/**
 * Admin › Health › Sales counters (Phase 5 activation step 2b): the Owner and Admins recount a
 * shop's product sales from its stored orders, for example once after the counters are
 * activated. One run per confirm sheet (its Idempotency-Key), then how it went, from the
 * automation's newest runs, and once it succeeded the count it rebuilt (the execution's output,
 * `GET /v1/executions/{id}`, platform #158).
 */
export function SalesCounters({
  organizationId,
  shops,
}: {
  organizationId: string;
  shops: readonly Shop[];
}) {
  const { t } = useLingui();
  const api = useApi();
  const runs = useQuery(recountRunsQuery(api, organizationId));
  const [asking, setAsking] = useState<{ shop: Shop; key: string } | null>(null);
  const [said, setSaid] = useState<Record<string, string>>({});
  const [started, setStarted] = useState<Record<string, string>>({});
  const client = useQueryClient();

  const recount = useMutation({
    mutationFn: ({ shop, key }: { shop: Shop; key: string }) =>
      startRecount(api, organizationId, shop.id, key),
    onSuccess: (execution, { shop }) => {
      setStarted((before) => ({ ...before, [shop.id]: execution.id }));
      setSaid((before) => ({ ...before, [shop.id]: "" }));
      client.setQueryData<Execution[]>(recountKeys.runs(organizationId), (before) => [
        execution,
        ...(before ?? []).filter((run) => run.id !== execution.id),
      ]);
    },
    onError: (error, { shop }) => {
      const type = error instanceof ApiError ? error.type : undefined;
      setSaid((before) => ({
        ...before,
        [shop.id]:
          type === "automation-refused"
            ? t`The sales counters are not active yet. Activate them first, then recount.`
            : type === "forbidden" || type === "mfa-required" || type === "step-up-required"
              ? t`Only the Owner and Admins recount sales.`
              : t`The recount could not start. Try again shortly.`,
      }));
    },
    onSettled: () => {
      setAsking(null);
    },
  });

  const runOf = (shop: Shop): Execution | undefined => {
    const id = started[shop.id];
    return id === undefined ? undefined : runs.data?.find((run) => run.id === id);
  };

  return (
    <Panel label={t`Sales counters`}>
      <PanelHeader
        title={<Trans>Sales counters</Trans>}
        meta={<Trans>From the stored orders</Trans>}
      />
      <p className="m-0 px-6 pb-2 text-body-sm text-secondary">
        <Trans>
          Recount a shop's product sales from its stored orders: once after the counters are
          activated, or after a gap. The shop's orders on Etsy are not touched.
        </Trans>
      </p>
      <DataTable
        flow
        label={t`Sales counters`}
        head={[t`Shop`, t`Last recount`, t`Action`]}
        ends={[2]}
        // Phones: the run's state goes under the shop, so nothing clips at the inline edge.
        phoneHidden={[1]}
        rows={shops.map((shop) => ({
          key: shop.id,
          cells: [
            <div key="n" className="flex min-w-0 flex-col gap-1">
              <span dir="auto">{shop.name}</span>
              <span className="sm:hidden">
                <RunState run={runOf(shop)} said={said[shop.id]} organizationId={organizationId} />
              </span>
            </div>,
            <RunState
              key="s"
              run={runOf(shop)}
              said={said[shop.id]}
              organizationId={organizationId}
            />,
            <Button
              key="b"
              variant="secondary"
              size="sm"
              isDisabled={recount.isPending || isRunning(runOf(shop))}
              onPress={() => {
                setAsking({ shop, key: crypto.randomUUID() });
              }}
            >
              <Trans>Recount sales</Trans>
            </Button>,
          ],
        }))}
      />
      <ModalOverlay
        isDismissable={!recount.isPending}
        isOpen={asking !== null}
        onOpenChange={(open) => {
          if (!open && !recount.isPending) setAsking(null);
        }}
        className="fixed inset-0 z-overlay flex items-start justify-center bg-[color-mix(in_srgb,var(--bg-ground)_60%,transparent)] px-4 pt-[14vh] data-[entering]:animate-enter"
      >
        <Modal className="glass w-full max-w-[420px] rounded-panel border border-edge bg-menu p-6 shadow-popover outline-none data-[entering]:animate-pop-in">
          <Dialog className="flex flex-col gap-6 outline-none">
            <div className="flex flex-col gap-1.5 text-start">
              <p className="m-0 text-caption font-light text-muted">
                <Trans>Sales counters</Trans>
              </p>
              <Heading
                slot="title"
                className="m-0 font-display text-number-lg leading-[1.25] font-light"
              >
                {asking === null ? null : <Trans>Recount sales for {asking.shop.name}?</Trans>}
              </Heading>
              <p className="m-0 text-body-sm text-secondary">
                <Trans>
                  HTCO counts every product's sales again from this shop's stored orders. It takes a
                  moment, changes nothing on Etsy, and is safe to run again.
                </Trans>
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="ghost"
                isDisabled={recount.isPending}
                onPress={() => {
                  setAsking(null);
                }}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button
                variant="primary"
                isPending={recount.isPending}
                onPress={() => {
                  if (asking !== null && !recount.isPending) recount.mutate(asking);
                }}
              >
                <Trans>Recount</Trans>
              </Button>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </Panel>
  );
}

function isRunning(run: Execution | undefined): boolean {
  return run !== undefined && inFlight(run);
}

/** How the shop's last recount went, as a status glyph and words (never colour alone). */
function RunState({
  run,
  said,
  organizationId,
}: {
  run: Execution | undefined;
  said: string | undefined;
  organizationId: string;
}) {
  const { t } = useLingui();
  if (said !== undefined && said !== "")
    return <span className="text-body-sm text-secondary">{said}</span>;
  if (run === undefined) return <span className="text-secondary">—</span>;
  if (run.state === "succeeded") return <Recounted organizationId={organizationId} id={run.id} />;
  if (run.state === "dead_lettered" || run.state === "failed" || run.state === "cancelled")
    return (
      <span className="text-body-sm text-secondary">
        {t`It did not finish. See it under dead letters.`}
      </span>
    );
  if (run.state === "running") return <Status status="running" label={t`Recounting`} />;
  return <Status status="queued" label={t`Queued`} />;
}

/** A finished recount and how many products it counted (the execution's output). */
function Recounted({ organizationId, id }: { organizationId: string; id: string }) {
  const { t } = useLingui();
  const api = useApi();
  const chain = useQuery(executionChainQuery(api, organizationId, id));
  const rebuilt = chain.data?.output?.["rebuilt"];
  if (typeof rebuilt !== "number") return <Status status="delivered" label={t`Recounted`} />;
  return (
    <Status
      status="delivered"
      label={<Plural value={rebuilt} one="Recounted, # product" other="Recounted, # products" />}
    />
  );
}
