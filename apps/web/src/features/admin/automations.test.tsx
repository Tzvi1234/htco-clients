import { focusManager } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { PHONE_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";
import { DEAD_EXECUTION, fakeOperations } from "../../test/fakeOperations.ts";

// Admin › Automations (platform slices 5.1, 5.9 and 5.11): every automation of the registry
// with its readiness and trigger kinds, the last seven days' runs, success, retries and dead
// letters from the health read, and the chosen one's latest runs, each opening its execution
// sheet (invented data).

const WILLOW = "d0000000-0000-7000-8000-000000000001";
const OTHER = "c0000000-0000-7000-8000-000000000009";
const base: Partial<FakeState> = {
  signedIn: true,
  enrolled: true,
  assurance: "aal2",
  shops: [{ id: WILLOW, name: "Willow & Wick", status: "active" }],
  integrations: [fakeIntegration(WILLOW, "ok")],
};

async function open(state: Partial<FakeState> = {}, locale: "en" | "he" = "en") {
  const backend = fakeBackend({ ...base, ...state });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: ["/admin/automations"] })}
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

const calls = (backend: { requests: Request[] }, pattern: RegExp) =>
  backend.requests.filter((r) => pattern.test(new URL(r.url).pathname));

/** A row of the full list: the All sub-tab (the page opens on what needs him). */
const row = async (name: RegExp) => {
  const all = screen.queryByRole("tab", { name: /^All/ });
  if (all !== null && all.getAttribute("aria-selected") !== "true")
    await userEvent.setup().click(all);
  const table = await screen.findByRole("table", { name: "Automations" });
  const cell = await within(table).findByText(name);
  const tr = cell.closest("tr");
  if (tr === null) throw new Error("No row");
  return tr;
};

describe("Admin › Automations", () => {
  it("is a real screen, not the demo, and its tab has no Soon tag", async () => {
    await open();

    expect(screen.getByRole("heading", { level: 1, name: "Automations" })).toBeInTheDocument();
    expect(screen.queryByText("Demo — coming soon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("demo-content")).toBeNull();
    const link = screen.getAllByRole("link", { name: /Automations/ })[0];
    expect(link?.textContent).not.toMatch(/Soon/);
  });

  it("lists every automation with its readiness and trigger kinds in words", async () => {
    await open();

    const intake = await row(/Etsy Order Intake/);
    expect(within(intake).getByText("Live")).toBeInTheDocument();
    expect(within(intake).getByText(/Event/)).toBeInTheDocument();
    const tracking = await row(/Tracking Sync/);
    expect(within(tracking).getByText(/Phase 6/)).toBeInTheDocument();
    expect(within(tracking).queryByText("Live")).toBeNull();
    // The raw registry words never show.
    expect(screen.queryByText("ready")).toBeNull();
    expect(screen.queryByText("agent_tool")).toBeNull();
  });

  it("joins the health read's runs, success, retries and dead letters to each automation", async () => {
    await open();

    const intake = await row(/Etsy Order Intake/);
    expect(within(intake).getByText("212")).toBeInTheDocument();
    expect(within(intake).getByText("99.5%")).toBeInTheDocument();
    expect(within(intake).getByText("7")).toBeInTheDocument();
    // A draft that never ran shows a dash, not zeros.
    const tracking = await row(/Tracking Sync/);
    expect(within(tracking).getAllByText("—").length).toBeGreaterThan(0);
  });

  it("leads with the automation whose run was dead-lettered", async () => {
    const { user } = await open();

    expect(
      await screen.findByText(/One automation has a dead-lettered run: Etsy Order Intake/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open the dead-lettered run" }));

    const sheet = await screen.findByRole("dialog", { name: "Execution" });
    expect(await within(sheet).findByRole("button", { name: "Retry the execution" })).toBeVisible();
  });

  it("a retry from the sheet refreshes the automation's latest runs (Codex on #72)", async () => {
    const { user, backend } = await open();
    const details = await screen.findByRole("region", { name: "Etsy Order Intake" });
    const runs = await within(details).findByRole("list", { name: "Latest runs" });
    expect(within(runs).getByText("Dead-lettered")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open the dead-lettered run" }));
    const sheet = await screen.findByRole("dialog", { name: "Execution" });
    await user.click(await within(sheet).findByRole("button", { name: "Retry the execution" }));
    await within(sheet).findByText("The execution goes back to its retry.");
    expect(backend.state.operations.retriedExecutions).toEqual([DEAD_EXECUTION]);

    await vi.waitFor(() => {
      expect(within(runs).queryByText("Dead-lettered")).toBeNull();
    });
    expect(within(runs).getByText("Retry scheduled")).toBeInTheDocument();
  });

  it("hides the metrics once a refetch answers 403, after a downgrade (Codex local on #72)", async () => {
    const { backend } = await open();
    expect((await row(/Etsy Order Intake/)).textContent).toContain("99.5%");

    backend.state.role = "viewer"; // the Owner made this member a viewer meanwhile
    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });
    expect(
      await screen.findByText(/Only the workspace Owner and Admins see the success rate/),
    ).toBeInTheDocument();
    expect(screen.queryByText("99.5%")).toBeNull();
    expect(screen.queryByText("Dead letters")).toBeNull();
    focusManager.setFocused(undefined);
  });

  it("the overall success counts finished runs only, like each automation's (Codex local on #72)", async () => {
    await open();
    // 209 + 198 succeeded of 210 + 198 finished (2 of the 212 intake runs are still on their way).
    const numbers = screen.getByRole("list", { name: "Automation numbers" });
    expect(within(numbers).getByText("99.8%")).toBeInTheDocument();
  });

  it("the calm scene has no dead-lettered run anywhere (Codex local on #72)", async () => {
    await open({ operations: fakeOperations("calm") });
    const details = await screen.findByRole("region", { name: "Etsy Order Intake" });
    const runs = await within(details).findByRole("list", { name: "Latest runs" });
    expect(within(runs).queryByText("Dead-lettered")).toBeNull();
  });

  it("the chosen automation's latest runs open its execution sheet", async () => {
    const { user, backend } = await open();

    await user.click(await row(/Etsy Order Intake/));
    const details = await screen.findByRole("region", { name: "Etsy Order Intake" });
    const runs = await within(details).findByRole("list", { name: "Latest runs" });
    expect(within(runs).getByText("Dead-lettered")).toBeInTheDocument();
    const dead = within(runs).getByText("Dead-lettered").closest("button");
    if (dead === null) throw new Error("No dead-lettered run button");
    await user.click(dead);

    expect(await screen.findByRole("dialog", { name: "Execution" })).toBeInTheDocument();
    expect(calls(backend, new RegExp(`/v1/executions/${DEAD_EXECUTION}$`))).toHaveLength(1);
  });

  it("re-uses the health read: one health call and one registry call, each naming its workspace", async () => {
    const { user, backend } = await open();
    await user.click(await row(/Product Sales Counters/));
    await screen.findByRole("region", { name: "Product Sales Counters" });

    const health = calls(backend, /\/v1\/operations\/health$/);
    const registry = calls(backend, /\/v1\/automations$/);
    expect(health).toHaveLength(1);
    expect(registry).toHaveLength(1);
    const runs = calls(backend, /\/v1\/automations\/product-sales-counters\/executions$/);
    expect(runs).toHaveLength(1);
    for (const request of [...health, ...registry, ...runs])
      expect(new URL(request.url).searchParams.get("organization_id")).not.toBeNull();
    expect(new URL(runs[0]?.url ?? "").searchParams.get("limit")).toBe("10");
  });

  it("a member who is not an Owner or Admin sees the registry and runs, not the metrics", async () => {
    await open({ role: "viewer" });

    expect(await row(/Etsy Order Intake/)).toBeInTheDocument();
    expect(
      screen.getByText(/Only the workspace Owner and Admins see the success rate/),
    ).toBeInTheDocument();
    expect(screen.queryByText("99.5%")).toBeNull();
  });

  it("puts the list behind sub-tabs: what needs him first, then every automation (Pixel on #72)", async () => {
    const { user } = await open();

    const tabs = screen.getByRole("tablist", { name: "Automation views" });
    const needs = within(tabs).getByRole("tab", { name: /Needs you/ });
    const all = within(tabs).getByRole("tab", { name: /^All/ });
    expect(needs).toHaveAttribute("aria-selected", "true");
    expect(needs).toHaveTextContent("1");
    expect(all).toHaveTextContent("5");
    const needing = screen.getByRole("table", { name: "Automations" });
    expect(within(needing).getAllByRole("row")).toHaveLength(2); // the head and Etsy Order Intake
    expect(within(needing).getByText("Etsy Order Intake")).toBeInTheDocument();

    await user.click(all);
    const every = screen.getByRole("table", { name: "Automations" });
    expect(within(every).getAllByRole("row")).toHaveLength(6);
  });

  it("opens on every automation when nothing needs him", async () => {
    await open({ operations: fakeOperations("calm") });

    const tabs = screen.getByRole("tablist", { name: "Automation views" });
    expect(within(tabs).getByRole("tab", { name: /^All/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await screen.findByRole("table", { name: "Automations" });
  });

  it("shows the chosen automation beside the list, in the side column, with no width cap", async () => {
    await open();

    const details = await screen.findByRole("region", { name: "Etsy Order Intake" });
    expect(details.closest(".k-aside")).not.toBeNull();
    expect(details.querySelector('[class*="max-w-[720px]"]')).toBeNull();
  });

  it("on a phone the detail offers Back to list, which returns to the list", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === PHONE_QUERY,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    try {
      const { user } = await open();
      const details = await screen.findByRole("region", { name: "Etsy Order Intake" });
      await user.click(within(details).getByRole("button", { name: "Back to list" }));
      expect(document.activeElement).toHaveAccessibleName("Automations that need you");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("the focus's call to action carries the forward chevron, like the other focus panels", async () => {
    await open();

    const cta = screen.getByRole("button", { name: "Open the dead-lettered run" });
    expect(cta.querySelector("svg")).not.toBeNull();
  });

  it("the execution sheet names its chain in words, never the machine's (Pixel on #72)", async () => {
    const { user } = await open();
    await user.click(screen.getByRole("button", { name: "Open the dead-lettered run" }));
    const sheet = await screen.findByRole("dialog", { name: "Execution" });
    const chain = await within(sheet).findByRole("list", { name: "Chain" });

    expect(within(chain).getAllByText("Trigger").length).toBeGreaterThan(0);
    expect(within(chain).getAllByText("Execution").length).toBeGreaterThan(0);
    expect(within(chain).getAllByText("Pending → Running").length).toBeGreaterThan(0);
    for (const raw of ["trigger", "execution", "action", "pending → running"])
      expect(within(chain).queryByText(raw)).toBeNull();
  });

  it("the execution sheet speaks Hebrew too", async () => {
    const { user } = await open({}, "he");
    await user.click(await screen.findByRole("button", { name: "פתחו את ההרצה שנכשלה סופית" }));
    const sheet = await screen.findByRole("dialog");
    for (const raw of [/^trigger$/, /^execution$/, /^action$/, /pending → running/])
      expect(within(sheet).queryByText(raw)).toBeNull();
  });

  it("says so when automations are not set up on this server", async () => {
    await open({ automationsOff: true });

    expect(
      await screen.findByText("Automations are not set up on this server yet."),
    ).toBeInTheDocument();
  });

  it("a member of several workspaces chooses one first", async () => {
    const { backend } = await open({ otherOrgs: [OTHER] });

    expect(
      screen.getByText("Choose the workspace whose automations you want to see."),
    ).toBeInTheDocument();
    expect(calls(backend, /\/v1\/automations$/)).toHaveLength(0);
  });

  it("speaks Hebrew", async () => {
    await open({}, "he");

    expect(screen.getByRole("heading", { level: 1, name: "אוטומציות" })).toBeInTheDocument();
    expect(await screen.findByRole("table", { name: "אוטומציות" })).toBeInTheDocument();
  });
});
