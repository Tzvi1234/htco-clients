import { Trans } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";

import { ApiError, useApi } from "../shared/api/api.tsx";

import { Button } from "../shared/ui/Button.tsx";
import { ErrorState } from "../shared/ui/ErrorState.tsx";

/** Shown when a screen fails to render: what happened, and a way forward. Never internals. */
export function RouteError({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();
  if (error instanceof ApiError && error.type === "no-membership") return <NoWorkspace />;
  return (
    <ErrorState
      headingLevel={1}
      title={<Trans>This screen could not be shown</Trans>}
      description={
        <Trans>Something went wrong while showing it. Try again; your data was not changed.</Trans>
      }
    >
      <Button
        variant="primary"
        onPress={() => {
          reset();
          void router.invalidate();
        }}
      >
        <Trans>Try again</Trans>
      </Button>
    </ErrorState>
  );
}

export function NotFound() {
  const navigate = useNavigate();
  return (
    <ErrorState
      headingLevel={1}
      title={<Trans>Page not found</Trans>}
      description={<Trans>The address may be mistyped, or the page has moved.</Trans>}
    >
      <Button variant="primary" onPress={() => void navigate({ to: "/" })}>
        <Trans>Go to the overview</Trans>
      </Button>
    </ErrorState>
  );
}

/** Signed in, but no organization has added this account yet: only an invitation helps. */
function NoWorkspace() {
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  const signOut = useMutation({
    mutationFn: () => api.POST("/v1/auth/sign-out"),
    onSettled: async () => {
      queryClient.clear();
      await router.navigate({ to: "/sign-in" });
    },
  });
  return (
    <ErrorState
      headingLevel={1}
      title={<Trans>You are not in a workspace yet</Trans>}
      description={
        <Trans>
          Your account works, but no workspace has added it. Ask the workspace owner to invite you,
          then sign in again.
        </Trans>
      }
    >
      <Button
        variant="primary"
        isPending={signOut.isPending}
        onPress={() => {
          signOut.mutate();
        }}
      >
        <Trans>Sign out</Trans>
      </Button>
    </ErrorState>
  );
}
