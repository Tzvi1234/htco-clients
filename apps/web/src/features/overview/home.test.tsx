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

const panel = (name: string) => {
  const heading = screen.getByRole("heading", { level: 2, name });
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

  it("steps through the hero concepts", async () => {
    const { user } = await open();

    const hero = screen.getByRole("group", { name: "Hero concepts" });
    expect(within(hero).getByRole("img", { name: "Miniature AI office" })).toBeInTheDocument();
    await user.click(within(hero).getByRole("button", { name: "Next concept" }));
    expect(within(hero).getByRole("img", { name: "Desk, monitor and robot" })).toBeInTheDocument();
    expect(within(hero).getByText("2/5")).toBeInTheDocument();
    await user.click(within(hero).getByRole("button", { name: "Previous concept" }));
    await user.click(within(hero).getByRole("button", { name: "Previous concept" }));
    expect(within(hero).getByRole("img", { name: "Shop kiosk" })).toBeInTheDocument();
    await user.click(within(hero).getByRole("tab", { name: "Printed product stack" }));
    expect(within(hero).getByRole("tab", { name: "Printed product stack" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("labels the parts that need unbuilt features as Demo and keeps them out of reach", async () => {
    await open();

    const parts = [...document.querySelectorAll("[data-demo-part]")];
    expect(parts.length).toBeGreaterThanOrEqual(4);
    for (const part of parts) {
      expect(part).toHaveAttribute("inert");
      expect(part).toHaveAttribute("aria-hidden", "true");
      expect(part).toHaveTextContent("Demo");
    }
    const needs = panel("What needs you");
    expect(within(needs).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(within(needs).getByText("Demo — coming soon")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Key numbers" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Key numbers", hidden: true }).closest("[data-demo-part]"),
    ).not.toBeNull();
  });
});
