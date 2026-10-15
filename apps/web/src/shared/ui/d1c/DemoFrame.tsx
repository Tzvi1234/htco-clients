import { useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { cx } from "../../lib/cx.ts";
import { PageHeader } from "../PageHeader.tsx";
import { useToast } from "../Toast.tsx";
import { Screen, type ScreenLayout } from "./Layout.tsx";

/**
 * A screen of the Design 1C demo that is designed but not built: the demo's full screen with its
 * sample data, the light lowered a little, and a large "Demo" label. Nothing in it works or
 * pretends to: the content is inert, and a press anywhere says it is coming soon.
 */
export function DemoFrame({
  title,
  layout,
  children,
}: {
  title: string;
  layout: ScreenLayout;
  children: ReactNode;
}) {
  const { t } = useLingui();
  const toast = useToast();
  return (
    <>
      <PageHeader title={title} />
      <div
        data-demo-frame=""
        className="relative flex min-h-0 grow flex-col"
        onClick={() => {
          toast(t`Demo — coming soon`);
        }}
      >
        <DemoLabel />
        <div
          inert
          data-testid="demo-content"
          className="flex min-h-0 grow flex-col opacity-70 saturate-[.8] select-none"
        >
          <Screen layout={layout}>{children}</Screen>
        </div>
      </div>
    </>
  );
}

/**
 * The large label on a demo screen, centred in the top bar over the screen (the same pill as the
 * other demo screens): "DEMO" and "Sample data · coming soon". Phones keep it at the top.
 */
export function DemoLabel() {
  const { t } = useLingui();
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-[60px] z-20 flex justify-center max-sm:sticky max-sm:top-2 max-sm:mb-2">
      <p className="m-0 flex h-12 items-center gap-3 rounded-pill bg-inverse ps-5 pe-6 text-on-inverse shadow-popover motion-safe:animate-pop-in max-sm:h-10 max-sm:ps-4 max-sm:pe-5">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-pill bg-accent-on-inverse motion-safe:animate-[htco-pulse_2.4s_ease-in-out_infinite]"
        />
        <span
          aria-hidden="true"
          className="font-display text-[26px] leading-none font-light tracking-[0.18em] uppercase max-sm:text-[20px]"
        >
          {t`Demo`}
        </span>
        <span
          aria-hidden="true"
          className="text-caption font-light text-on-inverse-muted max-sm:hidden"
        >
          {t`Sample data · coming soon`}
        </span>
        <span className="sr-only">{t`Demo — coming soon`}</span>
      </p>
    </div>
  );
}

/**
 * A part of a real screen that shows a planned feature not built yet: the same design, the light
 * lowered a little, a small "Demo" tag, and nothing inside it works.
 */
export function DemoPart({
  children,
  className,
  tag = true,
  tagClassName,
}: {
  children: ReactNode;
  className?: string;
  /** False when the panel's header already carries the Demo tag. */
  tag?: boolean;
  tagClassName?: string;
}) {
  const { t } = useLingui();
  const toast = useToast();
  return (
    <div
      data-demo-part=""
      className="relative"
      onClick={() => {
        toast(t`Demo — coming soon`);
      }}
    >
      {tag ? (
        <span
          className={cx(
            "absolute end-0 top-0 z-[2] inline-flex h-5 items-center gap-1 rounded-pill border border-line-strong bg-raised px-2 text-[11px] leading-none text-secondary",
            tagClassName,
          )}
        >
          <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent-mark" />
          {t`Demo`}
        </span>
      ) : null}
      <div inert className={cx("opacity-60 saturate-[.8] select-none", className)}>
        {children}
      </div>
    </div>
  );
}

/** The small "Demo" tag on its own, for a panel header whose whole panel is a demo. */
export function DemoTag({ className }: { className?: string }) {
  const { t } = useLingui();
  return (
    <span
      className={cx(
        "inline-flex h-5 items-center gap-1 rounded-pill border border-line-strong bg-raised px-2 text-[11px] leading-none font-normal text-secondary",
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent-mark" />
      {t`Demo`}
    </span>
  );
}
