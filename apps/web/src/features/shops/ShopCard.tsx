import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useId, type ReactNode } from "react";

import parcel from "../../assets/commerce/parcel.webp";
import type { IntegrationView, ShopView } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { Ltr } from "../../shared/ui/Ltr.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  CircleButton,
  Dot,
  IdBlock,
  Pill,
  PillPair,
  StatusGlyph,
  Tile,
  type DotTone,
  type WorkStatus,
} from "../../shared/ui/kit/Bits.tsx";
import { DemoPart } from "../../shared/ui/kit/Demo.tsx";
import { RefreshGlyph } from "../../shared/ui/kit/glyphs.tsx";

const DAY = 86_400_000;

/** Whole days until `iso`, rounded down so "within N days" is never later than the truth. */
export function daysLeft(iso: string, now: number): number {
  return Math.max(0, Math.floor((Date.parse(iso) - now) / DAY));
}

/** "4 minutes ago", "yesterday": the largest whole unit, in the user's language. */
export function ago(iso: string, now: number, locale: string): string {
  const seconds = Math.round((Date.parse(iso) - now) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units)
    if (Math.abs(seconds) >= size) return format.format(Math.trunc(seconds / size), unit);
  return format.format(0, "second");
}

/** The connection's status as the demo's status glyph: the shape carries it, not the colour. */
const STATUS_GLYPH: Record<IntegrationView["status"], WorkStatus> = {
  connected: "running",
  needs_reauth: "waityou",
  disconnected: "offline",
};

const HEALTH_GLYPH: Record<IntegrationView["token_health"], WorkStatus> = {
  ok: "running",
  expiring: "waityou",
  needs_reauth: "waityou",
  disconnected: "offline",
};

const SYNC_DOT: Record<IntegrationView["token_health"], DotTone> = {
  ok: "good",
  expiring: "attention",
  needs_reauth: "attention",
  disconnected: "faint",
};

/** One labelled line of the connection details (`.kv` in the demo's words). */
function Detail({
  label,
  children,
  phone = true,
}: {
  label: ReactNode;
  children: ReactNode;
  /** False: hidden on phones, which show fewer details (design/README.md, UX rule 11). */
  phone?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex items-start justify-between gap-4 border-t border-line py-2.5 first:border-t-0",
        !phone && "max-sm:hidden",
      )}
    >
      <dt className="shrink-0 text-caption font-light text-muted">{label}</dt>
      <dd className="m-0 min-w-0 text-end text-body-sm">{children}</dd>
    </div>
  );
}

/**
 * A shop and its Etsy connection (slice 4.6), in the Design 1C shop panel: the shop's name as
 * the large identifier, the parcel, the planned sales tiles (Demo until orders sync, phase 5),
 * then the real connection: health in plain words, the granted access, status and last sync.
 * Never a token.
 */
export function ShopCard({
  shop,
  integration,
  now,
  reconnect,
  onRefresh,
  detailsLoading = false,
}: {
  shop: ShopView;
  /** The connection details are still on their way: their rows show as placeholders. */
  detailsLoading?: boolean;
  /** Undefined for roles that may not see connection details. */
  integration: IntegrationView | undefined;
  now: number;
  /** The Owner's reconnect button, when the connection needs it. */
  reconnect?: ReactNode;
  /** Loads the connection details again (Owners and Admins). */
  onRefresh?: () => void;
}) {
  const { t } = useLingui();
  const { locale } = useLocale();
  const titleId = useId();

  const statusLabel: Record<IntegrationView["status"], string> = {
    connected: t`Connected`,
    needs_reauth: t`Needs reconnecting`,
    disconnected: t`Disconnected`,
  };
  const scopeLabel: Record<string, string> = {
    shops_r: t`Read shop`,
    transactions_r: t`Read orders`,
    listings_r: t`Read listings`,
  };

  function health(view: IntegrationView): ReactNode {
    switch (view.token_health) {
      case "ok":
        return <Trans>Connection renews automatically</Trans>;
      case "expiring": {
        if (view.refresh_expires_at === null) return <Trans>Reconnect soon</Trans>;
        const days = daysLeft(view.refresh_expires_at, now);
        return days === 0 ? (
          <Trans>Reconnect today</Trans>
        ) : (
          <Plural value={days} one="Reconnect within # day" other="Reconnect within # days" />
        );
      }
      case "needs_reauth":
        return <Trans>Reconnect to keep syncing</Trans>;
      case "disconnected":
        return <Trans>Not syncing. Connect it again to resume.</Trans>;
    }
  }

  const asleep = integration?.status === "disconnected";

  return (
    <Panel as="article" labelledBy={titleId} className="lg:min-h-full">
      <PanelHeader
        title={
          <span className="ltr">
            Etsy · <bdi>{shop.name}</bdi>
          </span>
        }
        actions={
          onRefresh === undefined ? undefined : (
            <CircleButton
              label={t`Refresh ${shop.name}`}
              icon={<RefreshGlyph />}
              onClick={onRefresh}
            />
          )
        }
      />
      <div className="flex min-h-0 grow flex-col justify-between gap-4 overflow-auto px-6 pb-6">
        <IdBlock label={<Trans>Shop:</Trans>} id={shop.name} idId={titleId}>
          <p className="m-0 mt-1 truncate text-caption font-light text-muted">
            {integration === undefined ? (
              <Trans>Etsy</Trans>
            ) : (
              <>
                <Trans>Etsy shop</Trans> <Ltr>{integration.etsy_shop_id}</Ltr>
              </>
            )}
          </p>
        </IdBlock>
        <div className="flex min-h-20 grow basis-0 items-center justify-center max-lg:h-36 max-lg:grow-0 max-lg:basis-auto max-sm:h-24">
          <img
            src={parcel}
            alt=""
            draggable={false}
            className={cx(
              "h-full max-h-40 w-auto object-contain motion-safe:animate-[htco-float_6s_ease-in-out_infinite]",
              asleep && "opacity-70 grayscale",
            )}
          />
        </div>
        <DemoPart>
          <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-2 max-sm:[&>*:nth-child(n+3)]:hidden">
            <Tile label={<Trans>Orders today</Trans>} value="23" animate={false} />
            <Tile label={<Trans>Revenue today</Trans>} value="$842" animate={false} />
            <Tile label={<Trans>Favourites</Trans>} value="1,204" animate={false} />
            <Tile label={<Trans>Rating</Trans>} value="4.9" animate={false} />
          </div>
        </DemoPart>
        {detailsLoading ? (
          <div className="flex flex-col gap-3">
            <span role="status" className="sr-only">
              <Trans>Loading connection details</Trans>
            </span>
            {["w-3/5", "w-2/5"].map((width) => (
              <span
                key={width}
                aria-hidden="true"
                className="flex h-6 items-center justify-between gap-3"
              >
                <span className="h-2.5 w-16 rounded-pill bg-hover motion-safe:animate-pulse" />
                <span
                  className={`h-2.5 rounded-pill bg-hover motion-safe:animate-pulse ${width}`}
                />
              </span>
            ))}
            <div aria-hidden="true" className="grid grid-cols-2 gap-2">
              <span className="h-8 rounded-pill bg-hover motion-safe:animate-pulse" />
              <span className="h-8 rounded-pill bg-hover motion-safe:animate-pulse" />
            </div>
          </div>
        ) : null}
        {integration === undefined || detailsLoading ? null : (
          <div className="flex flex-col gap-4 motion-safe:animate-enter">
            <dl className="m-0 flex flex-col">
              <Detail label={<Trans>Connection</Trans>}>
                <span className="inline-flex items-center gap-2">
                  <StatusGlyph status={HEALTH_GLYPH[integration.token_health]} />
                  <span>{health(integration)}</span>
                </span>
              </Detail>
              <Detail label={<Trans>Access</Trans>} phone={false}>
                {integration.scopes.length === 0 ? (
                  <span className="text-muted">
                    <Trans>None</Trans>
                  </span>
                ) : (
                  <ul className="m-0 flex list-none flex-wrap justify-end gap-1.5 p-0">
                    {integration.scopes.map((scope) => (
                      <li
                        key={scope}
                        className="inline-flex h-6 items-center rounded-pill bg-raised px-2.5 text-caption"
                      >
                        {scopeLabel[scope] ?? <Ltr>{scope}</Ltr>}
                      </li>
                    ))}
                  </ul>
                )}
              </Detail>
            </dl>
            <PillPair
              className="max-sm:grid-cols-1"
              items={[
                {
                  key: "status",
                  label: <Trans>Status:</Trans>,
                  pill: (
                    <Pill wide>
                      <StatusGlyph status={STATUS_GLYPH[integration.status]} />
                      <span className="truncate">{statusLabel[integration.status]}</span>
                    </Pill>
                  ),
                },
                {
                  key: "sync",
                  label: <Trans>Last sync:</Trans>,
                  pill: (
                    <Pill wide>
                      <Dot tone={SYNC_DOT[integration.token_health]} />
                      {integration.last_successful_call_at === null ? (
                        <span className="truncate text-muted">
                          <Trans>Not synced yet</Trans>
                        </span>
                      ) : (
                        <time className="truncate" dateTime={integration.last_successful_call_at}>
                          {t`Last synced ${ago(integration.last_successful_call_at, now, locale)}`}
                        </time>
                      )}
                    </Pill>
                  ),
                },
              ]}
            />
            {reconnect === undefined ? null : (
              <div className="flex justify-center [&>*]:min-w-[200px] max-sm:[&>*]:w-full">
                {reconnect}
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

/** Whether the Owner should be offered to reconnect this connection. */
export function needsReconnect(integration: IntegrationView | undefined): boolean {
  return integration !== undefined && integration.token_health !== "ok";
}

/** Says which shop a reconnect button is for, for screen readers. */
export function useReconnectLabel() {
  const { t } = useLingui();
  return (name: string) => t`Reconnect ${name}`;
}
