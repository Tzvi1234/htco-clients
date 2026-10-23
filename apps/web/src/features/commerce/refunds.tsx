import { Trans, useLingui } from "@lingui/react/macro";

import { cx } from "../../shared/lib/cx.ts";
import { N } from "../../shared/ui/kit/index.ts";
import { useMoney, useShortDate, useReason } from "../../shared/i18n/format.ts";
import type { ShopOrder } from "../../shared/api/live.ts";

type Refund = ShopOrder["refunds"][number];

/** Whether an order has a refund or cancellation to explain. */
export function hasRefundStory(order: ShopOrder): boolean {
  return order.state === "canceled" || order.state === "refunded" || order.refunds.length > 0;
}

/**
 * A small chip on a refunded or cancelled order's row: the reason of its latest refund (Etsy
 * gives a cancellation the reason of its refund), or "Partial refund" and the amount on an order
 * that was refunded in part and kept. Nothing on other orders.
 */
export function RefundChip({ order, className }: { order: ShopOrder; className?: string }) {
  const { t } = useLingui();
  const money = useMoney();
  const reason = useReason();
  if (!hasRefundStory(order)) return null;
  const latest = order.refunds.at(-1);
  const partial = order.state !== "canceled" && order.state !== "refunded";
  const text =
    partial && order.refunded_total != null
      ? t`Partial refund ${money(order.refunded_total)}`
      : reason(latest?.reason ?? null);
  return (
    <span
      data-refund-chip
      title={text}
      className={cx(
        "inline-flex h-5 max-w-[180px] items-center rounded-pill bg-tertiary-subtle px-2 text-caption text-tertiary-text",
        className,
      )}
    >
      <span dir="auto" className="truncate">
        {text}
      </span>
    </span>
  );
}

/**
 * An order's refunds or cancellation in its sheet: for each refund the reason (or "No reason
 * given"), the amount, the date and the seller's note when the role may see it.
 * A cancelled order with no refund still says that no reason was given.
 */
export function RefundDetails({ order }: { order: ShopOrder }) {
  const { t } = useLingui();
  const money = useMoney();
  const date = useShortDate();
  const reason = useReason();
  if (!hasRefundStory(order)) return null;
  const cancelled = order.state === "canceled";
  return (
    <section
      aria-label={cancelled ? t`Cancellation` : t`Refunds`}
      className="flex flex-col gap-3 rounded-card bg-tertiary-subtle px-4 py-3"
    >
      <h3 className="m-0 text-body-sm font-medium">
        {cancelled ? <Trans>Cancelled</Trans> : <Trans>Refunded</Trans>}
        {order.refunded_total == null ? null : (
          <>
            {" · "}
            <N>{money(order.refunded_total)}</N>
          </>
        )}
      </h3>
      {order.refunds.length === 0 ? (
        <p className="m-0 text-body-sm text-secondary">{reason(null)}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {order.refunds.map((r: Refund, i) => (
            <li key={`${r.refunded_at}-${String(i)}`} className="flex flex-col gap-0.5">
              <span className="flex items-baseline justify-between gap-3 text-body-sm">
                <span dir="auto" className="min-w-0">
                  {reason(r.reason)}
                </span>
                <N className="shrink-0">{money(r.amount)}</N>
              </span>
              <span className="text-caption text-secondary">
                <time dateTime={r.refunded_at}>{date(r.refunded_at)}</time>
              </span>
              {r.note === null ? null : (
                <span className="text-caption text-secondary">
                  <Trans>Seller's note:</Trans> <span dir="auto">{r.note}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
