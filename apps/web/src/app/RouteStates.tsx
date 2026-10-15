import { Trans } from "@lingui/react/macro";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";

import parcel from "../assets/hero/hero10.webp";
import { AUTH_SUBMIT, AuthLayout } from "../features/auth/AuthLayout.tsx";
import { ApiError } from "../shared/api/api.tsx";
import { useSignOut } from "../shared/api/useSignOut.ts";
import { Button } from "../shared/ui/Button.tsx";

/**
 * Shown when a screen fails to render: what happened, and a way forward. Never internals. It may
 * render inside the shell (a screen failed) or alone, so it is one Design 1C panel, centred.
 */
export function RouteError({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();
  if (error instanceof ApiError && error.type === "no-membership") return <NoWorkspace />;
  return (
    <div className="grid min-h-full place-items-center p-2">
      <section
        role="alert"
        className="glass flex w-full max-w-[560px] animate-enter flex-col overflow-hidden rounded-panel border border-edge bg-panel shadow-panel"
      >
        <header className="flex h-14 items-center gap-2.5 ps-6 pe-2">
          <span aria-hidden="true" className="size-1.5 rounded-pill bg-danger" />
          <span className="text-body-sm">
            <Trans>Something went wrong</Trans>
          </span>
        </header>
        <div className="flex items-center gap-6 px-6 pb-6">
          <div className="flex min-w-0 grow flex-col gap-4">
            <h1 className="m-0 text-title-lg font-light tracking-[-0.01em]">
              <Trans>This screen could not be shown</Trans>
            </h1>
            <p className="m-0 text-body-sm text-secondary">
              <Trans>
                Something went wrong while showing it. Try again; your data was not changed.
              </Trans>
            </p>
            <div>
              <Button
                variant="primary"
                size="lg"
                onPress={() => {
                  reset();
                  void router.invalidate();
                }}
              >
                <Trans>Try again</Trans>
              </Button>
            </div>
          </div>
          <img
            src={parcel}
            alt=""
            aria-hidden="true"
            className="hidden w-36 shrink-0 -rotate-6 select-none sm:block"
          />
        </div>
      </section>
    </div>
  );
}

/** A whole-page state in the sign-in design, with an alert for assistive technology. */
function StatePage({
  eyebrow,
  title,
  description,
  art,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  art: "office" | "parcel";
  children: ReactNode;
}) {
  return (
    <AuthLayout eyebrow={eyebrow} title={title} art={art} alert>
      <div className="flex flex-col gap-6">
        <p className="m-0 text-body-sm text-secondary">{description}</p>
        {children}
      </div>
    </AuthLayout>
  );
}

export function NotFound() {
  const navigate = useNavigate();
  return (
    <StatePage
      eyebrow={<Trans>Error 404</Trans>}
      title={<Trans>Page not found</Trans>}
      description={<Trans>The address may be mistyped, or the page has moved.</Trans>}
      art="parcel"
    >
      <Button variant="primary" className={AUTH_SUBMIT} onPress={() => void navigate({ to: "/" })}>
        <Trans>Go to Home</Trans>
      </Button>
    </StatePage>
  );
}

/** Signed in, but no organization has added this account yet: only an invitation helps. */
function NoWorkspace() {
  const signOut = useSignOut();
  return (
    <StatePage
      eyebrow={<Trans>Your account</Trans>}
      title={<Trans>You are not in a workspace yet</Trans>}
      description={
        <Trans>
          Your account works, but no workspace has added it. Ask the workspace owner to invite you,
          then sign in again.
        </Trans>
      }
      art="office"
    >
      <Button
        variant="primary"
        className={AUTH_SUBMIT}
        isPending={signOut.isPending}
        onPress={() => {
          signOut.mutate();
        }}
      >
        <Trans>Sign out</Trans>
      </Button>
      {signOut.isError ? (
        <p role="alert" className="m-0 text-body-sm text-danger-text">
          <Trans>You are still signed in. Try signing out again shortly.</Trans>
        </p>
      ) : null}
    </StatePage>
  );
}
