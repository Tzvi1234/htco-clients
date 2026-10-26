# Passkeys as a second factor (web)

| | |
|---|---|
| **Issue** | [htco-platform#113](https://github.com/Tzvi1234/htco-platform/issues/113) |
| **Platform part** | [htco-platform#171](https://github.com/Tzvi1234/htco-platform/pull/171), design and switch-on steps in the platform's `docs/features/identity-access/passkeys.md` |
| **Status** | Built; shown only when the API offers passkeys (`GET /v1/auth/mfa` → `passkeys: true`), which stays off in production until the owner enables Supabase's WebAuthn MFA add-on |

## What the user sees

- **Settings › Security**, beside the signed-in devices: a "Biometric sign-in" panel.
  - It lists the user's passkeys by name, each with "Remove", which asks once ("Remove" / "Keep").
  - "Add biometric sign-in (passkey)" asks for a name (prefilled from the device: iPhone, Mac, Windows, Android) and then opens the device's own prompt (Face ID, Touch ID, Windows Hello, fingerprint).
  - The authenticator app stays: the server never removes the last one. The panel says so if asked.
  - A browser without passkeys sees a plain explanation instead of the button. A user without an authenticator app is told to set one up first.
- **The sign-in's second step.** With a passkey and a browser that can use it, the step offers "Confirm with Face ID / fingerprint" first, with "Use a code instead". The code screen offers "Use Face ID / fingerprint instead" back.
- **The bell.** A removed factor reads "A second factor was removed" (the last one can never go, so two-step sign-in is never turned off this way).

The UI never says "WebAuthn": it says "passkey" or "biometric".

## How it works

- `shared/lib/passkeys.ts` turns the API's options (Supabase Auth's JSON with base64url strings) into what `navigator.credentials.create/get` wants, and the credential back into JSON (`toJSON()` where the browser has it, the same shape by hand otherwise). A cancelled prompt, an unsupported device and any other failure are three `PasskeyError` kinds with their own words.
- `features/security/passkeysApi.ts`: add (start, prompt, verify), confirm (challenge, prompt, step-up) and remove. The security feature exports what the sign-in step uses (`features/security/index.ts`).
- Nothing about the credential is logged or stored in the browser.

## Review in the browser

`?demo=shops` (or `?demo`) shows Settings › Security with one passkey; `?demo=passkey` shows the sign-in step with the passkey first. The demo's WebAuthn prompt is the real browser's, so on a machine without a platform authenticator it reports "cannot use passkeys" or "cancelled".

## Tests

`features/security/passkeys.test.tsx`, with WebAuthn mocked:
- enrolment with a name;
- several passkeys and a removal;
- a cancelled prompt, and the step-up refusal;
- an unsupported browser, and the server switched off;
- Hebrew with no "WebAuthn";
- passkey sign-in, the code fallback, a refused passkey, and the code step on a browser without passkeys;
- the options and credential conversions, and the device name.
