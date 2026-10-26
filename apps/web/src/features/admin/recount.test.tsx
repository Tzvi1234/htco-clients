import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";

// Admin › Health › Sales counters (Phase 5 activation step 2b): the Owner and Admins recount a
// shop's product sales from its stored orders (`product-sales-counters` with `{"rebuild": true}`),
// after a confirm sheet, once per Idempotency-Key, and see how the run went.

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
  return { user: userEvent.setup(), backend };
}

/** The run's state: in its column on wide screens and under the shop on phones (CSS shows one;
 * jsdom applies no CSS, so both copies are here). */
async function shows(row: HTMLElement, text: string, timeout = 5000): Promise<void> {
  const found = await within(row).findAllByText(text, undefined, { timeout });
  expect(found.length).toBeGreaterThanOrEqual(1);
}

const counters = async () =>
  screen.findByRole("region", { name: "Sales counters" }, { timeout: 8000 });

// The whole app renders and each test presses through a sheet: more than 5 s on a busy runner.
describe("Sales counters: Recount sales (Phase 5 activation 2b)", { timeout: 15_000 }, () => {
  it("recounts one shop after the confirm sheet, once, and shows how the run went", async () => {
    const { user, backend } = await open();
    const panel = await counters();
    const row = within(panel).getByRole("row", { name: /Paper Fox Prints/ });

    await user.click(within(row).getByRole("button", { name: "Recount sales" }));
    const sheet = await screen.findByRole("dialog", {
      name: "Recount sales for Paper Fox Prints?",
    });
    await user.click(within(sheet).getByRole("button", { name: "Recount" }));

    await vi.waitFor(() => {
      expect(backend.state.recounts.started).toHaveLength(1);
    });
    const [started] = backend.state.recounts.started;
    expect(started?.body).toEqual({
      organization_id: "a0000000-0000-7000-8000-000000000000",
      shop_id: PAPER,
      payload: { rebuild: true },
    });
    expect(started?.key).toMatch(/^[0-9a-f-]{36}$/);
    expect(started?.workspace).toBe("a0000000-0000-7000-8000-000000000000");
    await shows(row, "Queued");

    backend.state.recounts.finish("succeeded");
    // The count comes from the execution's output (GET /v1/executions/{id}, platform #158).
    await shows(row, "Recounted, 7 products", 8000);
  });

  it("cancel sends nothing", async () => {
    const { user, backend } = await open();
    const panel = await counters();
    const row = within(panel).getByRole("row", { name: /Willow & Wick/ });
    await user.click(within(row).getByRole("button", { name: "Recount sales" }));
    const sheet = await screen.findByRole("dialog", { name: "Recount sales for Willow & Wick?" });
    await user.click(within(sheet).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(backend.state.recounts.started).toEqual([]);
  });

  it("a double press on Recount starts one run (the same Idempotency-Key)", async () => {
    const { user, backend } = await open();
    const panel = await counters();
    const row = within(panel).getByRole("row", { name: /Willow & Wick/ });
    await user.click(within(row).getByRole("button", { name: "Recount sales" }));
    const sheet = await screen.findByRole("dialog");
    const recount = within(sheet).getByRole("button", { name: "Recount" });
    await user.dblClick(recount);

    await vi.waitFor(() => {
      expect(backend.state.recounts.started.length).toBeGreaterThanOrEqual(1);
    });
    expect(new Set(backend.state.recounts.started.map((s) => s.key)).size).toBe(1);
    expect(backend.state.recounts.executions.size).toBe(1);
  });

  it("says the counters are not active yet when the automation is still a draft (409)", async () => {
    const { user } = await open({ recountRefused: true });
    const panel = await counters();
    const row = within(panel).getByRole("row", { name: /Willow & Wick/ });
    await user.click(within(row).getByRole("button", { name: "Recount sales" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Recount" }),
    );

    await shows(row, "The sales counters are not active yet. Activate them first, then recount.");
  });

  it("says when the run did not finish, instead of a silent stop", async () => {
    const { user, backend } = await open();
    const panel = await counters();
    const row = within(panel).getByRole("row", { name: /Willow & Wick/ });
    await user.click(within(row).getByRole("button", { name: "Recount sales" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Recount" }),
    );
    await vi.waitFor(() => {
      expect(backend.state.recounts.started).toHaveLength(1);
    });

    backend.state.recounts.finish("dead_lettered");
    await shows(row, "It did not finish. See it under dead letters.", 8000);
  });

  it("follows a new run from the platform's `pending` to Recounted (quill on #73)", async () => {
    const { user, backend } = await open();
    const panel = await counters();
    const row = within(panel).getByRole("row", { name: /Willow & Wick/ });
    await user.click(within(row).getByRole("button", { name: "Recount sales" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Recount" }),
    );
    await vi.waitFor(() => {
      expect([...backend.state.recounts.executions.values()].map((e) => e.state)).toEqual([
        "pending",
      ]);
    });
    await shows(row, "Queued");
    backend.state.recounts.finish("running");
    await shows(row, "Recounting", 8000);
    backend.state.recounts.finish("succeeded");
    await shows(row, "Recounted, 7 products", 8000);
  });

  it("lists only the chosen workspace's shops, and recounts them in it (Codex on #73)", async () => {
    const OTHER = "c0000000-0000-7000-8000-000000000009";
    const { user, backend } = await open({ otherOrgs: [OTHER] });
    await user.click(await screen.findByRole("radio", { name: /a0000000/ }));
    const panel = await counters();
    expect(within(panel).getAllByRole("button", { name: "Recount sales" })).toHaveLength(2);
    const row = within(panel).getByRole("row", { name: /Willow & Wick/ });
    await user.click(within(row).getByRole("button", { name: "Recount sales" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Recount" }),
    );
    await vi.waitFor(() => {
      expect(backend.state.recounts.started).toHaveLength(1);
    });
    expect(backend.state.recounts.started[0]?.body).toMatchObject({
      organization_id: "a0000000-0000-7000-8000-000000000000",
      shop_id: WILLOW,
    });
  });

  it("a running recount stays shown and locked after the panel remounts (Codex on #73)", async () => {
    const { user, backend } = await open();
    let panel = await counters();
    let row = within(panel).getByRole("row", { name: /Willow & Wick/ });
    await user.click(within(row).getByRole("button", { name: "Recount sales" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Recount" }),
    );
    await shows(row, "Queued");

    // Away to the Activity sub-tab and back: the panel unmounts and mounts again.
    await user.click(screen.getByRole("tab", { name: /Activity/ }));
    await user.click(screen.getByRole("tab", { name: /Needs you/ }));
    panel = await counters();
    row = within(panel).getByRole("row", { name: /Willow & Wick/ });
    await shows(row, "Queued");
    expect(within(row).getByRole("button", { name: "Recount sales" })).toBeDisabled();
    expect(backend.state.recounts.started).toHaveLength(1);
  });

  it("a recount whose answer was lost is retried with the same Idempotency-Key (Codex on #73)", async () => {
    const { user, backend } = await open({ recountLoseAnswer: true });
    const panel = await counters();
    const row = within(panel).getByRole("row", { name: /Willow & Wick/ });
    await user.click(within(row).getByRole("button", { name: "Recount sales" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Recount" }),
    );
    await vi.waitFor(() => {
      expect(backend.state.recounts.started).toHaveLength(1);
    });
    // The server made the run, but its answer was lost: try again sends the same key.
    backend.state.recountLoseAnswer = false;
    const again = within(row).queryByRole("button", { name: "Recount sales" });
    if (again !== null && !again.hasAttribute("disabled")) await user.click(again);
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Recount" }),
    );
    await vi.waitFor(() => {
      expect(backend.state.recounts.started).toHaveLength(2);
    });
    const keys = backend.state.recounts.started.map((s) => s.key);
    expect(keys[0]).toBe(keys[1]);
    expect(backend.state.recounts.executions.size).toBe(1);
  });

  it("keeps following a run that left the newest page (Codex on #73)", async () => {
    const { user, backend } = await open();
    const panel = await counters();
    const row = within(panel).getByRole("row", { name: /Willow & Wick/ });
    await user.click(within(row).getByRole("button", { name: "Recount sales" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Recount" }),
    );
    await shows(row, "Queued");
    backend.state.recountListHides = true; // 20 newer runs push it off the first page
    backend.state.recounts.finish("succeeded");
    await shows(row, "Recounted, 7 products", 8000);
  });

  it("is in Hebrew too", async () => {
    await open({}, "he");
    const panel = await screen.findByRole("region", { name: "מוני מכירות" }, { timeout: 8000 });
    expect(within(panel).getAllByRole("button", { name: "ספירה מחדש של המכירות" })).toHaveLength(2);
  });
});
