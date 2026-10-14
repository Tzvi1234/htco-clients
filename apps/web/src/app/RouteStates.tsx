import { Trans } from "@lingui/react/macro";
import { useNavigate, useRouter } from "@tanstack/react-router";

import { Button } from "../shared/ui/Button.tsx";
import { ErrorState } from "../shared/ui/ErrorState.tsx";

/** Shown when a screen fails to render: what happened, and a way forward. Never internals. */
export function RouteError({ reset }: { reset: () => void }) {
  const router = useRouter();
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
