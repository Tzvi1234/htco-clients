import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { ShopOrder } from "./live.tsx";
import { RefundChip, RefundDetails } from "./refunds.tsx";
import { App } from "../../app/App.tsx";
import { LocaleProvider } from "../../shared/i18n/LocaleProvider.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";

// Refund and cancellation reasons (platform #57): each refund's reason as Etsy gave it, or "No
// reason given", its amount, date and the seller's note on the order; a chip on the row; and on
// Statistics the refunds and cancellations by reason with the rates. Invented data.

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;
const WILLOW = "d0000000-0000-7000-8000-000000000001";
const oneShop: Partial<FakeState> = {
  shops: [{ id: WILLOW, name: "Willow & Wick", status: "active" }],
  integrations: [fakeIntegration(WILLOW, "ok")],
};
// The demo's month (src/test/fakeShopData.ts): order 23 refunded with a reason and a note,
// order 11 cancelled, order 15 shipped and refunded in part without a reason.
const REFUNDED = 3_412_880_100 - 23 * 37;
const CANCELLED = 3_412_880_100 - 11 * 37;
const PARTIAL = 3_412_880_100 - 15 * 37;

async function open(path: string, locale: Locale = "en") {
  const backend = fakeBackend({ ...owner, ...oneShop });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: [path] })}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 });
  await vi.waitFor(
    () => {
      expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    },
    { timeout: 8000 },
  );
  return { user: userEvent.setup() };
}

function rowOf(id: number): HTMLElement {
  const cell = screen.getByRole("button", { name: `Open order ${String(id)}` });
  const row = cell.closest("tr");
  if (row === null) throw new Error(`No row for ${String(id)}`);
  return row;
}

describe("Orders: refund and cancellation reasons", () => {
  it("puts a chip on refunded and cancelled rows, and none on the others", async () => {
    await open("/commerce/orders");
    await screen.findByRole("button", { name: `Open order ${String(REFUNDED)}` });

    expect(within(rowOf(REFUNDED)).getByText("Item arrived damaged")).toBeInTheDocument();
    expect(within(rowOf(CANCELLED)).getByText("Buyer requested cancellation")).toBeInTheDocument();
    expect(within(rowOf(PARTIAL)).getByText("Partial refund $5.00")).toBeInTheDocument();
    const chips = document.querySelectorAll("[data-refund-chip]");
    expect(chips).toHaveLength(3);
  });

  it("opens an order from its number and shows the refund's reason, amount, date and note", async () => {
    const { user } = await open("/commerce/orders");
    await user.click(await screen.findByRole("button", { name: `Open order ${String(REFUNDED)}` }));

    const sheet = await screen.findByRole("dialog", { name: `Order ${String(REFUNDED)}` });
    const refunds = within(sheet).getByRole("region", { name: "Refunds" });
    expect(within(refunds).getByRole("heading", { name: /Refunded/ })).toBeInTheDocument();
    expect(within(refunds).getByText("Item arrived damaged")).toBeInTheDocument();
    expect(within(refunds).getByText(/Seller's note:/)).toHaveTextContent(
      "Seller's note: Sorry, it broke in the post.",
    );
    expect(within(refunds).getAllByText(/^\$\d+\.\d{2}$/).length).toBeGreaterThan(0);
    expect(refunds.querySelector("time")).not.toBeNull();
  });

  it("shows nothing about refunds on an order that has none", async () => {
    const { user } = await open("/commerce/orders");
    const first = 3_412_880_100 - 5 * 37;
    await user.click(await screen.findByRole("button", { name: `Open order ${String(first)}` }));
    const sheet = await screen.findByRole("dialog", { name: `Order ${String(first)}` });
    expect(within(sheet).queryByRole("region", { name: "Refunds" })).toBeNull();
  });
});

function order(patch: Partial<ShopOrder>): ShopOrder {
  const usd = (amount: string) => ({ amount, currency: "USD" });
  return {
    order_id: 1,
    state: "canceled",
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-02T10:00:00Z",
    ship_by: null,
    overdue: false,
    total: usd("20.00"),
    subtotal: usd("20.00"),
    shipping: usd("0.00"),
    discount: usd("0.00"),
    units: 1,
    items: [],
    shipments: [],
    buyer: null,
    refunds: [],
    refunded_total: null,
    ...patch,
  };
}

function inLocale(locale: Locale, node: ReactNode) {
  return render(
    <LocaleProvider initialLocale={locale} storage={memoryStorage()}>
      {node}
    </LocaleProvider>,
  );
}

describe("a refund without a reason", () => {
  it("says no reason was given, in English and in Hebrew", () => {
    const refunded = order({
      state: "refunded",
      refunds: [
        {
          amount: { amount: "20.00", currency: "USD" },
          refunded_at: "2026-10-03T10:00:00Z",
          reason: null,
          status: "succeeded",
          note: null,
        },
      ],
      refunded_total: { amount: "20.00", currency: "USD" },
    });
    const { unmount } = inLocale("en", <RefundDetails order={refunded} />);
    expect(screen.getByText("No reason given")).toBeInTheDocument();
    expect(screen.queryByText(/Seller's note/)).toBeNull();
    unmount();

    inLocale("he", <RefundChip order={refunded} />);
    expect(screen.getByText("לא צוינה סיבה")).toBeInTheDocument();
  });

  it("explains a cancellation even when Etsy sent no refund for it", () => {
    inLocale("en", <RefundDetails order={order({})} />);
    const section = screen.getByRole("region", { name: "Cancellation" });
    expect(within(section).getByRole("heading", { name: "Cancelled" })).toBeInTheDocument();
    expect(within(section).getByText("No reason given")).toBeInTheDocument();
  });

  it("puts no chip on an order without a refund or cancellation", () => {
    const { container } = inLocale("en", <RefundChip order={order({ state: "shipped" })} />);
    expect(container.querySelector("[data-refund-chip]")).toBeNull();
  });
});

describe("Statistics: refunds and cancellations", () => {
  it("lists them by reason as bars with orders and amounts, and gives the rates", async () => {
    const { user } = await open("/shops");
    await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(screen.getByRole("tab", { name: "Statistics" }));

    const heading = await screen.findByRole(
      "heading",
      { level: 2, name: "Refunds and cancellations" },
      { timeout: 8000 },
    );
    const section = heading.closest("section");
    if (section === null) throw new Error("No refunds panel");
    const list = within(section).getByRole("list", { name: "Refunds and cancellations by reason" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(within(list).getAllByText("Item arrived damaged").length).toBeGreaterThan(0);
    expect(within(list).getAllByText("No reason given").length).toBeGreaterThan(0);
    expect(within(list).getAllByText(/Cancelled ·/).length).toBeGreaterThan(0);
    // The largest reason is first and carries the full orange.
    expect(rows[0]?.querySelector("[data-fill]")).toHaveClass("bg-tertiary");
    expect(within(section).getByText("Refund rate")).toBeInTheDocument();
    expect(within(section).getByText("Cancellation rate")).toBeInTheDocument();
    expect(within(section).getByText(/orders refunded$/)).toBeInTheDocument();
  });
});
