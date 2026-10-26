import { Trans } from "@lingui/react/macro";
import { Outlet, useMatches } from "@tanstack/react-router";
import { useState } from "react";

import { CommandMenu } from "./CommandMenu.tsx";
import { Flyout } from "./Flyout.tsx";
import { ShellProvider } from "./ShellState.tsx";
import { Sidebar } from "./Sidebar.tsx";
import { TabBar } from "./TabBar.tsx";
import { TopBar } from "./TopBar.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { PHONE_QUERY, useMediaQuery } from "../../shared/lib/useMediaQuery.ts";
import { useOnline } from "../../shared/lib/useOnline.ts";
import { Banner } from "../../shared/ui/Banner.tsx";
import { TopBarSlotContext } from "../../shared/ui/PageHeader.tsx";
import { Panel } from "../../shared/ui/Panel.tsx";
import { ToastProvider } from "../../shared/ui/Toast.tsx";

/**
 * The frame around every signed-in screen (Design 1C, client ADR-0008). From 640 px: the
 * floating sidebar (and its flyout when collapsed) beside a column of the top bar and the
 * screen. A screen is one panel by default; one whose route says `layout: "panels"` lays out
 * its own panels (DemoScreen and the Design 1C screens). By default a wide screen fills the
 * window's height; one whose route says `scroll: "page"` scrolls as one page instead, under a
 * sticky glass top bar beside a sticky sidebar, so none of its panels scrolls on its own
 * (round 3). Phones: the top bar, the screen, and a floating tab bar.
 */
export function AppShell() {
  return (
    <ShellProvider>
      <ToastProvider>
        <Frame />
      </ToastProvider>
    </ShellProvider>
  );
}

function Frame() {
  const online = useOnline();
  const phone = useMediaQuery(PHONE_QUERY);
  const [titleSlot, setTitleSlot] = useState<HTMLDivElement | null>(null);
  const panels = useMatches({
    select: (matches) => matches.some((match) => match.staticData.layout === "panels"),
  });
  const pageScroll = useMatches({
    select: (matches) => matches.some((match) => match.staticData.scroll === "page"),
  });
  // Phones always scroll the page; wide screens when the route asks.
  const flowing = phone || pageScroll;

  const screen = (
    <TopBarSlotContext value={titleSlot}>
      {panels ? (
        <Outlet />
      ) : (
        <Panel className="grow">
          {/* The panel clips to its radius; the screen scrolls inside it on wide screens. */}
          <div
            data-screen-scroll=""
            className={cx("flex min-h-0 grow flex-col", !phone && "overflow-auto")}
          >
            <Outlet />
          </div>
        </Panel>
      )}
    </TopBarSlotContext>
  );

  return (
    <div className={cx("flex", phone ? "min-h-dvh flex-col" : flowing ? "min-h-dvh" : "h-dvh")}>
      {/* Keyboard users skip the navigation; the link shows only while it has focus. */}
      <a
        href="#main"
        onClick={(event) => {
          // Focus moves without touching the address (the router owns it).
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
        className="fixed inset-s-3 top-3 z-overlay -translate-y-24 rounded-pill bg-inverse px-5 py-2.5 text-body-sm text-on-inverse no-underline shadow-popover transition-[translate] duration-[var(--motion-duration-fast)] focus-visible:translate-y-0"
      >
        <Trans>Skip to content</Trans>
      </a>
      {phone ? null : (
        <div className={cx("flex min-h-0", flowing && "sticky top-0 h-dvh self-start")}>
          <Sidebar />
          <Flyout />
        </div>
      )}
      <div className={cx("flex min-w-0 grow flex-col", !flowing && "h-dvh")}>
        <TopBar titleSlot={setTitleSlot} phone={phone} pageScroll={pageScroll} />
        {online ? null : (
          <div className="px-2 pb-2">
            <Banner>
              <Trans>You are offline. What you see may be out of date; changes are paused.</Trans>
            </Banner>
          </div>
        )}
        <main
          id="main"
          tabIndex={-1}
          // Its own snapshot in screen-to-screen transitions (styles.css).
          data-vt="screen"
          className={cx(
            "flex min-h-0 grow flex-col gap-2 px-2 outline-none",
            phone ? "pb-24" : "pb-2",
          )}
        >
          {screen}
        </main>
      </div>
      {phone ? <TabBar /> : null}
      <CommandMenu />
    </div>
  );
}
