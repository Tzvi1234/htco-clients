import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { PHONE_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { demoShops, fakeBackend } from "../../test/fakeApi.ts";

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;

async function open(path: string, locale: Locale = "en", shops = false) {
  const backend = fakeBackend({ ...owner, ...(shops ? demoShops() : {}) });
  const history = createMemoryHistory({ initialEntries: [path] });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={history}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 }, { timeout: 3000 });
  return { user: userEvent.setup(), backend };
}

function phone() {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === PHONE_QUERY,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const content = () => screen.getByTestId("demo-content");

// Every demo screen this change draws, with its title and one panel that must be on it.
const SCREENS = [
  ["/work/tasks", "Tasks", "Completed today"],
  ["/work/approvals", "Approvals", "Pending decisions"],
  ["/work/activity", "Activity", "Activity log"],
  ["/commerce/orders", "Orders", "Filters"],
  ["/commerce/products", "Products", "Catalog"],
  ["/commerce/shipping", "Shipping", "Active shipments"],
  ["/commerce/suppliers", "Suppliers", "Unit cost by product"],
] as const;

describe("the Work and Commerce demo screens (redesign)", () => {
  it.each(SCREENS)(
    "%s draws the demo's screen under the DEMO label",
    async (path, title, panel) => {
      await open(path);
      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
      expect(screen.getByText("DEMO")).toBeInTheDocument();
      expect(screen.getByRole("note")).toHaveTextContent("Demo — coming soon");
      // Drawn (a crash fails here), but out of reach: hidden from readers.
      expect(
        await within(content()).findByRole("heading", { name: panel, hidden: true }),
      ).toBeInTheDocument();
    },
  );

  it.each(SCREENS)("%s says Demo in Hebrew too", async (path) => {
    await open(path, "he");
    expect(screen.getByText("דמו")).toBeInTheDocument();
  });

  it("keeps the sample controls out of reach: nothing to press, nothing sent", async () => {
    const { backend } = await open("/work/approvals");
    const before = backend.requests.length;
    expect(content()).toHaveAttribute("inert");
    expect(content()).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(
      within(content()).getAllByRole("button", { name: "Approve", hidden: true }),
    ).toHaveLength(4);
    expect(backend.requests.length).toBe(before);
  });

  it("names the orders table and keeps order numbers in their own direction", async () => {
    await open("/commerce/orders", "he");
    const table = within(content()).getByRole("table", { name: "הזמנות", hidden: true });
    expect(within(table).getByText("#3152")).toHaveClass("ltr");
  });

  it("shows the demo screens on phones", async () => {
    phone();
    await open("/commerce/orders");
    expect(screen.queryByRole("complementary", { name: "Sidebar" })).not.toBeInTheDocument();
    expect(screen.getByText("DEMO")).toBeInTheDocument();
    expect(
      within(content()).getByRole("table", { name: "Orders", hidden: true }),
    ).toBeInTheDocument();
  });
});

describe("Shops in the Design 1C panels", () => {
  it("marks the planned sales tiles and top listings as Demo, hidden from screen readers", async () => {
    await open("/shops", "en", true);
    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    const part = card.querySelector("[data-demo-part]");
    expect(part).not.toBeNull();
    expect(within(part as HTMLElement).getByText("Demo")).toBeInTheDocument();
    expect(
      within(part as HTMLElement)
        .getByText("Revenue today")
        .closest("[aria-hidden]"),
    ).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Top listings" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Demo").length).toBeGreaterThanOrEqual(5);
  });

  it("offers the Owner to connect another shop beside the shops", async () => {
    await open("/shops", "en", true);
    await screen.findByRole("article", { name: "Willow & Wick" });
    expect(screen.getByRole("heading", { name: "Connect a shop" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect Etsy shop" })).toBeEnabled();
  });

  it("asks for the step-up code in six boxes, digits only", async () => {
    const { user } = await open("/shops");
    await user.click(await screen.findByRole("button", { name: "Connect Etsy shop" }));
    const dialog = await screen.findByRole("dialog", { name: "Confirm it is you" });
    const field = within(dialog).getByLabelText("Code from the app");
    await user.type(field, "12a3456789");
    expect(field).toHaveValue("123456");
    expect(field.closest("[dir='ltr']")).not.toBeNull();
  });

  it("refreshes a shop's connection details", async () => {
    const { user, backend } = await open("/shops", "en", true);
    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await within(card).findByText("Connected");
    const before = backend.requests.filter((r) => r.url.includes("/v1/shop-integrations")).length;
    await user.click(within(card).getByRole("button", { name: "Refresh Willow & Wick" }));
    await vi.waitFor(() => {
      expect(
        backend.requests.filter((r) => r.url.includes("/v1/shop-integrations")).length,
      ).toBeGreaterThan(before);
    });
  });

  it("stacks the shops on phones and keeps the connection details", async () => {
    phone();
    await open("/shops", "en", true);
    const card = await screen.findByRole("article", { name: "Paper Fox Prints" });
    expect(await within(card).findByText("Needs reconnecting")).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: /Reconnect/ })).toBeInTheDocument();
  });
});
