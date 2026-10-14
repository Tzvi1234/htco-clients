import { Trans } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { StateCard } from "./EmptyState.tsx";
import { Ltr } from "./Ltr.tsx";

interface ErrorStateProps {
  title: ReactNode;
  description: ReactNode;
  /** The API's request ID, for support. */
  requestId?: string | undefined;
  headingLevel?: 1 | 2 | 3;
  children?: ReactNode;
}

/** Something failed: the cause, the next step, and the request ID to quote. Never an apology. */
export function ErrorState({
  title,
  description,
  requestId,
  headingLevel = 2,
  children,
}: ErrorStateProps) {
  return (
    <div role="alert">
      <StateCard title={title} description={description} headingLevel={headingLevel}>
        {requestId === undefined ? null : (
          <p className="m-0 text-caption text-muted">
            <Trans>
              Request ID <Ltr>{requestId}</Ltr>
            </Trans>
          </p>
        )}
        {children}
      </StateCard>
    </div>
  );
}
