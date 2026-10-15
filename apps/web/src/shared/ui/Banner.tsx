import { CloudSlashIcon as CloudSlash } from "@phosphor-icons/react";
import type { ReactNode } from "react";

/** A full-width notice under the page header: offline, stale data or a retry. */
export function Banner({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div
      role="status"
      className="flex animate-enter items-center gap-2 rounded-card bg-attention-subtle px-4 py-2 text-body-sm text-primary sm:px-6"
    >
      <CloudSlash aria-hidden="true" size={16} weight="duotone" className="shrink-0" />
      <p className="m-0 grow">{children}</p>
      {action}
    </div>
  );
}
