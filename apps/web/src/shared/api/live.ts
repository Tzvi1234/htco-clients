// The connected shop's live data (platform `docs/features/etsy-integration/dashboard-data.md`):
// the queries and the shop the commerce screens show. Its words and pictures are in the kit
// (`kit/live.tsx`), its money and dates in `shared/i18n/format.ts`, and the reconnect states in
// the shops feature.
import type { ApiClient, components } from "@htco/api-client";
import { useQueries, useQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";

import { ApiError, apiError, meQuery, shopsQuery, useApi, type ShopView } from "./api.tsx";

export type ShopOverview = components["schemas"]["ShopOverviewView"];
export type ShopOrders = components["schemas"]["OrdersView"];
export type ShopOrder = components["schemas"]["OrderView"];
/** One order with its status timeline from the stored history (slice 5.6). */
export type ShopOrderDetail = components["schemas"]["OrderDetailView"];
export type OrderStatusChange = components["schemas"]["OrderStatusChangeView"];
/** The stored history's state: `syncing_history` while the backfill runs, then `complete`. */
export type HistorySync = components["schemas"]["SyncView"];
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
  order: (shopId: string, orderId: number) => ["live", shopId, "order", orderId] as const,
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

/** One order with its status timeline (the order sheet); never cached by the browser. */
export function orderQuery(api: ApiClient, shopId: string, orderId: number) {
  return queryOptions({
    queryKey: liveKeys.order(shopId, orderId),
    queryFn: async (): Promise<ShopOrderDetail> => {
      const { data, error, response } = await api.GET("/v1/shops/{shop_id}/orders/{order_id}", {
        params: { path: { shop_id: shopId, order_id: orderId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
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
