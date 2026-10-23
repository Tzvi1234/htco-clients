// The honest states of a shop's live data: the shop must be reconnected (with the way out),
// Etsy is not answering, or no shop is connected yet.
import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useConnectEtsy } from "./connectEtsy.tsx";
import {
  ApiError,
  integrationsQuery,
  meQuery,
  needsReconnecting,
  useApi,
  type ShopView,
} from "../../shared/api/api.tsx";
import { overviewQuery } from "../../shared/api/live.ts";
import { cx } from "../../shared/lib/cx.ts";
import { Button, buttonStyle } from "../../shared/ui/Button.tsx";
import { FormAlert } from "../../shared/ui/FormAlert.tsx";

/* ------------------------------------------------------------------ honest states */

/**
 * "This shop needs reconnecting" and the way out: the Owner gets the Reconnect button, which
 * runs the Etsy connect flow (the step-up code, then Etsy's approval); everyone else is told
 * who can do it.
 */
export function ReconnectNotice({ compact = false }: { compact?: boolean }) {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const etsy = useConnectEtsy();
  const isOwner = (me.data?.memberships ?? []).some((m) => m.role === "owner");
  return (
    <div
      role="alert"
      className={cx(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact ? "py-4" : "grow px-6 py-12",
      )}
    >
      <p className="m-0 max-w-[380px] font-display text-title font-light text-balance">
        <Trans>This shop needs reconnecting</Trans>
      </p>
      <p className="m-0 max-w-[380px] text-body-sm text-secondary">
        {isOwner ? (
          <Trans>Etsy no longer accepts the shop's connection. Reconnect it to see its data.</Trans>
        ) : (
          <Trans>
            Etsy no longer accepts the shop's connection. The workspace owner can reconnect it.
          </Trans>
        )}
      </p>
      {isOwner ? (
        <>
          <Button
            variant="primary"
            isPending={etsy.pendingKey === "reconnect"}
            onPress={() => {
              etsy.start("reconnect");
            }}
          >
            <Trans>Reconnect</Trans>
          </Button>
          <FormAlert message={etsy.message} />
          {etsy.dialog}
        </>
      ) : null}
    </div>
  );
}

/**
 * The banner a shop screen shows above everything when the shop's connection must be renewed:
 * the connection says `needs_reauth` (Owners and Admins see it), or the shop's data answers
 * shop-not-connected. Nothing when the connection works.
 */
export function ShopReconnectBanner({ shop }: { shop: ShopView }) {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const etsy = useConnectEtsy();
  const role = me.data?.memberships.find((m) => m.organization_id === shop.organization_id)?.role;
  const integrations = useQuery({
    ...integrationsQuery(api, shop.organization_id),
    enabled: role === "owner" || role === "admin",
  });
  const overview = useQuery(overviewQuery(api, shop.id));
  const integration = integrations.data?.find((i) => i.shop_id === shop.id);
  const show = integration?.status === "needs_reauth" || needsReconnecting(overview.error);
  if (!show) return null;
  return (
    <div
      role="alert"
      className="flex shrink-0 animate-enter flex-wrap items-center gap-3 rounded-card bg-tertiary-subtle px-4 py-3 text-body-sm text-primary sm:px-6"
    >
      <span aria-hidden="true" className="size-2 shrink-0 rounded-pill bg-tertiary" />
      <p className="m-0 min-w-0 grow">
        <Trans>This shop needs reconnecting</Trans> · <bdi>{shop.name}</bdi>
      </p>
      {role === "owner" ? (
        <>
          <Button
            variant="primary"
            isPending={etsy.pendingKey === shop.id}
            onPress={() => {
              etsy.start(shop.id);
            }}
          >
            <Trans>Reconnect</Trans>
          </Button>
          <FormAlert message={etsy.message} />
          {etsy.dialog}
        </>
      ) : (
        <span className="text-caption text-muted">
          <Trans>The workspace owner can reconnect it.</Trans>
        </span>
      )}
    </div>
  );
}

/** Why live data is not shown, in plain words, with the way forward. */
export function LiveProblem({
  error,
  onRetry,
  compact = false,
}: {
  error: Error;
  onRetry?: () => void;
  compact?: boolean;
}) {
  const { t } = useLingui();
  const type = error instanceof ApiError ? error.type : undefined;
  // Never an empty screen when the connection must be renewed: say so, with the way out.
  if (needsReconnecting(error)) return <ReconnectNotice compact={compact} />;
  const reconnect = type === "shop-not-connected" || type === "etsy-scope-missing";
  const message =
    type === "shop-not-connected"
      ? t`This shop is not connected to Etsy right now. Reconnect it on Shops to see its data.`
      : type === "etsy-scope-missing"
        ? t`The connection does not allow reading this. Reconnect the shop on Shops to grant it.`
        : type === "etsy-data-unavailable"
          ? t`Etsy is not answering and there is no recent copy to show. Try again in a minute.`
          : type === "not-found"
            ? t`This shop is not available to you.`
            : t`Live shop data could not be loaded. Try again shortly.`;
  return (
    <div
      role="alert"
      className={cx(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact ? "py-4" : "grow px-6 py-12",
      )}
    >
      <p className="m-0 max-w-[360px] text-body-sm text-secondary">{message}</p>
      {reconnect ? (
        <Link to="/shops" className={buttonStyle({ variant: "primary" })}>
          <Trans>Open Shops</Trans>
        </Link>
      ) : onRetry === undefined || type === "not-found" ? null : (
        <Button onPress={onRetry}>
          <Trans>Try again</Trans>
        </Button>
      )}
    </div>
  );
}

/** No shop in any workspace: where the data will come from, and how to connect one. */
export function NoShopYet({ what }: { what: ReactNode }) {
  return (
    <div className="flex grow flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <p className="m-0 max-w-[360px] font-display text-title font-light text-balance">{what}</p>
      <p className="m-0 text-caption text-muted">
        <Trans>No shop is connected yet.</Trans>
      </p>
      <Link to="/shops" className={buttonStyle({ variant: "primary", size: "lg" })}>
        <Trans>Connect a shop</Trans>
      </Link>
    </div>
  );
}
