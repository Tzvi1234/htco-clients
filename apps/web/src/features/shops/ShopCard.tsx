import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useId, type ReactNode } from "react";

import type { EtsyQuota, IntegrationView, ShopView } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { Ltr } from "../../shared/ui/Ltr.tsx";
import { Capabilities, type Recheck } from "./Capabilities.tsx";
import { ApiError } from "../../shared/api/api.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  CircleButton,
  Dot,
  Figure,
  Figures,
  IdBlock,
  KV2,
  N,
  Pill,
  RefreshGlyph,
  StatusGlyph,
  type AgentStatus,
  type DotTone,
  LiveNote,
  Chip,
} from "../../shared/ui/kit/index.ts";
import { useCount, useMoney } from "../../shared/i18n/format.ts";
import type { ShopOverview } from "../../shared/api/live.ts";
import { ago, daysLeft } from "../../shared/lib/time.ts";

/** The connection's status as the demo's status glyph: the shape carries it, not the colour. */
const STATUS_GLYPH: Record<IntegrationView["status"], AgentStatus> = {
  connected: "running",
  needs_reauth: "waityou",
  disconnected: "offline",
};

const HEALTH_GLYPH: Record<IntegrationView["token_health"], AgentStatus> = {
  ok: "running",
  expiring: "waityou",
  needs_reauth: "waityou",
  disconnected: "offline",
};

const SYNC_DOT: Record<IntegrationView["token_health"], DotTone> = {
  ok: "success",
  expiring: "attention",
  needs_reauth: "attention",
  disconnected: "muted",
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
 * Etsy's daily request budget (AC-4.1.2), the app's and not the shop's: what is left today of the
 * daily limit, as last seen on Etsy's answers. Below the floor the server defers routine reads
 * until the budget resets, so the card says so in the attention tone; urgent reads still run.
 */
function QuotaDetail({ quota, low }: { quota: EtsyQuota; low: boolean }) {
  const count = useCount();
  const known = quota.remaining_today !== null && quota.limit_per_day !== null;
  return (
    <Detail label={<Trans>Etsy requests left today</Trans>}>
      <span className="inline-flex items-center gap-2" data-quota={low ? "low" : "ok"}>
        <Dot tone={!known ? "muted" : low ? "attention" : "success"} />
        {quota.remaining_today === null ? (
          <span className="text-muted">
            <Trans>Not known until the first Etsy call</Trans>
          </span>
        ) : quota.limit_per_day === null ? (
          <N>{count(quota.remaining_today)}</N>
        ) : (
          <span>
            <Trans>
              <N>{count(quota.remaining_today)}</N> of <N>{count(quota.limit_per_day)}</N>
            </Trans>
          </span>
        )}
      </span>
    </Detail>
  );
}

/** The shop's live numbers from Etsy, as the card shows them. */
export interface ShopLive {
  overview: ShopOverview | undefined;
  error: Error | null;
}

/** Orders and revenue today, favourites and rating, live from Etsy, with their freshness. */
function LiveTiles({ live }: { live: ShopLive }) {
  const { t } = useLingui();
  const money = useMoney();
  const count = useCount();
  const overview = live.overview;
  const grid = "grid grid-cols-4 gap-2 max-sm:grid-cols-2 max-sm:[&>*:nth-child(n+3)]:hidden";
  if (overview === undefined && live.error === null)
    return (
      <div aria-busy="true" className={grid}>
        <span role="status" className="sr-only">
          <Trans>Loading the shop's numbers</Trans>
        </span>
        {[0, 1, 2, 3].map((n) => (
          <span
            key={n}
            aria-hidden="true"
            className="h-[86px] rounded-card bg-hover motion-safe:animate-pulse"
          />
        ))}
      </div>
    );
  if (overview === undefined) {
    const type = live.error instanceof ApiError ? live.error.type : undefined;
    return (
      <p className="m-0 rounded-card border border-dashed border-line-strong px-4 py-3 text-center text-caption text-secondary">
        {type === "shop-not-connected"
          ? t`Orders, revenue and rating appear here while the shop is connected.`
          : t`Etsy is not answering right now; the shop's numbers will be back shortly.`}
      </p>
    );
  }
  const sales = overview.sales;
  const rating = overview.profile.review_average;
  const reviews = overview.profile.review_count;
  return (
    <div className="flex flex-col gap-3 border-y border-line py-4">
      {/* Label over value with hairlines between, as in the screen's focus: no boxes in a box. */}
      <Figures label={t`Today in this shop`}>
        <Figure
          label={<Trans>Orders today</Trans>}
          value={<N>{sales === null ? "—" : count(sales.today.orders)}</N>}
        />
        <Figure
          label={<Trans>Revenue today</Trans>}
          value={<N>{sales === null ? "—" : money(sales.today.revenue, { whole: true })}</N>}
        />
        <Figure
          label={<Trans>Favourites</Trans>}
          value={<N>{count(overview.profile.favorer_count)}</N>}
        />
        <Figure
          label={<Trans>Rating</Trans>}
          value={<N>{rating === null ? "—" : Number(rating).toFixed(1)}</N>}
          {...(reviews === null ? {} : { note: t`${count(reviews)} reviews` })}
        />
      </Figures>
      <LiveNote fetchedAt={overview.fetched_at} stale={overview.stale} className="self-start" />
    </div>
  );
}

/**
 * A shop and its Etsy connection (slice 4.6), in the Design 1C shop panel: the shop's name as
 * the large identifier, what needs the Owner first, the shop's numbers live from Etsy (orders and revenue today,
 * favourites, rating, with their freshness), then the connection: health in plain words, the
 * granted access, status and last sync. Never a token.
 */
export function ShopCard({
  shop,
  integration,
  now,
  reconnect,
  onRefresh,
  recheck,
  disconnect,
  remove,
  detailsLoading = false,
  live,
  quota,
}: {
  shop: ShopView;
  /** Etsy's daily request budget (the app's), for a connected shop; null before the first call. */
  quota?: EtsyQuota | null | undefined;
  /** The shop's live numbers; undefined when not asked (a disconnected shop). */
  live?: ShopLive | undefined;
  /** The connection details are still on their way: their rows show as placeholders. */
  detailsLoading?: boolean;
  /** Undefined for roles that may not see connection details. */
  integration: IntegrationView | undefined;
  now: number;
  /** The Owner's reconnect button, when the connection needs it. */
  reconnect?: ReactNode;
  /** Loads the connection details again (Owners and Admins). */
  onRefresh?: () => void;
  /** Owners and Admins: probe what HTCO can do again (slice 4.5). */
  recheck?: Recheck;
  /** The Owner's disconnect button (slice 4.7). */
  disconnect?: ReactNode;
  /** The Owner's "Remove shop", in the card's quiet danger zone at the bottom. */
  remove?: ReactNode;
}) {
  const { t } = useLingui();
  const { locale } = useLocale();
  const count = useCount();
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
  // The budget matters only while the shop is read from Etsy.
  const budget = integration?.status === "connected" && !detailsLoading ? quota : undefined;
  const low = budget?.below_floor === true;

  return (
    <Panel as="article" labelledBy={titleId}>
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
      <div className="flex grow flex-col gap-4 px-6 pb-6 max-sm:px-4">
        <IdBlock label={<Trans>Shop:</Trans>} value={shop.name} valueId={titleId}>
          <p className="m-0 mt-1 truncate text-caption font-light text-muted">
            {integration === undefined ? (
              <Trans>Etsy</Trans>
            ) : (
              <>
                <Trans>Etsy shop ID</Trans> · <Ltr>{integration.etsy_shop_id}</Ltr>
              </>
            )}
          </p>
        </IdBlock>
        {integration !== undefined && integration.token_health !== "ok" && !detailsLoading ? (
          <p
            role="note"
            className="m-0 flex items-center gap-2.5 rounded-card bg-tertiary-subtle px-4 py-3 text-body-sm"
          >
            <span aria-hidden="true" className="size-2 shrink-0 rounded-pill bg-tertiary" />
            <span className="min-w-0">{health(integration)}</span>
          </p>
        ) : null}
        {low && budget !== undefined && budget !== null ? (
          <p
            role="note"
            data-tone="attention"
            className="m-0 flex items-center gap-2.5 rounded-card bg-attention-subtle px-4 py-3 text-body-sm"
          >
            <Dot tone="attention" />
            <span className="min-w-0">
              {budget.remaining_today === null
                ? t`Etsy's daily request budget is below its floor. Routine reads wait until it resets; urgent ones still run.`
                : t`Etsy's daily request budget is low: ${count(budget.remaining_today)} left, under the floor of ${count(budget.floor)}. Routine reads wait until it resets; urgent ones still run.`}
            </span>
          </p>
        ) : null}
        {live === undefined || asleep ? null : <LiveTiles live={live} />}
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
              {/* A connection that needs the Owner says so at the top of the card instead. */}
              {integration.token_health === "ok" ? (
                <Detail label={<Trans>Connection</Trans>}>
                  <span className="inline-flex items-center gap-2">
                    <StatusGlyph live status={HEALTH_GLYPH[integration.token_health]} />
                    <span>{health(integration)}</span>
                  </span>
                </Detail>
              ) : null}
              <Detail label={<Trans>Access</Trans>} phone={false}>
                {integration.scopes.length === 0 ? (
                  <span className="text-muted">
                    <Trans>None</Trans>
                  </span>
                ) : (
                  <ul className="m-0 flex list-none flex-wrap justify-end gap-1.5 p-0">
                    {integration.scopes.map((scope) => (
                      <Chip as="li" key={scope}>
                        {scopeLabel[scope] ?? <Ltr>{scope}</Ltr>}
                      </Chip>
                    ))}
                  </ul>
                )}
              </Detail>
              {budget === undefined || budget === null ? null : (
                <QuotaDetail quota={budget} low={low} />
              )}
              {asleep && integration.purge_after != null ? (
                <Detail label={<Trans>Data</Trans>}>
                  <time dateTime={integration.purge_after}>
                    {t`Data deleted after ${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(integration.purge_after))}`}
                  </time>
                </Detail>
              ) : null}
            </dl>
            <KV2
              className="max-sm:grid-cols-1"
              items={[
                [
                  <Trans>Status:</Trans>,
                  <Pill wide>
                    <StatusGlyph live status={STATUS_GLYPH[integration.status]} />
                    <span className="truncate">{statusLabel[integration.status]}</span>
                  </Pill>,
                ],
                [
                  <Trans>Last sync:</Trans>,
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
                  </Pill>,
                ],
              ]}
            />
            {reconnect === undefined && disconnect === undefined ? null : (
              <div className="flex flex-wrap justify-center gap-2 [&>*]:min-w-[200px] max-sm:[&>*]:w-full">
                {reconnect}
                {disconnect}
              </div>
            )}
            {asleep ? null : (
              <Capabilities
                shopName={shop.name}
                integration={integration}
                now={now}
                recheck={recheck}
              />
            )}
          </div>
        )}
        {remove === undefined ? null : (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <span className="text-caption font-light text-muted">
              <Trans>Deletes the shop and all its data in HTCO</Trans>
            </span>
            {remove}
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
