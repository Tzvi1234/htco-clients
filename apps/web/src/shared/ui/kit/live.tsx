// The live shop's parts every screen shares: the freshness line, a listing's photo, the
// placeholders while data is on its way, and the shop chooser.
import { Trans, useLingui } from "@lingui/react/macro";
import { useState } from "react";

import { Dot, SectionLabel } from "./parts.tsx";
import { useLocale } from "../../i18n/LocaleProvider.tsx";
import { cx } from "../../lib/cx.ts";
import { ago, useNow } from "../../lib/time.ts";

/* ------------------------------------------------------------------ freshness */

/**
 * "Live from Etsy · updated 2 minutes ago", or, when Etsy did not answer and an older copy
 * stands in, "Etsy is not answering · showing data from 10:42".
 */
export function LiveNote({
  fetchedAt,
  stale,
  className,
}: {
  fetchedAt: string;
  stale: boolean;
  className?: string;
}) {
  const { t } = useLingui();
  const { locale } = useLocale();
  const now = useNow(30_000);
  const age = Math.max(now, Date.parse(fetchedAt)) - Date.parse(fetchedAt);
  const when = ago(fetchedAt, Math.max(now, Date.parse(fetchedAt)), locale);
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
    new Date(fetchedAt),
  );
  return (
    <p
      role={stale ? "status" : undefined}
      className={cx(
        "m-0 inline-flex min-w-0 items-center gap-2 text-caption font-light",
        stale ? "text-secondary" : "text-muted",
        className,
      )}
    >
      <Dot tone={stale ? "attention" : "success"} />
      <span className="truncate">
        {stale ? (
          <>{t`Etsy is not answering · showing data from ${time}`}</>
        ) : (
          <>
            {t`Live from Etsy`} ·{" "}
            <time dateTime={fetchedAt}>
              {age < 120_000 ? t`updated just now` : t`updated ${when}`}
            </time>
          </>
        )}
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------ waiting and choosing */

/** Rows of placeholders while live data is on its way. */
export function LiveSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <div className="flex grow flex-col gap-3 px-6 py-4" aria-busy="true">
      <span role="status" className="sr-only">
        {label}
      </span>
      {Array.from({ length: rows }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="h-9 rounded-pill bg-hover motion-safe:animate-pulse"
          style={{ width: `${String(100 - ((i * 13) % 35))}%` }}
        />
      ))}
    </div>
  );
}

/** The shops a screen can show and the one it shows (`useLiveShop`). */
export interface ShopChoice {
  shops: readonly { id: string; name: string }[] | undefined;
  shop: { id: string } | undefined;
  choose: (shopId: string) => void;
}

/** The shop a commerce screen shows, chosen among the user's shops (only with more than one). */
export function ShopChips({ live }: { live: ShopChoice }) {
  const shops = live.shops ?? [];
  if (shops.length < 2) return null;
  return (
    <div>
      <SectionLabel>
        <Trans>Shop</Trans>
      </SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {shops.map((shop) => {
          const on = shop.id === live.shop?.id;
          return (
            <button
              key={shop.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                live.choose(shop.id);
              }}
              className={cx(
                "inline-flex h-9 max-w-full items-center rounded-pill border px-3 text-caption outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                on
                  ? "border-inverse bg-inverse text-on-inverse"
                  : "border-line-strong hover:border-line-hover",
              )}
            >
              <bdi className="truncate">{shop.name}</bdi>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ pictures */

/**
 * A listing's photo, hot-linked from Etsy's image host (never proxied or stored): lazy, in a
 * fixed square that pulses until it arrives; when it cannot load (blocked, gone), a calm tile
 * with the title's first letter takes its place.
 */
export function ListingPhoto({
  src,
  alt,
  title,
  size,
  className,
}: {
  src: string | null | undefined;
  alt?: string | null | undefined;
  title: string;
  size: number;
  className?: string;
}) {
  // Kept per source: a photo that failed must not hide the next listing's (Codex, #35).
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const failed = src !== null && src !== undefined && failedSrc === src;
  const loaded = src !== null && src !== undefined && loadedSrc === src;
  // A fixed square box: nothing moves when the photo arrives; it pulses until then.
  const style = { width: size, height: size };
  if (src === null || src === undefined || failed)
    return (
      <span
        aria-hidden="true"
        style={style}
        className={cx(
          "inline-flex shrink-0 items-center justify-center rounded-card bg-raised font-display text-secondary",
          className,
        )}
      >
        {Array.from(title.trim()).at(0)?.toUpperCase() ?? "·"}
      </span>
    );
  return (
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      style={style}
      className={cx(
        "shrink-0 rounded-card bg-hover object-cover",
        !loaded && "motion-safe:animate-pulse",
        className,
      )}
      onLoad={() => {
        setLoadedSrc(src);
      }}
      onError={() => {
        setFailedSrc(src);
      }}
    />
  );
}
