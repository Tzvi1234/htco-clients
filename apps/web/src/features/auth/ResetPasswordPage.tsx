import { Trans, useLingui } from "@lingui/react/macro";
import { ArrowRightIcon as ArrowRight, LockSimpleIcon as LockSimple } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type SyntheticEvent } from "react";

import { AuthLayout, FormAlert } from "./AuthLayout.tsx";
import { passwordProblem, tokensOf, type LinkTokens } from "./linkTokens.ts";
import { CodeField } from "./SecondFactorPage.tsx";
import { ApiError, apiError, useApi } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { TextField } from "../../shared/ui/TextField.tsx";

/**
 * Where the emailed password reset link lands, like the invitation page: the tokens are read once
 * from the fragment and dropped from the address bar straight away. A user with an authenticator
 * app is asked for its code when the API says so (`mfa-code-required`). After the reset, the API
 * has signed out every other session; the usual guards take over from `/`.
 */
export function ResetPasswordPage() {
  const { t } = useLingui();
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  const hash = useRouterState({ select: (state) => state.location.hash });
  const [tokens] = useState(() => tokensOf(hash));
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [code, setCode] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [problem, setProblem] = useState<"length" | "mismatch" | "code" | null>(null);

  useEffect(() => {
    if (hash !== "") void router.navigate({ to: "/reset-password", hash: "", replace: true });
  }, [hash, router]);

  const reset = useMutation({
    mutationFn: async (link: LinkTokens) => {
      const { data, error, response } = await api.POST("/v1/auth/password/reset", {
        body: {
          access_token: link.accessToken,
          refresh_token: link.refreshToken,
          password,
          ...(needsCode ? { code } : {}),
        },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["auth"] });
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
    if (tokens === null) return;
    const next =
      passwordProblem(password, repeat) ?? (needsCode && code.length !== 6 ? "code" : null);
    setProblem(next);
    if (next === null) reset.mutate(tokens);
  }

  if (tokens === null) {
    return (
      <AuthLayout title={<Trans>Choose a new password</Trans>}>
        <p className="m-0 text-center text-secondary">
          <Trans>
            This password reset link has expired or was already used. Ask for a new one.
          </Trans>
        </p>
        <Link to="/forgot-password" className="text-center text-body-sm font-medium text-link">
          <Trans>Ask for a new link</Trans>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={<Trans>Choose a new password</Trans>}
      description={<Trans>Your other devices will be signed out.</Trans>}
    >
      <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
        <TextField
          size="lg"
          icon={LockSimple}
          label={t`New password`}
          description={t`At least 12 characters.`}
          type="password"
          autoComplete="new-password"
          isRequired
          minLength={12}
          value={password}
          onChange={setPassword}
        />
        <TextField
          size="lg"
          icon={LockSimple}
          label={t`Repeat the password`}
          type="password"
          autoComplete="new-password"
          isRequired
          value={repeat}
          onChange={setRepeat}
        />
        {needsCode ? <CodeField value={code} onChange={setCode} /> : null}
        <FormAlert message={message()} />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isPending={reset.isPending}
          className="h-11 text-body"
        >
          <Trans>Save and sign in</Trans>
          <ArrowRight aria-hidden="true" size={16} weight="bold" className="rtl:-scale-x-100" />
        </Button>
      </form>
    </AuthLayout>
  );
}
