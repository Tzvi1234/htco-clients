import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";
import { ObjectIcon, type Hue } from "./Tag.tsx";

interface StateCardProps {
  title: ReactNode;
  description: ReactNode;
  /** 1 when the state replaces the whole page (not found, failed screen); else 2 or 3. */
  headingLevel?: 1 | 2 | 3;
  /** The record type's icon and hue, shown large above the title. */
  icon?: Icon;
  hue?: Hue;
  /** Faded placeholder rows that show the shape of what will appear here (never fake data). */
  preview?: boolean;
  /** Sit inside a table or panel without a frame of its own. */
  bare?: boolean;
  children?: ReactNode;
}

/** Three faded rows in the shape of a record list: what will fill this place. */
function PreviewRows() {
  return (
    <div aria-hidden="true" className="flex w-full max-w-[420px] flex-col gap-2">
      {/* Each row fades a little more, downwards. */}
      {["opacity-90", "opacity-60", "opacity-30"].map((fade) => (
        <div
          key={fade}
          className={cx(
            "flex items-center gap-3 rounded-button border border-border-subtle bg-surface px-3 py-2.5 shadow-1",
            fade,
          )}
        >
          <span className="size-7 shrink-0 rounded-control bg-sunken" />
          <span className="flex grow flex-col gap-1.5">
            <span className="h-2 w-2/5 rounded-pill bg-border-strong" />
            <span className="h-2 w-3/5 rounded-pill bg-sunken" />
          </span>
          <span className="h-4 w-14 rounded-tag bg-sunken" />
        </div>
      ))}
    </div>
  );
}

/**
 * A state that explains itself (design/README.md, UX rule 7): the record type's icon, a short
 * title, one sentence, one action or a plain "not yet", and optionally the shape of what will
 * appear, so an empty page still teaches the product.
 */
export function StateCard({
  title,
  description,
  headingLevel = 2,
  icon,
  hue = "iris",
  preview = false,
  bare = false,
  children,
}: StateCardProps) {
  const Heading = (["h1", "h2", "h3"] as const)[headingLevel - 1] ?? "h2";
  return (
    <section
      className={cx(
        "mx-auto flex w-full max-w-[560px] flex-col items-center gap-2 px-6 text-center",
        bare ? "py-12" : "rounded-dialog border border-border-subtle bg-surface py-10 shadow-1",
      )}
    >
      {preview ? (
        <div className="relative mb-6 flex w-full justify-center">
          <PreviewRows />
          {icon === undefined ? null : (
            <span className="absolute -bottom-5 start-1/2 -translate-x-1/2 rounded-button bg-canvas p-1 rtl:translate-x-1/2">
              <ObjectIcon hue={hue} size="lg" icon={icon} />
            </span>
          )}
        </div>
      ) : icon === undefined ? null : (
        <div className="mb-3">
          <ObjectIcon hue={hue} size="lg" icon={icon} />
        </div>
      )}
      <Heading className="m-0 font-display text-title-sm font-semibold">{title}</Heading>
      <p className="m-0 max-w-[44ch] text-secondary">{description}</p>
      {children === undefined ? null : (
        <div className="mt-3 flex flex-col items-center gap-2">{children}</div>
      )}
    </section>
  );
}

/** Nothing here yet, and what to do about it. */
export function EmptyState(props: StateCardProps) {
  return <StateCard preview {...props} />;
}
