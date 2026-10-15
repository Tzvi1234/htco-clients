import { createMemoryHistory } from "@tanstack/react-router";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { memoryStorage } from "../../shared/lib/storage.ts";
import { PHONE_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { fakeBackend } from "../../test/fakeApi.ts";
import { App } from "../App.tsx";

function phone() {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === PHONE_QUERY,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
});

async function open(path = "/") {
  phone();
  const backend = fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2" });
  render(
    <App
      locale="en"
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: [path] })}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 }, { timeout: 3000 });
  return userEvent.setup();
}

describe("the phone shell (iOS-style, Design 1C)", () => {
  it("shrinks the large title into an inline one once the page scrolls", async () => {
    await open("/");
    const header = screen.getByRole("heading", { level: 1 }).closest("header");
    expect(header).not.toHaveAttribute("data-scrolled");

    Object.defineProperty(window, "scrollY", { value: 200, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveAttribute("data-scrolled");

    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).not.toHaveAttribute("data-scrolled");
  });

  it("keeps one current item on the tab bar, and closes the sheet from its grabber", async () => {
    const user = await open("/settings");
    const bar = screen.getByRole("navigation", { name: "Main" });
    // Settings is off the bar, so "More" carries the current mark.
    expect(within(bar).queryByRole("link", { current: "page" })).not.toBeInTheDocument();

    await user.click(within(bar).getByRole("button", { name: "More areas" }));
    const sheet = await screen.findByRole("dialog", { name: "All areas" });
    const grabber = sheet.parentElement?.querySelector('[aria-hidden="true"].sticky');
    expect(grabber).toBeInstanceOf(HTMLElement);
    if (!(grabber instanceof HTMLElement)) return;
    grabber.setPointerCapture = () => undefined;
    fireEvent.pointerDown(grabber, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(grabber, { clientY: 260, pointerId: 1 });
    fireEvent.pointerUp(grabber, { clientY: 260, pointerId: 1 });
    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "All areas" })).not.toBeInTheDocument();
    });
  });
});
