import { Trans } from "@lingui/react/macro";
import { StorefrontIcon as Storefront } from "@phosphor-icons/react";

import { StatusDot } from "../../shared/ui/StatusDot.tsx";

/**
 * The shop the screens show. Until a shop is connected (Phase 4) it says so plainly; it
 * becomes a menu of the user's granted shops once shops can be connected.
 */
export function ShopSwitcher() {
  return (
    <div className="flex items-center gap-2.5 rounded-card border border-app-border bg-app-hover p-2.5">
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-control border border-dashed border-app-muted text-app-muted"
      >
        <Storefront size={14} weight="duotone" />
      </span>
      <span className="min-w-0 grow">
        <span className="block truncate text-body-sm font-semibold text-app-text">
          <Trans>No shop connected</Trans>
        </span>
        <span className="flex items-center gap-1.5 text-caption text-app-muted">
          <StatusDot status="offline" />
          <Trans>Etsy · not connected</Trans>
        </span>
      </span>
    </div>
  );
}
