import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";
import { fakeNotification } from "../../test/fakeIncidents.ts";

// Commerce › Suppliers, "New product quotes" (platform slice 7.16), on the in-memory API with
// invented quotes: the server's order (cheapest first), the cheapest choosable one emphasised, an
// expired one greyed out and not choosable, Owner and Admins only, and the quote notification.

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;
const WILLOW = "d0000000-0000-7000-8000-000000000001";
const oneShop: Partial<FakeState> = {
  shops: [{ id: WILLOW, name: "Willow & Wick", status: "active" }],
  integrations: [fakeIntegration(WILLOW, "ok")],
};

async function open(state: Partial<FakeState> = {}, locale: "en" | "he" = "en") {
  const backend = fakeBackend({ ...owner, ...oneShop, ...state });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: ["/commerce/quotes"] })}
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

describe("New product quotes", () => {
  it("shows each waiting product with its quotes side by side, in the server's order", async () => {
    await open();
    await settled();

    const lists = await screen.findAllByRole("list", { name: /^Quotes for / });
    const [list] = lists;
    if (list === undefined || lists.length !== 1) throw new Error("one product with quotes");
    const cards = within(list).getAllByRole("listitem");
    expect(cards.map((c) => within(c).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Guangzhou Leather Works",
      "Express Hides Co.",
      "Old Mill Supply",
    ]);
    const [best, second, expired] = cards as [HTMLElement, HTMLElement, HTMLElement];
    expect(within(best).getByText("Lowest total")).toBeInTheDocument();
    expect(within(best).getByText("$9.50")).toBeInTheDocument();
    expect(within(second).queryByText("Lowest total")).not.toBeInTheDocument();
    expect(within(second).getByText("No end date given")).toBeInTheDocument();
    expect(expired).toHaveAttribute("aria-disabled", "true");
    expect(within(expired).getByText(/cannot be chosen/)).toBeInTheDocument();
    // A product still without quotes says so.
    expect(screen.getByText(/No quote yet/)).toBeInTheDocument();
    expect(screen.queryByTestId("demo-content")).not.toBeInTheDocument();
  });

  it("keeps amounts left-to-right in Hebrew", async () => {
    await open({}, "he");
    await settled();
    const total = await screen.findByText("$9.50");
    expect(total).toHaveClass("ltr");
  });

  it("says when nothing is waiting", async () => {
    await open({ quotes: { [WILLOW]: [] } });
    expect(await screen.findByText(/No product is waiting for a supplier/)).toBeInTheDocument();
  });

  it("tells other roles that only an Owner or Admin sees quotes, with no retry", async () => {
    await open({ role: "support" });
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/Only an Owner or Admin/)).toBeInTheDocument();
    expect(within(alert).queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });

  it("says when the quotes are not answering, and tries again", async () => {
    const { user, backend } = await open({ quotesTrouble: "fail" });
    const alert = await screen.findByRole("alert", {}, { timeout: 8000 });
    backend.state.quotesTrouble = undefined;
    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Guangzhou Leather Works")).toBeInTheDocument();
  });

  it("a quote notification says so in words and opens this screen on its shop", async () => {
    const notifications = [
      fakeNotification({
        id: "f0000000-0000-7000-8000-000000000716",
        kind: "new_product_quote",
        params: { listing_id: "1777", quote_request_id: "e0000000-0000-7000-8000-000000000001" },
        shop_id: WILLOW,
      }),
    ];
    const backend = fakeBackend({ ...owner, ...oneShop, notifications });
    render(
      <App
        locale="en"
        theme="system"
        storage={memoryStorage()}
        history={createMemoryHistory({ initialEntries: ["/"] })}
        api={backend.client}
      />,
    );
    const user = userEvent.setup();
    const banner = await screen.findByRole("banner");
    await user.click(
      await within(banner).findByRole("button", { name: "Notifications, 1 unread" }),
    );
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await user.click(
      within(panel).getByRole("link", { name: /A new supplier quote for listing 1777/ }),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "New product quotes" }),
    ).toBeVisible();
  });
});
