import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeEmailFailures } from "../../test/fakeAudit.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";

// Admin › Health's failed emails (platform PR #222, AC-6.4.3 and AC-6.5.6): refused and skipped
// emails for the Owner and Admins, the recipient masked by the server (invented data).

const WILLOW = "d0000000-0000-7000-8000-000000000001";
const shops = [{ id: WILLOW, name: "Willow & Wick", status: "active" }];
const base: Partial<FakeState> = {
  signedIn: true,
  enrolled: true,
  assurance: "aal2",
  shops,
  integrations: [fakeIntegration(WILLOW, "ok")],
  emailFailures: fakeEmailFailures(shops),
};

vi.setConfig({ testTimeout: 20_000 });

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
  const user = userEvent.setup();
  const activity = await screen.findByRole("tab", {
    name: locale === "he" ? /פעילות/ : /Activity/,
  });
  await user.click(activity);
  return { user, backend };
}

const panel = () => screen.findByRole("region", { name: "Failed emails" }, { timeout: 8000 });

const calls = (backend: { requests: Request[] }) =>
  backend.requests.filter((r) => new URL(r.url).pathname.endsWith("/operations/email-failures"));

describe("failed emails on Admin › Health (AC-6.4.3)", () => {
  it("lists the refused emails with kind, reason, shop, masked recipient and time", async () => {
    const { backend } = await open();

    const table = await within(await panel()).findByRole("table", { name: "Failed emails" });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Incident opened");
    expect(rows[0]).toHaveTextContent("Refused");
    expect(rows[0]).toHaveTextContent("recipient_rejected");
    expect(rows[0]).toHaveTextContent("Willow & Wick");
    expect(rows[0]).toHaveTextContent("o***@e***.test");
    for (const r of calls(backend)) {
      expect(new URL(r.url).searchParams.get("status")).toBe("failed");
      expect(new URL(r.url).searchParams.get("organization_id")).not.toBeNull();
    }
  });

  it("shows the skipped ones on request; one without an address shows the member ID", async () => {
    const { user } = await open();
    const box = await panel();

    await user.click(within(box).getByRole("button", { name: "Skipped" }));

    const table = await within(box).findByRole("table", { name: "Failed emails" });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("no_verified_address");
    expect(rows[0]).toHaveTextContent("a1b2c3d4");
  });

  it("says when no email was refused", async () => {
    await open({ emailFailures: [] });
    expect(await within(await panel()).findByText("No email was refused.")).toBeInTheDocument();
  });

  it("says so and offers to try again when the list cannot be read", async () => {
    const { user, backend } = await open({ emailFailuresTrouble: "fail" });
    const box = await panel();

    expect(
      await within(box).findByText("The failed emails are not available on this server yet."),
    ).toBeInTheDocument();
    backend.state.emailFailuresTrouble = undefined;
    await user.click(within(box).getByRole("button", { name: "Try again" }));
    expect(await within(box).findByRole("table", { name: "Failed emails" })).toBeInTheDocument();
  });

  it("loads more, page after page", async () => {
    const [one] = fakeEmailFailures(shops);
    if (one === undefined) throw new Error("no email");
    const many = Array.from({ length: 30 }, (_, n) => ({
      ...one,
      id: `0a000000-0000-7000-8000-${String(500 + n).padStart(12, "0")}`,
    }));
    const { user } = await open({ emailFailures: many });
    const box = await panel();
    const table = await within(box).findByRole("table", { name: "Failed emails" });
    expect(within(table).getAllByRole("row")).toHaveLength(26);

    await user.click(within(box).getByRole("button", { name: "Load more" }));

    await vi.waitFor(() => {
      expect(within(table).getAllByRole("row")).toHaveLength(31);
    });
    expect(within(box).queryByRole("button", { name: "Load more" })).toBeNull();
  });

  it("goes back to sign-in when the session ended (401)", async () => {
    const { user, backend } = await open();
    await panel();
    backend.state.signedIn = false;

    await user.click(within(await panel()).getByRole("button", { name: "Skipped" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: /sign in/i }, { timeout: 8000 }),
    ).toBeVisible();
  });

  it("is not shown to roles other than the Owner and Admins (403)", async () => {
    const backend = fakeBackend({ ...base, role: "support" });
    render(
      <App
        locale="en"
        theme="system"
        storage={memoryStorage()}
        history={createMemoryHistory({ initialEntries: ["/admin/health"] })}
        api={backend.client}
      />,
    );
    expect(
      await screen.findByText("Only the workspace Owner and Admins see the queue and sync health."),
    ).toBeInTheDocument();
    expect(calls(backend)).toHaveLength(0);
  });

  it("keeps nothing in storage, and the address bar names no email", async () => {
    const { backend } = await open();
    await within(await panel()).findByRole("table", { name: "Failed emails" });
    expect(JSON.stringify({ ...localStorage })).not.toContain("***@");
    expect(window.location.href).not.toContain("@");
    expect(calls(backend).every((r) => !r.url.includes("@"))).toBe(true);
  });

  it("he: Hebrew around codes kept left-to-right", async () => {
    await open({}, "he");
    const code = await screen.findByText("recipient_rejected", undefined, { timeout: 8000 });
    expect(code.closest(".ltr")).not.toBeNull();
    expect(document.documentElement.dir).toBe("rtl");
  });
});
