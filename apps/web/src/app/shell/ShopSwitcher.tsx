import { useLingui } from "@lingui/react/macro";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { meQuery, shopsQuery, useApi } from "../../shared/api/api.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { ChevronGlyph } from "../../shared/ui/kit/index.ts";

interface WorkspaceShops {
  status: "pending" | "error" | "success";
  count: number;
}

/**
 * What the card can honestly say from every workspace's shops: there are shops as soon as one
 * workspace has some; none only when every workspace answered with none; otherwise unknown
 * (still loading, or a list could not be read).
 */
export function shopCardState(workspaces: readonly WorkspaceShops[]): "shops" | "none" | "unknown" {
  if (workspaces.some(({ status, count }) => status === "success" && count > 0)) return "shops";
  if (workspaces.length > 0 && workspaces.every(({ status }) => status === "success")) {
    return "none";
  }
  return "unknown";
}

/**
 * The shop card at the top of the sidebar (Design 1C `.shop`): the shops of every workspace the
 * user belongs to. It says "No shop connected" only once every workspace has answered, and opens
 * Shops. It becomes a switcher of the user's granted shops once screens filter by shop.
 */
export function ShopSwitcher() {
  const { t } = useLingui();
  const api = useApi();
  const me = useQuery(meQuery(api));
  const organizations = me.data?.memberships.map((m) => m.organization_id) ?? [];
  const workspaces = useQueries({
    queries: organizations.map((organizationId) => shopsQuery(api, organizationId)),
    combine: (results) =>
      results.map((result): WorkspaceShops => ({
        status: result.status,
        count: result.data?.length ?? 0,
      })),
  });
  const state = shopCardState(workspaces);
  const name =
    state === "shops" ? t`All shops` : state === "none" ? t`No shop connected` : t`Your shops`;
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
        {state === "shops" ? "AS" : "HT"}
      </span>
      <span className="min-w-0 grow group-data-[mini]/sb:hidden">
        <span className="block truncate text-body leading-tight">{name}</span>
        <span className="block truncate text-caption font-light text-muted">HT Commerce</span>
      </span>
      <ChevronGlyph size={12} className="shrink-0 text-secondary group-data-[mini]/sb:hidden" />
    </Link>
  );
}
