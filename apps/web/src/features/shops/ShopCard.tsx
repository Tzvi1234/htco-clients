import { Plural, Trans, useLingui } from "@lingui/react/macro";
import {
  ArrowsClockwiseIcon as ArrowsClockwise,
  KeyIcon as Key,
  PlugsConnectedIcon as PlugsConnected,
  StorefrontIcon as Storefront,
  type Icon,
} from "@phosphor-icons/react";
import { useId, type ReactNode } from "react";

import type { IntegrationView, ShopView } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { Ltr } from "../../shared/ui/Ltr.tsx";
import { StatusDot, type Status } from "../../shared/ui/StatusDot.tsx";
import { ObjectIcon, Tag, type Hue } from "../../shared/ui/Tag.tsx";

const DAY = 86_400_000;

/** Whole days until `iso`, rounded down so "within N days" is never later than the truth. */
export function daysLeft(iso: string, now: number): number {
  return Math.max(0, Math.floor((Date.parse(iso) - now) / DAY));
}

/** "4 minutes ago", "yesterday": the largest whole unit, in the user's language. */
export function ago(iso: string, now: number, locale: string): string {
  const seconds = Math.round((Date.parse(iso) - now) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units)
    if (Math.abs(seconds) >= size) return format.format(Math.trunc(seconds / size), unit);
  return format.format(0, "second");
}

const STATUS: Record<IntegrationView["status"], { hue: Hue }> = {
  connected: { hue: "mint" },
  needs_reauth: { hue: "saffron" },
  disconnected: { hue: "slate" },
};

const HEALTH_DOT: Record<IntegrationView["token_health"], Status> = {
  ok: "done",
  expiring: "needs-you",
  needs_reauth: "needs-you",
  disconnected: "offline",
};

/** One row of the card: a small monochrome icon, a label and its value. */
function Row({
  icon: Glyph,
  label,
  children,
  phone = true,
}: {
  icon: Icon;
  label: ReactNode;
  children: ReactNode;
  /** False: hidden on phones, which show fewer details (design/README.md, UX rule 11). */
  phone?: boolean;
}) {
  return (
    <div
      className={
        phone ? "flex items-start gap-3 py-2.5" : "flex items-start gap-3 py-2.5 max-sm:hidden"
      }
    >
      <dt className="flex w-28 shrink-0 items-center gap-1.5 text-body-sm text-muted max-sm:w-auto">
        <Glyph aria-hidden="true" size={14} weight="duotone" />
        {label}
      </dt>
      <dd className="m-0 min-w-0 grow text-body-sm text-primary">{children}</dd>
    </div>
  );
}

/**
 * A shop and its Etsy connection (slice 4.6): the status as a solid tag, the token health in
 * plain words, the granted access, and the last successful sync. Never a token.
 */
export function ShopCard({
  shop,
  integration,
  now,
  reconnect,
  detailsLoading = false,
}: {
  shop: ShopView;
  /** The connection details are still on their way: their rows show as placeholders. */
  detailsLoading?: boolean;
  /** Undefined for roles that may not see connection details. */
  integration: IntegrationView | undefined;
  now: number;
  /** The Owner's reconnect button, when the connection needs it. */
  reconnect?: ReactNode;
}) {
  const { t } = useLingui();
  const { locale } = useLocale();
  const titleId = useId();

  const statusLabel: Record<IntegrationView["status"], string> = {
    connected: t`Connected`,
    needs_reauth: t`Needs reconnecting`,
    disconnected: t`Disconnected`,
  };
  const scopeLabel: Record<string, string> = {
    shops_r: t`Read shop`,
    transactions_r: t`Read orders`,
    listings_r: t`Read listings`,
  };

  function health(view: IntegrationView): ReactNode {
    switch (view.token_health) {
      case "ok":
        return <Trans>Connection renews automatically</Trans>;
      case "expiring": {
        if (view.refresh_expires_at === null) return <Trans>Reconnect soon</Trans>;
        const days = daysLeft(view.refresh_expires_at, now);
        return days === 0 ? (
          <Trans>Reconnect today</Trans>
        ) : (
          <Plural value={days} one="Reconnect within # day" other="Reconnect within # days" />
        );
      }
      case "needs_reauth":
        return <Trans>Reconnect to keep syncing</Trans>;
      case "disconnected":
        return <Trans>Not syncing. Connect it again to resume.</Trans>;
    }
  }

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col rounded-card border border-border-subtle bg-surface shadow-1"
    >
      <header className="flex items-center gap-3 px-4 pt-4 pb-3">
        <ObjectIcon size="md" icon={Storefront} />
        <div className="flex min-w-0 grow flex-col">
          <h2 id={titleId} className="m-0 truncate text-body font-semibold">
            {shop.name}
          </h2>
          <p className="m-0 truncate text-body-sm text-muted">
            {integration === undefined ? (
              <Trans>Etsy</Trans>
            ) : (
              <>
                <Trans>Etsy shop</Trans>{" "}
                <span className="max-sm:hidden">
                  <Ltr>{integration.etsy_shop_id}</Ltr>
                </span>
              </>
            )}
          </p>
        </div>
        {integration === undefined ? null : (
          <Tag hue={STATUS[integration.status].hue}>{statusLabel[integration.status]}</Tag>
        )}
      </header>
      {detailsLoading ? (
        <div className="flex flex-col divide-y divide-border-subtle border-t border-border-subtle px-4">
          <span role="status" className="sr-only">
            <Trans>Loading connection details</Trans>
          </span>
          {["w-3/5", "w-2/5", "w-1/2"].map((width) => (
            <span key={width} aria-hidden="true" className="flex h-11 items-center gap-3">
              <span className="size-4 shrink-0 rounded-[4px] bg-sunken motion-safe:animate-pulse" />
              <span className={`h-2.5 rounded-pill bg-sunken motion-safe:animate-pulse ${width}`} />
            </span>
          ))}
        </div>
      ) : null}
      {integration === undefined || detailsLoading ? null : (
        <>
          <dl className="m-0 flex flex-col divide-y divide-border-subtle border-t border-border-subtle px-4">
            <Row icon={PlugsConnected} label={<Trans>Connection</Trans>}>
              <span className="inline-flex items-center gap-2">
                <StatusDot status={HEALTH_DOT[integration.token_health]} />
                <span>{health(integration)}</span>
              </span>
            </Row>
            <Row icon={Key} label={<Trans>Access</Trans>} phone={false}>
              {integration.scopes.length === 0 ? (
                <span className="text-muted">
                  <Trans>None</Trans>
                </span>
              ) : (
                <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0">
                  {integration.scopes.map((scope) => (
                    <li key={scope}>{scopeLabel[scope] ?? <Ltr>{scope}</Ltr>}</li>
                  ))}
                </ul>
              )}
            </Row>
            <Row icon={ArrowsClockwise} label={<Trans>Last sync</Trans>}>
              {integration.last_successful_call_at === null ? (
                <span className="text-muted">
                  <Trans>Not synced yet</Trans>
                </span>
              ) : (
                <time dateTime={integration.last_successful_call_at}>
                  {t`Last synced ${ago(integration.last_successful_call_at, now, locale)}`}
                </time>
              )}
            </Row>
          </dl>
          {reconnect === undefined ? null : (
            <footer className="border-t border-border-subtle px-4 py-3 max-sm:[&>*]:w-full">
              {reconnect}
            </footer>
          )}
        </>
      )}
    </article>
  );
}

/** Whether the Owner should be offered to reconnect this connection. */
export function needsReconnect(integration: IntegrationView | undefined): boolean {
  return integration !== undefined && integration.token_health !== "ok";
}

/** Says which shop a reconnect button is for, for screen readers. */
export function useReconnectLabel() {
  const { t } = useLingui();
  return (name: string) => t`Reconnect ${name}`;
}
