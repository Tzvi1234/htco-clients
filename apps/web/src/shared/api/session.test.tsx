import { QueryClient, focusManager } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { forgetSession } from "./api.tsx";
import { App } from "../../app/App.tsx";
import { memoryStorage } from "../lib/storage.ts";
import { fakeBackend } from "../../test/fakeApi.ts";

// Sage's security review of clients#48: when a session ends, nothing the last user saw may be
// shown to the next one on the same tab. Every cached answer belongs to the session that read
// it: shops, members, incidents, notifications, orders.

const ORG = "a0000000-0000-7000-8000-000000000000";

describe("the session's cache", () => {
  it("forgets every cached answer, not only a list of them", () => {
    const client = new QueryClient();
    client.setQueryData(["auth", "me"], { user: "a" });
    client.setQueryData(["live", "shop", "orders", "all"], { items: ["order"] });
    client.setQueryData(["shops", ORG], [{ id: "shop-a" }]);
    client.setQueryData(["organizations", ORG, "members"], [{ display_name: "User A" }]);
    client.setQueryData(["incidents", ORG, "open"], [{ id: "incident-a" }]);
    client.setQueryData(["notifications", ORG], { items: [{ id: "notice-a" }] });

    forgetSession(client);

    expect(client.getQueryCache().getAll()).toEqual([]);
  });

  it("forgets the session's mutations: an invitation's link and an authenticator's enrolment", async () => {
    // Codex review of #62: sign-out used to call clear(); a mutation keeps what was submitted
    // and what came back, and both of these are secrets of the last user.
    const client = new QueryClient();
    const invite = client.getMutationCache().build(client, {
      mutationFn: (values: { email: string; role: string }) =>
        Promise.resolve({ ...values, invite_link: "https://office.example.test/invite#t0ken" }),
    });
    const enrol = client.getMutationCache().build(client, {
      mutationFn: () =>
        Promise.resolve({ factor_id: "f1", totp_uri: "otpauth://totp/HTCO?secret=FAKESECRET" }),
    });
    await invite.execute({ email: "member@example.test", role: "admin" });
    await enrol.execute(undefined);
    expect(client.getMutationCache().getAll()).toHaveLength(2);

    forgetSession(client);

    expect(client.getMutationCache().getAll()).toEqual([]);
    expect(JSON.stringify(client.getMutationCache().getAll())).not.toContain("t0ken");
  });

  it("shows the next user nothing of the last one after the session ended on the server", async () => {
    const backend = fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2" });
    const history = createMemoryHistory({ initialEntries: ["/settings/team"] });
    render(
      <App
        locale="en"
        theme="system"
        storage={memoryStorage()}
        history={history}
        api={backend.client}
      />,
    );
    expect(await screen.findByText("Tzvi Weiss", undefined, { timeout: 8000 })).toBeVisible();
    // A leaves the team page: its answer stays cached, and is not the one that sees the 401.
    act(() => {
      history.push("/");
    });
    expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeVisible();

    // The session ends elsewhere (revoked, expired): the next refetch answers 401.
    backend.state.signedIn = false;
    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });
    expect(
      await screen.findByRole("heading", { level: 1, name: /sign in/i }, { timeout: 8000 }),
    ).toBeVisible();

    // B signs in on the same tab and opens the team; B's members read never answers, so a
    // cached answer of A's would stay on screen.
    backend.state.members = [
      {
        id: "b0000000-0000-7000-8000-000000000009",
        user_id: "a1b2c3d4-0000-7000-8000-000000000009",
        display_name: "Next User",
        role: "owner",
      },
    ];
    backend.state.signedIn = true;
    backend.state.membersHang = true;
    act(() => {
      history.push("/settings/team");
    });
    expect(
      await screen.findByRole("heading", { level: 1, name: "Members & access" }, { timeout: 8000 }),
    ).toBeVisible();
    expect(screen.queryByText("Tzvi Weiss")).toBeNull();
  });
});
