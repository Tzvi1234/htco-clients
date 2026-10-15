import type { ReactNode } from "react";

import { Aura } from "../art/Aura.tsx";
import { cx } from "../lib/cx.ts";

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
    <header className="sticky top-0 z-10 flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border-subtle bg-canvas px-4 py-2 max-sm:static max-sm:border-0 max-sm:bg-transparent max-sm:pt-6 max-sm:pb-0 sm:px-6">
      <div className="flex min-w-0 grow items-center gap-2">
        <span className="max-sm:hidden">{icon}</span>
        <h1 className="m-0 truncate text-body font-semibold max-sm:text-[32px] max-sm:leading-tight max-sm:font-extrabold max-sm:tracking-[-0.02em]">
          {title}
        </h1>
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

/**
 * The page's content under its header: gutters and a calm entrance. `aura` adds the faint
 * brand glow at the top (home and other greeting pages, never behind a table).
 */
export function PageBody({
  children,
  flush = false,
  aura = false,
}: {
  children: ReactNode;
  flush?: boolean;
  aura?: boolean;
}) {
  return (
    <div
      className={cx(
        "relative isolate flex animate-enter flex-col",
        !flush && "gap-6 px-4 py-6 sm:px-6 lg:px-8",
      )}
    >
      {aura ? <Aura variant="page" className="-z-10" /> : null}
      {children}
    </div>
  );
}
