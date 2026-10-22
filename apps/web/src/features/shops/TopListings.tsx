import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { ListingPhoto, LiveNote, listingsQuery, useCount, useMoney } from "../commerce/live.tsx";
import { useApi } from "../../shared/api/api.tsx";
import { ArrowEndIcon } from "../../shared/ui/icons.tsx";
import { N, Strip, StripCard, circleStyle } from "../../shared/ui/kit/index.ts";

/**
 * The "Top listings" strip under the shop panels: the shop's active listings live from Etsy,
 * most viewed first, with photo, price and views. `shopId` undefined: no connected shop yet.
 */
export function TopListings({
  shopId,
  loading = false,
}: {
  shopId?: string | undefined;
  /** The shops are still on their way. */
  loading?: boolean;
}) {
  const { t } = useLingui();
  const api = useApi();
  const money = useMoney();
  const count = useCount();
  const listings = useQuery({
    ...listingsQuery(api, shopId ?? ""),
    enabled: shopId !== undefined,
  });
  const items = [...(listings.data?.items ?? [])].sort((a, b) => b.views - a.views).slice(0, 8);
  const message =
    shopId === undefined && !loading
      ? t`Listings appear here once a shop is connected.`
      : listings.isError
        ? t`Listings could not be loaded from Etsy right now.`
        : listings.data !== undefined && items.length === 0
          ? t`This shop has no active listings.`
          : undefined;
  return (
    <Strip
      className="min-h-0 lg:col-span-full max-sm:hidden"
      title={<Trans>Top listings</Trans>}
      meta={
        listings.data === undefined ? undefined : (
          <LiveNote fetchedAt={listings.data.fetched_at} stale={listings.data.stale} />
        )
      }
      actions={
        <Link
          to="/commerce/products"
          aria-label={t`All products`}
          title={t`All products`}
          className={circleStyle()}
        >
          <ArrowEndIcon size={16} />
        </Link>
      }
    >
      {message !== undefined ? (
        <p className="m-0 col-span-full self-center text-center text-body-sm text-secondary">
          {message}
        </p>
      ) : listings.data === undefined ? (
        Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="h-full min-h-28 rounded-card bg-hover motion-safe:animate-pulse"
          />
        ))
      ) : (
        items.map((listing) => (
          <StripCard
            key={listing.listing_id}
            topStart={<N>{money(listing.price, { whole: true })}</N>}
            topEnd={
              <>
                <N>{count(listing.views)}</N> {t`views`}
              </>
            }
            task={
              <span dir="auto" className="block truncate text-primary">
                {listing.title}
              </span>
            }
          >
            <ListingPhoto
              src={listing.thumbnail_url}
              alt={listing.image_alt}
              title={listing.title}
              size={56}
            />
          </StripCard>
        ))
      )}
    </Strip>
  );
}
