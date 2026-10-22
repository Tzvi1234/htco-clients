import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState, type ReactNode } from "react";

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
import {
  PHONE_QUERY,
  REDUCED_MOTION_QUERY,
  useMediaQuery,
} from "../../shared/lib/useMediaQuery.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Aside,
  DemoPart,
  DemoTag,
  Dot,
  Figure,
  Figures,
  Flow,
  FlowBody,
  FlowRow,
  Focus,
  IdBlock,
  InkDisc,
  KV,
  N,
  PlusGlyph,
  SectionLabel,
  bi,
  useBi,
} from "../../shared/ui/kit/index.ts";

/** Listings shown at a time; "Show more" adds as many again (the page never scrolls a panel). */
const PAGE = 24;

/**
 * Commerce › Products, live from Etsy (clarity round 3): the catalog's health on top (active,
 * sold out, views, favourites) with the one thing to look at, then the catalog beside the chosen
 * listing's details. Production cost, suppliers and the product studio stay Demo until their
 * phases (13 and 12), in their own panel under the details.
 */
export function ProductsPage() {
  const { t } = useLingui();
  const live = useLiveShop();
  return (
    <>
      <PageHeader title={t`Products`} />
      <Flow>
        {live.shop !== undefined ? (
          <Products key={live.shop.id} shopId={live.shop.id} chips={<ShopChips live={live} />} />
        ) : (
          <Panel>
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
        )}
      </Flow>
    </>
  );
}

function Products({ shopId, chips }: { shopId: string; chips: ReactNode }) {
  const { t } = useLingui();
  const api = useApi();
  const money = useMoney();
  const count = useCount();
  const phone = useMediaQuery(PHONE_QUERY);
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const details = useRef<HTMLDivElement>(null);
  const listings = useQuery(listingsQuery(api, shopId));
  const overview = useQuery(overviewQuery(api, shopId));
  const [section, setSection] = useState<number | "all">("all");
  const [soldOutOnly, setSoldOutOnly] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [shown, setShown] = useState(PAGE);
  const all = listings.data?.items ?? [];
  const items = all.filter(
    (l) =>
      (section === "all" || l.section_id === section) &&
      (!soldOutOnly || (l.quantity === 0 && !l.is_digital)),
  );
  const selected = items.find((l) => l.listing_id === chosen) ?? items[0];
  const sold = new Map(
    (overview.data?.sales?.top_listings ?? []).map((l) => [l.listing_id, l.units] as const),
  );
  const soldOut = all.filter((l) => l.quantity === 0 && !l.is_digital).length;
  const views = all.reduce((n, l) => n + l.views, 0);
  const favourites = all.reduce((n, l) => n + l.favorer_count, 0);
  const known = listings.data !== undefined;
  // A catalog larger than one read: the sums cover the listings read, and say so (Codex, #37).
  const partial = listings.data?.truncated === true;
  const read = count(all.length);
  const choose = (id: number) => {
    setChosen(id);
    // On a phone the details sit under the catalog: bring them into view.
    if (phone)
      details.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      <Focus
        title={<Trans>Your catalog</Trans>}
        meta={
          listings.data === undefined ? undefined : (
            <LiveNote fetchedAt={listings.data.fetched_at} stale={listings.data.stale} />
          )
        }
        end={chips}
        lead={
          !known ? (
            <Trans>The shop's active listings, live from Etsy.</Trans>
          ) : soldOut > 0 ? (
            <Plural
              value={soldOut}
              one="One listing is sold out. Restock it on Etsy so it keeps selling."
              other="# listings are sold out. Restock them on Etsy so they keep selling."
            />
          ) : partial ? (
            <Trans>
              None of the listings read is sold out; the catalog is larger than one read.
            </Trans>
          ) : (
            <Trans>Every active listing is in stock.</Trans>
          )
        }
        figures={
          <Figures label={t`Catalog numbers`}>
            <Figure
              label={<Trans>Active listings</Trans>}
              value={<N>{known ? count(listings.data.total_count) : "—"}</N>}
            />
            <Figure
              label={<Trans>Sold out</Trans>}
              value={<N>{known ? count(soldOut) : "—"}</N>}
              tone={soldOut > 0 ? "tertiary" : undefined}
              {...(partial ? { note: t`of the ${read} read` } : {})}
            />
            <Figure
              label={<Trans>Views</Trans>}
              value={<N>{known ? count(views) : "—"}</N>}
              {...(partial ? { note: t`of the ${read} read` } : {})}
            />
            <Figure
              label={<Trans>Favourites</Trans>}
              value={<N>{known ? count(favourites) : "—"}</N>}
              {...(partial ? { note: t`of the ${read} read` } : {})}
            />
          </Figures>
        }
        actions={
          soldOut > 0 ? (
            <Button
              variant={soldOutOnly ? "secondary" : "primary"}
              size="lg"
              onPress={() => {
                setSoldOutOnly((on) => !on);
                // Catalog-wide: a chosen section would hide the sold-out ones (Codex, #37).
                setSection("all");
                setShown(PAGE);
              }}
            >
              {soldOutOnly ? (
                <Trans>Show every listing</Trans>
              ) : (
                <Trans>Show the sold-out listings</Trans>
              )}
            </Button>
          ) : undefined
        }
      />
      <FlowRow layout="main-side">
        <Panel>
          <PanelHeader
            title={<Trans>Catalog</Trans>}
            meta={known ? <N>{count(items.length)}</N> : undefined}
          />
          {listings.isError ? (
            <LiveProblem error={listings.error} onRetry={() => void listings.refetch()} />
          ) : listings.data === undefined ? (
            <LiveSkeleton rows={6} label={t`Loading products`} />
          ) : listings.data.items.length === 0 ? (
            <p className="m-0 px-6 py-16 text-center text-body-sm text-secondary">
              <Trans>This shop has no active listings.</Trans>
            </p>
          ) : (
            <FlowBody className="gap-4">
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
                          setShown(PAGE);
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
              {items.length === 0 ? (
                <p className="m-0 py-10 text-center text-body-sm text-secondary">
                  <Trans>No listing matches this view.</Trans>
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-2xl:grid-cols-3 max-md:grid-cols-2">
                  {items.slice(0, shown).map((l) => (
                    <button
                      type="button"
                      key={l.listing_id}
                      aria-pressed={l.listing_id === selected?.listing_id}
                      onClick={() => {
                        choose(l.listing_id);
                      }}
                      className={cx(
                        "flex min-w-0 flex-col items-center justify-between rounded-card border p-4 text-center transition-[background-color,translate] outline-none hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus max-sm:p-3",
                        l.listing_id === selected?.listing_id
                          ? "border-inverse bg-selected"
                          : "border-line hover:bg-hover",
                      )}
                    >
                      <span className="mb-2.5 flex w-full justify-between gap-2 text-caption">
                        <N>{money(l.price)}</N>
                        <span
                          className={cx(
                            "font-light",
                            l.quantity === 0 ? "text-primary" : "text-muted",
                          )}
                        >
                          {l.quantity === 0 ? (
                            <span className="inline-flex h-5 items-center gap-1 rounded-pill bg-tertiary-subtle px-2 text-tertiary-text">
                              <Dot tone="attention" />
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
                        size={132}
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
              )}
              <div className="flex flex-col items-center gap-2">
                {items.length > shown ? (
                  <Button
                    onPress={() => {
                      setShown((n) => n + PAGE);
                    }}
                  >
                    {t`Show more (${count(items.length - shown)} left)`}
                  </Button>
                ) : null}
                {listings.data.truncated ? (
                  <p className="m-0 text-caption text-muted">
                    {t`Showing ${count(listings.data.items.length)} of ${count(listings.data.total_count)} listings.`}
                  </p>
                ) : null}
              </div>
            </FlowBody>
          )}
        </Panel>
        <Aside>
          <div ref={details} className="scroll-mt-20">
            <Panel>
              <PanelHeader title={<Trans>Product details</Trans>} />
              <FlowBody>
                {selected === undefined ? (
                  listings.data === undefined && !listings.isError ? (
                    <LiveSkeleton rows={4} label={t`Loading products`} />
                  ) : (
                    <p className="m-0 text-body-sm text-secondary">
                      <Trans>Choose a listing to see its details.</Trans>
                    </p>
                  )
                ) : (
                  <Details listing={selected} sold={sold.get(selected.listing_id)} />
                )}
              </FlowBody>
            </Panel>
          </div>
          <Panel label={t`Cost and supplier`}>
            <PanelHeader
              title={<Trans>Cost and supplier</Trans>}
              actions={<DemoTag className="me-4" />}
            />
            <DemoPart tag={false} className="px-6 pb-6">
              <div className="flex flex-col gap-4">
                <KV
                  items={[
                    [<Trans key="c">Production cost</Trans>, <N key="cv">$15.96</N>],
                    [<Trans key="s">Supplier</Trans>, <N key="sv">Printful</N>],
                  ]}
                />
                <ProductStudioDemo />
              </div>
            </DemoPart>
          </Panel>
        </Aside>
      </FlowRow>
    </>
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

/** The product studio (Phase 12) as the demo draws it, inside the Demo cost panel. */
function ProductStudioDemo() {
  const text = useBi();
  return (
    <div className="flex items-center gap-4 border-t border-line pt-4">
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
    </div>
  );
}
