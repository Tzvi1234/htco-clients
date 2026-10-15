import { Trans } from "@lingui/react/macro";
import { Store } from "lucide-react";

import { StatusDot } from "../../shared/ui/StatusDot.tsx";

/**
 * The shop the screens show. Until a shop is connected (Phase 4) it says so plainly; it
 * becomes a menu of the user's granted shops once shops can be connected.
 */
export function ShopSwitcher() {
  return (
    <div className="flex items-center gap-2.5 rounded-card border border-border-subtle bg-surface p-2.5 shadow-1">
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-control border border-dashed border-border-control text-icon-muted"
      >
        <Store size={14} strokeWidth={1.85} />
      </span>
      <span className="min-w-0 grow">
        <span className="block truncate text-body-sm font-semibold">
          <Trans>No shop connected</Trans>
        </span>
        <span className="flex items-center gap-1.5 text-caption text-muted">
          <StatusDot status="offline" />
          <Trans>Etsy · not connected</Trans>
        </span>
      </span>
    </div>
  );
}
