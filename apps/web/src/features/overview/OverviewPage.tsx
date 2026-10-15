import { Trans, useLingui } from "@lingui/react/macro";
import {
  ArrowRightIcon as ArrowRight,
  BuildingsIcon as Buildings,
  CurrencyCircleDollarIcon as CurrencyCircleDollar,
  HandPalmIcon as HandPalm,
  HouseIcon as House,
  PackageIcon as Package,
  ShieldCheckIcon as ShieldCheck,
  StorefrontIcon as Storefront,
  TagIcon as TagIcon,
  type Icon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Aura } from "../../shared/art/Aura.tsx";
import { sessionQuery, useApi } from "../../shared/api/api.tsx";
import { DecisionRing } from "../../shared/ui/DecisionRing.tsx";
import { PageBody, PageHeader } from "../../shared/ui/PageHeader.tsx";
import { StatusLabel } from "../../shared/ui/StatusDot.tsx";
import { ObjectIcon, Tag, type Hue } from "../../shared/ui/Tag.tsx";

/**
 * The owner's home (Attio's density, the reference's warmth): the greeting, the four numbers the
 * owner checks first, and what is left to set up. No figure is invented: until a shop is
 * connected each metric says so.
 */
export function OverviewPage() {
  const { t } = useLingui();
  const api = useApi();
  const session = useQuery(sessionQuery(api));
  const secured = session.data?.assurance === "aal2";
  const metrics: { label: string; icon: Icon }[] = [
    { label: t`Orders today`, icon: Package },
    { label: t`Revenue, 30 days`, icon: CurrencyCircleDollar },
    { label: t`Active listings`, icon: TagIcon },
    { label: t`Decisions waiting`, icon: HandPalm },
  ];

  return (
    <>
      <PageHeader title={<Trans>Overview</Trans>} icon={<ObjectIcon hue="iris" icon={House} />} />
      <PageBody>
        <section className="relative isolate -mx-4 -mt-6 overflow-hidden px-4 pt-8 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <Aura variant="page" className="-z-10 max-md:hidden" />
          <p className="m-0 font-display text-title font-semibold sm:text-display-sm">
            <Trans>Your shop runs. You decide.</Trans>
          </p>
          <p className="m-0 mt-1.5 max-w-[56ch] text-secondary max-sm:hidden">
            <Trans>
              HTCO checks orders, tracking and listings, and asks you before anything risky.
            </Trans>
          </p>
        </section>

        <ul
          aria-label={t`Key numbers`}
          className="m-0 grid list-none grid-cols-2 overflow-hidden rounded-card border border-border-subtle bg-surface p-0 shadow-1 lg:grid-cols-4"
        >
          {metrics.map(({ label, icon: Glyph }) => (
            <li
              key={label}
              className="flex flex-col gap-2 border-border-subtle p-5 max-sm:p-4 max-lg:[&:nth-child(-n+2)]:border-b max-lg:[&:nth-child(odd)]:border-e lg:not-last:border-e"
            >
              <span className="flex items-center gap-1.5 text-body-sm font-medium text-secondary">
                <Glyph aria-hidden="true" size={16} weight="duotone" className="text-icon" />
                {label}
              </span>
              <span className="tabular font-display text-display-sm font-semibold text-border-strong max-sm:text-title">
                —
              </span>
              <span className="text-caption text-muted max-sm:hidden">
                <Trans>After a shop is connected</Trans>
              </span>
            </li>
          ))}
        </ul>
        <p className="m-0 -mt-3 text-caption text-muted sm:hidden">
          <Trans>Numbers appear after a shop is connected.</Trans>
        </p>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section
            aria-labelledby="getting-started"
            className="overflow-hidden rounded-card border border-border-subtle bg-surface shadow-1"
          >
            <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
              <h2 id="getting-started" className="m-0 text-body font-semibold">
                <Trans>Getting started</Trans>
              </h2>
              <Tag hue={secured ? "mint" : "slate"}>
                <span className="tabular">
                  {secured ? <Trans>1 of 3 done</Trans> : <Trans>0 of 3 done</Trans>}
                </span>
              </Tag>
            </header>
            <ol className="m-0 list-none p-0">
              <Step
                hue="mint"
                icon={ShieldCheck}
                title={<Trans>Secure your account</Trans>}
                detail={<Trans>Password and an authenticator app.</Trans>}
                status={
                  secured ? (
                    <StatusLabel status="done">
                      <Trans>Done</Trans>
                    </StatusLabel>
                  ) : (
                    <Link to="/settings/security" className="text-link underline">
                      <Trans>Review security</Trans>
                    </Link>
                  )
                }
              />
              <Step
                hue="coral"
                icon={Storefront}
                title={<Trans>Connect your first shop</Trans>}
                detail={<Trans>Orders, tracking and listings start flowing in.</Trans>}
                status={
                  <DecisionRing>
                    <Tag hue="saffron" dot>
                      <Trans>Waiting for you</Trans>
                    </Tag>
                  </DecisionRing>
                }
              />
              <Step
                hue="sky"
                icon={Buildings}
                title={<Trans>Meet your office</Trans>}
                detail={<Trans>The AI employees start once a shop is connected.</Trans>}
                status={
                  <StatusLabel status="waiting">
                    <Trans>Waiting</Trans>
                  </StatusLabel>
                }
              />
            </ol>
          </section>

          <section
            aria-labelledby="office"
            className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-card bg-presence-iris p-6 text-presence-fg shadow-2"
          >
            <div className="flex flex-col gap-1.5">
              <Buildings aria-hidden="true" size={28} weight="duotone" />
              <h2 id="office" className="m-0 mt-2 font-display text-title font-semibold">
                <Trans>Your AI office</Trans>
              </h2>
              <p className="m-0 text-body-sm opacity-90">
                <Trans>
                  Specialists for listings, orders, customers and money work on your shop under your
                  policies, and bring you every risky decision.
                </Trans>
              </p>
            </div>
            <Link
              to="/shops"
              className="inline-flex h-9 items-center gap-1.5 self-start rounded-button bg-surface px-3.5 text-body-sm font-semibold text-primary no-underline shadow-1 hover:bg-hover"
            >
              <Trans>Start with your shop</Trans>
              <ArrowRight size={14} weight="bold" className="rtl:-scale-x-100" />
            </Link>
            {/* The logo's dot: where every relay ends, with the owner. */}
            <span
              aria-hidden="true"
              className="absolute -end-6 -bottom-6 size-24 rounded-pill bg-ring"
            />
          </section>
        </div>
      </PageBody>
    </>
  );
}

function Step({
  hue,
  icon,
  title,
  detail,
  status,
}: {
  hue: Hue;
  icon: Icon;
  title: ReactNode;
  detail: ReactNode;
  status: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 border-b border-border-subtle px-4 py-3.5 transition-colors last:border-b-0 hover:bg-hover">
      <ObjectIcon hue={hue} size="md" icon={icon} />
      <div className="flex min-w-0 grow flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-body-sm text-muted max-sm:hidden">{detail}</span>
      </div>
      <div className="shrink-0 text-body-sm">{status}</div>
    </li>
  );
}
