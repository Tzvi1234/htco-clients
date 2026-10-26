import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { demoShops, fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";

// The owner's report on the live shop (2026-10-22): "there are reviews, so there were orders,
// but the completed orders don't show". The dashboard read 30 days only and every order was
// older. Orders now choose a period, an empty period says what to do, and the Shops screen has
// the shop's statistics since it opened. Invented data on the in-memory API.

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;
const WILLOW = "d0000000-0000-7000-8000-000000000001";
const oneShop: Partial<FakeState> = {
  shops: [{ id: WILLOW, name: "Willow & Wick", status: "active" }],
  integrations: [fakeIntegration(WILLOW, "ok")],
};

async function open(path: string, state: Partial<FakeState> = {}, locale: "en" | "he" = "en") {
  const backend = fakeBackend({ ...owner, ...oneShop, ...state });
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
  return { user: userEvent.setup(), backend };
}

async function settled() {
  await vi.waitFor(
    () => {
      expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    },
    { timeout: 8000 },
  );
}

const panel = async (name: string | RegExp) => {
  await settled();
  const heading = await screen.findByRole("heading", { level: 2, name }, { timeout: 4000 });
  const section = heading.closest("section");
  if (section === null) throw new Error(`No panel ${String(name)}`);
  return section;
};

const asked = (backend: { requests: Request[] }, view: string) =>
  backend.requests
    .map((r) => new URL(r.url))
    .filter((u) => u.pathname === `/api/v1/shops/${WILLOW}/${view}`);

describe("Orders: a period to choose", () => {
  it("starts at 30 days and offers 90 days, 12 months and all time", async () => {
    await open("/commerce/orders");

    const period = await screen.findByRole("radiogroup", { name: "Period" });
    const options = within(period).getAllByRole("radio");
    expect(options.map((o) => o.textContent)).toEqual([
      "30 days",
      "90 days",
      "12 months",
      "All time",
    ]);
    expect(within(period).getByRole("radio", { name: "30 days" })).toBeChecked();
    expect(await panel("Last 30 days")).toBeInTheDocument();
  });

  it("shows the completed orders older than 30 days under All time", async () => {
    const { user, backend } = await open("/commerce/orders");
    await panel("Last 30 days");

    await user.click(screen.getByRole("radio", { name: "All time" }));

    const focus = await panel("All time");
    expect(within(focus).getByText(/before Etsy's fees/)).toBeInTheDocument();
    // The month's orders and the older, completed ones: far more than the 46 of 30 days.
    const orders = await panel("Orders");
    const more = await within(orders).findByRole("button", { name: /^Show more \(\d+ left\)$/ });
    expect(Number(/\((\d+) left\)/.exec(more.textContent)?.[1])).toBeGreaterThan(150);
    expect(asked(backend, "orders").some((u) => u.searchParams.get("period") === "all")).toBe(true);
  });

  it("asks Etsy for 90 days and 12 months by name", async () => {
    const { user, backend } = await open("/commerce/orders");
    await panel("Last 30 days");

    await user.click(screen.getByRole("radio", { name: "90 days" }));
    expect(await panel("Last 90 days")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "12 months" }));
    expect(await panel("Last 12 months")).toBeInTheDocument();

    const periods = asked(backend, "orders").map((u) => u.searchParams.get("period"));
    expect(periods).toEqual(expect.arrayContaining(["30d", "90d", "12m"]));
  });

  it("the owner's shop: no orders in 30 days but sales on Etsy, one press to all time", async () => {
    const { user } = await open("/commerce/orders", { liveTrouble: "history" });

    const orders = await panel("Orders");
    expect(within(orders).queryByRole("table")).not.toBeInTheDocument();
    expect(within(orders).getByText("No orders in the last 30 days")).toBeInTheDocument();
    expect(within(orders).getByText(/sales on Etsy since the shop opened/)).toBeInTheDocument();

    await user.click(within(orders).getByRole("button", { name: "Show all time" }));

    expect(await panel("All time")).toBeInTheDocument();
    const table = await within(await panel("Orders")).findByRole("table", { name: "Orders" });
    expect(within(table).getAllByRole("row").length).toBeGreaterThan(10);
    expect(screen.getByRole("radio", { name: "All time" })).toBeChecked();
  });

  it("keeps the plain message for a shop that never sold", async () => {
    await open("/commerce/orders", { liveTrouble: "quiet" });

    const orders = await panel("Orders");
    expect(await within(orders).findByText("No orders in the last 30 days.")).toBeInTheDocument();
    expect(within(orders).queryByRole("button", { name: "Show all time" })).toBeNull();
  });

  it("says when a long period was cut at its cap", async () => {
    const { user } = await open("/commerce/orders", { liveTrouble: "partial" });
    await panel("Last 30 days");

    await user.click(screen.getByRole("radio", { name: "All time" }));

    const orders = await panel("Orders");
    expect(
      await within(orders).findByText(/Showing the newest .* orders of all time\./),
    ).toBeInTheDocument();
  });

  it("speaks Hebrew", async () => {
    await open("/commerce/orders", {}, "he");

    const period = await screen.findByRole("radiogroup", { name: "תקופה" });
    expect(within(period).getByRole("radio", { name: "כל הזמן" })).toBeInTheDocument();
  });
});

describe("Shops › Statistics: the shop since it opened", () => {
  it("shows Etsy's counts and the all-time figures, each labelled for what it is", async () => {
    const { user, backend } = await open("/shops");
    await screen.findByRole("article", { name: "Willow & Wick" });

    await user.click(screen.getByRole("tab", { name: "Statistics" }));

    const focus = await panel("Since the shop opened");
    expect(within(focus).getByText(/Open for 5 years/)).toBeInTheDocument();
    const figures = within(focus).getByRole("list", { name: "Shop statistics" });
    for (const name of ["Total sales", "Revenue", "Average order", "Favourites", "Listings"])
      expect(within(figures).getByText(name)).toBeInTheDocument();
    expect(within(figures).getByText("gross, before Etsy's fees")).toBeInTheDocument();
    expect(within(figures).getByText("Etsy's count")).toBeInTheDocument();
    expect(
      within(focus).getByRole("img", { name: /^Orders per month, last 12 months:/ }),
    ).toBeInTheDocument();

    const top = await panel("Top products");
    expect(within(top).getAllByRole("listitem")).toHaveLength(5);
    const countries = await panel("Where orders go");
    expect(within(countries).getByText("United States")).toBeInTheDocument();
    const best = await panel("Best month");
    expect(within(best).getByText(/orders/)).toBeInTheDocument();

    const stats = asked(backend, "stats");
    expect(stats.length).toBeGreaterThan(0);
    expect(stats[0]?.searchParams.has("utc_offset_minutes")).toBe(true);
  });

  it("says the figures rest on the latest orders when the cap was hit", async () => {
    const { user } = await open("/shops", { liveTrouble: "partial" });
    await screen.findByRole("article", { name: "Willow & Wick" });

    await user.click(screen.getByRole("tab", { name: "Statistics" }));

    const focus = await panel("Since the shop opened");
    expect(await within(focus).findByText(/Based on the latest 120 orders/)).toBeInTheDocument();
    // Every figure comes from those orders, not from the whole history (Codex, #38).
    const over = within(focus).getByText(/^over \d+ orders$/).textContent;
    expect(Number(/\d+/.exec(over)?.[0])).toBeLessThanOrEqual(120);
  });

  it("asks nothing for statistics until the tab is opened", async () => {
    const { backend } = await open("/shops");
    await screen.findByRole("article", { name: "Willow & Wick" });
    await settled();

    expect(asked(backend, "stats")).toHaveLength(0);
  });

  it("speaks Hebrew and keeps the numbers left-to-right", async () => {
    const { user } = await open("/shops", {}, "he");
    await screen.findByRole("article", { name: "Willow & Wick" });

    await user.click(screen.getByRole("tab", { name: "סטטיסטיקה" }));

    const focus = await panel("מאז שהחנות נפתחה");
    const figures = within(focus).getByRole("list", { name: "סטטיסטיקת החנות" });
    const number = within(figures).getAllByText(/^[\d,]+$/)[0];
    expect(number?.closest("[dir='ltr'], .ltr")).not.toBeNull();
  });

  it("keeps the shop picker when one shop's statistics fail (Codex, #38)", async () => {
    const { user } = await open("/shops", { ...demoShops(), statsFailFor: [WILLOW] });
    await screen.findByRole("article", { name: "Willow & Wick" });

    await user.click(screen.getByRole("tab", { name: "Statistics" }));

    const failed = await panel("Since the shop opened");
    expect(await within(failed).findByRole("alert")).toBeInTheDocument();
    const picker = within(failed).getByRole("radiogroup", { name: "Shop" });
    await user.click(within(picker).getByRole("radio", { name: "Linen Lane Studio" }));

    const focus = await panel("Since the shop opened");
    expect(within(focus).getByRole("list", { name: "Shop statistics" })).toBeInTheDocument();
  });
});

describe("Orders: a capped period's revenue says what it covers (Codex, #38)", () => {
  it("labels the revenue as that of the newest orders when the period was cut", async () => {
    const { user } = await open("/commerce/orders", { liveTrouble: "partial" });
    await panel("Last 30 days");

    await user.click(screen.getByRole("radio", { name: "All time" }));

    const focus = await panel("All time");
    expect(
      await within(focus).findByText(/^newest [\d,]+ orders, before Etsy's fees$/),
    ).toBeInTheDocument();
  });
});

// One focus panel per view (clarity round 3; audit 2026-10-23, P2-9): the Shops page's focus
// stays the view's focus on every sub-tab, and Statistics' summary is a plain panel.
describe("Shops: one focus panel per view", () => {
  const focusPanels = () => document.querySelectorAll("#main .k-focus, main .k-focus");

  it("keeps one focus on the shops, top listings and statistics views", async () => {
    const { user } = await open("/shops");
    await screen.findByRole("article", { name: "Willow & Wick" });
    expect(focusPanels()).toHaveLength(1);

    await user.click(screen.getByRole("tab", { name: "Top listings" }));
    expect(focusPanels()).toHaveLength(1);

    await user.click(screen.getByRole("tab", { name: "Statistics" }));
    const summary = await panel("Since the shop opened");
    expect(summary).not.toHaveClass("k-focus");
    expect(focusPanels()).toHaveLength(1);
  });

  it("gives the no-shop view its focus, with the way to connect a shop", async () => {
    await open("/shops", { shops: [], integrations: [] });
    const focus = await panel("No shops yet");
    expect(focus).toHaveClass("k-focus");
    expect(focusPanels()).toHaveLength(1);
    expect(within(focus).getByRole("button", { name: "Connect Etsy shop" })).toBeInTheDocument();
  });
});
