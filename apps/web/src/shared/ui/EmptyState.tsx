import type { ReactNode } from "react";

import { EmptyArt } from "../art/RelayArt.tsx";
import { cx } from "../lib/cx.ts";

interface StateCardProps {
  title: ReactNode;
  description: ReactNode;
  /** 1 when the state replaces the whole page (not found, failed screen); else 2 or 3. */
  headingLevel?: 1 | 2 | 3;
  illustration?: boolean;
  /** Sit inside a table or panel without a frame of its own. */
  bare?: boolean;
  children?: ReactNode;
}

/** A centred block that explains a state and offers the next step (one sentence, one action). */
export function StateCard({
  title,
  description,
  headingLevel = 2,
  illustration = false,
  bare = false,
  children,
}: StateCardProps) {
  const Heading = (["h1", "h2", "h3"] as const)[headingLevel - 1] ?? "h2";
  return (
    <section
      className={cx(
        "mx-auto flex w-full max-w-[460px] flex-col items-center gap-2 px-6 text-center",
        bare ? "py-12" : "rounded-card border border-border-subtle bg-surface py-10",
      )}
    >
      {illustration ? <EmptyArt className="mb-3" /> : null}
      <Heading className="m-0 text-title-sm font-semibold">{title}</Heading>
      <p className="m-0 max-w-[40ch] text-secondary">{description}</p>
      {children === undefined ? null : (
        <div className="mt-3 flex flex-col items-center gap-2">{children}</div>
      )}
    </section>
  );
}

/** Nothing here yet, and what to do about it. */
export function EmptyState(props: Omit<StateCardProps, "illustration">) {
  return <StateCard {...props} illustration />;
}
