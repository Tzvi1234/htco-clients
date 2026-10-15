import { focusManager } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { browser } from "../../shared/lib/browser.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { demoShops, fakeBackend, type FakeState } from "../../test/fakeApi.ts";

async function open(path: string, state: Partial<FakeState> = {}) {
  const backend = fakeBackend(state);
  const history = createMemoryHistory({ initialEntries: [path] });
  const assign = vi.spyOn(browser, "assign").mockImplementation(() => undefined);
  // StrictMode runs effects twice in development: the callback must still be sent once.
  render(
    <StrictMode>
      <App
        locale="en"
        theme="system"
        storage={memoryStorage()}
        history={history}
        api={backend.client}
      />
    </StrictMode>,
  );
  await screen.findByRole("heading", { level: 1 });
  return { user: userEvent.setup(), backend, history, assign };
}

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;
const connects = (requests: Request[]) =>
  requests.filter((r) => r.url.endsWith("/v1/shops/etsy/connect")).length;

describe("connecting an Etsy shop (slice 4.3)", () => {
  it("offers the Owner to connect the first shop", async () => {
    await open("/shops", owner);
    const button = await screen.findByRole("button", { name: "Connect Etsy shop" });
    expect(button).toBeEnabled();
  });

  it.each(["admin", "support"] as const)("does not offer a %s to connect a shop", async (role) => {
    await open("/shops", { ...owner, role });
    expect(await screen.findByText("No shops yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Connect Etsy shop/ })).not.toBeInTheDocument();
    expect(screen.getByText("The workspace owner connects shops.")).toBeInTheDocument();
  });

  it("asks for a code from the authenticator app, then opens Etsy", async () => {
    const { user, backend, assign } = await open("/shops", owner);

    await user.click(await screen.findByRole("button", { name: "Connect Etsy shop" }));
    const dialog = await screen.findByRole("dialog", { name: "Confirm it is you" });
    expect(assign).not.toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(within(dialog).getByLabelText("Code from the app")).toHaveFocus();
    });

    await user.type(within(dialog).getByLabelText("Code from the app"), "123456");
    await user.click(within(dialog).getByRole("button", { name: "Confirm" }));

    await vi.waitFor(() => {
      expect(assign).toHaveBeenCalledWith(backend.state.authorizationUrl);
    });
    expect(assign).toHaveBeenCalledTimes(1);
    expect(connects(backend.requests)).toBe(2);
  });

  it("says when the code is wrong and does not open Etsy", async () => {
    const { user, assign } = await open("/shops", owner);

    await user.click(await screen.findByRole("button", { name: "Connect Etsy shop" }));
    const dialog = await screen.findByRole("dialog", { name: "Confirm it is you" });
    await user.type(within(dialog).getByLabelText("Code from the app"), "000000");
    await user.click(within(dialog).getByRole("button", { name: "Confirm" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "The code is wrong or expired.",
    );
    expect(assign).not.toHaveBeenCalled();
  });

  it("opens Etsy straight away after a recent confirmation", async () => {
    const { user, backend, assign } = await open("/shops", { ...owner, steppedUp: true });

    await user.click(await screen.findByRole("button", { name: "Connect Etsy shop" }));

    await vi.waitFor(() => {
      expect(assign).toHaveBeenCalledWith(backend.state.authorizationUrl);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("says when Etsy cannot be reached", async () => {
    const { user, assign } = await open("/shops", { ...owner, steppedUp: true, etsyDown: true });

    await user.click(await screen.findByRole("button", { name: "Connect Etsy shop" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Etsy cannot be reached right now. Try again in a few minutes.",
    );
    expect(assign).not.toHaveBeenCalled();
  });

  it("never sends the browser to an address that is not https", async () => {
    const { user, assign } = await open("/shops", {
      ...owner,
      steppedUp: true,
      authorizationUrl: "javascript:alert(1)",
    });

    await user.click(await screen.findByRole("button", { name: "Connect Etsy shop" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(assign).not.toHaveBeenCalled();
  });

  it("shows Etsy's trademark notice", async () => {
    await open("/shops", owner);
    expect(
      await screen.findByText(
        "The term 'Etsy' is a trademark of Etsy, Inc. This application uses the Etsy API but is not endorsed or certified by Etsy, Inc.",
      ),
    ).toBeInTheDocument();
  });
});

describe("coming back from Etsy (slice 4.3)", () => {
  const callback = "/integrations/etsy/callback?code=etsy-code&state=s-1";

  it("finishes the connection once and shows the shop", async () => {
    const { backend, history } = await open(callback, owner);

    expect(await screen.findByRole("heading", { level: 1, name: "Shops" })).toBeInTheDocument();
    expect(await screen.findByText("Your Etsy shop is connected.")).toBeInTheDocument();
    expect(await screen.findByRole("article", { name: "Willow & Wick" })).toBeInTheDocument();
    expect(backend.state.callbacks).toEqual([{ code: "etsy-code", state: "s-1" }]);
    expect(history.location.pathname).toBe("/shops");
  });

  it("says when a shop was reconnected", async () => {
    await open(callback, { ...owner, ...demoShops() });
    expect(await screen.findByText("Your Etsy shop is reconnected.")).toBeInTheDocument();
  });

  it("removes the code from the address bar straight away", async () => {
    const { history } = await open(callback, { ...owner, callbackProblem: "etsy-no-shop" });

    await screen.findByRole("alert");
    expect(history.location.pathname).toBe("/integrations/etsy/callback");
    expect(history.location.search).toBe("");
  });

  it.each([
    ["etsy-state-rejected", "This connection link has expired or was already used."],
    ["etsy-authorization-refused", "Etsy did not accept the connection."],
    ["etsy-unreachable", "Etsy did not answer. Nothing was saved."],
    ["etsy-no-shop", "This Etsy account has no shop yet."],
    ["etsy-shop-connected-elsewhere", "This Etsy shop is already connected to another workspace."],
    ["web-session-required", "Finish connecting in the web app where you are signed in."],
    ["etsy-unavailable", "Connecting shops is unavailable right now."],
  ])("explains %s", async (slug, message) => {
    await open(callback, { ...owner, callbackProblem: slug });

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByRole("link", { name: "Back to shops" })).toHaveAttribute("href", "/shops");
  });

  it("says when the owner cancelled on Etsy, without calling the API", async () => {
    const { backend } = await open(
      "/integrations/etsy/callback?error=access_denied&error_description=The+user+denied+access",
      owner,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You cancelled the connection on Etsy.",
    );
    expect(backend.state.callbacks).toEqual([]);
  });

  it("says when the address has no code", async () => {
    const { backend } = await open("/integrations/etsy/callback", owner);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This connection link is incomplete.",
    );
    expect(backend.state.callbacks).toEqual([]);
  });
});

describe("the shop card (slice 4.6)", () => {
  it("shows a healthy connection in plain words", async () => {
    await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(within(card).getByText("Connected")).toBeInTheDocument();
    expect(within(card).getByText("Connection renews automatically")).toBeInTheDocument();
    expect(within(card).getByText("Read shop")).toBeInTheDocument();
    expect(within(card).getByText("Read orders")).toBeInTheDocument();
    expect(within(card).getByText("Read listings")).toBeInTheDocument();
    expect(within(card).getByText(/Last synced 4 minutes ago/)).toBeInTheDocument();
    expect(within(card).getByText("41870022").closest("bdi")).toHaveAttribute("dir", "ltr");
    expect(within(card).queryByRole("button", { name: /Reconnect/ })).not.toBeInTheDocument();
  });

  it("asks to reconnect before an expiring connection runs out", async () => {
    await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Linen Lane Studio" });
    expect(within(card).getByText("Connected")).toBeInTheDocument();
    expect(within(card).getByText("Reconnect within 4 days")).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: /Reconnect/ })).toBeInTheDocument();
  });

  it("asks to reconnect a connection Etsy no longer accepts", async () => {
    await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Paper Fox Prints" });
    expect(within(card).getByText("Needs reconnecting")).toBeInTheDocument();
    expect(within(card).getByText("Reconnect to keep syncing")).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: /Reconnect/ })).toBeInTheDocument();
  });

  it("shows a disconnected shop", async () => {
    await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Old Harbor Goods" });
    expect(within(card).getByText("Disconnected")).toBeInTheDocument();
    expect(within(card).getByText("Not synced yet")).toBeInTheDocument();
  });

  it("reconnects through Etsy", async () => {
    const { user, backend, assign } = await open("/shops", {
      ...owner,
      ...demoShops(),
      steppedUp: true,
    });

    const card = await screen.findByRole("article", { name: "Paper Fox Prints" });
    await user.click(within(card).getByRole("button", { name: /Reconnect/ }));

    await vi.waitFor(() => {
      expect(assign).toHaveBeenCalledWith(backend.state.authorizationUrl);
    });
  });

  it("lets an Admin see the connection but not reconnect it", async () => {
    await open("/shops", { ...owner, role: "admin", ...demoShops() });

    const card = await screen.findByRole("article", { name: "Paper Fox Prints" });
    expect(within(card).getByText("Needs reconnecting")).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /Reconnect/ })).not.toBeInTheDocument();
  });

  it("shows other roles their shops without connection details", async () => {
    await open("/shops", { signedIn: true, role: "support", ...demoShops() });

    expect(await screen.findByRole("article", { name: "Willow & Wick" })).toBeInTheDocument();
    expect(screen.queryByText("Read orders")).not.toBeInTheDocument();
  });
});

describe("loading the shops page", () => {
  it("shows the shops at once while their connection details load", async () => {
    await open("/shops", { ...owner, ...demoShops(), integrationsTrouble: "hang" });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(within(card).getByText("Loading connection details")).toBeInTheDocument();
    expect(within(card).queryByText("Connected")).not.toBeInTheDocument();
  });

  it("keeps the shops on screen and offers to retry when connection details fail", async () => {
    const { user, backend } = await open("/shops", {
      ...owner,
      ...demoShops(),
      integrationsTrouble: "fail",
    });

    await screen.findByRole("article", { name: "Willow & Wick" });
    expect(
      await screen.findByText("Connection details could not be loaded. Try again shortly."),
    ).toBeInTheDocument();

    backend.state.integrationsTrouble = undefined;
    await user.click(screen.getByRole("button", { name: "Try again" }));

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(await within(card).findByText("Connected")).toBeInTheDocument();
  });
});

describe("Codex review findings", () => {
  it("lists every shop, page after page", async () => {
    const shops = Array.from({ length: 51 }, (_, n) => ({
      id: `e0000000-0000-7000-8000-${String(n).padStart(12, "0")}`,
      name: `Shop ${String(n + 1)}`,
      status: "active",
    }));
    await open("/shops", { ...owner, shops });

    expect(await screen.findByRole("article", { name: "Shop 51" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(51);
  });

  it("drops the connection details when the user is no longer Owner or Admin", async () => {
    const { backend } = await open("/shops", { ...owner, ...demoShops() });
    const card = await screen.findByRole("article", { name: "Paper Fox Prints" });
    expect(within(card).getByText("Needs reconnecting")).toBeInTheDocument();

    backend.state.role = "support";
    // Half a minute later the user returns to the tab: the app asks who they are again.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 60_000);
    focusManager.setFocused(false);
    focusManager.setFocused(true);
    await vi.waitFor(() => {
      expect(backend.requests.filter((r) => r.url.endsWith("/v1/me"))).toHaveLength(2);
    });
    vi.useRealTimers();
    focusManager.setFocused(undefined);

    await vi.waitFor(() => {
      expect(screen.queryByText("Needs reconnecting")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("article", { name: "Paper Fox Prints" })).toBeInTheDocument();
  });

  it("shows the confirmation in the workspace the shop was connected to", async () => {
    const other = "c0000000-0000-7000-8000-000000000009";
    const { user } = await open("/integrations/etsy/callback?code=etsy-code&state=s-1", {
      ...owner,
      otherOrgs: [other],
    });

    // The connected workspace is chosen for the owner, with the confirmation.
    expect(await screen.findByText("Your Etsy shop is connected.")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /a0000000/ })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: /c0000000/ }));
    await vi.waitFor(() => {
      expect(screen.queryByText("Your Etsy shop is connected.")).not.toBeInTheDocument();
    });
  });
});
