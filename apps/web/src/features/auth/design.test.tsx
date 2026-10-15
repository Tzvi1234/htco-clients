import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "../../app/App.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, type FakeState } from "../../test/fakeApi.ts";

async function open(path: string, state: Partial<FakeState> = {}, locale: Locale = "en") {
  const backend = fakeBackend(state);
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

describe("the sign-in screens (Design 1C)", () => {
  it.each(["en", "he"] as const)(
    "keep the form on the physical left and the office on the right (%s)",
    async (locale) => {
      await open("/sign-in", {}, locale);
      const form = screen.getByRole("main");
      const office = screen.getByRole("complementary");
      // The grid itself is left-to-right; the panels keep the page's direction inside.
      const grid = form.parentElement?.parentElement;
      expect(grid).toHaveAttribute("dir", "ltr");
      expect(form.compareDocumentPosition(office) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(form.parentElement).toHaveAttribute("dir", locale === "he" ? "rtl" : "ltr");
    },
  );

  it("switches the language from the form panel", async () => {
    const { user } = await open("/sign-in");
    await user.click(screen.getByRole("radio", { name: "עברית" }));
    expect(await screen.findByRole("heading", { level: 1, name: "כניסה" })).toBeInTheDocument();
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("puts the forgotten-password link under the password field", async () => {
    await open("/sign-in");
    const password = screen.getByLabelText("Password");
    const link = screen.getByRole("link", { name: "Forgot your password?" });
    expect(password.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("labels the office numbers before sign-in as a demo", async () => {
    await open("/sign-in");
    const office = screen.getByRole("complementary", { name: "Your office" });
    expect(within(office).getByText("Demo")).toBeInTheDocument();
    expect(within(office).getByText("16 AI employees")).toBeInTheDocument();
  });
});

describe("the six code boxes", () => {
  it("take digits only, at most six, and draw each in its box", async () => {
    const { user } = await open("/", { signedIn: true, enrolled: true, assurance: "aal1" });
    await screen.findByRole("heading", { level: 1, name: "Two-step code" });
    const code = screen.getByLabelText("Code from the app");
    expect(code).toHaveAttribute("autocomplete", "one-time-code");
    expect(code).toHaveFocus();

    await user.type(code, "12a3-45678");
    expect(code).toHaveValue("123456");
    const boxes = code.parentElement?.querySelectorAll('span[aria-hidden="true"]') ?? [];
    expect([...boxes].slice(0, 6).map((box) => box.textContent)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
  });

  it("turn red only while they hold the code that was refused", async () => {
    const { user } = await open("/", { signedIn: true, enrolled: true, assurance: "aal1" });
    await screen.findByRole("heading", { level: 1, name: "Two-step code" });
    const code = screen.getByLabelText("Code from the app");

    await user.type(code, "000000");
    await user.click(screen.getByRole("button", { name: "Verify and sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The code is wrong or expired.");
    expect(code).toHaveAttribute("aria-invalid", "true");

    await user.clear(code);
    await user.type(code, "111111");
    expect(code).not.toHaveAttribute("aria-invalid");
  });

  it("go back to sign-in by signing the first step out", async () => {
    const { user, backend } = await open("/", {
      signedIn: true,
      enrolled: true,
      assurance: "aal1",
    });
    await screen.findByRole("heading", { level: 1, name: "Two-step code" });
    await user.click(screen.getByRole("button", { name: "Back to sign-in" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
    expect(backend.state.signedIn).toBe(false);
  });
});
