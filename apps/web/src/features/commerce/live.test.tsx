import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { PHONE_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { demoShops, fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";

// The shop's live data from Etsy on the dashboard (platform: dashboard data, slice 4.6), on the
// in-memory API with invented data.

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

/** Waits until nothing on the page is loading, so panels are the settled ones. */
async function settled() {
  await vi.waitFor(
    () => {
      expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    },
    { timeout: 8000 },
  );
}

const panel = async (name: string) => {
  await settled();
  const heading = await screen.findByRole("heading", { level: 2, name });
  const section = heading.closest("section");
  if (section === null) throw new Error(`No panel ${name}`);
  return section;
};

describe("Orders, live from Etsy", () => {
  it("is a real screen: no DEMO pill, the orders with buyer, total and state", async () => {
    await open("/commerce/orders");

    const orders = await panel("Orders");
    const table = await within(orders).findByRole("table", { name: "Orders" });
    expect(within(table).getAllByRole("row").length).toBeGreaterThan(10);
    expect(within(table).getByText("#3412880100")).toBeInTheDocument();
    expect(within(table).getAllByText("Emma R.").length).toBeGreaterThan(0);
    expect(within(orders).getByText(/Live from Etsy/)).toBeInTheDocument();
    expect(screen.queryByTestId("demo-content")).not.toBeInTheDocument();
    expect(screen.queryByText("DEMO")).not.toBeInTheDocument();
  });

  it("filters to the late orders", async () => {
    const { user } = await open("/commerce/orders");
    const filters = await panel("Filters");

    await user.click(await within(filters).findByRole("button", { name: /^Late/ }));

    const table = within(await panel("Orders")).getByRole("table", { name: "Orders" });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(1);
    expect(within(rows.at(0) ?? document.body).getByText("Late")).toBeInTheDocument();
  });

  it.each(["viewer", "developer"] as const)(
    "shows a %s the orders without buyer names or tracking numbers",
    async (role) => {
      await open("/commerce/orders", { role });

      const table = await within(await panel("Orders")).findByRole("table", { name: "Orders" });
      expect(within(table).queryByText("Emma R.")).not.toBeInTheDocument();
      expect(within(table).queryByText(/^9400 /)).not.toBeInTheDocument();
    },
  );

  it("says when Etsy is not answering and offers to try again", { timeout: 15000 }, async () => {
    await open("/commerce/orders", { liveTrouble: "unavailable" });

    const alert = await within(await panel("Orders")).findByRole("alert");
    expect(alert).toHaveTextContent("Etsy is not answering");
    expect(within(alert).getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("marks stale data with the time it was fetched", async () => {
    await open("/commerce/orders", { liveTrouble: "stale" });

    expect(
      await within(await panel("Orders")).findByText(/Etsy is not answering · showing data from/),
    ).toBeInTheDocument();
  });

  it("explains a shop with no orders", async () => {
    await open("/commerce/orders", { liveTrouble: "quiet" });

    expect(
      await within(await panel("Orders")).findByText("No orders in the last 30 days."),
    ).toBeInTheDocument();
  });

  it("asks to reconnect a shop that needs it", async () => {
    await open("/commerce/orders", { integrations: [fakeIntegration(WILLOW, "needs_reauth")] });

    const alert = await within(await panel("Orders")).findByRole("alert");
    expect(alert).toHaveTextContent("not connected");
    expect(within(alert).getByRole("link", { name: "Open Shops" })).toHaveAttribute(
      "href",
      "/shops",
    );
  });

  it("offers to connect a shop when there is none", async () => {
    await open("/commerce/orders", { shops: [], integrations: [] });

    expect(await screen.findByRole("link", { name: "Connect a shop" })).toBeInTheDocument();
  });

  it("speaks Hebrew and keeps order numbers left-to-right", async () => {
    await open("/commerce/orders", {}, "he");

    const table = await screen.findByRole("table", { name: "הזמנות" });
    const number = within(table).getByText("#3412880100");
    expect(number.closest("[dir='ltr'], .ltr")).not.toBeNull();
  });
});

describe("Orders, a page at a time", () => {
  it("shows 25 orders, then the rest on request", async () => {
    const { user } = await open("/commerce/orders");
    const orders = await panel("Orders");
    const table = within(orders).getByRole("table", { name: "Orders" });
    expect(within(table).getAllByRole("row")).toHaveLength(26);

    await user.click(within(orders).getByRole("button", { name: "Show more (21 left)" }));

    expect(within(table).getAllByRole("row")).toHaveLength(47);
  });

  it("lists orders as rows on a phone and opens one in a sheet", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === PHONE_QUERY,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    try {
      const { user } = await open("/commerce/orders");
      const orders = await panel("Orders");
      expect(within(orders).queryByRole("table")).not.toBeInTheDocument();
      expect(within(orders).getAllByRole("listitem")).toHaveLength(20);

      await user.click(within(orders).getByRole("button", { name: /#3412880100/ }));

      const sheet = await screen.findByRole("dialog", { name: "Order 3412880100" });
      expect(within(sheet).getByText("Hand-poured soy candle, cedar and fig")).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("Products, live from Etsy", () => {
  it("lists the listings and shows the chosen one's details", async () => {
    const { user } = await open("/commerce/products");

    const catalog = await panel("Catalog");
    const mug = await within(catalog).findByRole("button", {
      name: /Stoneware mug with your name/,
    });
    await user.click(mug);

    const details = await panel("Product details");
    expect(within(details).getByText("1402213")).toBeInTheDocument();
    expect(within(details).getByText("personalized mug")).toBeInTheDocument();
    expect(within(details).getByRole("link", { name: "Open on Etsy" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("filters by section", async () => {
    const { user } = await open("/commerce/products");
    const catalog = await panel("Catalog");

    await user.click(await within(catalog).findByRole("button", { name: "Mugs" }));

    expect(within(catalog).queryByRole("button", { name: /soy candle/ })).not.toBeInTheDocument();
    expect(within(catalog).getByRole("button", { name: /espresso cup/ })).toBeInTheDocument();
  });
});

describe("Shipping, live from Etsy", () => {
  it("shows what waits to ship, the shipping profiles and the return policy", async () => {
    await open("/commerce/shipping");

    expect(
      await within(await panel("Orders to ship")).findByRole("table", { name: "Orders to ship" }),
    ).toBeInTheDocument();
    expect(
      await within(await panel("Shipping profiles")).findByText("Standard from Israel"),
    ).toBeInTheDocument();
    const policies = await panel("Returns and partners");
    expect(await within(policies).findByText("Within 30 days")).toBeInTheDocument();
    expect(within(policies).getByText("Studio Kiln Co-op")).toBeInTheDocument();
  });
});

describe("Customers: reviews, live from Etsy", () => {
  it("shows the newest reviews beside the demo customer panels", async () => {
    await open("/customers/customers");

    const reviews = await panel("Reviews");
    expect(
      await within(reviews).findByText(/Smells like a walk in the forest/),
    ).toBeInTheDocument();
    expect(within(reviews).getAllByRole("img", { name: "5 of 5 stars" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Demo — coming soon").length).toBeGreaterThan(0);
  });
});

describe("Shops and Home with live numbers", () => {
  it("shows the shop card's real numbers, without the Demo mark", async () => {
    await open("/shops", demoShops());

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(await within(card).findByText("Orders today")).toBeInTheDocument();
    expect(within(card).getByText("1,204")).toBeInTheDocument();
    expect(within(card).getByText("4.9")).toBeInTheDocument();
    expect(within(card).queryByText("Demo")).not.toBeInTheDocument();
  });

  it("asks nothing of Etsy for a disconnected shop", async () => {
    const { backend } = await open("/shops", demoShops());
    await screen.findAllByText("Orders today");

    const asked = backend.requests.map((r) => new URL(r.url).pathname);
    expect(asked).not.toContain("/api/v1/shops/d0000000-0000-7000-8000-000000000004/overview");
  });

  it("shows top listings from Etsy under the shops", async () => {
    await open("/shops", demoShops());

    const listing = await screen.findByText(/Night sky print/, undefined, { timeout: 4000 });
    expect(listing.closest("section")).toHaveTextContent("Top listings");
  });

  it("puts today's revenue and orders on Home", async () => {
    await open("/");

    const numbers = await screen.findByRole("list", { name: "Key numbers" });
    const revenue = within(numbers).getAllByRole("listitem").at(0) ?? document.body;
    expect(within(revenue).getByText("Revenue")).toBeInTheDocument();
    expect(await within(revenue).findByText(/^\$\d/)).toBeInTheDocument();
  });
});
