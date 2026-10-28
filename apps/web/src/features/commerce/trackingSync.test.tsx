import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";

// Commerce › Shipping › Tracking: Tracking Synchronization's status from the operations health
// read (`automations[]`) and its latest runs (`GET /v1/automations/tracking-sync/executions`),
// in place of the demo part; delivery performance stays a demo (invented data).

const ORG = "a0000000-0000-7000-8000-000000000000";
const WILLOW = "d0000000-0000-7000-8000-000000000001";
const base: Partial<FakeState> = {
  signedIn: true,
  enrolled: true,
  assurance: "aal2",
  shops: [{ id: WILLOW, name: "Willow & Wick", status: "active" }],
  integrations: [fakeIntegration(WILLOW, "ok")],
  trackingSync: "running",
};

vi.setConfig({ testTimeout: 20_000 });

async function open(state: Partial<FakeState> = {}) {
  const backend = fakeBackend({ ...base, ...state });
  render(
    <App
      locale="en"
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: ["/commerce/shipping"] })}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 });
  const user = userEvent.setup();
  await user.click(await screen.findByRole("tab", { name: /Tracking/ }, { timeout: 8000 }));
  const panel = await screen.findByRole("region", { name: "Tracking sync" });
  return { user, backend, panel };
}

describe("Tracking Sync on Shipping › Tracking", () => {
  it("shows its week and latest runs, live, instead of the demo", async () => {
    const { panel, backend } = await open();

    expect(await within(panel).findByText("Running")).toBeInTheDocument();
    expect(within(panel).getByText("96")).toBeInTheDocument();
    expect(within(panel).getByText("100.0%")).toBeInTheDocument();
    const runs = await within(panel).findByRole("region", { name: "Latest Tracking Sync runs" });
    expect(within(runs).getAllByRole("listitem")).toHaveLength(3);
    expect(panel.closest("[data-demo]")).toBeNull();
    expect(within(panel).queryByText("DEMO")).toBeNull();
    // Delivery performance is still a demo, in its own panel.
    expect(screen.getByRole("region", { name: "Delivery performance" })).toBeInTheDocument();
    const reads = backend.requests.filter((r) =>
      /\/v1\/(operations\/health|automations\/tracking-sync\/executions)$/.test(
        new URL(r.url).pathname,
      ),
    );
    expect(reads.length).toBeGreaterThanOrEqual(2);
    for (const r of reads) expect(new URL(r.url).searchParams.get("organization_id")).toBe(ORG);
  });

  it("says it is failing when runs were dead-lettered", async () => {
    const { panel } = await open({ trackingSync: "failing" });

    expect(await within(panel).findByText("Failing")).toBeInTheDocument();
    const runs = await within(panel).findByRole("region", { name: "Latest Tracking Sync runs" });
    expect(within(runs).getByText("Dead-lettered")).toBeInTheDocument();
  });

  it("says it has not run when nothing was recorded, never that it is fine", async () => {
    const { panel } = await open({ trackingSync: undefined });

    expect(
      await within(panel).findByText(/Tracking Sync has not run in the last seven days/),
    ).toBeInTheDocument();
    expect(within(panel).queryByText("Running")).toBeNull();
  });

  it("says so and offers to try again when the health read fails", async () => {
    const { panel, user, backend } = await open({ healthTrouble: "fail" });

    expect(
      await within(panel).findByText("Tracking Sync's status is not available on this server yet."),
    ).toBeInTheDocument();
    backend.state.healthTrouble = undefined;
    await user.click(within(panel).getByRole("button", { name: "Try again" }));
    expect(await within(panel).findByText("Running")).toBeInTheDocument();
  });

  it("tells other roles only the Owner and Admins see it (403)", async () => {
    const { panel, backend } = await open({ role: "support" });

    expect(
      await within(panel).findByText(
        "Only the workspace Owner and Admins see how Tracking Sync runs.",
      ),
    ).toBeInTheDocument();
    expect(within(panel).queryByRole("button", { name: "Try again" })).toBeNull();
    expect(
      backend.requests.some((r) => r.url.includes("/automations/tracking-sync/executions")),
    ).toBe(false);
  });

  it("goes back to sign-in when the session ended (401)", async () => {
    const backend = fakeBackend({ ...base });
    render(
      <App
        locale="en"
        theme="system"
        storage={memoryStorage()}
        history={createMemoryHistory({ initialEntries: ["/commerce/shipping"] })}
        api={backend.client}
      />,
    );
    await screen.findByRole("heading", { level: 1, name: "Shipping" });
    backend.state.signedIn = false;
    await userEvent.setup().click(await screen.findByRole("tab", { name: /Tracking/ }));

    expect(
      await screen.findByRole("heading", { level: 1, name: /sign in/i }, { timeout: 8000 }),
    ).toBeVisible();
  });
});
