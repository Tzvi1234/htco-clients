import { useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { PageHeader } from "./PageHeader.tsx";
import { Panel } from "./Panel.tsx";
import { DemoBadge } from "./SoonTag.tsx";

/**
 * A screen of the Design 1C demo that is not built yet: its title in the top bar and one panel
 * that says so plainly. Screens built from the demo replace it route by route
 * (docs/features/web-shell/design.md); `children` lets one show a first sketch inside the frame.
 */
export function DemoScreen({ title, children }: { title: string; children?: ReactNode }) {
  const { t } = useLingui();
  return (
    <>
      <PageHeader title={title} />
      <Panel label={title} className="grow animate-enter">
        {children ?? (
          <div className="flex grow flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <DemoBadge />
            <p className="m-0 font-display text-number-lg font-light">{title}</p>
            <p className="m-0 max-w-[420px] text-body-sm font-light text-muted">
              {t`This screen is part of the new design and is being built. Nothing on it is live yet.`}
            </p>
          </div>
        )}
      </Panel>
    </>
  );
}
