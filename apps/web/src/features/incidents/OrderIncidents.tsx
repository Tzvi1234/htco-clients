import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { orderIncidentsQuery } from "./api.ts";
import { IncidentState, useIncidentWords } from "./IncidentState.tsx";
import { meQuery, useApi } from "../../shared/api/api.tsx";
import { TEXT_LINK } from "../../shared/ui/kit/index.ts";

/**
 * The order sheet's link to the order's incidents (slice 6.3, AC-6.1.2's timeline neighbour):
 * the incidents of this one order (its shop and its receipt, in the shop's workspace), with each
 * state as glyph and word and a link into the incident center. Nothing renders when the order
 * has none.
 */
export function OrderIncidents({
  organizationId,
  shopId,
  receiptId,
}: {
  organizationId: string;
  shopId: string;
  receiptId: number;
}) {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const list = useQuery({
    ...orderIncidentsQuery(api, organizationId, shopId, receiptId),
    retry: false,
  });
  const words = useIncidentWords();
  // The API filters already; the check stays so a receipt of another shop never shows here.
  const found = (list.data ?? []).filter(
    (incident) => incident.shop_id === shopId && incident.receipt_id === receiptId,
  );
  if (found.length === 0) return null;
  const several = (me.data?.memberships.length ?? 0) > 1;
  return (
    <section
      aria-labelledby={`order-incidents-${String(receiptId)}`}
      className="flex flex-col gap-2"
    >
      <h3 id={`order-incidents-${String(receiptId)}`} className="text-label text-secondary">
        <Trans>Incidents</Trans>
      </h3>
      <ul className="flex flex-col gap-1.5">
        {found.map((incident) => {
          const cause = words.cause(incident.cause);
          return (
            <li key={incident.id} className="flex flex-wrap items-center gap-2">
              <IncidentState state={incident.state} />
              <Link
                to="/incidents/{-$incidentId}"
                params={{ incidentId: incident.id }}
                search={several ? { workspace: organizationId } : {}}
                className={TEXT_LINK}
              >
                <Trans>Open the incident: {cause}</Trans>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
