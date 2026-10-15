import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type SyntheticEvent } from "react";

import { AUTH_SUBMIT, AuthLayout, FormAlert } from "./AuthLayout.tsx";
import { PasswordField } from "./fields.tsx";
import { passwordProblem, tokensOf, type LinkTokens } from "./linkTokens.ts";
import { ApiError, apiError, useApi } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";

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
  const [problem, setProblem] = useState<"length" | "mismatch" | null>(null);

  useEffect(() => {
    if (hash !== "") void router.navigate({ to: "/accept-invite", hash: "", replace: true });
  }, [hash, router]);

  const accept = useMutation({
    mutationFn: async (invite: LinkTokens) => {
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
    if (problem === "length") return t`Use between 12 and 128 characters.`;
    if (problem === "mismatch") return t`The passwords are not the same.`;
    const error = accept.error;
    if (error === null) return undefined;
    if (!(error instanceof ApiError)) return t`This did not work. Try again shortly.`;
    switch (error.type) {
      case "weak-password":
        return t`Choose a longer password that is harder to guess.`;
      case "same-password":
        return t`This is your current password. Choose a different one.`;
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
    // Checked here as the API does, so the user gets a clear answer (Codex review).
    const next = passwordProblem(password, repeat);
    setProblem(next);
    if (next === null) accept.mutate(tokens);
  }

  if (tokens === null) {
    return (
      <AuthLayout eyebrow={<Trans>Invitation</Trans>} title={<Trans>Set your password</Trans>}>
        <p className="m-0 rounded-card border border-line bg-raised p-4 text-body-sm text-secondary">
          <Trans>This invitation link has expired or was already used. Ask for a new one.</Trans>
        </p>
        <p className="m-0 text-caption font-light text-muted">
          <Trans>The workspace owner can send a new invitation from Members & access.</Trans>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={<Trans>Invitation</Trans>}
      title={<Trans>Set your password</Trans>}
      description={<Trans>You were invited to HT-Commerce. Choose a password to finish.</Trans>}
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
        <FormAlert message={message()} />
        <Button
          type="submit"
          variant="primary"
          isPending={accept.isPending}
          className={AUTH_SUBMIT}
        >
          <Trans>Save and sign in</Trans>
        </Button>
      </form>
    </AuthLayout>
  );
}
