// Passkeys as a second factor (platform issue #113): the API passes Supabase Auth's WebAuthn
// options and the browser's credential through; the browser part is in shared/lib/passkeys.ts.
import type { ApiClient } from "@htco/api-client";

import { apiError } from "../../shared/api/api.tsx";
import { createPasskey, getPasskey } from "../../shared/lib/passkeys.ts";

/** Adds a passkey on this device: the options, the browser's prompt, then the check. */
export async function addPasskey(api: ApiClient, name: string): Promise<void> {
  const started = await api.POST("/v1/auth/mfa/passkeys", { body: { name } });
  if (started.data === undefined) throw apiError(started.response, started.error);
  const credential = await createPasskey(started.data.options);
  const { error, response } = await api.POST("/v1/auth/mfa/passkeys/{factor_id}/verify", {
    params: { path: { factor_id: started.data.factor_id } },
    body: { challenge_id: started.data.challenge_id, credential },
  });
  if (!response.ok) throw apiError(response, error);
}

/** Confirms it is you with a passkey: the sign-in's second step, or a step-up. */
export async function confirmWithPasskey(api: ApiClient): Promise<void> {
  const challenge = await api.POST("/v1/auth/mfa/passkeys/challenge");
  if (challenge.data === undefined) throw apiError(challenge.response, challenge.error);
  const credential = await getPasskey(challenge.data.options);
  const { error, response } = await api.POST("/v1/auth/step-up/passkey", {
    body: {
      factor_id: challenge.data.factor_id,
      challenge_id: challenge.data.challenge_id,
      credential,
    },
  });
  if (!response.ok) throw apiError(response, error);
}

/** Removes a passkey or an authenticator app (never the last app; the server says so). */
export async function removeFactor(api: ApiClient, factorId: string): Promise<void> {
  const { error, response } = await api.DELETE("/v1/auth/mfa/factors/{factor_id}", {
    params: { path: { factor_id: factorId } },
  });
  if (!response.ok) throw apiError(response, error);
}
