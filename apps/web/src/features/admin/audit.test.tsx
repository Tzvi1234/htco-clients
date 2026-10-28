import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { forgetSession } from "../../shared/api/api.tsx";
import { auditKeys } from "../../shared/api/audit.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeAuditEntries } from "../../test/fakeAudit.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";

// Admin › Audit log (AC-3.9.1 and AC-3.9.3, platform PR #222): the organization's audit records
// newest first, for the Owner and Admins, filtered by shop, actor, action family and time, with
// cursor pages; read-only, redacted by the server (invented data).

const ORG = "a0000000-0000-7000-8000-000000000000";
const OTHER = "c0000000-0000-7000-8000-000000000009";
const WILLOW = "d0000000-0000-7000-8000-000000000001";
const PAPER = "d0000000-0000-7000-8000-000000000002";
const shops = [
  { id: WILLOW, name: "Willow & Wick", status: "active" },
  { id: PAPER, name: "Paper Fox Prints", status: "active" },
];
const base: Partial<FakeState> = {
  signedIn: true,
  enrolled: true,
  assurance: "aal2",
  shops,
  integrations: [fakeIntegration(WILLOW, "ok"), fakeIntegration(PAPER, "ok")],
  audit: fakeAuditEntries(ORG, shops),
};

vi.setConfig({ testTimeout: 20_000 });

async function open(state: Partial<FakeState> = {}, locale: "en" | "he" = "en") {
  const backend = fakeBackend({ ...base, ...state });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: ["/admin/audit"] })}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 });
  return { user: userEvent.setup(), backend };
}

const records = async () => {
  const table = await screen.findByRole("table", { name: "Audit records" }, { timeout: 8000 });
  return within(table).getAllByRole("row").slice(1);
};

const lastQuery = (backend: { state: FakeState }) =>
  new URLSearchParams(backend.state.auditQueries.at(-1) ?? "");

async function choose(user: ReturnType<typeof userEvent.setup>, select: string, option: string) {
  const filters = screen.getByRole("region", { name: "Audit filters" });
  await user.click(within(filters).getByRole("button", { name: new RegExp(select) }));
  await user.click(await screen.findByRole("option", { name: option }));
}

describe("Admin › Audit log (AC-3.9.3)", () => {
  it("is in the Admin navigation and lists the records newest first", async () => {
    await open();

    expect(screen.getByRole("heading", { level: 1, name: "Audit log" })).toBeInTheDocument();
    const rows = await records();
    expect(rows).toHaveLength(9);
    expect(rows[0]).toHaveTextContent("shop.capabilities_checked");
    expect(rows[0]).toHaveTextContent("Person");
    expect(rows[0]).toHaveTextContent("Willow & Wick");
    expect(rows.at(-1)).toHaveTextContent("organization.created");
    expect(screen.queryByText("Demo — coming soon")).not.toBeInTheDocument();
  });

  it("opens a record with its before and after, as the server redacted them", async () => {
    const { user } = await open();
    const [, second, third] = await records();
    if (second === undefined || third === undefined) throw new Error("no rows");

    await user.click(second);
    const record = await screen.findByRole("region", { name: "Audit record" });
    expect(within(record).getByText(/"role": "support"/)).toBeInTheDocument();
    expect(within(record).getByText(/"role": "admin"/)).toBeInTheDocument();
    expect(within(record).getByText("req-19c0")).toBeInTheDocument();

    await user.click(third);
    expect(
      await within(screen.getByRole("region", { name: "Audit record" })).findByText(/<redacted>/),
    ).toBeInTheDocument();
  });

  it("filters by shop, actor, action family and time, each sent to the API", async () => {
    const { user, backend } = await open();
    await records();

    await choose(user, "Shop", "Willow & Wick");
    await vi.waitFor(() => {
      expect(lastQuery(backend).get("shop_id")).toBe(WILLOW);
    });
    expect(await records()).toHaveLength(3);

    await choose(user, "Actor", "System");
    await vi.waitFor(() => {
      expect(lastQuery(backend).get("actor_kind")).toBe("system");
    });
    expect(await screen.findByText("No record matches these filters.")).toBeInTheDocument();

    await choose(user, "Actor", "Anyone");
    await choose(user, "Shop", "Every shop");
    await choose(user, "Action", "Members and roles");
    await vi.waitFor(() => {
      expect(lastQuery(backend).get("action")).toBe("membership.*");
    });
    expect(await records()).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Last 24 hours" }));
    await vi.waitFor(() => {
      expect(lastQuery(backend).get("since")).not.toBeNull();
    });
    await vi.waitFor(async () => {
      expect(await records()).toHaveLength(1);
    });
    for (const query of backend.state.auditQueries)
      expect(new URLSearchParams(query).get("organization_id")).toBe(ORG);
  });

  it("shows one actor's records from a record, and every actor again", async () => {
    const { user, backend } = await open();
    const [first] = await records();
    if (first === undefined) throw new Error("no rows");
    await user.click(first);
    await user.click(await screen.findByRole("button", { name: "Show only this actor's records" }));

    await vi.waitFor(() => {
      expect(lastQuery(backend).get("actor_id")).toBe("a1b2c3d4-0000-7000-8000-000000000001");
    });
    await user.click(screen.getByRole("button", { name: "Show every actor" }));
    await vi.waitFor(() => {
      expect(lastQuery(backend).get("actor_id")).toBeNull();
    });
  });

  it("loads the next page with the cursor the API gave", async () => {
    const { user, backend } = await open({ audit: fakeAuditEntries(ORG, shops, Date.now(), 70) });
    expect(await records()).toHaveLength(50);

    await user.click(screen.getByRole("button", { name: "Load more" }));

    await vi.waitFor(async () => {
      expect(await records()).toHaveLength(70);
    });
    expect(lastQuery(backend).get("cursor")).toBe("50");
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });

  it("says when nothing has been recorded yet", async () => {
    await open({ audit: [] });
    expect(await screen.findByText("Nothing has been recorded yet.")).toBeInTheDocument();
  });

  it("shows a loading state while the records are on their way", async () => {
    await open({ auditTrouble: "hang" });
    expect(await screen.findByText("Loading the audit log")).toBeInTheDocument();
  });

  it("says so and offers to try again when the audit log cannot be read", async () => {
    const { user, backend } = await open({ auditTrouble: "fail" });
    expect(
      await screen.findByText("The audit log is not available on this server yet.", undefined, {
        timeout: 8000,
      }),
    ).toBeInTheDocument();
    backend.state.auditTrouble = undefined;
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await records()).toHaveLength(9);
  });

  it.each(["support", "viewer", "developer"] as const)(
    "only the Owner and Admins see it: a %s is told so (403)",
    async (role) => {
      await open({ role });
      expect(
        await screen.findByText("Only the workspace Owner and Admins see the audit log."),
      ).toBeInTheDocument();
      expect(screen.queryByRole("table")).toBeNull();
      expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    },
  );

  it("an Admin sees it", async () => {
    await open({ role: "admin" });
    expect(await records()).toHaveLength(9);
  });

  it("goes back to sign-in when the session ended (401)", async () => {
    const { user, backend } = await open();
    await records();
    backend.state.signedIn = false;

    await user.click(screen.getByRole("button", { name: "Last 7 days" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: /sign in/i }, { timeout: 8000 }),
    ).toBeVisible();
  });

  it("a member of several workspaces picks one first", async () => {
    const { user, backend } = await open({ otherOrgs: [OTHER] });

    expect(screen.getByText(/Choose the workspace whose audit log/)).toBeInTheDocument();
    expect(backend.state.auditQueries).toHaveLength(0);
    await user.click(screen.getByRole("radio", { name: /c0000000/ }));
    expect(await screen.findByText("Nothing has been recorded yet.")).toBeInTheDocument();
    expect(lastQuery(backend).get("organization_id")).toBe(OTHER);
  });

  it("keeps nothing in storage or the address, and its cache leaves with the session", async () => {
    const storage = memoryStorage();
    const backend = fakeBackend(base);
    const history = createMemoryHistory({ initialEntries: ["/admin/audit"] });
    render(
      <App locale="en" theme="system" storage={storage} history={history} api={backend.client} />,
    );
    await records();
    expect(history.location.href).toBe("/admin/audit");
    expect(JSON.stringify(storage)).not.toContain("membership");

    const client = new QueryClient();
    client.setQueryData(auditKeys.list(ORG, {}), { pages: [], pageParams: [] });
    forgetSession(client);
    expect(client.getQueryData(auditKeys.list(ORG, {}))).toBeUndefined();
  });

  it("he: Hebrew around actions and IDs kept left-to-right", async () => {
    await open({}, "he");
    const action = await screen.findByText("membership.role_changed", undefined, { timeout: 8000 });
    expect(action.closest(".ltr")).not.toBeNull();
    expect(document.documentElement.dir).toBe("rtl");
  });
});
