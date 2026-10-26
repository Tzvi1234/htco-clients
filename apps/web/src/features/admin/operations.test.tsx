import { createMemoryHistory } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { forgetSession } from "../../shared/api/api.tsx";
import { operationsKeys } from "../../shared/api/operations.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";
import { DEAD_EXECUTION, DEAD_JOB, fakeOperations } from "../../test/fakeOperations.ts";

// Admin › Health (platform slice 5.9): the queue, the workers, the shops' syncs, webhook intake,
// executions, outbox failures and per-automation metrics, for the Owner and Admins; the audited
// retry of a dead job, and an execution's chain view (invented data).

const WILLOW = "d0000000-0000-7000-8000-000000000001";
const PAPER = "d0000000-0000-7000-8000-000000000002";
const ORG = "a0000000-0000-7000-8000-000000000000";
const OTHER = "c0000000-0000-7000-8000-000000000009";
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

const operational = (backend: { requests: Request[] }) =>
  backend.requests.filter((r) => /\/v1\/(operations|executions|automations)\//.test(r.url));

describe("Admin › Health (slice 5.9)", () => {
  it("is a real screen: what needs the owner first, then each part", async () => {
    await open();

    expect(screen.queryByText("Demo — coming soon")).not.toBeInTheDocument();
    expect(await screen.findByText(/2 jobs ran out of retries/)).toBeInTheDocument();
    // What needs the owner comes first; the activity of the last days sits under its own tab.
    for (const name of ["Dead letters", "Workers", "Shop syncs"])
      expect(await table(name)).toBeInTheDocument();
    expect(screen.queryByRole("table", { name: "Webhook intake" })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("tab", { name: /Activity/ }));
    for (const name of ["Automations", "Webhook intake", "Recent executions", "Outbox failures"])
      expect(await table(name)).toBeInTheDocument();
  });

  it("the focus panel's action opens the first dead letter", async () => {
    const { user } = await open();

    await user.click(screen.getByRole("button", { name: "Open the first dead letter" }));

    expect(screen.getByRole("button", { name: "Retry the job etsy.webhook_event" })).toHaveFocus();
  });

  it.each([
    ["noWorker", /No worker is running/],
    // Codex review of #60: an empty worker list is no worker at all, not "everything runs".
    ["noWorkers", /No worker is running/],
    ["stale", /One shop has not synced within its window/],
    ["calm", /Everything runs/],
  ] as const)(
    "the focus panel leads with %s when nothing worse needs the owner",
    async (scene, lead) => {
      await open({ operations: fakeOperations(scene) });

      expect(await screen.findByText(lead)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Open the first dead letter" })).toBeNull();
    },
  );

  it("only the stale shop the owner must look at is orange; other stale rows stay quiet", async () => {
    await open({
      operations: fakeOperations("stale"),
      shops: [
        { id: WILLOW, name: "Willow & Wick", status: "active" },
        { id: PAPER, name: "Paper Fox Prints", status: "active" },
        { id: "d0000000-0000-7000-8000-000000000003", name: "Oak Ink", status: "active" },
      ],
    });

    const syncs = await table("Shop syncs");
    expect(within(syncs).getAllByText("Stale")).toHaveLength(2);
    expect(syncs.querySelectorAll('[fill="var(--attention-fill)"]').length).toBeGreaterThan(0);
    expect(within(syncs).getAllByText("Stale")[1]?.closest(".text-secondary")).not.toBeNull();
  });

  it("execution and outbox states are a glyph plus a word, not the raw value", async () => {
    const { user } = await open();
    await user.click(screen.getByRole("tab", { name: /Activity/ }));

    const executions = await table("Recent executions");
    expect(within(executions).getByText("Succeeded")).toBeInTheDocument();
    expect(within(executions).getByText("Dead-lettered")).toBeInTheDocument();
    expect(within(executions).queryByText("dead_lettered")).toBeNull();
    expect(within(await table("Outbox failures")).getByText("Retrying")).toBeInTheDocument();
  });

  it("every operations call names its workspace", async () => {
    const { user, backend } = await open();
    const letters = await table("Dead letters");
    await user.click(
      within(letters).getByRole("button", { name: "Retry the job etsy.webhook_event" }),
    );
    await screen.findByText(/Queued again/);
    await user.click(within(letters).getByRole("button", { name: "Open the execution" }));
    const sheet = await screen.findByRole("dialog", { name: "Execution" });
    await user.click(await within(sheet).findByRole("button", { name: "Retry the execution" }));
    await within(sheet).findByText("The execution goes back to its retry.");

    const calls = operational(backend).map((r) => `${r.method} ${new URL(r.url).pathname}`);
    for (const route of [
      "GET /api/v1/operations/health",
      `POST /api/v1/operations/dead-letters/${DEAD_JOB}/retry`,
      `GET /api/v1/executions/${DEAD_EXECUTION}`,
      `POST /api/v1/automations/etsy-order-intake/executions/${DEAD_EXECUTION}/retry`,
    ])
      expect(calls.some((c) => c.endsWith(route.replace(/^\w+ \/api/, "")))).toBe(true);
    for (const r of operational(backend))
      expect(new URL(r.url).searchParams.get("organization_id")).toBe(ORG);
  });

  it("a member of several workspaces picks one, and switching never shows the other's data", async () => {
    const { user, backend } = await open({ otherOrgs: [OTHER] });

    expect(screen.getByText(/Choose the workspace/)).toBeInTheDocument();
    expect(operational(backend)).toHaveLength(0);

    await user.click(screen.getByRole("radio", { name: /a0000000/ }));
    expect(await screen.findByText(/2 jobs ran out of retries/)).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /c0000000/ }));
    expect(await screen.findByText(/Everything runs/)).toBeInTheDocument();
    expect(screen.queryByText(/2 jobs ran out of retries/)).toBeNull();
    const named = operational(backend).map((r) =>
      new URL(r.url).searchParams.get("organization_id"),
    );
    expect(named).toContain(ORG);
    expect(named).toContain(OTHER);
    expect(named).not.toContain(null);
  });

  it("scopes its cache by workspace and forgets it with the session", () => {
    expect(operationsKeys.health(ORG)).not.toEqual(operationsKeys.health(OTHER));
    expect(operationsKeys.execution(ORG, DEAD_EXECUTION)).not.toEqual(
      operationsKeys.execution(OTHER, DEAD_EXECUTION),
    );
    const client = new QueryClient();
    client.setQueryData(operationsKeys.health(ORG), { dead_letters: [] });
    client.setQueryData(operationsKeys.execution(ORG, DEAD_EXECUTION), { entries: [] });

    forgetSession(client);

    expect(client.getQueryData(operationsKeys.health(ORG))).toBeUndefined();
    expect(client.getQueryData(operationsKeys.execution(ORG, DEAD_EXECUTION))).toBeUndefined();
  });

  it("a job retried elsewhere says so instead of failing silently", async () => {
    const { user, backend } = await open();
    const letters = await table("Dead letters");
    backend.state.operations.dead = [];

    await user.click(
      within(letters).getByRole("button", { name: "Retry the job etsy.webhook_event" }),
    );

    expect(await screen.findByText("This job is no longer dead-lettered.")).toBeInTheDocument();
  });

  it("an execution retried elsewhere says so", async () => {
    const { user, backend } = await open();
    const letters = await table("Dead letters");
    await user.click(within(letters).getByRole("button", { name: "Open the execution" }));
    const sheet = await screen.findByRole("dialog", { name: "Execution" });
    const retry = await within(sheet).findByRole("button", { name: "Retry the execution" });
    backend.state.operations.retriedExecutions.push(DEAD_EXECUTION);

    await user.click(retry);

    expect(
      await within(sheet).findByText("This execution is no longer dead-lettered."),
    ).toBeInTheDocument();
  });

  it("a double press on a slow connection sends one execution retry", async () => {
    const { promise: hold, resolve: release } = Promise.withResolvers<undefined>();
    const { user, backend } = await open();
    backend.state.operations.hold = hold;
    const letters = await table("Dead letters");
    await user.click(within(letters).getByRole("button", { name: "Open the execution" }));
    const sheet = await screen.findByRole("dialog", { name: "Execution" });
    const retry = await within(sheet).findByRole("button", { name: "Retry the execution" });

    await user.click(retry);
    await user.click(retry);
    release(undefined);

    expect(
      await within(sheet).findByText("The execution goes back to its retry."),
    ).toBeInTheDocument();
    const posts = backend.requests.filter(
      (r) => r.method === "POST" && r.url.includes(`/executions/${DEAD_EXECUTION}/retry`),
    );
    expect(posts).toHaveLength(1);
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
    const { user } = await open();
    await user.click(screen.getByRole("tab", { name: /Activity/ }));

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
