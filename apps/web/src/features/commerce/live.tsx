// The connected shop's live data (platform `docs/features/etsy-integration/dashboard-data.md`):
// the queries, the shop the commerce screens show, money in the shop's currency, the "Live from
// Etsy" freshness line and the honest states (loading, not connected, Etsy not answering).
import type { ApiClient, components } from "@htco/api-client";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQueries, useQuery, queryOptions } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { ago, useNow } from "../shops/time.ts";
import {
  ApiError,
  apiError,
  meQuery,
  shopsQuery,
  useApi,
  type ShopView,
} from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { Button, buttonStyle } from "../../shared/ui/Button.tsx";
import { Dot } from "../../shared/ui/kit/index.ts";

export type ShopOverview = components["schemas"]["ShopOverviewView"];
export type ShopOrders = components["schemas"]["OrdersView"];
export type ShopOrder = components["schemas"]["OrderView"];
export type ShopListings = components["schemas"]["ListingsView"];
export type ShopListing = components["schemas"]["ListingView"];
export type ShopReviews = components["schemas"]["ReviewsView"];
export type ShopShipping = components["schemas"]["ShippingView"];
export type MoneyView = components["schemas"]["MoneyView"];
export type OrderFilter = NonNullable<ShopOrder["state"]> | "overdue";
/** The Orders screen's periods: 30 days (the default), 90 days, 12 months, all time. */
export type OrderPeriod = ShopOrders["period"];
export type ShopStats = components["schemas"]["ShopStatsView"];
export type AllTimeSales = NonNullable<ShopStats["sales"]>;

/** Etsy is read at most every few minutes through the API's cache; the screens follow along. */
const REFRESH_MS = 120_000;

export const liveKeys = {
  all: ["live"] as const,
  overview: (shopId: string) => ["live", shopId, "overview"] as const,
  orders: (shopId: string, state: OrderFilter | undefined, period: OrderPeriod = "30d") =>
    ["live", shopId, "orders", period, state ?? "all"] as const,
  listings: (shopId: string) => ["live", shopId, "listings"] as const,
  reviews: (shopId: string) => ["live", shopId, "reviews"] as const,
  shipping: (shopId: string) => ["live", shopId, "shipping"] as const,
  stats: (shopId: string) => ["live", shopId, "stats"] as const,
};

/** Not connected, missing a scope or not there: asking again soon does not help. */
function retry(failures: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failures < 2;
}

/** Minutes east of UTC, so "today" is the user's day. */
export function utcOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}

export function overviewQuery(api: ApiClient, shopId: string) {
  return queryOptions({
    queryKey: liveKeys.overview(shopId),
    queryFn: async (): Promise<ShopOverview> => {
      const { data, error, response } = await api.GET("/v1/shops/{shop_id}/overview", {
        params: { path: { shop_id: shopId }, query: { utc_offset_minutes: utcOffsetMinutes() } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    refetchInterval: REFRESH_MS,
    retry,
  });
}

export function ordersQuery(
  api: ApiClient,
  shopId: string,
  state?: OrderFilter,
  period: OrderPeriod = "30d",
) {
  return queryOptions({
    queryKey: liveKeys.orders(shopId, state, period),
    queryFn: async (): Promise<ShopOrders> => {
      // Every page (the API answers 100 at a time; a period holds at most its cap, 500 to
      // 2,000), so the Orders filters and the Shipping queue see every order the counts speak of
      // (Codex, #35). The API reads Etsy through its cache: one Etsy load serves all the pages.
      let first: ShopOrders | undefined;
      const items: ShopOrder[] = [];
      do {
        const { data, error, response } = await api.GET("/v1/shops/{shop_id}/orders", {
          params: {
            path: { shop_id: shopId },
            query: {
              period,
              limit: 100,
              offset: items.length,
              ...(state === undefined ? {} : { state }),
            },
          },
        });
        if (data === undefined) throw apiError(response, error);
        first ??= data;
        items.push(...data.items);
        if (data.items.length === 0) break;
      } while (items.length < first.total);
      return { ...first, items };
    },
    refetchInterval: REFRESH_MS,
    retry,
  });
}

/** The shop's statistics since it opened (Shops › Statistics): aggregates only, no buyer data. */
export function statsQuery(api: ApiClient, shopId: string) {
  return queryOptions({
    queryKey: liveKeys.stats(shopId),
    queryFn: async (): Promise<ShopStats> => {
      const { data, error, response } = await api.GET("/v1/shops/{shop_id}/stats", {
        params: { path: { shop_id: shopId }, query: { utc_offset_minutes: utcOffsetMinutes() } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    // The API keeps the statistics for hours; asking every few minutes is plenty.
    refetchInterval: REFRESH_MS * 5,
    retry,
  });
}

export function listingsQuery(api: ApiClient, shopId: string) {
  return queryOptions({
    queryKey: liveKeys.listings(shopId),
    queryFn: async (): Promise<ShopListings> => {
      const { data, error, response } = await api.GET("/v1/shops/{shop_id}/listings", {
        params: { path: { shop_id: shopId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    refetchInterval: REFRESH_MS * 2.5,
    retry,
  });
}

export function reviewsQuery(api: ApiClient, shopId: string) {
  return queryOptions({
    queryKey: liveKeys.reviews(shopId),
    queryFn: async (): Promise<ShopReviews> => {
      const { data, error, response } = await api.GET("/v1/shops/{shop_id}/reviews", {
        params: { path: { shop_id: shopId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    retry,
  });
}

export function shippingQuery(api: ApiClient, shopId: string) {
  return queryOptions({
    queryKey: liveKeys.shipping(shopId),
    queryFn: async (): Promise<ShopShipping> => {
      const { data, error, response } = await api.GET("/v1/shops/{shop_id}/shipping", {
        params: { path: { shop_id: shopId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    retry,
  });
}

/* ------------------------------------------------------------------ the shop on screen */

export interface LiveShops {
  /** Every shop of every workspace the user belongs to; undefined while loading. */
  shops: ShopView[] | undefined;
  isError: boolean;
  refetch: () => void;
}

/** The shops of all the user's workspaces, the way Home and the sidebar count them. */
export function useLiveShops(): LiveShops {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const organizations = me.data?.memberships.map((m) => m.organization_id) ?? [];
  return useQueries({
    queries: organizations.map((organizationId) => shopsQuery(api, organizationId)),
    combine: (results) => {
      // The way the sidebar's shop card counts them: shops as soon as one workspace has some;
      // none only when every workspace answered; an error when one could not be read and no
      // shop is known (never "connect a shop" over a failed list; Codex review of #35).
      const known = results.flatMap((r) => r.data ?? []);
      const done = me.data !== undefined && results.every((r) => r.isSuccess);
      const failed =
        known.length === 0 && (me.isError || results.some((r) => r.isError && !r.isFetching));
      return {
        shops: known.length > 0 || done ? known : undefined,
        isError: failed,
        refetch: () => {
          void me.refetch();
          for (const r of results) if (r.isError) void r.refetch();
        },
      };
    },
  });
}

/** The shop a commerce screen shows: the first active one until the user picks another. */
export function useLiveShop(): LiveShops & {
  shop: ShopView | undefined;
  choose: (shopId: string) => void;
} {
  const live = useLiveShops();
  const [chosen, setChosen] = useState<string | null>(null);
  const shops = live.shops ?? [];
  const shop =
    shops.find((s) => s.id === chosen) ?? shops.find((s) => s.status === "active") ?? shops[0];
  return { ...live, shop, choose: setChosen };
}

/* ------------------------------------------------------------------ money and time */

/**
 * Money in its own currency, symbol first in every language (`$1,284.50`), so the amount reads
 * the same inside Hebrew text; screens put it in `N` (left-to-right).
 */
export function useMoney(): (
  money: MoneyView | undefined,
  options?: { whole?: boolean },
) => string {
  const { locale } = useLocale();
  return (money, options) => {
    if (money === undefined) return "—";
    const amount = Number(money.amount);
    // Hebrew puts the symbol after the number; inside a left-to-right run that reads "116$".
    return new Intl.NumberFormat(locale.startsWith("he") ? "en-US" : locale, {
      style: "currency",
      currency: money.currency,
      currencyDisplay: "narrowSymbol",
      ...(options?.whole === true ? { maximumFractionDigits: 0 } : {}),
    }).format(amount);
  };
}

/** A short date ("15 Oct") in the user's language. */
export function useShortDate(): (iso: string) => string {
  const { locale } = useLocale();
  return (iso) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));
}

/** Whole numbers in the user's language. */
export function useCount(): (n: number) => string {
  const { locale } = useLocale();
  return (n) => new Intl.NumberFormat(locale).format(n);
}

/* ------------------------------------------------------------------ freshness */

/**
 * "Live from Etsy · updated 2 minutes ago", or, when Etsy did not answer and an older copy
 * stands in, "Etsy is not answering · showing data from 10:42".
 */
export function LiveNote({
  fetchedAt,
  stale,
  className,
}: {
  fetchedAt: string;
  stale: boolean;
  className?: string;
}) {
  const { t } = useLingui();
  const { locale } = useLocale();
  const now = useNow(30_000);
  const age = Math.max(now, Date.parse(fetchedAt)) - Date.parse(fetchedAt);
  const when = ago(fetchedAt, Math.max(now, Date.parse(fetchedAt)), locale);
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
    new Date(fetchedAt),
  );
  return (
    <p
      role={stale ? "status" : undefined}
      className={cx(
        "m-0 inline-flex min-w-0 items-center gap-2 text-caption font-light",
        stale ? "text-secondary" : "text-muted",
        className,
      )}
    >
      <Dot tone={stale ? "attention" : "success"} />
      <span className="truncate">
        {stale ? (
          <>{t`Etsy is not answering · showing data from ${time}`}</>
        ) : (
          <>
            {t`Live from Etsy`} ·{" "}
            <time dateTime={fetchedAt}>
              {age < 120_000 ? t`updated just now` : t`updated ${when}`}
            </time>
          </>
        )}
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------ honest states */

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

/** Rows of placeholders while live data is on its way. */
export function LiveSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <div className="flex grow flex-col gap-3 px-6 py-4" aria-busy="true">
      <span role="status" className="sr-only">
        {label}
      </span>
      {Array.from({ length: rows }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="h-9 rounded-pill bg-hover motion-safe:animate-pulse"
          style={{ width: `${String(100 - ((i * 13) % 35))}%` }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ pictures */

/**
 * A listing's photo, hot-linked from Etsy's image host (never proxied or stored): lazy, in a
 * fixed square that pulses until it arrives; when it cannot load (blocked, gone), a calm tile
 * with the title's first letter takes its place.
 */
export function ListingPhoto({
  src,
  alt,
  title,
  size,
  className,
}: {
  src: string | null | undefined;
  alt?: string | null | undefined;
  title: string;
  size: number;
  className?: string;
}) {
  // Kept per source: a photo that failed must not hide the next listing's (Codex, #35).
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const failed = src !== null && src !== undefined && failedSrc === src;
  const loaded = src !== null && src !== undefined && loadedSrc === src;
  // A fixed square box: nothing moves when the photo arrives; it pulses until then.
  const style = { width: size, height: size };
  if (src === null || src === undefined || failed)
    return (
      <span
        aria-hidden="true"
        style={style}
        className={cx(
          "inline-flex shrink-0 items-center justify-center rounded-card bg-raised font-display text-secondary",
          className,
        )}
      >
        {Array.from(title.trim()).at(0)?.toUpperCase() ?? "·"}
      </span>
    );
  return (
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      style={style}
      className={cx(
        "shrink-0 rounded-card bg-hover object-cover",
        !loaded && "motion-safe:animate-pulse",
        className,
      )}
      onLoad={() => {
        setLoadedSrc(src);
      }}
      onError={() => {
        setFailedSrc(src);
      }}
    />
  );
}
