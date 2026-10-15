import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { demoShops, fakeBackend, type FakeState } from "../../test/fakeApi.ts";

async function open(state: Partial<FakeState> = {}) {
  const backend = fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2", ...state });
  const storage = memoryStorage();
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

describe("Settings (FR-ADM-01)", () => {
  it("changes the interface language", async () => {
    const { user, storage } = await open();
    const general = screen.getByRole("region", { name: "General" });

    await user.click(within(general).getByRole("button", { name: /Interface language/ }));
    await user.click(await screen.findByRole("option", { name: "עברית" }));

    expect([root.lang, root.dir]).toEqual(["he", "rtl"]);
    expect(storage.getItem("htco.locale")).toBe("he");
  });

  it("sets the design tweaks shared with the top bar's panel", async () => {
    const { user, storage } = await open();
    const appearance = screen.getByRole("region", { name: "Appearance" });

    await user.click(
      within(within(appearance).getByRole("radiogroup", { name: "Frosted glass" })).getByRole(
        "radio",
        { name: "Very different" },
      ),
    );
    expect(root.dataset["t2"]).toBe("3");
    expect(storage.getItem("htco.glass")).toBe("3");

    await user.click(screen.getByRole("button", { name: "Design tweaks" }));
    const panel = await screen.findByRole("dialog", { name: "Design tweaks" });
    expect(
      within(within(panel).getByRole("radiogroup", { name: "Frosted glass" })).getByRole("radio", {
        name: "Very different",
      }),
    ).toBeChecked();
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
