import { Trans } from "@lingui/react/macro";

/**
 * The shop the screens show. Until a shop is connected (Phase 9) it says so plainly; it
 * becomes a menu of the user's granted shops once `/v1/shops` exists.
 */
export function ShopSwitcher() {
  return (
    <div className="flex items-center gap-2 rounded-button border border-border-subtle p-2">
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-control border border-dashed border-border-strong text-caption font-semibold text-muted"
      >
        —
      </span>
      <span className="min-w-0 grow">
        <span className="block truncate font-semibold">
          <Trans>No shop connected</Trans>
        </span>
        <span className="block text-caption font-medium text-muted">
          <Trans>Etsy · not connected</Trans>
        </span>
      </span>
    </div>
  );
}
