import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";

import { ApiError, useApi } from "../../shared/api/api.tsx";
import {
  inFlight,
  recountKeys,
  recountRunQuery,
  recountRunsQuery,
  startRecount,
  trackedRecountsQuery,
  type Tracked,
} from "../../shared/api/operations.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { DataTable, Status } from "../../shared/ui/kit/index.ts";

interface Shop {
  id: string;
  name: string;
}

/** The keys without this shop's. */
function without(keys: Record<string, string>, shopId: string): Record<string, string> {
  return Object.fromEntries(Object.entries(keys).filter(([id]) => id !== shopId));
}

/**
 * Admin › Health › Sales counters (Phase 5 activation step 2b): the Owner and Admins recount a
 * shop's product sales from its stored orders, for example once after the counters are
 * activated. One run per confirm sheet (its Idempotency-Key), then how it went, and once it
 * succeeded the count it rebuilt (the execution's output, `GET /v1/executions/{id}`, #158).
 *
 * A shop's run is followed by its own id, kept in the query cache, so it stays shown (and the
 * button stays locked) when the panel remounts or newer runs push it off the list's first page;
 * after a reload it is found again in the newest runs by its shop (Codex on #73). A request whose
 * answer was lost keeps its Idempotency-Key, so trying again replays it instead of starting a
 * second run.
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
  const client = useQueryClient();
  const runs = useQuery(recountRunsQuery(api, organizationId));
  const tracked = useQuery(trackedRecountsQuery(organizationId)).data;
  const [asking, setAsking] = useState<{ shop: Shop; key: string } | null>(null);
  const [said, setSaid] = useState<Record<string, string>>({});

  const track = (change: (before: Tracked) => Tracked) => {
    client.setQueryData<Tracked>(recountKeys.tracked(organizationId), (before) =>
      change(before ?? { runs: {}, keys: {} }),
    );
  };

  const recount = useMutation({
    mutationFn: ({ shop, key }: { shop: Shop; key: string }) =>
      startRecount(api, organizationId, shop.id, key),
    onMutate: ({ shop, key }) => {
      // Kept until the run is known, so a lost answer is retried with the same key.
      track((before) => ({ ...before, keys: { ...before.keys, [shop.id]: key } }));
    },
    onSuccess: (execution, { shop }) => {
      track((before) => ({
        runs: { ...before.runs, [shop.id]: execution.id },
        keys: without(before.keys, shop.id),
      }));
      setSaid((before) => ({ ...before, [shop.id]: "" }));
    },
    onError: (error, { shop }) => {
      const status = error instanceof ApiError ? error.status : 0;
      const type = error instanceof ApiError ? error.type : undefined;
      // A refusal (4xx) made nothing: its key goes. Anything else may have made the run.
      if (status >= 400 && status < 500)
        track((before) => ({ ...before, keys: without(before.keys, shop.id) }));
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

  /** The shop's run: the one this session started, else its newest in the list. */
  const runOf = (shop: Shop): string | undefined =>
    tracked?.runs[shop.id] ?? runs.data?.find((run) => run.shop_id === shop.id)?.id;

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
            <div key="n" className="flex min-w-0 flex-col gap-1 whitespace-normal">
              <span dir="auto">{shop.name}</span>
              {/* Pixel on #73: a long message wraps under the shop, never widening the row. */}
              <span className="min-w-0 sm:hidden">
                <RunState organizationId={organizationId} id={runOf(shop)} said={said[shop.id]} />
              </span>
            </div>,
            <RunState
              key="s"
              organizationId={organizationId}
              id={runOf(shop)}
              said={said[shop.id]}
            />,
            <RecountButton
              key="b"
              organizationId={organizationId}
              id={runOf(shop)}
              busy={recount.isPending}
              onPress={() => {
                setAsking({ shop, key: tracked?.keys[shop.id] ?? crypto.randomUUID() });
              }}
            />,
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

/** The shop's run, read by its id and followed while it is on its way. */
function useRun(organizationId: string, id: string | undefined) {
  const api = useApi();
  return useQuery({
    ...recountRunQuery(api, organizationId, id ?? ""),
    enabled: id !== undefined,
  });
}

/** Locked while the shop's run is on its way (or not yet read), so one run at a time. */
function RecountButton({
  organizationId,
  id,
  busy,
  onPress,
}: {
  organizationId: string;
  id: string | undefined;
  busy: boolean;
  onPress: () => void;
}) {
  const run = useRun(organizationId, id);
  // A run that cannot be read (a 4xx) never locks the button for good (quill on #73).
  const running =
    id !== undefined && !run.isError && (run.data === undefined || inFlight(run.data.state));
  return (
    <Button variant="secondary" size="sm" isDisabled={busy || running} onPress={onPress}>
      <Trans>Recount sales</Trans>
    </Button>
  );
}

/** How the shop's last recount went, as a status glyph and words (never colour alone). */
function RunState({
  organizationId,
  id,
  said,
}: {
  organizationId: string;
  id: string | undefined;
  said: string | undefined;
}) {
  const { t } = useLingui();
  const run = useRun(organizationId, id);
  if (said !== undefined && said !== "")
    return <span className="block text-body-sm whitespace-normal text-secondary">{said}</span>;
  if (id === undefined) return <span className="text-secondary">—</span>;
  const state = run.data?.state;
  if (state === "succeeded") {
    const rebuilt = run.data?.output?.["rebuilt"];
    if (typeof rebuilt !== "number") return <Status status="delivered" label={t`Recounted`} />;
    return (
      <Status
        status="delivered"
        label={<Plural value={rebuilt} one="Recounted, # product" other="Recounted, # products" />}
      />
    );
  }
  if (run.isError) return <span className="text-secondary">—</span>;
  if (
    state === "dead_lettered" ||
    state === "failed" ||
    state === "cancelled" ||
    state === "compensated"
  )
    // Pixel on #73: a status dot and a short word like every state, then where to look.
    return (
      <span className="flex flex-col gap-0.5 whitespace-normal">
        <Status status="failed" label={t`Did not finish`} />
        <span className="text-caption text-secondary">
          {t`It did not finish. See it under dead letters.`}
        </span>
      </span>
    );
  if (state === "running") return <Status status="running" label={t`Recounting`} />;
  return <Status status="queued" label={t`Queued`} />;
}
