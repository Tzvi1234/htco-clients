import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { readSetting, memoryStorage, type SettingsStorage } from "../../shared/lib/storage.ts";
import { fakeBackend } from "../../test/fakeApi.ts";
import { App } from "../App.tsx";

async function open(path = "/", storage: SettingsStorage = memoryStorage()) {
  const backend = fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2" });
  const history = createMemoryHistory({ initialEntries: [path] });
  const view = render(
    <App locale="en" theme="system" storage={storage} history={history} api={backend.client} />,
  );
  await screen.findByRole("heading", { level: 1 });
  return { user: userEvent.setup(), storage, history, view };
}

describe("quick actions (design/README.md, UX rule 2)", () => {
  it("opens with Ctrl+K, filters as you type and goes where you choose", async () => {
    const { user } = await open();

    await user.keyboard("{Control>}k{/Control}");
    const dialog = await screen.findByRole("dialog", { name: "Quick actions" });
    await user.type(within(dialog).getByRole("searchbox"), "secur");

    expect(
      within(dialog)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Go to security"]);
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("heading", { level: 1, name: "Security" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens from the sidebar button too", async () => {
    const { user } = await open();
    await user.click(screen.getByRole("button", { name: "Quick actions" }));
    expect(await screen.findByRole("dialog", { name: "Quick actions" })).toBeInTheDocument();
  });
});

describe("the intro (design/README.md, Motion)", () => {
  it("plays once per device, then never blocks or repeats", async () => {
    const storage = memoryStorage();
    const first = await open("/", storage);
    expect(document.querySelector("aside")?.className).toContain("animate-sidebar-in");
    expect(readSetting(storage, "htco.intro")).toBe("relay-1");
    first.view.unmount();

    await open("/", storage);
    expect(document.querySelector("aside")?.className).not.toContain("animate-sidebar-in");
  });
});

describe("the decision ring (design/README.md, The idea)", () => {
  it("is decorative and always sits beside words that say the user is needed", async () => {
    await open();
    const words = screen.getByText("Waiting for you");
    const ring = words.closest("span.relative")?.querySelector("svg");
    expect(ring).toHaveAttribute("aria-hidden", "true");
  });
});

describe("the aura (design/README.md, Backgrounds)", () => {
  it("glows behind the overview but never behind the shops table, and is hidden from readers", async () => {
    const { user } = await open();
    const glow = document.querySelector("main [aria-hidden='true'].pointer-events-none");
    expect(glow).not.toBeNull();

    await user.click(screen.getByRole("link", { name: "Shops" }));
    await screen.findByRole("heading", { level: 1, name: "Shops" });
    expect(document.querySelector("main [aria-hidden='true'].pointer-events-none")).toBeNull();
  });
});

describe("the logo", () => {
  it("is drawn inline with an accessible name, in the theme's colours", async () => {
    await open();
    const [logo] = screen.getAllByRole("img", { name: "HTCO" });
    expect(logo?.tagName.toLowerCase()).toBe("svg");
    expect(logo?.querySelector("circle[r='77']")).toHaveAttribute("fill", "var(--attention-ring)");
  });
});
