import "./home.css";

import { Trans, useLingui } from "@lingui/react/macro";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { HERO_NAMES, HEROES } from "./heroes.ts";
import { shopCardState } from "../../app/shell/ShopSwitcher.tsx";
import { meQuery, sessionQuery, shopsQuery, useApi, type ShopView } from "../../shared/api/api.tsx";
import { RiskChip } from "../../shared/demo/AgentBits.tsx";
import { AGENTS, APPROVALS, agent, badge, type AgentId } from "../../shared/demo/office.ts";
import { cx } from "../../shared/lib/cx.ts";
import { useTweaks } from "../../shared/theme/ThemeProvider.tsx";
import { ArrowEndIcon, GearIcon, GridIcon, MoreIcon, SearchIcon } from "../../shared/ui/icons.tsx";
import {
  BackGlyph,
  CheckGlyph,
  MinusGlyph,
  NextGlyph,
  PlusGlyph,
} from "../../shared/ui/kit/glyphs.tsx";
import {
  Avatar,
  Cb,
  DemoPart,
  Dot,
  DotBar,
  DotColumns,
  IdBlock,
  Kpi,
  Kpis,
  N,
  Status,
  StatusGlyph,
  Zoom,
} from "../../shared/ui/kit/kit.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";

/**
 * Home (Design 1C `P.home`): what needs the owner, today with the hero carousel and its key
 * numbers, the shops, getting started and the office pulse. Real: the greeting and date, the
 * shops and their count, and getting started. Approvals, the numbers from orders and the office
 * keep the demo's design with its sample data, dimmed and labelled "Demo", until they are built.
 */
export function OverviewPage() {
  const { t } = useLingui();
  return (
    <>
      <PageHeader title={t`Home`} />
      <div className="k-grid k-l3s k-enter home-grid">
        <NeedsYou />
        <Today />
        <div className="k-stack home-side">
          <ShopsCard />
          <GettingStarted />
        </div>
        <OfficePulse />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- what needs you (demo) */

function NeedsYou() {
  const { t } = useLingui();
  return (
    <Panel className="home-needs">
      <PanelHeader
        title={t`What needs you`}
        actions={
          <Link
            to="/work/approvals"
            aria-label={t`All approvals`}
            title={t`All approvals`}
            className="k-cb"
          >
            <ArrowEndIcon size={16} className="rtl:-scale-x-100" />
          </Link>
        }
      />
      <DemoPart className="k-pb">
        <div className="flex min-h-0 grow flex-col">
          <IdBlock label={t`Waiting for you:`} value={<N>{APPROVALS.length}</N>} />
          <ul className="k-scroll m-0 mt-1 min-h-0 grow list-none p-0">
            {APPROVALS.map((item) => {
              const by = agent(item.by);
              return (
                <li key={item.id} className="k-ap">
                  <div className="k-who">
                    <Avatar initial={t(by.name).charAt(0)} size="xs" />
                    <span>
                      {t(by.name)} · {t(by.role)} · <N>{item.age}</N>
                    </span>
                  </div>
                  <div className="k-what">{t(item.what)}</div>
                  <div className="k-act">
                    <RiskChip risk={item.risk} />
                    <div className="flex gap-1.5">
                      <button type="button" className="k-btn">
                        {t`Reject`}
                      </button>
                      <button type="button" className="k-btn k-pri">
                        {t`Approve`}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </DemoPart>
    </Panel>
  );
}

/* ---------------------------------------------------------------- today: greeting and hero */

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
  return (
    <Panel className="home-today">
      <PanelHeader
        title={greeting}
        meta={
          <>
            {t`Today`} · <N>{date}</N>
          </>
        }
        actions={
          <Link to="/settings" aria-label={t`Settings`} title={t`Settings`} className="k-cb">
            <MoreIcon size={16} />
          </Link>
        }
      />
      <Hero
        footer={
          count === undefined ? null : count === 0 ? (
            t`No shop connected yet`
          ) : (
            <>
              <N>{count}</N> {count === 1 ? t`shop connected` : t`shops connected`} · HT Commerce
            </>
          )
        }
      />
      <DemoPart edge>
        <Kpis label={t`Key numbers`}>
          <Kpi
            label={t`Revenue`}
            value={<N>$1,284</N>}
            trend="up"
            delta={
              <>
                <N>+12%</N> {t`vs yesterday`}
              </>
            }
          />
          <Kpi
            label={t`Orders`}
            value={<N>37</N>}
            trend="up"
            delta={
              <>
                <N>+5</N> {t`vs yesterday`}
              </>
            }
          />
          <Kpi label={t`Open tickets`} value={<N>4</N>} delta={t`2 with Dana`} />
          <Kpi
            label={t`Incidents`}
            value={<N>1</N>}
            delta={
              <>
                <StatusGlyph status="failed" />
                <N>tracking.sync</N>
              </>
            }
          />
        </Kpis>
      </DemoPart>
    </Panel>
  );
}

function Hero({ footer }: { footer: ReactNode }) {
  const { t } = useLingui();
  const { tweaks } = useTweaks();
  const set = tweaks.palette === "d4" ? HEROES.d4 : HEROES.sbb;
  const [index, setIndex] = useState(0);
  const step = (by: number) => {
    setIndex((current) => (current + by + set.length) % set.length);
  };
  const name = t(HERO_NAMES[index] ?? HERO_NAMES[0]);
  return (
    <div
      className="k-stage flex-col home-stage"
      role="group"
      aria-roledescription={t`carousel`}
      aria-label={t`Hero concepts`}
    >
      <div className="relative flex size-full items-center justify-center">
        {set.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === index ? name : ""}
            aria-hidden={i === index ? undefined : true}
            draggable={false}
            className={cx("home-hero-img", i === index && "home-hero-on")}
          />
        ))}
      </div>
      <span className="home-hero-ix" aria-live="polite">
        <b>
          <N>
            {index + 1}/{set.length}
          </N>
        </b>
        {name}
      </span>
      <div className="k-dim home-hero-foot">
        <div className="home-hero-dots" role="tablist" aria-label={t`Choose a concept`}>
          {set.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={t(HERO_NAMES[i] ?? HERO_NAMES[0])}
              className={i === index ? "home-dot-on" : undefined}
              onClick={() => {
                setIndex(i);
              }}
            />
          ))}
        </div>
        <span>{footer}</span>
      </div>
      <Cb
        className="k-side k-s"
        label={t`Previous concept`}
        icon={BackGlyph}
        onClick={() => {
          step(-1);
        }}
      />
      <Cb
        className="k-side k-e"
        label={t`Next concept`}
        icon={NextGlyph}
        onClick={() => {
          step(1);
        }}
      />
      <DemoPart className="home-orders-disc">
        <button
          type="button"
          className="k-kdisc"
          aria-label={t`Today’s orders`}
          title={t`Today’s orders`}
        >
          <PlusGlyph size={14} />
        </button>
      </DemoPart>
    </div>
  );
}

/* ---------------------------------------------------------------- shops (real) */

/**
 * The shops of every workspace the user belongs to, as the sidebar's shop card counts them:
 * known once one workspace has shops or every workspace has answered; an error only when a
 * list could not be read and no shop is known.
 */
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
    <Link to="/shops" aria-label={t`Shop settings`} title={t`Shop settings`} className="k-cb">
      <GearIcon size={16} />
    </Link>
  );

  if (shops.isError)
    return (
      <Panel className="home-shop">
        <PanelHeader title={t`Shops`} actions={settings} />
        <div className="k-pb items-center justify-center gap-3 text-center">
          <p className="m-0 text-body-sm text-secondary">{t`Shops could not be loaded`}</p>
          <button
            type="button"
            className="k-btn"
            onClick={() => {
              shops.refetch();
            }}
          >
            {t`Try again`}
          </button>
        </div>
      </Panel>
    );

  if (shops.data === undefined)
    return (
      <Panel className="home-shop" label={t`Loading shops`}>
        <PanelHeader title={t`Shops`} actions={settings} />
        <div className="k-pb items-center justify-center gap-4" aria-busy="true">
          <span className="h-3 w-16 animate-pulse rounded-pill bg-raised" />
          <span className="h-9 w-40 animate-pulse rounded-pill bg-raised" />
          <span className="h-8 w-full animate-pulse rounded-pill bg-raised" />
        </div>
      </Panel>
    );

  const [first] = shops.data;
  if (first === undefined) return <ConnectShop />;
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
  const shopCount = String(count);
  const marketplace = shop.marketplace === "etsy" ? "Etsy" : shop.marketplace;
  return (
    <Panel className="home-shop">
      <PanelHeader
        title={<N>{marketplace}</N>}
        meta={count > 1 ? t`${shopCount} shops` : undefined}
        actions={settings}
      />
      <div className="k-pb k-between">
        <IdBlock label={t`Shop:`} value={<N>{shop.name}</N>}>
          <div className="mt-1 flex justify-center">
            <Status
              status={shop.status === "active" ? "running" : "idle"}
              label={shop.status === "active" ? t`Connected` : <N>{shop.status}</N>}
            />
          </div>
        </IdBlock>
        <DemoPart className="flex flex-col gap-4">
          <div>
            <DotColumns values={[5, 7, 6, 9, 8, 11, 12]} rows={5} pitch={9} gap={16} />
          </div>
          <div className="k-kv2">
            <div>
              <div className="k-lb">{t`Orders today:`}</div>
              <button type="button" className="k-pill k-w">
                <Dot tone="k" />
                <N>23</N>
              </button>
            </div>
            <div>
              <div className="k-lb">{t`Revenue today:`}</div>
              <button type="button" className="k-pill k-w">
                <Dot tone="g" />
                <N>$842</N>
              </button>
            </div>
          </div>
        </DemoPart>
      </div>
    </Panel>
  );
}

function ConnectShop() {
  const { t } = useLingui();
  return (
    <Panel className="home-shop">
      <PanelHeader title={<N>Etsy</N>} />
      <div className="k-pb k-between gap-4">
        <IdBlock label={t`Shops connected:`} value={<N>0</N>}>
          <p className="m-0 mt-2 text-body-sm font-light text-secondary">
            <Trans>
              Connect your Etsy shop and orders, tracking and listings start flowing in.
            </Trans>
          </p>
        </IdBlock>
        <Link to="/shops" className="k-btn k-pri k-lg w-full no-underline">
          {t`Connect a shop`}
          <ArrowEndIcon size={14} className="rtl:-scale-x-100" />
        </Link>
      </div>
    </Panel>
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
  return (
    <Panel className="home-start">
      <PanelHeader
        title={t`Getting started`}
        meta={t`${doneCount} of ${totalCount} done`}
        actions={
          <Link to="/settings" aria-label={t`Settings`} title={t`Settings`} className="k-cb">
            <GearIcon size={16} />
          </Link>
        }
      />
      <div className="k-pb k-between gap-3">
        <IdBlock label={t`Steps done:`} value={<N>{`${doneCount}/${totalCount}`}</N>} />
        <ol className="m-0 flex list-none flex-col p-0">
          {steps.map((step, index) => (
            <li key={step.to} className="flex h-9 items-center gap-2.5 text-body-sm">
              {step.done ? (
                <span className="k-ck k-on" aria-hidden="true">
                  <CheckGlyph size={10} />
                </span>
              ) : (
                <span className={cx("k-ck", index === current && "k-now")} aria-hidden="true">
                  {index === current ? <Dot tone="o" /> : null}
                </span>
              )}
              <span className={cx("grow truncate", step.done && "text-secondary")}>
                {step.label}
                <span className="sr-only">{step.done ? ` (${t`done`})` : ""}</span>
              </span>
              {step.done ? (
                <span className="text-caption text-muted">{t`Done`}</span>
              ) : (
                <Link
                  to={step.to}
                  className="text-caption text-primary underline underline-offset-[3px]"
                >
                  {step.soon === true ? t`Soon` : step.action}
                </Link>
              )}
            </li>
          ))}
        </ol>
        <DotBar
          count={24}
          filled={Math.round((done / total) * 24)}
          accent={0}
          label={t`${doneCount} of ${totalCount} done`}
        />
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------- office pulse (demo) */

const PULSE: readonly AgentId[] = ["maya", "nika", "alex", "noa", "eitan", "amir", "shon", "lia"];

function OfficePulse() {
  const { t } = useLingui();
  const [page, setPage] = useState<0 | 1>(0);
  const list = page === 0 ? PULSE : AGENTS.slice(8).map((a) => a.id);
  return (
    <Panel className="k-strip home-pulse">
      <div className="k-strip-h">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h2 className="m-0 text-body-sm font-normal whitespace-nowrap">{t`Office pulse`}</h2>
          <span className="truncate text-caption font-light text-muted">
            {t`3 running · 1 waiting for you · 1 failed`}
          </span>
        </div>
        <Zoom
          page={page}
          onPage={setPage}
          labels={{ less: t`Fewer`, more: t`More` }}
          icons={{ less: MinusGlyph, more: PlusGlyph }}
        />
        <div className="k-acts">
          <Cb label={t`Find agent`} icon={SearchIcon} />
          <Link
            to="/office/floor"
            aria-label={t`Office floor`}
            title={t`Office floor`}
            className="k-cb"
          >
            <GridIcon size={16} />
          </Link>
          <Link
            to="/settings"
            aria-label={t`Settings`}
            title={t`Settings`}
            className="k-cb k-phone-hide"
          >
            <GearIcon size={16} />
          </Link>
        </div>
      </div>
      <DemoPart edge className="flex min-h-0 grow flex-col">
        <div className="k-cards" key={page}>
          {list.map((id, i) => {
            const a = agent(id);
            return (
              <button
                key={id}
                type="button"
                className={cx("k-sc", i === 0 && page === 0 && "k-sel")}
                style={{
                  animation: `htco-enter var(--motion-duration-slow) var(--motion-easing-enter) ${String(i * 30)}ms both`,
                }}
              >
                <span className="k-top">
                  <span>{t(a.name)}</span>
                  <span className="k-mute">
                    <N>{badge(a)}</N>
                  </span>
                </span>
                <Avatar initial={t(a.name).charAt(0)} />
                <span className="mt-2.5">
                  <Status status={a.status} live />
                </span>
              </button>
            );
          })}
        </div>
      </DemoPart>
    </Panel>
  );
}
