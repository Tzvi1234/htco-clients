// The Design 1C demo's commerce sample data (demo_noimg.html: PR, OST, ORD, SHOPS, CUST), shown
// only inside demo frames and Demo-marked parts until orders, listings and suppliers sync.
import { useLingui } from "@lingui/react/macro";

import type { AgentId } from "../work/agents.ts";
import {
  bi,
  useBi,
  type AgentStatus,
  type Bi,
  type ProductKind,
} from "../../shared/ui/kit/index.ts";

export const PRODUCT_NAMES: Record<ProductKind, Bi> = {
  star: bi("הדפס מפת כוכבים אישית", "Personalized star map print"),
  pet: bi("פורטרט חיית מחמד", "Custom pet portrait"),
  towel: bi("מגבת מטבח מפשתן", "Linen tea towel"),
  mug: bi("ספל קרמיקה עם שם", "Ceramic name mug"),
};

export const PRODUCT_PRICES: Record<ProductKind, number> = {
  star: 42,
  pet: 72,
  towel: 18,
  mug: 24,
};

export type DemoShop = "prints" | "home";

export const PRODUCT_SHOP: Record<ProductKind, DemoShop> = {
  star: "prints",
  pet: "prints",
  towel: "home",
  mug: "home",
};

export const SHOP_NAMES: Record<DemoShop, string> = { prints: "HTZ Prints", home: "HTZ Home" };

/** Product names in the user's language. */
export function useProductNames(): Record<ProductKind, string> {
  const text = useBi();
  return {
    star: text(PRODUCT_NAMES.star),
    pet: text(PRODUCT_NAMES.pet),
    towel: text(PRODUCT_NAMES.towel),
    mug: text(PRODUCT_NAMES.mug),
  };
}

export type OrderStatus = "paid" | "prod" | "ship" | "deliv" | "late";

export const ORDER_GLYPH: Record<OrderStatus, AgentStatus> = {
  paid: "idle",
  prod: "running",
  ship: "waitext",
  deliv: "delivered",
  late: "waityou",
};

export function useOrderStatusLabels(): Record<OrderStatus, string> {
  const { t } = useLingui();
  return {
    paid: t`Paid`,
    prod: t`In production`,
    ship: t`Shipped`,
    deliv: t`Delivered`,
    late: t`Late`,
  };
}

export interface DemoOrder {
  n: string;
  customer: string;
  item: ProductKind;
  qty: number;
  total: number;
  status: OrderStatus;
  shop: DemoShop;
  tracking: string;
  agent: AgentId;
}

const CUSTOMERS = ["Emma R.", "Liam K.", "Sofia M.", "Noah B.", "Olivia P.", "Ava T."];

/** Orders #3178 down to #3141, built the way the demo builds them. */
export const ORDERS: readonly DemoOrder[] = (() => {
  const items: [ProductKind, number, number?][] = [
    ["star", 1],
    ["pet", 1],
    ["towel", 2],
    ["mug", 1],
    ["star", 2],
    ["mug", 2],
    ["pet", 1, 96],
    ["towel", 1],
    ["star", 1],
    ["mug", 1],
  ];
  const orders: DemoOrder[] = [];
  for (let n = 3178; n >= 3141; n--) {
    const k = 3178 - n;
    const [item, qty, fixed] = items[k % items.length] ?? ["star", 1];
    let status: OrderStatus = k < 5 ? "paid" : k < 12 ? "prod" : k < 24 ? "ship" : "deliv";
    if (n === 3152 || n === 3160) status = "late";
    const customer =
      n === 3152 ? "Emma R." : n === 3160 ? "Liam K." : (CUSTOMERS[k % 6] ?? "Emma R.");
    const agent: AgentId =
      status === "paid"
        ? "maya"
        : status === "prod"
          ? "tom"
          : status === "late"
            ? "eitan"
            : k % 3
              ? "eitan"
              : "noa";
    orders.push({
      n: String(n),
      customer,
      item,
      qty,
      total: fixed ?? PRODUCT_PRICES[item] * qty,
      status,
      shop: PRODUCT_SHOP[item],
      tracking:
        status === "paid" || status === "prod"
          ? ""
          : `9400 1118 9922 ${String(n)} 0${String((k % 9) + 1)}`,
      agent,
    });
  }
  return orders;
})();
