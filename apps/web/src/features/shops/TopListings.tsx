import { Trans } from "@lingui/react/macro";

import { useProductNames, PRODUCT_PRICES } from "../commerce/data.ts";
import { DemoPart } from "../../shared/ui/kit/Demo.tsx";
import { Strip, StripCard } from "../../shared/ui/kit/Strip.tsx";
import { ProductThumb, type ProductKind } from "../../shared/ui/kit/Thumb.tsx";

const LISTINGS: readonly ProductKind[] = [
  "star",
  "pet",
  "towel",
  "mug",
  "star",
  "pet",
  "mug",
  "towel",
];

/**
 * The demo's "Top listings" strip under the shop panels. Listings sync is planned (phase 11),
 * not built, so the strip keeps its design dimmed with a "Demo" mark.
 */
export function TopListings() {
  const names = useProductNames();
  return (
    <DemoPart className="min-h-0 lg:col-span-full max-sm:hidden" labelPosition="center">
      <Strip title={<Trans>Top listings</Trans>} className="h-full">
        {LISTINGS.map((kind, i) => (
          <StripCard
            key={i}
            selected={i === 0}
            topStart={<span className="ltr">{`L-${String(220 + i)}`}</span>}
            topEnd={<span className="ltr">{`$${String(PRODUCT_PRICES[kind])}`}</span>}
            middle={<ProductThumb kind={kind} size={56} />}
            task={<span className="text-primary">{names[kind]}</span>}
          />
        ))}
      </Strip>
    </DemoPart>
  );
}
