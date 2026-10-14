import type { ReactNode } from "react";

import { Logo } from "../../shared/ui/Logo.tsx";

/** The calm, centered frame of the sign-in screens: no navigation until the user is in. */
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
    <main className="grid min-h-dvh place-items-center bg-canvas px-4 py-10 text-primary">
      <div className="flex w-full max-w-[400px] flex-col gap-6 rounded-card border border-border-subtle bg-surface p-6 shadow-1">
        <Logo />
        <header className="flex flex-col gap-1">
          <h1 className="m-0 text-title font-semibold">{title}</h1>
          {description === undefined ? null : (
            <p className="m-0 text-body text-secondary">{description}</p>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}

export function FormAlert({ message }: { message: string | undefined }) {
  if (message === undefined) return null;
  return (
    <p
      role="alert"
      className="m-0 rounded-control bg-danger-subtle px-3 py-2 text-body text-danger-text"
    >
      {message}
    </p>
  );
}
