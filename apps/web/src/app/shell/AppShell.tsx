import { Trans } from "@lingui/react/macro";
import { Link, Outlet } from "@tanstack/react-router";

import { CommandMenu } from "./CommandMenu.tsx";
import { Navigation } from "./Navigation.tsx";
import { ShopSwitcher } from "./ShopSwitcher.tsx";
import { UserMenu } from "./UserMenu.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { useOnline } from "../../shared/lib/useOnline.ts";
import { useIntro } from "../../shared/motion/intro.tsx";
import { Banner } from "../../shared/ui/Banner.tsx";
import { Logo } from "../../shared/ui/Logo.tsx";

/**
 * The frame around every signed-in screen. Wide screens: the sidebar sits on the pale app ground
 * and the work floats beside it on a white panel (Attio's layout, the reference's calm). Phones:
 * the page fills the screen and navigation is a floating tab bar at the bottom.
 */
export function AppShell() {
  const online = useOnline();
  const intro = useIntro();
  return (
    <div className="flex min-h-dvh flex-col bg-app sm:flex-row">
      <aside
        className={cx(
          "fixed inset-x-4 bottom-4 z-20 flex gap-1 rounded-pill border border-border-subtle bg-surface p-1.5 shadow-3",
          "sm:sticky sm:gap-0 sm:inset-x-auto sm:top-0 sm:bottom-auto sm:h-dvh sm:w-16 sm:shrink-0 sm:flex-col sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:py-3 sm:shadow-none",
          "lg:w-62",
          intro && "animate-sidebar-in",
        )}
      >
        <div className="hidden flex-col gap-3 px-3 pb-4 sm:flex max-lg:items-center max-lg:px-0">
          <Link
            to="/"
            aria-label="HTCO"
            className="flex h-9 items-center rounded-control px-1.5 outline-none lg:self-start"
          >
            <Logo variant="full" height={22} animated={intro} onInk className="max-lg:hidden" />
            <Logo variant="mark" height={18} animated={intro} onInk className="lg:hidden" />
          </Link>
          <CommandMenu />
        </div>
        <Navigation />
        <div className="hidden grow sm:block" />
        <div className="hidden px-3 pb-2 lg:block">
          <ShopSwitcher />
        </div>
        <div className="grid place-items-center sm:place-items-stretch sm:px-2 lg:px-3">
          <UserMenu />
        </div>
      </aside>
      <div
        className={cx(
          "flex min-w-0 grow flex-col overflow-clip bg-sunken pb-28 sm:bg-canvas sm:pb-0",
          "sm:my-2 sm:me-2 sm:rounded-dialog sm:border sm:border-border-subtle sm:shadow-2",
        )}
      >
        {online ? null : (
          <Banner>
            <Trans>You are offline. What you see may be out of date; changes are paused.</Trans>
          </Banner>
        )}
        <main className="flex grow flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
