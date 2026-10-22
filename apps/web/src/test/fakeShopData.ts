import type { components } from "@htco/api-client";

// Invented Etsy data for the in-memory API (`?demo`, tests): a small candle-and-home shop with
// a month of orders and five years of older ones, its listings, reviews, shipping and
// statistics. Every name, number and text is made up;
// buyer names are first name and initial, as the API sends them.

type Overview = components["schemas"]["ShopOverviewView"];
type Orders = components["schemas"]["OrdersView"];
type Order = components["schemas"]["OrderView"];
type Listings = components["schemas"]["ListingsView"];
type Listing = components["schemas"]["ListingView"];
type Reviews = components["schemas"]["ReviewsView"];
type Shipping = components["schemas"]["ShippingView"];
type Stats = components["schemas"]["ShopStatsView"];
export type FakePeriod = "30d" | "90d" | "12m" | "all";

/** Orders read per period at most, as the API caps them. */
const CAPS: Record<FakePeriod, number> = { "30d": 500, "90d": 1000, "12m": 2000, all: 2000 };
const OPENED = "2021-03-14T09:00:00Z";
const COUNTRIES = ["US", "US", "GB", "DE", "US", "IL", "CA", "US", "AU", "FR", "US", "NL"];

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const usd = (amount: number) => ({ amount: amount.toFixed(2), currency: "USD" });

/** A product photo drawn as an SVG data URL (the app's CSP allows `data:` images). */
function photo(hue: number, shape: "jar" | "cloth" | "mug" | "print"): string {
  const body =
    shape === "jar"
      ? `<rect x="34" y="30" width="32" height="44" rx="6" fill="hsl(${String(hue)} 35% 55%)"/><rect x="38" y="24" width="24" height="8" rx="2" fill="#2b2b2b"/><path d="M50 12c3 5 3 8 0 11c-3-3-3-6 0-11z" fill="#f2b44b"/>`
      : shape === "cloth"
        ? `<rect x="24" y="22" width="52" height="56" rx="3" fill="hsl(${String(hue)} 30% 70%)"/><path d="M24 34h52M24 46h52M24 58h52" stroke="#ffffff" stroke-opacity=".6" stroke-width="3"/>`
        : shape === "mug"
          ? `<rect x="28" y="30" width="36" height="40" rx="5" fill="hsl(${String(hue)} 40% 60%)"/><path d="M64 38h6a8 8 0 0 1 0 16h-6" fill="none" stroke="hsl(${String(hue)} 40% 60%)" stroke-width="5"/>`
          : `<rect x="28" y="16" width="44" height="64" rx="1" fill="#1d1d1d"/><circle cx="50" cy="44" r="14" fill="none" stroke="hsl(${String(hue)} 60% 75%)" stroke-width="2"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="hsl(${String(hue)} 20% 94%)"/>${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface Product {
  id: number;
  title: string;
  price: number;
  quantity: number;
  views: number;
  favorers: number;
  section: number | null;
  tags: string[];
  hue: number;
  shape: "jar" | "cloth" | "mug" | "print";
  digital?: boolean;
}

const SECTIONS = [
  { section_id: 51, title: "Candles", active_listing_count: 3 },
  { section_id: 52, title: "Kitchen linen", active_listing_count: 2 },
  { section_id: 53, title: "Mugs", active_listing_count: 2 },
];

const PRODUCTS: readonly Product[] = [
  {
    id: 1402211,
    title: "Hand-poured soy candle, cedar and fig",
    price: 28,
    quantity: 34,
    views: 1840,
    favorers: 212,
    section: 51,
    tags: ["soy candle", "cedar", "gift for her"],
    hue: 30,
    shape: "jar",
  },
  {
    id: 1402212,
    title: "Linen tea towel, olive stripe",
    price: 18,
    quantity: 52,
    views: 1220,
    favorers: 140,
    section: 52,
    tags: ["linen", "kitchen", "tea towel"],
    hue: 85,
    shape: "cloth",
  },
  {
    id: 1402213,
    title: "Stoneware mug with your name",
    price: 32,
    quantity: 19,
    views: 2310,
    favorers: 305,
    section: 53,
    tags: ["personalized mug", "stoneware"],
    hue: 200,
    shape: "mug",
  },
  {
    id: 1402214,
    title: "Amber jar candle, sea salt",
    price: 26,
    quantity: 3,
    views: 960,
    favorers: 88,
    section: 51,
    tags: ["candle", "sea salt"],
    hue: 20,
    shape: "jar",
  },
  {
    id: 1402215,
    title: "Night sky print, custom date",
    price: 42,
    quantity: 999,
    views: 3120,
    favorers: 410,
    section: null,
    tags: ["star map", "custom print"],
    hue: 230,
    shape: "print",
    digital: true,
  },
  {
    id: 1402216,
    title: "Linen napkins, set of four",
    price: 36,
    quantity: 0,
    views: 540,
    favorers: 47,
    section: 52,
    tags: ["napkins", "linen"],
    hue: 40,
    shape: "cloth",
  },
  {
    id: 1402217,
    title: "Speckled espresso cup",
    price: 22,
    quantity: 27,
    views: 780,
    favorers: 61,
    section: 53,
    tags: ["espresso", "ceramic"],
    hue: 15,
    shape: "mug",
  },
  {
    id: 1402218,
    title: "Travel tin candle, lavender",
    price: 14,
    quantity: 61,
    views: 690,
    favorers: 58,
    section: 51,
    tags: ["travel candle", "lavender"],
    hue: 270,
    shape: "jar",
  },
];

const FIRST: Product = PRODUCTS[0] ?? {
  id: 1,
  title: "Candle",
  price: 1,
  quantity: 1,
  views: 0,
  favorers: 0,
  section: null,
  tags: [],
  hue: 0,
  shape: "jar",
};
const BUYERS = [
  "Emma R.",
  "Liam K.",
  "Sofia M.",
  "Noah B.",
  "Olivia P.",
  "Ava T.",
  "Mia S.",
  "Lucas D.",
];
const CARRIERS = ["usps", "israel-post", "dhl"];

function listing(p: Product, now: number): Listing {
  const section = SECTIONS.find((s) => s.section_id === p.section);
  const image = photo(p.hue, p.shape);
  return {
    listing_id: p.id,
    title: p.title,
    state: "active",
    quantity: p.quantity,
    price: usd(p.price),
    url: `https://www.etsy.com/listing/${String(p.id)}`,
    image_url: image,
    thumbnail_url: image,
    image_alt: null,
    views: p.views,
    favorer_count: p.favorers,
    tags: p.tags,
    section_id: p.section,
    section_title: section?.title ?? null,
    is_digital: p.digital === true,
    is_personalizable: p.id === 1402213 || p.id === 1402215,
    has_variations: p.id === 1402212,
    created_at: new Date(now - 200 * DAY).toISOString(),
    updated_at: new Date(now - 3 * DAY).toISOString(),
  };
}

/** A month of orders, newest first: a few today, one late, cancelled and refunded ones. */
function orders(now: number, seed: number, busy: boolean): Order[] {
  const found: Order[] = [];
  const count = busy ? 160 : 46 - seed * 7;
  for (let k = 0; k < count; k++) {
    // Denser in the last days: 4 today, then about one and a half a day.
    const age = k < 4 - (seed % 3) ? (k + 1) * 1.7 * HOUR : (4 + (k - 4) * 0.62) * DAY * 1.1;
    const created = now - age;
    const product = PRODUCTS[(k * 5) % PRODUCTS.length] ?? FIRST;
    const second = k % 4 === 0 ? PRODUCTS[(k * 3 + 1) % PRODUCTS.length] : undefined;
    const qty = k % 6 === 2 ? 2 : 1;
    const subtotal = product.price * qty + (second?.price ?? 0);
    const shipping = product.digital === true && second === undefined ? 0 : 6.5;
    const discount = k % 9 === 4 ? 3 : 0;
    const shipBy = created + 3 * DAY;
    let state: Order["state"] = age < 2.2 * DAY ? "paid" : "shipped";
    if (k === 6) state = "paid"; // past its ship-by date: late
    if (k === 11) state = "canceled";
    if (k === 23) state = "refunded";
    if (k === 2) state = "unpaid";
    if (product.digital === true && second === undefined && state === "paid") state = "shipped";
    const shippedAt = created + 1.6 * DAY;
    found.push({
      order_id: 3_412_880_100 - k * 37,
      state,
      created_at: new Date(created).toISOString(),
      updated_at: new Date(Math.min(now, created + 2 * DAY)).toISOString(),
      ship_by:
        product.digital === true && second === undefined ? null : new Date(shipBy).toISOString(),
      overdue: state === "paid" && shipBy < now,
      total: usd(subtotal + shipping - discount),
      subtotal: usd(subtotal),
      shipping: usd(shipping),
      discount: usd(discount),
      units: qty + (second === undefined ? 0 : 1),
      items: [
        {
          listing_id: product.id,
          title: product.title,
          quantity: qty,
          unit_price: usd(product.price),
          sku: `HW-${String(product.id).slice(-3)}`,
          is_digital: product.digital === true,
        },
        ...(second === undefined
          ? []
          : [
              {
                listing_id: second.id,
                title: second.title,
                quantity: 1,
                unit_price: usd(second.price),
                sku: `HW-${String(second.id).slice(-3)}`,
                is_digital: second.digital === true,
              },
            ]),
      ],
      shipments:
        state === "shipped" && !(product.digital === true && second === undefined)
          ? [
              {
                carrier: CARRIERS[k % CARRIERS.length] ?? "usps",
                shipped_at: new Date(Math.min(now, shippedAt)).toISOString(),
                tracking_code: `9400 1118 99${String(10_000_000 + k * 7919)}`,
              },
            ]
          : [],
      buyer: BUYERS[k % BUYERS.length] ?? null,
    });
  }
  return found;
}

/**
 * Older orders, from a month back to when the shop opened: nearly all shipped (completed), a few
 * cancelled or refunded. Each with the destination country the statistics count.
 */
function history(now: number, seed: number): Order[] {
  const recent = orders(now, seed, false);
  const opened = Date.parse(OPENED);
  const count = 150 - seed * 20;
  const span = now - 31 * DAY - opened;
  return Array.from({ length: count }, (_, k) => {
    // More orders in later years: the gaps shrink towards today.
    const share = 1 - ((k + 1) / (count + 1)) ** 0.7;
    const created = opened + span * share + ((k * 7919) % 11) * HOUR;
    const template = recent[(k * 7) % recent.length] ?? recent[0];
    if (template === undefined) throw new Error("no orders to copy");
    const state: Order["state"] = k % 23 === 5 ? "canceled" : k % 31 === 9 ? "refunded" : "shipped";
    return {
      ...template,
      order_id: 3_300_000_000 - k * 211,
      state,
      created_at: new Date(created).toISOString(),
      updated_at: new Date(created + 2 * DAY).toISOString(),
      ship_by: template.ship_by === null ? null : new Date(created + 3 * DAY).toISOString(),
      overdue: false,
      shipments: template.items.every((i) => i.is_digital)
        ? []
        : [
            {
              carrier: CARRIERS[k % CARRIERS.length] ?? "usps",
              shipped_at: new Date(created + 1.5 * DAY).toISOString(),
              tracking_code: `9400 1118 98${String(10_000_000 + k * 6113)}`,
            },
          ],
      buyer: BUYERS[(k + 3) % BUYERS.length] ?? null,
    };
  });
}

/**
 * What the API answers for a connected shop. `contact`: the role sees buyer details. `recent`:
 * false is a shop whose orders are all older than 30 days (the owner's live shop, 2026-10).
 */
export function fakeShopData(
  shopId: string,
  name: string,
  now: number,
  contact: boolean,
  busy = false,
  recent = true,
) {
  // Each demo shop its own numbers.
  const seed = Array.from(shopId).reduce((n, c) => n + c.charCodeAt(0), 0) % 4;
  const month = recent ? orders(now, seed, busy) : [];
  const older = history(now, seed);
  const everything = [...month, ...older];
  // The 30-day window answers the month's orders as before (the demo month runs a little long).
  const monthIds = new Set(month.map((o) => o.order_id));
  const all = everything.map((o) =>
    contact
      ? o
      : { ...o, buyer: null, shipments: o.shipments.map((s) => ({ ...s, tracking_code: null })) },
  );
  const fetched = new Date(now - 90_000).toISOString();
  const fresh = { source: "etsy_live" as const, fetched_at: fetched, stale: false };
  const offset = -new Date(now).getTimezoneOffset() * 60_000;
  const dayOf = (iso: string) => Math.floor((Date.parse(iso) + offset) / DAY);
  const today = dayOf(new Date(now).toISOString());
  // The overview's sales: the last 30 days (and one more for time zones), as the API reads them.
  const sales = all.filter(
    (o) =>
      o.state !== "unpaid" &&
      o.state !== "canceled" &&
      o.state !== "refunded" &&
      now - Date.parse(o.created_at) < 31 * DAY,
  );
  const period = (days: number) => {
    const span = sales.filter((o) => today - dayOf(o.created_at) < days);
    return {
      orders: span.length,
      units: span.reduce((n, o) => n + o.units, 0),
      revenue: usd(span.reduce((n, o) => n + Number(o.total.amount), 0)),
    };
  };
  const daily = Array.from({ length: 30 }, (_, i) => {
    const day = today - 29 + i;
    const span = sales.filter((o) => dayOf(o.created_at) === day);
    return {
      date: new Date(day * DAY).toISOString().slice(0, 10),
      orders: span.length,
      revenue: span.reduce((n, o) => n + Number(o.total.amount), 0).toFixed(2),
    };
  });
  const units = new Map<number, { title: string; units: number; revenue: number }>();
  for (const o of sales)
    for (const item of o.items) {
      if (item.listing_id === null) continue;
      const t = units.get(item.listing_id) ?? { title: item.title, units: 0, revenue: 0 };
      t.units += item.quantity;
      t.revenue += Number(item.unit_price.amount) * item.quantity;
      units.set(item.listing_id, t);
    }
  const overview: Overview = {
    ...fresh,
    shop_id: shopId,
    profile: {
      etsy_shop_id: 41_870_022,
      name: name.replace(/[^A-Za-z]/g, "") || "FakeShop",
      title: "Small-batch candles and kitchen linen",
      url: "https://www.etsy.com/shop/WillowAndWick",
      currency: "USD",
      icon_url: null,
      banner_url: null,
      is_vacation: false,
      active_listing_count: PRODUCTS.length,
      digital_listing_count: 1,
      sold_count: 1_286 - seed * 263,
      favorer_count: 1_204 - seed * 287,
      review_average: ["4.9", "4.7", "4.8", "5.0"][seed] ?? "4.9",
      review_count: 318 - seed * 71,
      opened_at: OPENED,
      ships_from_country: "IL",
      location_country: "IL",
      languages: ["en-US"],
      accepts_custom_requests: true,
    },
    sales: {
      currency: "USD",
      today: period(1),
      last_7_days: period(7),
      last_30_days: period(30),
      daily,
      awaiting_shipment: all.filter((o) => o.state === "paid").length,
      overdue: all.filter((o) => o.overdue).length,
      top_listings: [...units.entries()]
        .sort((a, b) => b[1].units - a[1].units)
        .slice(0, 5)
        .map(([listing_id, t]) => ({
          listing_id,
          title: t.title,
          units: t.units,
          revenue: usd(t.revenue),
        })),
      partial: false,
    },
  };
  const startOf = (period: FakePeriod): number => {
    if (period === "all") return Date.parse(OPENED);
    if (period === "12m") {
      const start = new Date(now);
      start.setUTCFullYear(start.getUTCFullYear() - 1);
      return start.getTime();
    }
    return now - (period === "90d" ? 90 : 30) * DAY;
  };
  const ordersFor = (
    state: string | null,
    limit: number,
    offsetN: number,
    period: FakePeriod = "30d",
  ): Orders => {
    const start = startOf(period);
    const inPeriod = all
      .filter((o) =>
        period === "30d" ? monthIds.has(o.order_id) : Date.parse(o.created_at) >= start,
      )
      .slice(0, CAPS[period]);
    const count = (s: string) => inPeriod.filter((o) => o.state === s).length;
    const matching = inPeriod.filter((o) =>
      state === null ? true : state === "overdue" ? o.overdue : o.state === state,
    );
    return {
      ...fresh,
      shop_id: shopId,
      period,
      window_start: new Date(start).toISOString(),
      items: matching.slice(offsetN, offsetN + limit),
      total: matching.length,
      counts: {
        unpaid: count("unpaid"),
        paid: count("paid"),
        shipped: count("shipped"),
        canceled: count("canceled"),
        refunded: count("refunded"),
        overdue: inPeriod.filter((o) => o.overdue).length,
      },
      buyer_details: contact,
      partial: false,
      cap: CAPS[period],
    };
  };
  // The statistics: aggregates of every order read, as the API makes them (no buyer data).
  const country = new Map(
    everything.map((o, k) => [o.order_id, COUNTRIES[k % COUNTRIES.length] ?? "US"] as const),
  );
  const sold = all.filter(
    (o) => o.state !== "unpaid" && o.state !== "canceled" && o.state !== "refunded",
  );
  const monthOf = (iso: string) => {
    const d = new Date(Date.parse(iso) + offset);
    return `${String(d.getUTCFullYear())}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
  };
  const months: string[] = [];
  const firstSale = sold.at(-1);
  if (firstSale !== undefined) {
    const cursor = new Date(`${monthOf(firstSale.created_at)}T00:00:00Z`);
    const last = monthOf(new Date(now).toISOString());
    for (;;) {
      const key = cursor.toISOString().slice(0, 10);
      months.push(key);
      if (key >= last) break;
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  }
  const monthly = months.map((month) => {
    const span = sold.filter((o) => monthOf(o.created_at) === month);
    return {
      month,
      orders: span.length,
      revenue: span.reduce((n, o) => n + Number(o.total.amount), 0).toFixed(2),
    };
  });
  const revenue = sold.reduce((n, o) => n + Number(o.total.amount), 0);
  const tallies = new Map<number, { title: string; units: number; revenue: number }>();
  for (const o of sold)
    for (const item of o.items) {
      if (item.listing_id === null) continue;
      const t = tallies.get(item.listing_id) ?? { title: item.title, units: 0, revenue: 0 };
      t.units += item.quantity;
      t.revenue += Number(item.unit_price.amount) * item.quantity;
      tallies.set(item.listing_id, t);
    }
  const byCountry = new Map<string, number>();
  for (const o of sold) {
    const code = country.get(o.order_id) ?? "US";
    byCountry.set(code, (byCountry.get(code) ?? 0) + 1);
  }
  const best = monthly
    .filter((m) => m.orders > 0)
    .reduce<(typeof monthly)[number] | null>(
      (top, m) => (top === null || Number(m.revenue) > Number(top.revenue) ? m : top),
      null,
    );
  const stats = (cap = CAPS.all): Stats => {
    const read = all.slice(0, cap);
    return {
      ...fresh,
      shop_id: shopId,
      profile: overview.profile,
      sales: {
        currency: "USD",
        orders: sold.length,
        units: sold.reduce((n, o) => n + o.units, 0),
        revenue: usd(revenue),
        average_order_value: sold.length === 0 ? null : usd(revenue / sold.length),
        monthly,
        best_month: best,
        top_products: [...tallies.entries()]
          .sort((a, b) => b[1].units - a[1].units || b[1].revenue - a[1].revenue)
          .slice(0, 5)
          .map(([listing_id, t]) => ({
            listing_id,
            title: t.title,
            units: t.units,
            revenue: usd(t.revenue),
          })),
        countries: [...byCountry.entries()]
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([code, n]) => ({ country: code, orders: n })),
        first_order_at: all.at(-1)?.created_at ?? null,
        receipts_read: read.length,
        partial: false,
      },
    };
  };
  const listings: Listings = {
    ...fresh,
    shop_id: shopId,
    items: PRODUCTS.map((p) => listing(p, now)),
    total_count: PRODUCTS.length,
    sections: SECTIONS,
    truncated: false,
  };
  const reviewTexts = [
    "Smells like a walk in the forest. Second order already.",
    "Beautiful towel, a little thinner than I expected but lovely.",
    "The mug arrived well packed and the name looks perfect.",
    null,
    "Lovely candle, burned evenly for hours.",
    "Took longer to arrive than promised.",
    "Gift for my sister, she loved it.",
    "חמוד מאוד, הגיע ארוז יפה.",
  ];
  const ratings = [5, 4, 5, 5, 5, 3, 5, 5];
  const reviews: Reviews = {
    ...fresh,
    shop_id: shopId,
    average: overview.profile.review_average,
    count: overview.profile.review_count ?? 0,
    distribution: [
      { stars: 5, count: 88 },
      { stars: 4, count: 8 },
      { stars: 3, count: 3 },
      { stars: 2, count: 1 },
      { stars: 1, count: 0 },
    ],
    sample_size: 100,
    items: reviewTexts.map((text, i) => ({
      listing_id: PRODUCTS[i % PRODUCTS.length]?.id ?? 1402211,
      rating: ratings[i] ?? 5,
      text,
      language: "en",
      created_at: new Date(now - (i * 2.3 + 0.4) * DAY).toISOString(),
    })),
  };
  const shipping: Shipping = {
    ...fresh,
    shop_id: shopId,
    profiles: [
      {
        profile_id: 2001,
        title: "Standard from Israel",
        origin_country: "IL",
        profile_type: "manual",
        destinations: [
          {
            country: "US",
            region: null,
            first_item: usd(6.5),
            additional_item: usd(2),
            min_delivery_days: 8,
            max_delivery_days: 14,
            mail_class: null,
          },
          {
            country: null,
            region: "eu",
            first_item: usd(7.5),
            additional_item: usd(2.5),
            min_delivery_days: 7,
            max_delivery_days: 12,
            mail_class: null,
          },
          {
            country: "IL",
            region: null,
            first_item: usd(4),
            additional_item: usd(1),
            min_delivery_days: 2,
            max_delivery_days: 4,
            mail_class: null,
          },
        ],
        upgrade_count: 1,
      },
      {
        profile_id: 2002,
        title: "Digital download",
        origin_country: "IL",
        profile_type: "manual",
        destinations: [],
        upgrade_count: 0,
      },
    ],
    return_policies: [
      { policy_id: 3001, accepts_returns: true, accepts_exchanges: true, return_deadline_days: 30 },
      {
        policy_id: 3002,
        accepts_returns: true,
        accepts_exchanges: false,
        return_deadline_days: 14,
      },
    ],
    production_partners: [
      { partner_id: 4001, name: "Studio Kiln Co-op", location: "Haifa, Israel" },
    ],
  };
  return { overview, ordersFor, listings, reviews, shipping, stats };
}
