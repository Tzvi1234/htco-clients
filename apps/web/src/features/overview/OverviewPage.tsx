import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { House, ShieldCheck, Store, Users } from "lucide-react";
import type { ReactNode } from "react";

import { sessionQuery, useApi } from "../../shared/api/api.tsx";
import { DecisionRing } from "../../shared/ui/DecisionRing.tsx";
import { PageBody, PageHeader } from "../../shared/ui/PageHeader.tsx";
import { StatusLabel } from "../../shared/ui/StatusDot.tsx";
import { ObjectIcon, Tag, type Hue } from "../../shared/ui/Tag.tsx";

/** The owner's home: what is set up, and the one step that waits for them. */
export function OverviewPage() {
  const api = useApi();
  const session = useQuery(sessionQuery(api));
  const secured = session.data?.assurance === "aal2";

  return (
    <>
      <PageHeader
        title={<Trans>Overview</Trans>}
        icon={<ObjectIcon hue="iris" icon={<House size={13} strokeWidth={2} />} />}
      />
      <PageBody aura>
        <section className="flex flex-col gap-2">
          <p className="m-0 font-display text-title font-semibold sm:text-display-sm">
            <Trans>Your shop runs. You decide.</Trans>
          </p>
          <p className="m-0 max-w-[60ch] text-secondary">
            <Trans>
              HTCO checks orders, tracking and listings, and asks you before anything risky. Three
              steps get it ready.
            </Trans>
          </p>
        </section>

        <section
          aria-labelledby="getting-started"
          className="max-w-[760px] overflow-hidden rounded-card border border-border-subtle bg-surface shadow-1"
        >
          <header className="flex items-center justify-between gap-3 border-b border-border-subtle bg-sunken px-4 py-2.5">
            <h2 id="getting-started" className="m-0 text-body font-semibold">
              <Trans>Getting started</Trans>
            </h2>
            <span className="tabular text-body-sm text-muted">
              {secured ? <Trans>1 of 3 done</Trans> : <Trans>0 of 3 done</Trans>}
            </span>
          </header>
          <ol className="m-0 list-none p-0">
            <Step
              hue="mint"
              icon={<ShieldCheck size={14} strokeWidth={2} />}
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
              icon={<Store size={14} strokeWidth={2} />}
              title={<Trans>Connect your first shop</Trans>}
              detail={
                <Trans>
                  Orders, tracking and listings appear after you connect an Etsy shop. Connecting
                  opens in a coming release.
                </Trans>
              }
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
              icon={<Users size={14} strokeWidth={2} />}
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
  icon: ReactNode;
  title: ReactNode;
  detail: ReactNode;
  status: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 border-b border-border-subtle px-4 py-3.5 last:border-b-0">
      <ObjectIcon hue={hue} size="md" icon={icon} />
      <div className="flex min-w-0 grow flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-body-sm text-muted">{detail}</span>
      </div>
      <div className="shrink-0 text-body-sm">{status}</div>
    </li>
  );
}
