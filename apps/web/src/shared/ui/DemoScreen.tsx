import { useLingui } from "@lingui/react/macro";

import { PageHeader } from "./PageHeader.tsx";
import { Panel } from "./Panel.tsx";
import { DemoBadge } from "./SoonTag.tsx";

/**
 * A tab of the Design 1C navigation whose screen is not drawn yet: its title in the top bar and
 * one panel that says plainly the screen is being built. Drawn screens use the kit's DemoFrame
 * (kit/demo.tsx) instead, through app/shell/DemoRoute.tsx.
 */
export function DemoScreen({ title }: { title: string }) {
  const { t } = useLingui();
  return (
    <>
      <PageHeader title={title} />
      <Panel label={title} className="grow animate-enter">
        <div className="flex grow flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <DemoBadge />
          <p className="m-0 font-display text-number-lg font-light">{title}</p>
          <p className="m-0 max-w-[420px] text-body-sm font-light text-muted">
            {t`This screen is part of the new design and is being built. Nothing on it is live yet.`}
          </p>
        </div>
      </Panel>
    </>
  );
}
