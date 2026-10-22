import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";

import { AllCustomersPanel, CustomerHealthPanel } from "./CustomersDemos.tsx";
import {
  LiveNote,
  LiveProblem,
  reviewsQuery,
  useCount,
  useLiveShop,
  useShortDate,
  type ShopReviews,
} from "../commerce/live.tsx";
import { useApi } from "../../shared/api/api.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { DemoPart, N, Screen, Strip, StripCard } from "../../shared/ui/kit/index.ts";

/**
 * Customers › Customers: the shop's reviews live from Etsy (the strip), beside the customer
 * health and list the demo draws, which stay Demo until a customer store exists (Phase 5 builds
 * it from ingested orders; reading buyers live would not be minimal).
 */
export function CustomersPage() {
  const { t } = useLingui();
  return (
    <>
      <PageHeader title={t`Customers`} />
      <Screen layout="l2s">
        <DemoPart className="min-h-0" contentClassName="flex">
          <CustomerHealthPanel />
        </DemoPart>
        <DemoPart className="min-h-0 max-sm:hidden" contentClassName="flex">
          <AllCustomersPanel />
        </DemoPart>
        <Reviews />
      </Screen>
    </>
  );
}

function Stars({ rating }: { rating: number }) {
  const { t } = useLingui();
  const value = String(rating);
  return (
    <span
      role="img"
      aria-label={t`${value} of 5 stars`}
      className="ltr text-caption tracking-[1px]"
    >
      <span aria-hidden="true">{"★".repeat(rating)}</span>
      <span aria-hidden="true" className="text-muted">
        {"★".repeat(5 - rating)}
      </span>
    </span>
  );
}

/** The newest reviews of the shop, with the shop's average and count. */
function Reviews() {
  const { t } = useLingui();
  const api = useApi();
  const live = useLiveShop();
  const count = useCount();
  const date = useShortDate();
  const shopId = live.shop?.id;
  const reviews = useQuery({ ...reviewsQuery(api, shopId ?? ""), enabled: shopId !== undefined });
  const data: ShopReviews | undefined = reviews.data;
  const meta =
    data === undefined ? undefined : (
      <>
        {data.average === null ? null : (
          <>
            <N>{`★ ${Number(data.average).toFixed(1)}`}</N> · {t`${count(data.count)} reviews`}{" "}
            ·{" "}
          </>
        )}
        <LiveNote fetchedAt={data.fetched_at} stale={data.stale} />
      </>
    );
  const message =
    live.shops !== undefined && shopId === undefined
      ? t`Reviews appear here once a shop is connected.`
      : data?.items.length === 0
        ? t`No reviews yet.`
        : undefined;
  return (
    <Strip title={<Trans>Reviews</Trans>} meta={meta} label={t`Reviews`}>
      {live.isError ? (
        <div className="col-span-full">
          <LiveProblem compact error={new Error("shops")} onRetry={live.refetch} />
        </div>
      ) : reviews.isError ? (
        <div className="col-span-full">
          <LiveProblem compact error={reviews.error} onRetry={() => void reviews.refetch()} />
        </div>
      ) : message !== undefined ? (
        <p className="col-span-full m-0 self-center text-center text-body-sm text-secondary">
          {message}
        </p>
      ) : data === undefined ? (
        Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="h-full min-h-28 rounded-card bg-hover motion-safe:animate-pulse"
          />
        ))
      ) : (
        data.items.slice(0, 8).map((review, i) => (
          <StripCard
            key={`${String(review.listing_id)}-${review.created_at}-${String(i)}`}
            topStart={<Stars rating={review.rating} />}
            topEnd={<time dateTime={review.created_at}>{date(review.created_at)}</time>}
            line={
              review.text === null ? (
                <span className="text-muted">{t`Rating only`}</span>
              ) : (
                <span dir="auto" className="line-clamp-3 block text-start text-secondary">
                  {review.text}
                </span>
              )
            }
          />
        ))
      )}
    </Strip>
  );
}
