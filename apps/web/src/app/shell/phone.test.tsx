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

/** A pointer event at a given time (jsdom gives every event the current time). */
function at(type: string, clientY: number, timeStamp: number) {
  const event = new MouseEvent(type, { bubbles: true, clientY });
  Object.defineProperty(event, "timeStamp", { value: timeStamp });
  Object.defineProperty(event, "pointerId", { value: 1 });
  return event;
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

  it("closes the sheet on a quick flick after a pause, measuring only the last movement", async () => {
    const user = await open("/settings");
    const bar = screen.getByRole("navigation", { name: "Main" });
    await user.click(within(bar).getByRole("button", { name: "More areas" }));
    const sheet = await screen.findByRole("dialog", { name: "All areas" });
    const grabber = sheet.parentElement?.querySelector('[aria-hidden="true"].sticky');
    if (!(grabber instanceof HTMLElement)) throw new Error("No grabber");
    grabber.setPointerCapture = () => undefined;
    act(() => {
      grabber.dispatchEvent(at("pointerdown", 100, 10_000));
    });
    // A long pause holding the sheet, then a 40 px flick in 20 ms: well under 96 px in all.
    act(() => {
      grabber.dispatchEvent(at("pointermove", 110, 11_000));
    });
    act(() => {
      grabber.dispatchEvent(at("pointermove", 150, 11_020));
    });
    act(() => {
      grabber.dispatchEvent(at("pointerup", 150, 11_030));
    });
    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "All areas" })).not.toBeInTheDocument();
    });
  });

  it("keeps the sheet open after a slow, short drag", async () => {
    const user = await open("/settings");
    const bar = screen.getByRole("navigation", { name: "Main" });
    await user.click(within(bar).getByRole("button", { name: "More areas" }));
    const sheet = await screen.findByRole("dialog", { name: "All areas" });
    const grabber = sheet.parentElement?.querySelector('[aria-hidden="true"].sticky');
    if (!(grabber instanceof HTMLElement)) throw new Error("No grabber");
    grabber.setPointerCapture = () => undefined;
    // 40 px over a second and a half: neither far enough nor a flick.
    act(() => {
      grabber.dispatchEvent(at("pointerdown", 100, 10_000));
    });
    act(() => {
      grabber.dispatchEvent(at("pointermove", 140, 11_500));
    });
    act(() => {
      grabber.dispatchEvent(at("pointerup", 140, 11_600));
    });
    expect(screen.getByRole("dialog", { name: "All areas" })).toBeInTheDocument();
  });
});
