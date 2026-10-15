import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { useConnectEtsy, type ConnectEtsy } from "./connectEtsy.tsx";
import { ShopCard, needsReconnect, useReconnectLabel } from "./ShopCard.tsx";
import { TopListings } from "./TopListings.tsx";
import parcel from "../../assets/commerce/parcel.webp";
import { FormAlert } from "../auth/AuthLayout.tsx";
import { integrationsQuery, meQuery, shopsQuery, useApi } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { WorkspacePicker, pickWorkspace } from "../../shared/ui/WorkspacePicker.tsx";
import { CheckGlyph, PlusGlyph } from "../../shared/ui/kit/glyphs.tsx";
import { IdBlock, InkDisc } from "../../shared/ui/kit/Bits.tsx";
import { Screen } from "../../shared/ui/kit/Layout.tsx";

/**
 * The organization's shops (Commerce / Shops) in the Design 1C shop panels: one panel per shop
 * with its real Etsy connection, the Owner's panel to connect another, and the planned top
 * listings strip (Demo until listings sync).
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
      <p className="m-0 shrink-0 px-4 pt-1 text-caption font-light text-muted">
        <Trans>
          The term 'Etsy' is a trademark of Etsy, Inc. This application uses the Etsy API but is not
          endorsed or certified by Etsy, Inc.
        </Trans>
      </p>
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

  if (shops.isError)
    return (
      <Screen layout="lc2s">
        <Panel className="lg:col-span-full">
          <div
            role="alert"
            className="flex grow flex-col items-center justify-center gap-4 px-6 py-16 text-center"
          >
            <IdBlock label={<Trans>Shops:</Trans>} id={<Trans>Shops could not be loaded</Trans>} />
            <p className="m-0 text-body-sm text-secondary">
              <Trans>Check your connection and try again.</Trans>
            </p>
            <Button variant="primary" size="lg" onPress={() => void shops.refetch()}>
              <Trans>Try again</Trans>
            </Button>
          </div>
        </Panel>
      </Screen>
    );

  if (shops.data === undefined)
    return (
      <Screen layout="lc2s">
        <p role="status" className="sr-only">
          <Trans>Loading shops</Trans>
        </p>
        {[0, 1].map((n) => (
          <ShopPanelSkeleton key={n} />
        ))}
        <TopListings />
      </Screen>
    );

  if (shops.data.length === 0)
    return (
      <Screen layout="lc2s">
        <NoShops etsy={etsy} />
        <HowConnecting />
        <TopListings />
      </Screen>
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
  if (integrations.isError)
    notices.push(
      <div key="details" className="flex flex-wrap items-center gap-3">
        <FormAlert message={t`Connection details could not be loaded. Try again shortly.`} />
        <Button onPress={() => void integrations.refetch()}>
          <Trans>Try again</Trans>
        </Button>
      </div>,
    );

  return (
    <>
      {notices.length === 0 ? null : (
        <div className="flex shrink-0 flex-wrap items-center gap-3 px-2">{notices}</div>
      )}
      <Screen layout="lc2s">
        <div className="flex min-h-0 flex-col gap-2 lg:col-span-full lg:grid lg:auto-rows-[100%] lg:grid-cols-2 lg:overflow-y-auto lg:[scrollbar-width:thin]">
          {shops.data.map((shop) => {
            const integration = byShop.get(shop.id);
            return (
              <ShopCard
                key={shop.id}
                shop={shop}
                integration={integration}
                detailsLoading={seesConnections && integrations.isPending}
                now={integrations.dataUpdatedAt}
                {...(seesConnections
                  ? {
                      onRefresh: () => {
                        void integrations.refetch();
                      },
                    }
                  : {})}
                {...(etsy !== undefined && needsReconnect(integration)
                  ? {
                      reconnect: (
                        <Button
                          variant="primary"
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
          {etsy === undefined ? null : <ConnectPanel etsy={etsy} />}
        </div>
        <TopListings />
      </Screen>
    </>
  );
}

/** The Owner's panel beside the shops: connect another Etsy shop. */
function ConnectPanel({ etsy }: { etsy: ConnectEtsy }) {
  return (
    <Panel className="lg:min-h-full">
      <PanelHeader title={<Trans>Connect a shop</Trans>} />
      <div className="flex min-h-0 grow flex-col items-center justify-center gap-5 px-6 pb-6 text-center">
        <span className="flex size-24 items-center justify-center rounded-pill border border-dashed border-line-hover max-sm:hidden">
          <InkDisc>
            <PlusGlyph size={14} />
          </InkDisc>
        </span>
        <IdBlock label={<Trans>Marketplace:</Trans>} id={<span className="ltr">Etsy</span>} />
        <p className="m-0 max-w-[320px] text-body-sm text-secondary">
          <Trans>
            Add another Etsy shop to this workspace. You confirm with your authenticator code, then
            approve the access on Etsy.
          </Trans>
        </p>
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
    </Panel>
  );
}

/** No shop yet: the parcel, what will appear here, and the Owner's way to connect the first. */
function NoShops({ etsy }: { etsy: ConnectEtsy | undefined }) {
  return (
    <Panel>
      <PanelHeader title={<Trans>Shops</Trans>} meta={<span className="ltr">0</span>} />
      <div className="flex min-h-0 grow flex-col items-center justify-between gap-5 px-6 pb-6 text-center">
        <IdBlock label={<Trans>Shops:</Trans>} id={<Trans>No shops yet</Trans>} />
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
      <PanelHeader title={<Trans>How connecting works</Trans>} meta={<span className="ltr">3</span>} />
      <ol className="m-0 flex grow list-none flex-col justify-center gap-2 px-6 pb-6">
        {steps.map((step, index) => (
          <li
            key={index}
            style={{ animationDelay: `${120 + index * 80}ms` }}
            className="flex items-center gap-4 rounded-card p-3 transition-colors hover:bg-hover motion-safe:animate-enter"
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
