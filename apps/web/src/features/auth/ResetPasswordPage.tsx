import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";

import { AUTH_SUBMIT, AuthLayout } from "./AuthLayout.tsx";
import { PasswordField } from "./fields.tsx";
import { CodeBoxes } from "../../shared/ui/kit/index.ts";
import { linkOutcome, passwordProblem } from "./links.ts";
import { ApiError, apiError, forgetSession, useApi } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { FormAlert } from "../../shared/ui/FormAlert.tsx";

/**
 * Where the emailed password reset link lands, after the API's link callback redeemed it on the
 * server, like the invitation page: the link's tokens stay in an `HttpOnly` cookie only the API
 * reads, and this page sends just the password (Codex security review). A user with an authenticator
 * app is asked for its code when the API says so (`mfa-code-required`). After the reset, the API
 * has signed out every other session; the usual guards take over from `/`.
 */
export function ResetPasswordPage() {
  const { t } = useLingui();
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  const outcome = useRouterState({ select: (state) => linkOutcome(state.location.search) });
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [code, setCode] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [problem, setProblem] = useState<"length" | "mismatch" | "code" | null>(null);

  const reset = useMutation({
    // No variables and no result: the password and code stay in this view's state, never in the
    // mutation cache.
    gcTime: 0,
    mutationFn: async (): Promise<void> => {
      const { data, error, response } = await api.POST("/v1/auth/password/reset", {
        body: { password, ...(needsCode ? { code } : {}) },
      });
      if (data === undefined) throw apiError(response, error);
    },
    onSuccess: async () => {
      setPassword("");
      setRepeat("");
      setCode("");
      forgetSession(queryClient);
      await router.navigate({ to: "/" });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.type === "mfa-code-required") setNeedsCode(true);
    },
  });

  function message(): string | undefined {
    if (problem === "length") return t`Use between 12 and 128 characters.`;
    if (problem === "mismatch") return t`The passwords are not the same.`;
    if (problem === "code") return t`Enter the 6-digit code from your authenticator app to finish.`;
    const error = reset.error;
    if (error === null) return undefined;
    if (!(error instanceof ApiError)) return t`This did not work. Try again shortly.`;
    switch (error.type) {
      case "weak-password":
        return t`Choose a longer password that is harder to guess.`;
      case "same-password":
        return t`This is your current password. Choose a different one.`;
      case "reset-link-refused":
        return t`This password reset link has expired or was already used. Ask for a new one.`;
      case "mfa-code-required":
        return t`Enter the 6-digit code from your authenticator app to finish.`;
      case "mfa-code-refused":
        return t`The code is wrong or expired.`;
      case "too-many-attempts":
        return t`Too many attempts. Wait 15 minutes and try again.`;
      default:
        return t`This did not work. Try again shortly.`;
    }
  }

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    const next =
      passwordProblem(password, repeat) ?? (needsCode && code.length !== 6 ? "code" : null);
    setProblem(next);
    if (next === null) reset.mutate();
  }

  // The API removes a refused link's cookie, so trying again here cannot work.
  const refused = reset.error instanceof ApiError && reset.error.type === "reset-link-refused";
  if (outcome !== null || refused) {
    return (
      <AuthLayout eyebrow={<Trans>Password</Trans>} title={<Trans>Choose a new password</Trans>}>
        <p className="m-0 rounded-card border border-line bg-raised p-4 text-body-sm text-secondary">
          {outcome === "too-many" ? (
            <Trans>Too many attempts. Wait 15 minutes and try again.</Trans>
          ) : (
            <Trans>
              This password reset link has expired or was already used. Ask for a new one.
            </Trans>
          )}
        </p>
        <Link
          to="/forgot-password"
          className="inline-flex h-12 w-full items-center justify-center rounded-pill bg-action-primary text-body-sm text-action-primary-fg transition-[background-color,scale] duration-[var(--motion-duration-fast)] hover:bg-action-primary-hover active:scale-[0.98]"
        >
          <Trans>Ask for a new link</Trans>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={<Trans>Password</Trans>}
      title={<Trans>Choose a new password</Trans>}
      description={<Trans>Your other devices will be signed out.</Trans>}
    >
      <form className="flex flex-col gap-6" onSubmit={submit} noValidate>
        <div className="flex flex-col gap-4">
          <PasswordField
            label={t`New password`}
            description={t`At least 12 characters.`}
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
          />
          <PasswordField
            label={t`Repeat the password`}
            autoComplete="new-password"
            value={repeat}
            onChange={setRepeat}
          />
        </div>
        {needsCode ? (
          <div className="flex animate-enter flex-col gap-3">
            <p className="m-0 text-body-sm text-secondary">
              <Trans>Enter the 6-digit code from your authenticator app to finish.</Trans>
            </p>
            <CodeBoxes value={code} onChange={setCode} autoFocus />
          </div>
        ) : null}
        <FormAlert message={message()} />
        <Button type="submit" variant="primary" isPending={reset.isPending} className={AUTH_SUBMIT}>
          <Trans>Save and sign in</Trans>
        </Button>
      </form>
    </AuthLayout>
  );
}
