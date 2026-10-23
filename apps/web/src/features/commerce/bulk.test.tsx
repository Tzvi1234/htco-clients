import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";

// The Orders screen's bulk actions (slice 5.7, the owner's decision of 2026-10-23): export the
// filtered or selected orders as a CSV the server makes, and re-sync the selected ones.

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;
const WILLOW = "d0000000-0000-7000-8000-000000000001";
const shop: Partial<FakeState> = {
  shops: [{ id: WILLOW, name: "Willow & Wick", status: "active" }],
  integrations: [fakeIntegration(WILLOW, "ok")],
  orderStore: true,
};

async function open(state: Partial<FakeState> = {}) {
  const backend = fakeBackend({ ...owner, ...shop, ...state });
  render(
    <App
      locale="en"
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: ["/commerce/orders"] })}
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Orders: export and re-sync (slice 5.7)", () => {
  it("AC-5.7.5: exports the filter as a CSV made by the server and says how many", async () => {
    const created = vi.fn(() => "blob:orders");
    vi.stubGlobal(
      "URL",
      Object.assign(URL, { createObjectURL: created, revokeObjectURL: vi.fn() }),
    );
    const { user, backend } = await open();

    await user.click(screen.getByRole("button", { name: "Export to CSV" }));

    expect(await screen.findByText(/^Exported \d+ orders\.$/)).toBeInTheDocument();
    expect(backend.state.exports).toEqual([{ period: "30d", order_ids: [] }]);
    expect(created).toHaveBeenCalledOnce();
  });

  it("exports and re-syncs only the selected orders", async () => {
    vi.stubGlobal(
      "URL",
      Object.assign(URL, { createObjectURL: vi.fn(() => "blob:x"), revokeObjectURL: vi.fn() }),
    );
    const { user, backend } = await open();
    const table = await screen.findByRole("table", { name: "Orders" });
    const boxes = within(table).getAllByRole("checkbox", { name: /^Select order / });
    const [first, second] = boxes;
    if (first === undefined || second === undefined) throw new Error("no orders");
    const ids = [first, second].map((b) => Number(b.getAttribute("aria-label")?.split(" ").at(-1)));

    await user.click(first);
    await user.click(second);
    await user.click(screen.getByRole("button", { name: "Export 2 selected" }));
    await screen.findByText(/^Exported 2 orders\.$/);
    await user.click(screen.getByRole("button", { name: "Re-sync selected" }));

    expect(
      await screen.findByText("2 orders queued to be read again from Etsy."),
    ).toBeInTheDocument();
    expect(backend.state.exports).toEqual([{ period: "30d", order_ids: ids }]);
    expect(backend.state.resyncs).toEqual([ids]);
  });

  it("AC-5.7.6: re-sync waits for a selection, and a role that may not says so", async () => {
    const { user } = await open({ role: "support" });

    expect(screen.getByRole("button", { name: "Re-sync selected" })).toBeDisabled();
    const table = await screen.findByRole("table", { name: "Orders" });
    const [box] = within(table).getAllByRole("checkbox", { name: /^Select order / });
    if (box === undefined) throw new Error("no orders");
    await user.click(box);
    await user.click(screen.getByRole("button", { name: "Re-sync selected" }));

    expect(
      await screen.findByText("Your role may see these orders but not re-sync them."),
    ).toBeInTheDocument();
  });
});
