import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";

import {
  ListingPhoto,
  LiveNote,
  LiveProblem,
  LiveSkeleton,
  NoShopYet,
  listingsQuery,
  ordersQuery,
  overviewQuery,
  useCount,
  useLiveShop,
  useMoney,
  useShortDate,
  type OrderFilter,
  type ShopOrder,
} from "./live.tsx";
import { ShopChips } from "./ShopChips.tsx";
import { useApi } from "../../shared/api/api.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { PHONE_QUERY, useMediaQuery } from "../../shared/lib/useMediaQuery.ts";
import { Button, buttonStyle } from "../../shared/ui/Button.tsx";
import { ArrowEndIcon } from "../../shared/ui/icons.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Chip,
  DataTable,
  DotColumns,
  Figure,
  Figures,
  Flow,
  Focus,
  KV,
  N,
  Status,
  type AgentStatus,
} from "../../shared/ui/kit/index.ts";

/** How each state reads, and its glyph (the shape carries it, not the colour). */
export function useOrderStates(): Record<OrderFilter, string> {
  const { t } = useLingui();
  return {
    unpaid: t`Awaiting payment`,
    paid: t`Paid`,
    overdue: t`Late`,
    shipped: t`Shipped`,
    canceled: t`Cancelled`,
    refunded: t`Refunded`,
  };
}

export const ORDER_STATE_GLYPH: Record<OrderFilter, AgentStatus> = {
  unpaid: "queued",
  paid: "idle",
  overdue: "waityou",
  shipped: "delivered",
  canceled: "offline",
  refunded: "blocked",
};

/** An order's state as the table shows it: paid and past its ship-by date reads "Late". */
export function shownState(order: ShopOrder): OrderFilter {
  return order.overdue ? "overdue" : order.state;
}

const FILTERS: readonly (OrderFilter | "all")[] = [
  "all",
  "paid",
  "overdue",
  "shipped",
  "unpaid",
  "canceled",
  "refunded",
];

/** `.fl .tab`: a filter capsule with its count; the chosen one is ink. */
function FilterTab({
  on,
  count,
  onPress,
  children,
}: {
  on: boolean;
  count: number;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPress}
      className={cx(
        "inline-flex h-9 items-center gap-1.5 rounded-pill border px-3 text-caption whitespace-nowrap transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        on
          ? "border-inverse bg-inverse text-on-inverse"
          : "border-line-strong hover:border-line-hover",
      )}
    >
      {children}
      <span className={cx("ltr text-caption tabular", on ? "text-on-inverse-muted" : "text-muted")}>
        {count}
      </span>
    </button>
  );
}

/**
 * Commerce › Orders, live from Etsy: the shop's orders of the last 30 days with their state,
 * items, totals, ship-by dates and shipments. A read-through view until Phase 5 ingests orders
 * into HTCO's own store (the same screen then reads the store). Buyer names and tracking numbers
 * appear only for roles that may see buyer contacts; the server decides.
 */
export function OrdersPage() {
  const { t } = useLingui();
  const live = useLiveShop();
  return (
    <>
      <PageHeader title={t`Orders`} />
      <Flow>
        {live.shop !== undefined ? (
          <Orders key={live.shop.id} shopId={live.shop.id} chips={<ShopChips live={live} />} />
        ) : (
          // No shop yet (or still loading): one panel says so; no empty filters beside it.
          <Panel>
            <PanelHeader title={<Trans>Orders</Trans>} />
            {live.isError ? (
              <LiveProblem error={new Error("shops")} onRetry={live.refetch} />
            ) : live.shops === undefined ? (
              <LiveSkeleton rows={8} label={t`Loading orders`} />
            ) : (
              <NoShopYet
                what={<Trans>Connect your Etsy shop and its orders appear here, live.</Trans>}
              />
            )}
          </Panel>
        )}
      </Flow>
    </>
  );
}

function Orders({ shopId, chips }: { shopId: string; chips: ReactNode }) {
  const { t } = useLingui();
  const api = useApi();
  const money = useMoney();
  const count = useCount();
  const date = useShortDate();
  const states = useOrderStates();
  const phone = useMediaQuery(PHONE_QUERY);
  // One page at a time: 25 rows on wide screens, 20 on phones (fewer things, not smaller).
  const step = phone ? 20 : 25;
  const [filter, setFilter] = useState<OrderFilter | "all">("all");
  const [shown, setShown] = useState(step);
  const [open, setOpen] = useState<ShopOrder | null>(null);
  const choose = (f: OrderFilter | "all") => {
    setFilter(f);
    setShown(step);
  };
  const all = useQuery(ordersQuery(api, shopId));
  const overview = useQuery(overviewQuery(api, shopId));
  const listings = useQuery(listingsQuery(api, shopId));
  const photos = new Map(
    (listings.data?.items ?? []).map((l) => [l.listing_id, l.thumbnail_url] as const),
  );
  const orders = (all.data?.items ?? []).filter(
    (o) =>
      filter === "all" || (filter === "overdue" ? o.overdue : o.state === filter && !o.overdue),
  );
  const counts = all.data?.counts;
  const countOf = (f: OrderFilter | "all") =>
    counts === undefined
      ? 0
      : f === "all"
        ? (all.data?.total ?? 0)
        : f === "paid"
          ? counts.paid - counts.overdue
          : counts[f];
  const currency = orders[0]?.total.currency ?? overview.data?.profile.currency ?? "USD";
  const sum = orders.reduce((n, o) => n + Number(o.total.amount), 0);
  const week = overview.data?.sales?.daily.slice(-7) ?? [];
  const weekdays = week.map((d) => String(Number(d.date.slice(8, 10))));

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
        const more = o.items.length - 1;
        return (
          <span className="inline-flex min-w-0 items-center gap-2">
            <ListingPhoto
              src={first.listing_id === null ? null : photos.get(first.listing_id)}
              title={first.title}
              size={24}
              className="rounded-[6px]"
            />
            <span dir="auto" className="max-w-[180px] truncate">
              {first.title}
            </span>
            {first.quantity > 1 ? (
              <N className="text-muted">{`×${String(first.quantity)}`}</N>
            ) : null}
            {more > 0 ? <N className="text-muted">{`+${String(more)}`}</N> : null}
          </span>
        );
      },
    },
    { header: t`Total`, cell: (o) => <N>{money(o.total)}</N> },
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
          <time dateTime={o.ship_by} className={cx(o.overdue && "text-primary")}>
            {date(o.ship_by)}
          </time>
        ),
    },
    {
      header: t`Shipment`,
      cell: (o) => {
        const [sent] = o.shipments;
        if (sent === undefined) return <span className="text-muted">—</span>;
        // The carrier as a chip; the tracking number cut to fit, whole in its tooltip.
        return (
          <span className="inline-flex max-w-[200px] items-center gap-1.5">
            <Chip className="ltr">{sent.carrier}</Chip>
            {sent.tracking_code === null ? null : (
              <span
                className="ltr min-w-0 truncate text-caption text-muted tabular"
                title={sent.tracking_code}
              >
                {sent.tracking_code}
              </span>
            )}
          </span>
        );
      },
    },
  ];

  const late = counts?.overdue ?? 0;
  const awaiting = overview.data?.sales?.awaiting_shipment ?? counts?.paid ?? 0;
  const revenue30 = (overview.data?.sales?.daily ?? []).reduce((n, d) => n + Number(d.revenue), 0);

  return (
    <>
      <Focus
        title={<Trans>Last 30 days</Trans>}
        meta={
          all.data === undefined ? undefined : (
            <LiveNote fetchedAt={all.data.fetched_at} stale={all.data.stale} />
          )
        }
        end={chips}
        lead={
          all.data === undefined ? (
            <Trans>The shop's orders, live from Etsy.</Trans>
          ) : late > 0 ? (
            <Plural
              value={late}
              one="One order is past its ship-by date. Look at it first."
              other="# orders are past their ship-by date. Look at them first."
            />
          ) : awaiting > 0 ? (
            <Plural
              value={awaiting}
              one="One order waits to ship; none is late."
              other="# orders wait to ship; none is late."
            />
          ) : (
            <Trans>Every paid order is shipped.</Trans>
          )
        }
        figures={
          <Figures label={t`Order numbers`}>
            <Figure
              label={<Trans>Orders</Trans>}
              value={<N>{all.data === undefined ? "—" : count(all.data.total)}</N>}
            />
            <Figure
              label={<Trans>Awaiting shipment</Trans>}
              value={<N>{all.data === undefined ? "—" : count(awaiting)}</N>}
              tone={awaiting > 0 ? "tertiary" : undefined}
            />
            <Figure
              label={<Trans>Late</Trans>}
              value={<N>{all.data === undefined ? "—" : count(late)}</N>}
              tone={late > 0 ? "tertiary" : undefined}
            />
            {overview.data?.sales == null ? null : (
              <Figure
                label={<Trans>Revenue</Trans>}
                value={
                  <N>
                    {money(
                      { amount: String(revenue30), currency: overview.data.sales.currency },
                      { whole: true },
                    )}
                  </N>
                }
                note={<Trans>paid orders, before Etsy's fees</Trans>}
              />
            )}
          </Figures>
        }
        actions={
          late > 0 && filter !== "overdue" ? (
            <Button
              variant="primary"
              size="lg"
              onPress={() => {
                choose("overdue");
              }}
            >
              <Trans>Show the late orders</Trans>
            </Button>
          ) : awaiting > 0 ? (
            <Link
              to="/commerce/shipping"
              className={buttonStyle({ variant: "primary", size: "lg" })}
            >
              <Trans>Open what waits to ship</Trans>
              <ArrowEndIcon size={14} />
            </Link>
          ) : undefined
        }
        aside={
          week.length === 0 ? undefined : (
            <div className="flex flex-col items-center gap-2">
              <DotColumns
                values={week.map((d) => d.orders)}
                rows={6}
                highlight={6}
                gap={28}
                labels={weekdays}
                label={t`Orders per day in the last 7 days: ${week.map((d) => String(d.orders)).join(", ")}`}
              />
              <span className="text-caption font-light text-muted">
                <Trans>Orders per day, last 7 days</Trans>
              </span>
            </div>
          )
        }
      />
      <Panel>
        <PanelHeader title={<Trans>Filters</Trans>} />
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 px-6 pb-5 max-sm:px-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t`Status`}>
            {FILTERS.map((f) => (
              <FilterTab
                key={f}
                on={filter === f}
                count={countOf(f)}
                onPress={() => {
                  choose(f);
                }}
              >
                {f === "all" ? <Trans>All</Trans> : states[f]}
              </FilterTab>
            ))}
          </div>
          <KV
            className="min-w-[240px] max-sm:hidden"
            items={[
              [
                <Trans>Total shown</Trans>,
                <N key="sum">{money({ amount: String(sum), currency })}</N>,
              ],
              [
                <Trans>Average order</Trans>,
                <N key="avg">
                  {orders.length === 0
                    ? "—"
                    : money({ amount: String(sum / orders.length), currency })}
                </N>,
              ],
            ]}
          />
        </div>
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Orders</Trans>}
          meta={
            filter === "all" ? (
              <Trans>All states</Trans>
            ) : (
              <>
                {states[filter]} · <N>{count(orders.length)}</N>
              </>
            )
          }
        />
        {all.isError ? (
          <LiveProblem error={all.error} onRetry={() => void all.refetch()} />
        ) : all.data === undefined ? (
          <LiveSkeleton rows={9} label={t`Loading orders`} />
        ) : orders.length === 0 ? (
          <p className="m-0 px-6 py-16 text-center text-body-sm text-secondary">
            {all.data.total === 0
              ? t`No orders in the last 30 days.`
              : t`No orders match this filter.`}
          </p>
        ) : (
          <>
            {phone ? (
              <ul className="m-0 flex list-none flex-col gap-1.5 px-3 pb-2">
                {orders.slice(0, shown).map((o) => (
                  <li key={o.order_id}>
                    <OrderRow
                      order={o}
                      onOpen={() => {
                        setOpen(o);
                      }}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <DataTable
                flow
                label={t`Orders`}
                head={columns.map((c) => c.header)}
                ends={[3]}
                rows={orders.slice(0, shown).map((o) => ({
                  key: String(o.order_id),
                  ...(o.overdue ? { className: "k-row-late" } : {}),
                  cells: columns.map((c) => c.cell(o)),
                }))}
              />
            )}
            <div className="flex flex-col items-center gap-2 px-6 pt-2 pb-5">
              {orders.length > shown ? (
                <Button
                  onPress={() => {
                    setShown((n) => n + step);
                  }}
                >
                  {t`Show more (${count(orders.length - shown)} left)`}
                </Button>
              ) : null}
              {all.data.partial || all.data.total > all.data.items.length ? (
                <p className="m-0 text-caption text-muted">
                  {t`Showing the newest ${count(all.data.items.length)} orders of the last 30 days.`}
                </p>
              ) : null}
            </div>
          </>
        )}
      </Panel>
      {open === null ? null : (
        <OrderSheet
          order={open}
          photos={photos}
          onClose={() => {
            setOpen(null);
          }}
        />
      )}
    </>
  );
}

/** An order on a phone: number and total, then buyer, state and ship-by; a press opens it. */
function OrderRow({ order, onOpen }: { order: ShopOrder; onOpen: () => void }) {
  const money = useMoney();
  const date = useShortDate();
  const states = useOrderStates();
  const { t } = useLingui();
  const state = shownState(order);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cx(
        "flex w-full flex-col gap-1 rounded-card border px-4 py-3 text-start outline-none hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        order.overdue ? "border-line-strong bg-tertiary-subtle" : "border-line",
      )}
    >
      <span className="flex w-full items-baseline justify-between gap-3 text-body-sm">
        <N>{`#${String(order.order_id)}`}</N>
        <N>{money(order.total)}</N>
      </span>
      <span className="flex w-full items-center justify-between gap-3 text-caption text-secondary">
        <Status live status={ORDER_STATE_GLYPH[state]} label={states[state]} />
        <span className="truncate">
          {order.buyer === null ? null : (
            <>
              <N>{order.buyer}</N> ·{" "}
            </>
          )}
          {order.ship_by === null ? null : t`ship by ${date(order.ship_by)}`}
        </span>
      </span>
    </button>
  );
}

/** One order's items, shipment and dates, in a sheet over the list (phones). */
function OrderSheet({
  order,
  photos,
  onClose,
}: {
  order: ShopOrder;
  photos: Map<number, string | null>;
  onClose: () => void;
}) {
  const { t } = useLingui();
  const money = useMoney();
  const date = useShortDate();
  const states = useOrderStates();
  const state = shownState(order);
  const [sent] = order.shipments;
  return (
    <ModalOverlay
      isOpen
      isDismissable
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end bg-[color-mix(in_srgb,var(--bg-ground)_60%,transparent)]"
    >
      <Modal className="w-full animate-[htco-sheet-in_var(--motion-duration-slow)_var(--motion-easing-enter)_both] p-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        <Dialog className="outline-none" aria-label={t`Order ${String(order.order_id)}`}>
          <Panel>
            <PanelHeader
              title={<N>{`#${String(order.order_id)}`}</N>}
              actions={
                <Button variant="ghost" onPress={onClose}>
                  <Trans>Close</Trans>
                </Button>
              }
            />
            <div className="flex max-h-[70dvh] flex-col gap-4 overflow-auto px-6 pb-6">
              <KV
                items={[
                  [
                    <Trans>Status</Trans>,
                    <Status key="s" live status={ORDER_STATE_GLYPH[state]} label={states[state]} />,
                  ],
                  [<Trans>Total</Trans>, <N key="t">{money(order.total)}</N>],
                  ...(order.buyer === null
                    ? []
                    : [[<Trans>Customer</Trans>, <N key="b">{order.buyer}</N>] as const]),
                  [<Trans>Placed</Trans>, date(order.created_at)],
                  [<Trans>Ship by</Trans>, order.ship_by === null ? "—" : date(order.ship_by)],
                  [
                    <Trans>Shipment</Trans>,
                    sent === undefined ? (
                      "—"
                    ) : (
                      <span key="sh" className="flex flex-col items-end">
                        <N>{sent.carrier}</N>
                        {sent.tracking_code === null ? null : (
                          <N className="text-caption text-muted">{sent.tracking_code}</N>
                        )}
                      </span>
                    ),
                  ],
                ]}
              />
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {order.items.map((item, i) => (
                  <li
                    key={`${String(item.listing_id)}-${String(i)}`}
                    className="flex items-center gap-3"
                  >
                    <ListingPhoto
                      src={item.listing_id === null ? null : photos.get(item.listing_id)}
                      title={item.title}
                      size={40}
                    />
                    <span dir="auto" className="min-w-0 grow truncate text-body-sm">
                      {item.title}
                    </span>
                    <N className="text-caption text-secondary">{`×${String(item.quantity)}`}</N>
                    <N className="text-caption">{money(item.unit_price)}</N>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
