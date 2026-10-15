import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";

import { AuthLayout, FormAlert } from "./AuthLayout.tsx";
import { ApiError, apiError, safeRedirect, useApi } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { TextField } from "../../shared/ui/TextField.tsx";

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
    <AuthLayout
      title={<Trans>Sign in to HTCO</Trans>}
      description={<Trans>Use the email you were invited with.</Trans>}
    >
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <TextField
          size="lg"
          label={t`Email`}
          type="email"
          autoComplete="username"
          ltr
          isRequired
          value={email}
          onChange={setEmail}
        />
        <TextField
          size="lg"
          label={t`Password`}
          type="password"
          autoComplete="current-password"
          isRequired
          value={password}
          onChange={setPassword}
        />
        <FormAlert message={message(signIn.error)} />
        <Button type="submit" variant="primary" size="lg" isPending={signIn.isPending}>
          <Trans>Sign in</Trans>
        </Button>
      </form>
    </AuthLayout>
  );
}
