import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, type FakeState } from "../../test/fakeApi.ts";
import { demoIncidents } from "../../test/fakeIncidents.ts";

async function open(state: Partial<FakeState> = {}, locale: "en" | "he" = "en") {
  const backend = fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2", ...state });
  const history = createMemoryHistory({ initialEntries: ["/"] });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={history}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 });
  return { user: userEvent.setup(), backend, history };
}

const panel = (...names: string[]) => {
  const heading = screen
    .getAllByRole("heading", { level: 2 })
    .find((h) => names.includes(h.textContent));
  const name = names.join(" / ");
  if (heading === undefined) throw new Error(`No panel ${name}`);
  const section = heading.closest("section");
  if (section === null) throw new Error(`No panel ${name}`);
  return section;
};

afterEach(() => {
  vi.useRealTimers();
});

describe("Home (Design 1C P.home)", () => {
  it("is titled Home, greets by the time of day and shows today's date", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 15, 19, 30));
    await open();

    expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
    const today = panel("Good evening");
    expect(within(today).getByText("15.10.2026")).toBeInTheDocument();
  });

  it("greets in Hebrew right-to-left", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 15, 8, 0));
    await open({}, "he");

    expect(screen.getByRole("heading", { level: 1, name: "בית" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "בוקר טוב" })).toBeInTheDocument();
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("offers to connect the first shop while none is connected", async () => {
    await open();

    const link = await screen.findByRole("link", { name: "Connect a shop" });
    expect(link).toHaveAttribute("href", "/shops");
    expect(screen.getByText("No shop connected yet")).toBeInTheDocument();
  });

  it("shows the real shop and how many are connected", async () => {
    await open({
      shops: [
        { id: "s-1", name: "Willow & Wick", status: "active" },
        { id: "s-2", name: "Paper Fox", status: "active" },
      ],
    });

    expect(await screen.findByText("Willow & Wick")).toBeInTheDocument();
    expect(screen.getByText("2 shops")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Connect a shop" })).not.toBeInTheDocument();
  });

  it("marks security done for a second-factor session and the shop once connected", async () => {
    await open({ shops: [{ id: "s-1", name: "Willow & Wick", status: "active" }] });

    const start = panel("Getting started");
    expect(await within(start).findByText("2 of 3 done")).toBeInTheDocument();
    expect(within(start).getByText("Meet your office")).toBeInTheDocument();
    expect(within(start).getByRole("link", { name: "Soon" })).toHaveAttribute(
      "href",
      "/office/floor",
    );
  });

  it("shows one calm studio render beside today, with no carousel to work", async () => {
    await open();

    // The carousel, its dots and arrows left Home in the clarity redesign (round 3): the focus
    // is today's numbers and the one next step.
    expect(screen.queryByRole("group", { name: "Hero concepts" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next concept" })).not.toBeInTheDocument();
    const today = panel("Good morning", "Good afternoon", "Good evening", "Good night");
    expect(today.querySelectorAll("img")).toHaveLength(1);
  });

  it("leads with the next step: ship what waits, or open the orders", async () => {
    await open({ shops: [{ id: "s-1", name: "Willow & Wick", status: "active" }] });

    const today = panel("Good morning", "Good afternoon", "Good evening", "Good night");
    const next = await within(today).findByRole("link", { name: /Open orders|what waits to ship/ });
    expect(next.getAttribute("href")).toMatch(/^\/commerce\/(orders|shipping)$/);
  });

  it.each([
    ["en", "ArrowRight", "ArrowLeft"],
    ["he", "ArrowLeft", "ArrowRight"],
  ] as const)(
    "moves between Today and Office with the arrow keys along the reading direction (%s)",
    async (locale, forward, back) => {
      const { user } = await open({}, locale);
      const tabs = within(screen.getByRole("tablist")).getAllByRole("tab");
      // One tab stop: only the chosen view is in the tab order.
      expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1]);

      tabs[0]?.focus();
      await user.keyboard(`{${forward}}`);
      const office = within(screen.getByRole("tablist")).getAllByRole("tab")[1];
      expect(office).toHaveAttribute("aria-selected", "true");
      expect(office).toHaveFocus();
      expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", office?.id);
      await user.keyboard(`{${back}}`);
      expect(within(screen.getByRole("tablist")).getAllByRole("tab")[0]).toHaveAttribute(
        "aria-selected",
        "true",
      );
    },
  );

  it("labels the parts that need unbuilt features as Demo and keeps them out of reach", async () => {
    const { user } = await open({
      shops: [{ id: "s-1", name: "Willow & Wick", status: "active" }],
    });

    // Today: the approvals; Office (its own sub-tab): the pulse, tickets and incidents.
    const parts = [...document.querySelectorAll("[data-demo-part]")];
    expect(parts.length).toBeGreaterThanOrEqual(1);
    for (const part of parts) {
      // The part's sample content is inert and hidden; its tag and the spoken label are beside it.
      expect(part.querySelector(":scope > [inert][aria-hidden='true']")).not.toBeNull();
      expect(part).toHaveTextContent("Demo");
    }
    const needs = panel("What needs you");
    expect(within(needs).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(within(needs).getByText("Demo — coming soon")).toBeInTheDocument();
    // Revenue and orders are live from Etsy (commerce/live.test.tsx); tickets and incidents are
    // Demo parts under the Office sub-tab.
    const numbers = screen.getByRole("list", { name: "Key numbers" });
    expect(within(numbers).getByText("Revenue").closest("[data-demo-part]")).toBeNull();
    await user.click(screen.getByRole("tab", { name: /Office/ }));
    // The pulse and the tickets; the incidents are live (below).
    const officeParts = screen.getByRole("tabpanel").querySelectorAll("[data-demo-part]");
    expect(officeParts).toHaveLength(2);
    for (const part of officeParts) {
      expect(part.querySelector(":scope > [inert][aria-hidden='true']")).not.toBeNull();
    }
  });
});

// Home › Office › Incidents on the live incident list (platform slice 6.5): how many are open
// and the most urgent one, leading into the incident center. The same query and cache as the
// incident center; invented incidents only.
describe("Home › Office › Incidents", () => {
  const ORG = "a0000000-0000-7000-8000-000000000000";
  const SHOPS = [
    { id: "d0000000-0000-7000-8000-000000000001", name: "Willow & Wick", status: "active" },
    { id: "d0000000-0000-7000-8000-000000000002", name: "Paper Fox", status: "active" },
  ];

  async function office(state: Partial<FakeState> = {}, locale: "en" | "he" = "en") {
    const opened = await open({ shops: SHOPS, ...state }, locale);
    await opened.user.click(
      screen.getByRole("tab", { name: locale === "he" ? /המשרד/ : /Office/ }),
    );
    const incidents = panel(locale === "he" ? "תקלות" : "Incidents");
    return { ...opened, incidents };
  }

  it("counts the open incidents and leads with the most urgent, not a demo", async () => {
    const { incidents } = await office({ incidents: demoIncidents(SHOPS.map((s) => s.id)) });

    expect(incidents.closest("[data-demo-part]")).toBeNull();
    expect(incidents.querySelector("[data-demo-part]")).toBeNull();
    expect(await within(incidents).findByText("3")).toBeInTheDocument();
    // The most urgent: the highest severity (critical), then the oldest.
    const urgent = within(incidents).getByRole("link", { name: /Automation gave up/ });
    expect(urgent).toHaveAttribute(
      "href",
      `/incidents/e0000000-0000-7000-8000-000000000003?workspace=${ORG}`,
    );
    expect(within(incidents).getByText("Critical")).toBeInTheDocument();
    expect(within(incidents).getByRole("link", { name: "All incidents" })).toHaveAttribute(
      "href",
      "/incidents",
    );
  });

  it("says how many are high or critical, as the incident center does", async () => {
    const { incidents } = await office({ incidents: demoIncidents(SHOPS.map((s) => s.id)) });

    // Open: one critical, one high, one medium.
    expect(await within(incidents).findByText("2 high or critical")).toBeInTheDocument();
  });

  it("drops a cached list once a refresh is refused, and says the role does not see them", async () => {
    const { incidents, backend, user } = await office({
      incidents: demoIncidents(SHOPS.map((s) => s.id)),
    });
    expect(await within(incidents).findByText("3")).toBeInTheDocument();

    // A role change: the next read is refused while React Query still holds the earlier list.
    backend.state.incidentsTrouble = "forbidden";
    // Back to Office: the list mounts again and refetches (it is stale at once).
    await user.click(screen.getByRole("tab", { name: /Today/ }));
    await user.click(screen.getByRole("tab", { name: /Office/ }));

    const again = panel("Incidents");
    expect(await within(again).findByText("Your role does not see incidents.")).toBeInTheDocument();
    expect(within(again).queryByText("3")).toBeNull();
    expect(within(again).queryByRole("link", { name: /Automation gave up/ })).toBeNull();
  });

  it("says when nothing is open", async () => {
    const { incidents } = await office();

    expect(await within(incidents).findByText("No open incident.")).toBeInTheDocument();
    expect(within(incidents).getByText("0")).toBeInTheDocument();
  });

  it.each([
    ["forbidden", "Your role does not see incidents."],
    ["fail", "The incidents could not be loaded. Try again shortly."],
  ] as const)("says why when the list is %s, never a zero", async (trouble, words) => {
    const { incidents } = await office({ incidentsTrouble: trouble });

    expect(await within(incidents).findByText(words)).toBeInTheDocument();
    expect(within(incidents).queryByText("0")).toBeNull();
  });

  it("asks for the open incidents of the workspace by name", async () => {
    const { backend } = await office({ incidents: demoIncidents(SHOPS.map((s) => s.id)) });
    await vi.waitFor(() => {
      expect(backend.requests.some((r) => new URL(r.url).pathname.endsWith("/v1/incidents"))).toBe(
        true,
      );
    });

    for (const request of backend.requests.filter((r) =>
      new URL(r.url).pathname.endsWith("/v1/incidents"),
    )) {
      const query = new URL(request.url).searchParams;
      expect(query.get("organization_id")).toBe(ORG);
      expect(query.get("state")).toBe("open");
    }
  });

  it("speaks Hebrew", async () => {
    const { incidents } = await office({ incidents: demoIncidents(SHOPS.map((s) => s.id)) }, "he");

    expect(await within(incidents).findByText("3")).toBeInTheDocument();
    expect(within(incidents).getByRole("link", { name: "כל התקלות" })).toBeInTheDocument();
  });
});
