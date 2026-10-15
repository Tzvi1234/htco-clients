import { useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { House, Settings, Store, type LucideIcon } from "lucide-react";
import { Fragment } from "react";

import { cx } from "../../shared/lib/cx.ts";
import type { Hue } from "../../shared/ui/Tag.tsx";

interface Destination {
  to: "/" | "/shops" | "/settings";
  label: string;
  icon: LucideIcon;
  hue: Hue;
  /** The sidebar section the item opens (shown on wide screens only). */
  section?: string;
}

function useDestinations(): Destination[] {
  const { t } = useLingui();
  // docs/ux/NAVIGATION_MAP.md: destinations join as their phases ship.
  return [
    { to: "/", label: t`Overview`, icon: House, hue: "iris" },
    { to: "/shops", label: t`Shops`, icon: Store, hue: "coral", section: t`Records` },
    { to: "/settings", label: t`Settings`, icon: Settings, hue: "slate", section: t`Workspace` },
  ];
}

const ICON_TILE: Record<Hue, string> = {
  iris: "group-aria-[current=page]:bg-tag-iris group-aria-[current=page]:text-tag-iris-text",
  coral: "group-aria-[current=page]:bg-tag-coral group-aria-[current=page]:text-tag-coral-text",
  slate: "group-aria-[current=page]:bg-tag-slate group-aria-[current=page]:text-tag-slate-text",
  saffron: "",
  mint: "",
  sky: "",
  rose: "",
};

/**
 * The main navigation (Attio's sidebar): 32 px items with a 16 px icon, grouped under small
 * section labels at 1200 px and wider; a 56 px rail from 640 px; a bottom bar on phones.
 */
export function Navigation() {
  const { t } = useLingui();
  return (
    <nav
      aria-label={t`Main`}
      className={cx(
        "grid h-16 grid-flow-col auto-cols-fr",
        "sm:flex sm:h-auto sm:flex-col sm:gap-0.5 sm:px-2",
      )}
    >
      {useDestinations().map(({ to, label, icon: Icon, hue, section }) => (
        <Fragment key={to}>
          {section === undefined ? null : (
            <span className="mt-4 mb-1 hidden px-2 text-caption font-medium text-muted lg:block">
              {section}
            </span>
          )}
          <Link
            to={to}
            activeOptions={{ exact: to === "/" }}
            className={cx(
              "group flex flex-col items-center justify-center gap-0.5 text-[11px] leading-[14px] font-medium text-secondary no-underline outline-none",
              "transition-colors duration-[var(--motion-duration-fast)]",
              "aria-[current=page]:text-primary",
              "sm:size-10 sm:self-center sm:rounded-control sm:hover:bg-hover sm:aria-[current=page]:bg-hover",
              "lg:h-8 lg:w-full lg:flex-row lg:justify-start lg:gap-2 lg:px-2 lg:text-body",
            )}
          >
            <span
              className={cx(
                "grid size-6 place-items-center rounded-control text-icon transition-colors group-aria-[current=page]:text-primary lg:size-5",
                ICON_TILE[hue],
              )}
            >
              <Icon aria-hidden="true" size={15} strokeWidth={1.85} />
            </span>
            <span className="sm:sr-only lg:not-sr-only">{label}</span>
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}
