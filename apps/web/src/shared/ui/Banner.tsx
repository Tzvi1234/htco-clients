import { CloudOff } from "lucide-react";
import type { ReactNode } from "react";

/** A full-width notice above the page content: offline, stale data or a retry. */
export function Banner({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-button border border-border-subtle bg-attention-subtle px-3 py-2 text-primary"
    >
      <CloudOff aria-hidden="true" size={20} strokeWidth={1.75} className="text-attention-text" />
      <p className="m-0 grow">{children}</p>
      {action}
    </div>
  );
}
