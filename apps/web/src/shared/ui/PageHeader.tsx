import type { ReactNode } from "react";

/** The page title (the page's only h1) and an optional one-line description. */
export function PageHeader({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="m-0 text-title font-semibold">{title}</h1>
      {description === undefined ? null : <p className="m-0 text-secondary">{description}</p>}
    </header>
  );
}
