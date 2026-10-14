import { Trans } from "@lingui/react/macro";

import { Button } from "../../shared/ui/Button.tsx";
import { EmptyState } from "../../shared/ui/EmptyState.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";

export function OverviewPage() {
  return (
    <>
      <PageHeader title={<Trans>Overview</Trans>} />
      <EmptyState
        title={<Trans>Connect your first shop</Trans>}
        description={
          <Trans>
            Orders, tracking and listings appear here after you connect an Etsy shop. It takes about
            a minute.
          </Trans>
        }
      >
        <Button variant="primary" isDisabled>
          <Trans>Connect Etsy shop</Trans>
        </Button>
        <p className="m-0 text-caption text-muted">
          <Trans>Connecting a shop opens in a coming release.</Trans>
        </p>
      </EmptyState>
    </>
  );
}
