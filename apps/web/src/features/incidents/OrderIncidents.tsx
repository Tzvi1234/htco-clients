import { Trans } from "@lingui/react/macro";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { incidentsQuery } from "./api.ts";
import { IncidentState, useIncidentWords } from "./IncidentState.tsx";
import { meQuery, useApi } from "../../shared/api/api.tsx";
import { TEXT_LINK } from "../../shared/ui/kit/index.ts";

/**
 * The order sheet's link to the order's incidents (slice 6.3, AC-6.1.2's timeline neighbour):
 * every incident of this receipt in the user's workspaces, with its state as glyph and word and
 * a link into the incident center. Nothing renders when the order has none.
 */
export function OrderIncidents({ receiptId }: { receiptId: number }) {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const ids = (me.data?.memberships ?? []).map((m) => m.organization_id);
  const lists = useQueries({
    queries: ids.map((id) => ({ ...incidentsQuery(api, id, "all"), retry: false })),
  });
  const words = useIncidentWords();
  const found = lists.flatMap((list, index) =>
    (list.data ?? [])
      .filter((incident) => incident.receipt_id === receiptId)
      .map((incident) => ({ incident, workspace: ids[index] ?? "" })),
  );
  if (found.length === 0) return null;
  return (
    <section
      aria-labelledby={`order-incidents-${String(receiptId)}`}
      className="flex flex-col gap-2"
    >
      <h3 id={`order-incidents-${String(receiptId)}`} className="text-label text-secondary">
        <Trans>Incidents</Trans>
      </h3>
      <ul className="flex flex-col gap-1.5">
        {found.map(({ incident, workspace }) => {
          const cause = words.cause(incident.cause);
          return (
            <li key={incident.id} className="flex flex-wrap items-center gap-2">
              <IncidentState state={incident.state} />
              <Link
                to="/incidents/{-$incidentId}"
                params={{ incidentId: incident.id }}
                search={ids.length > 1 ? { workspace } : {}}
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
