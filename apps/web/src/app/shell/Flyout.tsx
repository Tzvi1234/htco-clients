import { useLingui } from "@lingui/react/macro";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";

import { areaOf, locate, type NavArea } from "./nav.ts";
import { useShell } from "./ShellState.tsx";
import { TabLink } from "./Sidebar.tsx";
import { useNavLabels } from "./useNavLabels.ts";
import { cx } from "../../shared/lib/cx.ts";

/**
 * Beside the collapsed sidebar: the chosen area's tabs (Design 1C `.fly`, 208 px) on frosted
 * glass. It opens and closes with the navigation's spring-like transition (styles.css,
 * `.nav-flyout`): its column widens as the panel slides out from behind the sidebar, and folds
 * away again, turning around mid-way when toggled. The area's icon closes it again, as does
 * Escape or "Close". While closed it stays in place, hidden and inert, so it can animate out.
 */
export function Flyout() {
  const { t } = useLingui();
  const labels = useNavLabels();
  const { mini, flyout, setFlyout } = useShell();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const located = locate(pathname);
  const chosen = flyout === null ? undefined : areaOf(flyout);
  const open = mini && chosen !== undefined && chosen.tabs.length > 0;
  // The last area shown stays drawn while the flyout folds away.
  const [shown, setShown] = useState<NavArea | undefined>(open ? chosen : undefined);
  if (open && chosen !== shown) setShown(chosen);

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

  if (!mini || shown === undefined) return null;
  const area = shown;
  const name = labels.area(area);
  return (
    <div data-open={open || undefined} className="nav-flyout min-h-0">
      <aside
        id="sb-flyout"
        aria-label={name}
        aria-hidden={!open}
        inert={!open}
        data-glass=""
        className="my-2 ms-2 flex w-[208px] min-h-0 flex-col overflow-hidden rounded-panel border border-sidebar-line bg-sidebar px-2 pt-4 pb-3 shadow-sidebar"
      >
        <div className="mx-1 mb-2.5 flex items-center gap-2.5 border-b border-line px-1 pb-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-inverse text-tertiary-on-inverse">
            <area.icon />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-caption font-light text-muted">{t`Area`}</p>
            <p className="m-0 truncate text-[15px] font-medium">{name}</p>
          </div>
        </div>
        {/* The 4 px padding leaves room for the focus ring inside the scroller. */}
        <ul className="m-0 flex min-h-0 grow list-none flex-col gap-1 overflow-auto p-1">
          {area.tabs.map((tab, index) => (
            <li key={tab.id} className="nav-flyout-item" style={{ "--i": index } as CSSProperties}>
              <TabLink
                area={area.id}
                tab={tab}
                current={located?.area.id === area.id && located.tab?.id === tab.id}
                connector={false}
                glide
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
            "mx-1 mt-2 flex h-[34px] cursor-default items-center justify-center gap-1.5 rounded-[17px] border border-line-strong text-caption text-secondary outline-none",
            "transition-[background-color,color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:bg-hover hover:text-primary active:scale-[0.97]",
          )}
        >
          {t`Close`}
        </button>
      </aside>
    </div>
  );
}
