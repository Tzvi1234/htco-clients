import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useId, useState, type ReactNode } from "react";

import { ORDER_STATE_GLYPH, shownState, useOrderStates } from "./OrdersPage.tsx";
import { useApi } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { buttonStyle } from "../../shared/ui/Button.tsx";
import { ArrowEndIcon } from "../../shared/ui/icons.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  DataTable,
  DemoPart,
  DemoTag,
  Figure,
  Figures,
  Flow,
  FlowBody,
  FlowRow,
  Focus,
  HBarList,
  KV,
  ListRow,
  N,
  SectionLabel,
  Status,
  SubTabs,
  TabPanel,
  ListingPhoto,
  LiveNote,
  LiveSkeleton,
  ShopChips,
} from "../../shared/ui/kit/index.ts";
import { LiveProblem, ShopReconnectBanner, NoShopYet } from "../shops/index.ts";
import {
  listingsQuery,
  ordersQuery,
  overviewQuery,
  shippingQuery,
  useLiveShop,
  type ShopOrder,
  type ShopShipping,
} from "../../shared/api/live.ts";
import { useCount, useMoney, useShortDate } from "../../shared/i18n/format.ts";

/**
 * Commerce › Shipping, live from Etsy (clarity round 3): what waits to ship on top with the one
 * action (ship on Etsy; HTCO only reads), then sub-tabs: the queue, the shop's shipping profiles
 * with its return policies and production partners, and tracking. Tracking sync and delivery
 * performance stay Demo until Phase 6 (fulfillment and incidents).
 */
export function ShippingPage() {
  const { t } = useLingui();
  const live = useLiveShop();
  return (
    <>
      <PageHeader title={t`Shipping`} />
      <Flow>
        {live.shop === undefined ? null : <ShopReconnectBanner shop={live.shop} />}
        {live.shop !== undefined ? (
          <Shipping key={live.shop.id} shopId={live.shop.id} chips={<ShopChips live={live} />} />
        ) : (
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
        )}
      </Flow>
    </>
  );
}

function Shipping({ shopId, chips }: { shopId: string; chips: ReactNode }) {
  const { t } = useLingui();
  const api = useApi();
  const count = useCount();
  const date = useShortDate();
  const states = useOrderStates();
  const tabs = useId();
  const [tab, setTab] = useState<"queue" | "profiles" | "tracking">("queue");
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
              className="rounded-control"
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

  const awaiting = orders.data?.counts.paid ?? 0;
  const late = orders.data?.counts.overdue ?? 0;
  const known = orders.data !== undefined;

  return (
    <>
      <Focus
        title={<Trans>What waits to ship</Trans>}
        meta={
          orders.data === undefined ? undefined : (
            <LiveNote
              fetchedAt={orders.data.fetched_at}
              stale={orders.data.stale}
              source={orders.data.source}
              sync={orders.data.sync ?? null}
            />
          )
        }
        end={chips}
        lead={
          !known ? (
            <Trans>What waits to ship and what shipped, live from Etsy.</Trans>
          ) : late > 0 ? (
            <Plural
              value={late}
              one="One order is past its ship-by date. Ship it on Etsy first."
              other="# orders are past their ship-by date. Ship them on Etsy first."
            />
          ) : awaiting > 0 ? (
            <Plural
              value={awaiting}
              one="One order waits to ship; none is late."
              other="# orders wait to ship; none is late."
            />
          ) : (
            <Trans>Nothing waits to ship.</Trans>
          )
        }
        figures={
          <Figures label={t`Shipping numbers`}>
            <Figure
              label={<Trans>Awaiting shipment</Trans>}
              value={<N>{known ? count(awaiting) : "—"}</N>}
              tone={awaiting > 0 ? "tertiary" : undefined}
            />
            <Figure
              label={<Trans>Late</Trans>}
              value={<N>{known ? count(late) : "—"}</N>}
              tone={late > 0 ? "tertiary" : undefined}
            />
            <Figure
              label={<Trans>Shipped, 30 days</Trans>}
              value={<N>{known ? count(orders.data.counts.shipped) : "—"}</N>}
            />
            <Figure
              label={<Trans>Ships from</Trans>}
              value={
                <span className="text-title-lg">
                  <Country code={overview.data?.profile.ships_from_country ?? null} />
                </span>
              }
            />
          </Figures>
        }
        actions={
          awaiting > 0 ? (
            // Shipping happens on Etsy (HTCO reads only): the link opens the shop's sold orders.
            <a
              href="https://www.etsy.com/your/orders/sold"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyle({ variant: "primary", size: "lg" })}
            >
              <Trans>Ship on Etsy</Trans>
              <ArrowEndIcon size={14} />
            </a>
          ) : undefined
        }
      />
      <SubTabs
        label={t`Shipping views`}
        idBase={tabs}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "queue", label: <Trans>To ship</Trans>, count: known ? awaiting : undefined },
          { id: "profiles", label: <Trans>Profiles and returns</Trans> },
          { id: "tracking", label: <Trans>Tracking</Trans>, demo: <DemoTag /> },
        ]}
      />
      <TabPanel idBase={tabs} tab={tab}>
        {tab === "queue" ? (
          <Panel>
            <PanelHeader
              title={<Trans>Orders to ship</Trans>}
              meta={<Trans>Waiting first, by ship-by date; then recently shipped</Trans>}
            />
            {orders.isError ? (
              <LiveProblem error={orders.error} onRetry={() => void orders.refetch()} />
            ) : orders.data === undefined ? (
              <LiveSkeleton rows={7} label={t`Loading shipping`} />
            ) : rows.length === 0 ? (
              <p className="m-0 px-6 py-16 text-center text-body-sm text-secondary">
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
                  flow
                  label={t`Orders to ship`}
                  head={columns.map((c) => c.header)}
                  phoneHidden={[1, 2, 5]}
                  rows={rows.map((o) => ({
                    key: String(o.order_id),
                    ...(o.overdue ? { className: "k-row-late" } : {}),
                    cells: columns.map((c) => c.cell(o)),
                  }))}
                />
              </>
            )}
          </Panel>
        ) : tab === "profiles" ? (
          <FlowRow layout="halves">
            <Panel>
              <PanelHeader
                title={<Trans>Shipping profiles</Trans>}
                meta={
                  shipping.data === undefined ? undefined : <N>{shipping.data.profiles.length}</N>
                }
              />
              {shipping.isError ? (
                <LiveProblem
                  compact
                  error={shipping.error}
                  onRetry={() => void shipping.refetch()}
                />
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
          </FlowRow>
        ) : (
          <Panel label={t`Delivery performance`}>
            <PanelHeader
              title={<Trans>Delivery performance</Trans>}
              actions={<DemoTag className="me-4" />}
            />
            <FlowBody className="gap-5">
              <p className="m-0 max-w-[62ch] text-body-sm text-secondary">
                <Trans>
                  Tracking sync and on-time delivery arrive with fulfilment. Until then, tracking
                  numbers are read from Etsy with each order, and nothing is synced from here.
                </Trans>
              </p>
              <DemoPart tag={false}>
                <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <KV
                    items={[
                      [
                        <Trans key="t">Tracking sync</Trans>,
                        <Status key="tv" live status="failed" />,
                      ],
                    ]}
                  />
                  <HBarList
                    label={t`Delivery performance`}
                    max={100}
                    items={[
                      { key: "on-time", label: t`On time`, value: 88, text: <N>88%</N> },
                      { key: "tracked", label: t`Tracked`, value: 96, text: <N>96%</N> },
                    ]}
                  />
                </div>
              </DemoPart>
            </FlowBody>
          </Panel>
        )}
      </TabPanel>
    </>
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
    <div className="flex flex-col px-6 pb-4 max-sm:px-4">
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
    <div className="flex flex-col gap-4 px-6 pb-6 max-sm:px-4">
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
