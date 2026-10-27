// Invented supplier quotes for the in-memory API (`GET /v1/shops/{id}/quote-requests`, platform
// slice 7.16), already sorted by total as the server sends them. No real supplier or price.
import type { components } from "@htco/api-client";

type ProductQuotes = components["schemas"]["ProductQuotesView"];
type QuoteCard = components["schemas"]["QuoteCardView"];

const DAY = 86_400_000;

function iso(at: number): string {
  return new Date(at).toISOString();
}

function day(at: number): string {
  return iso(at).slice(0, 10);
}

function card(
  id: string,
  supplier: string,
  unit: string,
  shipping: string,
  validUntil: string | null,
  choosable: boolean,
  now: number,
): QuoteCard {
  const total = (Number(unit) + Number(shipping)).toFixed(2);
  return {
    id,
    supplier,
    currency: "USD",
    unit_price: unit,
    shipping_cost: shipping,
    total,
    shipping_method: supplier.includes("Express") ? "DHL Express" : "Yun Express",
    processing_days: { min: 2, max: 4 },
    shipping_days: { min: 7, max: 12 },
    valid_until: validUntil,
    received_at: iso(now - DAY),
    choosable,
  };
}

/** Two products waiting: one with three quotes (one expired), one with none yet. */
export function fakeQuoteBoard(listingIds: readonly number[], now = Date.now()): ProductQuotes[] {
  const [first, second] = listingIds;
  const items: ProductQuotes[] = [];
  if (first !== undefined)
    items.push({
      request_id: "e0000000-0000-7000-8000-000000000001",
      listing_id: first,
      variant: "",
      state: "quotes_received",
      requested_at: iso(now - 3 * DAY),
      quotes: [
        card(
          "e1000000-0000-7000-8000-000000000001",
          "Guangzhou Leather Works",
          "7.40",
          "2.10",
          day(now + 14 * DAY),
          true,
          now,
        ),
        card(
          "e1000000-0000-7000-8000-000000000002",
          "Express Hides Co.",
          "8.20",
          "3.50",
          null,
          true,
          now,
        ),
        card(
          "e1000000-0000-7000-8000-000000000003",
          "Old Mill Supply",
          "5.10",
          "1.00",
          day(now - 2 * DAY),
          false,
          now,
        ),
      ],
    });
  if (second !== undefined)
    items.push({
      request_id: "e0000000-0000-7000-8000-000000000002",
      listing_id: second,
      variant: "",
      state: "waiting_for_quotes",
      requested_at: iso(now - DAY),
      quotes: [],
    });
  return items;
}
