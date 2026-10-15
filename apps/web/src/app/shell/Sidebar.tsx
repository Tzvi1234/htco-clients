import { useLingui } from "@lingui/react/macro";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { AREAS, locate, type AreaId, type NavArea, type NavTab } from "./nav.ts";
import { useShell } from "./ShellState.tsx";
import { ShopSwitcher } from "./ShopSwitcher.tsx";
import { useNavLabels } from "./useNavLabels.ts";
import { UserMenu } from "./UserMenu.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { useIntro } from "../../shared/motion/intro.tsx";
import { ChevronIcon, SearchIcon, SidebarIcon } from "../../shared/ui/icons.tsx";
import { Logo } from "../../shared/ui/Logo.tsx";
import { SoonTag } from "../../shared/ui/SoonTag.tsx";

/** A 40 px circle outline (Design 1C `.cb`) around an icon. */
export const CIRCLE =
  "relative inline-flex size-10 shrink-0 items-center justify-center rounded-pill border border-line-strong " +
  "transition-[border-color,background-color,color,box-shadow,scale] duration-[var(--motion-duration-fast)] ease-standard";

/** Labels fade back in when the sidebar opens (they are removed while it is collapsed). */
const LABEL =
  "group-data-[mini]/sb:hidden animate-[htco-label-in_var(--motion-duration-base)_var(--motion-easing-standard)_both]";

/** A sub-item (Design 1C `.si`): the current one is an inverse pill with the accent dot. */
export function TabLink({
  area,
  tab,
  current,
  connector = true,
  onNavigate,
}: {
  area: AreaId;
  tab: NavTab;
  current: boolean;
  /** The line joining it to its category's rail (not in the flyout). */
  connector?: boolean;
  onNavigate?: () => void;
}) {
  const labels = useNavLabels();
  return (
    <Link
      to={tab.to}
      activeOptions={{ exact: true, includeSearch: false }}
      aria-current={current ? "page" : undefined}
      {...(onNavigate === undefined ? {} : { onClick: onNavigate })}
      className={cx(
        "relative flex w-full items-center gap-2 rounded-pill px-3 text-start whitespace-nowrap no-underline outline-none",
        "transition-[background-color,color,scale] duration-[var(--motion-duration-fast)] ease-standard active:scale-[0.98]",
        connector
          ? "h-[34px] text-body-sm before:absolute before:-start-5 before:top-1/2 before:h-px before:w-3.5 before:bg-line-strong"
          : "h-[38px] px-3.5 text-[13.5px]",
        current ? "bg-inverse text-on-inverse" : "text-secondary hover:bg-hover hover:text-primary",
      )}
    >
      <span className="truncate">{labels.tab(area, tab.id)}</span>
      {tab.built ? null : (
        <>
          {" "}
          <SoonTag className="ms-auto" />
        </>
      )}
      {current ? (
        <span
          aria-hidden="true"
          className={cx(
            "size-1.5 shrink-0 rounded-pill bg-accent-on-inverse",
            tab.built && "ms-auto",
          )}
        />
      ) : null}
    </Link>
  );
}

function Category({
  area,
  active,
  open,
  currentTab,
  onToggle,
}: {
  area: NavArea;
  active: boolean;
  open: boolean;
  currentTab: string | undefined;
  onToggle: () => void;
}) {
  const labels = useNavLabels();
  const { t } = useLingui();
  const { mini, flyout, setFlyout } = useShell();
  const navigate = useNavigate();
  const name = labels.area(area);
  const circle = cx(
    CIRCLE,
    active ? "border-inverse bg-inverse text-on-inverse" : "group-hover/cat:border-line-hover",
    active && mini && "shadow-[0_0_0_3px_var(--bg-sidebar),0_0_0_4px_var(--border-strong)]",
  );
  const head = cx(
    "group/cat relative flex h-12 w-full cursor-default items-center gap-3 rounded-3xl ps-1 pe-2.5 text-start whitespace-nowrap no-underline text-primary outline-none",
    "transition-[background-color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:bg-hover active:scale-[0.99]",
    "group-data-[mini]/sb:justify-center group-data-[mini]/sb:p-0",
  );
  const body = (
    <>
      <span className={circle}>
        <area.icon />
        {active && mini ? (
          <span
            aria-hidden="true"
            className="absolute -end-0.5 top-0 size-2 rounded-pill border-2 border-sidebar bg-accent-mark box-content"
          />
        ) : null}
      </span>
      <span className={cx(LABEL, "grow text-body", active && "font-medium")}>{name}</span>
      {area.tabs.length > 0 ? (
        <ChevronIcon
          size={12}
          className={cx(
            LABEL,
            "text-secondary transition-transform duration-[var(--motion-duration-slow)] ease-standard",
            open && "rotate-180",
          )}
        />
      ) : null}
    </>
  );

  if (area.tabs.length === 0) {
    return (
      <Link
        to={area.to}
        activeOptions={{ exact: true, includeSearch: false }}
        title={mini ? name : undefined}
        aria-label={mini ? name : undefined}
        className={head}
      >
        {body}
      </Link>
    );
  }

  const listId = `sb-${area.id}`;
  return (
    <div>
      <button
        type="button"
        title={mini ? name : undefined}
        aria-label={mini ? name : undefined}
        aria-expanded={mini ? flyout === area.id : open}
        aria-controls={mini ? "sb-flyout" : listId}
        {...(active ? { "aria-current": "true" as const } : {})}
        className={head}
        onClick={() => {
          if (!mini) {
            onToggle();
            return;
          }
          if (active) {
            setFlyout(flyout === area.id ? null : area.id);
            return;
          }
          setFlyout(area.id);
          void navigate({ to: area.to });
        }}
      >
        {body}
      </button>
      <div
        id={listId}
        aria-hidden={!open || mini}
        inert={!open || mini}
        className={cx(
          "grid transition-[grid-template-rows] duration-[var(--motion-duration-expand)] ease-standard group-data-[mini]/sb:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <ul
            aria-label={t`${name} tabs`}
            className="relative m-0 ms-6 list-none py-1 pb-2 ps-5 before:absolute before:start-0 before:top-0 before:bottom-3 before:w-px before:bg-line-strong"
          >
            {area.tabs.map((tab) => (
              <li key={tab.id}>
                <TabLink area={area.id} tab={tab} current={active && currentTab === tab.id} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * The Design 1C sidebar: a floating panel (264 px, a 72 px rail when collapsed) with the logo
 * and the collapse button, the shop card, quick actions, the seven areas grouped under Home,
 * Workspace and System, and the owner's card. The current area opens its tabs; others open on
 * demand. Collapsed, an area's tabs open in the flyout beside it.
 */
export function Sidebar() {
  const { t } = useLingui();
  const labels = useNavLabels();
  const intro = useIntro();
  const { mini, toggleMini, setPaletteOpen } = useShell();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const located = locate(pathname);
  const [opened, setOpened] = useState<ReadonlySet<AreaId>>(() => new Set());

  const category = (area: NavArea) => {
    const active = located?.area.id === area.id;
    return (
      <Category
        key={area.id}
        area={area}
        active={active}
        open={active || opened.has(area.id)}
        currentTab={located?.tab?.id}
        onToggle={() => {
          setOpened((current) => {
            const next = new Set(current);
            if (next.has(area.id)) next.delete(area.id);
            else next.add(area.id);
            return next;
          });
        }}
      />
    );
  };
  const groups = (["main", "workspace", "system"] as const).map((group) => ({
    group,
    areas: AREAS.filter((area) => area.group === group),
  }));

  return (
    <aside
      data-mini={mini || undefined}
      aria-label={t`Sidebar`}
      className={cx(
        "group/sb glass relative my-2 ms-2 flex min-h-0 shrink-0 flex-col overflow-hidden rounded-panel border border-sidebar-line bg-sidebar shadow-sidebar",
        "transition-[width] duration-[var(--motion-duration-slow)] ease-standard",
        mini ? "w-[72px]" : "w-[264px]",
        intro && "animate-sidebar-in",
      )}
    >
      <div className="flex h-[72px] shrink-0 items-center justify-between ps-[22px] pe-[15px] group-data-[mini]/sb:justify-center group-data-[mini]/sb:p-0">
        <Link to="/" aria-label="HTCO" className={cx(LABEL, "rounded-control outline-none")}>
          <Logo height={22} animated={intro} />
        </Link>
        <button
          type="button"
          aria-label={mini ? t`Expand the menu` : t`Collapse the menu`}
          title={mini ? t`Expand the menu` : t`Collapse the menu`}
          aria-expanded={!mini}
          onClick={toggleMini}
          className={cx(
            CIRCLE,
            "cursor-default text-primary hover:border-line-hover active:scale-95",
          )}
        >
          <SidebarIcon />
        </button>
      </div>
      <ShopSwitcher />
      <button
        type="button"
        onClick={() => {
          setPaletteOpen(true);
        }}
        aria-label={t`Quick actions`}
        title={mini ? t`Quick actions` : undefined}
        className={cx(
          "mx-3 mb-3 flex h-10 shrink-0 cursor-default items-center gap-2.5 rounded-pill border border-line-strong px-3.5 text-body-sm whitespace-nowrap text-muted outline-none",
          "transition-[border-color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:border-line-hover active:scale-[0.98]",
          "group-data-[mini]/sb:mx-4 group-data-[mini]/sb:w-10 group-data-[mini]/sb:justify-center group-data-[mini]/sb:px-0",
        )}
      >
        <SearchIcon size={14} />
        <span className={LABEL}>{t`Quick actions`}</span>
        <kbd
          className={cx(
            LABEL,
            "ms-auto inline-flex h-[18px] items-center rounded-[6px] border border-line-strong px-[5px] font-latin text-[11px] text-muted",
          )}
        >
          Ctrl K
        </kbd>
      </button>
      <nav
        aria-label={t`Main`}
        className="min-h-0 grow overflow-auto px-3 pb-3 [scrollbar-width:thin] group-data-[mini]/sb:px-4"
      >
        {groups.map(({ group, areas }) => (
          <div key={group}>
            {group === "main" ? null : (
              <>
                <p className="m-0 px-2.5 pt-3.5 pb-1.5 text-[11px] font-light whitespace-nowrap text-muted group-data-[mini]/sb:hidden">
                  {labels.group(group)}
                </p>
                <div
                  aria-hidden="true"
                  className="mx-1 my-3 hidden h-px bg-line group-data-[mini]/sb:block"
                />
              </>
            )}
            {areas.map(category)}
          </div>
        ))}
      </nav>
      <div className="relative shrink-0 border-t border-line p-3">
        <UserMenu />
      </div>
    </aside>
  );
}
