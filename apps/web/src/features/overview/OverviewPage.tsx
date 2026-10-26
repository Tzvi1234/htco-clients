import "./home.css";

import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useId, useState, type ReactNode } from "react";

import { HEROES } from "./heroes.ts";
import { shopCardState } from "../../app/shell/ShopSwitcher.tsx";
import {
  ApiError,
  meQuery,
  needsReconnecting,
  sessionQuery,
  shopsQuery,
  useApi,
  type ShopView,
} from "../../shared/api/api.tsx";
import { RiskChip } from "../../shared/demo/AgentBits.tsx";
import { AGENTS, APPROVALS, agent, badge } from "../../shared/demo/office.ts";
import { cx } from "../../shared/lib/cx.ts";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Button, buttonStyle } from "../../shared/ui/Button.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Aside,
  Avatar,
  CheckGlyph,
  DemoPart,
  Dot,
  BarChart,
  Figure,
  Figures,
  Flow,
  FlowBody,
  FlowRow,
  Focus,
  IdBlock,
  LiveSkeleton,
  N,
  ProgressBar,
  Status,
  StripCard,
  SubTabs,
  TabPanel,
  circleStyle,
  initialOf,
  useMinutes,
  LiveNote,
  TEXT_LINK,
  NextGlyph,
  GearGlyph,
} from "../../shared/ui/kit/index.ts";
import { ShopReconnectBanner } from "../shops/index.ts";
import { Severity, incidentsQuery, mostUrgent, useIncidentWords } from "../incidents/index.ts";
import { overviewQuery, type ShopOverview } from "../../shared/api/live.ts";
import { useCount, useMoney } from "../../shared/i18n/format.ts";

/**
 * Home (Design 1C `P.home`, clarity round 3): one focus on top, today, with the greeting, the
 * first shop's numbers live from Etsy and the one thing to do next; under it what waits for the
 * owner beside the shop and getting started. The office's pulse, tickets and incidents moved to
 * their own sub-tab (Demo until they are built).
 */
export function OverviewPage() {
  const { t } = useLingui();
  const tabs = useId();
  const [tab, setTab] = useState<"today" | "office">("today");
  return (
    <>
      <PageHeader title={t`Home`} />
      <Flow>
        <HomeReconnect />
        <Today />
        <SubTabs
          label={t`Home views`}
          idBase={tabs}
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "today", label: t`Today` },
            // Mixed: the incidents are live, the pulse and the tickets carry their own Demo tags.
            { id: "office", label: t`Office` },
          ]}
        />
        <TabPanel idBase={tabs} tab={tab}>
          {tab === "today" ? (
            <FlowRow layout="main-side">
              <NeedsYou />
              <Aside>
                {/* The shop and getting started share one panel: one region beside the approvals. */}
                <Panel
                  as="div"
                  className="[&>section+section]:border-t [&>section+section]:border-line"
                >
                  <ShopsCard />
                  <GettingStarted />
                </Panel>
              </Aside>
            </FlowRow>
          ) : (
            <OfficeTab />
          )}
        </TabPanel>
      </Flow>
    </>
  );
}

/* ---------------------------------------------------------------- today: the focus */

function greetingFor(hour: number): "morning" | "afternoon" | "evening" | "night" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return now;
}

const two = (n: number) => String(n).padStart(2, "0");

function Today() {
  const { t } = useLingui();
  const now = useNow();
  const shops = useShops();
  const greeting = {
    morning: t`Good morning`,
    afternoon: t`Good afternoon`,
    evening: t`Good evening`,
    night: t`Good night`,
  }[greetingFor(now.getHours())];
  const date = [two(now.getDate()), two(now.getMonth() + 1), String(now.getFullYear())].join(".");
  const count = shops.data?.length;
  const live = useFirstShopOverview(shops.data);
  const sales = live.overview?.sales ?? null;
  // The orange office render in every palette: Cream carries the logo's orange too (round 3).
  const art = HEROES.sbb[0];

  return (
    <Focus
      title={greeting}
      meta={
        <>
          {t`Today`} · <N>{date}</N>
        </>
      }
      lead={<TodayLead shops={count} sales={sales} />}
      figures={
        count === 0 ? undefined : (
          <Figures label={t`Key numbers`}>
            <TodayFigures live={live} />
          </Figures>
        )
      }
      actions={<TodayAction shops={count} sales={sales} />}
      aside={
        <img
          src={art}
          alt=""
          draggable={false}
          className="home-art h-[200px] w-auto object-contain select-none"
        />
      }
      footer={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted">
          <span>
            {count === undefined ? null : count === 0 ? (
              t`No shop connected yet`
            ) : (
              <>
                <N>{count}</N> {count === 1 ? t`shop connected` : t`shops connected`} · HT Commerce
              </>
            )}
          </span>
          {live.overview === undefined ? null : <SalesNote overview={live.overview} />}
        </div>
      }
    />
  );
}

/** Home's freshness: the sales' own source, from the stored history once it is complete. */
function SalesNote({ overview }: { overview: ShopOverview }) {
  const stored = overview.sales_source === "htco_store" && overview.last_synced_at != null;
  return (
    <LiveNote
      fetchedAt={stored ? (overview.last_synced_at ?? overview.fetched_at) : overview.fetched_at}
      stale={overview.stale}
      source={stored ? "htco_store" : "etsy_live"}
      sync={overview.sync ?? null}
    />
  );
}

/** One sentence of what matters now, from the live numbers. */
function TodayLead({ shops, sales }: { shops: number | undefined; sales: SalesNow }) {
  if (shops === 0)
    return (
      <Trans>
        Connect your Etsy shop and today’s orders, revenue and what waits to ship appear here.
      </Trans>
    );
  if (sales === null) return <Trans>Today’s numbers from your shop, live from Etsy.</Trans>;
  if (sales.overdue > 0)
    return (
      <Plural
        value={sales.overdue}
        one="One order is late to ship. Start there."
        other="# orders are late to ship. Start there."
      />
    );
  if (sales.awaiting_shipment > 0)
    return (
      <Plural
        value={sales.awaiting_shipment}
        one="One order waits to ship; none is late."
        other="# orders wait to ship; none is late."
      />
    );
  return <Trans>Everything is shipped. Nothing waits for you in the shop.</Trans>;
}

/** The one thing to do next: connect a shop, ship what waits, or look at the orders. */
function TodayAction({ shops, sales }: { shops: number | undefined; sales: SalesNow }) {
  const primary = buttonStyle({ variant: "primary", size: "lg" });
  const secondary = buttonStyle({ size: "lg" });
  if (shops === undefined) return null;
  if (shops === 0)
    return (
      <Link to="/shops" className={primary}>
        <Trans>Connect a shop</Trans>
        <NextGlyph size={14} />
      </Link>
    );
  const waiting = (sales?.awaiting_shipment ?? 0) > 0;
  return (
    <>
      <Link to={waiting ? "/commerce/shipping" : "/commerce/orders"} className={primary}>
        {waiting ? <Trans>Open what waits to ship</Trans> : <Trans>Open orders</Trans>}
        <NextGlyph size={14} />
      </Link>
      {waiting ? (
        <Link to="/commerce/orders" className={secondary}>
          <Trans>All orders</Trans>
        </Link>
      ) : null}
    </>
  );
}

type SalesNow = ShopOverview["sales"];

interface FirstShopLive {
  /** The shop asked; undefined when there is none (or the shops are loading). */
  shopId: string | undefined;
  overview: ShopOverview | undefined;
  error: Error | null;
}

/** The first active shop's live overview (the one Home's numbers are about). */
function useFirstShopOverview(shops: ShopView[] | undefined): FirstShopLive {
  const api = useApi();
  const shop = shops?.find((s) => s.status === "active") ?? shops?.[0];
  const overview = useQuery({ ...overviewQuery(api, shop?.id ?? ""), enabled: shop !== undefined });
  return { shopId: shop?.id, overview: overview.data, error: overview.error };
}

/** Revenue and orders today against yesterday, and what waits to ship, live from Etsy. */
function TodayFigures({ live }: { live: FirstShopLive }) {
  const { t } = useLingui();
  const money = useMoney();
  const count = useCount();
  const sales = live.overview?.sales ?? null;
  const today = sales?.daily.at(-1);
  const yesterday = sales?.daily.at(-2);
  const missing =
    live.overview === undefined && live.error === null && live.shopId !== undefined ? "…" : "—";
  const revenueDelta =
    today === undefined || yesterday === undefined
      ? undefined
      : Number(today.revenue) - Number(yesterday.revenue);
  const ordersDelta =
    today === undefined || yesterday === undefined ? undefined : today.orders - yesterday.orders;
  const signed = (n: number, text: string) => (n > 0 ? `+${text}` : n < 0 ? `−${text}` : text);
  const trend = (n: number | undefined) =>
    n === undefined || n === 0 ? undefined : n > 0 ? "up" : "down";
  return (
    <>
      <Figure
        label={t`Revenue`}
        value={<N>{sales === null ? missing : money(sales.today.revenue, { whole: true })}</N>}
        trend={trend(revenueDelta)}
        {...(revenueDelta === undefined || sales === null
          ? {}
          : {
              note: (
                <>
                  <N>
                    {signed(
                      revenueDelta,
                      money(
                        { amount: String(Math.abs(revenueDelta)), currency: sales.currency },
                        { whole: true },
                      ),
                    )}
                  </N>{" "}
                  {t`vs yesterday`}
                </>
              ),
            })}
      />
      <Figure
        label={t`Orders`}
        value={<N>{sales === null ? missing : count(sales.today.orders)}</N>}
        trend={trend(ordersDelta)}
        {...(ordersDelta === undefined
          ? {}
          : {
              note: (
                <>
                  <N>{signed(ordersDelta, count(Math.abs(ordersDelta)))}</N> {t`vs yesterday`}
                </>
              ),
            })}
      />
      <Figure
        label={t`Awaiting shipment`}
        value={<N>{sales === null ? missing : count(sales.awaiting_shipment)}</N>}
        tone={(sales?.awaiting_shipment ?? 0) > 0 ? "tertiary" : undefined}
      />
      <Figure
        label={t`Late`}
        value={<N>{sales === null ? missing : count(sales.overdue)}</N>}
        tone={(sales?.overdue ?? 0) > 0 ? "tertiary" : undefined}
        {...(sales === null ? {} : { note: t`past the ship-by date` })}
      />
    </>
  );
}

/* ---------------------------------------------------------------- what needs you (demo) */

function NeedsYou() {
  const { t } = useLingui();
  const minutes = useMinutes();
  return (
    <Panel className="home-needs">
      <PanelHeader
        title={t`What needs you`}
        meta={
          <>
            <N>{APPROVALS.length}</N> {t`waiting for you`}
          </>
        }
        actions={
          <Link
            to="/work/approvals"
            aria-label={t`All approvals`}
            title={t`All approvals`}
            className={circleStyle()}
          >
            <NextGlyph size={16} />
          </Link>
        }
      />
      <DemoPart className="px-6 pb-4 max-sm:px-4" tag="edge">
        <ul className="m-0 list-none p-0">
          {APPROVALS.slice(0, 3).map((item) => {
            const by = agent(item.by);
            return (
              <li key={item.id} className="k-ap">
                <div className="k-who flex items-center gap-2">
                  <Avatar initial={initialOf(t(by.name))} size="xs" />
                  <span>
                    {t(by.name)} · {t(by.role)} ·{" "}
                    <span className="tabular">{minutes(item.minutes)}</span>
                  </span>
                </div>
                <div className="k-what">{t(item.what)}</div>
                <div className="k-act">
                  <RiskChip risk={item.risk} />
                  <div className="flex gap-1.5">
                    <Button variant="ghost">{t`Reject`}</Button>
                    <Button>{t`Approve`}</Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </DemoPart>
      <div className="flex justify-center px-6 pb-5">
        <Link to="/work/approvals" className={TEXT_LINK}>
          {t`See all approvals`}
        </Link>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------- shops (real) */

/**
 * The shops of every workspace the user belongs to, as the sidebar's shop card counts them:
 * known once one workspace has shops or every workspace has answered; an error only when a
 * list could not be read and no shop is known.
 */
/** The shop Home's numbers are about, when its connection must be renewed. */
function HomeReconnect() {
  const shops = useShops();
  const shop = shops.data?.find((s) => s.status === "active") ?? shops.data?.[0];
  return shop === undefined ? null : <ShopReconnectBanner shop={shop} />;
}

function useShops(): { data: ShopView[] | undefined; isError: boolean; refetch: () => void } {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const organizations = me.data?.memberships.map((m) => m.organization_id) ?? [];
  return useQueries({
    queries: organizations.map((organizationId) => shopsQuery(api, organizationId)),
    combine: (results) => {
      const shops = results.flatMap((result) => result.data ?? []);
      const state = shopCardState(
        results.map((result) => ({ status: result.status, count: result.data?.length ?? 0 })),
      );
      return {
        data: state === "unknown" ? undefined : shops,
        isError: state === "unknown" && results.some((result) => result.isError),
        refetch: () => {
          for (const result of results) if (result.isError) void result.refetch();
        },
      };
    },
  });
}

function ShopsCard() {
  const { t } = useLingui();
  const shops = useShops();
  const settings = (
    <Link
      to="/shops"
      aria-label={t`Shop settings`}
      title={t`Shop settings`}
      className={circleStyle()}
    >
      <GearGlyph size={16} />
    </Link>
  );

  if (shops.isError)
    return (
      <section className="home-shop">
        <PanelHeader title={t`Shops`} actions={settings} />
        <FlowBody className="items-center gap-3 text-center">
          <p className="m-0 text-body-sm text-secondary">{t`Shops could not be loaded`}</p>
          <Button
            onPress={() => {
              shops.refetch();
            }}
          >
            {t`Try again`}
          </Button>
        </FlowBody>
      </section>
    );

  if (shops.data === undefined)
    return (
      <section className="home-shop" aria-label={t`Loading shops`}>
        <PanelHeader title={t`Shops`} actions={settings} />
        <FlowBody>
          <div className="flex flex-col items-center gap-4" aria-busy="true">
            <span className="h-3 w-16 animate-pulse rounded-pill bg-raised" />
            <span className="h-9 w-40 animate-pulse rounded-pill bg-raised" />
            <span className="h-8 w-full animate-pulse rounded-pill bg-raised" />
          </div>
        </FlowBody>
      </section>
    );

  const [first] = shops.data;
  // No shop: the focus above offers to connect one; this column keeps getting started only.
  if (first === undefined) return null;
  return <ShopCard shop={first} count={shops.data.length} settings={settings} />;
}

function ShopCard({
  shop,
  count,
  settings,
}: {
  shop: ShopView;
  count: number;
  settings: ReactNode;
}) {
  const { t } = useLingui();
  const api = useApi();
  const overview = useQuery(overviewQuery(api, shop.id));
  const sales = overview.data?.sales ?? null;
  const week = sales?.daily.slice(-7) ?? [];
  const shopCount = String(count);
  const marketplace = shop.marketplace === "etsy" ? "Etsy" : shop.marketplace;
  return (
    <section className="home-shop">
      <PanelHeader
        title={<N>{marketplace}</N>}
        meta={count > 1 ? t`${shopCount} shops` : undefined}
        actions={settings}
      />
      <FlowBody className="gap-4">
        <IdBlock label={t`Shop:`} value={<N>{shop.name}</N>}>
          <div className="mt-1 flex justify-center">
            <Status
              status={shop.status === "active" ? "running" : "idle"}
              label={shop.status === "active" ? t`Connected` : <N>{shop.status}</N>}
            />
          </div>
        </IdBlock>
        {overview.isError ? (
          <p className="m-0 text-center text-caption text-secondary">
            {needsReconnecting(overview.error)
              ? t`This shop needs reconnecting`
              : t`The shop's numbers are not available right now.`}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-2" aria-busy={overview.data === undefined}>
            {overview.data !== undefined && week.length === 0 ? (
              <p className="m-0 text-caption text-secondary">
                {t`Sales are not available for this shop.`}
              </p>
            ) : week.length === 0 ? (
              <span className="h-[45px] w-40 rounded-pill bg-hover motion-safe:animate-pulse" />
            ) : (
              <>
                <BarChart
                  values={week.map((d) => d.orders)}
                  labels={week.map((d) => String(Number(d.date.slice(8, 10))))}
                  highlight={week.length - 1}
                  height={88}
                  className="max-w-[260px]"
                  label={t`Orders in the last 7 days`}
                />
                <span className="text-caption font-light text-muted">{t`Orders, last 7 days`}</span>
              </>
            )}
          </div>
        )}
      </FlowBody>
    </section>
  );
}

/* ---------------------------------------------------------------- getting started (real) */

function GettingStarted() {
  const { t } = useLingui();
  const api = useApi();
  const session = useQuery(sessionQuery(api));
  const shops = useShops();
  const secured = session.data?.assurance === "aal2";
  const connected = (shops.data?.length ?? 0) > 0;
  const steps: { done: boolean; label: string; to: string; action: string; soon?: boolean }[] = [
    {
      done: secured,
      label: t`Secure your account`,
      to: "/settings/security",
      action: t`Review security`,
    },
    { done: connected, label: t`Connect your first shop`, to: "/shops", action: t`Connect` },
    {
      done: false,
      label: t`Meet your office`,
      to: "/office/floor",
      action: t`Preview`,
      soon: true,
    },
  ];
  const done = steps.filter((step) => step.done).length;
  const total = steps.length;
  const doneCount = String(done);
  const totalCount = String(total);
  const current = steps.findIndex((step) => !step.done);
  // Done is done: the checklist leaves Home once every step is.
  if (done === total) return null;
  return (
    <section className="home-start">
      <PanelHeader title={t`Getting started`} meta={t`${doneCount} of ${totalCount} done`} />
      <FlowBody className="gap-3">
        <ol className="m-0 flex list-none flex-col p-0">
          {steps.map((step, index) => (
            <li key={step.to} className="flex h-10 items-center gap-2.5 text-body-sm">
              {step.done ? (
                <span className="k-ck k-on" aria-hidden="true">
                  <CheckGlyph size={10} />
                </span>
              ) : (
                <span className={cx("k-ck", index === current && "k-now")} aria-hidden="true">
                  {index === current ? <Dot tone="attention" /> : null}
                </span>
              )}
              <span className={cx("grow truncate", step.done && "text-secondary")}>
                {step.label}
                <span className="sr-only">{step.done ? ` (${t`done`})` : ""}</span>
              </span>
              {step.done ? (
                <span className="text-caption text-muted">{t`Done`}</span>
              ) : (
                <Link to={step.to} className={cx(TEXT_LINK, "-my-1 inline-block")}>
                  {step.soon === true ? t`Soon` : step.action}
                </Link>
              )}
            </li>
          ))}
        </ol>
        <ProgressBar value={done} max={total} label={t`${doneCount} of ${totalCount} done`} />
      </FlowBody>
    </section>
  );
}

/* ---------------------------------------------------------------- the office (demo) */

/** The office's pulse and tickets (designed, not built: Demo) beside the live open incidents. */
function OfficeTab() {
  const { t } = useLingui();
  return (
    <>
      <Panel className="home-office">
        <PanelHeader
          title={t`Office pulse`}
          meta={t`3 running · 1 waiting for you · 1 failed`}
          actions={
            <Link
              to="/office/floor"
              aria-label={t`Office floor`}
              title={t`Office floor`}
              className={circleStyle()}
            >
              <NextGlyph size={16} />
            </Link>
          }
        />
        <DemoPart tag="edge" className="px-2 pb-2">
          <div className="grid grid-cols-8 gap-2 max-xl:grid-cols-6 max-md:grid-cols-4 max-sm:grid-cols-2">
            {AGENTS.map((a) => (
              <StripCard
                key={a.id}
                topStart={t(a.name)}
                topEnd={<N>{badge(a)}</N>}
                line={<Status status={a.status} live />}
              >
                <Avatar initial={initialOf(t(a.name))} />
              </StripCard>
            ))}
          </div>
        </DemoPart>
      </Panel>
      <FlowRow layout="halves">
        <Panel>
          <PanelHeader title={t`Open tickets`} />
          <DemoPart tag="edge" className="px-6 pb-6">
            <IdBlock label={t`Open tickets:`} value={<N>4</N>}>
              <p className="m-0 mt-1 text-caption text-secondary">{t`2 with Dana`}</p>
            </IdBlock>
          </DemoPart>
        </Panel>
        <OfficeIncidents />
      </FlowRow>
    </>
  );
}

/**
 * The open incidents, live (platform slice 6.5): how many are open in the user's workspaces and
 * the most urgent one (the highest severity, then the oldest), which opens in the incident
 * center. The same query and cache as the incident center; never a zero it did not read.
 */
function OfficeIncidents() {
  const { t } = useLingui();
  const api = useApi();
  const count = useCount();
  const words = useIncidentWords();
  const me = useQuery(meQuery(api));
  const ids = (me.data?.memberships ?? []).map((m) => m.organization_id);
  const lists = useQueries({
    queries: ids.map((id) => incidentsQuery(api, id, "open")),
  });
  const read = lists.flatMap((list, index) =>
    list.data === undefined
      ? []
      : list.data.items.map((incident) => ({ ...incident, organizationId: ids[index] ?? "" })),
  );
  const failed = lists.find((list) => list.isError)?.error;
  const done = me.data !== undefined && lists.every((list) => !list.isPending);
  const more = lists.some((list) => list.data?.more === true);
  const urgent = mostUrgent(read);
  const known = done && failed === undefined;
  return (
    <Panel>
      <PanelHeader
        title={t`Incidents`}
        actions={
          <Link to="/incidents" className={cx(TEXT_LINK, "me-4 text-caption")}>
            {t`All incidents`}
          </Link>
        }
      />
      <div className="px-6 pb-6">
        {!done ? (
          <LiveSkeleton rows={2} label={t`Loading the open incidents`} />
        ) : failed !== undefined && read.length === 0 ? (
          <p role="alert" className="m-0 text-body-sm text-secondary">
            {failed instanceof ApiError && failed.status === 403
              ? t`Your role does not see incidents.`
              : t`The incidents could not be loaded. Try again shortly.`}
          </p>
        ) : (
          <IdBlock
            label={t`Open incidents:`}
            value={<N>{more ? `${count(read.length)}+` : count(read.length)}</N>}
          >
            {urgent === undefined ? (
              known ? (
                <p className="m-0 mt-1 text-caption text-secondary">{t`No open incident.`}</p>
              ) : null
            ) : (
              <p className="m-0 mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-caption">
                <Link
                  to="/incidents/{-$incidentId}"
                  params={{ incidentId: urgent.id }}
                  search={{ workspace: urgent.organizationId }}
                  className={TEXT_LINK}
                >
                  {urgent.receipt_id === null
                    ? words.cause(urgent.cause)
                    : t`${words.cause(urgent.cause)}, order #${urgent.receipt_id}`}
                </Link>
                <Severity severity={urgent.severity} />
              </p>
            )}
            {failed !== undefined && read.length > 0 ? (
              <p className="m-0 mt-1 text-caption text-secondary">
                {t`One workspace's incidents could not be read.`}
              </p>
            ) : null}
          </IdBlock>
        )}
      </div>
    </Panel>
  );
}
