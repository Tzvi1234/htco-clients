import type { ReactNode } from "react";

/**
 * The page's top bar (Attio): the object icon, the title (the page's only h1), a short
 * description beside it on wide screens, and the page's actions at the end.
 */
export function PageHeader({
  title,
  description,
  icon,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border-subtle bg-canvas px-4 py-2 sm:px-6">
      <div className="flex min-w-0 grow items-center gap-2">
        {icon}
        <h1 className="m-0 truncate text-body font-semibold">{title}</h1>
        {description === undefined ? null : (
          <p className="m-0 hidden min-w-0 truncate text-body-sm text-muted md:block">
            <span aria-hidden="true" className="me-2 text-border-strong">
              /
            </span>
            {description}
          </p>
        )}
      </div>
      {actions === undefined ? null : <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

/** The page's content under its header: gutters and a calm entrance. */
export function PageBody({ children, flush = false }: { children: ReactNode; flush?: boolean }) {
  return (
    <div
      className={
        flush
          ? "flex animate-enter flex-col"
          : "flex animate-enter flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
      }
    >
      {children}
    </div>
  );
}
