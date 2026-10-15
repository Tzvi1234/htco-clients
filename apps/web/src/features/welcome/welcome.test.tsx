import { createMemoryHistory } from "@tanstack/react-router";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend } from "../../test/fakeApi.ts";

async function open() {
  const storage = memoryStorage();
  render(
    <App
      locale="en"
      theme="system"
      storage={storage}
      history={createMemoryHistory({ initialEntries: ["/welcome"] })}
      api={fakeBackend().client}
    />,
  );
  await screen.findByRole("heading", { level: 1, name: "Your shop runs. You decide." });
  return { user: userEvent.setup(), storage };
}

describe("the landing page (Design 1C)", () => {
  it("says what works today and labels the rest as coming", async () => {
    await open();
    const today = screen.getByRole("region", { name: "What works today" });
    expect(within(today).getAllByRole("listitem")).toHaveLength(4);
    const planned = screen.getByRole("region", { name: "What is coming" });
    expect(within(planned).getAllByText("Coming")).toHaveLength(3);
    const apps = screen.getByRole("region", { name: "Apps" });
    expect(within(apps).getByText("Ready today")).toBeInTheDocument();
    expect(within(apps).getAllByText("In development")).toHaveLength(2);
  });

  it("shares the tweaks with the app: one stored preference", async () => {
    const { user, storage } = await open();
    await user.click(screen.getByRole("button", { name: "Design tweaks" }));
    await user.click(await screen.findByRole("radio", { name: "Design 4" }));
    expect(await vi.waitFor(() => document.documentElement.dataset["pal"])).toBe("d4");
    expect(storage.getItem("htco.palette")).toBe("d4");
  });

  it("steps through the renders", async () => {
    const { user } = await open();
    const carousel = screen.getByRole("region", { name: "HT-Commerce renders" });
    expect(within(carousel).getByText("1/5")).toBeInTheDocument();
    await user.click(within(carousel).getByRole("button", { name: "Next render" }));
    expect(within(carousel).getByText("2/5")).toBeInTheDocument();
    await user.click(within(carousel).getByRole("button", { name: "Previous render" }));
    await user.click(within(carousel).getByRole("button", { name: "Previous render" }));
    expect(within(carousel).getByText("5/5")).toBeInTheDocument();
  });

  it("keeps still while focus is inside, even when the pointer leaves", async () => {
    await open();
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    try {
      const carousel = screen.getByRole("region", { name: "HT-Commerce renders" });
      act(() => {
        within(carousel).getByRole("button", { name: "Next render" }).focus();
      });
      fireEvent.mouseEnter(carousel);
      fireEvent.mouseLeave(carousel);
      act(() => {
        vi.advanceTimersByTime(9000);
      });
      expect(within(carousel).getByText("1/5")).toBeInTheDocument();

      act(() => {
        within(carousel).getByRole("button", { name: "Next render" }).blur();
      });
      act(() => {
        vi.advanceTimersByTime(4300);
      });
      expect(within(carousel).getByText("2/5")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
