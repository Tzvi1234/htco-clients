import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";

// Slice 5.7: the Orders screen on the stored order history (platform slice 5.6): the freshness
// line says the orders are synced from Etsy, a stale history shows a banner with its age, and an
// order's sheet shows its status timeline with what recorded each step (invented data).

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;
const WILLOW = "d0000000-0000-7000-8000-000000000001";
const stored: Partial<FakeState> = {
  shops: [{ id: WILLOW, name: "Willow & Wick", status: "active" }],
  integrations: [fakeIntegration(WILLOW, "ok")],
  orderStore: true,
};

async function open(state: Partial<FakeState> = {}, locale: "en" | "he" = "en") {
  const backend = fakeBackend({ ...owner, ...stored, ...state });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: ["/commerce/orders"] })}
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
  return { user: userEvent.setup(), backend };
}

async function firstShippedOrder() {
  const table = await screen.findByRole("table", { name: "Orders" });
  const row = within(table)
    .getAllByRole("row")
    .find((r) => within(r).queryByText("Shipped") !== null);
  if (row === undefined) throw new Error("no shipped order");
  return within(row).getByRole("button", { name: /^Open order/ });
}

describe("Orders on the stored history (slice 5.7)", () => {
  it("says the orders are synced from Etsy, and how long ago", async () => {
    await open();

    expect(await screen.findByText(/Synced from Etsy/)).toBeInTheDocument();
    expect(screen.queryByText(/Live from Etsy/)).not.toBeInTheDocument();
    expect(screen.queryByRole("status", { name: /last synced/i })).not.toBeInTheDocument();
  });

  it("AC-5.7.1: a history older than its window shows a banner with the age", async () => {
    await open({ liveTrouble: "stale" });

    const banner = await screen.findByText(/The orders were last synced .*40 minutes ago/);
    expect(banner.closest('[role="status"]')).not.toBeNull();
    expect(screen.getByText(/Last synced at .* · Etsy has not answered since/)).toBeInTheDocument();
  });

  it("AC-5.7.4: an order's sheet shows its status timeline with each step's source", async () => {
    const { user, backend } = await open();

    await user.click(await firstShippedOrder());

    const sheet = await screen.findByRole("dialog", { name: /^Order / });
    const history = await within(sheet).findByRole("region", { name: "Order history" });
    const steps = await within(history).findAllByRole("listitem");
    expect(steps.map((s) => s.textContent.split(" · ")[0])).toEqual([
      "PaidEtsy notice",
      "Recorded in HTCOEtsy notice",
      "Waiting to shipEtsy notice",
      "Shipped (current)Etsy notice",
    ]);
    expect(
      backend.requests.some((r) =>
        /\/v1\/shops\/[^/]+\/orders\/\d+$/.test(new URL(r.url).pathname),
      ),
    ).toBe(true);
  });

  it("an order read live (not stored yet) says its steps come later, never an empty list", async () => {
    const { user } = await open({ orderStore: false });

    await user.click(await firstShippedOrder());

    const sheet = await screen.findByRole("dialog", { name: /^Order / });
    expect(
      await within(sheet).findByText(/the steps appear once HTCO has stored this order/),
    ).toBeInTheDocument();
  });

  it("he: the timeline in Hebrew inside the RTL sheet, the order number LTR", async () => {
    const { user } = await open({}, "he");

    const table = await screen.findByRole("table");
    const [first] = within(table).getAllByRole("button", { name: /\d{8,}/ });
    if (first === undefined) throw new Error("no order");
    await user.click(first);

    const sheet = await screen.findByRole("dialog");
    const history = await within(sheet).findByRole("region", { name: "היסטוריית ההזמנה" });
    expect((await within(history).findAllByRole("listitem")).length).toBeGreaterThan(0);
    expect(within(history).getAllByText(/הודעה מ־Etsy/).length).toBeGreaterThan(0);
    expect(document.documentElement.dir).toBe("rtl");
  });
  it("AC-5.7.3: keyboard only, finds an order by its number and opens its sheet", async () => {
    const { user } = await open();
    const table = await screen.findByRole("table", { name: "Orders" });
    const [first] = within(table).getAllByRole("button", { name: /^Open order/ });
    const id = first?.textContent?.replace("#", "") ?? "";

    await user.click(screen.getByRole("searchbox", { name: "Find an order" }));
    await user.keyboard(`#${id}`);
    await vi.waitFor(() => {
      expect(within(table).getAllByRole("button", { name: /^Open order/ })).toHaveLength(1);
    });
    // Tab on through the filters to the one order left in the table.
    const target = within(table).getByRole("button", { name: `Open order ${id}` });
    for (let i = 0; i < 30 && document.activeElement !== target; i += 1) await user.tab();
    expect(document.activeElement).toBe(target);
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("dialog", { name: `Order ${id}` })).toBeInTheDocument();
  });
});
