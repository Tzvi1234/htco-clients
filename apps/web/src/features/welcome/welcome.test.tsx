import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
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

  it("follows the palette chosen in the app: one stored preference, no controls of its own", async () => {
    const { storage } = await open();
    expect(screen.queryByRole("button", { name: "Design tweaks" })).not.toBeInTheDocument();

    storage.setItem("htco.palette", "d4");
    window.dispatchEvent(new StorageEvent("storage", { key: "htco.palette", newValue: "d4" }));
    expect(await vi.waitFor(() => document.documentElement.dataset["pal"])).toBe("d4");
  });

  it("keeps the language switch, which a visitor has no Settings for", async () => {
    const { user } = await open();
    await user.click(screen.getByRole("radio", { name: "עברית" }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "החנות רצה. ההחלטה שלך." }),
    ).toBeInTheDocument();
  });

  it("shows the approval example waiting for the owner, honestly labelled as an example", async () => {
    await open();
    const planned = screen.getByRole("region", { name: "What is coming" });
    const decision = within(planned).getByRole("article", {
      name: "Pause the summer sale on four listings?",
    });
    expect(within(decision).getByText("An example of what will ask you")).toBeInTheDocument();
    expect(within(decision).getByText("Needs you")).toBeInTheDocument();
  });

  it("is one flowing page: its sections are not panels, and none scrolls on its own", async () => {
    await open();
    for (const name of ["What works today", "What is coming", "How it works", "Apps"]) {
      const region = screen.getByRole("region", { name });
      expect(region.className, name).not.toMatch(/overflow-(x-)?auto/);
      expect(
        region.querySelector("[class*='overflow-auto'], [class*='overflow-x-auto']"),
      ).toBeNull();
    }
  });
});
