import { createMemoryHistory } from "@tanstack/react-router";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App.tsx";
import type { Locale } from "../shared/i18n/locale.ts";
import { memoryStorage, type SettingsStorage } from "../shared/lib/storage.ts";
import type { ThemePreference } from "../shared/theme/theme.ts";
import { fakeBackend } from "../test/fakeApi.ts";

interface Options {
  path?: string;
  locale?: Locale;
  theme?: ThemePreference;
  storage?: SettingsStorage;
}

async function renderApp({
  path = "/",
  locale = "en",
  theme = "system",
  storage = memoryStorage(),
}: Options = {}) {
  const history = createMemoryHistory({ initialEntries: [path] });
  // A signed-in Owner whose session already has the second factor (slice 3.5).
  const backend = fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2" });
  render(
    <App locale={locale} theme={theme} storage={storage} history={history} api={backend.client} />,
  );
  await screen.findByRole("heading", { level: 1 });
  return { user: userEvent.setup(), storage, history };
}

const root = document.documentElement;

describe("the app shell", () => {
  it("shows the overview with the main navigation", async () => {
    await renderApp();

    expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    // The other areas wait closed, their tabs out of reach until opened (Design 1C).
    expect(within(nav).getByRole("button", { name: "Commerce" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(within(nav).queryByRole("link", { name: "Shops" })).not.toBeInTheDocument();
  });

  it("navigates between destinations", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Commerce" }));
    await user.click(screen.getByRole("link", { name: "Shops" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Shops" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shops" })).toHaveAttribute("aria-current", "page");
  });

  it("starts right-to-left in Hebrew", async () => {
    await renderApp({ locale: "he" });

    expect([root.lang, root.dir]).toEqual(["he", "rtl"]);
    expect(screen.getByRole("heading", { level: 1, name: "בית" })).toBeInTheDocument();
  });

  it("switches to Hebrew and back in Settings, where the language lives (AC-3.3.1)", async () => {
    const { user, storage } = await renderApp({ path: "/settings" });

    await user.click(screen.getByRole("radio", { name: /^עברית/ }));

    expect([root.lang, root.dir]).toEqual(["he", "rtl"]);
    expect(screen.getByRole("heading", { level: 1, name: "הגדרות" })).toBeInTheDocument();
    expect(storage.getItem("htco.locale")).toBe("he");

    await user.click(screen.getByRole("radio", { name: /^English/ }));

    expect([root.lang, root.dir]).toEqual(["en", "ltr"]);
    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
  });

  it("keeps personalisation out of the account menu: it leads to Settings", async () => {
    const { user, history } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Account" }));
    expect(screen.queryByRole("menuitemradio")).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Settings" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
    expect(history.location.pathname).toBe("/settings");
  });

  it("follows the system theme until the user picks one, then remembers it (AC-3.3.3)", async () => {
    const { user, storage } = await renderApp({ path: "/settings" });
    expect(root.hasAttribute("data-theme")).toBe(false);

    await user.click(screen.getByRole("radio", { name: "Dark" }));

    expect(root.dataset["theme"]).toBe("dark");
    expect(storage.getItem("htco.theme")).toBe("dark");

    await user.click(screen.getByRole("radio", { name: /^System/ }));

    expect(root.hasAttribute("data-theme")).toBe(false);
  });

  it("says so when the browser goes offline, and clears it when back online", async () => {
    const online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    await renderApp();
    expect(screen.queryByText(/You are offline/)).not.toBeInTheDocument();

    online.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toHaveTextContent("You are offline");

    online.mockReturnValue(true);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.queryByText(/You are offline/)).not.toBeInTheDocument();
  });

  it("shows a way back for an unknown address", async () => {
    const { user } = await renderApp({ path: "/no-such-page" });

    expect(screen.getByRole("alert")).toHaveTextContent("Page not found");
    await user.click(screen.getByRole("button", { name: "Go to Home" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
  });
});
