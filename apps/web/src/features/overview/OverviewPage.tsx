import "./home.css";

import { Trans, useLingui } from "@lingui/react/macro";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";

import { HERO_NAMES, HEROES } from "./heroes.ts";
import { shopCardState } from "../../app/shell/ShopSwitcher.tsx";
import { meQuery, sessionQuery, shopsQuery, useApi, type ShopView } from "../../shared/api/api.tsx";
import { RiskChip } from "../../shared/demo/AgentBits.tsx";
import { AGENTS, APPROVALS, agent, badge, type AgentId } from "../../shared/demo/office.ts";
import { cx } from "../../shared/lib/cx.ts";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { directionOf } from "../../shared/i18n/locale.ts";
import { useTweaks } from "../../shared/theme/ThemeProvider.tsx";
import { ArrowEndIcon, GearIcon, GridIcon, MoreIcon, SearchIcon } from "../../shared/ui/icons.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Button, buttonStyle } from "../../shared/ui/Button.tsx";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Avatar,
  BackGlyph,
  CheckGlyph,
  CircleButton,
  DemoPart,
  Dot,
  DotBar,
  DotColumns,
  IdBlock,
  InkDisc,
  KV2,
  Kpi,
  Kpis,
  N,
  NextGlyph,
  Pill,
  PlusGlyph,
  Screen,
  Stack,
  Status,
  StatusGlyph,
  useMinutes,
  Strip,
  StripCard,
  StripCards,
  Zoom,
  circleStyle,
  initialOf,
} from "../../shared/ui/kit/index.ts";

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
      <Screen layout="l3s" className="home-grid">
        <NeedsYou />
        <Today />
        <Stack className="home-side">
          <ShopsCard />
          <GettingStarted />
        </Stack>
        <OfficePulse />
      </Screen>
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
        actions={
          <Link
            to="/work/approvals"
            aria-label={t`All approvals`}
            title={t`All approvals`}
            className={circleStyle()}
          >
            <ArrowEndIcon size={16} />
          </Link>
        }
      />
      <DemoPart className="flex min-h-0 grow flex-col px-6 pb-6">
        <div className="flex min-h-0 grow flex-col">
          <IdBlock label={t`Waiting for you:`} value={<N>{APPROVALS.length}</N>} />
          <ul className="k-scroll m-0 mt-1 min-h-0 grow list-none p-0">
            {APPROVALS.map((item) => {
              const by = agent(item.by);
              return (
                <li key={item.id} className="k-ap">
                  <div className="k-who">
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
                      <Button>{t`Reject`}</Button>
                      <Button variant="primary">{t`Approve`}</Button>
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
          <Link
            to="/settings"
            aria-label={t`Settings`}
            title={t`Settings`}
            className={circleStyle()}
          >
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
      <DemoPart tag="edge">
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
  const { locale } = useLocale();
  const [index, setIndex] = useState(0);
  const step = (by: number) => {
    setIndex((current) => (current + by + set.length) % set.length);
  };
  // The dots are tabs (WAI-ARIA tabs): one tab stop, the arrow keys move along the reading
  // direction (the right arrow goes back in Hebrew), Home and End jump to the ends.
  const keys = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = directionOf(locale) === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = forward === "ArrowLeft" ? "ArrowRight" : "ArrowLeft";
    const last = set.length - 1;
    const next =
      event.key === forward
        ? (index + 1) % set.length
        : event.key === back
          ? (index + last) % set.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    setIndex(next);
    const tab = event.currentTarget.children.item(next);
    if (tab instanceof HTMLElement) tab.focus();
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
        <div
          className="home-hero-dots"
          role="tablist"
          aria-label={t`Choose a concept`}
          onKeyDown={keys}
        >
          {set.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              tabIndex={i === index ? 0 : -1}
              aria-label={t(HERO_NAMES[i] ?? HERO_NAMES[0])}
              data-hit="own"
              className={i === index ? "home-dot-on" : undefined}
              onClick={() => {
                setIndex(i);
              }}
            />
          ))}
        </div>
        <span>{footer}</span>
      </div>
      <CircleButton
        className="k-side k-s"
        label={t`Previous concept`}
        icon={<BackGlyph />}
        onClick={() => {
          step(-1);
        }}
      />
      <CircleButton
        className="k-side k-e"
        label={t`Next concept`}
        icon={<NextGlyph />}
        onClick={() => {
          step(1);
        }}
      />
      <DemoPart className="home-orders-disc" tag={false}>
        <InkDisc label={t`Today’s orders`}>
          <PlusGlyph size={14} />
        </InkDisc>
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
    <Link
      to="/shops"
      aria-label={t`Shop settings`}
      title={t`Shop settings`}
      className={circleStyle()}
    >
      <GearIcon size={16} />
    </Link>
  );

  if (shops.isError)
    return (
      <Panel className="home-shop">
        <PanelHeader title={t`Shops`} actions={settings} />
        <PanelBody className="items-center justify-center gap-3 text-center">
          <p className="m-0 text-body-sm text-secondary">{t`Shops could not be loaded`}</p>
          <Button
            onPress={() => {
              shops.refetch();
            }}
          >
            {t`Try again`}
          </Button>
        </PanelBody>
      </Panel>
    );

  if (shops.data === undefined)
    return (
      <Panel className="home-shop" label={t`Loading shops`}>
        <PanelHeader title={t`Shops`} actions={settings} />
        <PanelBody className="items-center justify-center gap-4" aria-busy="true">
          <span className="h-3 w-16 animate-pulse rounded-pill bg-raised" />
          <span className="h-9 w-40 animate-pulse rounded-pill bg-raised" />
          <span className="h-8 w-full animate-pulse rounded-pill bg-raised" />
        </PanelBody>
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
      <PanelBody className="justify-between">
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
          <KV2
            items={[
              [
                t`Orders today:`,
                <Pill wide key="orders">
                  <Dot tone="ink" />
                  <N>23</N>
                </Pill>,
              ],
              [
                t`Revenue today:`,
                <Pill wide key="revenue">
                  <Dot tone="success" />
                  <N>$842</N>
                </Pill>,
              ],
            ]}
          />
        </DemoPart>
      </PanelBody>
    </Panel>
  );
}

function ConnectShop() {
  const { t } = useLingui();
  return (
    <Panel className="home-shop">
      <PanelHeader title={<N>Etsy</N>} />
      <PanelBody className="justify-between gap-4">
        <IdBlock label={t`Shops connected:`} value={<N>0</N>}>
          <p className="m-0 mt-2 text-body-sm font-light text-secondary">
            <Trans>
              Connect your Etsy shop and orders, tracking and listings start flowing in.
            </Trans>
          </p>
        </IdBlock>
        <Link to="/shops" className={cx(buttonStyle({ variant: "primary", size: "lg" }), "w-full")}>
          {t`Connect a shop`}
          <ArrowEndIcon size={14} />
        </Link>
      </PanelBody>
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
          <Link
            to="/settings"
            aria-label={t`Settings`}
            title={t`Settings`}
            className={circleStyle()}
          >
            <GearIcon size={16} />
          </Link>
        }
      />
      <PanelBody className="justify-between gap-3">
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
                <Link
                  to={step.to}
                  className="-my-1 inline-block rounded-[4px] py-1 text-caption text-primary underline underline-offset-[3px]"
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
      </PanelBody>
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
    <Strip
      className="home-pulse"
      title={t`Office pulse`}
      meta={t`3 running · 1 waiting for you · 1 failed`}
      zoom={<Zoom page={page} onPage={setPage} labels={{ less: t`Fewer`, more: t`More` }} />}
      actions={
        <>
          <CircleButton label={t`Find agent`} icon={<SearchIcon />} />
          <Link
            to="/office/floor"
            aria-label={t`Office floor`}
            title={t`Office floor`}
            className={circleStyle()}
          >
            <GridIcon size={16} />
          </Link>
          <Link
            to="/settings"
            aria-label={t`Settings`}
            title={t`Settings`}
            className={cx(circleStyle(), "max-sm:hidden")}
          >
            <GearIcon size={16} />
          </Link>
        </>
      }
      cards={false}
    >
      <DemoPart tag="edge" className="flex min-h-0 grow flex-col">
        <StripCards>
          {list.map((id, i) => {
            const a = agent(id);
            return (
              <StripCard
                key={id}
                selected={i === 0 && page === 0}
                style={{ animationDelay: `${String(i * 30)}ms` }}
                className="motion-safe:animate-enter"
                topStart={t(a.name)}
                topEnd={<N>{badge(a)}</N>}
                line={<Status status={a.status} live />}
              >
                <Avatar initial={initialOf(t(a.name))} />
              </StripCard>
            );
          })}
        </StripCards>
      </DemoPart>
    </Strip>
  );
}
