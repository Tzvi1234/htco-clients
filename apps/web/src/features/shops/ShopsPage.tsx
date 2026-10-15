import { Trans, useLingui } from "@lingui/react/macro";
import {
  ArrowsClockwiseIcon as ArrowsClockwise,
  CalendarBlankIcon as CalendarBlank,
  CheckCircleIcon as CheckCircle,
  PackageIcon as Package,
  StorefrontIcon as Storefront,
  type Icon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { useConnectEtsy, type ConnectEtsy } from "./connectEtsy.tsx";
import { ShopCard, needsReconnect, useReconnectLabel } from "./ShopCard.tsx";
import { FormAlert } from "../auth/AuthLayout.tsx";
import { integrationsQuery, meQuery, shopsQuery, useApi } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { EmptyState } from "../../shared/ui/EmptyState.tsx";
import { ErrorState } from "../../shared/ui/ErrorState.tsx";
import { PageBody, PageHeader } from "../../shared/ui/PageHeader.tsx";
import { ObjectIcon } from "../../shared/ui/Tag.tsx";
import { WorkspacePicker, pickWorkspace } from "../../shared/ui/WorkspacePicker.tsx";

/** The organization's shops: an empty record table until one is connected, then shop cards. */
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
      <PageHeader
        title={<Trans>Shops</Trans>}
        description={<Trans>The marketplace shops this organization runs.</Trans>}
        icon={<ObjectIcon hue="coral" icon={Storefront} />}
      />
      {ids.length > 1 ? (
        <div className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="max-w-[760px]">
            <WorkspacePicker ids={ids} value={chosen} onChange={setChosen} />
          </div>
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
      <p className="m-0 mt-auto px-4 pt-8 pb-6 text-caption text-muted sm:px-6 lg:px-8">
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
      <PageBody>
        <ErrorState
          title={<Trans>Shops could not be loaded</Trans>}
          description={<Trans>Check your connection and try again.</Trans>}
        >
          <Button variant="primary" onPress={() => void shops.refetch()}>
            <Trans>Try again</Trans>
          </Button>
        </ErrorState>
      </PageBody>
    );

  if (shops.data === undefined || (seesConnections && integrations.isPending))
    return (
      <PageBody>
        <p role="status" className="sr-only">
          <Trans>Loading shops</Trans>
        </p>
        <div aria-hidden="true" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {[0, 1].map((n) => (
            <div
              key={n}
              className="flex h-40 flex-col gap-3 rounded-card border border-border-subtle bg-surface p-4 shadow-1"
            >
              <span className="h-3 w-2/5 rounded-pill bg-sunken" />
              <span className="h-3 w-3/5 rounded-pill bg-sunken" />
            </div>
          ))}
        </div>
      </PageBody>
    );

  if (shops.data.length === 0) return <NoShops etsy={etsy} />;

  // A role that lost access to connection details must not keep seeing cached ones.
  const byShop = new Map(
    (seesConnections ? (integrations.data ?? []) : []).map((i) => [i.shop_id, i]),
  );
  return (
    <PageBody>
      {connected === undefined ? null : (
        <p
          role="status"
          className="m-0 flex items-center gap-2 rounded-card border border-border-subtle bg-surface px-4 py-3 text-body font-medium shadow-1"
        >
          <CheckCircle aria-hidden="true" size={18} weight="duotone" className="shrink-0" />
          {connected === "reconnected" ? (
            <Trans>Your Etsy shop is reconnected.</Trans>
          ) : (
            <Trans>Your Etsy shop is connected.</Trans>
          )}
        </p>
      )}
      {etsy === undefined ? null : (
        <div className="flex flex-col items-start gap-3">
          <Button
            isPending={etsy.pendingKey === "new"}
            onPress={() => {
              etsy.start("new");
            }}
          >
            <Storefront aria-hidden="true" size={16} weight="duotone" />
            <Trans>Connect Etsy shop</Trans>
          </Button>
          <FormAlert message={etsy.message} />
        </div>
      )}
      {integrations.isError ? (
        <FormAlert message={t`Connection details could not be loaded. Try again shortly.`} />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {shops.data.map((shop) => {
          const integration = byShop.get(shop.id);
          return (
            <ShopCard
              key={shop.id}
              shop={shop}
              integration={integration}
              now={integrations.dataUpdatedAt}
              {...(etsy !== undefined && needsReconnect(integration)
                ? {
                    reconnect: (
                      <Button
                        variant="primary"
                        size="sm"
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
      </div>
    </PageBody>
  );
}

/** No shop yet: the record table's shape, and the Owner's way to connect the first one. */
function NoShops({ etsy }: { etsy: ConnectEtsy | undefined }) {
  const { t } = useLingui();
  const columns: { label: string; icon: Icon }[] = [
    { label: t`Shop`, icon: Storefront },
    { label: t`Sync`, icon: ArrowsClockwise },
    { label: t`Orders today`, icon: Package },
    { label: t`Last sync`, icon: CalendarBlank },
  ];
  return (
    <PageBody flush>
      {/* Phones show lists, not tables: no column header there (design/README.md, rule 11). */}
      <div className="overflow-x-auto max-sm:hidden">
        <div
          aria-hidden="true"
          className="grid min-w-[640px] grid-cols-[minmax(200px,2fr)_1fr_1fr_1fr] border-b border-border-subtle bg-sunken"
        >
          {columns.map(({ label, icon: ColumnIcon }) => (
            <span
              key={label}
              className="flex h-8 items-center gap-1.5 border-e border-border-subtle px-3 text-body-sm text-muted last:border-e-0"
            >
              <ColumnIcon size={14} weight="duotone" />
              {label}
            </span>
          ))}
        </div>
      </div>
      <EmptyState
        bare
        icon={Storefront}
        hue="coral"
        title={<Trans>No shops yet</Trans>}
        description={
          <Trans>Connected shops appear here with their sync status and capabilities.</Trans>
        }
      >
        {etsy === undefined ? (
          <p className="m-0 text-caption text-muted">
            <Trans>The workspace owner connects shops.</Trans>
          </p>
        ) : (
          <>
            <Button
              variant="primary"
              isPending={etsy.pendingKey === "new"}
              onPress={() => {
                etsy.start("new");
              }}
            >
              <Trans>Connect Etsy shop</Trans>
            </Button>
            <FormAlert message={etsy.message} />
          </>
        )}
      </EmptyState>
    </PageBody>
  );
}
