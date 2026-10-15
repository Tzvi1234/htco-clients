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
    },
    {
      to: "/shops",
      label: t`Shops`,
      icon: Storefront,
      section: t`Records`,
    },
    {
      to: "/settings",
      label: t`Settings`,
      icon: GearSix,
      section: t`Workspace`,
    },
  ];
}

/**
 * The main navigation on the ink app ground. Wide screens (1200 px+): a sidebar of 34 px items
 * with a duotone icon that turns solid on the current page, which sits on a lighter ink pill.
 * From 640 px: a rail. Phones: the items of the floating ink tab bar.
 */
export function Navigation() {
  const { t } = useLingui();
  return (
    <nav
      aria-label={t`Main`}
      className="grid grow grid-flow-col auto-cols-fr sm:flex sm:grow-0 sm:flex-col sm:gap-0.5 sm:px-2"
    >
      {useDestinations().map(({ to, label, icon: Glyph, section }) => (
        <Fragment key={to}>
          {section === undefined ? null : (
            <span className="mt-5 mb-1 hidden px-2.5 text-caption font-medium text-app-muted lg:block">
              {section}
            </span>
          )}
          <Link
            to={to}
            activeOptions={{ exact: to === "/", includeSearch: false }}
            className={cx(
              "group flex flex-col items-center justify-center gap-0.5 text-[11px] leading-[14px] font-medium no-underline outline-none",
              "transition-[background-color,color] duration-[var(--motion-duration-fast)]",
              // Phones: the white capsule tab bar, the current tab on a concentric iris capsule.
              "h-14 rounded-pill text-secondary aria-[current=page]:bg-selected aria-[current=page]:text-accent-text",
              // Rail and sidebar: on the ink app ground.
              "sm:size-10 sm:self-center sm:rounded-button sm:text-app-muted sm:hover:bg-app-hover sm:hover:text-app-text sm:aria-[current=page]:bg-app-selected sm:aria-[current=page]:text-app-text",
              "lg:h-[34px] lg:w-full lg:flex-row lg:justify-start lg:gap-2.5 lg:px-2.5 lg:text-body",
            )}
          >
            <span className="grid place-items-center transition-colors">
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
