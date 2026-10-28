import { focusManager } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { browser } from "../../shared/lib/browser.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { demoShops, fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";

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

describe("Etsy's daily request budget on the shop card (AC-4.1.2)", () => {
  const quota = (remaining: number | null, below = false): FakeState["etsyQuota"] => ({
    limit_per_day: remaining === null ? null : 10_000,
    remaining_today: remaining,
    observed_at: new Date().toISOString(),
    floor: 500,
    below_floor: below,
  });

  it("shows what is left today on each connected shop", async () => {
    await open("/shops", { ...owner, ...demoShops(), etsyQuota: quota(8_412) });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    const row = within(card).getByText("Etsy requests left today").closest("div");
    if (row === null) throw new Error("no quota row");
    expect(row).toHaveTextContent("8,412 of 10,000");
    expect(row.querySelector('[data-quota="ok"]')).not.toBeNull();
    expect(within(card).queryByRole("note")).toBeNull();
    // A disconnected shop is not read from Etsy, so it has no budget line.
    const asleep = screen.getByRole("article", { name: "Old Harbor Goods" });
    expect(within(asleep).queryByText("Etsy requests left today")).toBeNull();
  });

  it("warns in the attention tone below the floor: routine reads wait", async () => {
    await open("/shops", { ...owner, ...demoShops(), etsyQuota: quota(320, true) });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    const note = within(card).getByRole("note");
    expect(note).toHaveTextContent(
      "Etsy's daily request budget is low: 320 left, under the floor of 500. Routine reads wait until it resets; urgent ones still run.",
    );
    expect(note).toHaveAttribute("data-tone", "attention");
    expect(card.querySelector('[data-quota="low"]')).not.toBeNull();
  });

  it("says it is not known before the first Etsy call", async () => {
    await open("/shops", { ...owner, ...demoShops(), etsyQuota: quota(null) });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(within(card).getByText("Not known until the first Etsy call")).toBeInTheDocument();
  });

  it("shows no budget line when the API has none", async () => {
    await open("/shops", { ...owner, ...demoShops() });
    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(within(card).queryByText("Etsy requests left today")).toBeNull();
  });

  it("is not shown to a role that may not see connections (403 on the list)", async () => {
    await open("/shops", { ...owner, ...demoShops(), role: "support", etsyQuota: quota(8_412) });
    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(within(card).queryByText("Etsy requests left today")).toBeNull();
  });

  it("he: the numbers stay in order in the RTL card", async () => {
    const backend = fakeBackend({ ...owner, ...demoShops(), etsyQuota: quota(320, true) });
    render(
      <App
        locale="he"
        theme="system"
        storage={memoryStorage()}
        history={createMemoryHistory({ initialEntries: ["/shops"] })}
        api={backend.client}
      />,
    );
    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(within(card).getByRole("note")).toHaveTextContent(/320/);
    expect(document.documentElement.dir).toBe("rtl");
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

const recheckLabel = (name: string) => `Re-check what HTCO can do with ${name}`;

describe("what HTCO can do with the shop (slice 4.5)", () => {
  it("lists each capability in plain words with when it was checked", async () => {
    await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    const list = within(card).getByRole("list", { name: "What HTCO can do" });
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.querySelector("[data-capability]")?.textContent)).toEqual([
      "Approved access",
      "Shop details",
      "Orders",
      "Buyer addresses",
      "Listings",
      "Instant order alerts",
      "Tracking upload",
    ]);
    const orders = within(list).getByText("Orders").closest("li") as HTMLElement;
    expect(within(orders).getByText("Works")).toBeInTheDocument();
    expect(within(card).getByText(/Checked 4 minutes ago/)).toBeInTheDocument();
  });

  it("explains the allowed alternative for what is blocked or not known", async () => {
    await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Linen Lane Studio" });
    const list = within(card).getByRole("list", { name: "What HTCO can do" });
    const tracking = within(list).getByText("Tracking upload").closest("li") as HTMLElement;
    expect(within(tracking).getByText("Not known")).toBeInTheDocument();
    expect(
      within(tracking).getByText(
        "HTCO never writes to your shop. AutoVA uploads tracking to Etsy; HTCO reads it there.",
      ),
    ).toBeInTheDocument();
    const addresses = within(list).getByText("Buyer addresses").closest("li") as HTMLElement;
    expect(within(addresses).getByText("Blocked")).toBeInTheDocument();
    expect(
      within(addresses).getByText(
        "Etsy hides buyer addresses for this shop. Your fulfillment partner gets them from Etsy; HTCO does not need them.",
      ),
    ).toBeInTheDocument();
    const alerts = within(list).getByText("Instant order alerts").closest("li") as HTMLElement;
    expect(
      within(alerts).getByText(
        "Not set up yet. HTCO checks Etsy for new orders regularly instead.",
      ),
    ).toBeInTheDocument();
  });

  it("AC-4.6.2 probing: says the checks are running while Etsy is asked", async () => {
    const { user } = await open("/shops", { ...owner, ...demoShops(), recheckTrouble: "hang" });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(within(card).getByRole("button", { name: recheckLabel("Willow & Wick") }));

    expect(await within(card).findByText("Checking with Etsy now…")).toBeInTheDocument();
  });

  it("AC-4.6.2 error: says Etsy's checks are unavailable when the re-check fails", async () => {
    const { user } = await open("/shops", { ...owner, ...demoShops(), recheckTrouble: "fail" });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(within(card).getByRole("button", { name: recheckLabel("Willow & Wick") }));

    expect(
      await within(card).findByText(
        "Etsy checks are unavailable right now. Try again in a few minutes.",
      ),
    ).toBeInTheDocument();
  });

  it("re-checks on request and says it is done", async () => {
    const { user, backend } = await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(within(card).getByRole("button", { name: recheckLabel("Willow & Wick") }));

    expect(await within(card).findByRole("status")).toHaveTextContent("Checked just now.");
    expect(backend.state.rechecks).toEqual(["d0000000-0000-7000-8000-000000000001"]);
    expect(within(card).getByText(/Checked now/)).toBeInTheDocument();
  });

  it("says when to try again after a re-check moments ago", async () => {
    const { user } = await open("/shops", { ...owner, ...demoShops(), recheckTooSoon: true });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(within(card).getByRole("button", { name: recheckLabel("Willow & Wick") }));

    expect(await within(card).findByRole("alert")).toHaveTextContent(
      "Checked moments ago. Try again in 30 seconds.",
    );
  });

  it("lets an Admin re-check", async () => {
    await open("/shops", { ...owner, role: "admin", ...demoShops() });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(
      within(card).getByRole("button", { name: recheckLabel("Willow & Wick") }),
    ).toBeInTheDocument();
  });

  it("offers no re-check for a disconnected shop", async () => {
    await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Old Harbor Goods" });
    expect(within(card).queryByRole("button", { name: /Re-check/ })).not.toBeInTheDocument();
    expect(within(card).queryByRole("list", { name: "What HTCO can do" })).not.toBeInTheDocument();
  });

  it("says when nothing was checked yet", async () => {
    const { shops, integrations } = demoShops();
    await open("/shops", {
      ...owner,
      shops,
      integrations: integrations.map((i) => ({ ...i, capabilities: [] })),
    });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(within(card).getByText("Not checked yet.")).toBeInTheDocument();
  });
});

describe("disconnecting a shop (slice 4.7)", () => {
  const disconnectLabel = "Disconnect Willow & Wick";

  it("asks for confirmation and does nothing when cancelled", async () => {
    const { user, backend } = await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(within(card).getByRole("button", { name: disconnectLabel }));
    const dialog = await screen.findByRole("alertdialog", { name: "Disconnect Willow & Wick?" });
    expect(dialog).toHaveTextContent(
      "HTCO deletes its access to this shop at once and stops syncing. The shop's data in HTCO is deleted after 30 days unless you reconnect.",
    );
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await vi.waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(backend.state.disconnects).toEqual([]);
  });

  it("confirms with the authenticator code, then shows the shop disconnected", async () => {
    const { user, backend } = await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(within(card).getByRole("button", { name: disconnectLabel }));
    const confirm = await screen.findByRole("alertdialog", { name: "Disconnect Willow & Wick?" });
    await user.click(within(confirm).getByRole("button", { name: "Disconnect" }));
    const code = await screen.findByRole("dialog", { name: "Confirm it is you" });
    await user.type(within(code).getByLabelText("Code from the app"), "123456");
    await user.click(within(code).getByRole("button", { name: "Confirm" }));

    expect(await screen.findByText("Willow & Wick is disconnected.")).toBeInTheDocument();
    expect(backend.state.disconnects).toEqual(["d0000000-0000-7000-8000-000000000001"]);
    const after = screen.getByRole("article", { name: "Willow & Wick" });
    expect(await within(after).findByText("Disconnected")).toBeInTheDocument();
    expect(within(after).getByText(/Data deleted after/)).toBeInTheDocument();
    expect(within(after).getByRole("button", { name: /Reconnect/ })).toBeInTheDocument();
    expect(within(after).queryByRole("button", { name: disconnectLabel })).not.toBeInTheDocument();
  });

  it("disconnects at once after a recent confirmation", async () => {
    const { user, backend } = await open("/shops", { ...owner, ...demoShops(), steppedUp: true });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(within(card).getByRole("button", { name: disconnectLabel }));
    const confirm = await screen.findByRole("alertdialog", { name: "Disconnect Willow & Wick?" });
    await user.click(within(confirm).getByRole("button", { name: "Disconnect" }));

    expect(await screen.findByText("Willow & Wick is disconnected.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Confirm it is you" })).not.toBeInTheDocument();
    expect(backend.state.disconnects).toHaveLength(1);
  });

  it("does not offer an Admin to disconnect", async () => {
    await open("/shops", { ...owner, role: "admin", ...demoShops() });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(within(card).queryByRole("button", { name: disconnectLabel })).not.toBeInTheDocument();
  });

  it("shows when a disconnected shop's data is deleted", async () => {
    await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Old Harbor Goods" });
    expect(within(card).getByText(/Data deleted after/)).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /^Disconnect/ })).not.toBeInTheDocument();
  });
});

describe("removing a shop", () => {
  const removeLabel = "Remove Willow & Wick";
  const WILLOW = "d0000000-0000-7000-8000-000000000001";

  async function confirmByName(user: ReturnType<typeof userEvent.setup>, typed: string) {
    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(within(card).getByRole("button", { name: removeLabel }));
    const dialog = await screen.findByRole("alertdialog", { name: "Remove Willow & Wick?" });
    expect(dialog).toHaveTextContent("This cannot be undone.");
    await user.type(within(dialog).getByLabelText("Type the shop's name to confirm"), typed);
    return dialog;
  }

  it("offers the Owner a quiet Remove shop at the bottom of the card", async () => {
    await open("/shops", { ...owner, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(within(card).getByRole("button", { name: removeLabel })).toBeInTheDocument();
    expect(within(card).getByText("Deletes the shop and all its data in HTCO")).toBeInTheDocument();
  });

  it.each(["admin", "support"] as const)("offers a %s no removal", async (role) => {
    await open("/shops", { ...owner, role, ...demoShops() });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    expect(within(card).queryByRole("button", { name: removeLabel })).not.toBeInTheDocument();
  });

  it("stays disabled until the shop's name is typed, and cancelling removes nothing", async () => {
    const { user, backend } = await open("/shops", { ...owner, ...demoShops() });

    const dialog = await confirmByName(user, "Willow");
    expect(within(dialog).getByRole("button", { name: "Remove shop" })).toBeDisabled();
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await vi.waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(backend.state.removals).toEqual([]);
  });

  it("removes after the name and the authenticator code, then the shop is gone", async () => {
    const { user, backend } = await open("/shops", { ...owner, ...demoShops() });

    const dialog = await confirmByName(user, "Willow & Wick");
    await user.click(within(dialog).getByRole("button", { name: "Remove shop" }));
    const code = await screen.findByRole("dialog", { name: "Confirm it is you" });
    expect(code).toHaveTextContent("Remove a shop");
    await user.type(within(code).getByLabelText("Code from the app"), "123456");
    await user.click(within(code).getByRole("button", { name: "Confirm" }));

    expect(await screen.findByText("Willow & Wick and its data were removed.")).toBeInTheDocument();
    expect(backend.state.removals).toEqual([WILLOW]);
    await vi.waitFor(() => {
      expect(screen.queryByRole("article", { name: "Willow & Wick" })).not.toBeInTheDocument();
    });
  });

  it("says why when the server refuses, and keeps the shop", async () => {
    const { user, backend } = await open("/shops", { ...owner, ...demoShops(), steppedUp: true });
    const refused = vi.spyOn(backend.client, "DELETE").mockResolvedValueOnce({
      data: undefined,
      error: { type: "https://ht-co.app/problems/mfa-required", title: "x", status: 403 },
      response: new Response(null, { status: 403 }),
    } as never);

    const dialog = await confirmByName(user, "Willow & Wick");
    await user.click(within(dialog).getByRole("button", { name: "Remove shop" }));

    expect(
      await screen.findByText("Set up two-factor sign-in in Security first, then remove the shop."),
    ).toBeInTheDocument();
    expect(backend.state.removals).toEqual([]);
    expect(screen.getByRole("article", { name: "Willow & Wick" })).toBeInTheDocument();
    refused.mockRestore();
  });
});

describe("Disconnect and Re-check after the Etsy app key was replaced", () => {
  it("Re-check of a connection Etsy refused says to reconnect, in plain words", async () => {
    const { user, backend } = await open("/shops", { ...owner, ...demoShops() });
    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    // The server found out meanwhile: Etsy refused the tokens.
    const [first] = backend.state.integrations;
    if (first === undefined) throw new Error("no integration");
    backend.state.integrations[0] = { ...first, status: "needs_reauth" };

    await user.click(within(card).getByRole("button", { name: /Re-check/ }));

    expect(
      await within(card).findByText(
        "This shop needs reconnecting: Etsy no longer accepts its connection. Press Reconnect.",
      ),
    ).toBeInTheDocument();
  });

  it("Disconnect that cannot reach the server says so instead of nothing", async () => {
    const { user, backend } = await open("/shops", { ...owner, ...demoShops(), steppedUp: true });
    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    const fetchFailure = vi
      .spyOn(backend.client, "POST")
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await user.click(within(card).getByRole("button", { name: "Disconnect Willow & Wick" }));
    const confirm = await screen.findByRole("alertdialog", { name: "Disconnect Willow & Wick?" });
    await user.click(within(confirm).getByRole("button", { name: "Disconnect" }));

    expect(
      await screen.findByText("HTCO could not be reached. Check your connection."),
    ).toBeInTheDocument();
    fetchFailure.mockRestore();
  });
});

describe("Codex review of #31", () => {
  it("keeps the check age current and lets the done message go while the page stays open", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ["Date", "setInterval", "clearInterval"] });
    try {
      const { backend } = await open("/shops", { ...owner, ...demoShops() });
      const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
      const card = await screen.findByRole("article", { name: "Willow & Wick" });
      await user.click(within(card).getByRole("button", { name: recheckLabel("Willow & Wick") }));
      expect(await within(card).findByRole("status")).toHaveTextContent("Checked just now.");
      expect(backend.state.rechecks).toHaveLength(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3 * 60_000);
      });

      expect(within(card).getByText(/Checked 3 minutes ago/)).toBeInTheDocument();
      expect(within(card).queryByText("Checked just now.")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("post-merge review (2026-10-23)", () => {
  const WILLOW = "d0000000-0000-7000-8000-000000000001";
  const onlyWillow: Partial<FakeState> = {
    shops: [{ id: WILLOW, name: "Willow & Wick", status: "active" }],
    integrations: [fakeIntegration(WILLOW, "ok")],
  };
  const problem = (status: number, type: string) =>
    ({
      data: undefined,
      error: { type: `https://ht-co.app/problems/${type}`, title: type, status },
      response: new Response(null, { status }),
    }) as never;

  it("confirms removing the last shop instead of switching to the empty page silently", async () => {
    const { user, backend } = await open("/shops", { ...owner, ...onlyWillow, steppedUp: true });

    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(within(card).getByRole("button", { name: "Remove Willow & Wick" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Remove Willow & Wick?" });
    await user.type(
      within(dialog).getByLabelText("Type the shop's name to confirm"),
      "Willow & Wick",
    );
    await user.click(within(dialog).getByRole("button", { name: "Remove shop" }));

    expect(await screen.findByText("No shops yet")).toBeInTheDocument();
    expect(backend.state.removals).toEqual([WILLOW]);
    expect(screen.getByText("Willow & Wick and its data were removed.")).toBeInTheDocument();
  });

  it("forgets a disconnected shop's live orders (buyer names) at once", async () => {
    const { user, backend, history } = await open("/commerce/orders", {
      ...owner,
      ...onlyWillow,
      steppedUp: true,
    });
    const table = await screen.findByRole("table", { name: "Orders" }, { timeout: 8000 });
    expect(within(table).getAllByText("Emma R.").length).toBeGreaterThan(0);

    act(() => {
      history.push("/shops");
    });
    const card = await screen.findByRole("article", { name: "Willow & Wick" });
    await user.click(within(card).getByRole("button", { name: "Disconnect Willow & Wick" }));
    const confirm = await screen.findByRole("alertdialog", { name: "Disconnect Willow & Wick?" });
    await user.click(within(confirm).getByRole("button", { name: "Disconnect" }));
    expect(await screen.findByText("Willow & Wick is disconnected.")).toBeInTheDocument();

    // The orders are not answered again yet: what shows is whatever the browser still holds.
    const get = backend.client.GET.bind(backend.client);
    vi.spyOn(backend.client, "GET").mockImplementation(((path: string, init: unknown) =>
      path.endsWith("/orders")
        ? new Promise(() => undefined)
        : get(path as never, init as never)) as never);
    act(() => {
      history.push("/commerce/orders");
    });
    await screen.findByRole("heading", { level: 1, name: "Orders" });

    expect(screen.queryAllByText("Emma R.")).toHaveLength(0);
  });

  it.each([
    ["removing", "DELETE", "Remove Willow & Wick", "Remove shop", "remove"],
    ["disconnecting", "POST", "Disconnect Willow & Wick", "Disconnect", "disconnect"],
  ] as const)(
    "says the session ended when %s answers 401, instead of 'try again shortly'",
    async (_, method, trigger, press, verb) => {
      const { user, backend } = await open("/shops", { ...owner, ...demoShops(), steppedUp: true });
      const refused = vi
        .spyOn(backend.client, method)
        .mockResolvedValueOnce(problem(401, "not-authenticated"));

      const card = await screen.findByRole("article", { name: "Willow & Wick" });
      await user.click(within(card).getByRole("button", { name: trigger }));
      const dialog = await screen.findByRole("alertdialog");
      if (verb === "remove")
        await user.type(
          within(dialog).getByLabelText("Type the shop's name to confirm"),
          "Willow & Wick",
        );
      await user.click(within(dialog).getByRole("button", { name: press }));

      expect(
        await screen.findByText(`Your session has ended. Sign in again, then ${verb} the shop.`),
      ).toBeInTheDocument();
      refused.mockRestore();
    },
  );
});
