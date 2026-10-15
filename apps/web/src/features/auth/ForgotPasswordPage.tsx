import { Trans, useLingui } from "@lingui/react/macro";
import { ArrowRightIcon as ArrowRight, EnvelopeIcon as Envelope } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";

import { AuthLayout, FormAlert } from "./AuthLayout.tsx";
import { ApiError, apiError, useApi } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { TextField } from "../../shared/ui/TextField.tsx";

/**
 * Asks the API to email a reset link. The API answers the same whether or not the account exists
 * (AC-3.5.6), so the page says the same thing too.
 */
export function ForgotPasswordPage() {
  const { t } = useLingui();
  const api = useApi();
  const [email, setEmail] = useState("");
  const [empty, setEmpty] = useState(false);

  const send = useMutation({
    mutationFn: async (address: string) => {
      const { error, response } = await api.POST("/v1/auth/password/forgot", {
        body: { email: address },
      });
      if (!response.ok) throw apiError(response, error);
    },
  });

  function message(): string | undefined {
    if (empty) return t`Enter your email.`;
    const error = send.error;
    if (error === null) return undefined;
    if (error instanceof ApiError && error.type === "too-many-attempts")
      return t`Too many attempts. Wait 15 minutes and try again.`;
    return t`This did not work. Try again shortly.`;
  }

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    const address = email.trim();
    setEmpty(address === "");
    if (address !== "") send.mutate(address);
  }

  const backToSignIn = (
    <Link to="/sign-in" className="text-center text-body-sm font-medium text-link">
      <Trans>Back to sign-in</Trans>
    </Link>
  );

  if (send.isSuccess) {
    return (
      <AuthLayout title={<Trans>Check your email</Trans>}>
        <p role="status" className="m-0 text-center text-secondary">
          <Trans>If an account exists for this email, we sent a link to reset the password.</Trans>
        </p>
        {backToSignIn}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={<Trans>Reset your password</Trans>}
      description={<Trans>Enter your email and we will send you a link to choose a new one.</Trans>}
    >
      <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
        <TextField
          size="lg"
          icon={Envelope}
          label={t`Email`}
          placeholder="you@company.com"
          type="email"
          autoComplete="username"
          ltr
          isRequired
          value={email}
          onChange={setEmail}
        />
        <FormAlert message={message()} />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isPending={send.isPending}
          className="h-11 text-body"
        >
          <Trans>Send the link</Trans>
          <ArrowRight aria-hidden="true" size={16} weight="bold" className="rtl:-scale-x-100" />
        </Button>
        {backToSignIn}
      </form>
    </AuthLayout>
  );
}
