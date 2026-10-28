// The AutoVA tracking relay (platform slice 6.10) in memory, for the web app's tests and the
// `?demo=shops` screens: the open items, the paste and the audited reveal, answering the problems
// the API answers. Every number here is invented.

/** A relay item as the API keeps it; `code` is the pasted number (the API's code table). */
export interface FakeRelayItem {
  id: string;
  shop_id: string;
  receipt_id: number;
  state: "awaiting_tracking" | "handed_off" | "closed";
  closed_reason: "tracking_on_etsy" | "uploaded" | "cancelled" | "expired" | null;
  paid_at: string;
  opened_at: string;
  updated_at: string;
  carrier?: string | null;
  code?: string | null;
}

/** What the fake relay holds and how it misbehaves on purpose. */
export interface FakeRelay {
  items: FakeRelayItem[];
  /** "unavailable": 503 relay-unavailable on every route; "hang": the list never answers. */
  trouble?: "unavailable" | "hang" | undefined;
  /** Numbers the Etsy receipt already carries: a paste of one closes the item. */
  onEtsy: string[];
  /** Numbers pasted for another order of the shop (409 tracking-already-used). */
  usedElsewhere: string[];
  /** The items whose number was revealed, in order (the API's `relay.code_revealed` audit). */
  reveals: string[];
  /** The pastes received: item and carrier, never the number. */
  pastes: { id: string; carrier: unknown }[];
  /** How many items one page of the list holds (the API's 200). */
  pageSize?: number | undefined;
}

export function fakeRelay(items: FakeRelayItem[] = [], extra: Partial<FakeRelay> = {}): FakeRelay {
  return { items, onEtsy: [], usedElsewhere: [], reveals: [], pastes: [], ...extra };
}

const HOUR = 3_600_000;
const ago = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

/** An open item waiting for its number, paid `hours` ago. */
export function fakeRelayItem(
  id: string,
  shopId: string,
  receiptId: number,
  hours: number,
  overrides: Partial<FakeRelayItem> = {},
): FakeRelayItem {
  return {
    id,
    shop_id: shopId,
    receipt_id: receiptId,
    state: "awaiting_tracking",
    closed_reason: null,
    paid_at: ago(hours),
    opened_at: ago(hours - 48),
    updated_at: ago(hours - 48),
    ...overrides,
  };
}

/** A made-up Yun Express number in its own format (`YT` and 16 digits). */
export const DEMO_HANDED_OFF_CODE = "YT2410000000004417";

/** The demo's relay: two orders waiting for a number, one handed off for the copy into Etsy. */
export function demoRelay(shopIds: readonly string[]): FakeRelay {
  const [a = "shop-1", b = a] = shopIds;
  return fakeRelay([
    fakeRelayItem("f0000000-0000-7000-8000-000000000001", a, 3_481_220_917, 104),
    fakeRelayItem("f0000000-0000-7000-8000-000000000002", b, 3_481_305_442, 78),
    fakeRelayItem("f0000000-0000-7000-8000-000000000003", a, 3_480_977_163, 130, {
      state: "handed_off",
      carrier: "yun_express",
      code: DEMO_HANDED_OFF_CODE,
      updated_at: ago(5),
    }),
  ]);
}

// The platform's formats (`htco_domain.fulfillment`), enough for the fake to accept and refuse
// as the API does. Only the fake knows them: the client never validates a number itself.
const UPU = "[A-Z]{2}\\d{9}[A-Z]{2}";
const FORMATS: Record<string, RegExp> = {
  usps: new RegExp(`^(\\d{20,22}|9\\d{15,25}|${UPU})$`),
  ups: /^(1Z[0-9A-Z]{16}|T\d{10}|\d{9}|\d{26})$/,
  fedex: /^(\d{12}|\d{15}|\d{20}|\d{22})$/,
  dhl: new RegExp(`^(\\d{10,11}|JJD\\d{18,20}|${UPU})$`),
  yun_express: new RegExp(`^(YT\\d{16}|${UPU})$`),
  china_post: new RegExp(`^${UPU}$`),
  "4px": new RegExp(`^(4PX\\d{12,16}[A-Z]{0,2}|${UPU})$`),
  yanwen: new RegExp(`^(Y[A-Z]\\d{9}[A-Z]{2}|UG\\d{9}YP|${UPU})$`),
  cainiao: new RegExp(`^(LP\\d{14,16}|CAINIAO[0-9A-Z]{6,20}|${UPU})$`),
  israel_post: new RegExp(`^${UPU}$`),
  other: /^[A-Z0-9]{8,40}$/,
};

const normalize = (code: string) => code.replace(/[\s-]+/g, "").toUpperCase();

type Answer = (status: number, body: unknown, headers?: Record<string, string>) => Response;
type Problem = (status: number, type: string, extra?: Record<string, string>) => Response;

/**
 * The relay's three routes, or `undefined` for any other route. `may` is true for an Owner or
 * Admin, `aal2` for a session with its second factor.
 */
export function relayRoutes(
  relay: FakeRelay,
  route: string,
  body: Record<string, unknown>,
  url: URL,
  who: { may: boolean; aal2: boolean; listForbidden: boolean },
  answer: Answer,
  problem: Problem,
): Response | Promise<Response> | undefined {
  if (!/^(GET|POST) \/v1\/relay-items/.test(route)) return undefined;
  if (relay.trouble === "unavailable") return problem(503, "relay-unavailable");
  const noStore = { "cache-control": "no-store" };

  if (route === "GET /v1/relay-items") {
    if (relay.trouble === "hang") return new Promise<Response>(() => undefined);
    if (who.listForbidden) return problem(403, "forbidden");
    const open = relay.items.filter((item) => item.state !== "closed");
    const size = relay.pageSize ?? 200;
    const from = Number(url.searchParams.get("cursor") ?? 0);
    const page = open.slice(from, from + size).map((item) => ({
      id: item.id,
      shop_id: item.shop_id,
      receipt_id: item.receipt_id,
      state: item.state,
      closed_reason: item.closed_reason,
      paid_at: item.paid_at,
      opened_at: item.opened_at,
      updated_at: item.updated_at,
    }));
    const more = from + size < open.length;
    return answer(200, { items: page, next_cursor: more ? String(from + size) : null });
  }

  const paste = /^POST \/v1\/relay-items\/([^/]+)\/tracking$/.exec(route);
  if (paste !== null) {
    const item = relay.items.find((candidate) => candidate.id === paste[1]);
    if (item === undefined) return problem(404, "not-found");
    if (!who.may) return problem(403, "forbidden");
    if (!who.aal2) return problem(403, "mfa-required");
    relay.pastes.push({ id: item.id, carrier: body["carrier"] });
    const carrier = (typeof body["carrier"] === "string" ? body["carrier"] : "")
      .trim()
      .toLowerCase();
    const code = normalize(typeof body["code"] === "string" ? body["code"] : "");
    const format = FORMATS[carrier];
    if (format === undefined)
      return problem(422, "tracking-invalid", {
        detail: "unknown carrier: pick one from the list",
      });
    if (code === "" || code.length > 40 || !format.test(code))
      return problem(422, "tracking-invalid", {
        detail: `this is not a valid ${carrier} tracking number`,
      });
    if (item.state !== "awaiting_tracking") return problem(409, "relay-item-moved");
    if (relay.usedElsewhere.includes(code)) return problem(409, "tracking-already-used");
    const at = new Date().toISOString();
    const onEtsy = relay.onEtsy.includes(code);
    Object.assign(item, {
      state: onEtsy ? "closed" : "handed_off",
      closed_reason: onEtsy ? "tracking_on_etsy" : null,
      carrier,
      // A number Etsy already has is not kept.
      code: onEtsy ? null : code,
      updated_at: at,
    });
    return answer(
      200,
      {
        id: item.id,
        shop_id: item.shop_id,
        receipt_id: item.receipt_id,
        state: item.state,
        closed_reason: item.closed_reason,
        carrier,
        last4: code.slice(-4),
        paid_at: item.paid_at,
        opened_at: item.opened_at,
        updated_at: at,
      },
      noStore,
    );
  }

  const reveal = /^GET \/v1\/relay-items\/([^/]+)\/code$/.exec(route);
  if (reveal !== null) {
    const item = relay.items.find((candidate) => candidate.id === reveal[1]);
    // Anyone else, a closed item or one without a number: the same 404.
    if (
      item === undefined ||
      !who.may ||
      !who.aal2 ||
      item.state !== "handed_off" ||
      item.code === null ||
      item.code === undefined
    )
      return problem(404, "not-found");
    relay.reveals.push(item.id);
    return answer(200, { code: item.code }, noStore);
  }
  return problem(404, "not-found");
}
