import { createContext, use, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Aura } from "../art/Aura.tsx";
import { cx } from "../lib/cx.ts";

/**
 * Where the app shell's top bar takes the page title: an element once the shell has mounted,
 * `null` while it mounts, and `undefined` outside a shell (stories, the landing page).
 */
export const TopBarSlotContext = createContext<HTMLElement | null | undefined>(undefined);

const TITLE = "m-0 truncate text-title-lg font-light font-display";

/**
 * The page's title (its only h1). Inside the app shell it sits in the top bar under the crumbs,
 * light and 24 px (Design 1C); a description and the page's actions open the page's content.
 * Elsewhere it renders in place.
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
  const slot = use(TopBarSlotContext);
  const extras =
    description === undefined && actions === undefined ? null : (
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-5 sm:px-6">
        {description === undefined ? (
          <span />
        ) : (
          <p className="m-0 min-w-0 text-body-sm font-light text-muted">{description}</p>
        )}
        {actions === undefined ? null : <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  if (slot === undefined) {
    return (
      <header className="flex flex-col">
        <div className="flex min-w-0 items-center gap-2 px-4 pt-5 sm:px-6">
          {icon}
          <h1 className={TITLE}>{title}</h1>
        </div>
        {extras}
      </header>
    );
  }
  return (
    <>
      {slot === null ? null : createPortal(<h1 className={TITLE}>{title}</h1>, slot)}
      {extras}
    </>
  );
}

/**
 * The page's content: gutters and a calm entrance. `aura` adds the brand shapes at the top
 * (home and other greeting pages, never behind a table).
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
        !flush && "gap-6 px-4 py-6 sm:px-6",
      )}
    >
      {aura ? <Aura variant="page" className="-z-10" /> : null}
      {children}
    </div>
  );
}
