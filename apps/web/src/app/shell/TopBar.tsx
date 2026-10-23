import { useLingui } from "@lingui/react/macro";
import { Link, useRouterState } from "@tanstack/react-router";
import { Fragment, useEffect, useState, type Ref } from "react";

import { locate } from "./nav.ts";
import { useShell } from "./ShellState.tsx";
import { CIRCLE } from "./Sidebar.tsx";
import { useNavLabels } from "./useNavLabels.ts";
import { UserMenu } from "./UserMenu.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { BellIcon, CrumbIcon, SearchIcon } from "../../shared/ui/icons.tsx";

const ACTION = cx(
  CIRCLE,
  "cursor-default border-line-strong text-primary outline-none hover:border-line-hover active:scale-95",
);

/** Where the page is: its area and tab, the last one in ink (Design 1C `.crumb`). */
function Crumbs() {
  const labels = useNavLabels();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const located = locate(pathname);
  const trail =
    located === undefined
      ? ["HT Commerce"]
      : located.tab === undefined
        ? ["HT Commerce", labels.area(located.area)]
        : [labels.area(located.area), labels.tab(located.area.id, located.tab.id)];
  return (
    <p className="m-0 flex min-w-0 items-center gap-2 text-caption whitespace-nowrap text-muted">
      {trail.map((crumb, index) => (
        // By position: an area and its tab may share a name (Customers › Customers).
        <Fragment key={index}>
          {index === 0 ? null : <CrumbIcon size={12} className="shrink-0" />}
          {index === trail.length - 1 ? (
            <span className="truncate text-primary">{crumb}</span>
          ) : (
            <span className="truncate">{crumb}</span>
          )}
        </Fragment>
      ))}
    </p>
  );
}

/**
 * The top bar on the ground (Design 1C `.tbar`): the crumbs and the page's title (placed here by
 * the page's PageHeader), then approvals and search. The language, theme and palette live in
 * Settings (round 3). It is frosted glass over the ground: where the screen scrolls under it
 * (phones, and screens that scroll as one page) it stays on top and, once the page has scrolled,
 * a hairline appears under it. Phones keep the title, search and the account in an iOS-style
 * header whose large title shrinks to an inline one on scroll while the crumbs fold away.
 */
export function TopBar({
  titleSlot,
  phone,
  pageScroll = false,
}: {
  titleSlot: Ref<HTMLDivElement>;
  phone: boolean;
  /** The screen scrolls as one page under the bar (wide screens; phones always do). */
  pageScroll?: boolean;
}) {
  const { t } = useLingui();
  const { setPaletteOpen } = useShell();
  const sticky = phone || pageScroll;
  const scrolled = useScrolled(sticky);
  return (
    <header
      data-scrolled={sticky && scrolled ? "" : undefined}
      data-glass=""
      className={cx(
        "flex shrink-0 items-center justify-between gap-4",
        // The glass is the ground's own colour, so at rest the bar sits on the ground unseen.
        "bg-[color-mix(in_srgb,var(--bg-ground)_78%,transparent)]",
        // Under the device's "reduce transparency" the bar is solid (data-solid on <html>).
        "[:root[data-solid]_&]:bg-ground",
        "border-b border-transparent transition-[border-color,padding] duration-[var(--motion-duration-base)] ease-standard data-[scrolled]:border-line",
        phone
          ? cx(
              "sticky top-0 z-sticky min-h-[60px] ps-4 pe-3 pt-[max(8px,env(safe-area-inset-top))] pb-2",
              "data-[scrolled]:pb-1.5",
              "[&_h1]:transition-[font-size] [&_h1]:duration-[var(--motion-duration-base)] data-[scrolled]:[&_h1]:text-title-sm data-[scrolled]:[&_h1]:font-normal",
            )
          : cx("h-[72px] ps-6 pe-4", pageScroll ? "sticky top-0 z-sticky" : "relative"),
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        {phone ? (
          <div
            className={cx(
              "grid transition-[grid-template-rows,opacity] duration-[var(--motion-duration-base)] ease-standard",
              scrolled ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <Crumbs />
            </div>
          </div>
        ) : (
          <Crumbs />
        )}
        <div ref={titleSlot} className="min-w-0" />
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {phone ? null : (
          <Link
            to="/work/approvals"
            aria-label={t`Pending approvals`}
            title={t`Pending approvals`}
            className={ACTION}
          >
            <BellIcon />
          </Link>
        )}
        <button
          type="button"
          aria-label={t`Search`}
          title={`${t`Search`} (Ctrl K)`}
          onClick={() => {
            setPaletteOpen(true);
          }}
          className={ACTION}
        >
          <SearchIcon />
        </button>
        {phone ? <UserMenu compact /> : null}
      </div>
    </header>
  );
}

/** Phones: whether the page has scrolled past the large title. */
function useScrolled(active: boolean): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!active) return;
    const check = () => {
      setScrolled(window.scrollY > 24);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
    };
  }, [active]);
  return active && scrolled;
}
