import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { demoShops, fakeBackend, type FakeState } from "../../test/fakeApi.ts";

async function open(state: Partial<FakeState> = {}, storage = memoryStorage()) {
  const backend = fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2", ...state });
  render(
    <App
      locale="en"
      theme="system"
      storage={storage}
      history={createMemoryHistory({ initialEntries: ["/settings"] })}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1, name: "Settings" }, { timeout: 5000 });
  return { user: userEvent.setup(), backend, storage };
}

const root = document.documentElement;

afterEach(() => {
  vi.unstubAllGlobals();
});

/** The three personal settings, at the top of the page. */
const appearance = () => screen.getByRole("region", { name: "Appearance and language" });
const group = (name: string) => within(appearance()).getByRole("radiogroup", { name });

describe("Settings (FR-ADM-01, round 3)", () => {
  it("offers exactly three personal settings: theme, palette and language", async () => {
    await open();
    expect(
      within(appearance())
        .getAllByRole("radiogroup")
        .map((radios) =>
          radios.getAttribute("aria-labelledby") === null ? "" : radios.textContent,
        ),
    ).toHaveLength(3);
    expect(within(group("Theme")).getAllByRole("radio")).toHaveLength(3);
    expect(within(group("Palette")).getAllByRole("radio")).toHaveLength(2);
    expect(within(group("Language")).getAllByRole("radio")).toHaveLength(2);
  });

  it("changes the interface language, and remembers it", async () => {
    const { user, storage } = await open();

    await user.click(within(group("Language")).getByRole("radio", { name: /^עברית/ }));

    expect([root.lang, root.dir]).toEqual(["he", "rtl"]);
    expect(storage.getItem("htco.locale")).toBe("he");
  });

  it("follows the system theme by default, live, until Light or Dark is chosen", async () => {
    const listeners = new Set<() => void>();
    let dark = false;
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return query === "(prefers-color-scheme: dark)" && dark;
      },
      media: query,
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    }));
    const { user, storage } = await open();
    const theme = group("Theme");
    const system = within(theme).getByRole("radio", { name: /^System/ });

    expect(system).toBeChecked();
    expect(root.hasAttribute("data-theme")).toBe(false);
    expect(system.closest("label")).toHaveTextContent("Now light");
    act(() => {
      dark = true;
      for (const listener of listeners) listener();
    });
    expect(system.closest("label")).toHaveTextContent("Now dark");

    await user.click(within(theme).getByRole("radio", { name: "Light" }));
    expect(root.dataset["theme"]).toBe("light");
    expect(storage.getItem("htco.theme")).toBe("light");

    await user.click(within(theme).getByRole("radio", { name: "Dark" }));
    expect(root.dataset["theme"]).toBe("dark");

    await user.click(system);
    expect(root.hasAttribute("data-theme")).toBe(false);
    expect(storage.getItem("htco.theme")).toBe("system");
  });

  it("switches between the gray palette and the cream one, and remembers it", async () => {
    const { user, storage } = await open();
    const palette = group("Palette");
    expect(within(palette).getByRole("radio", { name: /^Gray/ })).toBeChecked();

    await user.click(within(palette).getByRole("radio", { name: /^Cream/ }));

    expect(root.dataset["pal"]).toBe("d4");
    expect(storage.getItem("htco.palette")).toBe("d4");
  });

  it("migrates what an earlier version remembered: plain becomes gray, the tweaks are gone", async () => {
    const storage = memoryStorage();
    storage.setItem("htco.palette", "plain");
    storage.setItem("htco.contrast", "3");
    storage.setItem("htco.glass", "3");
    storage.setItem("htco.borders", "2");
    storage.setItem("htco.locale", "en");
    await open({}, storage);

    expect(within(group("Palette")).getByRole("radio", { name: /^Gray/ })).toBeChecked();
    expect(storage.getItem("htco.palette")).toBe("sbb");
    for (const key of ["htco.contrast", "htco.glass", "htco.borders"]) {
      expect(storage.getItem(key), key).toBeNull();
    }
    expect([
      root.dataset["pal"],
      root.dataset["t1"],
      root.dataset["t2"],
      root.dataset["t3"],
    ]).toEqual(["sbb", undefined, undefined, undefined]);
  });

  it("scrolls as one page: no panel scrolls on its own", async () => {
    await open();
    expect(document.querySelector("main [data-screen-scroll]")).toBeNull();
    // The page asks the shell to scroll it whole (the panels then grow with their content).
    const sidebarColumn = screen.getByRole("complementary", { name: "Sidebar" }).parentElement;
    expect(sidebarColumn).toHaveClass("sticky");
  });

  it("shows the real Etsy shops and marks the planned settings as demos", async () => {
    await open(demoShops());

    const connections = screen.getByRole("region", { name: "Connections" });
    expect(await within(connections).findByText("4 shops")).toBeInTheDocument();
    expect(await within(connections).findByText("2 of 4 connected")).toBeInTheDocument();
    // Printful, Telegram and Google Drive are planned: each is a dimmed, inert demo row.
    const demos = connections.querySelectorAll("[data-demo-part]");
    expect(demos).toHaveLength(3);
    for (const demo of demos) {
      expect(within(demo as HTMLElement).getByText("Demo")).toBeInTheDocument();
      expect(demo.querySelector("[inert]")).not.toBeNull();
    }

    const notifications = screen.getByRole("region", { name: "Notifications" });
    expect(within(notifications).getByText("Demo")).toBeInTheDocument();
    expect(notifications.querySelector("[inert]")).not.toBeNull();
  });

  it("counts the Etsy shops of every workspace, not just the first", async () => {
    const other = "c0000000-0000-7000-8000-000000000009";
    await open({ ...demoShops(), otherOrgs: [other] });

    const connections = screen.getByRole("region", { name: "Connections" });
    // The fake answers each workspace with the same four shops, two of them connected.
    expect(await within(connections).findByText("8 shops")).toBeInTheDocument();
    expect(await within(connections).findByText("4 of 8 connected")).toBeInTheDocument();
  });

  it("leaves out the connection health a role cannot see", async () => {
    await open({ ...demoShops(), role: "support" });

    const connections = screen.getByRole("region", { name: "Connections" });
    expect(await within(connections).findByText("4 shops")).toBeInTheDocument();
    const etsy = within(connections).getByRole("link", { name: /Etsy/ });
    expect(within(etsy).queryByText(/connected/i)).not.toBeInTheDocument();
  });

  it("leads to Security with the second factor's state", async () => {
    await open();
    const access = screen.getByRole("region", { name: "Access and security" });
    const security = within(access).getByRole("link", { name: /Security/ });
    expect(security).toHaveAttribute("href", "/settings/security");
    expect(await within(security).findByText("Two-step sign-in on")).toBeInTheDocument();
  });
});
