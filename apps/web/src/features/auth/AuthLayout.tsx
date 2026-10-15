import { Trans } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { SignInArt } from "../../shared/art/SignInArt.tsx";
import { Logo } from "../../shared/ui/Logo.tsx";

/**
 * The sign-in screens, a brand moment (design/README.md, "Two worlds"): a calm, centred form side
 * with the logo large above the form; the brand panel keeps its headline and the relay art.
 * Phones show the form side alone.
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
    <div className="grid min-h-dvh bg-canvas text-primary lg:grid-cols-[minmax(460px,1fr)_minmax(520px,1.15fr)]">
      <main className="flex flex-col items-center px-6 py-8 sm:px-14">
        <div className="flex w-full max-w-[440px] grow animate-enter flex-col justify-center gap-8 pt-6 pb-16">
          <div className="flex justify-center pb-4">
            <Logo height={72} animated />
          </div>
          <header className="flex flex-col gap-2 text-center">
            <h1 className="m-0 font-display text-display-sm font-semibold">{title}</h1>
            {description === undefined ? null : (
              <p className="m-0 text-body text-secondary">{description}</p>
            )}
          </header>
          {children}
        </div>
        <p className="m-0 text-center text-caption text-muted">
          <Trans>HTCO · the operating system for your marketplace business</Trans>
        </p>
      </main>
      <aside
        aria-hidden="true"
        className="relative isolate m-3 hidden flex-col gap-10 overflow-hidden rounded-dialog bg-brand p-12 lg:flex"
      >
        {/* Solid corner shapes, as in the owner's reference: crisp, no blur. */}
        <span className="absolute -end-20 -top-24 -z-10 size-[300px] rounded-pill bg-shape-iris" />
        <span className="absolute -end-16 -bottom-20 -z-10 size-[220px] rounded-pill bg-shape-saffron" />
        <span className="absolute end-[150px] -bottom-28 -z-10 size-[220px] rounded-pill bg-shape-peach" />
        <p className="m-0 max-w-[13ch] font-display text-[56px] leading-[1.02] font-bold text-on-brand">
          <Trans>
            Your shop runs. You decide<span className="text-ring">.</span>
          </Trans>
        </p>
        <div className="flex grow items-center">
          <SignInArt className="mx-auto max-w-[680px]" />
        </div>
      </aside>
    </div>
  );
}

export function FormAlert({ message }: { message: string | undefined }) {
  if (message === undefined) return null;
  return (
    <p
      role="alert"
      className="m-0 animate-enter rounded-button border border-danger bg-surface px-3 py-2.5 text-body-sm font-medium text-danger-text"
    >
      {message}
    </p>
  );
}
