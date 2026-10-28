import { MutationCache, QueryCache } from "@tanstack/react-query";
import { createMemoryHistory, type RouterHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";
import { fakeRelay, fakeRelayItem, type FakeRelayItem } from "../../test/fakeRelay.ts";

// The AutoVA tracking relay (platform slice 6.10): the orders waiting for a number, the owner's
// paste checked by the server (AC-6.10.4), a number Etsy already has closing the order
// (AC-6.10.2), the hand-off for the copy into Etsy (AC-6.10.3) and every problem the API answers.
// The pasted number is buyer data: it comes only from the audited reveal and is never kept.

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;
const WILLOW = "d0000000-0000-7000-8000-000000000001";
const LINEN = "d0000000-0000-7000-8000-000000000002";
const FIRST = "f0000000-0000-7000-8000-000000000001";
const SECOND = "f0000000-0000-7000-8000-000000000002";
const READY = "f0000000-0000-7000-8000-000000000003";
/** Invented numbers in Yun Express's format (`YT` and 16 digits). */
const GOOD = "YT2410000000001234";
const PASTED = "YT2410000000009876";

function items(): FakeRelayItem[] {
  return [
    fakeRelayItem(FIRST, WILLOW, 3_481_220_917, 104),
    fakeRelayItem(SECOND, LINEN, 3_481_305_442, 78),
    fakeRelayItem(READY, WILLOW, 3_480_977_163, 130, {
      state: "handed_off",
      carrier: "yun_express",
      code: PASTED,
    }),
  ];
}

async function open(
  state: Partial<FakeState> = {},
  locale: "en" | "he" = "en",
  history: RouterHistory = createMemoryHistory({ initialEntries: ["/commerce/tracking"] }),
  storage = memoryStorage(),
) {
  const backend = fakeBackend({
    ...owner,
    shops: [
      { id: WILLOW, name: "Willow & Wick", status: "active" },
      { id: LINEN, name: "Linen Lane Studio", status: "active" },
    ],
    integrations: [fakeIntegration(WILLOW, "ok"), fakeIntegration(LINEN, "ok")],
    relay: fakeRelay(items()),
    ...state,
  });
  render(
    <App locale={locale} theme="system" storage={storage} history={history} api={backend.client} />,
  );
  await screen.findByRole("heading", { level: 1 });
  return { user: userEvent.setup(), backend, history };
}

async function settled() {
  await vi.waitFor(
    () => {
      expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    },
    { timeout: 8000 },
  );
}

/** The order's panel beside the list, named by its heading. */
async function orderPanel(receipt: string) {
  await settled();
  return screen.findByRole("region", { name: `Order #${receipt}` });
}

async function pasteInto(
  user: ReturnType<typeof userEvent.setup>,
  panel: HTMLElement,
  carrier: string,
  code: string,
) {
  await user.click(within(panel).getByRole("radio", { name: carrier }));
  await user.type(within(panel).getByRole("textbox", { name: "Tracking number" }), code);
  await user.click(within(panel).getByRole("button", { name: "Check and save" }));
}

// Each test is a whole journey through the app on the in-memory API.
vi.setConfig({ testTimeout: 20_000 });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the orders waiting for tracking (AC-6.10.1)", () => {
  it("says how many orders need a number, lists them oldest first, and opens the oldest", async () => {
    await open();
    await settled();
    expect(
      await screen.findByRole("heading", { name: "2 orders need a tracking number" }),
    ).toBeVisible();
    const figures = screen.getByRole("list", { name: "Key figures" });
    expect(within(figures).getByText("Need a number").parentElement).toHaveTextContent("2");
    const rows = within(
      screen.getByRole("table", { name: "Orders without tracking" }),
    ).getAllByRole("row");
    expect(rows.slice(1).map((row) => row.textContent)).toEqual([
      expect.stringContaining("#3481220917"),
      expect.stringContaining("#3481305442"),
    ]);
    // The first order is open beside the list, ready for its paste.
    const panel = await orderPanel("3481220917");
    expect(within(panel).getByRole("button", { name: "Check and save" })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /Need a number/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: /Copy into Etsy/ })).toHaveTextContent("1");
  });

  it("shows an empty state when every order has its number", async () => {
    await open({ relay: fakeRelay([]) });
    await settled();
    expect(await screen.findByText("Every order has its tracking number")).toBeVisible();
    expect(screen.getByRole("heading", { name: "No order is waiting for tracking" })).toBeVisible();
  });

  it("says when the relay is not set up on the server, and offers to try again", async () => {
    await open({ relay: fakeRelay([], { trouble: "unavailable" }) });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("The tracking relay is not set up on this server yet.");
    expect(within(alert).getByRole("button", { name: "Try again" })).toBeVisible();
  });

  it("tells a role without fulfillment to ask an Owner or Admin, without a retry", async () => {
    await open({ role: "viewer" });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Your role does not include fulfillment.");
    expect(within(alert).queryByRole("button")).toBeNull();
  });

  it("shows its loading state while the list is on its way", async () => {
    await open({ relay: fakeRelay(items(), { trouble: "hang" }) });
    expect(await screen.findByText("Loading the orders…")).toBeVisible();
  });
});

describe("the paste, checked by the server (AC-6.10.4)", () => {
  it("saves a valid number, says so with its last four, and leads to the copy", async () => {
    const { user, backend } = await open();
    const panel = await orderPanel("3481220917");
    await pasteInto(user, panel, "Yun Express", GOOD);
    const status = await screen.findByText(/^Checked and saved/);
    expect(status).toHaveTextContent(
      "Checked and saved: Yun Express number ending in 1234 for order #3481220917. Now copy it into Etsy.",
    );
    expect(backend.state.relay.pastes).toEqual([{ id: FIRST, carrier: "yun_express" }]);
    // The order moved to the copy tab; the button there opens it.
    await user.click(screen.getByRole("button", { name: "Copy into Etsy" }));
    expect(screen.getByRole("tab", { name: /Copy into Etsy/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(await orderPanel("3481220917")).toBeVisible();
  });

  it("closes the order when Etsy already shows the number, with nothing to copy (AC-6.10.2)", async () => {
    const { user, backend } = await open({
      relay: fakeRelay(items(), { onEtsy: [GOOD] }),
    });
    await pasteInto(user, await orderPanel("3481220917"), "Yun Express", GOOD);
    expect(await screen.findByText(/Etsy already shows this number for order/)).toHaveTextContent(
      "so the order is done. Nothing to copy.",
    );
    expect(backend.state.relay.items.find((item) => item.id === FIRST)?.state).toBe("closed");
    await settled();
    // It leaves the list; the next order is the one to paste now.
    await vi.waitFor(() => {
      const table = screen.getByRole("table", { name: "Orders without tracking" });
      expect(within(table).queryByText("#3481220917")).toBeNull();
    });
  });

  it("names the carrier, never the number, when the format is wrong (tracking-invalid)", async () => {
    const { user } = await open();
    const panel = await orderPanel("3481220917");
    await pasteInto(user, panel, "USPS", "NOT-A-NUMBER");
    const alert = await within(panel).findByRole("alert");
    expect(alert).toHaveTextContent(
      "This is not a valid USPS tracking number. Check the number and the carrier in AutoVA, then paste it again.",
    );
    expect(alert.textContent).not.toContain("NOT");
    expect(within(panel).getByRole("textbox", { name: "Tracking number" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("refuses a number used for another order (tracking-already-used)", async () => {
    const { user } = await open({ relay: fakeRelay(items(), { usedElsewhere: [GOOD] }) });
    const panel = await orderPanel("3481220917");
    await pasteInto(user, panel, "Yun Express", GOOD);
    expect(await within(panel).findByRole("alert")).toHaveTextContent(
      "This number is already used for another order of this shop.",
    );
  });

  it("says the order moved on a replay, and brings the list up to date (relay-item-moved)", async () => {
    const { user, backend } = await open();
    const panel = await orderPanel("3481220917");
    // Someone else pasted it a moment ago, in another tab.
    const first = backend.state.relay.items.find((item) => item.id === FIRST);
    if (first !== undefined) first.state = "handed_off";
    await pasteInto(user, panel, "Yun Express", GOOD);
    expect(
      await screen.findByText(
        "This order is no longer waiting for a number. The list is up to date.",
      ),
    ).toBeVisible();
  });

  it("tells Operations or Support that only an Owner or Admin pastes (403 forbidden)", async () => {
    const { user } = await open({ role: "support" });
    const panel = await orderPanel("3481220917");
    await pasteInto(user, panel, "Yun Express", GOOD);
    expect(await within(panel).findByRole("alert")).toHaveTextContent(
      "Only an Owner or Admin can paste or copy tracking numbers.",
    );
  });

  it("asks for the second factor and links to it when the session lost it (mfa-required)", async () => {
    const { user, backend } = await open();
    const panel = await orderPanel("3481220917");
    backend.state.assurance = "aal1";
    await pasteInto(user, panel, "Yun Express", GOOD);
    expect(await within(panel).findByRole("alert")).toHaveTextContent(
      "This needs your second factor.",
    );
    expect(within(panel).getByRole("link", { name: "Confirm my second factor" })).toHaveAttribute(
      "href",
      "/security/setup",
    );
  });
});

describe("the copy into Etsy (AC-6.10.3)", () => {
  async function copyTab() {
    const opened = await open();
    await settled();
    await opened.user.click(screen.getByRole("tab", { name: /Copy into Etsy/ }));
    return { ...opened, panel: await orderPanel("3480977163") };
  }

  it("keeps the number hidden until asked, then reveals it once and copies it", async () => {
    const { user, backend, panel } = await copyTab();
    expect(within(panel).getByText("Hidden until you reveal it")).toBeVisible();
    expect(document.body.textContent).not.toContain(PASTED);
    expect(backend.state.relay.reveals).toEqual([]);

    await user.click(within(panel).getByRole("button", { name: "Reveal the number" }));
    expect(await within(panel).findByText(PASTED)).toBeVisible();
    expect(backend.state.relay.reveals).toEqual([READY]);

    await user.click(within(panel).getByRole("button", { name: "Copy to clipboard" }));
    expect(await navigator.clipboard.readText()).toBe(PASTED);
    expect(within(panel).getByRole("status")).toHaveTextContent("Copied.");

    await user.click(within(panel).getByRole("button", { name: "Hide" }));
    expect(document.body.textContent).not.toContain(PASTED);
    expect(within(panel).getByRole("button", { name: "Reveal the number" })).toBeVisible();
  });

  it("explains a reveal that is no longer possible (404: closed, expired or not allowed)", async () => {
    const { user, backend, panel } = await copyTab();
    const ready = backend.state.relay.items.find((item) => item.id === READY);
    if (ready !== undefined) ready.code = null;
    await user.click(within(panel).getByRole("button", { name: "Reveal the number" }));
    expect(await within(panel).findByRole("alert")).toHaveTextContent(
      "This order is no longer here: it closed, or its number expired after 30 days.",
    );
  });

  it("gives Support the same 404 as a missing number, never the number", async () => {
    const { user, backend } = await open({ role: "support" });
    await settled();
    await user.click(screen.getByRole("tab", { name: /Copy into Etsy/ }));
    const panel = await orderPanel("3480977163");
    await user.click(within(panel).getByRole("button", { name: "Reveal the number" }));
    expect(await within(panel).findByRole("alert")).toHaveTextContent(
      "This order is no longer here",
    );
    expect(backend.state.relay.reveals).toEqual([]);
    expect(document.body.textContent).not.toContain(PASTED);
  });
});

/** Anything as text; undefined (a query without data) as nothing. */
const dump = (value: unknown): string => (value === undefined ? "" : JSON.stringify(value));

describe("the pasted number is never kept", () => {
  it("never reaches storage, logs, the address or a cache, through a paste, reveal and copy", async () => {
    const queryCaches: QueryCache[] = [];
    const mutationCaches: MutationCache[] = [];
    // The originals, taken before the spies replace them.
    const buildQuery = Object.getOwnPropertyDescriptor(QueryCache.prototype, "build")
      ?.value as QueryCache["build"];
    const buildMutation = Object.getOwnPropertyDescriptor(MutationCache.prototype, "build")
      ?.value as MutationCache["build"];
    vi.spyOn(QueryCache.prototype, "build").mockImplementation(function (
      this: QueryCache,
      ...args: Parameters<QueryCache["build"]>
    ) {
      queryCaches.push(this);
      return Reflect.apply(buildQuery, this, args);
    });
    vi.spyOn(MutationCache.prototype, "build").mockImplementation(function (
      this: MutationCache,
      ...args: Parameters<MutationCache["build"]>
    ) {
      mutationCaches.push(this);
      return Reflect.apply(buildMutation, this, args);
    });
    const logs = (["log", "info", "warn", "error", "debug"] as const).map((level) =>
      vi.spyOn(console, level),
    );
    const local = vi.spyOn(Storage.prototype, "setItem");
    const storage = memoryStorage();
    const settings = vi.spyOn(storage, "setItem");

    const { user, backend, history } = await open({}, "en", undefined, storage);
    await pasteInto(user, await orderPanel("3481220917"), "Yun Express", GOOD);
    await user.click(await screen.findByRole("button", { name: "Copy into Etsy" }));
    await settled();
    const panel = await orderPanel("3481220917");
    await user.click(within(panel).getByRole("button", { name: "Reveal the number" }));
    expect(await within(panel).findByText(GOOD)).toBeVisible();
    await user.click(within(panel).getByRole("button", { name: "Copy to clipboard" }));

    const leaks = (calls: unknown[][]) =>
      calls.filter(
        (args) =>
          JSON.stringify(args).includes(GOOD) || JSON.stringify(args).includes(GOOD.slice(0, 10)),
      );
    for (const log of logs) expect(leaks(log.mock.calls)).toEqual([]);
    expect(leaks(local.mock.calls)).toEqual([]);
    expect(leaks(settings.mock.calls)).toEqual([]);
    expect(history.location.href).not.toContain(GOOD);
    for (const request of backend.requests) expect(request.url).not.toContain(GOOD);
    // No query or mutation holds it, as data or as what was sent.
    expect(queryCaches.length + mutationCaches.length).toBeGreaterThan(0);
    for (const cache of queryCaches)
      for (const query of cache.getAll()) expect(dump(query.state.data)).not.toContain(GOOD);
    for (const cache of mutationCaches)
      for (const mutation of cache.getAll())
        expect(dump([mutation.state.data, mutation.state.variables])).not.toContain(GOOD);
  });

  it("asks the browser not to cache the reveal", async () => {
    const { user, backend } = await open();
    await settled();
    await user.click(screen.getByRole("tab", { name: /Copy into Etsy/ }));
    const panel = await orderPanel("3480977163");
    await user.click(within(panel).getByRole("button", { name: "Reveal the number" }));
    await within(panel).findByText(PASTED);
    const reveal = backend.requests.find((request) => request.url.includes("/code"));
    expect(reveal?.cache).toBe("no-store");
  });
});

describe("Hebrew", () => {
  it("speaks Hebrew and keeps the order number left-to-right", async () => {
    await open({}, "he");
    await settled();
    expect(await screen.findByRole("heading", { level: 1, name: "מספרי מעקב" })).toBeVisible();
    const table = screen.getByRole("table", { name: "הזמנות בלי מספר מעקב" });
    const number = within(table).getByText("#3481220917");
    expect(number).toHaveClass("ltr");
  });
});
