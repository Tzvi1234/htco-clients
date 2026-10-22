import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useId, useState, type ReactNode } from "react";

import { useConnectEtsy, type ConnectEtsy } from "./connectEtsy.tsx";
import { ShopCard, needsReconnect, useReconnectLabel } from "./ShopCard.tsx";
import { useDisconnects, useRechecks } from "./shopActions.tsx";
import { useNow } from "./time.ts";
import { TopListings } from "./TopListings.tsx";
import { overviewQuery } from "../commerce/live.tsx";
import parcel from "../../assets/commerce/parcel.webp";
import { FormAlert } from "../auth/AuthLayout.tsx";
import { integrationsQuery, meQuery, shopsQuery, useApi } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { WorkspacePicker, pickWorkspace } from "../../shared/ui/WorkspacePicker.tsx";
import {
  CheckGlyph,
  Dot,
  Figure,
  Figures,
  Flow,
  FlowRow,
  Focus,
  IdBlock,
  KV2,
  N,
  Pill,
  SubTabs,
  TabPanel,
} from "../../shared/ui/kit/index.ts";

/**
 * The organization's shops (Commerce / Shops) in the Design 1C shop panels: one panel per shop
 * with its live numbers from Etsy and its real connection, the Owner's panel to connect another,
 * and the shop's top listings, live from Etsy.
 */
export function ShopsPage() {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const memberships = me.data?.memberships ?? [];
  const ids = memberships.map((m) => m.organization_id);
  const connected = useRouterState({ select: (s) => s.location.state.etsy });
  // Back from Etsy: the workspace the shop was connected to.
  const [chosen, setChosen] = useState<string | null>(() => connected?.organizationId ?? null);
  const organizationId = pickWorkspace(ids, chosen);
  const role = memberships.find((m) => m.organization_id === organizationId)?.role;
  const etsy = useConnectEtsy();
  const isOwner = role === "owner";

  return (
    <>
      <PageHeader title={<Trans>Shops</Trans>} />
      <Flow>
        {ids.length > 1 ? (
          <div className="shrink-0 motion-safe:animate-enter">
            <WorkspacePicker ids={ids} value={chosen} onChange={setChosen} />
          </div>
        ) : null}
        {organizationId === undefined || role === undefined ? null : (
          <Shops
            key={organizationId}
            organizationId={organizationId}
            seesConnections={role === "owner" || role === "admin"}
            connected={connected?.organizationId === organizationId ? connected.outcome : undefined}
            etsy={isOwner ? etsy : undefined}
          />
        )}
        {etsy.dialog}
        <p className="m-0 shrink-0 px-4 pt-1 pb-2 text-caption font-light text-muted">
          <Trans>
            The term 'Etsy' is a trademark of Etsy, Inc. This application uses the Etsy API but is
            not endorsed or certified by Etsy, Inc.
          </Trans>
        </p>
      </Flow>
    </>
  );
}

function Shops({
  organizationId,
  seesConnections,
  connected,
  etsy,
}: {
  organizationId: string;
  seesConnections: boolean;
  /** The confirmation after coming back from Etsy, for this workspace. */
  connected: "connected" | "reconnected" | undefined;
  /** Present for the Owner, who alone connects shops. */
  etsy: ConnectEtsy | undefined;
}) {
  const { t } = useLingui();
  const api = useApi();
  const shops = useQuery(shopsQuery(api, organizationId));
  const integrations = useQuery({
    ...integrationsQuery(api, organizationId),
    enabled: seesConnections,
  });
  const reconnectLabel = useReconnectLabel();
  const rechecks = useRechecks(organizationId);
  // Relative times ("Checked 3 minutes ago") move on while the page stays open (Codex, #31).
  const clock = useNow(30_000);
  const disconnects = useDisconnects(organizationId);
  // Each shop's live numbers; a shop known to be disconnected is not asked (no Etsy call).
  const known = new Map((integrations.data ?? []).map((i) => [i.shop_id, i.status]));
  const asked = (shops.data ?? []).filter((shop) => known.get(shop.id) !== "disconnected");
  const live = useQueries({
    queries: asked.map((shop) => overviewQuery(api, shop.id)),
    combine: (results) =>
      new Map(
        asked.map((shop, i) => [
          shop.id,
          { overview: results[i]?.data, error: results[i]?.error ?? null },
        ]),
      ),
  });
  const firstLive = asked.find((shop) => known.get(shop.id) !== "needs_reauth")?.id;
  const tabs = useId();
  const [tab, setTab] = useState<"shops" | "listings">("shops");

  if (shops.isError)
    return (
      <Panel>
        <div
          role="alert"
          className="flex grow flex-col items-center justify-center gap-4 px-6 py-16 text-center"
        >
          <IdBlock label={<Trans>Shops:</Trans>} value={<Trans>Shops could not be loaded</Trans>} />
          <p className="m-0 text-body-sm text-secondary">
            <Trans>Check your connection and try again.</Trans>
          </p>
          <Button variant="primary" size="lg" onPress={() => void shops.refetch()}>
            <Trans>Try again</Trans>
          </Button>
        </div>
      </Panel>
    );

  if (shops.data === undefined)
    return (
      <FlowRow layout="halves">
        <p role="status" className="sr-only">
          <Trans>Loading shops</Trans>
        </p>
        {[0, 1].map((n) => (
          <ShopPanelSkeleton key={n} />
        ))}
      </FlowRow>
    );

  if (shops.data.length === 0)
    return (
      <FlowRow layout="halves" className="items-stretch">
        <NoShops etsy={etsy} />
        <HowConnecting />
      </FlowRow>
    );

  // A role that lost access to connection details must not keep seeing cached ones.
  const byShop = new Map(
    (seesConnections ? (integrations.data ?? []) : []).map((i) => [i.shop_id, i]),
  );
  const notices: ReactNode[] = [];
  if (connected !== undefined)
    notices.push(
      <p
        key="connected"
        role="status"
        className="m-0 inline-flex h-10 items-center gap-2 rounded-pill bg-inverse ps-3 pe-5 text-body-sm text-on-inverse motion-safe:animate-pop-in"
      >
        <span className="flex size-6 items-center justify-center rounded-pill bg-accent text-on-accent">
          <CheckGlyph size={12} />
        </span>
        {connected === "reconnected" ? (
          <Trans>Your Etsy shop is reconnected.</Trans>
        ) : (
          <Trans>Your Etsy shop is connected.</Trans>
        )}
      </p>,
    );
  if (disconnects.done !== undefined)
    notices.push(
      <p
        key="disconnected"
        role="status"
        className="m-0 inline-flex h-10 items-center gap-2 rounded-pill bg-inverse ps-3 pe-5 text-body-sm text-on-inverse motion-safe:animate-pop-in"
      >
        <span className="flex size-6 items-center justify-center rounded-pill bg-accent text-on-accent">
          <CheckGlyph size={12} />
        </span>
        {t`${disconnects.done} is disconnected.`}
      </p>,
    );
  if (disconnects.message !== undefined)
    notices.push(<FormAlert key="disconnect-failed" message={disconnects.message} />);
  if (integrations.isError)
    notices.push(
      <div key="details" className="flex flex-wrap items-center gap-3">
        <FormAlert message={t`Connection details could not be loaded. Try again shortly.`} />
        <Button onPress={() => void integrations.refetch()}>
          <Trans>Try again</Trans>
        </Button>
      </div>,
    );

  // The focus: the shops in three groups that add up to all of them (for the roles that see
  // connections): working, needing the Owner (expiring or refused by Etsy), and disconnected.
  const list = shops.data;
  const group = (shop: (typeof list)[number]) => {
    const integration = byShop.get(shop.id);
    if (integration === undefined) return "unknown";
    if (integration.status === "disconnected") return "disconnected";
    return integration.token_health === "ok" ? "working" : "attention";
  };
  const groups = list.map(group);
  const tally = (g: string) => groups.filter((x) => x === g).length;
  const attention = tally("attention");
  const working = tally("working");
  const asleepCount = tally("disconnected");
  const detailsKnown = seesConnections && integrations.data !== undefined;
  const firstAttention = list.find((shop) => group(shop) === "attention");
  const todays = [...live.values()].flatMap((l) =>
    l.overview?.sales == null ? [] : [l.overview.sales.today.orders],
  );
  const ordersToday = todays.reduce((n, o) => n + o, 0);

  return (
    <>
      <Focus
        title={<Trans>Your shops</Trans>}
        meta={<Trans>Etsy · read only</Trans>}
        lead={
          !detailsKnown ? (
            <Trans>Your Etsy shops and their numbers today, live from Etsy.</Trans>
          ) : attention > 0 ? (
            <Plural
              value={attention}
              one="One shop needs you: reconnect it so its data keeps flowing."
              other="# shops need you: reconnect them so their data keeps flowing."
            />
          ) : asleepCount > 0 ? (
            <Trans>
              No connection needs you. A disconnected shop stays paused until you connect it again.
            </Trans>
          ) : (
            <Trans>Your shops are connected. Nothing needs you here.</Trans>
          )
        }
        figures={
          <Figures label={t`Shop numbers`}>
            <Figure label={<Trans>Shops</Trans>} value={<N>{String(list.length)}</N>} />
            {detailsKnown ? (
              <>
                <Figure label={<Trans>Working</Trans>} value={<N>{String(working)}</N>} />
                <Figure
                  label={<Trans>Need you</Trans>}
                  value={<N>{String(attention)}</N>}
                  tone={attention > 0 ? "accent" : undefined}
                  note={<Trans>reconnect soon</Trans>}
                />
                <Figure label={<Trans>Disconnected</Trans>} value={<N>{String(asleepCount)}</N>} />
              </>
            ) : null}
            <Figure
              label={<Trans>Orders today</Trans>}
              value={<N>{todays.length === 0 ? "—" : String(ordersToday)}</N>}
              note={<Trans>across the shops</Trans>}
            />
          </Figures>
        }
        actions={
          etsy === undefined ? undefined : (
            <>
              {firstAttention === undefined ? null : (
                <Button
                  variant="primary"
                  size="lg"
                  isPending={etsy.pendingKey === firstAttention.id}
                  onPress={() => {
                    etsy.start(firstAttention.id);
                  }}
                >
                  {t`Reconnect ${firstAttention.name} first`}
                </Button>
              )}
              <Button
                variant={firstAttention === undefined ? "primary" : "secondary"}
                size="lg"
                isPending={etsy.pendingKey === "new"}
                onPress={() => {
                  etsy.start("new");
                }}
              >
                <Trans>Connect Etsy shop</Trans>
              </Button>
              <FormAlert message={etsy.message} />
            </>
          )
        }
        footer={
          notices.length === 0 ? undefined : (
            <div className="flex flex-wrap items-center gap-3">{notices}</div>
          )
        }
      />
      <SubTabs
        label={t`Shops views`}
        idBase={tabs}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "shops", label: <Trans>Shops</Trans>, count: list.length },
          { id: "listings", label: <Trans>Top listings</Trans> },
        ]}
      />
      <TabPanel idBase={tabs} tab={tab}>
        {tab === "listings" ? (
          <TopListings shopId={firstLive} />
        ) : (
          <FlowRow layout="halves" className="items-stretch">
            {list.map((shop) => {
              const integration = byShop.get(shop.id);
              return (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  integration={integration}
                  live={live.get(shop.id)}
                  detailsLoading={seesConnections && integrations.isPending}
                  now={Math.max(integrations.dataUpdatedAt, clock)}
                  {...(seesConnections
                    ? {
                        onRefresh: () => {
                          void integrations.refetch();
                        },
                      }
                    : {})}
                  {...(seesConnections && integration?.status === "connected"
                    ? {
                        recheck: {
                          onPress: () => {
                            rechecks.run(shop.id);
                          },
                          pending: rechecks.pendingShop === shop.id,
                          feedback: rechecks.feedbackFor(shop.id),
                        },
                      }
                    : {})}
                  {...(etsy !== undefined &&
                  integration !== undefined &&
                  integration.status !== "disconnected"
                    ? {
                        disconnect: (
                          <Button
                            variant="ghost"
                            size="lg"
                            aria-label={t`Disconnect ${shop.name}`}
                            isPending={disconnects.pendingShop === shop.id}
                            onPress={() => {
                              disconnects.ask(shop);
                            }}
                          >
                            <Trans>Disconnect</Trans>
                          </Button>
                        ),
                      }
                    : {})}
                  {...(etsy !== undefined && needsReconnect(integration)
                    ? {
                        reconnect: (
                          <Button
                            size="lg"
                            aria-label={reconnectLabel(shop.name)}
                            isPending={etsy.pendingKey === shop.id}
                            onPress={() => {
                              etsy.start(shop.id);
                            }}
                          >
                            <Trans>Reconnect</Trans>
                          </Button>
                        ),
                      }
                    : {})}
                />
              );
            })}
          </FlowRow>
        )}
      </TabPanel>
      {disconnects.dialogs}
    </>
  );
}

/** No shop yet: the parcel, what will appear here, and the Owner's way to connect the first. */
function NoShops({ etsy }: { etsy: ConnectEtsy | undefined }) {
  return (
    <Panel>
      <PanelHeader title={<Trans>Shops</Trans>} meta={<span className="ltr">0</span>} />
      <div className="flex min-h-0 grow flex-col items-center justify-between gap-5 px-6 pb-6 text-center">
        <IdBlock label={<Trans>Shops:</Trans>} value={<Trans>No shops yet</Trans>} />
        <div className="flex min-h-0 grow items-center justify-center max-sm:h-28 max-sm:grow-0">
          <img
            src={parcel}
            alt=""
            draggable={false}
            className="max-h-48 w-auto object-contain motion-safe:animate-[htco-float_6s_ease-in-out_infinite] max-sm:h-full"
          />
        </div>
        <p className="m-0 max-w-[340px] text-body-sm text-secondary">
          <Trans>Connected shops appear here with their sync status and capabilities.</Trans>
        </p>
        {etsy === undefined ? (
          <p className="m-0 text-caption text-muted">
            <Trans>The workspace owner connects shops.</Trans>
          </p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              isPending={etsy.pendingKey === "new"}
              onPress={() => {
                etsy.start("new");
              }}
            >
              <Trans>Connect Etsy shop</Trans>
            </Button>
            <FormAlert message={etsy.message} />
          </div>
        )}
      </div>
    </Panel>
  );
}

/** The three steps of connecting, beside the empty state. */
function HowConnecting() {
  const steps: { title: ReactNode; text: ReactNode }[] = [
    {
      title: <Trans>Confirm it is you</Trans>,
      text: <Trans>The 6-digit code from your authenticator app.</Trans>,
    },
    {
      title: <Trans>Approve on Etsy</Trans>,
      text: <Trans>Etsy asks you to allow reading the shop, orders and listings.</Trans>,
    },
    {
      title: <Trans>Watch it here</Trans>,
      text: <Trans>The shop appears with its connection health and last sync.</Trans>,
    },
  ];
  return (
    <Panel className="max-sm:hidden">
      <PanelHeader
        title={<Trans>How connecting works</Trans>}
        meta={<span className="ltr">3</span>}
      />
      <div className="flex min-h-0 grow flex-col gap-6 px-6 pb-6">
        <IdBlock label={<Trans>Connecting takes:</Trans>} value={<Trans>About a minute</Trans>} />
        <ol className="m-0 my-auto flex list-none flex-col gap-5 p-0 [&>li+li]:relative [&>li+li]:before:absolute [&>li+li]:before:inset-s-[32px] [&>li+li]:before:-top-[29px] [&>li+li]:before:h-[38px] [&>li+li]:before:border-s [&>li+li]:before:border-line-strong [&>li+li]:before:content-['']">
          {steps.map((step, index) => (
            <li
              key={index}
              style={{ animationDelay: `${String(120 + index * 80)}ms` }}
              className="flex items-center gap-4 rounded-card p-3 motion-safe:animate-enter"
            >
              <span className="ltr flex size-10 shrink-0 items-center justify-center rounded-pill border border-line-strong text-body">
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-body">{step.title}</span>
                <span className="text-caption text-secondary">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <KV2
          items={[
            [
              <Trans>You need:</Trans>,
              <Pill wide>
                <Dot tone="ink" />
                <Trans>Authenticator app</Trans>
              </Pill>,
            ],
            [
              <Trans>Etsy access:</Trans>,
              <Pill wide>
                <Dot tone="success" />
                <Trans>Read only</Trans>
              </Pill>,
            ],
          ]}
        />
      </div>
    </Panel>
  );
}

/** A shop panel's shape while the shops are on their way: solid placeholders, a gentle pulse. */
function ShopPanelSkeleton() {
  const bar = "rounded-pill bg-hover motion-safe:animate-pulse";
  return (
    <div
      aria-hidden="true"
      className="glass flex min-h-60 flex-col items-center justify-between gap-6 rounded-panel border border-edge bg-panel p-6 shadow-panel"
    >
      <span className={`h-3 w-1/3 self-start ${bar}`} />
      <span className={`h-8 w-1/2 ${bar}`} />
      <span className="size-28 rounded-card bg-hover motion-safe:animate-pulse" />
      <span className="grid w-full grid-cols-2 gap-2">
        <span className={`h-8 ${bar}`} />
        <span className={`h-8 ${bar}`} />
      </span>
    </div>
  );
}
