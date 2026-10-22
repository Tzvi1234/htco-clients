import { Trans } from "@lingui/react/macro";

import type { useLiveShop } from "./live.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { SectionLabel } from "../../shared/ui/kit/index.ts";

/** The shop a commerce screen shows, chosen among the user's shops (only with more than one). */
export function ShopChips({ live }: { live: ReturnType<typeof useLiveShop> }) {
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
