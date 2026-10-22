import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import {
  ListingPhoto,
  LiveNote,
  LiveProblem,
  LiveSkeleton,
  NoShopYet,
  listingsQuery,
  overviewQuery,
  useCount,
  useLiveShop,
  useMoney,
  type ShopListing,
} from "./live.tsx";
import { ShopChips } from "./ShopChips.tsx";
import { useApi } from "../../shared/api/api.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Card,
  DemoPart,
  Dot,
  IdBlock,
  InkDisc,
  KV,
  N,
  PlusGlyph,
  Screen,
  SectionLabel,
  bi,
  useBi,
} from "../../shared/ui/kit/index.ts";

/**
 * Commerce › Products, live from Etsy: the shop's active listings with photo, price, stock,
 * views, favourites, section and tags, and the chosen listing's details. Production cost,
 * suppliers and the product studio stay Demo until their phases (13 and 12).
 */
export function ProductsPage() {
  const { t } = useLingui();
  const live = useLiveShop();
  return (
    <>
      <PageHeader title={t`Products`} />
      {live.shop !== undefined ? (
        <Products key={live.shop.id} shopId={live.shop.id} chips={<ShopChips live={live} />} />
      ) : (
        <Screen layout="l3">
          <Panel>
            <PanelHeader title={<Trans>Product details</Trans>} />
          </Panel>
          <Panel className="lg:col-[2/4]">
            <PanelHeader title={<Trans>Catalog</Trans>} />
            {live.isError ? (
              <LiveProblem error={new Error("shops")} onRetry={live.refetch} />
            ) : live.shops === undefined ? (
              <LiveSkeleton rows={6} label={t`Loading products`} />
            ) : (
              <NoShopYet
                what={<Trans>Connect your Etsy shop and its listings appear here, live.</Trans>}
              />
            )}
          </Panel>
        </Screen>
      )}
    </>
  );
}

function Products({ shopId, chips }: { shopId: string; chips: ReactNode }) {
  const { t } = useLingui();
  const api = useApi();
  const money = useMoney();
  const count = useCount();
  const listings = useQuery(listingsQuery(api, shopId));
  const overview = useQuery(overviewQuery(api, shopId));
  const [section, setSection] = useState<number | "all">("all");
  const [chosen, setChosen] = useState<number | null>(null);
  const items = (listings.data?.items ?? []).filter(
    (l) => section === "all" || l.section_id === section,
  );
  const selected = items.find((l) => l.listing_id === chosen) ?? items[0];
  const sold = new Map(
    (overview.data?.sales?.top_listings ?? []).map((l) => [l.listing_id, l.units] as const),
  );

  return (
    <Screen layout="l3">
      <Panel>
        <PanelHeader title={<Trans>Product details</Trans>} />
        <div className="flex min-h-0 grow flex-col justify-between gap-5 overflow-auto px-6 pb-6">
          {selected === undefined ? (
            listings.data === undefined && !listings.isError ? (
              <LiveSkeleton rows={4} label={t`Loading products`} />
            ) : null
          ) : (
            <Details listing={selected} sold={sold.get(selected.listing_id)} />
          )}
          {chips}
          <DemoPart tag="edge">
            <KV
              items={[
                [<Trans>Production cost</Trans>, <N key="c">$15.96</N>],
                [<Trans>Supplier</Trans>, <N key="s">Printful</N>],
              ]}
            />
          </DemoPart>
        </div>
      </Panel>
      <Panel className="lg:col-[2/4]">
        <PanelHeader
          title={<Trans>Catalog</Trans>}
          meta={
            listings.data === undefined ? undefined : (
              <>
                <N>{count(listings.data.total_count)}</N> ·{" "}
                <LiveNote fetchedAt={listings.data.fetched_at} stale={listings.data.stale} />
              </>
            )
          }
        />
        {listings.isError ? (
          <LiveProblem error={listings.error} onRetry={() => void listings.refetch()} />
        ) : listings.data === undefined ? (
          <LiveSkeleton rows={6} label={t`Loading products`} />
        ) : listings.data.items.length === 0 ? (
          <p className="m-0 flex grow items-center justify-center px-6 py-12 text-center text-body-sm text-secondary">
            <Trans>This shop has no active listings.</Trans>
          </p>
        ) : (
          <div className="flex min-h-0 grow flex-col gap-3 overflow-auto px-6 pb-6">
            {listings.data.sections.length === 0 ? null : (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={t`Sections`}>
                {[{ section_id: "all" as const, title: t`All` }, ...listings.data.sections].map(
                  (s) => (
                    <button
                      key={String(s.section_id)}
                      type="button"
                      aria-pressed={section === s.section_id}
                      onClick={() => {
                        setSection(s.section_id);
                      }}
                      className={cx(
                        "inline-flex h-9 items-center rounded-pill border px-3 text-caption outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                        section === s.section_id
                          ? "border-inverse bg-inverse text-on-inverse"
                          : "border-line-strong hover:border-line-hover",
                      )}
                    >
                      <bdi>{s.title}</bdi>
                    </button>
                  ),
                )}
              </div>
            )}
            <div className="grid grid-cols-4 gap-2 max-xl:grid-cols-3 max-md:grid-cols-2">
              {items.map((l) => (
                <button
                  type="button"
                  key={l.listing_id}
                  aria-pressed={l.listing_id === selected?.listing_id}
                  onClick={() => {
                    setChosen(l.listing_id);
                  }}
                  className={cx(
                    "flex min-w-0 flex-col items-center justify-between rounded-card border p-4 text-center transition-[background-color,translate] outline-none hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus max-sm:p-3",
                    l.listing_id === selected?.listing_id
                      ? "border-selected bg-selected"
                      : "border-line hover:bg-hover",
                  )}
                >
                  <span className="mb-2.5 flex w-full justify-between gap-2 text-caption">
                    <N>{money(l.price)}</N>
                    <span
                      className={cx("font-light", l.quantity === 0 ? "text-primary" : "text-muted")}
                    >
                      {l.quantity === 0 ? (
                        <span className="inline-flex h-5 items-center gap-1 rounded-pill border border-line-strong px-2 text-primary">
                          <Dot tone="danger" />
                          {t`Sold out`}
                        </span>
                      ) : (
                        <>
                          <N>{count(l.quantity)}</N> {t`in stock`}
                        </>
                      )}
                    </span>
                  </span>
                  <ListingPhoto
                    src={l.image_url}
                    alt={l.image_alt}
                    title={l.title}
                    size={140}
                    className="max-sm:!size-[104px]"
                  />
                  <span dir="auto" className="mt-3 line-clamp-2 text-body-sm">
                    {l.title}
                  </span>
                  <span className="mt-1.5 text-caption text-secondary">
                    <N>{count(l.views)}</N> {t`views`} · <N>{count(l.favorer_count)}</N>{" "}
                    {t`favourites`}
                  </span>
                </button>
              ))}
            </div>
            {listings.data.truncated ? (
              <p className="m-0 text-caption text-muted">
                {t`Showing ${count(listings.data.items.length)} of ${count(listings.data.total_count)} listings.`}
              </p>
            ) : null}
            <ProductStudioDemo />
          </div>
        )}
      </Panel>
    </Screen>
  );
}

function Details({ listing, sold }: { listing: ShopListing; sold: number | undefined }) {
  const { t } = useLingui();
  const money = useMoney();
  const count = useCount();
  return (
    <div className="flex flex-col gap-5">
      <IdBlock
        label={<Trans>Listing:</Trans>}
        value={<span dir="auto">{listing.title}</span>}
        wrap
        className="[&>div:nth-child(2)]:text-[24px] [&>div:nth-child(2)]:leading-[1.3]"
      >
        <div className="mt-1 text-caption text-muted">
          <Trans>ID</Trans> · <N>{String(listing.listing_id)}</N>
        </div>
      </IdBlock>
      <div className="flex justify-center">
        <ListingPhoto
          src={listing.image_url}
          alt={listing.image_alt}
          title={listing.title}
          size={150}
          className="motion-safe:animate-[htco-float_6s_ease-in-out_infinite] max-sm:!size-[112px]"
        />
      </div>
      <KV
        items={[
          [<Trans>Price</Trans>, <N key="p">{money(listing.price)}</N>],
          [
            <Trans>In stock</Trans>,
            <N key="q">{listing.is_digital ? t`Digital` : count(listing.quantity)}</N>,
          ],
          [<Trans>Views</Trans>, <N key="v">{count(listing.views)}</N>],
          [<Trans>Favourites</Trans>, <N key="f">{count(listing.favorer_count)}</N>],
          [<Trans>Sold, 30 days</Trans>, <N key="s">{sold === undefined ? "—" : count(sold)}</N>],
          [
            <Trans>Section</Trans>,
            listing.section_title ?? (
              <span key="n" className="text-muted">
                —
              </span>
            ),
          ],
        ]}
      />
      {listing.tags.length === 0 ? null : (
        <div>
          <SectionLabel>
            <Trans>Tags</Trans>
          </SectionLabel>
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {listing.tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex h-6 items-center rounded-pill bg-raised px-2.5 text-caption"
              >
                <bdi>{tag}</bdi>
              </li>
            ))}
          </ul>
        </div>
      )}
      {listing.url === null ? null : (
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="self-center text-caption text-primary underline underline-offset-[3px]"
        >
          <Trans>Open on Etsy</Trans>
        </a>
      )}
    </div>
  );
}

/** The product studio (Phase 12) as the demo draws it. */
function ProductStudioDemo() {
  const text = useBi();
  return (
    <DemoPart tag="corner">
      <Card dashed className="flex items-center gap-4">
        <InkDisc>
          <PlusGlyph size={14} />
        </InkDisc>
        <div>
          <div className="text-body">
            {text(bi("ניקה מכינה 4 הדמיות חדשות", "Nika is preparing 4 new mockups"))}
          </div>
          <div className="text-caption text-secondary">
            {text(bi("ממתין לאישור לפני פרסום", "Waiting for approval before publishing"))}
          </div>
        </div>
      </Card>
    </DemoPart>
  );
}
