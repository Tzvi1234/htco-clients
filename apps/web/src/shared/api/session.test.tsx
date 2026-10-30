import { QueryClient, focusManager } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApiError, PUBLIC_AUTH, forgetSession, sessionEnded } from "./api.tsx";
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

  it("a mutation still in flight when the session ends runs no callback and writes nothing", async () => {
    // Local Codex review of #62 (P1): clearing the cache does not stop a pending mutation; its
    // onSuccess could write the last user's answer into the next session's cache.
    const client = new QueryClient();
    let answer: ((value: { invite_link: string }) => void) | undefined;
    const callbacks: string[] = [];
    const invite = client.getMutationCache().build(client, {
      mutationFn: () =>
        new Promise<{ invite_link: string }>((resolve) => {
          answer = resolve;
        }),
      onSuccess: (data) => {
        callbacks.push("success");
        client.setQueryData(["organizations", ORG, "invitations"], [data]);
      },
      onSettled: () => {
        callbacks.push("settled");
      },
    });
    const pending = invite.execute(undefined);
    await vi.waitFor(() => {
      expect(answer).toBeDefined();
    });

    forgetSession(client);
    answer?.({ invite_link: "https://office.example.test/invite#late-t0ken" });
    await pending.catch(() => undefined);

    expect(callbacks).toEqual([]);
    expect(client.getQueryCache().getAll()).toEqual([]);
    expect(client.getMutationCache().getAll()).toEqual([]);
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
  }, 20_000); // a sign-in, a 401 and two screens: more than the default 5 s on a busy runner

  // Codex post-merge review, finding 1: an authenticated mutation's 401 ends the session too,
  // not only a query's; before, the page showed a generic error and kept every cached answer.
  it("forgets the session and goes to sign-in when an authenticated mutation answers 401", async () => {
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
    const user = userEvent.setup();

    // The session ends elsewhere; the next thing the user does is a write, an invitation.
    backend.state.signedIn = false;
    await user.type(await screen.findByLabelText("Email"), "dana@example.test");
    await user.click(screen.getByRole("button", { name: "Invite" }));
    expect(
      await screen.findByRole("heading", { level: 1, name: /sign in/i }, { timeout: 8000 }),
    ).toBeVisible();
    expect(backend.state.invited).toEqual([]);

    // Nothing of the last session is cached: the next user's slow members read shows no one.
    backend.state.signedIn = true;
    backend.state.membersHang = true;
    act(() => {
      history.push("/settings/team");
    });
    expect(
      await screen.findByRole("heading", { level: 1, name: "Members & access" }, { timeout: 8000 }),
    ).toBeVisible();
    expect(screen.queryByText("Tzvi Weiss")).toBeNull();
  }, 20_000);
});

describe("which 401 ends the session", () => {
  it("is a 401 of an authenticated call", () => {
    expect(sessionEnded(new ApiError(401, "session-ended"))).toBe(true);
    expect(sessionEnded(new ApiError(401, undefined))).toBe(true);
  });

  it("is not a refused credential, a public auth form, nor another failure", () => {
    // A wrong step-up code, an Etsy callback Etsy refused: answers about what was just given.
    expect(sessionEnded(new ApiError(401, "mfa-code-refused"))).toBe(false);
    expect(sessionEnded(new ApiError(401, "etsy-authorization-refused"))).toBe(false);
    // Sign-in, an invitation, a reset: there is no session to end.
    expect(sessionEnded(new ApiError(401, "session-ended"), PUBLIC_AUTH)).toBe(false);
    expect(sessionEnded(new ApiError(403, "forbidden"))).toBe(false);
    expect(sessionEnded(new Error("offline"))).toBe(false);
  });
});
