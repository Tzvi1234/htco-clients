import { Trans } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { Aura } from "../../shared/art/Aura.tsx";
import { SignInArt } from "../../shared/art/SignInArt.tsx";
import { Logo } from "../../shared/ui/Logo.tsx";

/**
 * The sign-in screens, a brand moment (design/README.md, "Two worlds"): a calm form beside the
 * relay art on wide screens; the form alone on phones. No navigation until the user is in.
 */
export function AuthLayout({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh bg-canvas text-primary lg:grid-cols-[minmax(420px,1fr)_minmax(520px,1.15fr)]">
      <main className="relative isolate flex flex-col overflow-hidden px-6 py-8 sm:px-12">
        <Aura variant="corner" className="-z-10" />
        <Logo height={24} animated />
        <div className="flex grow items-center">
          <div className="flex w-full max-w-[380px] animate-enter flex-col gap-7 py-10">
            <header className="flex flex-col gap-2">
              <h1 className="m-0 font-display text-display-sm font-semibold">{title}</h1>
              {description === undefined ? null : (
                <p className="m-0 text-body text-secondary">{description}</p>
              )}
            </header>
            {children}
          </div>
        </div>
        <p className="m-0 text-caption text-muted">
          <Trans>HTCO · the operating system for your marketplace business</Trans>
        </p>
      </main>
      <aside
        aria-hidden="true"
        className="relative isolate m-3 hidden flex-col justify-between overflow-hidden rounded-dialog border border-border-subtle bg-brand p-10 lg:flex"
      >
        <Aura variant="brand" className="-z-10" />
        <p className="m-0 max-w-[16ch] font-display text-display font-semibold text-on-brand">
          <Trans>Your shop runs. You decide.</Trans>
        </p>
        <SignInArt className="mx-auto max-w-[560px]" />
        <p className="m-0 max-w-[44ch] text-body text-secondary">
          <Trans>
            Every action an AI employee takes has a reason, a policy and a receipt, and anything
            risky waits for you.
          </Trans>
        </p>
      </aside>
    </div>
  );
}

export function FormAlert({ message }: { message: string | undefined }) {
  if (message === undefined) return null;
  return (
    <p
      role="alert"
      className="m-0 animate-enter rounded-control border border-danger-subtle bg-danger-subtle px-3 py-2 text-body-sm text-danger-text"
    >
      {message}
    </p>
  );
}
