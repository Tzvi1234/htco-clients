import { Trans, useLingui } from "@lingui/react/macro";
import { ShieldCheckIcon as ShieldCheck } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";
import { Button as AriaButton } from "react-aria-components";

import { AUTH_LINK, AUTH_SUBMIT, AuthLayout, FormAlert } from "./AuthLayout.tsx";
import { CodeBoxes } from "./fields.tsx";
import { ApiError, apiError, mfaQuery, useApi } from "../../shared/api/api.tsx";
import { useSignOut } from "../../shared/api/useSignOut.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { Ltr } from "../../shared/ui/Ltr.tsx";
import { TextField } from "../../shared/ui/TextField.tsx";

/**
 * The second factor for Owners and Admins (AC-3.5.3): set up an authenticator app, or confirm
 * with its code. Either way the session is then signed in with two factors (`aal2`).
 */
export function SecondFactorPage() {
  const api = useApi();
  const status = useQuery(mfaQuery(api));
  if (status.data === undefined)
    return (
      <AuthLayout
        eyebrow={<Trans>Step 2 of 2</Trans>}
        title={<Trans>Checking your account</Trans>}
        step={2}
      >
        <div aria-hidden="true" className="flex justify-center gap-2" dir="ltr">
          {Array.from({ length: 6 }, (_, index) => (
            <span
              key={index}
              className="h-[60px] w-[clamp(40px,12vw,52px)] animate-pulse rounded-card border border-line"
            />
          ))}
        </div>
      </AuthLayout>
    );
  return status.data.enrolled ? <ConfirmCode /> : <SetUp />;
}

/** Plain words for a refused or failed authenticator code. */
export function useCodeMessage() {
  const { t } = useLingui();
  return (error: Error | null): string | undefined => {
    if (error === null) return undefined;
    if (error instanceof ApiError && error.type === "mfa-code-refused")
      return t`The code is wrong or expired.`;
    if (error instanceof ApiError && error.type === "too-many-attempts")
      return t`Too many attempts. Wait 15 minutes and try again.`;
    return t`This did not work. Try again shortly.`;
  };
}

function useFinish() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return async () => {
    // The route guards read these from the cache: drop them so they ask the API again.
    queryClient.removeQueries({ queryKey: ["auth"] });
    await router.navigate({ href: "/" });
  };
}

function SetUp() {
  const { t } = useLingui();
  const api = useApi();
  const finish = useFinish();
  const codeMessage = useCodeMessage();
  const [code, setCode] = useState("");

  const enroll = useMutation({
    mutationFn: async () => {
      const { data, error, response } = await api.POST("/v1/auth/mfa/enroll", {
        body: { name: t`Authenticator app` },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
  });
  const verify = useMutation({
    mutationFn: async (attempt: { factorId: string; code: string }) => {
      const { data, error, response } = await api.POST("/v1/auth/mfa/verify", {
        body: { factor_id: attempt.factorId, code: attempt.code },
      });
      if (data === undefined) throw apiError(response, error);
    },
    onSuccess: finish,
  });

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    if (enroll.data !== undefined) verify.mutate({ factorId: enroll.data.factor_id, code });
  }

  return (
    <AuthLayout
      eyebrow={<Trans>Step 2 of 2 · Security</Trans>}
      title={<Trans>Set up your authenticator app</Trans>}
      description={
        <Trans>
          Owners and Admins sign in with a password and a code from an app such as Google
          Authenticator, Microsoft Authenticator or 1Password.
        </Trans>
      }
      step={2}
    >
      {enroll.data === undefined ? (
        <div className="flex flex-col gap-6">
          <ol className="m-0 flex list-none flex-col rounded-card border border-line p-0">
            {[
              t`Open the authenticator app on your phone.`,
              t`Scan the QR code we show you.`,
              t`Enter the 6-digit code the app shows.`,
            ].map((line, index) => (
              <li
                key={line}
                className="flex animate-enter items-center gap-3 border-line px-4 py-3 text-body-sm not-first:border-t"
                style={{ animationDelay: `${String(index * 70)}ms` }}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-pill border border-line-strong text-caption tabular">
                  {index + 1}
                </span>
                {line}
              </li>
            ))}
          </ol>
          <Button
            variant="primary"
            className={AUTH_SUBMIT}
            isPending={enroll.isPending}
            onPress={() => {
              enroll.mutate();
            }}
          >
            <Trans>Show the QR code</Trans>
          </Button>
          <BackLink />
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
          <div className="flex animate-enter items-center gap-4 rounded-card border border-line bg-raised p-3">
            <img
              src={enroll.data.qr_code}
              alt={t`QR code for your authenticator app`}
              className="size-[132px] shrink-0 rounded-[12px] bg-art-paper p-2"
            />
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="m-0 text-body-sm">
                <Trans>Scan the QR code with the app.</Trans>
              </p>
              <p className="m-0 text-caption font-light text-muted">
                <Trans>Cannot scan? Type this key into the app:</Trans>
              </p>
              <p className="m-0 text-caption break-all text-primary">
                <Ltr>{enroll.data.secret}</Ltr>
              </p>
            </div>
          </div>
          <p className="m-0 text-body-sm text-secondary">
            <Trans>Enter the 6-digit code the app shows.</Trans>
          </p>
          <CodeBoxes
            value={code}
            onChange={setCode}
            autoFocus
            invalid={verify.isError && verify.variables.code === code}
          />
          <FormAlert message={codeMessage(verify.error)} />
          <Button
            type="submit"
            variant="primary"
            className={AUTH_SUBMIT}
            isPending={verify.isPending}
          >
            <Trans>Verify and sign in</Trans>
          </Button>
        </form>
      )}
      <FormAlert message={enroll.error === null ? undefined : codeMessage(enroll.error)} />
    </AuthLayout>
  );
}

function ConfirmCode() {
  const api = useApi();
  const finish = useFinish();
  const codeMessage = useCodeMessage();
  const [code, setCode] = useState("");
  const confirm = useMutation({
    mutationFn: async (attempt: string) => {
      const { error, response } = await api.POST("/v1/auth/step-up", { body: { code: attempt } });
      if (!response.ok) throw apiError(response, error);
    },
    onSuccess: finish,
  });

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    confirm.mutate(code);
  }

  return (
    <AuthLayout
      eyebrow={<Trans>Step 2 of 2</Trans>}
      title={<Trans>Two-step code</Trans>}
      description={<Trans>Enter the 6 digits your authenticator app shows now.</Trans>}
      step={2}
    >
      <form className="flex flex-col gap-6" onSubmit={submit} noValidate>
        <CodeBoxes
          value={code}
          onChange={setCode}
          autoFocus
          invalid={confirm.isError && confirm.variables === code}
        />
        <BackLink />
        <FormAlert message={codeMessage(confirm.error)} />
        <Button
          type="submit"
          variant="primary"
          className={AUTH_SUBMIT}
          isPending={confirm.isPending}
        >
          <Trans>Verify and sign in</Trans>
        </Button>
        <p className="m-0 text-center text-caption font-light text-muted">
          <Trans>The app shows a new code every 30 seconds</Trans>
        </p>
      </form>
    </AuthLayout>
  );
}

/**
 * The demo's "Back": this step already holds a first-factor session, so going back signs it out
 * and returns to the sign-in form (with another account, if needed).
 */
function BackLink() {
  const signOut = useSignOut();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <AriaButton
          className={AUTH_LINK}
          isPending={signOut.isPending}
          onPress={() => {
            signOut.mutate();
          }}
        >
          <Trans>Back to sign-in</Trans>
        </AriaButton>
        <span className="text-caption font-light text-muted">
          <Trans>Signs you out first</Trans>
        </span>
      </div>
      {signOut.isError ? (
        <p role="alert" className="m-0 text-caption text-danger-text">
          <Trans>You are still signed in. Try signing out again shortly.</Trans>
        </p>
      ) : null}
    </div>
  );
}

/** The 6-digit code from the authenticator app: digits only, left-to-right. */
export function CodeField({
  value,
  onChange,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  const { t } = useLingui();
  return (
    <TextField
      size="lg"
      icon={ShieldCheck}
      label={t`Code from the app`}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      ltr
      isRequired
      autoFocus={autoFocus}
      value={value}
      onChange={(next) => {
        onChange(next.replace(/\D/g, "").slice(0, 6));
      }}
    />
  );
}
