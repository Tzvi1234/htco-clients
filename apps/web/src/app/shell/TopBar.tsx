import { useLingui } from "@lingui/react/macro";
import { Link, useRouterState } from "@tanstack/react-router";
import { Fragment, useEffect, useState, type Ref } from "react";

import { locate } from "./nav.ts";
import { useShell } from "./ShellState.tsx";
import { CIRCLE } from "./Sidebar.tsx";
import { useNavLabels } from "./useNavLabels.ts";
import { UserMenu } from "./UserMenu.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { TweaksButton } from "../../shared/theme/TweaksPanel.tsx";
import { BellIcon, CrumbIcon, SearchIcon } from "../../shared/ui/icons.tsx";
import { Segmented } from "../../shared/ui/Segmented.tsx";

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
        <Fragment key={crumb}>
          {index === 0 ? null : <CrumbIcon size={12} className="shrink-0 rtl:-scale-x-100" />}
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
 * the page's PageHeader), then the language, approvals, search and the design tweaks. Phones
 * keep the title, search, tweaks and the account, in an iOS-style header: it stays on top over the
 * ground, and once the page scrolls the large title shrinks to an inline one, the crumbs fold away
 * and a hairline appears under it.
 */
export function TopBar({ titleSlot, phone }: { titleSlot: Ref<HTMLDivElement>; phone: boolean }) {
  const { t } = useLingui();
  const { locale, setLocale } = useLocale();
  const { setPaletteOpen } = useShell();
  const scrolled = useScrolled(phone);
  return (
    <header
      data-scrolled={phone && scrolled ? "" : undefined}
      className={cx(
        "flex shrink-0 items-center justify-between gap-4",
        phone
          ? cx(
              "sticky top-0 z-20 min-h-[60px] border-b border-transparent ps-4 pe-3 pt-[max(8px,env(safe-area-inset-top))] pb-2",
              "bg-[color-mix(in_srgb,var(--bg-ground)_84%,transparent)] backdrop-blur-xl backdrop-saturate-150",
              "transition-[border-color,padding] duration-[var(--motion-duration-base)] ease-standard",
              "data-[scrolled]:border-line data-[scrolled]:pb-1.5",
              "[&_h1]:transition-[font-size] [&_h1]:duration-[var(--motion-duration-base)] data-[scrolled]:[&_h1]:text-title-sm data-[scrolled]:[&_h1]:font-normal",
            )
          : "h-[72px] ps-6 pe-4",
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
          <>
            <Segmented
              label={t`Language`}
              value={locale}
              onChange={setLocale}
              options={[
                { id: "he", label: "עברית", lang: "he" },
                { id: "en", label: "English", lang: "en" },
              ]}
            />
            <span className="w-1.5" />
            <Link
              to="/work/approvals"
              aria-label={t`Pending approvals`}
              title={t`Pending approvals`}
              className={ACTION}
            >
              <BellIcon />
            </Link>
          </>
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
        <TweaksButton />
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
