import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";

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
import { ShopChips } from "../commerce/ShopChips.tsx";
import { useApi } from "../../shared/api/api.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  DemoPart,
  DemoTag,
  Figure,
  Figures,
  Flow,
  FlowBody,
  FlowRow,
  Focus,
  N,
  SubTabs,
  TabPanel,
} from "../../shared/ui/kit/index.ts";

/** Reviews shown at a time; "Show more" adds as many again. */
const PAGE = 12;

/** A low rating: three stars or fewer, the reviews worth reading first. */
const LOW = 3;

/**
 * Customers › Customers (clarity round 3): what buyers say, live from Etsy, on top (the shop's
 * average, its count and the recent low ratings to read first), then sub-tabs: the reviews, and
 * the customer health and list the demo draws, which stay Demo until a customer store exists
 * (Phase 5 builds it from ingested orders; reading buyers live would not be minimal).
 */
export function CustomersPage() {
  const { t } = useLingui();
  const api = useApi();
  const live = useLiveShop();
  const count = useCount();
  const tabs = useId();
  const [tab, setTab] = useState<"reviews" | "customers">("reviews");
  const shopId = live.shop?.id;
  // The shop whose low ratings are shown: another shop starts with every review (Codex, #37).
  const [lowFor, setLowFor] = useState<string | null>(null);
  const lowOnly = shopId !== undefined && lowFor === shopId;
  const reviews = useQuery({ ...reviewsQuery(api, shopId ?? ""), enabled: shopId !== undefined });
  const data = reviews.data;
  // The shares come from the server's distribution of the newest reviews (its sample), not from
  // the few review texts it sends (Codex, #37); the filter works on those texts.
  const stars = (n: (s: number) => boolean) =>
    (data?.distribution ?? []).filter((d) => n(d.stars)).reduce((sum, d) => sum + d.count, 0);
  const sample = data?.sample_size ?? 0;
  const low = stars((s) => s <= LOW);
  const five = stars((s) => s === 5);
  const lowShown = (data?.items ?? []).filter((r) => r.rating <= LOW).length;
  const share = sample === 0 ? "—" : `${String(Math.round((five / sample) * 100))}%`;
  const newest = count(sample);

  return (
    <>
      <PageHeader title={t`Customers`} />
      <Flow>
        <Focus
          title={<Trans>What buyers say</Trans>}
          meta={
            data === undefined ? undefined : (
              <LiveNote fetchedAt={data.fetched_at} stale={data.stale} />
            )
          }
          end={<ShopChips live={live} />}
          lead={
            data === undefined ? (
              <Trans>The shop's reviews on Etsy, newest first.</Trans>
            ) : low > 0 ? (
              <Plural
                value={low}
                one="One recent review has three stars or fewer. Read it first."
                other="# recent reviews have three stars or fewer. Read them first."
              />
            ) : data.items.length === 0 ? (
              <Trans>No reviews yet. They appear here as buyers leave them on Etsy.</Trans>
            ) : (
              <Trans>Recent reviews are all four or five stars.</Trans>
            )
          }
          figures={
            <Figures label={t`Review numbers`}>
              <Figure
                label={<Trans>Average rating</Trans>}
                value={
                  data?.average == null ? (
                    <N>—</N>
                  ) : (
                    <span className="ltr inline-flex items-center gap-2">
                      <span className="[&_svg]:size-6">
                        <Star on />
                      </span>
                      <N>{Number(data.average).toFixed(1)}</N>
                    </span>
                  )
                }
              />
              <Figure
                label={<Trans>Reviews</Trans>}
                value={<N>{data === undefined ? "—" : count(data.count)}</N>}
              />
              <Figure
                label={<Trans>Five stars</Trans>}
                value={<N>{share}</N>}
                note={t`of the newest ${newest}`}
              />
              <Figure
                label={<Trans>Three stars or fewer</Trans>}
                value={<N>{data === undefined ? "—" : count(low)}</N>}
                tone={low > 0 ? "tertiary" : undefined}
                note={t`of the newest ${newest}`}
              />
            </Figures>
          }
          actions={
            lowShown > 0 || lowOnly ? (
              <Button
                variant={lowOnly ? "secondary" : "primary"}
                size="lg"
                onPress={() => {
                  setLowFor(lowOnly ? null : (shopId ?? null));
                  setTab("reviews");
                }}
              >
                {lowOnly ? <Trans>Show every review</Trans> : <Trans>Read the low ratings</Trans>}
              </Button>
            ) : undefined
          }
        />
        <SubTabs
          label={t`Customers views`}
          idBase={tabs}
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "reviews", label: <Trans>Reviews</Trans>, count: data?.items.length },
            { id: "customers", label: <Trans>Customers</Trans>, demo: <DemoTag /> },
          ]}
        />
        <TabPanel idBase={tabs} tab={tab}>
          {tab === "reviews" ? (
            <Reviews live={live} reviews={reviews} lowOnly={lowOnly} />
          ) : (
            <FlowRow layout="side-main">
              <DemoPart contentClassName="flex">
                <CustomerHealthPanel />
              </DemoPart>
              <DemoPart contentClassName="flex">
                <AllCustomersPanel />
              </DemoPart>
            </FlowRow>
          )}
        </TabPanel>
      </Flow>
    </>
  );
}

/** One drawn star (never a text glyph, which some fonts leave out): filled or an outline. */
function Star({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="shrink-0">
      <path
        d="M8 1.6l1.9 4 4.3.5-3.2 2.9.9 4.3L8 11.1l-3.9 2.2.9-4.3-3.2-2.9 4.3-.5z"
        className={on ? "fill-tertiary stroke-tertiary" : "fill-none stroke-line-hover"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  const { t } = useLingui();
  // Etsy rates 1 to 5; anything else is drawn within those bounds.
  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  const value = String(filled);
  return (
    <span role="img" aria-label={t`${value} of 5 stars`} className="ltr inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} on={n <= filled} />
      ))}
    </span>
  );
}

/** The newest reviews of the shop, a page at a time; the low ones only when asked. */
function Reviews({
  live,
  reviews,
  lowOnly,
}: {
  live: ReturnType<typeof useLiveShop>;
  reviews: {
    data: ShopReviews | undefined;
    isError: boolean;
    error: Error | null;
    refetch: () => unknown;
  };
  lowOnly: boolean;
}) {
  const { t } = useLingui();
  const count = useCount();
  const date = useShortDate();
  const [shown, setShown] = useState(PAGE);
  const data = reviews.data;
  const items = (data?.items ?? []).filter((r) => !lowOnly || r.rating <= LOW);
  const message =
    live.shops !== undefined && live.shop === undefined
      ? t`Reviews appear here once a shop is connected.`
      : data?.items.length === 0
        ? t`No reviews yet.`
        : undefined;
  return (
    <Panel label={t`Reviews`}>
      <PanelHeader
        title={<Trans>Reviews</Trans>}
        meta={lowOnly ? <Trans>Three stars or fewer</Trans> : <Trans>Newest first</Trans>}
      />
      {live.isError ? (
        <LiveProblem compact error={new Error("shops")} onRetry={live.refetch} />
      ) : reviews.isError && reviews.error !== null ? (
        <LiveProblem compact error={reviews.error} onRetry={() => void reviews.refetch()} />
      ) : message !== undefined ? (
        <p className="m-0 px-6 py-12 text-center text-body-sm text-secondary">{message}</p>
      ) : data === undefined ? (
        <div aria-busy="true" className="grid grid-cols-4 gap-2 px-2 pb-2 max-lg:grid-cols-2">
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="h-32 rounded-card bg-hover motion-safe:animate-pulse"
            />
          ))}
        </div>
      ) : (
        <FlowBody className="gap-4 px-2 pb-2 max-sm:px-2">
          <ul className="m-0 grid list-none grid-cols-4 gap-2 p-0 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
            {items.slice(0, shown).map((review, i) => (
              <li
                key={`${String(review.listing_id)}-${review.created_at}-${String(i)}`}
                className={cx(
                  "flex min-w-0 flex-col gap-2.5 rounded-card border p-4",
                  review.rating <= LOW ? "border-line-strong bg-tertiary-subtle" : "border-line",
                )}
              >
                <span className="flex items-center justify-between gap-2 text-caption">
                  <Stars rating={review.rating} />
                  <time dateTime={review.created_at} className="text-muted">
                    {date(review.created_at)}
                  </time>
                </span>
                {review.text === null ? (
                  <span className="text-caption text-muted">{t`Rating only`}</span>
                ) : (
                  <span dir="auto" className="text-body-sm text-pretty text-secondary">
                    {review.text}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {items.length > shown ? (
            <div className="flex justify-center pb-3">
              <Button
                onPress={() => {
                  setShown((n) => n + PAGE);
                }}
              >
                {t`Show more (${count(items.length - shown)} left)`}
              </Button>
            </div>
          ) : null}
        </FlowBody>
      )}
    </Panel>
  );
}
