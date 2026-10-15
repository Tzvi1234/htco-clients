import { useLingui } from "@lingui/react/macro";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";

import { AREAS, areaOf, locate, type AreaId } from "./nav.ts";
import { TabLink } from "./Sidebar.tsx";
import { useNavLabels } from "./useNavLabels.ts";
import { cx } from "../../shared/lib/cx.ts";
import { CloseIcon, MoreIcon } from "../../shared/ui/icons.tsx";

const ON_BAR: AreaId[] = ["home", "office", "work", "commerce"];

const ITEM = cx(
  "flex h-full min-w-0 flex-1 cursor-default flex-col items-center justify-center gap-0.5 rounded-[22px] text-[11px] leading-[14px] no-underline outline-none",
  "transition-[background-color,color,scale] duration-[var(--motion-duration-fast)] ease-standard active:scale-95",
);

/**
 * Phones: an iOS-style floating tab bar in the Design 1C language (the sidebar's panel, the
 * current area on the inverse pill). Four areas sit on the bar; "More" opens every area and
 * its tabs in a sheet.
 */
export function TabBar() {
  const { t } = useLingui();
  const labels = useNavLabels();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const located = locate(pathname);
  const [more, setMore] = useState(false);
  const current = located?.area.id;
  const elsewhere = current !== undefined && !ON_BAR.includes(current);

  return (
    <>
      <nav
        aria-label={t`Main`}
        className="glass fixed inset-x-3 bottom-3 z-20 flex h-16 gap-1 rounded-[28px] border border-sidebar-line bg-sidebar p-1.5 shadow-sidebar pb-[max(6px,env(safe-area-inset-bottom))]"
      >
        {ON_BAR.map((id) => {
          const area = areaOf(id);
          const active = current === id;
          return (
            <Link
              key={id}
              to={area.to}
              aria-current={active ? "page" : undefined}
              activeOptions={{ exact: true, includeSearch: false }}
              className={cx(
                ITEM,
                active ? "bg-inverse text-on-inverse" : "text-secondary hover:bg-hover",
              )}
            >
              <area.icon size={20} />
              <span className="max-w-full truncate px-1">{labels.area(area)}</span>
            </Link>
          );
        })}
        <Button
          aria-label={t`More areas`}
          onPress={() => {
            setMore(true);
          }}
          className={cx(
            ITEM,
            elsewhere ? "bg-inverse text-on-inverse" : "text-secondary data-[hovered]:bg-hover",
          )}
        >
          <MoreIcon size={20} />
          <span>{t`More`}</span>
        </Button>
      </nav>
      <ModalOverlay
        isOpen={more}
        onOpenChange={setMore}
        isDismissable
        className="fixed inset-0 z-50 flex items-end bg-[color-mix(in_srgb,var(--bg-ground)_60%,transparent)] data-[entering]:animate-enter"
      >
        <Modal className="glass max-h-[85dvh] w-full overflow-auto rounded-t-panel border border-edge bg-menu px-4 pt-4 pb-8 shadow-popover outline-none data-[entering]:animate-[htco-sheet-in_var(--motion-duration-slow)_var(--motion-easing-standard)_both]">
          <Dialog aria-label={t`All areas`} className="flex flex-col gap-4 outline-none">
            <div className="flex items-center justify-between">
              <Heading slot="title" className="m-0 text-body font-normal">
                {t`All areas`}
              </Heading>
              <Button
                aria-label={t`Close`}
                onPress={() => {
                  setMore(false);
                }}
                className="grid size-10 cursor-default place-items-center rounded-pill border border-line-strong outline-none data-[pressed]:scale-95"
              >
                <CloseIcon size={14} />
              </Button>
            </div>
            {AREAS.map((area) => (
              <section key={area.id} aria-label={labels.area(area)} className="flex flex-col gap-1">
                <Link
                  to={area.to}
                  onClick={() => {
                    setMore(false);
                  }}
                  className="flex items-center gap-3 rounded-3xl p-1 text-body text-primary no-underline outline-none hover:bg-hover"
                >
                  <span
                    className={cx(
                      "grid size-10 place-items-center rounded-pill border",
                      current === area.id
                        ? "border-inverse bg-inverse text-on-inverse"
                        : "border-line-strong",
                    )}
                  >
                    <area.icon />
                  </span>
                  {labels.area(area)}
                </Link>
                {area.tabs.length === 0 ? null : (
                  <ul className="m-0 ms-6 flex list-none flex-col gap-0.5 border-s border-line-strong py-1 ps-3">
                    {area.tabs.map((tab) => (
                      <li key={tab.id}>
                        <TabLink
                          area={area.id}
                          tab={tab}
                          current={current === area.id && located?.tab?.id === tab.id}
                          connector={false}
                          onNavigate={() => {
                            setMore(false);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
