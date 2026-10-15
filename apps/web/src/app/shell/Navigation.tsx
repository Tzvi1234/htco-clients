import { useLingui } from "@lingui/react/macro";
import {
  GearSixIcon as GearSix,
  HouseIcon as House,
  StorefrontIcon as Storefront,
  type Icon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";

import { cx } from "../../shared/lib/cx.ts";

interface Destination {
  to: "/" | "/shops" | "/settings";
  label: string;
  icon: Icon;
  /** The record type's colour, shown on the icon of the current page. */
  current: string;
  /** The sidebar section the item opens (shown on wide screens only). */
  section?: string;
}

function useDestinations(): Destination[] {
  const { t } = useLingui();
  // docs/ux/NAVIGATION_MAP.md: destinations join as their phases ship.
  return [
    {
      to: "/",
      label: t`Overview`,
      icon: House,
      current: "group-aria-[current=page]:text-presence-iris",
    },
    {
      to: "/shops",
      label: t`Shops`,
      icon: Storefront,
      current: "group-aria-[current=page]:text-presence-coral",
      section: t`Records`,
    },
    {
      to: "/settings",
      label: t`Settings`,
      icon: GearSix,
      current: "group-aria-[current=page]:text-presence-slate",
      section: t`Workspace`,
    },
  ];
}

/**
 * The main navigation. Wide screens (1200 px+): a sidebar on the app ground, 34 px items with a
 * duotone icon that turns solid and takes its record colour on the current page, which floats
 * on a white pill. From 640 px: a rail. Phones: the items of the floating tab bar.
 */
export function Navigation() {
  const { t } = useLingui();
  return (
    <nav
      aria-label={t`Main`}
      className="grid grow grid-flow-col auto-cols-fr sm:flex sm:grow-0 sm:flex-col sm:gap-0.5 sm:px-2"
    >
      {useDestinations().map(({ to, label, icon: Glyph, current, section }) => (
        <Fragment key={to}>
          {section === undefined ? null : (
            <span className="mt-5 mb-1 hidden px-2.5 text-caption font-medium text-muted lg:block">
              {section}
            </span>
          )}
          <Link
            to={to}
            activeOptions={{ exact: to === "/", includeSearch: false }}
            className={cx(
              "group flex flex-col items-center justify-center gap-0.5 rounded-button text-[11px] leading-[14px] font-medium text-secondary no-underline outline-none",
              "transition-[background-color,color,box-shadow] duration-[var(--motion-duration-fast)]",
              "aria-[current=page]:text-primary",
              "max-sm:h-14",
              "sm:size-10 sm:self-center sm:hover:bg-hover sm:aria-[current=page]:bg-canvas sm:aria-[current=page]:shadow-1",
              "lg:h-[34px] lg:w-full lg:flex-row lg:justify-start lg:gap-2.5 lg:px-2.5 lg:text-body",
            )}
          >
            <span className={cx("grid place-items-center text-icon transition-colors", current)}>
              <Glyph
                aria-hidden="true"
                size={20}
                weight="duotone"
                className="group-aria-[current=page]:hidden"
              />
              <Glyph
                aria-hidden="true"
                size={20}
                weight="fill"
                className="hidden group-aria-[current=page]:block"
              />
            </span>
            <span className="sm:sr-only lg:not-sr-only">{label}</span>
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}
