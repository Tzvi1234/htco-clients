import { Trans, useLingui } from "@lingui/react/macro";
import { ArrowRightIcon as ArrowRight, LockSimpleIcon as LockSimple } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type SyntheticEvent } from "react";

import { AuthLayout, FormAlert } from "./AuthLayout.tsx";
import { ApiError, apiError, useApi } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { TextField } from "../../shared/ui/TextField.tsx";

interface InviteTokens {
  accessToken: string;
  refreshToken: string;
}

/** The sign-in service puts the invitation's tokens in the fragment, which never reaches a server. */
function tokensOf(hash: string): InviteTokens | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (params.has("error") || accessToken === null || refreshToken === null) return null;
  return { accessToken, refreshToken };
}

/**
 * Where an invitation link lands: the new member chooses a password and is signed in. The tokens
 * are read once from the fragment and dropped from the address bar straight away.
 */
export function AcceptInvitePage() {
  const { t } = useLingui();
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  const hash = useRouterState({ select: (state) => state.location.hash });
  const [tokens] = useState(() => tokensOf(hash));
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [mismatch, setMismatch] = useState(false);

  useEffect(() => {
    if (hash !== "") void router.navigate({ to: "/accept-invite", hash: "", replace: true });
  }, [hash, router]);

  const accept = useMutation({
    mutationFn: async (invite: InviteTokens) => {
      const { data, error, response } = await api.POST("/v1/auth/invitations/accept", {
        body: {
          access_token: invite.accessToken,
          refresh_token: invite.refreshToken,
          password,
        },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["auth"] });
      await router.navigate({ to: "/" });
    },
  });

  function message(): string | undefined {
    if (mismatch) return t`The passwords are not the same.`;
    const error = accept.error;
    if (error === null) return undefined;
    if (!(error instanceof ApiError)) return t`This did not work. Try again shortly.`;
    switch (error.type) {
      case "weak-password":
        return t`Choose a longer password that is harder to guess.`;
      case "invitation-refused":
        return t`This invitation link has expired or was already used. Ask for a new one.`;
      case "too-many-attempts":
        return t`Too many attempts. Wait 15 minutes and try again.`;
      default:
        return t`This did not work. Try again shortly.`;
    }
  }

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    if (tokens === null) return;
    const same = password === repeat;
    setMismatch(!same);
    if (same) accept.mutate(tokens);
  }

  if (tokens === null) {
    return (
      <AuthLayout title={<Trans>Set your password</Trans>}>
        <p className="m-0 text-secondary">
          <Trans>This invitation link has expired or was already used. Ask for a new one.</Trans>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={<Trans>Set your password</Trans>}
      description={<Trans>You were invited to HT-Commerce. Choose a password to finish.</Trans>}
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
        <FormAlert message={message()} />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isPending={accept.isPending}
          className="h-11 text-body"
        >
          <Trans>Save and sign in</Trans>
          <ArrowRight aria-hidden="true" size={16} weight="bold" className="rtl:-scale-x-100" />
        </Button>
      </form>
    </AuthLayout>
  );
}
