// The "New product quotes" board (platform slice 7.16): products waiting for a supplier, each
// with its quotes side by side. The server computes every total and sorts them; the screen only
// shows what it gets (golden rule 1).
import type { ApiClient, components } from "@htco/api-client";
import { queryOptions } from "@tanstack/react-query";

import { ApiError, apiError } from "../../shared/api/api.tsx";

export type QuoteBoard = components["schemas"]["QuoteBoardView"];
export type ProductQuotes = components["schemas"]["ProductQuotesView"];
export type QuoteCard = components["schemas"]["QuoteCardView"];

/** A new quote shows within a minute of its mail (AC-7.16.1): the board looks again each minute. */
const REFRESH_MS = 60_000;

export const quoteKeys = {
  board: (shopId: string) => ["quotes", shopId, "board"] as const,
};

/** A refusal given on purpose (no role, no such shop) is not asked again. */
function retry(failures: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failures < 1;
}

export function quoteBoardQuery(api: ApiClient, shopId: string) {
  return queryOptions({
    queryKey: quoteKeys.board(shopId),
    queryFn: async (): Promise<QuoteBoard> => {
      const { data, error, response } = await api.GET("/v1/shops/{shop_id}/quote-requests", {
        params: { path: { shop_id: shopId } },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    refetchInterval: REFRESH_MS,
    retry,
  });
}
