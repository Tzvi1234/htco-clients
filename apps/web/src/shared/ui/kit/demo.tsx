import { useLingui } from "@lingui/react/macro";
import { use, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Screen, type ScreenLayout } from "./layout.tsx";
import { cx } from "../../lib/cx.ts";
import { PageHeader, TopBarSlotContext } from "../PageHeader.tsx";
import { useToast } from "../Toast.tsx";

// The one demo treatment of the Design 1C screens (brief, rules 2 and 3):
// - DemoFrame: a whole screen that is designed but not built. Its content is dimmed a little
//   and out of reach, and the large black DEMO pill sits centred in the shell's top bar.
// - DemoPart: a part of a real screen for a planned feature: dimmed, inert, a small Demo tag.
// - DemoTag: that tag on its own, for a panel header whose whole panel is a demo.
// A press on demo content says "Demo — coming soon"; nothing pretends to work.

/** The controls a frame lets through in `views` mode: they only change what is shown. */
const INTERACTIVE = "a, button, input, select, textarea, [role='button'], [role='link'], tr";

/**
 * The large label: "DEMO" and "Sample data · coming soon" on an ink pill. Inside the shell it is
 * portalled into the top bar and centred there; elsewhere (stories) it sits over the content.
 */
function DemoPill() {
  const { t } = useLingui();
  const slot = use(TopBarSlotContext);
  const header = slot?.closest("header") ?? null;
  const pill = (
    <div
      role="note"
      className={cx(
        "pointer-events-none z-20 flex justify-center",
        header === null
          ? "mb-2"
          : "absolute inset-x-0 top-1/2 -translate-y-1/2 max-sm:top-full max-sm:translate-y-1",
      )}
    >
      <p className="m-0 flex h-12 items-center gap-3 rounded-pill bg-inverse ps-5 pe-6 text-on-inverse shadow-popover motion-safe:animate-pop-in max-lg:h-10 max-lg:gap-2 max-lg:ps-4 max-lg:pe-5 max-sm:h-8">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-pill bg-accent-on-inverse motion-safe:animate-[htco-pulse_2.4s_ease-in-out_infinite] max-sm:size-2"
        />
        <span
          aria-hidden="true"
          className="font-display text-[26px] leading-none font-light tracking-[0.18em] max-lg:text-[20px] max-sm:text-[15px]"
        >
          {t`Demo`.toLocaleUpperCase()}
        </span>
        <span
          aria-hidden="true"
          className="text-caption font-light whitespace-nowrap text-on-inverse-muted max-[1279.98px]:hidden"
        >
          {t`Sample data · coming soon`}
        </span>
        <span className="sr-only">{t`Demo — coming soon`}</span>
      </p>
    </div>
  );
  return header === null ? pill : createPortal(pill, header);
}

/**
 * A screen of the Design 1C demo that is designed but not built: the demo's full screen with
 * its sample data, the light lowered a little, under the large DEMO pill in the top bar.
 *
 * - By default the content is out of reach: `inert` and hidden from assistive technology.
 * - `views`: the owner may look around (choose a conversation, Map or List, pause, the camera).
 *   Controls marked `data-demo-view` work and only change the view; any other action shows
 *   "Demo — coming soon" and does nothing (no request, no navigation).
 *
 * `title` puts the page title in the top bar (a frame titled by what it shows sets its own
 * PageHeader instead); `layout` lays the panels out on one of the demo's grids.
 */
export function DemoFrame({
  title,
  layout,
  views = false,
  className,
  children,
}: {
  title?: string;
  layout?: ScreenLayout;
  views?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { t } = useLingui();
  const toast = useToast();
  const soon = t`Demo — coming soon`;
  const body = layout === undefined ? children : <Screen layout={layout}>{children}</Screen>;
  return (
    <>
      {title === undefined ? null : <PageHeader title={title} />}
      <DemoPill />
      <div
        role="region"
        aria-label={soon}
        data-demo-frame=""
        className={cx("relative flex min-h-0 grow flex-col max-sm:pt-10", className)}
        onClickCapture={
          views
            ? (event) => {
                const control = (event.target as Element).closest(INTERACTIVE);
                if (control === null || control.closest("[data-demo-view]")) return;
                event.preventDefault();
                event.stopPropagation();
                toast(soon);
              }
            : undefined
        }
        onClick={
          views
            ? undefined
            : () => {
                toast(soon);
              }
        }
        onSubmitCapture={(event) => {
          event.preventDefault();
        }}
      >
        <div
          data-testid="demo-content"
          inert={views ? undefined : true}
          aria-hidden={views ? undefined : true}
          className={cx(
            "flex min-h-0 grow flex-col opacity-[0.78] brightness-[0.97] saturate-[0.85] transition-opacity duration-[var(--motion-duration-base)]",
            views ? "hover:opacity-[0.86]" : "select-none",
          )}
        >
          {body}
        </div>
      </div>
    </>
  );
}

/** The small "Demo" tag on its own, for a panel header whose whole panel is a demo. */
export function DemoTag({ className }: { className?: string }) {
  const { t } = useLingui();
  return (
    <span
      className={cx(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-pill border border-line-strong bg-raised px-2 text-[11px] leading-none font-normal text-secondary",
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent-mark" />
      {t`Demo`}
    </span>
  );
}

/**
 * A part of a real screen that needs a feature we plan but have not built: the demo's design,
 * the light lowered a little, a small "Demo" tag. The sample content is inert and hidden from
 * assistive technology, which hears "Demo — coming soon" instead; a press says the same.
 */
export function DemoPart({
  children,
  className,
  contentClassName,
  tag = "corner",
  tagClassName,
  as: Element = "div",
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /**
   * Where the tag sits: inside the top corner, on the part's top edge (over a divider), centred
   * over it, or `false` when the panel's header already carries a DemoTag.
   */
  tag?: "corner" | "edge" | "center" | false;
  /** Places the tag elsewhere, beside a row's own status, say (replaces the `tag` position). */
  tagClassName?: string;
  as?: "div" | "section";
}) {
  const { t } = useLingui();
  const toast = useToast();
  return (
    <Element
      data-demo-part=""
      className={cx("relative", className)}
      onClick={() => {
        toast(t`Demo — coming soon`);
      }}
    >
      {tag === false ? null : (
        // Read once, as "Demo — coming soon" below.
        <span
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute z-[4] flex",
            tagClassName ??
              cx(
                tag === "corner" && "end-2.5 top-2.5",
                tag === "edge" && "end-2.5 -top-2.5",
                tag === "center" &&
                  "start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2",
              ),
          )}
        >
          <DemoTag />
        </span>
      )}
      <span className="sr-only">{t`Demo — coming soon`}</span>
      <div
        inert
        aria-hidden="true"
        className={cx(
          "h-full opacity-[0.62] saturate-[0.85] transition-opacity duration-[var(--motion-duration-base)] select-none",
          contentClassName,
        )}
      >
        {children}
      </div>
    </Element>
  );
}
