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
 * The frame around every signed-in screen (Attio's layout): a calm sidebar with the logo, quick
 * actions, navigation, the shop and the account; the page owns its header and content.
 */
export function AppShell() {
  const online = useOnline();
  const intro = useIntro();
  return (
    <div className="flex min-h-dvh flex-col bg-canvas sm:flex-row">
      <aside
        className={cx(
          "fixed inset-x-0 bottom-0 z-20 flex shrink-0 border-t border-border-subtle bg-sidebar",
          "sm:sticky sm:top-0 sm:h-dvh sm:w-14 sm:flex-col sm:border-t-0 sm:border-e sm:py-3",
          "lg:w-62",
          intro && "animate-sidebar-in",
        )}
      >
        <div className="hidden flex-col gap-3 px-3 pb-3 sm:flex max-lg:items-center max-lg:px-0">
          <Link
            to="/"
            aria-label="HTCO"
            className="flex h-8 items-center rounded-control px-1.5 outline-none lg:self-start"
          >
            <Logo variant="full" height={18} animated={intro} className="max-lg:hidden" />
            <Logo variant="mark" height={16} animated={intro} className="lg:hidden" />
          </Link>
          <CommandMenu />
        </div>
        <div className="grow sm:grow-0">
          <Navigation />
        </div>
        <div className="hidden grow sm:block" />
        <div className="hidden px-3 pb-2 lg:block">
          <ShopSwitcher />
        </div>
        <div className="grid place-items-center px-2 sm:place-items-stretch lg:px-3">
          <UserMenu />
        </div>
      </aside>
      <div className="flex min-w-0 grow flex-col pb-16 sm:pb-0">
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
