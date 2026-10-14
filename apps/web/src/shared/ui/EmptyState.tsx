import type { ReactNode } from "react";

/** The brand mark's rings and dot: the illustration for "nothing here yet". */
function RingsIllustration() {
  return (
    <svg width="96" height="56" viewBox="0 0 96 56" aria-hidden="true">
      <circle cx="28" cy="28" r="20" fill="none" stroke="var(--accent-fill)" strokeWidth="8" />
      <circle
        cx="62"
        cy="28"
        r="20"
        fill="none"
        stroke="var(--accent-fill)"
        strokeWidth="8"
        opacity="0.55"
      />
      <circle cx="86" cy="44" r="7" fill="var(--attention-dot)" />
    </svg>
  );
}

interface StateCardProps {
  title: ReactNode;
  description: ReactNode;
  /** 1 when the state replaces the whole page (not found, failed screen); else 2 or 3. */
  headingLevel?: 1 | 2 | 3;
  illustration?: boolean;
  children?: ReactNode;
}

/** A centred card that explains a state and offers the next step. */
export function StateCard({
  title,
  description,
  headingLevel = 2,
  illustration = false,
  children,
}: StateCardProps) {
  const Heading = (["h1", "h2", "h3"] as const)[headingLevel - 1] ?? "h2";
  return (
    <section className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-3 rounded-card border border-border-subtle bg-surface px-6 py-8 text-center">
      {illustration ? <RingsIllustration /> : null}
      <Heading className="m-0 text-title-sm font-semibold">{title}</Heading>
      <p className="m-0 max-w-[34ch] text-secondary">{description}</p>
      {children}
    </section>
  );
}

/** Nothing here yet, and what to do about it. */
export function EmptyState(props: Omit<StateCardProps, "illustration">) {
  return <StateCard {...props} illustration />;
}
