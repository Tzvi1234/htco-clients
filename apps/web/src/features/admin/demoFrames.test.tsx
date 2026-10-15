import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { PHONE_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { fakeBackend } from "../../test/fakeApi.ts";

/** The item at `index`, failing the test when there is none. */
function nth<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) throw new Error(`No item ${String(index)}`);
  return item;
}

async function open(path: string, locale: Locale = "en") {
  const backend = fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2" });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: [path] })}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 }, { timeout: 5000 });
  return { user: userEvent.setup(), backend };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// Each designed-but-unbuilt screen of Customers, Finance and Admin, with a word of its sample
// content that shows the demo's full screen is there (not the placeholder).
const SCREENS = [
  ["/customers/tickets", "Tickets", "Where is my order? #3152"],
  ["/customers/customers", "Customers", "Active customers:"],
  ["/customers/mail", "Mail", "Your weekly sales summary"],
  ["/customers/marketing", "Marketing", "Active campaign"],
  ["/finance/overview", "Overview", "Revenue this month:"],
  ["/finance/ledger", "Ledger", "Etsy balance:"],
  ["/admin/health", "Health", "30-day uptime:"],
  ["/admin/automations", "Automations", "Automation details"],
] as const;

describe("the demo screens of Customers, Finance and Admin", () => {
  it.each(SCREENS)(
    "%s shows the demo's %s screen, marked Demo and inert",
    async (path, title, sample) => {
      const { user } = await open(path);

      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
      expect(screen.getByText("Demo — coming soon")).toBeInTheDocument();
      const content = screen.getByTestId("demo-content");
      expect(content).toHaveAttribute("inert");
      expect(within(content).getAllByText(sample).length).toBeGreaterThan(0);

      // Nothing pretends to work: a press says the screen is coming.
      await user.click(nth(within(content).getAllByText(sample), 0));
      expect(await screen.findAllByText("Demo — coming soon")).toHaveLength(2);
    },
  );

  it("speaks Hebrew with the demo's own words", async () => {
    await open("/finance/ledger", "he");
    expect(screen.getByRole("heading", { level: 1, name: "ספר חשבונות" })).toBeInTheDocument();
    expect(screen.getByText("יתרה ב־Etsy:")).toBeInTheDocument();
    expect(screen.getByText("דמו — בקרוב")).toBeInTheDocument();
  });
});

describe("Members & access on a phone", () => {
  it("opens the chosen member in a sheet", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === PHONE_QUERY,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    const { user } = await open("/settings/team");

    const table = await screen.findByRole("table", { name: "Members" });
    await user.click(within(table).getByText("Tzvi Weiss"));

    const sheet = await screen.findByRole("dialog", { name: "Member" });
    expect(within(sheet).getByText("Tzvi Weiss")).toBeInTheDocument();
    await user.click(within(sheet).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // The invite form stays on the page, under the list.
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
