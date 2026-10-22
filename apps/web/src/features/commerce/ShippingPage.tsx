import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ORDER_STATE_GLYPH, shownState, useOrderStates } from "./OrdersPage.tsx";
import {
  ListingPhoto,
  LiveNote,
  LiveProblem,
  LiveSkeleton,
  NoShopYet,
  listingsQuery,
  ordersQuery,
  overviewQuery,
  shippingQuery,
  useCount,
  useLiveShop,
  useMoney,
  useShortDate,
  type ShopOrder,
  type ShopShipping,
} from "./live.tsx";
import { ShopChips } from "./ShopChips.tsx";
import { useApi } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  DataTable,
  DemoPart,
  IdBlock,
  KV,
  ListRow,
  Matrix,
  N,
  Screen,
  SectionLabel,
  Stack,
  Status,
} from "../../shared/ui/kit/index.ts";

/**
 * Commerce › Shipping, live from Etsy: what waits to ship and what shipped, the shop's shipping
 * profiles, return policy and production partners. Tracking sync and delivery performance stay
 * Demo until Phase 6 (fulfillment and incidents).
 */
export function ShippingPage() {
  const { t } = useLingui();
  const live = useLiveShop();
  return (
    <>
      <PageHeader title={t`Shipping`} />
      {live.shop !== undefined ? (
        <Shipping key={live.shop.id} shopId={live.shop.id} chips={<ShopChips live={live} />} />
      ) : (
        <Screen layout="l3">
          <Panel>
            <PanelHeader title={<Trans>Shipments</Trans>} />
          </Panel>
          <Panel>
            <PanelHeader title={<Trans>Orders to ship</Trans>} />
            {live.isError ? (
              <LiveProblem error={new Error("shops")} onRetry={live.refetch} />
            ) : live.shops === undefined ? (
              <LiveSkeleton rows={6} label={t`Loading shipping`} />
            ) : (
              <NoShopYet
                what={<Trans>Connect your Etsy shop and its shipments appear here, live.</Trans>}
              />
            )}
          </Panel>
          <Panel>
            <PanelHeader title={<Trans>Shipping profiles</Trans>} />
          </Panel>
        </Screen>
      )}
    </>
  );
}

function Shipping({ shopId, chips }: { shopId: string; chips: ReactNode }) {
  const { t } = useLingui();
  const api = useApi();
  const count = useCount();
  const date = useShortDate();
  const states = useOrderStates();
  const orders = useQuery(ordersQuery(api, shopId));
  const overview = useQuery(overviewQuery(api, shopId));
  const shipping = useQuery(shippingQuery(api, shopId));
  const listings = useQuery(listingsQuery(api, shopId));
  const photos = new Map(
    (listings.data?.items ?? []).map((l) => [l.listing_id, l.thumbnail_url] as const),
  );
  const all = orders.data?.items ?? [];
  const toShip = all.filter((o) => o.state === "paid");
  const shipped = all.filter((o) => o.state === "shipped" && o.shipments.length > 0);
  const rows = [
    ...toShip.sort((a, b) => (a.ship_by ?? "").localeCompare(b.ship_by ?? "")),
    ...shipped.slice(0, 20),
  ];
  const columns: { header: ReactNode; cell: (o: ShopOrder) => ReactNode }[] = [
    { header: t`Order`, cell: (o) => <N>{`#${String(o.order_id)}`}</N> },
    {
      header: t`Customer`,
      cell: (o) => (o.buyer === null ? <span className="text-muted">—</span> : <N>{o.buyer}</N>),
    },
    {
      header: t`Items`,
      cell: (o) => {
        const [first] = o.items;
        if (first === undefined) return <span className="text-muted">—</span>;
        return (
          <span className="inline-flex min-w-0 items-center gap-2">
            <ListingPhoto
              src={first.listing_id === null ? null : photos.get(first.listing_id)}
              title={first.title}
              size={24}
              className="rounded-[6px]"
            />
            <span dir="auto" className="block max-w-[200px] truncate">
              {first.title}
            </span>
          </span>
        );
      },
    },
    {
      header: t`Status`,
      cell: (o) => (
        <Status live status={ORDER_STATE_GLYPH[shownState(o)]} label={states[shownState(o)]} />
      ),
    },
    {
      header: t`Ship by`,
      cell: (o) =>
        o.ship_by === null ? (
          <span className="text-muted">—</span>
        ) : (
          <time dateTime={o.ship_by}>{date(o.ship_by)}</time>
        ),
    },
    {
      header: t`Shipment`,
      cell: (o) => {
        const [sent] = o.shipments;
        return sent === undefined ? (
          <span className="text-muted">—</span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <N>{sent.carrier}</N>
            <time dateTime={sent.shipped_at} className="text-muted">
              {date(sent.shipped_at)}
            </time>
          </span>
        );
      },
    },
  ];

  return (
    <Screen layout="l3">
      <Panel>
        <PanelHeader title={<Trans>Shipments</Trans>} />
        <div className="flex min-h-0 grow flex-col justify-between gap-6 overflow-auto px-6 pb-6">
          <IdBlock
            label={<Trans>Awaiting shipment:</Trans>}
            value={<N>{orders.data === undefined ? "—" : count(orders.data.counts.paid)}</N>}
          />
          {chips}
          <KV
            items={[
              [
                <Trans>Shipped, 30 days</Trans>,
                <N key="s">{count(orders.data?.counts.shipped ?? 0)}</N>,
              ],
              [<Trans>Late</Trans>, <N key="l">{count(orders.data?.counts.overdue ?? 0)}</N>],
              [
                <Trans>Ships from</Trans>,
                <Country key="c" code={overview.data?.profile.ships_from_country ?? null} />,
              ],
            ]}
          />
          <DemoPart tag="edge" className="max-sm:hidden">
            <div className="flex flex-col gap-4">
              <KV
                items={[[<Trans>Tracking sync</Trans>, <Status key="t" live status="failed" />]]}
              />
              <Matrix
                top={<Trans>Delivery performance</Trans>}
                start={<Trans>On time</Trans>}
                end={<Trans>Cost</Trans>}
                bottom={<Trans>Speed</Trans>}
                value="88"
                caption={<Trans>On target</Trans>}
                k={4}
              />
            </div>
          </DemoPart>
        </div>
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Orders to ship</Trans>}
          meta={
            orders.data === undefined ? undefined : (
              <LiveNote fetchedAt={orders.data.fetched_at} stale={orders.data.stale} />
            )
          }
        />
        {orders.isError ? (
          <LiveProblem error={orders.error} onRetry={() => void orders.refetch()} />
        ) : orders.data === undefined ? (
          <LiveSkeleton rows={7} label={t`Loading shipping`} />
        ) : rows.length === 0 ? (
          <p className="m-0 flex grow items-center justify-center px-6 py-12 text-center text-body-sm text-secondary">
            <Trans>Nothing to ship and nothing shipped in the last 30 days.</Trans>
          </p>
        ) : (
          <>
            {orders.data.partial || orders.data.total > orders.data.items.length ? (
              <p role="status" className="m-0 px-6 pb-2 text-caption text-secondary">
                {t`This shop has more orders than one read covers: the newest ${count(orders.data.items.length)} are listed; the counts cover them all.`}
              </p>
            ) : null}
            <DataTable
              label={t`Orders to ship`}
              head={columns.map((c) => c.header)}
              phoneHidden={[1, 2, 5]}
              wideOnly={[2]}
              rows={rows.map((o) => ({
                key: String(o.order_id),
                cells: columns.map((c) => c.cell(o)),
              }))}
            />
          </>
        )}
      </Panel>
      <Stack>
        <Panel>
          <PanelHeader
            title={<Trans>Shipping profiles</Trans>}
            meta={shipping.data === undefined ? undefined : <N>{shipping.data.profiles.length}</N>}
          />
          {shipping.isError ? (
            <LiveProblem compact error={shipping.error} onRetry={() => void shipping.refetch()} />
          ) : shipping.data === undefined ? (
            <LiveSkeleton rows={3} label={t`Loading shipping profiles`} />
          ) : (
            <Profiles shipping={shipping.data} />
          )}
        </Panel>
        <Panel>
          <PanelHeader title={<Trans>Returns and partners</Trans>} />
          {shipping.data === undefined ? null : <Policies shipping={shipping.data} />}
        </Panel>
      </Stack>
    </Screen>
  );
}

/** A country's name in the user's language, its code kept left-to-right when unknown. */
function Country({ code }: { code: string | null }) {
  const { locale } = useLocale();
  if (code === null) return <span className="text-muted">—</span>;
  let name: string | undefined;
  try {
    name = new Intl.DisplayNames([locale], { type: "region" }).of(code);
  } catch {
    name = undefined;
  }
  return name === undefined ? <N>{code}</N> : <span>{name}</span>;
}

function Profiles({ shipping }: { shipping: ShopShipping }) {
  const { t } = useLingui();
  const money = useMoney();
  if (shipping.profiles.length === 0)
    return (
      <p className="m-0 px-6 pb-6 text-body-sm text-secondary">
        <Trans>No shipping profiles on Etsy.</Trans>
      </p>
    );
  return (
    <div className="flex min-h-0 grow flex-col overflow-auto px-6 pb-4">
      {shipping.profiles.map((p) => {
        const cheapest = [...p.destinations].sort(
          (a, b) => Number(a.first_item.amount) - Number(b.first_item.amount),
        )[0];
        const days = p.destinations.flatMap((d) =>
          d.min_delivery_days === null || d.max_delivery_days === null
            ? []
            : [d.min_delivery_days, d.max_delivery_days],
        );
        const range =
          days.length === 0
            ? undefined
            : `${String(Math.min(...days))}–${String(Math.max(...days))}`;
        const destinations = String(p.destinations.length);
        return (
          <ListRow
            key={p.profile_id}
            title={<bdi>{p.title ?? t`Untitled profile`}</bdi>}
            line={
              <>
                {t`${destinations} destinations`}
                {range === undefined ? null : <> · {t`${range} days`}</>}
              </>
            }
            end={
              cheapest === undefined ? undefined : (
                <span className="text-caption text-secondary">
                  {t`from`} <N>{money(cheapest.first_item)}</N>
                </span>
              )
            }
          />
        );
      })}
    </div>
  );
}

function Policies({ shipping }: { shipping: ShopShipping }) {
  const { t } = useLingui();
  const returns = (policy: ShopShipping["return_policies"][number]) =>
    policy.accepts_returns
      ? policy.return_deadline_days === null
        ? t`Accepted`
        : t`Within ${String(policy.return_deadline_days)} days`
      : t`Not accepted`;
  return (
    <div className="flex min-h-0 grow flex-col gap-4 overflow-auto px-6 pb-6">
      {/* Every policy the shop has (listings each use one): none is shown as the shop's only
          one (Codex review of #35). */}
      {shipping.return_policies.length === 0 ? (
        <p className="m-0 text-caption text-secondary">
          <Trans>No return policy on Etsy.</Trans>
        </p>
      ) : (
        shipping.return_policies.map((policy, i) => (
          <div key={policy.policy_id}>
            {shipping.return_policies.length > 1 ? (
              <SectionLabel>{t`Return policy ${String(i + 1)}`}</SectionLabel>
            ) : null}
            <KV
              items={[
                [<Trans key="r">Returns</Trans>, returns(policy)],
                [
                  <Trans key="e">Exchanges</Trans>,
                  policy.accepts_exchanges ? t`Accepted` : t`Not accepted`,
                ],
              ]}
            />
          </div>
        ))
      )}
      <div>
        <SectionLabel>
          <Trans>Production partners</Trans>
        </SectionLabel>
        {shipping.production_partners.length === 0 ? (
          <p className="m-0 text-caption text-secondary">
            <Trans>The shop makes its items itself.</Trans>
          </p>
        ) : (
          shipping.production_partners.map((p) => (
            <ListRow
              key={p.partner_id}
              title={<bdi>{p.name}</bdi>}
              line={<bdi>{p.location}</bdi>}
            />
          ))
        )}
      </div>
    </div>
  );
}
