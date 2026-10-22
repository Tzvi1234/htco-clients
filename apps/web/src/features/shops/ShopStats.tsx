import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import {
  LiveNote,
  LiveProblem,
  LiveSkeleton,
  statsQuery,
  useCount,
  useMoney,
  useShortDate,
  type AllTimeSales,
  type ShopStats as Stats,
} from "../commerce/live.tsx";
import { useApi } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { Segmented } from "../../shared/ui/Segmented.tsx";
import { DotColumns, Figure, Figures, FlowRow, Focus, N } from "../../shared/ui/kit/index.ts";

interface LiveShop {
  id: string;
  name: string;
}

/** Whole months from `from` to `to`. */
function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    to.getUTCMonth() -
    from.getUTCMonth() -
    (to.getUTCDate() < from.getUTCDate() ? 1 : 0)
  );
}

function useMonthName(): (iso: string, style?: "long" | "short") => string {
  const { locale } = useLocale();
  return (iso, style = "long") =>
    new Intl.DateTimeFormat(locale, {
      month: style,
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}

function useCountryName(): (code: string) => string {
  const { locale } = useLocale();
  return (code) => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
    } catch {
      return code;
    }
  };
}

/**
 * Shops › Statistics: one shop since it opened. Etsy's own counts (opened, total sales,
 * reviews, favourites, listings) and the aggregates of its order history as the API read it
 * (revenue before Etsy's fees, average order, orders per month, best month, top products,
 * countries). Every figure says where it comes from; when the API read only the newest orders,
 * the screen says so. Aggregates only: no buyer appears here.
 */
export function ShopStats({ shops }: { shops: readonly LiveShop[] }) {
  const { t } = useLingui();
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const shop = shops.find((s) => s.id === chosen) ?? shops[0];
  if (shop === undefined)
    return (
      <Panel>
        <p className="m-0 px-6 py-12 text-center text-body-sm text-secondary">
          {t`Statistics appear here once a shop is connected.`}
        </p>
      </Panel>
    );
  return (
    <ShopFigures
      key={shop.id}
      shop={shop}
      picker={
        shops.length > 1 ? (
          <Segmented
            label={t`Shop`}
            value={shop.id}
            onChange={setChosen}
            options={shops.map((s) => ({ id: s.id, label: s.name }))}
          />
        ) : undefined
      }
    />
  );
}

function ShopFigures({ shop, picker }: { shop: LiveShop; picker: ReactNode }) {
  const { t } = useLingui();
  const api = useApi();
  const stats = useQuery(statsQuery(api, shop.id));
  const data = stats.data;

  if (stats.isError)
    return (
      <Panel>
        <PanelHeader title={<Trans>Since the shop opened</Trans>} />
        <LiveProblem error={stats.error} onRetry={() => void stats.refetch()} />
      </Panel>
    );
  if (data === undefined)
    return (
      <Panel>
        <PanelHeader title={<Trans>Since the shop opened</Trans>} />
        <LiveSkeleton rows={5} label={t`Loading statistics`} />
      </Panel>
    );
  return (
    <>
      <Hero shop={shop} stats={data} picker={picker} />
      {data.sales === null ? (
        <Panel>
          <p className="m-0 px-6 py-10 text-center text-body-sm text-secondary">
            {t`The shop's orders could not be read from Etsy right now, so only Etsy's own counts show.`}
          </p>
        </Panel>
      ) : data.sales.orders === 0 ? null : (
        <FlowRow layout="thirds" className="items-stretch">
          <BestMonth sales={data.sales} />
          <TopProducts sales={data.sales} />
          <Countries sales={data.sales} />
        </FlowRow>
      )}
    </>
  );
}

function Hero({ shop, stats, picker }: { shop: LiveShop; stats: Stats; picker: ReactNode }) {
  const { t } = useLingui();
  const money = useMoney();
  const count = useCount();
  const date = useShortDate();
  const monthName = useMonthName();
  const { profile, sales } = stats;
  const opened = new Date(profile.opened_at);
  const months = Math.max(0, monthsBetween(opened, new Date()));
  const years = Math.floor(months / 12);
  const since = monthName(profile.opened_at);
  const sold = count(profile.sold_count);
  const recent = sales?.monthly.slice(-12) ?? [];
  const average = sales?.average_order_value ?? null;

  const lead = (
    <>
      {years >= 1 ? (
        <Trans>
          Open for <Plural value={years} one="# year" other="# years" />, since {since}:
        </Trans>
      ) : (
        <Trans>
          Open for <Plural value={months} one="# month" other="# months" />, since {since}:
        </Trans>
      )}{" "}
      {profile.review_average === null || profile.review_count === null ? (
        <Trans>
          <N>{sold}</N> sales on Etsy.
        </Trans>
      ) : (
        <Trans>
          <N>{sold}</N> sales on Etsy, rated <N>{Number(profile.review_average).toFixed(1)}</N> in{" "}
          <N>{count(profile.review_count)}</N> reviews.
        </Trans>
      )}
    </>
  );

  return (
    <Focus
      title={<Trans>Since the shop opened</Trans>}
      meta={
        <>
          <span dir="auto">{shop.name}</span> ·{" "}
          <LiveNote fetchedAt={stats.fetched_at} stale={stats.stale} />
        </>
      }
      end={picker}
      lead={lead}
      figures={
        <Figures label={t`Shop statistics`}>
          <Figure
            label={<Trans>Total sales</Trans>}
            value={<N>{sold}</N>}
            note={<Trans>Etsy's count</Trans>}
          />
          {sales === null ? null : (
            <>
              <Figure
                label={<Trans>Revenue</Trans>}
                value={<N>{money(sales.revenue, { whole: true })}</N>}
                note={<Trans>gross, before Etsy's fees</Trans>}
              />
              <Figure
                label={<Trans>Average order</Trans>}
                value={<N>{average === null ? "—" : money(average)}</N>}
                note={t`over ${count(sales.orders)} orders`}
              />
            </>
          )}
          <Figure label={<Trans>Favourites</Trans>} value={<N>{count(profile.favorer_count)}</N>} />
          <Figure
            label={<Trans>Listings</Trans>}
            value={<N>{count(profile.active_listing_count)}</N>}
            {...(profile.digital_listing_count > 0
              ? { note: t`${count(profile.digital_listing_count)} digital` }
              : {})}
          />
        </Figures>
      }
      footer={
        sales === null || sales.first_order_at === null ? undefined : (
          <p className="m-0 text-caption text-muted">
            {sales.partial
              ? t`Based on the latest ${count(sales.receipts_read)} orders, since ${date(sales.first_order_at)}. Total sales is Etsy's own count; revenue, averages and months come from these orders.`
              : t`Revenue, averages and months come from all ${count(sales.receipts_read)} orders since ${date(sales.first_order_at)}. Total sales is Etsy's own count of items sold.`}
          </p>
        )
      }
      aside={
        recent.length === 0 ? undefined : (
          <div className="flex flex-col items-center gap-2">
            <DotColumns
              values={recent.map((m) => m.orders)}
              rows={8}
              highlight={recent.length - 1}
              gap={20}
              labels={recent.map((m) => String(Number(m.month.slice(5, 7))))}
              label={t`Orders per month, last 12 months: ${recent.map((m) => String(m.orders)).join(", ")}`}
            />
            <span className="text-caption font-light text-muted">
              <Trans>Orders per month, last 12 months</Trans>
            </span>
          </div>
        )
      }
    />
  );
}

function BestMonth({ sales }: { sales: AllTimeSales }) {
  const money = useMoney();
  const count = useCount();
  const monthName = useMonthName();
  const best = sales.best_month;
  const active = sales.monthly.filter((m) => m.orders > 0).length;
  return (
    <Panel>
      <PanelHeader title={<Trans>Best month</Trans>} meta={<Trans>by revenue</Trans>} />
      {best === null ? (
        <p className="m-0 px-6 pb-6 text-body-sm text-secondary">
          <Trans>No month with sales yet.</Trans>
        </p>
      ) : (
        <div className="flex flex-col gap-2 px-6 pb-6">
          <span className="font-display text-title font-light">{monthName(best.month)}</span>
          <span className="text-body text-secondary">
            <N>{money({ amount: best.revenue, currency: sales.currency }, { whole: true })}</N> ·{" "}
            <Plural value={best.orders} one="# order" other="# orders" />
          </span>
          <span className="text-caption text-muted">
            <Trans>
              The best of <N>{count(active)}</N> months with sales.
            </Trans>
          </span>
        </div>
      )}
    </Panel>
  );
}

function TopProducts({ sales }: { sales: AllTimeSales }) {
  const money = useMoney();
  const count = useCount();
  const { t } = useLingui();
  return (
    <Panel>
      <PanelHeader title={<Trans>Top products</Trans>} meta={<Trans>by units sold</Trans>} />
      <ol className="m-0 flex list-none flex-col gap-1 px-4 pb-4">
        {sales.top_products.map((p, i) => (
          <li
            key={p.listing_id}
            className="flex items-baseline gap-3 rounded-card px-2 py-1.5 text-body-sm"
          >
            <N className="w-4 shrink-0 text-muted">{String(i + 1)}</N>
            <span dir="auto" className="min-w-0 grow truncate text-start">
              {p.title}
            </span>
            <span className="shrink-0 text-caption text-secondary">
              <N>{count(p.units)}</N> {t`sold`} · <N>{money(p.revenue, { whole: true })}</N>
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function Countries({ sales }: { sales: AllTimeSales }) {
  const count = useCount();
  const countryName = useCountryName();
  const shown = sales.countries.slice(0, 6);
  const total = sales.countries.reduce((n, c) => n + c.orders, 0);
  return (
    <Panel>
      <PanelHeader title={<Trans>Where orders go</Trans>} meta={<Trans>country only</Trans>} />
      {shown.length === 0 ? (
        <p className="m-0 px-6 pb-6 text-body-sm text-secondary">
          <Trans>Etsy gave no destination countries for these orders.</Trans>
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 px-6 pb-6">
          {shown.map((c) => {
            const share = total === 0 ? 0 : Math.round((c.orders / total) * 100);
            return (
              <li key={c.country} className="flex flex-col gap-1">
                <span className="flex items-baseline justify-between gap-3 text-body-sm">
                  <span>{countryName(c.country)}</span>
                  <span className="text-caption text-secondary">
                    <N>{count(c.orders)}</N> · <N>{`${String(share)}%`}</N>
                  </span>
                </span>
                <span aria-hidden="true" className="h-1 w-full rounded-pill bg-hover">
                  <span
                    className="block h-1 rounded-pill bg-tertiary"
                    style={{ width: `${String(Math.max(2, share))}%` }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
