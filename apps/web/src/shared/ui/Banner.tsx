import { CloudOff } from "lucide-react";
import type { ReactNode } from "react";

/** A full-width notice under the page header: offline, stale data or a retry. */
export function Banner({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div
      role="status"
      className="flex animate-enter items-center gap-2 border-b border-border-subtle bg-attention-subtle px-4 py-2 text-body-sm text-primary sm:px-6"
    >
      <CloudOff aria-hidden="true" size={16} strokeWidth={1.75} className="text-attention-text" />
      <p className="m-0 grow">{children}</p>
      {action}
    </div>
  );
}
