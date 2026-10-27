import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { quoteBoardQuery, type ProductQuotes, type QuoteCard } from "./api.ts";
import { ApiError, useApi } from "../../shared/api/api.tsx";
import { listingsQuery, useLiveShop } from "../../shared/api/live.ts";
import { useMoney, useShortDate } from "../../shared/i18n/format.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Chip,
  Flow,
  ListingPhoto,
  LiveSkeleton,
  N,
  Note,
  ShopChips,
} from "../../shared/ui/kit/index.ts";
import { NoShopYet, ShopReconnectBanner } from "../shops/index.ts";

/**
 * Commerce › Quotes: "New product quotes" (platform slice 7.16). One panel per product waiting
 * for a supplier, its quotes side by side as cards, cheapest first, as the server sorted them.
 * The cheapest choosable quote carries the orange emphasis; a quote past its validity is greyed
 * out and says it cannot be chosen (AC-7.16.2). Amounts and day ranges are left-to-right in
 * Hebrew too. Choosing a quote is slice 7.17 (an Owner approval), so nothing here writes.
 */
export function QuotesPage() {
  const { t } = useLingui();
  const live = useLiveShop();
  return (
    <>
      <PageHeader title={t`New product quotes`} />
      <Flow>
        {live.shop === undefined ? null : <ShopReconnectBanner shop={live.shop} />}
        {live.shop !== undefined ? (
          <Board key={live.shop.id} shopId={live.shop.id} chips={<ShopChips live={live} />} />
        ) : (
          <Panel>
            <PanelHeader title={<Trans>New product quotes</Trans>} />
            {live.shops === undefined && !live.isError ? (
              <LiveSkeleton rows={4} label={t`Loading quotes`} />
            ) : (
              <NoShopYet
                what={<Trans>Connect your Etsy shop and its suppliers' quotes appear here.</Trans>}
              />
            )}
          </Panel>
        )}
      </Flow>
    </>
  );
}

function Board({ shopId, chips }: { shopId: string; chips: ReactNode }) {
  const { t } = useLingui();
  const api = useApi();
  const board = useQuery(quoteBoardQuery(api, shopId));
  // Titles and photos come from the shop's listings; a product without one shows its number.
  const listings = useQuery(listingsQuery(api, shopId));
  const titles = new Map((listings.data?.items ?? []).map((l) => [l.listing_id, l] as const));

  if (board.isPending)
    return (
      <Panel>
        <PanelHeader title={<Trans>New product quotes</Trans>} meta={chips} />
        <LiveSkeleton rows={4} label={t`Loading quotes`} />
      </Panel>
    );
  if (board.isError) {
    const forbidden = board.error instanceof ApiError && board.error.status === 403;
    return (
      <Panel>
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
        >
          <h2 className="m-0 font-display text-title-sm font-light">
            <Trans>Quotes could not be loaded</Trans>
          </h2>
          <p className="m-0 max-w-[44ch] text-body-sm text-secondary">
            {forbidden ? (
              <Trans>Only an Owner or Admin sees supplier quotes.</Trans>
            ) : (
              <Trans>The quotes are not answering. Check your connection and try again.</Trans>
            )}
          </p>
          {forbidden ? null : (
            <Button variant="primary" size="lg" onPress={() => void board.refetch()}>
              <Trans>Try again</Trans>
            </Button>
          )}
        </div>
      </Panel>
    );
  }

  const items = board.data.items;
  if (items.length === 0)
    return (
      <Panel>
        <PanelHeader title={<Trans>New product quotes</Trans>} meta={chips} />
        <div className="px-6 pb-6">
          <Note>
            <Trans>
              No product is waiting for a supplier. When AutoVA sends a quote for a new product, it
              appears here and you get a notification.
            </Trans>
          </Note>
        </div>
      </Panel>
    );

  return (
    <>
      <Panel>
        <PanelHeader title={<Trans>Waiting for a supplier</Trans>} meta={chips} />
        <p className="m-0 px-6 pb-5 text-body-sm text-secondary">
          <Plural
            value={items.length}
            one="# product is waiting for you to choose a supplier. Quotes are sorted by their total, cheapest first."
            other="# products are waiting for you to choose a supplier. Quotes are sorted by their total, cheapest first."
          />
        </p>
      </Panel>
      {items.map((product) => {
        const listing = titles.get(product.listing_id);
        return (
          <ProductPanel
            key={product.request_id}
            product={product}
            title={listing?.title}
            photo={listing?.thumbnail_url}
          />
        );
      })}
    </>
  );
}

function ProductPanel({
  product,
  title,
  photo,
}: {
  product: ProductQuotes;
  title: string | undefined;
  photo: string | null | undefined;
}) {
  const { t } = useLingui();
  const date = useShortDate();
  const heading = title ?? t`Listing ${String(product.listing_id)}`;
  // The server's order: the first choosable card is the cheapest one that can be chosen.
  const best = product.quotes.find((q) => q.choosable)?.id;
  return (
    <Panel label={heading}>
      <div className="flex items-center gap-3 px-6 pt-5 pb-4">
        <ListingPhoto src={photo} title={heading} size={40} className="rounded-control" />
        <div className="min-w-0">
          <h2 dir="auto" className="m-0 truncate font-display text-title-sm font-light">
            {heading}
          </h2>
          <p className="m-0 text-caption text-muted">
            <N>{`#${String(product.listing_id)}`}</N>
            {product.variant === "" ? null : (
              <>
                {" · "}
                <N>{product.variant}</N>
              </>
            )}
            {" · "}
            <Trans>Asked {date(product.requested_at)}</Trans>
          </p>
        </div>
      </div>
      {product.quotes.length === 0 ? (
        <div className="px-6 pb-6">
          <Note>
            <Trans>No quote yet. AutoVA's suppliers usually answer within a few days.</Trans>
          </Note>
        </div>
      ) : (
        <ul
          aria-label={t`Quotes for ${heading}`}
          className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-3 px-6 pb-6"
        >
          {product.quotes.map((quote) => (
            <QuoteCardItem key={quote.id} quote={quote} best={quote.id === best} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function days(range: { min: number; max: number }): string {
  return range.min === range.max ? String(range.min) : `${String(range.min)}–${String(range.max)}`;
}

function QuoteCardItem({ quote, best }: { quote: QuoteCard; best: boolean }) {
  const { t } = useLingui();
  const money = useMoney();
  const date = useShortDate();
  const of = (amount: string) => money({ amount, currency: quote.currency });
  const rows: [ReactNode, ReactNode][] = [
    [t`Unit price`, <N key="u">{of(quote.unit_price)}</N>],
    [t`Shipping`, <N key="s">{of(quote.shipping_cost)}</N>],
    [t`Processing`, <Trans key="p">{<N>{days(quote.processing_days)}</N>} days</Trans>],
    [t`Delivery`, <Trans key="d">{<N>{days(quote.shipping_days)}</N>} days</Trans>],
  ];
  return (
    <li
      aria-disabled={quote.choosable ? undefined : true}
      className={[
        "flex min-w-0 flex-col gap-3 rounded-card border p-4",
        best ? "border-tertiary bg-panel" : "border-line-strong bg-panel",
        quote.choosable ? "" : "opacity-60",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 dir="auto" className="m-0 min-w-0 text-body font-medium break-words">
          {quote.supplier}
        </h3>
        {best ? (
          <Chip tone="tertiary" size="sm">
            <Trans>Lowest total</Trans>
          </Chip>
        ) : quote.choosable ? null : (
          <Chip size="sm">
            <Trans>Expired</Trans>
          </Chip>
        )}
      </div>
      <div>
        <div className="text-caption text-muted">
          <Trans>Total per unit, with shipping</Trans>
        </div>
        <div className={best ? "text-title-sm text-tertiary-text" : "text-title-sm"}>
          <N>{of(quote.total)}</N>
        </div>
      </div>
      <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2 text-body-sm">
        {rows.map(([label, value], index) => (
          <div key={index} className="min-w-0">
            <dt className="text-caption text-muted">{label}</dt>
            <dd className="m-0">{value}</dd>
          </div>
        ))}
      </dl>
      <p dir="auto" className="m-0 text-caption text-secondary">
        {quote.shipping_method}
      </p>
      <p className="m-0 text-caption text-muted">
        {quote.valid_until === null ? (
          <Trans>No end date given</Trans>
        ) : quote.choosable ? (
          <Trans>Valid until {date(quote.valid_until)}</Trans>
        ) : (
          <Trans>Expired on {date(quote.valid_until)}, cannot be chosen</Trans>
        )}
      </p>
    </li>
  );
}
