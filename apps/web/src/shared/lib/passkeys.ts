// Passkeys in the browser (issue #113): the options Supabase Auth makes come through the API as
// JSON with base64url strings; the browser wants ArrayBuffers, and its credential goes back as
// JSON. Nothing here is logged or kept: the options and the credential only pass through.

type Json = Record<string, unknown>;

/** Can this browser make and use passkeys at all? */
export function passkeysSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential === "function" &&
    typeof navigator.credentials.create === "function" &&
    typeof navigator.credentials.get === "function"
  );
}

function fromBase64Url(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function toBase64Url(buffer: ArrayBuffer | null | undefined): string | undefined {
  if (buffer === null || buffer === undefined) return undefined;
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Supabase Auth (go-webauthn) wraps the options in `publicKey`. */
function publicKeyOf(options: Json): Json {
  const inner = options["publicKey"];
  return typeof inner === "object" && inner !== null ? (inner as Json) : options;
}

function descriptors(list: unknown): PublicKeyCredentialDescriptor[] | undefined {
  if (!Array.isArray(list)) return undefined;
  return list.map((item: Json) => ({
    ...(item as unknown as PublicKeyCredentialDescriptor),
    id: fromBase64Url(String(item["id"])),
  }));
}

export function creationOptions(options: Json): PublicKeyCredentialCreationOptions {
  const key = publicKeyOf(options);
  const user = key["user"] as Json;
  const exclude = descriptors(key["excludeCredentials"]);
  return {
    ...(key as unknown as PublicKeyCredentialCreationOptions),
    challenge: fromBase64Url(String(key["challenge"])),
    user: {
      ...(user as unknown as PublicKeyCredentialUserEntity),
      id: fromBase64Url(String(user["id"])),
    },
    ...(exclude === undefined ? {} : { excludeCredentials: exclude }),
  };
}

export function requestOptions(options: Json): PublicKeyCredentialRequestOptions {
  const key = publicKeyOf(options);
  const allow = descriptors(key["allowCredentials"]);
  return {
    ...(key as unknown as PublicKeyCredentialRequestOptions),
    challenge: fromBase64Url(String(key["challenge"])),
    ...(allow === undefined ? {} : { allowCredentials: allow }),
  };
}

/** The credential as JSON (WebAuthn Level 3 `toJSON()`, or the same shape by hand). */
export function credentialJson(credential: PublicKeyCredential): Json {
  const withJson = credential as unknown as { toJSON?: () => Json };
  if (typeof withJson.toJSON === "function") return withJson.toJSON();
  const response = credential.response as AuthenticatorResponse & {
    attestationObject?: ArrayBuffer;
    authenticatorData?: ArrayBuffer;
    signature?: ArrayBuffer;
    userHandle?: ArrayBuffer | null;
    getTransports?: () => string[];
  };
  const body: Json = { clientDataJSON: toBase64Url(response.clientDataJSON) };
  if (response.attestationObject !== undefined) {
    body["attestationObject"] = toBase64Url(response.attestationObject);
    body["transports"] = response.getTransports?.() ?? [];
  }
  if (response.authenticatorData !== undefined) {
    body["authenticatorData"] = toBase64Url(response.authenticatorData);
    body["signature"] = toBase64Url(response.signature);
    const handle = toBase64Url(response.userHandle);
    if (handle !== undefined) body["userHandle"] = handle;
  }
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    response: body,
    clientExtensionResults: credential.getClientExtensionResults(),
    ...(credential.authenticatorAttachment == null
      ? {}
      : { authenticatorAttachment: credential.authenticatorAttachment }),
  };
}

/** Why the browser did not give a passkey: the person cancelled, or it cannot here. */
export type PasskeyProblem = "cancelled" | "unsupported" | "failed";

export class PasskeyError extends Error {
  readonly problem: PasskeyProblem;

  constructor(problem: PasskeyProblem) {
    super(problem);
    this.name = "PasskeyError";
    this.problem = problem;
  }
}

function problemOf(error: unknown): PasskeyProblem {
  if (error instanceof DOMException) {
    // The person closed the prompt, the time ran out, or no passkey of this site is on the device.
    if (error.name === "NotAllowedError" || error.name === "AbortError") return "cancelled";
    if (error.name === "NotSupportedError" || error.name === "SecurityError") return "unsupported";
  }
  return "failed";
}

async function ask(run: () => Promise<Credential | null>): Promise<Json> {
  if (!passkeysSupported()) throw new PasskeyError("unsupported");
  let credential: Credential | null;
  try {
    credential = await run();
  } catch (error) {
    throw new PasskeyError(problemOf(error));
  }
  if (credential === null) throw new PasskeyError("cancelled");
  return credentialJson(credential as PublicKeyCredential);
}

/** Makes a new passkey on this device from Supabase Auth's creation options. */
export function createPasskey(options: Json): Promise<Json> {
  return ask(() => navigator.credentials.create({ publicKey: creationOptions(options) }));
}

/** Uses a passkey of this device with Supabase Auth's request options. */
export function getPasskey(options: Json): Promise<Json> {
  return ask(() => navigator.credentials.get({ publicKey: requestOptions(options) }));
}

/** A starting name for a new passkey, from the device it is made on. */
export function deviceName(userAgent: string = navigator.userAgent): string {
  if (/iPhone/i.test(userAgent)) return "iPhone";
  if (/iPad/i.test(userAgent)) return "iPad";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "Mac";
  if (/Windows/i.test(userAgent)) return "Windows";
  return "Passkey";
}
