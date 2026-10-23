import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";
import { DEAD_EXECUTION, DEAD_JOB } from "../../test/fakeOperations.ts";

// Admin › Health (platform slice 5.9): the queue, the workers, the shops' syncs, webhook intake,
// executions, outbox failures and per-automation metrics, for the Owner and Admins; the audited
// retry of a dead job, and an execution's chain view (invented data).

const WILLOW = "d0000000-0000-7000-8000-000000000001";
const PAPER = "d0000000-0000-7000-8000-000000000002";
const base: Partial<FakeState> = {
  signedIn: true,
  enrolled: true,
  assurance: "aal2",
  shops: [
    { id: WILLOW, name: "Willow & Wick", status: "active" },
    { id: PAPER, name: "Paper Fox Prints", status: "active" },
  ],
  integrations: [fakeIntegration(WILLOW, "ok"), fakeIntegration(PAPER, "ok")],
};

async function open(state: Partial<FakeState> = {}, locale: "en" | "he" = "en") {
  const backend = fakeBackend({ ...base, ...state });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: ["/admin/health"] })}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 });
  await vi.waitFor(
    () => {
      expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    },
    { timeout: 8000 },
  );
  return { user: userEvent.setup(), backend };
}

const table = (name: string) => screen.findByRole("table", { name });

describe("Admin › Health (slice 5.9)", () => {
  it("is a real screen: what needs the owner first, then each part", async () => {
    await open();

    expect(screen.queryByText("Demo — coming soon")).not.toBeInTheDocument();
    expect(await screen.findByText(/2 jobs ran out of retries/)).toBeInTheDocument();
    for (const name of [
      "Dead letters",
      "Automations",
      "Workers",
      "Shop syncs",
      "Webhook intake",
      "Recent executions",
      "Outbox failures",
    ])
      expect(await table(name)).toBeInTheDocument();
  });

  it("AC-5.9.2: a dead letter shows its last error and is retried, audited by the server", async () => {
    const { user, backend } = await open();
    const letters = await table("Dead letters");
    expect(within(letters).getByText("MarketplaceUnavailableError")).toBeInTheDocument();

    await user.click(
      within(letters).getByRole("button", { name: "Retry the job etsy.webhook_event" }),
    );

    expect(await screen.findByText(/Queued again/)).toBeInTheDocument();
    expect(backend.state.operations.dead).not.toContain(DEAD_JOB);
    expect(
      backend.requests.some(
        (r) => r.method === "POST" && r.url.includes(`/dead-letters/${DEAD_JOB}/retry`),
      ),
    ).toBe(true);
  });

  it("an execution's dead job opens its chain, where the execution is retried", async () => {
    const { user, backend } = await open();
    const letters = await table("Dead letters");

    await user.click(within(letters).getByRole("button", { name: "Open the execution" }));
    const sheet = await screen.findByRole("dialog", { name: "Execution" });
    expect(await within(sheet).findByText("etsy.receipts.read")).toBeInTheDocument();
    await user.click(within(sheet).getByRole("button", { name: "Retry the execution" }));

    expect(
      await within(sheet).findByText("The execution goes back to its retry."),
    ).toBeInTheDocument();
    expect(backend.state.operations.retriedExecutions).toEqual([DEAD_EXECUTION]);
  });

  it("AC-5.9.1 and AC-5.9.3: a stopped worker and a stale shop are named", async () => {
    await open();

    const workers = await table("Workers");
    expect(within(workers).getByText("Stopped")).toBeInTheDocument();
    expect(within(workers).getByText("Running")).toBeInTheDocument();
    const syncs = await table("Shop syncs");
    expect(within(syncs).getByText("Stale")).toBeInTheDocument();
    expect(within(syncs).getByText("Paper Fox Prints")).toBeInTheDocument();
  });

  it("shows per automation its runs, success rate, retries, dead letters and latency", async () => {
    await open();

    const automations = await table("Automations");
    const row = within(automations).getByText("etsy-order-intake").closest("tr");
    if (row === null) throw new Error("no row");
    expect(within(row).getByText("99.5%")).toBeInTheDocument();
    expect(within(row).getByText("212")).toBeInTheDocument();
  });

  it("only the Owner and Admins see it", async () => {
    await open({ role: "support" });

    expect(
      await screen.findByText("Only the workspace Owner and Admins see the queue and sync health."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("he: speaks Hebrew, IDs and error codes stay LTR", async () => {
    await open({}, "he");

    expect(screen.getByRole("heading", { level: 1, name: "בריאות מערכת" })).toBeInTheDocument();
    const code = await screen.findByText("MarketplaceUnavailableError");
    expect(code.closest(".ltr")).not.toBeNull();
    expect(document.documentElement.dir).toBe("rtl");
  });
});
