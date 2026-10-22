import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "../../app/App.tsx";
import { safeRedirect } from "../../shared/api/api.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, type FakeState } from "../../test/fakeApi.ts";

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

async function signIn(
  user: ReturnType<typeof userEvent.setup>,
  password = "correct horse battery",
) {
  await user.type(screen.getByLabelText("Email"), "owner@example.test");
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

describe("signing in", () => {
  it("sends a signed-out visitor to the sign-in page, and back afterwards", async () => {
    await open("/shops");
    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
  });

  it("opens the front door at the bare address for a signed-out visitor", async () => {
    await open("/");
    expect(
      screen.getByRole("heading", { level: 1, name: "Your shop runs. You decide." }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open the web app" })[0]).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });

  it("says the email or password is wrong, without saying which", async () => {
    const { user } = await open("/sign-in");
    await signIn(user, "wrong password");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The email or the password is wrong.",
    );
  });

  it("asks to wait after too many attempts", async () => {
    const { user } = await open("/sign-in", { failures: 5 });
    await signIn(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(/Too many attempts/);
  });

  it("sends the CSRF header and keeps no token in the browser (AC-3.5.1)", async () => {
    const { user, backend } = await open("/sign-in", { role: "support" });
    await signIn(user);
    await screen.findByRole("heading", { level: 1, name: "Home" });

    const signInRequest = backend.requests.find((r) => r.url.endsWith("/v1/auth/sign-in"));
    expect(signInRequest?.headers.get("X-HTCO-CSRF")).toBe("1");
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });

  it("returns to the page the visitor asked for", async () => {
    const { user } = await open("/shops", { role: "support" });
    await signIn(user);
    expect(await screen.findByRole("heading", { level: 1, name: "Shops" })).toBeInTheDocument();
  });

  it("never follows a redirect to another site", () => {
    expect(safeRedirect("//evil.example/x")).toBe("/");
    expect(safeRedirect("https://evil.example")).toBe("/");
    expect(safeRedirect("/\\evil.example")).toBe("/");
    expect(safeRedirect("/shops")).toBe("/shops");
  });

  it("goes back to sign-in when the session ends on the server", async () => {
    const { user, backend } = await open("/", { signedIn: true, role: "support" });
    backend.state.signedIn = false;

    await user.click(screen.getByRole("button", { name: "Account" }));
    await user.click(screen.getByRole("menuitem", { name: "Security" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
  });

  it("signs in in Hebrew, right to left", async () => {
    await open("/sign-in", {}, "he");
    expect(screen.getByRole("heading", { level: 1, name: "כניסה" })).toBeInTheDocument();
    expect(document.documentElement.dir).toBe("rtl");
  });
});

describe("the second factor for Owners and Admins (AC-3.5.3)", () => {
  it("sends an Owner without an authenticator app to set one up before anything else", async () => {
    const { user } = await open("/sign-in");
    await signIn(user);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Set up your authenticator app" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show the QR code" }));
    expect(await screen.findByRole("img", { name: /QR code/ })).toBeInTheDocument();
    expect(screen.getByText("JBSWY3DPEHPK3PXP")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Code from the app"), "000000");
    await user.click(screen.getByRole("button", { name: "Verify and sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The code is wrong or expired.");

    await user.clear(screen.getByLabelText("Code from the app"));
    await user.type(screen.getByLabelText("Code from the app"), "123456");
    await user.click(screen.getByRole("button", { name: "Verify and sign in" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
  });

  it("asks an enrolled Owner for the code before the dashboard", async () => {
    const { user } = await open("/", { signedIn: true, enrolled: true, assurance: "aal1" });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Two-step code" }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Code from the app"), "123456");
    await user.click(screen.getByRole("button", { name: "Verify and sign in" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
  });

  it("lets other roles in without a second factor", async () => {
    await open("/", { signedIn: true, role: "support" });
    expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
  });
});

describe("an account without an organization", () => {
  it("explains that an invitation is needed, and offers to sign out", async () => {
    const { user, backend } = await open("/", { signedIn: true, member: false });

    expect(
      await screen.findByRole("heading", { level: 1, name: "You are not in a workspace yet" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
    expect(backend.state.signedIn).toBe(false);
  });
});

describe("signing out when the API is unavailable", () => {
  it("keeps the user signed in and says so, from the account menu", async () => {
    const { user, backend } = await open("/", {
      signedIn: true,
      enrolled: true,
      assurance: "aal2",
      signOutFails: true,
    });

    await user.click(screen.getByRole("button", { name: "Account" }));
    await user.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You are still signed in. Try signing out again shortly.",
    );
    expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
    expect(backend.state.signedIn).toBe(true);
  });

  it("keeps the user signed in and says so, without a workspace", async () => {
    const { user } = await open("/", { signedIn: true, member: false, signOutFails: true });

    await screen.findByRole("heading", { level: 1, name: "You are not in a workspace yet" });
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(
      await screen.findByText("You are still signed in. Try signing out again shortly."),
    ).toHaveAttribute("role", "alert");
  });
});

describe("security settings", () => {
  const ready = { signedIn: true, enrolled: true, assurance: "aal2" } as const;

  it("lists this user's devices and signs another one out (AC-3.5.4)", async () => {
    const { user, backend } = await open("/settings/security", ready);

    const devices = await screen.findByRole("list", { name: "Signed-in devices" });
    expect(within(devices).getAllByRole("listitem")).toHaveLength(2);
    expect(within(devices).getByText("This device")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign out Chrome on Android" }));

    expect(await within(devices).findAllByRole("listitem")).toHaveLength(1);
    expect(backend.state.sessions.find((s) => !s.current)?.revoked).toBe(true);
  });

  it("shows the authenticator app as set up", async () => {
    await open("/settings/security", ready);
    expect(await screen.findByText("Authenticator app is set up")).toBeInTheDocument();
  });

  it("signs out from the account menu", async () => {
    const { user, backend } = await open("/", ready);

    await user.click(screen.getByRole("button", { name: "Account" }));
    await user.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
    expect(backend.state.signedIn).toBe(false);
  });
});
