import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, type FakeState } from "../../test/fakeApi.ts";

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
    const officeParts = screen.getByRole("tabpanel").querySelectorAll("[data-demo-part]");
    expect(officeParts.length).toBeGreaterThanOrEqual(3);
    for (const part of officeParts) {
      expect(part.querySelector(":scope > [inert][aria-hidden='true']")).not.toBeNull();
    }
  });
});
