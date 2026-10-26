import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import {
  creationOptions,
  credentialJson,
  deviceName,
  requestOptions,
} from "../../shared/lib/passkeys.ts";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend, type FakeState } from "../../test/fakeApi.ts";

// Passkeys as a second factor (platform issue #113): Settings › Security adds and removes them,
// the sign-in's second step offers one first with "Use a code instead", and a browser without
// WebAuthn keeps the authenticator app only. The browser's WebAuthn API is mocked here.

const owner = { signedIn: true, enrolled: true, assurance: "aal2", passkeysOffered: true } as const;

function bytes(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer;
}

/** A fake `PublicKeyCredential` like the browser's, with `toJSON()` (WebAuthn Level 3). */
function fakeCredential(kind: "create" | "get") {
  return {
    id: "cred-1",
    type: "public-key",
    rawId: bytes("cred-1"),
    authenticatorAttachment: "platform",
    response: { clientDataJSON: bytes(`{"type":"webauthn.${kind}"}`) },
    getClientExtensionResults: () => ({}),
    toJSON: () => ({ id: "cred-1", rawId: "Y3JlZC0x", type: "public-key", response: { kind } }),
  };
}

const credentials = {
  create: vi.fn((options: CredentialCreationOptions) =>
    Promise.resolve(options.publicKey === undefined ? null : fakeCredential("create")),
  ),
  get: vi.fn((options: CredentialRequestOptions) =>
    Promise.resolve(options.publicKey === undefined ? null : fakeCredential("get")),
  ),
};

/** The browser's `PublicKeyCredential` interface; only its presence matters here. */
class FakePublicKeyCredential {
  readonly type = "public-key";
}

function withWebAuthn(supported = true) {
  vi.stubGlobal("PublicKeyCredential", supported ? FakePublicKeyCredential : undefined);
  Object.defineProperty(navigator, "credentials", {
    configurable: true,
    value: supported ? credentials : undefined,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(navigator, "credentials", { configurable: true, value: undefined });
  credentials.create.mockClear();
  credentials.get.mockClear();
});

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

describe("Settings › Security: passkeys", () => {
  it("adds a named passkey with the device's prompt", async () => {
    withWebAuthn();
    const { user, backend } = await open("/settings/security", owner);
    const panel = await screen.findByRole("region", { name: "Biometric sign-in" });

    await user.click(
      within(panel).getByRole("button", { name: "Add biometric sign-in (passkey)" }),
    );
    const name = within(panel).getByLabelText(/Name this passkey/);
    await user.clear(name);
    await user.type(name, "Work laptop");
    await user.click(within(panel).getByRole("button", { name: "Continue" }));

    const list = await within(panel).findByRole("list", { name: "Passkeys" });
    expect(within(list).getByText("Work laptop")).toBeInTheDocument();
    expect(credentials.create).toHaveBeenCalledTimes(1);
    const publicKey = credentials.create.mock.calls[0]?.[0].publicKey;
    expect(publicKey?.challenge).toBeInstanceOf(ArrayBuffer);
    expect(backend.state.passkeyCredentials).toEqual([
      { id: "cred-1", rawId: "Y3JlZC0x", type: "public-key", response: { kind: "create" } },
    ]);
    expect(await screen.findByText('Passkey "Work laptop" added.')).toBeInTheDocument();
  });

  it("keeps several passkeys and removes one after asking", async () => {
    withWebAuthn();
    const { user, backend } = await open("/settings/security", {
      ...owner,
      passkeys: [
        { id: "pk-1", name: "iPhone" },
        { id: "pk-2", name: "Mac" },
      ],
    });
    const list = await screen.findByRole("list", { name: "Passkeys" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);

    await user.click(within(list).getByRole("button", { name: "Remove Mac" }));
    await user.click(within(list).getByRole("button", { name: "Remove" }));

    await vi.waitFor(() => {
      expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    });
    expect(backend.state.passkeys).toEqual([{ id: "pk-1", name: "iPhone" }]);
  });

  it("says so when the prompt was cancelled, and nothing is added", async () => {
    withWebAuthn();
    credentials.create.mockRejectedValueOnce(new DOMException("closed", "NotAllowedError"));
    const { user, backend } = await open("/settings/security", owner);
    const panel = await screen.findByRole("region", { name: "Biometric sign-in" });
    await user.click(
      within(panel).getByRole("button", { name: "Add biometric sign-in (passkey)" }),
    );
    await user.click(within(panel).getByRole("button", { name: "Continue" }));

    expect(await within(panel).findByText("Cancelled. Nothing was changed.")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(backend.state.passkeys).toEqual([]);
  });

  it("needs a session confirmed with the second factor (step-up)", async () => {
    withWebAuthn();
    const { user } = await open("/settings/security", {
      ...owner,
      role: "support",
      assurance: "aal1",
    });
    const panel = await screen.findByRole("region", { name: "Biometric sign-in" });
    await user.click(
      within(panel).getByRole("button", { name: "Add biometric sign-in (passkey)" }),
    );
    await user.click(within(panel).getByRole("button", { name: "Continue" }));
    expect(
      await within(panel).findByText("Confirm with your authenticator app first, then try again."),
    ).toHaveAttribute("role", "alert");
    expect(credentials.create).not.toHaveBeenCalled();
  });

  it("explains a browser without passkeys and keeps the app", async () => {
    withWebAuthn(false);
    await open("/settings/security", owner);
    const panel = await screen.findByRole("region", { name: "Biometric sign-in" });
    expect(
      within(panel).getByText(/This browser or device cannot use passkeys/),
    ).toBeInTheDocument();
    expect(
      within(panel).queryByRole("button", { name: "Add biometric sign-in (passkey)" }),
    ).toBeNull();
    expect(screen.getByText("Authenticator app is set up")).toBeInTheDocument();
  });

  it("is hidden while the server does not offer passkeys", async () => {
    withWebAuthn();
    await open("/settings/security", { ...owner, passkeysOffered: false });
    await screen.findByText("Authenticator app is set up");
    expect(screen.queryByRole("region", { name: "Biometric sign-in" })).toBeNull();
  });

  it("never says WebAuthn, in English or Hebrew", async () => {
    withWebAuthn();
    await open("/settings/security", owner, "he");
    await screen.findByRole("region", { name: "כניסה ביומטרית" });
    expect(document.body.textContent).not.toMatch(/webauthn/i);
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });
});

describe("sign-in: the second step with a passkey", () => {
  const atSignIn: Partial<FakeState> = {
    signedIn: true,
    enrolled: true,
    assurance: "aal1",
    passkeysOffered: true,
    passkeys: [{ id: "pk-1", name: "iPhone" }],
  };

  it("offers the passkey first, and it signs in", async () => {
    withWebAuthn();
    const { user, backend } = await open("/", atSignIn);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Confirm it is you" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm with Face ID / fingerprint" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
    expect(credentials.get).toHaveBeenCalledTimes(1);
    expect(backend.state.passkeyCredentials).toHaveLength(1);
  });

  it("falls back to the code from the app", async () => {
    withWebAuthn();
    const { user } = await open("/", atSignIn);
    await user.click(await screen.findByRole("button", { name: "Use a code instead" }));
    await user.type(screen.getByLabelText("Code from the app"), "123456");
    await user.click(screen.getByRole("button", { name: "Verify and sign in" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
    expect(credentials.get).not.toHaveBeenCalled();
  });

  it("says a refused passkey was not accepted, and the code still works", async () => {
    withWebAuthn();
    const { user } = await open("/", { ...atSignIn, passkeyRefused: true });
    await user.click(
      await screen.findByRole("button", { name: "Confirm with Face ID / fingerprint" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The passkey was not accepted. Try again.",
    );
    await user.click(screen.getByRole("button", { name: "Use a code instead" }));
    expect(screen.getByLabelText("Code from the app")).toBeInTheDocument();
  });

  it("asks for the code when this browser cannot use passkeys", async () => {
    withWebAuthn(false);
    await open("/", atSignIn);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Two-step code" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Use Face ID / fingerprint instead" })).toBeNull();
  });
});

describe("the browser part", () => {
  it("turns Supabase's base64url options into buffers", () => {
    const created = creationOptions({
      publicKey: {
        challenge: "AQID",
        rp: { id: "localhost", name: "HTCO" },
        user: { id: "dXNlcg", name: "owner", displayName: "Owner" },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        excludeCredentials: [{ type: "public-key", id: "AAEC" }],
      },
    });
    expect(new Uint8Array(created.challenge as ArrayBuffer)).toEqual(new Uint8Array([1, 2, 3]));
    expect(new TextDecoder().decode(created.user.id as ArrayBuffer)).toBe("user");
    expect(new Uint8Array(created.excludeCredentials?.[0]?.id as ArrayBuffer)).toEqual(
      new Uint8Array([0, 1, 2]),
    );
    const requested = requestOptions({
      publicKey: { challenge: "AQID", allowCredentials: [{ type: "public-key", id: "AAEC" }] },
    });
    expect(requested.allowCredentials).toHaveLength(1);
  });

  it("writes the credential as JSON by hand when the browser has no toJSON()", () => {
    const credential = {
      id: "cred",
      type: "public-key",
      rawId: new Uint8Array([255, 254]).buffer,
      authenticatorAttachment: null,
      response: {
        clientDataJSON: new Uint8Array([1]).buffer,
        authenticatorData: new Uint8Array([2]).buffer,
        signature: new Uint8Array([3]).buffer,
        userHandle: null,
      },
      getClientExtensionResults: () => ({}),
    } as unknown as PublicKeyCredential;
    expect(credentialJson(credential)).toEqual({
      id: "cred",
      rawId: "__4",
      type: "public-key",
      response: { clientDataJSON: "AQ", authenticatorData: "Ag", signature: "Aw" },
      clientExtensionResults: {},
    });
  });

  it("suggests a name from the device", () => {
    expect(deviceName("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("iPhone");
    expect(deviceName("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("Windows");
    expect(deviceName("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)")).toBe("Mac");
  });
});
