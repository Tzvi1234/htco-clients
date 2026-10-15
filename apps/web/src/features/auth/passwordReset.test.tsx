import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "../../app/App.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, type FakeState } from "../../test/fakeApi.ts";

const SENT = "If an account exists for this email, we sent a link to reset the password.";
const EXPIRED = "This password reset link has expired or was already used. Ask for a new one.";

async function open(path: string, state: Partial<FakeState> = {}, locale: Locale = "en") {
  const backend = fakeBackend(state);
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

describe("forgetting the password (AC-3.5.6)", () => {
  it("links from sign-in to the page that asks for a reset link", async () => {
    const { user } = await open("/sign-in");

    await user.click(screen.getByRole("link", { name: "Forgot your password?" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Reset your password" }),
    ).toBeInTheDocument();
  });

  it("asks for the link and says the same thing whether or not the account exists", async () => {
    const { user, backend } = await open("/forgot-password");

    await user.type(screen.getByLabelText("Email"), "someone@example.test");
    await user.click(screen.getByRole("button", { name: "Send the link" }));

    expect(await screen.findByText(SENT)).toBeInTheDocument();
    expect(backend.state.resetRequests).toEqual(["someone@example.test"]);
    const request = backend.requests.find((r) => r.url.endsWith("/v1/auth/password/forgot"));
    expect(request?.headers.get("X-HTCO-CSRF")).toBe("1");
    expect(screen.getByRole("link", { name: "Back to sign-in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });

  it("does not send an empty email", async () => {
    const { user, backend } = await open("/forgot-password");

    await user.click(screen.getByRole("button", { name: "Send the link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Enter your email.");
    expect(backend.state.resetRequests).toEqual([]);
  });

  it("asks to wait after too many requests", async () => {
    const { user } = await open("/forgot-password", { resetThrottled: true });

    await user.type(screen.getByLabelText("Email"), "owner@example.test");
    await user.click(screen.getByRole("button", { name: "Send the link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many attempts. Wait 15 minutes and try again.",
    );
    expect(screen.queryByText(SENT)).not.toBeInTheDocument();
  });

  it("asks for a reset link in Hebrew, right to left", async () => {
    await open("/forgot-password", {}, "he");
    expect(screen.getByRole("heading", { level: 1, name: "איפוס הסיסמה" })).toBeInTheDocument();
    expect(document.documentElement.dir).toBe("rtl");
  });
});

describe("setting a new password from the emailed link (AC-3.5.6)", () => {
  const link = "/reset-password#access_token=reset-at&refresh_token=reset-rt&type=recovery";

  it("sets the password, signs in and drops the tokens from the address bar", async () => {
    const { user, backend, history } = await open(link, { role: "support" });
    expect(
      screen.getByRole("heading", { level: 1, name: "Choose a new password" }),
    ).toBeInTheDocument();
    expect(history.location.hash).toBe("");

    await user.type(screen.getByLabelText("New password"), "a long new password");
    await user.type(screen.getByLabelText("Repeat the password"), "a long new password");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
    expect(backend.state.reset).toEqual({
      access_token: "reset-at",
      refresh_token: "reset-rt",
      password: "a long new password",
    });
  });

  it("asks for the same password twice", async () => {
    const { user, backend } = await open(link);

    await user.type(screen.getByLabelText("New password"), "a long new password");
    await user.type(screen.getByLabelText("Repeat the password"), "another password!!");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The passwords are not the same.");
    expect(backend.state.reset).toBeUndefined();
  });

  it("checks the password length before sending it", async () => {
    const { user, backend } = await open(link);

    await user.type(screen.getByLabelText("New password"), "too short");
    await user.type(screen.getByLabelText("Repeat the password"), "too short");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Use between 12 and 128 characters.",
    );
    expect(backend.state.reset).toBeUndefined();
  });

  it("says when the password is too weak", async () => {
    const { user } = await open(link);

    await user.type(screen.getByLabelText("New password"), "weak but long enough");
    await user.type(screen.getByLabelText("Repeat the password"), "weak but long enough");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Choose a longer password that is harder to guess.",
    );
  });

  it("says when the link expired, and offers a new one", async () => {
    await open("/reset-password#error=access_denied&error_code=otp_expired&error_description=x");

    expect(screen.getByText(EXPIRED)).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ask for a new link" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("says when the server refuses the link", async () => {
    const { user } = await open(
      "/reset-password#access_token=used-at&refresh_token=used-rt&type=recovery",
    );

    await user.type(screen.getByLabelText("New password"), "a long new password");
    await user.type(screen.getByLabelText("Repeat the password"), "a long new password");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(EXPIRED);
  });

  it("asks a user with an authenticator app for its code, then signs in", async () => {
    const { user, backend } = await open(link, { resetNeedsCode: true, enrolled: true });

    await user.type(screen.getByLabelText("New password"), "a long new password");
    await user.type(screen.getByLabelText("Repeat the password"), "a long new password");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter the 6-digit code from your authenticator app to finish.",
    );
    await user.type(screen.getByLabelText("Code from the app"), "000000");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The code is wrong or expired.");

    await user.clear(screen.getByLabelText("Code from the app"));
    await user.type(screen.getByLabelText("Code from the app"), "123456");
    await user.click(screen.getByRole("button", { name: "Save and sign in" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
    expect(backend.state.reset).toMatchObject({ code: "123456" });
  });
});
