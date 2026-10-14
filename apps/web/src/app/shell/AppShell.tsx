import { Trans } from "@lingui/react/macro";
import { Outlet } from "@tanstack/react-router";

import { Navigation } from "./Navigation.tsx";
import { ShopSwitcher } from "./ShopSwitcher.tsx";
import { UserMenu } from "./UserMenu.tsx";
import { useOnline } from "../../shared/lib/useOnline.ts";
import { Banner } from "../../shared/ui/Banner.tsx";
import { Logo } from "../../shared/ui/Logo.tsx";

/** The frame around every signed-in screen: navigation, top bar, connectivity, content. */
export function AppShell() {
  const online = useOnline();
  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      {/* One navigation for every width: a bottom bar on phones, a rail, then a sidebar. */}
      <aside className="fixed inset-x-0 bottom-0 z-10 shrink-0 border-t border-border-subtle bg-surface sm:static sm:flex sm:w-20 sm:flex-col sm:border-t-0 sm:border-e lg:w-62">
        <div className="hidden flex-col gap-3 p-3 lg:flex">
          <Logo />
          <ShopSwitcher />
        </div>
        <Navigation />
      </aside>
      <div className="flex min-w-0 grow flex-col pb-16 sm:pb-0">
        <header className="flex h-14 items-center gap-3 border-b border-border-subtle bg-surface px-4">
          <span className="grow" />
          <UserMenu />
        </header>
        <main className="flex grow flex-col gap-6 p-4 sm:p-6">
          {online ? null : (
            <Banner>
              <Trans>You are offline. What you see may be out of date; changes are paused.</Trans>
            </Banner>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
