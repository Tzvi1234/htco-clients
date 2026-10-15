import { useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { meQuery, shopsQuery, useApi } from "../../shared/api/api.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { ChevronIcon } from "../../shared/ui/icons.tsx";

/**
 * The shop card at the top of the sidebar (Design 1C `.shop`): which shops the screens show.
 * It says plainly when none is connected, and opens Shops. It becomes a switcher of the user's
 * granted shops once screens filter by shop.
 */
export function ShopSwitcher() {
  const { t } = useLingui();
  const api = useApi();
  const me = useQuery(meQuery(api));
  const organizationId = me.data?.memberships[0]?.organization_id;
  const shops = useQuery({
    ...shopsQuery(api, organizationId ?? ""),
    enabled: organizationId !== undefined,
  });
  const count = shops.data?.length ?? 0;
  const name = count > 0 ? t`All shops` : t`No shop connected`;
  return (
    <Link
      to="/shops"
      title={name}
      aria-label={t`Shops: ${name}`}
      className={cx(
        "mx-3 mb-2 flex h-14 shrink-0 items-center gap-2.5 rounded-card bg-panel ps-2 pe-3.5 whitespace-nowrap text-primary no-underline outline-none",
        "transition-[background-color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:bg-hover active:scale-[0.98]",
        "group-data-[mini]/sb:mx-4 group-data-[mini]/sb:size-10 group-data-[mini]/sb:rounded-pill group-data-[mini]/sb:bg-transparent group-data-[mini]/sb:p-0",
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-pill bg-inverse text-caption text-on-inverse"
      >
        {count > 0 ? "AS" : "HT"}
      </span>
      <span className="min-w-0 grow group-data-[mini]/sb:hidden">
        <span className="block truncate text-body leading-tight">{name}</span>
        <span className="block truncate text-caption font-light text-muted">HT Commerce</span>
      </span>
      <ChevronIcon size={12} className="shrink-0 text-secondary group-data-[mini]/sb:hidden" />
    </Link>
  );
}
