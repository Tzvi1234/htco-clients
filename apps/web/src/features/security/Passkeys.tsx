import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type SyntheticEvent } from "react";

import { addPasskey, removeFactor } from "./passkeysApi.ts";
import { ApiError, authKeys, mfaQuery, useApi } from "../../shared/api/api.tsx";
import { PasskeyError, deviceName, passkeysSupported } from "../../shared/lib/passkeys.ts";
import { Link } from "@tanstack/react-router";

import { Button, buttonStyle } from "../../shared/ui/Button.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { TextField } from "../../shared/ui/TextField.tsx";
import { PasskeyGlyph, FlowBody, ListRow, Note, PlusGlyph } from "../../shared/ui/kit/index.ts";

/** Plain words for a passkey that did not work, here or at sign-in. Never the word "WebAuthn".
 * At sign-in a refused prompt (an unknown key, a timeout, a dismissed prompt) was not confirmed;
 * "nothing was changed" only fits adding one in Settings (Pixel on #74). */
export function usePasskeyMessage(where: "settings" | "sign-in" = "settings") {
  const { t } = useLingui();
  return (error: Error | null): string | undefined => {
    if (error === null) return undefined;
    if (error instanceof PasskeyError) {
      if (error.problem === "cancelled")
        return where === "sign-in"
          ? t`Not confirmed. Try again, or use a code instead.`
          : t`Cancelled. Nothing was changed.`;
      if (error.problem === "unsupported")
        return t`This browser or device cannot use passkeys. Use your authenticator app.`;
      return t`The passkey did not work. Try again.`;
    }
    if (error instanceof ApiError) {
      if (error.type === "step-up-required")
        return t`Confirm with your authenticator app first, then try again.`;
      if (error.type === "last-factor")
        return t`Keep at least one authenticator app: it is how you sign in if a device is lost.`;
      if (error.type === "passkey-refused") return t`The passkey was not accepted. Try again.`;
      if (error.type === "too-many-attempts")
        return t`Too many attempts. Wait 15 minutes and try again.`;
    }
    return t`This did not work. Try again shortly.`;
  };
}

/**
 * Settings › Security: the user's passkeys (biometric sign-in) next to the authenticator app.
 * Add one on this device with a name, remove one; the app always stays. Hidden when the server
 * does not offer passkeys; explained when this browser cannot use them (issue #113).
 */
export function Passkeys() {
  const { t } = useLingui();
  const api = useApi();
  const queryClient = useQueryClient();
  const mfa = useQuery(mfaQuery(api));
  const message = usePasskeyMessage();
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState(() => deviceName());
  const [confirming, setConfirming] = useState<string | null>(null);
  const [done, setDone] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: authKeys.mfa });
  const add = useMutation({
    mutationFn: (chosen: string) => addPasskey(api, chosen),
    onSuccess: async (_, chosen) => {
      setNaming(false);
      setDone(t`Passkey "${chosen}" added.`);
      await refresh();
    },
  });
  const remove = useMutation({
    mutationFn: (factor: { id: string; name: string }) => removeFactor(api, factor.id),
    onSuccess: async (_, factor) => {
      setConfirming(null);
      setDone(t`Passkey "${factor.name}" removed.`);
      await refresh();
    },
  });

  if (mfa.data?.passkeys !== true) return null;
  const supported = passkeysSupported();
  const passkeys = mfa.data.factors.filter((f) => f.kind === "webauthn" && f.verified);
  const hasApp = mfa.data.factors.some((f) => f.kind === "totp" && f.verified);
  const error = add.error ?? remove.error;

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    const chosen = name.trim();
    if (chosen !== "") add.mutate(chosen);
  }

  return (
    <Panel label={t`Biometric sign-in`}>
      <PanelHeader
        title={<Trans>Biometric sign-in</Trans>}
        meta={passkeys.length === 0 ? undefined : <span className="ltr">{passkeys.length}</span>}
      />
      <FlowBody className="gap-4">
        <p className="m-0 text-body-sm text-secondary">
          <Trans>
            Confirm sign-in with <Brand>Face ID</Brand>, <Brand>Touch ID</Brand>,{" "}
            <Brand>Windows Hello</Brand> or your fingerprint instead of typing a code. Your
            authenticator app stays as the backup.
          </Trans>
        </p>
        {passkeys.length === 0 ? null : (
          <ul aria-label={t`Passkeys`} className="m-0 flex list-none flex-col gap-1 p-0">
            {passkeys.map((passkey) => {
              const label = passkey.name ?? t`Passkey`;
              return (
                <li key={passkey.id} className="flex items-center gap-3 rounded-card py-2">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-line bg-raised">
                    <PasskeyGlyph size={18} />
                  </span>
                  <ListRow className="min-w-0 flex-1 py-0" title={<bdi>{label}</bdi>} />
                  {confirming === passkey.id ? (
                    <span className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        isPending={remove.isPending}
                        onPress={() => {
                          remove.mutate({ id: passkey.id, name: label });
                        }}
                      >
                        <Trans>Remove</Trans>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => {
                          setConfirming(null);
                        }}
                      >
                        <Trans>Keep</Trans>
                      </Button>
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      aria-label={t`Remove ${label}`}
                      onPress={() => {
                        setConfirming(passkey.id);
                        remove.reset();
                      }}
                    >
                      <Trans>Remove</Trans>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {!supported ? (
          <Note icon={<PasskeyGlyph size={16} />}>
            <Trans>
              This browser or device cannot use passkeys. Your authenticator app works as before.
            </Trans>
          </Note>
        ) : !hasApp ? (
          <Note icon={<PasskeyGlyph size={16} />}>
            <Trans>Set up an authenticator app first; then you can add a passkey.</Trans>
          </Note>
        ) : naming ? (
          <form className="flex flex-col gap-3" onSubmit={submit} noValidate>
            <TextField
              label={t`Name this passkey`}
              description={t`So you can tell your devices apart.`}
              value={name}
              onChange={setName}
              maxLength={60}
              isRequired
              autoFocus
            />
            <span className="flex flex-wrap items-center gap-2">
              <Button type="submit" variant="primary" isPending={add.isPending}>
                <PasskeyGlyph size={16} />
                <Trans>Continue</Trans>
              </Button>
              <Button
                variant="ghost"
                onPress={() => {
                  setNaming(false);
                  add.reset();
                }}
              >
                <Trans>Cancel</Trans>
              </Button>
            </span>
          </form>
        ) : (
          <Button
            className="self-start"
            onPress={() => {
              setNaming(true);
              setDone("");
            }}
          >
            <PlusGlyph size={14} />
            <Trans>Add biometric sign-in (passkey)</Trans>
          </Button>
        )}
        {error === null ? null : (
          <p role="alert" className="m-0 text-body-sm text-danger-text">
            {message(error)}
          </p>
        )}
        {/* Codex on #74: a session that needs the second factor gets a way to give it. */}
        {error instanceof ApiError && error.type === "step-up-required" ? (
          <Link to="/security/setup" className={buttonStyle({ size: "sm" }) + " self-start"}>
            <Trans>Confirm it is you</Trans>
          </Link>
        ) : null}
        <p aria-live="polite" className="sr-only">
          {done}
        </p>
      </FlowBody>
    </Panel>
  );
}

/** A product name (Face ID, Windows Hello) kept on one line and isolated in Hebrew. */
export function Brand({ children }: { children: string }) {
  return <bdi className="whitespace-nowrap">{children}</bdi>;
}
