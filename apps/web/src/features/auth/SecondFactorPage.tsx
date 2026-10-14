import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";

import { AuthLayout, FormAlert } from "./AuthLayout.tsx";
import { ApiError, apiError, mfaQuery, useApi } from "../../shared/api/api.tsx";
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
    return <AuthLayout title={<Trans>Checking your account</Trans>}>{null}</AuthLayout>;
  return status.data.enrolled ? <ConfirmCode /> : <SetUp />;
}

function useCodeMessage() {
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
    mutationFn: async (factorId: string) => {
      const { data, error, response } = await api.POST("/v1/auth/mfa/verify", {
        body: { factor_id: factorId, code },
      });
      if (data === undefined) throw apiError(response, error);
    },
    onSuccess: finish,
  });

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    if (enroll.data !== undefined) verify.mutate(enroll.data.factor_id);
  }

  return (
    <AuthLayout
      title={<Trans>Set up your authenticator app</Trans>}
      description={
        <Trans>
          Owners and Admins sign in with a password and a code from an app such as Google
          Authenticator, Microsoft Authenticator or 1Password.
        </Trans>
      }
    >
      {enroll.data === undefined ? (
        <Button
          variant="primary"
          size="lg"
          isPending={enroll.isPending}
          onPress={() => {
            enroll.mutate();
          }}
        >
          <Trans>Show the QR code</Trans>
        </Button>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <ol className="m-0 flex flex-col gap-1 ps-5 text-body text-secondary">
            <li>
              <Trans>Scan the QR code with the app.</Trans>
            </li>
            <li>
              <Trans>Enter the 6-digit code the app shows.</Trans>
            </li>
          </ol>
          <img
            src={enroll.data.qr_code}
            alt={t`QR code for your authenticator app`}
            className="size-48 self-center rounded-control bg-white p-2"
          />
          <p className="m-0 text-caption text-muted">
            <Trans>Cannot scan? Type this key into the app:</Trans>{" "}
            <span className="text-primary">
              <Ltr>{enroll.data.secret}</Ltr>
            </span>
          </p>
          <CodeField value={code} onChange={setCode} />
          <FormAlert message={codeMessage(verify.error)} />
          <Button type="submit" variant="primary" size="lg" isPending={verify.isPending}>
            <Trans>Confirm</Trans>
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
    mutationFn: async () => {
      const { error, response } = await api.POST("/v1/auth/step-up", { body: { code } });
      if (!response.ok) throw apiError(response, error);
    },
    onSuccess: finish,
  });

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    confirm.mutate();
  }

  return (
    <AuthLayout
      title={<Trans>Confirm it is you</Trans>}
      description={<Trans>Enter the 6-digit code from your authenticator app.</Trans>}
    >
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <CodeField value={code} onChange={setCode} />
        <FormAlert message={codeMessage(confirm.error)} />
        <Button type="submit" variant="primary" size="lg" isPending={confirm.isPending}>
          <Trans>Confirm</Trans>
        </Button>
      </form>
    </AuthLayout>
  );
}

function CodeField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useLingui();
  return (
    <TextField
      label={t`Code from the app`}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      ltr
      isRequired
      value={value}
      onChange={(next) => {
        onChange(next.replace(/\D/g, "").slice(0, 6));
      }}
    />
  );
}
