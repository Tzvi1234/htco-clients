import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { INCIDENT_STATES, IncidentState } from "./IncidentState.tsx";
import { App } from "../../app/App.tsx";
import { LocaleProvider } from "../../shared/i18n/LocaleProvider.tsx";
import { PHONE_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";
import { demoIncidents } from "../../test/fakeIncidents.ts";

// The incident center (platform slice 6.5): the organization's incidents, each with its
// evidence, timeline and related order, and the next steps a person may take. Nobody resolves an
// incident by hand: it resolves on evidence only.

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;
const WILLOW = "d0000000-0000-7000-8000-000000000001";
const LINEN = "d0000000-0000-7000-8000-000000000002";
const shops: Partial<FakeState> = {
  shops: [
    { id: WILLOW, name: "Willow & Wick", status: "active" },
    { id: LINEN, name: "Linen Lane Studio", status: "active" },
  ],
  integrations: [fakeIntegration(WILLOW, "ok"), fakeIntegration(LINEN, "ok")],
};
const MISSING = "e0000000-0000-7000-8000-000000000002";
const DEAD = "e0000000-0000-7000-8000-000000000003";
const RESOLVED = "e0000000-0000-7000-8000-000000000004";

async function open(path: string, state: Partial<FakeState> = {}, locale: "en" | "he" = "en") {
  const backend = fakeBackend({
    ...owner,
    ...shops,
    incidents: demoIncidents([WILLOW, LINEN]),
    ...state,
  });
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

async function table() {
  await settled();
  return screen.findByRole("table", { name: "Incidents" });
}

/** The detail panel, named by the incident's cause. */
async function detail(name: string) {
  await settled();
  const region = await screen.findByRole("region", { name });
  return region;
}

describe("AC-6.5.1: incident states", () => {
  it("AC-6.5.1 shows every incident state as a status glyph plus a word, never colour alone", () => {
    render(
      <LocaleProvider initialLocale="en" storage={undefined}>
        <ul>
          {INCIDENT_STATES.map((state) => (
            <li key={state} data-testid={state}>
              <IncidentState state={state} />
            </li>
          ))}
        </ul>
      </LocaleProvider>,
    );
    const words = new Set<string>();
    for (const state of INCIDENT_STATES) {
      const item = screen.getByTestId(state);
      // The glyph: a shape that differs by state, hidden from screen readers.
      const glyph = item.querySelector("svg[data-status]");
      expect(glyph).not.toBeNull();
      expect(glyph).toHaveAttribute("aria-hidden", "true");
      // The word: always there, and its own for each state.
      const word = item.textContent.trim();
      expect(word.length).toBeGreaterThan(2);
      words.add(word);
    }
    expect(words.size).toBe(INCIDENT_STATES.length);
    expect(INCIDENT_STATES).toEqual([
      "detected",
      "triaged",
      "investigating",
      "remediation_proposed",
      "auto_remediating",
      "approval_required",
      "developer_required",
      "verifying",
      "resolved",
      "escalated",
    ]);
  });

  it("AC-6.5.1 the list and the detail show the state with its glyph and word", async () => {
    const { user } = await open("/incidents");
    const list = await table();
    const row = within(list).getByRole("row", { name: /Tracking mismatch/ });
    const state = within(row).getByText("Investigating");
    expect(state.closest("span")?.querySelector("svg[data-status]")).not.toBeNull();

    await user.click(row);
    const panel = await detail("Tracking mismatch");
    const shown = within(panel).getAllByText("Investigating")[0];
    expect(shown?.closest("span")?.querySelector("svg[data-status]")).not.toBeNull();
  });
});

describe("the incident center", () => {
  it("is a real screen in Commerce, at /incidents", async () => {
    await open("/incidents");
    expect(screen.getByRole("heading", { level: 1, name: "Incidents" })).toBeInTheDocument();
    expect(screen.queryByText("DEMO")).not.toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Incidents" })).toHaveAttribute(
      "href",
      "/incidents",
    );
  });

  it("lists the open incidents with severity, shop, age and state", async () => {
    await open("/incidents");
    const list = await table();
    const head = within(list)
      .getAllByRole("columnheader")
      .map((cell) => cell.textContent);
    expect(head).toEqual(["Incident", "Severity", "Shop", "Age", "State"]);
    const rows = within(list).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(3);
    const mismatch = within(list).getByRole("row", { name: /Tracking mismatch/ });
    expect(within(mismatch).getByText("High")).toBeInTheDocument();
    expect(within(mismatch).getByText("Willow & Wick")).toBeInTheDocument();
    expect(within(mismatch).getByText("1 d")).toBeInTheDocument();
    const dead = within(list).getByRole("row", { name: /Automation gave up/ });
    expect(within(dead).getByText("Critical")).toBeInTheDocument();
    expect(within(dead).getByText("Linen Lane Studio")).toBeInTheDocument();
    expect(within(dead).getByText("Escalated")).toBeInTheDocument();
    // The resolved one is not among the open ones.
    expect(within(list).queryByText("Resolved")).not.toBeInTheDocument();
  });

  it("puts what matters in the focus: open, the oldest age and high or critical", async () => {
    await open("/incidents");
    await settled();
    const focus = screen.getByRole("heading", { level: 2, name: "3 open incidents" });
    const panel = focus.closest("section");
    if (panel === null) throw new Error("No focus panel");
    const figures = within(panel).getByRole("list", { name: "Key figures" });
    const items = within(figures).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Open3",
      "Oldest open3 d",
      "High or critical2",
    ]);
    expect(within(panel).getByText(/close themselves once the evidence arrives/)).toBeVisible();
  });

  it("shows where the open incidents stand, by state, at the focus's end", async () => {
    await open("/incidents");
    await settled();
    const byState = screen.getByRole("list", { name: "Open incidents by state" });
    const lines = within(byState).getAllByRole("listitem");
    expect(lines.reduce((sum, line) => sum + Number(/\d+$/.exec(line.textContent)?.[0]), 0)).toBe(
      3,
    );
  });

  it("speaks of the resolved ones on the Resolved tab", async () => {
    const { user } = await open("/incidents");
    await table();
    await user.click(screen.getByRole("tab", { name: "Resolved" }));
    await table();
    expect(await screen.findByText("1 resolved so far")).toBeVisible();
    expect(screen.getByText(/Resolved incidents closed themselves/)).toBeVisible();
  });

  it("takes him back to the list from the detail on a phone", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === PHONE_QUERY,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    try {
      const { user } = await open(`/incidents/${DEAD}`);
      const panel = await detail("Automation gave up");
      await user.click(within(panel).getByRole("button", { name: "Back to list" }));
      expect(document.activeElement).toHaveAccessibleName("Open incidents");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("opens the most urgent incident from the focus", async () => {
    const { user } = await open("/incidents");
    await settled();
    await user.click(screen.getByRole("button", { name: "Open the most urgent" }));
    // Critical before high: the dead-lettered automation.
    const panel = await detail("Automation gave up");
    expect(within(panel).getByText("Critical")).toBeInTheDocument();
  });

  it("shows the resolved incidents and all of them in their sub-tabs", async () => {
    const { user, backend } = await open("/incidents");
    await table();
    const tabs = screen.getByRole("tablist", { name: "Incidents" });
    expect(
      within(tabs)
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(["Open3", "Resolved", "All"]);

    await user.click(within(tabs).getByRole("tab", { name: "Resolved" }));
    let list = await table();
    expect(within(list).getAllByRole("row").slice(1)).toHaveLength(1);
    expect(within(list).getByText("Resolved")).toBeInTheDocument();
    expect(
      backend.requests.some((r) => r.url.includes("/v1/incidents?") && r.url.includes("state=all")),
    ).toBe(true);

    await user.click(within(tabs).getByRole("tab", { name: "All" }));
    list = await table();
    expect(within(list).getAllByRole("row").slice(1)).toHaveLength(4);
  });

  it("names the workspace on every call", async () => {
    const { backend } = await open("/incidents");
    await table();
    const calls = backend.requests.filter((r) => r.url.includes("/v1/incidents"));
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls)
      expect(new URL(call.url).searchParams.get("organization_id")).toBe(
        "a0000000-0000-7000-8000-000000000000",
      );
  });
});

describe("an incident's detail", () => {
  it("shows the related order linked to Orders, the timeline and who moved it", async () => {
    const { user } = await open("/incidents");
    const list = await table();
    await user.click(within(list).getByRole("row", { name: /Tracking mismatch/ }));
    const panel = await detail("Tracking mismatch");

    expect(within(panel).getByRole("link", { name: "#3412880131" })).toHaveAttribute(
      "href",
      "/commerce/orders",
    );
    const timeline = within(panel).getByRole("list", { name: "Timeline" });
    const steps = within(timeline).getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    // Newest first: investigating, triaged with its note, detected by an automation.
    expect(steps[0]).toHaveTextContent("Investigating");
    expect(steps[0]).toHaveTextContent("You");
    expect(steps[1]).toHaveTextContent("carrier_number_differs");
    expect(steps[2]).toHaveTextContent("Detected");
    expect(steps[2]).toHaveTextContent("An automation");
    // No evidence yet: it says how the incident will close.
    expect(within(panel).getByText(/No evidence yet/)).toBeInTheDocument();
  });

  it("shows the evidence an incident resolved on", async () => {
    await open(`/incidents/${RESOLVED}`);
    const panel = await detail("Tracking missing");
    const evidence = within(panel).getByRole("list", { name: "Evidence" });
    expect(evidence).toHaveTextContent("Tracking found in Etsy");
    expect(evidence).toHaveTextContent("TE-88213");
    expect(evidence).toHaveTextContent("Etsy receipt");
    expect(within(panel).queryByRole("group", { name: "Next step" })).not.toBeInTheDocument();
  });

  it("opens from its own address, the way a notification links to it", async () => {
    await open(`/incidents/${DEAD}`);
    const panel = await detail("Automation gave up");
    expect(within(panel).getByText("Linen Lane Studio")).toBeInTheDocument();
    expect(within(panel).queryByRole("link", { name: /^#/ })).not.toBeInTheDocument();
  });

  it("offers the allowed next steps, and never resolving by hand", async () => {
    await open(`/incidents/${MISSING}`);
    const panel = await detail("Tracking missing");
    const steps = within(panel).getByRole("group", { name: "Next step" });
    expect(
      within(steps)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Move to Triaged", "Move to Verifying", "Move to Escalated"]);
    expect(within(panel).queryByRole("button", { name: /Resolved/ })).not.toBeInTheDocument();
    expect(within(panel).getByText(/resolves on its own/)).toBeInTheDocument();
  });

  it("shows no steps to a role that may not move incidents", async () => {
    await open(`/incidents/${MISSING}`, { role: "viewer" });
    const panel = await detail("Tracking missing");
    expect(within(panel).queryByRole("group", { name: "Next step" })).not.toBeInTheDocument();
    expect(
      within(panel).getByText(/Your role can see this incident but not move it/),
    ).toBeVisible();
  });

  it("moves the incident to the chosen step", async () => {
    const { user, backend } = await open(`/incidents/${MISSING}`);
    const panel = await detail("Tracking missing");
    await user.click(within(panel).getByRole("button", { name: "Move to Triaged" }));

    await vi.waitFor(() => {
      expect(backend.state.steps).toEqual([{ id: MISSING, to_state: "triaged", note: undefined }]);
    });
    const timeline = await within(panel).findByRole("list", { name: "Timeline" });
    await vi.waitFor(() => {
      expect(within(timeline).getAllByRole("listitem")[0]).toHaveTextContent("Triaged");
    });
    expect(await within(panel).findByRole("status")).toHaveTextContent("Moved to Triaged");
    // The list follows.
    const row = within(await table()).getByRole("row", { name: /Tracking missing/ });
    await vi.waitFor(() => {
      expect(within(row).getByText("Triaged")).toBeInTheDocument();
    });
  });

  it.each([
    ["illegal-incident-step", /no longer possible from the incident's current state/],
    ["evidence-required", /closes only on evidence/],
    ["incident-moved", /changed while you were looking at it/],
  ] as const)("answers a 409 %s with its own message", async (problem, message) => {
    const { user } = await open(`/incidents/${MISSING}`, { stepProblem: problem });
    const panel = await detail("Tracking missing");
    await user.click(within(panel).getByRole("button", { name: "Move to Triaged" }));
    expect(await within(panel).findByRole("alert")).toHaveTextContent(message);
  });

  it("says so when the role may not move it after all (403)", async () => {
    const { user, backend } = await open(`/incidents/${MISSING}`);
    const panel = await detail("Tracking missing");
    backend.state.role = "viewer";
    await user.click(within(panel).getByRole("button", { name: "Move to Triaged" }));
    expect(await within(panel).findByRole("alert")).toHaveTextContent(
      /Your role can see incidents but not move them/,
    );
  });
});

describe("the incident center's states", () => {
  it("says when nothing is open, and how incidents open and close", async () => {
    await open("/incidents", { incidents: [] });
    await settled();
    expect(screen.getByRole("heading", { level: 2, name: "Nothing is open" })).toBeVisible();
    expect(screen.getByText("No open incidents")).toBeVisible();
    expect(screen.queryByRole("table", { name: "Incidents" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open the most urgent" })).not.toBeInTheDocument();
  });

  it("shows the loading state while the incidents are on their way", async () => {
    await open("/incidents", { incidentsTrouble: "hang" });
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.getByText("Loading incidents…")).toBeInTheDocument();
  });

  it("says when the incidents could not be loaded, and tries again", async () => {
    const { user, backend } = await open("/incidents", { incidentsTrouble: "fail" });
    expect(await screen.findByText("Incidents could not be loaded")).toBeVisible();
    backend.state.incidentsTrouble = undefined;
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await table()).toBeInTheDocument();
  });

  it("is in Hebrew, right to left", async () => {
    await open("/incidents", {}, "he");
    await settled();
    expect(document.documentElement.dir).toBe("rtl");
    expect(screen.getByRole("heading", { level: 1, name: "תקלות" })).toBeInTheDocument();
    const list = await screen.findByRole("table", { name: "תקלות" });
    expect(within(list).getByText("מספר מעקב לא תואם")).toBeInTheDocument();
    expect(within(list).getByText("בבדיקה")).toBeInTheDocument();
  });
});
