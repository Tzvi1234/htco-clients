import { createMemoryHistory } from "@tanstack/react-router";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, idempotencyKeys, type FakeState } from "../../test/fakeApi.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** The item at `index`, failing the test when there is none. */
function nth<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) throw new Error(`No item ${String(index)}`);
  return item;
}

async function open(path: string, state: Partial<FakeState> = {}) {
  const backend = fakeBackend(state);
  const history = createMemoryHistory({ initialEntries: [path] });
  render(
    <App
      locale="en"
      theme="system"
      storage={memoryStorage()}
      history={history}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 });
  return { user: userEvent.setup(), backend, history };
}

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;

/** The members table's body rows (the first row is the column heads). */
async function memberRows() {
  const table = await screen.findByRole("table", { name: "Members" });
  return within(table).getAllByRole("row").slice(1);
}

const dana = {
  id: "b0000000-0000-7000-8000-000000000002",
  user_id: "a1b2c3d4-0000-7000-8000-000000000002",
  display_name: "Dana Levi",
  role: "support",
};
const shop = {
  id: "d0000000-0000-7000-8000-000000000001",
  name: "Willow & Wick",
  status: "active",
};

describe("the team (FR-IAM-02)", () => {
  it("lists the organization's members with their roles", async () => {
    await open("/settings/team", owner);

    const rows = await memberRows();
    expect(rows).toHaveLength(1);
    expect(within(nth(rows, 0)).getByText("Owner")).toBeInTheDocument();
    expect(within(nth(rows, 0)).getByText("All shops")).toBeInTheDocument();
  });

  it("invites a user as Admin and hands the owner the link to send", async () => {
    const { user, backend } = await open("/settings/team", owner);

    await user.type(await screen.findByLabelText("Email"), "dana@example.test");
    await user.click(screen.getByRole("button", { name: "Invite" }));

    const link = await screen.findByRole("textbox", { name: "Invitation link" });
    expect(link).toHaveValue(backend.state.inviteLink);
    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();
    expect(backend.state.invited).toEqual([{ email: "dana@example.test", role: "admin" }]);
    expect(await memberRows()).toHaveLength(2);
  });

  it("sends the invitation with an Idempotency-Key, the same one when it is sent again (#223)", async () => {
    const { user, backend } = await open("/settings/team", {
      ...owner,
      failNext: ["/invitations"],
    });

    await user.type(await screen.findByLabelText("Email"), "dana@example.test");
    await user.click(screen.getByRole("button", { name: "Invite" }));
    await screen.findByText("Invitations cannot be sent right now. Try again shortly.");
    await user.click(screen.getByRole("button", { name: "Invite" }));
    await screen.findByRole("textbox", { name: "Invitation link" });

    const keys = idempotencyKeys(backend.requests, "POST", /\/invitations$/);
    expect(keys).toHaveLength(2);
    expect(keys[0]).toMatch(UUID);
    expect(keys[1]).toBe(keys[0]);
  });

  it("a changed address is a new invitation with a new Idempotency-Key (#223)", async () => {
    const { user, backend } = await open("/settings/team", {
      ...owner,
      failNext: ["/invitations"],
    });

    const email = await screen.findByLabelText("Email");
    await user.type(email, "dana@example.test");
    await user.click(screen.getByRole("button", { name: "Invite" }));
    await screen.findByText("Invitations cannot be sent right now. Try again shortly.");
    await user.clear(email);
    await user.type(email, "noam@example.test");
    await user.click(screen.getByRole("button", { name: "Invite" }));
    await screen.findByRole("textbox", { name: "Invitation link" });

    const [first, second] = idempotencyKeys(backend.requests, "POST", /\/invitations$/);
    expect(second).toMatch(UUID);
    expect(second).not.toBe(first);
  });

  it("is offered from Settings to Owners and Admins only", async () => {
    await open("/settings", owner);
    const page = screen.getByRole("main");
    expect(within(page).getByRole("link", { name: /Members & access/ })).toHaveAttribute(
      "href",
      "/settings/team",
    );
  });

  it("is not offered to other roles", async () => {
    await open("/settings", { signedIn: true, role: "support" });
    expect(
      within(screen.getByRole("main")).queryByRole("link", { name: /Members & access/ }),
    ).not.toBeInTheDocument();
  });
});

describe("managing a member (FR-IAM-03, slice 2.6)", () => {
  // A fresh copy per test: the fake backend changes its members in place.
  const withDana = () => ({ ...owner, members: [...fakeBackend().state.members, { ...dana }] });

  async function chooseDana(user: ReturnType<typeof userEvent.setup>) {
    await user.click(within(nth(await memberRows(), 1)).getByText("Dana Levi"));
    return screen.findByRole("region", { name: "Member" });
  }

  it("changes a member's role on the server's answer", async () => {
    const { user, backend } = await open("/settings/team", withDana());

    const member = await chooseDana(user);
    await user.click(within(member).getByRole("radio", { name: "Finance" }));

    await waitFor(async () => {
      expect(within(nth(await memberRows(), 1)).getByText("Finance")).toBeVisible();
    });
    expect(backend.state.members.find((m) => m.id === dana.id)?.role).toBe("finance");
  });

  it("grants and revokes a shop", async () => {
    const { user, backend } = await open("/settings/team", { ...withDana(), shops: [shop] });

    const member = await chooseDana(user);
    const access = await within(member).findByRole("switch", { name: "Access to Willow & Wick" });
    await user.click(access);

    await waitFor(() => {
      expect(backend.state.members.find((m) => m.id === dana.id)?.shop_ids).toEqual([shop.id]);
    });
    expect(await within(member).findByText("1 shop")).toBeInTheDocument();

    await user.click(access);
    await waitFor(() => {
      expect(backend.state.members.find((m) => m.id === dana.id)?.shop_ids).toEqual([]);
    });
  });

  it("removes a member only after confirming", async () => {
    const { user, backend } = await open("/settings/team", withDana());

    const member = await chooseDana(user);
    await user.click(within(member).getByRole("button", { name: "Remove from workspace" }));
    expect(backend.state.members).toHaveLength(2);
    await user.click(within(member).getByRole("button", { name: "Remove" }));

    await waitFor(async () => {
      expect(await memberRows()).toHaveLength(1);
    });
    expect(backend.state.members.some((m) => m.id === dana.id)).toBe(false);
    // Back to inviting.
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("lets the Owner, and only the Owner, grant the Owner role", async () => {
    const { user, backend } = await open("/settings/team", withDana());
    let member = await chooseDana(user);
    await user.click(within(member).getByRole("radio", { name: "Owner" }));
    await waitFor(() => {
      expect(backend.state.members.find((m) => m.id === dana.id)?.role).toBe("owner");
    });
    cleanup();

    const admin = await open("/settings/team", {
      ...withDana(),
      role: "admin",
    });
    member = await chooseDana(admin.user);
    expect(within(member).queryByRole("radio", { name: "Owner" })).not.toBeInTheDocument();
    expect(within(member).getByRole("radio", { name: "Finance" })).toBeInTheDocument();
  });

  it("reads the identity again after changing one's own role", async () => {
    const self = { ...nth(fakeBackend().state.members, 0), role: "admin" };
    const { user, backend } = await open("/settings/team", {
      ...owner,
      role: "admin",
      members: [self, { ...dana }],
    });

    await user.click(within(nth(await memberRows(), 0)).getByText("Tzvi Weiss"));
    const member = await screen.findByRole("region", { name: "Member" });
    const before = backend.requests.filter((r) => r.url.endsWith("/v1/me")).length;
    await user.click(within(member).getByRole("radio", { name: "Support" }));

    await waitFor(() => {
      expect(backend.requests.filter((r) => r.url.endsWith("/v1/me")).length).toBeGreaterThan(
        before,
      );
    });
    expect(backend.state.role).toBe("support");
  });

  it("offers no changes to the Owner's membership", async () => {
    const { user } = await open("/settings/team", owner);

    await user.click(within(nth(await memberRows(), 0)).getByText("Tzvi Weiss"));
    const member = await screen.findByRole("region", { name: "Member" });

    expect(
      within(member).getByText("The Owner's role, shops and membership cannot be changed."),
    ).toBeInTheDocument();
    expect(within(member).queryByRole("radio")).not.toBeInTheDocument();
    expect(within(member).queryByRole("button", { name: /Remove/ })).not.toBeInTheDocument();
  });

  it("says why a change was refused, and changes nothing", async () => {
    const { user, backend } = await open("/settings/team", {
      ...withDana(),
      memberChangesRefused: true,
    });

    const member = await chooseDana(user);
    await user.click(within(member).getByRole("radio", { name: "Finance" }));

    expect(
      await within(member).findByText("Confirm with your authenticator app, then try again."),
    ).toHaveAttribute("role", "alert");
    expect(backend.state.members.find((m) => m.id === dana.id)?.role).toBe("support");
  });
});

describe("the planned parts of Members & access", () => {
  it("shows the AI employees and the policy as demos that do nothing", async () => {
    const { user } = await open("/settings/team", owner);

    // Each planned part has its own sub-tab (clarity round 3).
    await user.click(await screen.findByRole("tab", { name: /AI employees/ }));
    const employees = await screen.findByRole("region", { name: "AI employees" });
    expect(within(employees).getAllByText("Demo").length).toBeGreaterThan(0);
    expect(within(employees).getByText("Maya")).toBeInTheDocument();
    expect(employees.querySelector("[inert]")).not.toBeNull();
    await user.click(within(employees).getByText("Maya"));
    // The toast says it (each demo part also carries the words for screen readers).
    const toast = document.querySelector("[aria-live='polite'][aria-atomic='true']");
    await vi.waitFor(() => {
      expect(toast).toHaveTextContent("Demo — coming soon");
    });

    await user.click(screen.getByRole("tab", { name: /Policy/ }));
    const policy = screen.getByRole("region", { name: "Policy" });
    expect(within(policy).getAllByText("Demo").length).toBeGreaterThan(0);
    expect(policy.querySelector("[inert]")).not.toBeNull();
  });
});

describe("the team with several workspaces", () => {
  it("asks which workspace before listing or inviting", async () => {
    const other = "c0000000-0000-7000-8000-000000000009";
    const { user, backend } = await open("/settings/team", { ...owner, otherOrgs: [other] });

    expect(screen.queryByRole("table", { name: "Members" })).not.toBeInTheDocument();
    await user.click(await screen.findByRole("radio", { name: /c0000000/ }));
    await user.type(await screen.findByLabelText("Email"), "dana@example.test");
    await user.click(screen.getByRole("button", { name: "Invite" }));

    await screen.findByRole("textbox", { name: "Invitation link" });
    expect(
      backend.requests.some((r) => r.url.includes(`/v1/organizations/${other}/invitations`)),
    ).toBe(true);
  });
});

describe("accepting an invitation", () => {
  const link = "/accept-invite#access_token=invite-at&refresh_token=invite-rt&type=invite";

  it("sets the password from the link and signs the new member in", async () => {
    const { user, backend } = await open(link, { role: "support" });
    expect(
      screen.getByRole("heading", { level: 1, name: "Set your password" }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("New password"), "a long new password");
    await user.type(screen.getByLabelText("Repeat the password"), "a long new password");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
    expect(backend.state.accepted).toEqual({
      access_token: "invite-at",
      refresh_token: "invite-rt",
      password: "a long new password",
    });
  });

  it("asks for the same password twice", async () => {
    const { user, backend } = await open(link);

    await user.type(screen.getByLabelText("New password"), "a long new password");
    await user.type(screen.getByLabelText("Repeat the password"), "another password!!");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The passwords are not the same.");
    expect(backend.state.accepted).toBeUndefined();
  });

  it("checks the password length before sending it", async () => {
    const { user, backend } = await open(link);

    await user.type(screen.getByLabelText("New password"), "too short");
    await user.type(screen.getByLabelText("Repeat the password"), "too short");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Use between 12 and 128 characters.",
    );
    expect(backend.state.accepted).toBeUndefined();
  });

  it("says when the chosen password is the account's current one", async () => {
    const { user } = await open(link);

    await user.type(screen.getByLabelText("New password"), "correct horse battery");
    await user.type(screen.getByLabelText("Repeat the password"), "correct horse battery");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This is your current password. Choose a different one.",
    );
  });

  it("says when the link expired or was already used", async () => {
    await open("/accept-invite#error=access_denied&error_code=otp_expired");
    expect(
      screen.getByText("This invitation link has expired or was already used. Ask for a new one."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
  });
});
