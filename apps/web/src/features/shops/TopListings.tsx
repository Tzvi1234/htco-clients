import { Trans, useLingui } from "@lingui/react/macro";

import { useProductNames, PRODUCT_PRICES } from "../commerce/data.ts";
import {
  DemoPart,
  ProductThumb,
  Strip,
  StripCard,
  Zoom,
  type ProductKind,
} from "../../shared/ui/kit/index.ts";

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
  const { t } = useLingui();
  const names = useProductNames();
  return (
    <DemoPart className="min-h-0 lg:col-span-full max-sm:hidden" tag="corner">
      <Strip
        title={<Trans>Top listings</Trans>}
        zoom={<Zoom page={0} labels={{ less: t`Fewer`, more: t`More` }} />}
        className="h-full"
      >
        {LISTINGS.map((kind, i) => (
          <StripCard
            key={i}
            selected={i === 0}
            topStart={<span className="ltr">{`L-${String(220 + i)}`}</span>}
            topEnd={<span className="ltr">{`$${String(PRODUCT_PRICES[kind])}`}</span>}

            task={<span className="text-primary">{names[kind]}</span>}
          >
            {<ProductThumb kind={kind} size={56} />}
          </StripCard>
        ))}
      </Strip>
    </DemoPart>
  );
}
