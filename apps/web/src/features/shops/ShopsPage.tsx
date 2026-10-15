import { Trans, useLingui } from "@lingui/react/macro";
import {
  ArrowsClockwiseIcon as ArrowsClockwise,
  CalendarBlankIcon as CalendarBlank,
  PackageIcon as Package,
  StorefrontIcon as Storefront,
  type Icon,
} from "@phosphor-icons/react";

import { Button } from "../../shared/ui/Button.tsx";
import { EmptyState } from "../../shared/ui/EmptyState.tsx";
import { PageBody, PageHeader } from "../../shared/ui/PageHeader.tsx";
import { ObjectIcon } from "../../shared/ui/Tag.tsx";

/** The organization's shops as a record table (Attio), empty until a shop is connected. */
export function ShopsPage() {
  const { t } = useLingui();
  const columns: { label: string; icon: Icon }[] = [
    { label: t`Shop`, icon: Storefront },
    { label: t`Sync`, icon: ArrowsClockwise },
    { label: t`Orders today`, icon: Package },
    { label: t`Last sync`, icon: CalendarBlank },
  ];
  return (
    <>
      <PageHeader
        title={<Trans>Shops</Trans>}
        description={<Trans>The marketplace shops this organization runs.</Trans>}
        icon={<ObjectIcon hue="coral" icon={Storefront} />}
      />
      <PageBody flush>
        <div className="overflow-x-auto">
          <div
            aria-hidden="true"
            className="grid min-w-[640px] grid-cols-[minmax(200px,2fr)_1fr_1fr_1fr] border-b border-border-subtle bg-sunken"
          >
            {columns.map(({ label, icon: ColumnIcon }) => (
              <span
                key={label}
                className="flex h-8 items-center gap-1.5 border-e border-border-subtle px-3 text-body-sm text-muted last:border-e-0"
              >
                <ColumnIcon size={14} weight="duotone" />
                {label}
              </span>
            ))}
          </div>
        </div>
        <EmptyState
          bare
          icon={Storefront}
          hue="coral"
          title={<Trans>No shops yet</Trans>}
          description={
            <Trans>Connected shops appear here with their sync status and capabilities.</Trans>
          }
        >
          <Button variant="primary" isDisabled>
            <Trans>Connect Etsy shop</Trans>
          </Button>
          <p className="m-0 text-caption text-muted">
            <Trans>Connecting a shop opens in a coming release.</Trans>
          </p>
        </EmptyState>
      </PageBody>
    </>
  );
}
