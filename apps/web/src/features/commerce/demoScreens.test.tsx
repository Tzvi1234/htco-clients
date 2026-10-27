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
// Orders, Products and Shipping are real screens now, live from Etsy (live.test.tsx).
const SCREENS = [
  ["/work/tasks", "Tasks", "Completed today"],
  ["/work/approvals", "Approvals", "Pending decisions"],
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

  it("names the suppliers table and keeps supplier names in their own direction", async () => {
    await open("/commerce/suppliers", "he");
    const table = within(content()).getByRole("table", { name: "ספקים", hidden: true });
    expect(within(table).getByText("Printful")).toHaveClass("ltr");
  });

  it("shows the demo screens on phones", async () => {
    phone();
    await open("/commerce/suppliers");
    expect(screen.queryByRole("complementary", { name: "Sidebar" })).not.toBeInTheDocument();
    expect(screen.getByText("DEMO")).toBeInTheDocument();
    expect(
      within(content()).getByRole("table", { name: "Suppliers", hidden: true }),
    ).toBeInTheDocument();
  });
});

describe("Shops in the Design 1C panels", () => {
  it("shows the shop's sales tiles live from Etsy, readable and without a Demo mark", async () => {
    await open("/shops", "en", true);
    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(await within(card).findByText("Revenue today")).toBeInTheDocument();
    expect(card.querySelector("[data-demo-part]")).toBeNull();
    expect(within(card).getByText("Revenue today").closest("[aria-hidden]")).toBeNull();
    expect(within(card).getByText(/Live from Etsy/)).toBeInTheDocument();
    expect(screen.queryByText("Demo")).not.toBeInTheDocument();
  });

  it("offers the Owner to connect another shop above the shops", async () => {
    await open("/shops", "en", true);
    await screen.findByRole("article", { name: "Willow & Wick" });
    // The shops' focus panel carries the one primary action (clarity round 3).
    const focus = screen.getByRole("heading", { level: 2, name: "Your shops" }).closest("section");
    if (focus === null) throw new Error("No focus panel");
    expect(within(focus).getByRole("button", { name: "Connect Etsy shop" })).toBeEnabled();
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
