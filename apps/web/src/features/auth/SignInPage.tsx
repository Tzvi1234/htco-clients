import { Trans, useLingui } from "@lingui/react/macro";
import {
  ArrowRightIcon as ArrowRight,
  EnvelopeIcon as Envelope,
  EyeIcon as Eye,
  EyeSlashIcon as EyeSlash,
  LockSimpleIcon as LockSimple,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";
import { Button as AriaButton } from "react-aria-components";

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
  const [showPassword, setShowPassword] = useState(false);

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
      title={<Trans>Sign in to HT-Commerce</Trans>}
      description={<Trans>Your shops, orders and AI office in one place.</Trans>}
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
        <TextField
          size="lg"
          icon={LockSimple}
          label={t`Password`}
          placeholder={t`Your password`}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          isRequired
          value={password}
          onChange={setPassword}
          end={
            <AriaButton
              aria-label={showPassword ? t`Hide password` : t`Show password`}
              onPress={() => {
                setShowPassword((shown) => !shown);
              }}
              className="grid size-7 shrink-0 cursor-default place-items-center rounded-control text-icon-muted outline-none data-[hovered]:bg-hover data-[hovered]:text-primary"
            >
              {showPassword ? (
                <EyeSlash aria-hidden="true" size={18} weight="duotone" />
              ) : (
                <Eye aria-hidden="true" size={18} weight="duotone" />
              )}
            </AriaButton>
          }
        />
        <Link to="/forgot-password" className="-mt-2 self-end text-body-sm font-medium text-link">
          <Trans>Forgot your password?</Trans>
        </Link>
        <FormAlert message={message(signIn.error)} />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isPending={signIn.isPending}
          className="h-11 text-body"
        >
          <Trans>Sign in</Trans>
          <ArrowRight aria-hidden="true" size={16} weight="bold" className="rtl:-scale-x-100" />
        </Button>
        <p className="m-0 text-center text-body-sm text-muted">
          <Trans>No account yet? The workspace owner sends invitations.</Trans>
        </p>
      </form>
    </AuthLayout>
  );
}
