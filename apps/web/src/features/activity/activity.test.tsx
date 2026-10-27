import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { PHONE_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { DEMO_TASK, demoActivity, fakeActivity } from "../../test/fakeActivity.ts";
import { fakeBackend, type FakeState } from "../../test/fakeApi.ts";

// Work › Activity (platform slice 7.8): what the office did, from recorded activity only, with
// saved views, an actor filter, the source and freshness of every answer, and a task's trail.

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;

async function open(path: string, state: Partial<FakeState> = {}, locale: "en" | "he" = "en") {
  const backend = fakeBackend({ ...owner, activity: demoActivity(undefined), ...state });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: [path] })}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 });
  return { user: userEvent.setup(), backend };
}

async function settled() {
  await vi.waitFor(
    () => {
      expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    },
    { timeout: 8000 },
  );
}

const lastQuery = (backend: { state: FakeState }) =>
  new URLSearchParams(backend.state.activityQueries.at(-1) ?? "");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Work › Activity", () => {
  it("is a built tab: the real screen, no DEMO label", async () => {
    await open("/work/activity");
    expect(screen.getByRole("heading", { level: 1, name: "Activity" })).toBeInTheDocument();
    await settled();
    expect(screen.queryByText("DEMO")).toBeNull();
  });

  it("AC-7.8.1 opens on today in the user's time zone and lists what was recorded", async () => {
    const { backend } = await open("/work/activity");
    await settled();
    const query = lastQuery(backend);
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(query.get("timezone")).toBe(zone);
    expect(query.get("day")).toBe(
      new Intl.DateTimeFormat("en-CA", { timeZone: zone }).format(new Date()),
    );
    const table = await screen.findByRole("table", { name: "Activity records" });
    expect(within(table).getByText("Order sync stopped: Etsy did not answer.")).toBeVisible();
  });

  it("AC-7.8.1 narrows to one actor from a record of it, and clears it", async () => {
    const { user, backend } = await open("/work/activity");
    await settled();
    const table = await screen.findByRole("table", { name: "Activity records" });
    await user.click(within(table).getByText("Tracking recorded for order 4000000001."));
    await user.click(await screen.findByRole("button", { name: "Only this actor" }));
    await settled();
    expect(lastQuery(backend).get("actor")).toBe("automation:tracking-sync");
    const only = screen.getByRole("button", { name: /show every actor/ });
    await user.click(only);
    await settled();
    expect(lastQuery(backend).get("actor")).toBeNull();
  });

  it("AC-7.8.2 the saved view of failed automations this week asks for exactly that", async () => {
    const { user, backend } = await open("/work/activity");
    await settled();
    await user.click(screen.getByRole("button", { name: "Failed automations, 7 days" }));
    await settled();
    const query = lastQuery(backend);
    expect(query.get("actor_kind")).toBe("automation");
    expect(query.get("outcome")).toBe("failed");
    expect(query.get("day")).toBeNull();
    const since = Date.parse(query.get("since") ?? "");
    expect(Date.now() - since).toBeGreaterThan(6.9 * 86_400_000);
    const table = await screen.findByRole("table", { name: "Activity records" });
    expect(within(table).getAllByRole("row")).toHaveLength(2); // the head and the one failure
  });

  it("AC-7.8.3 a record of a task opens the task's trail across actors, oldest first", async () => {
    const { user } = await open("/work/activity");
    await settled();
    const table = await screen.findByRole("table", { name: "Activity records" });
    await user.click(within(table).getByText("Task completed: reply to order question."));
    await user.click(await screen.findByRole("button", { name: "Show the task's trail" }));
    const trail = await screen.findByRole("list", { name: "Task trail" });
    const steps = within(trail).getAllByRole("listitem");
    expect(steps.map((s) => s.textContent)).toEqual([
      expect.stringContaining("Approval granted for the reply."),
      expect.stringContaining("Task completed: reply to order question."),
    ]);
  });

  it("opens a task's trail from its address", async () => {
    await open(`/work/activity?task=${DEMO_TASK}`);
    expect(await screen.findByRole("list", { name: "Task trail" })).toBeInTheDocument();
  });

  it("AC-7.8.4 says where the answer comes from and when it was read", async () => {
    await open("/work/activity");
    await settled();
    expect(screen.getByText(/From recorded activity, read at/)).toBeInTheDocument();
  });

  it("AC-7.8.4 an empty answer says no recorded activity, never zero work done", async () => {
    await open("/work/activity", { activity: [] });
    await settled();
    expect(screen.getByRole("heading", { name: "No recorded activity" })).toBeInTheDocument();
    expect(screen.getByText(/From recorded activity, read at/)).toBeInTheDocument();
  });

  it("shows older records through the server's cursor", async () => {
    const many = Array.from({ length: 60 }, (_, i) => fakeActivity(100 + i, i));
    const { user, backend } = await open("/work/activity", { activity: many });
    await settled();
    await user.click(screen.getByRole("button", { name: "Show older" }));
    await settled();
    expect(lastQuery(backend).get("cursor")).toBe("50");
    const table = screen.getByRole("table", { name: "Activity records" });
    expect(within(table).getAllByRole("row")).toHaveLength(11); // the head and the last ten
    await user.click(screen.getByRole("button", { name: "Back to the newest" }));
    await settled();
    expect(lastQuery(backend).get("cursor")).toBeNull();
  });

  it("a role without activity is told whom to ask", async () => {
    await open("/work/activity", { role: "viewer" });
    expect(
      await screen.findByText("Your role does not include activity. Ask an Owner or Admin."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("a server that does not answer offers to try again", async () => {
    await open("/work/activity", { activityTrouble: "fail" });
    // The query retries once before it gives up.
    expect(
      await screen.findByRole("button", { name: "Try again" }, { timeout: 6000 }),
    ).toBeInTheDocument();
  });

  it("reads in Hebrew, right to left", async () => {
    await open("/work/activity", {}, "he");
    expect(screen.getByRole("heading", { level: 1, name: "פעילות" })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });

  it("fits a phone: the record's summary stays, its columns fold into it", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === PHONE_QUERY,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    await open("/work/activity");
    await settled();
    const table = await screen.findByRole("table", { name: "Activity records" });
    expect(within(table).getByText("Order sync stopped: Etsy did not answer.")).toBeVisible();
  });
});
