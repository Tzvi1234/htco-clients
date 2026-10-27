import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AREAS } from "./nav.ts";
import { SIDEBAR_KEY } from "./ShellState.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { memoryStorage, type SettingsStorage } from "../../shared/lib/storage.ts";
import { NARROW_QUERY, PHONE_QUERY, REDUCED_MOTION_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { fakeBackend } from "../../test/fakeApi.ts";
import { App } from "../App.tsx";
import { viewTransitions } from "../router.tsx";

/** Pretends the given media queries match (phone width, a narrow window, reduced motion). */
function matching(...queries: string[]) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: queries.includes(query),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

async function open(
  path = "/",
  { storage = memoryStorage(), locale = "en" }: { storage?: SettingsStorage; locale?: Locale } = {},
) {
  const backend = fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2" });
  const history = createMemoryHistory({ initialEntries: [path] });
  render(
    <App locale={locale} theme="system" storage={storage} history={history} api={backend.client} />,
  );
  await screen.findByRole("heading", { level: 1 }, { timeout: 3000 });
  return { user: userEvent.setup(), storage, history };
}

const root = document.documentElement;
const main = () => screen.getByRole("navigation", { name: "Main" });

describe("the sidebar (Design 1C)", () => {
  it("opens the current area's tabs and marks the current tab", async () => {
    await open("/settings/security");

    const admin = within(main()).getByRole("button", { name: "Admin" });
    expect(admin).toHaveAttribute("aria-expanded", "true");
    const tabs = within(main()).getByRole("list", { name: "Admin tabs" });
    expect(within(tabs).getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(tabs).getByRole("link", { name: "Members & access" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("shows a Soon tag beside every tab that has no screen yet, and none beside built ones", async () => {
    const { user } = await open();
    for (const name of ["Office", "Work", "Commerce", "Customers", "Finance", "Admin"]) {
      await user.click(within(main()).getByRole("button", { name }));
    }

    for (const area of AREAS) {
      for (const tab of area.tabs) {
        const link = within(main()).getByRole("link", {
          name: new RegExp(`^${tabName(tab.id)}( Soon)?$`),
        });
        expect(link).toHaveAttribute("href", tab.to);
        expect(within(link).queryByText("Soon") !== null, `${area.id}/${tab.id}`).toBe(!tab.built);
      }
    }
  });

  it("says Soon in Hebrew too", async () => {
    const { user } = await open("/", { locale: "he" });
    await user.click(
      within(screen.getByRole("navigation", { name: "ראשי" })).getByRole("button", {
        name: "המשרד",
      }),
    );

    expect(screen.getAllByText("בקרוב").length).toBeGreaterThan(0);
  });

  it("opens and closes another area's tabs from its category", async () => {
    const { user } = await open();
    const work = within(main()).getByRole("button", { name: "Work" });

    await user.click(work);
    expect(work).toHaveAttribute("aria-expanded", "true");
    expect(within(main()).getByRole("link", { name: /^Approvals/ })).toBeInTheDocument();

    await user.click(work);
    expect(work).toHaveAttribute("aria-expanded", "false");
    expect(within(main()).queryByRole("link", { name: /^Approvals/ })).not.toBeInTheDocument();
  });

  it("collapses to a rail and remembers it on this device", async () => {
    const { user, storage } = await open();
    const sidebar = screen.getByRole("complementary", { name: "Sidebar" });
    expect(sidebar).not.toHaveAttribute("data-mini");

    await user.click(screen.getByRole("button", { name: "Collapse the menu" }));

    expect(sidebar).toHaveAttribute("data-mini");
    expect(storage.getItem(SIDEBAR_KEY)).toBe("mini");
    expect(screen.getByRole("button", { name: "Expand the menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("starts collapsed on a narrow window until the user chooses", async () => {
    matching(NARROW_QUERY);
    await open();
    expect(screen.getByRole("complementary", { name: "Sidebar" })).toHaveAttribute("data-mini");
  });

  it("collapsed, lists an area's tabs in the flyout, and its icon closes it again", async () => {
    const storage = memoryStorage();
    storage.setItem(SIDEBAR_KEY, "mini");
    const { user } = await open("/office/chat", { storage });

    const office = within(main()).getByRole("button", { name: "Office" });
    await user.click(office);
    const flyout = screen.getByRole("complementary", { name: "Office" });
    expect(within(flyout).getByRole("link", { name: /^Chat/ })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(within(flyout).getByRole("link", { name: /^Floor/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Floor" })).toBeInTheDocument();

    await user.click(office);
    expect(screen.queryByRole("complementary", { name: "Office" })).not.toBeInTheDocument();
  });

  it("collapsed, opens another area and its flyout in one press", async () => {
    const storage = memoryStorage();
    storage.setItem(SIDEBAR_KEY, "mini");
    const { user } = await open("/", { storage });

    await user.click(within(main()).getByRole("button", { name: "Finance" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Finance" })).toBeInTheDocument();
  });
});

describe("the screen's panel", () => {
  it("scrolls an existing screen inside the panel, which clips to its corners", async () => {
    // Every Design 1C screen lays out its own panels; the Etsy callback is one panel, the shell's.
    await open("/integrations/etsy/callback");
    const scroller = document.querySelector("main [data-screen-scroll]");

    expect(scroller).toHaveClass("overflow-auto");
    expect(scroller?.parentElement).toHaveClass("overflow-hidden");
    expect(scroller).toContainElement(await screen.findByRole("link", { name: "Back to shops" }));
  });
});

/** Demo frames whose title is what they show, as in the design: the chat's agent, the thread. */
const DEMO_TITLES: Record<string, string> = {
  "/office/chat": "Maya",
  "/office/team": "Late orders + tracking sync failure",
};

describe("routes for every area and tab", () => {
  it.each(
    AREAS.flatMap((area) =>
      area.tabs
        .filter((tab) => !tab.built)
        .map((tab) => [tab.to, DEMO_TITLES[tab.to] ?? tabName(tab.id)] as const),
    ),
  )("%s shows the demo frame titled %s", async (path, title) => {
    await open(path);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText("Demo — coming soon")).toBeInTheDocument();
  });

  it.each([
    ["/office", "Floor"],
    ["/work", "Tasks"],
    ["/commerce", "Shops"],
    ["/commerce/shops", "Shops"],
    ["/admin", "Health"],
    ["/admin/members", "Members & access"],
    ["/admin/settings", "Settings"],
  ])("%s leads to %s", async (path, title) => {
    await open(path);
    expect(await screen.findByRole("heading", { level: 1, name: title })).toBeInTheDocument();
  });
});

describe("the top bar", () => {
  it("shows where the page is: its area and tab, then the title", async () => {
    await open("/settings/security");
    const banner = screen.getByRole("banner");

    expect(within(banner).getByText("Admin")).toBeInTheDocument();
    expect(within(banner).getByText("Settings")).toBeInTheDocument();
    expect(within(banner).getByRole("heading", { level: 1, name: "Security" })).toBeInTheDocument();
  });

  it("carries no personalisation: the language and the design tweaks live in Settings (round 3)", async () => {
    await open();
    const banner = screen.getByRole("banner");

    expect(within(banner).queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(within(banner).queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Design tweaks" })).not.toBeInTheDocument();
    expect(within(banner).getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("is frosted glass, like the navigation", async () => {
    await open();
    expect(screen.getByRole("banner")).toHaveAttribute("data-glass");
    expect(screen.getByRole("complementary", { name: "Sidebar" })).toHaveAttribute("data-glass");
  });

  it("opens quick actions from search", async () => {
    const { user } = await open();
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByRole("dialog", { name: "Quick actions" })).toBeInTheDocument();
  });

  it("leads the bell to the approvals", async () => {
    await open();
    expect(screen.getByRole("link", { name: "Pending approvals" })).toHaveAttribute(
      "href",
      "/work/approvals",
    );
  });
});

describe("the appearance preference (client ADR-0008)", () => {
  it("follows a change made in another tab of this origin (the landing page)", async () => {
    const { storage } = await open();
    storage.setItem("htco.palette", "d4");

    window.dispatchEvent(new StorageEvent("storage", { key: "htco.palette", newValue: "d4" }));

    expect(await vi.waitFor(() => root.dataset["pal"])).toBe("d4");
  });
});

describe("phones", () => {
  it("swap the sidebar for a tab bar, with every area one sheet away", async () => {
    matching(PHONE_QUERY);
    const { user } = await open("/finance/ledger");

    expect(screen.queryByRole("complementary", { name: "Sidebar" })).not.toBeInTheDocument();
    const bar = main();
    expect(
      within(bar)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Home", "Office", "Work", "Commerce"]);

    await user.click(within(bar).getByRole("button", { name: "More areas" }));
    const sheet = await screen.findByRole("dialog", { name: "All areas" });
    expect(within(sheet).getByRole("link", { name: /^Ledger/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await user.click(within(sheet).getByRole("link", { name: /^Automations/ }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Automations" }),
    ).toBeInTheDocument();
  });

  it("keep the account menu in the top bar", async () => {
    matching(PHONE_QUERY);
    const { user } = await open();
    await user.click(screen.getByRole("button", { name: "Account" }));
    expect(await screen.findByRole("menuitem", { name: "Sign out" })).toBeInTheDocument();
  });
});

describe("motion", () => {
  it("animates route changes unless the user asks for reduced motion", () => {
    matching();
    expect(viewTransitions()).toBe(true);
    matching(REDUCED_MOTION_QUERY);
    expect(viewTransitions()).toBe(false);
  });
});

/** The English name of a tab, as the navigation shows it. */
function tabName(id: string): string {
  const names: Record<string, string> = {
    floor: "Floor",
    chat: "Chat",
    team: "Team room",
    aiops: "AI ops",
    eng: "Engineering",
    tasks: "Tasks",
    approvals: "Approvals",
    activity: "Activity",
    shops: "Shops",
    orders: "Orders",
    products: "Products",
    shipping: "Shipping",
    incidents: "Incidents",
    quotes: "Quotes",
    suppliers: "Suppliers",
    tickets: "Tickets",
    customers: "Customers",
    mail: "Mail",
    marketing: "Marketing",
    overview: "Overview",
    ledger: "Ledger",
    health: "Health",
    automations: "Automations",
    members: "Members & access",
    settings: "Settings",
  };
  return names[id] ?? id;
}

describe("the demo label", () => {
  it.each(["/office/chat", "/work/tasks", "/commerce/suppliers", "/finance/ledger"])(
    "%s carries the large DEMO pill in the top bar, centred there, never inside the screen",
    async (path) => {
      await open(path);
      const banner = screen.getByRole("heading", { level: 1 }).closest("header");
      if (banner === null) throw new Error("No top bar");
      // The pill is absolutely centred in the bar, so the bar must be its positioned box.
      expect(banner).toHaveClass("relative");
      const pill = within(banner).getByRole("note");
      expect(pill).toHaveTextContent("DEMO");
      expect(pill).toHaveClass("absolute", "inset-x-0", "justify-center");
      expect(within(screen.getByRole("main")).queryByText("DEMO")).not.toBeInTheDocument();
      expect(screen.getAllByText("DEMO")).toHaveLength(1);
    },
  );
});

describe("skipping the navigation (WCAG 2.4.1)", () => {
  it("offers 'Skip to content' as the first stop, and it moves focus to the screen", async () => {
    const { user } = await open("/settings");

    await user.tab();
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(skip).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("says it in Hebrew too", async () => {
    await open("/settings", { locale: "he" });
    expect(screen.getByRole("link", { name: "דילוג לתוכן" })).toBeInTheDocument();
  });
});
