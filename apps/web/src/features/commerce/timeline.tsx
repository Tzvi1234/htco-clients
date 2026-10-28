import { Trans, useLingui } from "@lingui/react/macro";

import type { OrderStatusChange, OrderTracking } from "../../shared/api/live.ts";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { SectionLabel } from "../../shared/ui/kit/index.ts";

type StoreState = OrderStatusChange["to_state"];
type Source = OrderStatusChange["source"];

/** The order store's states (FR-ORD-03) in words: the timeline says each step exactly. */
export function useStoreStates(): Record<StoreState, string> {
  const { t } = useLingui();
  return {
    unpaid: t`Awaiting payment`,
    paid: t`Paid`,
    ingested: t`Recorded in HTCO`,
    awaiting_shipment: t`Waiting to ship`,
    shipped: t`Shipped`,
    delivered: t`Delivered`,
    cancelled: t`Cancelled`,
    refunded: t`Refunded`,
  };
}

/** What recorded a step: Etsy's own notice, or one of HTCO's reads of Etsy. */
export function useSources(): Record<Source, string> {
  const { t } = useLingui();
  return {
    webhook: t`Etsy notice`,
    reconciliation: t`Daily check`,
    backfill: t`History import`,
    sync: t`Sync`,
  };
}

/** Where a tracking number came from (AC-6.1.2): Etsy, or AutoVA by hand, browser or email. */
export function useTrackingSources(): Record<OrderTracking["source"], string> {
  const { t } = useLingui();
  return {
    etsy: t`From Etsy`,
    autova_manual: t`From AutoVA, pasted`,
    autova_browser: t`From AutoVA's browser`,
    autova_email: t`From AutoVA's email`,
  };
}

/** What saw it first: Etsy's notice, the regular check, or the relay paste. */
export function useObservedVia(): Record<OrderTracking["observed_via"], string> {
  const { t } = useLingui();
  return {
    webhook: t`Etsy notice`,
    schedule: t`Regular check`,
    relay: t`Tracking relay`,
  };
}

/**
 * Each parcel's tracking (AC-6.1.2, AC-6.5.3): the carrier, the code's last four characters only,
 * where it came from, what saw it and when it was first seen. The full code is never here.
 */
export function TrackingEvents({
  tracking,
  loading = false,
}: {
  tracking: readonly OrderTracking[] | undefined;
  loading?: boolean;
}) {
  const { t } = useLingui();
  const { locale } = useLocale();
  const sources = useTrackingSources();
  const via = useObservedVia();
  const when = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <section aria-label={t`Tracking`} className="flex flex-col gap-2">
      <SectionLabel>
        <Trans>Tracking</Trans>
      </SectionLabel>
      {tracking === undefined ? (
        <p className="m-0 text-body-sm text-muted" aria-busy={loading}>
          {loading ? t`Loading the tracking…` : t`The tracking could not be read.`}
        </p>
      ) : tracking.length === 0 ? (
        <p className="m-0 text-body-sm text-secondary">
          <Trans>No tracking number seen yet.</Trans>
        </p>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {tracking.map((parcel) => (
            <li
              key={`${parcel.carrier}-${parcel.last4}-${parcel.first_observed_at}`}
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
            >
              <span className="text-body-sm">
                <bdi>{parcel.carrier_name}</bdi>{" "}
                <span className="ltr font-mono text-caption text-secondary">{`•••• ${parcel.last4}`}</span>
              </span>
              <span className="text-caption text-muted">
                {sources[parcel.source]} · {via[parcel.observed_via]} ·{" "}
                <time dateTime={parcel.first_observed_at} className="tabular">
                  {t`first seen ${when.format(new Date(parcel.first_observed_at))}`}
                </time>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * An order's status timeline (slice 5.7): every recorded step, oldest first, with what recorded
 * it and when. The newest step is the order's current state and carries the accent. An order
 * read live (not stored yet) has no recorded steps; the timeline says so instead of showing an
 * empty list.
 */
export function OrderTimeline({
  timeline,
  loading = false,
}: {
  timeline: readonly OrderStatusChange[] | undefined;
  loading?: boolean;
}) {
  const { t } = useLingui();
  const { locale } = useLocale();
  const states = useStoreStates();
  const sources = useSources();
  const when = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <section aria-label={t`Order history`} className="flex flex-col gap-2">
      <SectionLabel>
        <Trans>History</Trans>
      </SectionLabel>
      {timeline === undefined ? (
        <p className="m-0 text-body-sm text-muted" aria-busy={loading}>
          {loading ? t`Loading the order's history…` : t`The history could not be read.`}
        </p>
      ) : timeline.length === 0 ? (
        <p className="m-0 text-body-sm text-secondary">
          <Trans>Read live from Etsy: the steps appear once HTCO has stored this order.</Trans>
        </p>
      ) : (
        <ol className="m-0 flex list-none flex-col p-0">
          {timeline.map((step, i) => {
            const current = i === timeline.length - 1;
            return (
              <li
                key={`${step.observed_at}-${step.to_state}`}
                className="relative flex items-start gap-3 ps-0 pb-3 last:pb-0"
              >
                {/* The rail and the step's mark: a ring, filled for the current step. */}
                <span aria-hidden="true" className="relative flex w-3 shrink-0 justify-center pt-1">
                  {current ? null : <span className="absolute top-4 bottom-[-12px] w-px bg-line" />}
                  <span
                    className={cx(
                      "size-2.5 rounded-full",
                      current
                        ? "border-2 border-tertiary bg-panel"
                        : "border border-line-strong bg-panel",
                    )}
                  />
                </span>
                <span className="flex min-w-0 grow flex-wrap items-baseline justify-between gap-x-3">
                  <span
                    className={cx(
                      "text-body-sm",
                      current ? "font-medium text-primary" : "text-secondary",
                    )}
                  >
                    {states[step.to_state]}
                    {current ? <span className="sr-only">{t` (current)`}</span> : null}
                  </span>
                  <span className="text-caption text-muted">
                    {sources[step.source]} ·{" "}
                    <time dateTime={step.observed_at} className="tabular">
                      {when.format(new Date(step.observed_at))}
                    </time>
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
