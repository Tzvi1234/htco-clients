import { Trans } from "@lingui/react/macro";

import { EmptyState } from "../../shared/ui/EmptyState.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";

export function ShopsPage() {
  return (
    <>
      <PageHeader
        title={<Trans>Shops</Trans>}
        description={<Trans>The marketplace shops this organization runs.</Trans>}
      />
      <EmptyState
        title={<Trans>No shops yet</Trans>}
        description={
          <Trans>Connected shops appear here with their sync status and capabilities.</Trans>
        }
      />
    </>
  );
}
