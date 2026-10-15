import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend } from "../../test/fakeApi.ts";

async function open(path: string, locale: "en" | "he" = "en") {
  const backend = fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2" });
  const history = createMemoryHistory({ initialEntries: [path] });
  render(
    <App
      locale={locale}
      theme="system"
      storage={memoryStorage()}
      history={history}
      api={backend.client}
    />,
  );
  await screen.findByRole("heading", { level: 1 });
  return { user: userEvent.setup(), backend, history };
}

const frame = () => screen.getByRole("region", { name: "Demo — coming soon" });

/** The shell's top bar: the header that holds the page title. */
function topBar(): HTMLElement {
  const bar = screen.getByRole("heading", { level: 1 }).closest("header");
  if (bar === null) throw new Error("No top bar");
  return bar;
}

/** The shell's toast: a polite live region at the bottom. */
async function toastSays(text: string) {
  const region = document.querySelector("[aria-live='polite'][aria-atomic='true']");
  await vi.waitFor(() => {
    expect(region).toHaveTextContent(text);
  });
}

describe("the office demo frames (Design 1C)", () => {
  it.each([
    ["/office/floor", "Floor"],
    ["/office/chat", "Maya"],
    ["/office/team", "Late orders + tracking sync failure"],
    ["/office/aiops", "AI ops"],
    ["/office/eng", "Engineering"],
  ])("%s shows the demo's full screen under a large Demo label", async (path, title) => {
    await open(path);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    const banner = topBar();
    expect(within(banner).getByText("DEMO")).toBeInTheDocument();
    expect(within(banner).getByText("Sample data · coming soon")).toBeInTheDocument();
    expect(frame()).toBeInTheDocument();
  });

  it("labels the frame in Hebrew", async () => {
    await open("/office/aiops", "he");
    const region = screen.getByRole("region", { name: "דמו — בקרוב" });
    expect(within(topBar()).getByText("דמו")).toBeInTheDocument();
    expect(within(region).getByRole("heading", { level: 2, name: "תקציב AI" })).toBeInTheDocument();
  });

  it("does nothing on an action: no request, no navigation, a 'coming soon' toast", async () => {
    const { user, backend, history } = await open("/office/chat");
    const before = backend.requests.length;

    await user.click(within(frame()).getByRole("button", { name: "Approve" }));
    await user.click(within(frame()).getByRole("button", { name: "Send" }));

    await toastSays("Demo — coming soon");
    expect(backend.requests.length).toBe(before);
    expect(history.location.pathname).toBe("/office/chat");
  });

  it("lets the owner look around: another conversation opens its thread", async () => {
    const { user } = await open("/office/chat");

    await user.click(within(frame()).getByRole("button", { name: /^Noa/ }));

    expect(screen.getByRole("heading", { level: 1, name: "Noa" })).toBeInTheDocument();
    expect(within(frame()).getByText("Current task")).toBeInTheDocument();
  });

  it("shows agents talking in the team room, with typing dots, and joining stays a demo", async () => {
    const { user } = await open("/office/team");

    expect(within(frame()).getByRole("img", { name: "Amir is typing…" })).toBeInTheDocument();
    await user.click(within(frame()).getByRole("button", { name: "Join conversation" }));
    await toastSays("Demo — coming soon");

    await user.click(within(frame()).getByRole("button", { name: /^New star map mockups/ }));
    expect(
      screen.getByRole("heading", { level: 1, name: "New star map mockups" }),
    ).toBeInTheDocument();
    expect(within(frame()).getByText(/Thread closed/)).toBeInTheDocument();
  });

  it("falls back to the floor's list view without WebGL", async () => {
    const { user } = await open("/office/floor");

    expect(within(frame()).getByText("No WebGL · list view")).toBeInTheDocument();
    expect(within(frame()).getByRole("radio", { name: "Map" })).toBeDisabled();
    expect(within(frame()).getByRole("radio", { name: "List" })).toBeChecked();

    await user.click(within(frame()).getByRole("button", { name: /Engineering$/ }));
    expect(within(frame()).getByRole("button", { name: /Engineering$/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(frame()).getAllByText("Engineering").length).toBeGreaterThan(1);
  });
});
