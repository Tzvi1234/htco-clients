import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";

import { AUTH_LINK, AUTH_SUBMIT, AuthLayout, FormAlert } from "./AuthLayout.tsx";
import { AuthField, PasswordField } from "./fields.tsx";
import { ApiError, apiError, safeRedirect, useApi } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";

/** Email and password, checked by the API (the browser never talks to Supabase, ADR-0006). */
export function SignInPage() {
  const { t } = useLingui();
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  const search: { redirect?: string } = useSearch({ strict: false });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = useMutation({
    mutationFn: async () => {
      const { data, error, response } = await api.POST("/v1/auth/sign-in", {
        body: { email, password },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    onSuccess: async () => {
      // The route guards read these from the cache: drop them so they ask the API again.
      queryClient.removeQueries({ queryKey: ["auth"] });
      await router.navigate({ href: safeRedirect(search.redirect) });
    },
  });

  function message(error: Error | null): string | undefined {
    if (error === null) return undefined;
    if (!(error instanceof ApiError))
      return t`Sign-in is unavailable right now. Try again shortly.`;
    switch (error.type) {
      case "sign-in-refused":
        return t`The email or the password is wrong.`;
      case "too-many-attempts":
        return t`Too many attempts. Wait 15 minutes and try again.`;
      case "csrf-failed":
        return t`This page could not sign you in. Reload it and try again.`;
      default:
        return t`Sign-in is unavailable right now. Try again shortly.`;
    }
  }

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    signIn.mutate();
  }

  return (
    <AuthLayout eyebrow={<Trans>Welcome back</Trans>} title={<Trans>Sign in</Trans>} step={1}>
      <form className="flex flex-col gap-6" onSubmit={submit} noValidate>
        <div className="flex flex-col gap-4">
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
          <div className="flex flex-col gap-2">
            <PasswordField
              label={t`Password`}
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />
            {/* Under its field, at the end: the owner found it awkward beside the label. */}
            <Link to="/forgot-password" className={`${AUTH_LINK} self-end`}>
              <Trans>Forgot your password?</Trans>
            </Link>
          </div>
        </div>
        <FormAlert message={message(signIn.error)} />
        <Button
          type="submit"
          variant="primary"
          isPending={signIn.isPending}
          className={AUTH_SUBMIT}
        >
          <Trans>Continue</Trans>
        </Button>
        <div className="flex flex-col gap-1 text-center text-caption font-light text-muted">
          <p className="m-0">
            <Trans>Owners and Admins confirm with an authenticator code</Trans>
          </p>
          <p className="m-0">
            <Trans>No account yet? The workspace owner sends invitations.</Trans>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
