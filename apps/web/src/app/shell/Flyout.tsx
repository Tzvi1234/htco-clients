import { useLingui } from "@lingui/react/macro";
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { areaOf, locate } from "./nav.ts";
import { useShell } from "./ShellState.tsx";
import { TabLink } from "./Sidebar.tsx";
import { useNavLabels } from "./useNavLabels.ts";
import { cx } from "../../shared/lib/cx.ts";

/**
 * Beside the collapsed sidebar: the chosen area's tabs (Design 1C `.fly`, 208 px), sliding in
 * from the inline start. The area's icon closes it again, as does Escape or "Close".
 */
export function Flyout() {
  const { t } = useLingui();
  const labels = useNavLabels();
  const { mini, flyout, setFlyout } = useShell();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const located = locate(pathname);
  const area = flyout === null ? undefined : areaOf(flyout);
  const open = mini && area !== undefined && area.tabs.length > 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFlyout(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setFlyout]);

  if (!open) return null;
  const name = labels.area(area);
  return (
    <aside
      id="sb-flyout"
      aria-label={name}
      className="glass my-2 ms-2 flex w-[208px] min-h-0 shrink-0 animate-fly-in flex-col overflow-hidden rounded-panel border border-sidebar-line bg-sidebar px-3 pt-4 pb-3 shadow-sidebar"
    >
      <div className="mb-2.5 flex items-center gap-2.5 border-b border-line px-1 pb-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-inverse text-on-inverse">
          <area.icon />
        </span>
        <div className="min-w-0">
          <p className="m-0 text-[11px] font-light text-muted">{t`Area`}</p>
          <p className="m-0 truncate text-[15px] font-medium">{name}</p>
        </div>
      </div>
      <ul className="m-0 flex min-h-0 grow list-none flex-col gap-1 overflow-auto p-0">
        {area.tabs.map((tab) => (
          <li key={tab.id}>
            <TabLink
              area={area.id}
              tab={tab}
              current={located?.area.id === area.id && located.tab?.id === tab.id}
              connector={false}
            />
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          setFlyout(null);
        }}
        className={cx(
          "mt-2 flex h-[34px] cursor-default items-center justify-center gap-1.5 rounded-[17px] border border-line-strong text-caption text-secondary outline-none",
          "transition-[background-color,color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:bg-hover hover:text-primary active:scale-[0.98]",
        )}
      >
        {t`Close`}
      </button>
    </aside>
  );
}
