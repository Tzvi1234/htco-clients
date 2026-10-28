// The AutoVA tracking relay (platform slice 6.10): the orders waiting for a tracking number, the
// owner's paste, and the audited reveal of the pasted number for the copy into Etsy.
//
// The pasted number is buyer data. It reaches this client only from `GET …/code` (no-store), only
// when the person asks for it, and lives only in the component that asked: never in the query
// cache, the mutation cache, storage, a log or an address.
import type { ApiClient, components } from "@htco/api-client";
import { queryOptions } from "@tanstack/react-query";

import { ApiError, apiError } from "../../shared/api/api.tsx";

export type RelayItem = components["schemas"]["RelayItemView"];
export type RelayPaste = components["schemas"]["RelayPasteView"];

/**
 * The carriers the platform validates (`htco_domain.fulfillment.Carrier`), by the value the API
 * takes. TODO(platform): the contract types `carrier` as a plain string, so this list is kept in
 * step by hand until the API publishes the carriers (an enum on `TrackingPaste.carrier`).
 */
export const CARRIERS = [
  "yun_express",
  "4px",
  "yanwen",
  "cainiao",
  "china_post",
  "usps",
  "ups",
  "fedex",
  "dhl",
  "israel_post",
  "other",
] as const;
export type Carrier = (typeof CARRIERS)[number];

/** Carriers' names are brands: the same in both languages. */
const CARRIER_NAMES: Record<Carrier, string> = {
  yun_express: "Yun Express",
  "4px": "4PX",
  yanwen: "Yanwen",
  cainiao: "Cainiao",
  china_post: "China Post",
  usps: "USPS",
  ups: "UPS",
  fedex: "FedEx",
  dhl: "DHL",
  israel_post: "Israel Post",
  other: "Other",
};

/** A carrier's display name; one the client does not know shows as the API wrote it. */
export function carrierName(carrier: string): string {
  return (CARRIER_NAMES as Partial<Record<string, string>>)[carrier] ?? carrier;
}

/** The relay's open items move on their own (the inspector runs every 15 minutes). */
const REFRESH_MS = 60_000;

export const relayKeys = {
  all: ["relay"] as const,
  list: (organizationId: string) => ["relay", organizationId, "list"] as const,
};

function retry(failures: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failures < 1;
}

/** Pages of 200 read at most (1,000 orders); past them the screen says "more than". */
export const RELAY_PAGES = 5;

export interface RelayList {
  items: RelayItem[];
  more: boolean;
}

/** The workspace's open relay items, oldest first, every page up to the bound. No code here. */
export function relayItemsQuery(api: ApiClient, organizationId: string) {
  return queryOptions({
    queryKey: relayKeys.list(organizationId),
    queryFn: async (): Promise<RelayList> => {
      const items: RelayItem[] = [];
      let cursor: string | undefined;
      for (let page = 0; page < RELAY_PAGES; page += 1) {
        const { data, error, response } = await api.GET("/v1/relay-items", {
          params: {
            query: { organization_id: organizationId, ...(cursor === undefined ? {} : { cursor }) },
          },
        });
        if (data === undefined) throw apiError(response, error);
        items.push(...data.items.filter((item) => item.state !== "closed"));
        if (data.next_cursor === null || data.next_cursor === undefined)
          return { items, more: false };
        cursor = data.next_cursor;
      }
      return { items, more: true };
    },
    refetchInterval: REFRESH_MS,
    retry,
  });
}

/** The owner's paste: validated by the server; the answer carries the carrier and last four. */
export async function pasteTracking(
  api: ApiClient,
  organizationId: string,
  id: string,
  carrier: Carrier,
  code: string,
): Promise<RelayPaste> {
  const { data, error, response } = await api.POST("/v1/relay-items/{item_id}/tracking", {
    params: { path: { item_id: id }, query: { organization_id: organizationId } },
    body: { carrier, code },
  });
  if (data === undefined) throw apiError(response, error);
  return data;
}

/**
 * The pasted number, from the audited reveal. Called only when the person presses Reveal; the
 * caller keeps the answer in its own state and drops it when hidden or left. `cache: "no-store"`
 * keeps the browser's own cache out of it as well, whatever the server says.
 */
export async function revealCode(
  api: ApiClient,
  organizationId: string,
  id: string,
): Promise<string> {
  const { data, error, response } = await api.GET("/v1/relay-items/{item_id}/code", {
    params: { path: { item_id: id }, query: { organization_id: organizationId } },
    cache: "no-store",
  });
  if (data === undefined) throw apiError(response, error);
  return data.code;
}
