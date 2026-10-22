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
  "flex h-full min-w-0 flex-1 cursor-default flex-col items-center justify-center gap-0.5 rounded-[22px] text-caption leading-[14px] no-underline outline-none",
  "transition-[background-color,color,scale] duration-[var(--motion-duration-fast)] ease-standard active:scale-95",
);

/** A flick faster than this (px per ms) closes the sheet whatever the distance (Emil, Sonner). */
const FLICK_VELOCITY = 0.5;
/** A slow drag closes the sheet once it has travelled this far. */
const DRAG_DISTANCE = 96;

interface Drag {
  from: number;
  at: number;
  by: number;
}

/**
 * Phones: an iOS-style floating tab bar on frosted glass in the Design 1C language (the
 * sidebar's panel, the current area on the inverse pill, which glides to the next one with the
 * navigation's spring-like curve). Four areas sit on the bar; "More" opens every area and its
 * tabs in a sheet that rises from the bottom and leaves the same way: by its close button, a
 * tap outside, Escape, or a drag down on its grabber (a quick flick is enough).
 */
export function TabBar() {
  const { t } = useLingui();
  const labels = useNavLabels();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const located = locate(pathname);
  const [more, setMore] = useState(false);
  const current = located?.area.id;
  const elsewhere = current !== undefined && !ON_BAR.includes(current);
  // The ink pill slides to the current item (the "More" slot for areas off the bar).
  const slot = current === undefined ? -1 : elsewhere ? ON_BAR.length : ON_BAR.indexOf(current);
  const [drag, setDrag] = useState<Drag | null>(null);

  return (
    <>
      {/* Content fades out under the floating bar instead of meeting it with a hard edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[var(--bg-ground)] to-transparent"
      />
      <nav
        aria-label={t`Main`}
        data-glass=""
        className="fixed inset-x-3 bottom-3 z-20 isolate flex h-16 gap-1 rounded-[28px] border border-sidebar-line bg-sidebar p-1.5 shadow-sidebar pb-[max(6px,env(safe-area-inset-bottom))]"
      >
        {slot < 0 ? null : (
          <span
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 rounded-[22px] bg-inverse transition-[inset-inline-start] duration-[var(--motion-duration-expand)] ease-spring"
            style={{
              width: "calc((100% - 28px) / 5)",
              insetInlineStart: `calc(6px + ${String(slot)} * ((100% - 28px) / 5 + 4px))`,
            }}
          >
            <span className="absolute top-2 inset-e-3 size-1.5 rounded-pill bg-accent-on-inverse" />
          </span>
        )}
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
                "relative",
                active ? "text-on-inverse" : "text-secondary hover:bg-hover",
              )}
            >
              <area.icon size={20} />
              <span className="max-w-full truncate tracking-[-0.01em]">{labels.area(area)}</span>
            </Link>
          );
        })}
        <Button
          aria-label={t`More areas`}
          aria-expanded={more}
          onPress={() => {
            setMore(true);
          }}
          className={cx(
            ITEM,
            "relative",
            elsewhere ? "text-on-inverse" : "text-secondary data-[hovered]:bg-hover",
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
        className="nav-sheet-overlay fixed inset-0 z-50 flex items-end bg-[color-mix(in_srgb,var(--bg-ground)_60%,transparent)]"
      >
        <Modal
          data-glass=""
          className={cx(
            "nav-sheet max-h-[85dvh] w-full overflow-auto overscroll-contain rounded-t-panel border border-edge bg-menu px-4 pb-8 shadow-popover outline-none",
            drag === null &&
              "transition-transform duration-[var(--motion-duration-base)] ease-spring",
          )}
          style={drag === null ? {} : { transform: `translateY(${String(drag.by)}px)` }}
        >
          {/* iOS sheet grabber: drag it down to close the sheet; dragging up meets friction. */}
          <div
            aria-hidden="true"
            className="sticky top-0 z-10 -mx-4 flex touch-none justify-center bg-menu pt-2 pb-3"
            onPointerDown={(event) => {
              // One finger at a time: a second touch does not restart the drag.
              if (drag !== null) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              setDrag({ from: event.clientY, at: event.timeStamp, by: 0 });
            }}
            onPointerMove={(event) => {
              if (drag === null) return;
              const delta = event.clientY - drag.from;
              // Down follows the finger; up is damped, so the sheet never hits a wall.
              const by = delta >= 0 ? delta : -Math.sqrt(-delta) * 2;
              setDrag({ ...drag, by });
            }}
            onPointerUp={(event) => {
              if (drag !== null) {
                const elapsed = Math.max(1, event.timeStamp - drag.at);
                const velocity = drag.by / elapsed;
                if (drag.by > DRAG_DISTANCE || (drag.by > 8 && velocity > FLICK_VELOCITY)) {
                  setMore(false);
                }
              }
              setDrag(null);
            }}
            onPointerCancel={() => {
              setDrag(null);
            }}
          >
            <span className="h-[5px] w-9 rounded-pill bg-line-strong" />
          </div>
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
                className="grid size-10 cursor-default place-items-center rounded-pill border border-line-strong outline-none transition-[scale] duration-[var(--motion-duration-fast)] ease-standard data-[pressed]:scale-95"
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
                  className="flex items-center gap-3 rounded-[24px] p-1 text-body text-primary no-underline outline-none transition-[background-color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:bg-hover active:scale-[0.98]"
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
