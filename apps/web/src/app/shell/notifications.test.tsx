import { focusManager } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { useNoticeText } from "./NotificationBell.tsx";
import { App } from "../App.tsx";
import { LocaleProvider } from "../../shared/i18n/LocaleProvider.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { PHONE_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { fakeBackend, fakeIntegration, type FakeState } from "../../test/fakeApi.ts";
import { demoIncidents, demoNotifications, fakeNotification } from "../../test/fakeIncidents.ts";

// The notification bell in the top bar (platform slice 6.5): the unread count, a panel with the
// newest notifications in the user's language, "mark all read", and incident notifications that
// open their incident. New notifications are announced politely (AC-6.5.2).

const owner = { signedIn: true, enrolled: true, assurance: "aal2" } as const;
const WILLOW = "d0000000-0000-7000-8000-000000000001";
const LINEN = "d0000000-0000-7000-8000-000000000002";
const ORG = "a0000000-0000-7000-8000-000000000000";
const shops: Partial<FakeState> = {
  shops: [
    { id: WILLOW, name: "Willow & Wick", status: "active" },
    { id: LINEN, name: "Linen Lane Studio", status: "active" },
  ],
  integrations: [fakeIntegration(WILLOW, "ok"), fakeIntegration(LINEN, "ok")],
};

async function open(state: Partial<FakeState> = {}, locale: "en" | "he" = "en", path = "/") {
  const backend = fakeBackend({
    ...owner,
    ...shops,
    incidents: demoIncidents([WILLOW, LINEN]),
    notifications: demoNotifications([WILLOW, LINEN]),
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

const bell = async (name: RegExp | string = /^Notifications/) =>
  within(await screen.findByRole("banner")).findByRole("button", { name });

describe("the notification bell", () => {
  it("shows the unread count in the top bar", async () => {
    await open();
    const button = await bell("Notifications, 2 unread");
    expect(button).toHaveTextContent("2");
  });

  it("has no count when everything is read", async () => {
    await open({ notifications: [] });
    const button = await bell("Notifications");
    expect(button).not.toHaveTextContent(/\d/);
  });

  it("opens a panel with the newest notifications in words", async () => {
    const { user } = await open();
    await user.click(await bell("Notifications, 2 unread"));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    const items = within(panel).getAllByRole("listitem");
    expect(items.map((item) => item.querySelector("[data-text]")?.textContent)).toEqual([
      "New incident: Automation gave up",
      "New incident: Tracking mismatch, order #3412880131",
      "Order #3412880140 must ship by Oct 25",
      "New sign-in on Chrome on Windows",
      "Incident resolved: Tracking missing, order #3412880102",
    ]);
    // Unread ones say so in words, not only with the dot.
    expect(items[0]).toHaveTextContent("Unread");
    expect(items[3]).not.toHaveTextContent("Unread");
  });

  it.each([
    [
      "en",
      [
        "A 2-star review arrived",
        "Listing 1500 is out of stock",
        "Order #77 needs its tracking copied to Etsy",
        "Two-step sign-in was turned off",
        "Willow & Wick was connected",
        "Willow & Wick was disconnected",
        "Willow & Wick needs reconnecting to Etsy",
        "Willow & Wick's Etsy connection expires soon",
        "A new notification",
      ],
    ],
    [
      "he",
      [
        "התקבלה ביקורת של 2 כוכבים",
        "המוצר 1500 אזל מהמלאי",
        "צריך להעתיק ל־Etsy את מספר המעקב של הזמנה #77",
        "הכניסה הדו־שלבית בוטלה",
        "Willow & Wick חוברה",
        "Willow & Wick נותקה",
        "צריך לחבר מחדש את Willow & Wick ל־Etsy",
        "החיבור של Willow & Wick ל־Etsy יפוג בקרוב",
        "התראה חדשה",
      ],
    ],
  ] as const)("says each kind of notification in words (%s)", (locale, expected) => {
    const kinds = [
      ["alert_low_review", { rating: "2", listing_id: "1500" }],
      ["alert_out_of_stock", { listing_id: "1500" }],
      ["relay_tracking_needed", { receipt_id: "77" }],
      ["mfa_changed", { change: "removed" }],
      ["shop_connected", { shop_id: WILLOW }],
      ["shop_disconnected", { shop_id: WILLOW }],
      ["integration_reauth", { shop_id: WILLOW }],
      ["refresh_token_expiring", { shop_id: WILLOW }],
      ["something_new", {}],
    ] as const;
    const notices = kinds.map(([kind, params], index) =>
      fakeNotification({ id: String(index), kind, params, shop_id: WILLOW }),
    );
    function Texts() {
      const text = useNoticeText((id) => (id === WILLOW ? "Willow & Wick" : undefined));
      return (
        <ul>
          {notices.map((notice) => (
            <li key={notice.id}>{text(notice)}</li>
          ))}
        </ul>
      );
    }
    render(
      <LocaleProvider initialLocale={locale} storage={undefined}>
        <Texts />
      </LocaleProvider>,
    );
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(expected);
  });

  it("shows the newest six and says how many there are", async () => {
    const notifications = Array.from({ length: 9 }, (_, index) =>
      fakeNotification({
        id: `f0000000-0000-7000-8000-0000000001${String(index).padStart(2, "0")}`,
        kind: "alert_out_of_stock",
        params: { listing_id: String(1500 + index) },
        created_at: new Date(Date.now() - (index + 1) * 60_000).toISOString(),
      }),
    );
    const { user } = await open({ notifications });
    await user.click(await bell());
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    expect(within(panel).getAllByRole("listitem")).toHaveLength(6);
    expect(within(panel).getByText("The newest 6 of 9")).toBeVisible();
  });

  it("is in Hebrew too", async () => {
    const { user } = await open({}, "he");
    await user.click(await bell("התראות, 2 שלא נקראו"));
    const panel = await screen.findByRole("dialog", { name: "התראות" });
    expect(within(panel).getAllByRole("listitem")[0]).toHaveTextContent(
      "תקלה חדשה: אוטומציה נכשלה סופית",
    );
    expect(within(panel).getByRole("button", { name: "סימון הכול כנקרא" })).toBeInTheDocument();
  });

  it("marks all read: only the ones it shows, by ID, in their workspace", async () => {
    const { user, backend } = await open();
    await user.click(await bell("Notifications, 2 unread"));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await user.click(within(panel).getByRole("button", { name: "Mark all read" }));

    await vi.waitFor(() => {
      expect(backend.state.reads).toEqual([
        { ids: ["f0000000-0000-7000-8000-000000000001", "f0000000-0000-7000-8000-000000000002"] },
      ]);
    });
    const read = backend.requests.find((r) => r.url.includes("/v1/notifications/read"));
    expect(new URL(read?.url ?? "http://x").searchParams.get("organization_id")).toBe(ORG);
    // The count is gone, and so is the action.
    await vi.waitFor(() => {
      expect(within(panel).queryByRole("button", { name: "Mark all read" })).toBeNull();
    });
    // Focus stays in the panel once its action is gone, so Escape still closes it.
    expect(panel).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard("{Escape}");
    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Notifications" })).toBeNull();
    });
    expect(await bell("Notifications")).toBeInTheDocument();
  });

  it("marks only the shown ones when more are unread, and says so on the button", async () => {
    const notifications = Array.from({ length: 9 }, (_, index) =>
      fakeNotification({
        id: `f0000000-0000-7000-8000-0000000002${String(index).padStart(2, "0")}`,
        kind: "alert_out_of_stock",
        params: { listing_id: String(1600 + index) },
        created_at: new Date(Date.now() - (index + 1) * 60_000).toISOString(),
      }),
    );
    const { user, backend } = await open({ notifications });
    await user.click(await bell("Notifications, 9 unread"));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    expect(within(panel).queryByRole("button", { name: "Mark all read" })).toBeNull();
    await user.click(within(panel).getByRole("button", { name: "Mark these read" }));
    await vi.waitFor(() => {
      expect(backend.state.reads).toEqual([{ ids: notifications.slice(0, 6).map((n) => n.id) }]);
    });
    // Codex on #48: the older unread ones come into view next, and can be read and marked.
    expect(
      await within(panel).findByText(/Listing 1606/, undefined, { timeout: 5000 }),
    ).toBeVisible();
    await user.click(within(panel).getByRole("button", { name: "Mark all read" }));
    await vi.waitFor(() => {
      expect(backend.state.reads[1]).toEqual({ ids: notifications.slice(6).map((n) => n.id) });
    });
  });

  it("says when Mark all read failed, and keeps the unread ones", async () => {
    const { user, backend } = await open({ readTrouble: "fail" });
    await user.click(await bell("Notifications, 2 unread"));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await user.click(within(panel).getByRole("button", { name: "Mark all read" }));
    expect(
      await within(panel).findByText("They could not be marked read. Try again.", undefined, {
        timeout: 5000,
      }),
    ).toHaveAttribute("role", "alert");
    expect(backend.state.reads).toEqual([]);
    expect(within(panel).getByRole("button", { name: "Mark all read" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(await bell("Notifications, 2 unread")).toBeInTheDocument();
  });

  it("says when one workspace's notifications did not load, instead of leaving them out", async () => {
    const other = "a0000000-0000-7000-8000-0000000000aa";
    const { user, backend } = await open({ otherOrgs: [other], notificationsFailFor: [other] });
    await user.click(await bell(/^Notifications, \d+ unread/));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    expect(
      await within(panel).findByText("Some workspaces' notifications did not load", undefined, {
        timeout: 5000,
      }),
    ).toBeVisible();
    // What did load is still there.
    expect(within(panel).getByText("New incident: Automation gave up")).toBeVisible();
    backend.state.notificationsFailFor = undefined;
    await user.click(within(panel).getByRole("button", { name: "Try again" }));
    await vi.waitFor(() => {
      expect(within(panel).queryByText("Some workspaces' notifications did not load")).toBeNull();
    });
  });

  it("marks all read across two workspaces: each one's IDs under its own workspace", async () => {
    const other = "b0000000-0000-7000-8000-0000000000bb";
    const { user, backend } = await open({
      otherOrgs: [other],
      notificationWorkspaces: { "f0000000-0000-7000-8000-000000000002": other },
    });
    await user.click(await bell("Notifications, 2 unread"));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await user.click(within(panel).getByRole("button", { name: "Mark all read" }));

    await vi.waitFor(() => {
      expect(backend.state.reads).toHaveLength(2);
    });
    const sent = backend.state.readWorkspaces.map((workspace, index) => [
      workspace,
      backend.state.reads[index],
    ]);
    expect(sent).toEqual(
      expect.arrayContaining([
        [ORG, { ids: ["f0000000-0000-7000-8000-000000000001"] }],
        [other, { ids: ["f0000000-0000-7000-8000-000000000002"] }],
      ]),
    );
  });

  it("opens another workspace's incident in that workspace, even from a center on the first", async () => {
    // Quill's review of #48: the URL's workspace wins over the one picked before.
    const other = "b0000000-0000-7000-8000-0000000000bb";
    const dead = "e0000000-0000-7000-8000-000000000003";
    const { user } = await open(
      {
        otherOrgs: [other],
        incidentWorkspaces: { [dead]: other },
        notificationWorkspaces: { "f0000000-0000-7000-8000-000000000001": other },
      },
      "en",
      `/incidents?workspace=${ORG}`,
    );
    await user.click(await bell(/^Notifications, \d+ unread/));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await user.click(within(panel).getByRole("link", { name: /New incident: Automation gave up/ }));

    expect(await screen.findByRole("region", { name: "Automation gave up" })).toBeVisible();
    expect(screen.queryByText("This incident is not available to you.")).toBeNull();
  });

  it("opens a shop's alert on that shop, not on the first one (Codex review of #48)", async () => {
    const notifications = [
      fakeNotification({
        id: "f0000000-0000-7000-8000-000000000301",
        kind: "alert_out_of_stock",
        params: { listing_id: "1777" },
        shop_id: LINEN,
      }),
    ];
    const { user } = await open({ notifications });
    await user.click(await bell("Notifications, 1 unread"));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await user.click(within(panel).getByRole("link", { name: /Listing 1777 is out of stock/ }));

    expect(await screen.findByRole("heading", { level: 1, name: "Products" })).toBeVisible();
    const shops = await screen.findByRole("group", { name: "Shop" }, { timeout: 8000 });
    expect(within(shops).getByRole("button", { name: "Linen Lane Studio" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("opens the incident a notification is about, and marks it read", async () => {
    const { user, backend } = await open();
    await user.click(await bell("Notifications, 2 unread"));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await user.click(within(panel).getByRole("link", { name: /New incident: Automation gave up/ }));

    expect(await screen.findByRole("heading", { level: 1, name: "Incidents" })).toBeVisible();
    expect(await screen.findByRole("region", { name: "Automation gave up" })).toBeVisible();
    await vi.waitFor(() => {
      expect(backend.state.reads).toEqual([{ ids: ["f0000000-0000-7000-8000-000000000001"] }]);
    });
    expect(screen.queryByRole("dialog", { name: "Notifications" })).not.toBeInTheDocument();
  });

  it("says when there is nothing yet", async () => {
    const { user } = await open({ notifications: [] });
    await user.click(await bell("Notifications"));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    expect(within(panel).getByText("No notifications yet")).toBeVisible();
    expect(within(panel).queryByRole("button", { name: "Mark all read" })).not.toBeInTheDocument();
  });

  it("says when the notifications could not be loaded, and tries again", async () => {
    const { user, backend } = await open({ notificationsTrouble: "fail" });
    await user.click(await bell("Notifications"));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    expect(await within(panel).findByText("Notifications could not be loaded")).toBeVisible();
    backend.state.notificationsTrouble = undefined;
    await user.click(within(panel).getByRole("button", { name: "Try again" }));
    expect(await within(panel).findByText("New incident: Automation gave up")).toBeVisible();
  });

  it("is on phones too", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === PHONE_QUERY,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    try {
      await open();
      expect(await bell("Notifications, 2 unread")).toBeVisible();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("AC-6.5.2: new notifications are announced politely", () => {
  it("AC-6.5.2 announces new notifications in a polite live region, never an assertive one", async () => {
    const { backend } = await open({ notifications: [] });
    await bell("Notifications");
    const banner = screen.getByRole("banner");
    const live = banner.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(document.querySelector('[aria-live="assertive"]')).toBeNull();
    expect(within(banner).queryByRole("alert")).not.toBeInTheDocument();
    // Nothing is announced for what was already there when the page opened.
    expect(live).toHaveTextContent("");

    backend.state.notifications = demoNotifications([WILLOW, LINEN]).slice(0, 1);
    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });

    await vi.waitFor(() => {
      expect(live).toHaveTextContent("1 new notification: New incident: Automation gave up");
    });
    expect(await bell("Notifications, 1 unread")).toBeInTheDocument();
    expect(document.querySelector('[aria-live="assertive"]')).toBeNull();
    act(() => {
      focusManager.setFocused(undefined);
    });
  });
});
