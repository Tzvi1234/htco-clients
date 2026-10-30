import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";

import { AUTH_LINK, AUTH_SUBMIT, AuthLayout } from "./AuthLayout.tsx";
import { AuthField } from "./fields.tsx";
import { ApiError, apiError, useApi, PUBLIC_AUTH } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { FormAlert } from "../../shared/ui/FormAlert.tsx";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Asks the API to email a reset link. The API answers the same whether or not the account exists
 * (AC-3.5.6), so the page says the same thing too.
 */
export function ForgotPasswordPage() {
  const { t } = useLingui();
  const api = useApi();
  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState<"empty" | "format" | null>(null);

  const send = useMutation({
    meta: PUBLIC_AUTH,
    mutationFn: async (address: string) => {
      const { error, response } = await api.POST("/v1/auth/password/forgot", {
        body: { email: address },
      });
      if (!response.ok) throw apiError(response, error);
    },
  });

  function message(): string | undefined {
    if (problem === "empty") return t`Enter your email.`;
    if (problem === "format") return t`Enter a valid email address.`;
    const error = send.error;
    if (error === null) return undefined;
    if (error instanceof ApiError && error.status === 422) return t`Enter a valid email address.`;
    if (error instanceof ApiError && error.type === "too-many-attempts")
      return t`Too many attempts. Wait 15 minutes and try again.`;
    return t`This did not work. Try again shortly.`;
  }

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    const address = email.trim();
    // A light check for typing mistakes; the sign-in service decides what is deliverable.
    const next = address === "" ? "empty" : EMAIL.test(address) ? null : "format";
    setProblem(next);
    if (next === null) send.mutate(address);
  }

  const backToSignIn = (
    <Link to="/sign-in" className={AUTH_LINK}>
      <Trans>Back to sign-in</Trans>
    </Link>
  );

  if (send.isSuccess) {
    return (
      <AuthLayout eyebrow={<Trans>Password</Trans>} title={<Trans>Check your email</Trans>}>
        <div className="flex items-center gap-4 rounded-card border border-line bg-raised p-4">
          <SentMark />
          <p role="status" className="m-0 text-body-sm text-secondary">
            <Trans>
              If an account exists for this email, we sent a link to reset the password.
            </Trans>
          </p>
        </div>
        <p className="m-0 text-caption font-light text-muted">
          <Trans>The link works once. Check the spam folder if it does not arrive.</Trans>
        </p>
        <div>{backToSignIn}</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={<Trans>Password</Trans>}
      title={<Trans>Reset your password</Trans>}
      description={<Trans>Enter your email and we will send you a link to choose a new one.</Trans>}
    >
      <form className="flex flex-col gap-6" onSubmit={submit} noValidate>
        <AuthField
          label={t`Email`}
          placeholder="name@company.com"
          type="email"
          autoComplete="username"
          ltr
          isRequired
          value={email}
          onChange={setEmail}
        />
        <FormAlert message={message()} />
        <Button type="submit" variant="primary" isPending={send.isPending} className={AUTH_SUBMIT}>
          <Trans>Send the link</Trans>
        </Button>
        <div>{backToSignIn}</div>
      </form>
    </AuthLayout>
  );
}

/** A sent letter in a circle, popping in once (the demo's check toast, as a mark). */
export function SentMark() {
  return (
    <span
      aria-hidden="true"
      className="auth-mark grid size-12 shrink-0 place-items-center rounded-pill bg-inverse text-on-inverse"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
        <path d="m4.5 7 7.5 6 7.5-6" />
      </svg>
    </span>
  );
}
