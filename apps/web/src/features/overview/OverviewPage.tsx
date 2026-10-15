import { Trans, useLingui } from "@lingui/react/macro";
import {
  ArrowRightIcon as ArrowRight,
  BuildingsIcon as Buildings,
  CaretRightIcon as CaretRight,
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  CubeIcon as Cube,
  CurrencyCircleDollarIcon as CurrencyCircleDollar,
  HouseIcon as House,
  ShieldCheckIcon as ShieldCheck,
  StorefrontIcon as Storefront,
  TagIcon,
  UsersThreeIcon as UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { sessionQuery, useApi } from "../../shared/api/api.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { DecisionRing } from "../../shared/ui/DecisionRing.tsx";
import { PageBody, PageHeader } from "../../shared/ui/PageHeader.tsx";
import { ObjectIcon } from "../../shared/ui/Tag.tsx";

const CARD =
  "rounded-card border border-border-subtle bg-surface shadow-1 max-sm:rounded-[20px] max-sm:border-0";

/**
 * The owner's home, to the owner's dashboard reference: the greeting, four key numbers with
 * their icons on soft circles, getting started, and the AI office. No figure is invented: until a
 * shop is connected each number says so. On phones (iOS patterns): a large title, white cards on
 * the grouped grey ground, the numbers in a 2×2 grid.
 */
export function OverviewPage() {
  const { t } = useLingui();
  const api = useApi();
  const session = useQuery(sessionQuery(api));
  const secured = session.data?.assurance === "aal2";
  const metrics: { label: string; icon: Icon; circle: string }[] = [
    { label: t`Orders today`, icon: Cube, circle: "bg-shape-sky text-presence-sky" },
    { label: t`Revenue, 30 days`, icon: CurrencyCircleDollar, circle: "bg-sunken text-primary" },
    { label: t`Active listings`, icon: TagIcon, circle: "bg-shape-mint text-presence-mint" },
    { label: t`Decisions waiting`, icon: Clock, circle: "bg-shape-saffron text-presence-saffron" },
  ];

  return (
    <>
      <PageHeader title={<Trans>Overview</Trans>} icon={<ObjectIcon icon={House} />} />
      <PageBody>
        <section className="flex flex-col gap-1">
          <p className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.02em] max-sm:text-title-sm max-sm:font-semibold max-sm:tracking-normal max-sm:text-secondary">
            <Trans>Your shop runs. You decide.</Trans>
          </p>
          <p className="m-0 text-secondary max-sm:hidden">
            <Trans>
              HTCO checks orders, tracking and listings, and asks you before anything risky.
            </Trans>
          </p>
        </section>

        <ul
          aria-label={t`Key numbers`}
          className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4"
        >
          {metrics.map(({ label, icon: Glyph, circle }) => (
            <li
              key={label}
              className={cx(
                CARD,
                "flex items-center gap-3.5 p-4 max-sm:flex-col max-sm:items-start max-sm:gap-3",
              )}
            >
              <span className={cx("grid size-11 shrink-0 place-items-center rounded-pill", circle)}>
                <Glyph aria-hidden="true" size={21} weight="duotone" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-body-sm text-secondary">{label}</span>
                <span className="tabular text-title font-bold text-muted">—</span>
                <span className="text-caption text-muted max-sm:hidden">
                  <Trans>After a shop is connected</Trans>
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="m-0 -mt-3 text-caption text-muted sm:hidden">
          <Trans>Numbers appear after a shop is connected.</Trans>
        </p>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section aria-labelledby="getting-started" className={cx(CARD, "overflow-hidden")}>
            <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3.5">
              <h2 id="getting-started" className="m-0 text-body font-semibold">
                <Trans>Getting started</Trans>
              </h2>
              <span className="flex items-center gap-2 text-body-sm font-medium text-success-text">
                <span className="relative h-1.5 w-8 overflow-hidden rounded-pill bg-sunken">
                  <span
                    className={cx(
                      "absolute inset-y-0 start-0 rounded-pill bg-success",
                      secured ? "w-1/3" : "w-0",
                    )}
                  />
                </span>
                <span className="tabular">
                  {secured ? <Trans>1 of 3 done</Trans> : <Trans>0 of 3 done</Trans>}
                </span>
              </span>
            </header>
            <ol className="m-0 list-none p-0">
              <Step
                icon={ShieldCheck}
                title={<Trans>Secure your account</Trans>}
                detail={<Trans>Password and an authenticator app.</Trans>}
                end={
                  secured ? (
                    <CheckCircle
                      aria-label={t`Done`}
                      size={24}
                      weight="fill"
                      className="text-success"
                    />
                  ) : (
                    <Link to="/settings/security" className="text-body-sm font-medium text-link">
                      <Trans>Review security</Trans>
                    </Link>
                  )
                }
              />
              <Step
                icon={Storefront}
                title={<Trans>Connect your first shop</Trans>}
                detail={<Trans>Orders, tracking and listings start flowing in.</Trans>}
                end={
                  <>
                    <DecisionRing>
                      <span className="rounded-pill bg-ring px-2.5 py-1 text-caption font-semibold text-[var(--illustration-ink)]">
                        <Trans>Waiting for you</Trans>
                      </span>
                    </DecisionRing>
                    <Chevron />
                  </>
                }
              />
              <Step
                icon={UsersThree}
                title={<Trans>Meet your office</Trans>}
                detail={<Trans>The AI employees start once a shop is connected.</Trans>}
                end={<Chevron />}
              />
            </ol>
          </section>

          <section
            aria-labelledby="office"
            className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-card bg-shape-iris p-6 max-sm:rounded-[20px]"
          >
            <span
              aria-hidden="true"
              className="absolute -end-12 -bottom-16 size-48 rounded-pill border-[34px] border-[var(--illustration-iris)]"
            />
            <span
              aria-hidden="true"
              className="absolute end-5 bottom-6 size-16 rounded-pill bg-ring"
            />
            <div className="relative flex flex-col gap-2">
              <Buildings
                aria-hidden="true"
                size={28}
                weight="duotone"
                className="text-presence-iris"
              />
              <h2 id="office" className="m-0 mt-1 text-title font-bold">
                <Trans>Your AI office</Trans>
              </h2>
              <p className="m-0 max-w-[34ch] text-body-sm text-secondary">
                <Trans>
                  Specialists for listings, orders, customers and money work on your shop under your
                  policies, and bring you every risky decision.
                </Trans>
              </p>
            </div>
            <Link
              to="/shops"
              className="relative inline-flex h-10 items-center gap-1.5 self-start rounded-button bg-inverse px-4 text-body-sm font-semibold text-on-inverse no-underline hover:bg-inverse-hover"
            >
              <Trans>Start with your shop</Trans>
              <ArrowRight size={14} weight="bold" className="rtl:-scale-x-100" />
            </Link>
          </section>
        </div>
      </PageBody>
    </>
  );
}

function Chevron() {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 place-items-center rounded-pill border border-border-subtle text-icon max-sm:hidden"
    >
      <CaretRight size={13} weight="bold" className="rtl:-scale-x-100" />
    </span>
  );
}

function Step({
  icon,
  title,
  detail,
  end,
}: {
  icon: Icon;
  title: ReactNode;
  detail: ReactNode;
  end: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3.5 border-b border-border-subtle px-5 py-3.5 transition-colors last:border-b-0 hover:bg-hover">
      <ObjectIcon size="md" icon={icon} />
      <div className="flex min-w-0 grow flex-col">
        <span className="font-semibold">{title}</span>
        <span className="text-body-sm text-secondary max-sm:hidden">{detail}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">{end}</div>
    </li>
  );
}
