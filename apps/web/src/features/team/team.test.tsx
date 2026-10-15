import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, type FakeState } from "../../test/fakeApi.ts";

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

describe("the team (FR-IAM-02)", () => {
  it("lists the organization's members with their roles", async () => {
    await open("/settings/team", owner);

    const members = await screen.findByRole("list", { name: "Members" });
    expect(within(members).getAllByRole("listitem")).toHaveLength(1);
    expect(within(members).getByText("Owner")).toBeInTheDocument();
  });

  it("invites a user as Admin and hands the owner the link to send", async () => {
    const { user, backend } = await open("/settings/team", owner);

    await user.type(await screen.findByLabelText("Email"), "dana@example.test");
    await user.click(screen.getByRole("button", { name: "Invite" }));

    const link = await screen.findByRole("textbox", { name: "Invitation link" });
    expect(link).toHaveValue(backend.state.inviteLink);
    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();
    expect(backend.state.invited).toEqual([{ email: "dana@example.test", role: "admin" }]);
    expect(
      within(screen.getByRole("list", { name: "Members" })).getAllByRole("listitem"),
    ).toHaveLength(2);
  });

  it("is offered from Settings to Owners and Admins only", async () => {
    await open("/settings", owner);
    expect(screen.getByRole("link", { name: /Team/ })).toHaveAttribute("href", "/settings/team");
  });

  it("is not offered to other roles", async () => {
    await open("/settings", { signedIn: true, role: "support" });
    expect(screen.queryByRole("link", { name: /Team/ })).not.toBeInTheDocument();
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

    expect(await screen.findByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
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

  it("says when the link expired or was already used", async () => {
    await open("/accept-invite#error=access_denied&error_code=otp_expired");
    expect(
      screen.getByText("This invitation link has expired or was already used. Ask for a new one."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
  });
});
