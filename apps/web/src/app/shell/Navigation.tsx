import { useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { House, Settings, Store, type LucideIcon } from "lucide-react";

interface Destination {
  to: "/" | "/shops" | "/settings";
  label: string;
  icon: LucideIcon;
}

function useDestinations(): Destination[] {
  const { t } = useLingui();
  // docs/ux/NAVIGATION_MAP.md: destinations join as their phases ship.
  return [
    { to: "/", label: t`Overview`, icon: House },
    { to: "/shops", label: t`Shops`, icon: Store },
    { to: "/settings", label: t`Settings`, icon: Settings },
  ];
}

/**
 * The main navigation: a sidebar at 1200 px and wider, a navigation rail from 640 px, and a
 * bottom bar on phones (design/README.md, "Layout and spacing").
 */
export function Navigation() {
  const { t } = useLingui();
  return (
    <nav
      aria-label={t`Main`}
      className={[
        "grid h-16 grid-flow-col auto-cols-fr",
        "sm:flex sm:h-auto sm:flex-col sm:gap-1 sm:px-2 sm:py-3",
        "lg:px-3",
      ].join(" ")}
    >
      {useDestinations().map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
          className={[
            "group relative flex flex-col items-center justify-center gap-0.5 text-[11px] leading-[14px] font-medium text-secondary no-underline",
            "aria-[current=page]:text-primary",
            "sm:py-2",
            "lg:h-9 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-control lg:px-2 lg:py-0 lg:text-body-sm",
            "lg:hover:bg-action-secondary-hover lg:hover:text-primary lg:aria-[current=page]:bg-selected",
          ].join(" ")}
        >
          <span className="grid h-8 w-12 place-items-center rounded-pill group-aria-[current=page]:bg-selected lg:size-auto lg:bg-transparent lg:group-aria-[current=page]:bg-transparent">
            <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
          </span>
          <span>{label}</span>
          <span
            aria-hidden="true"
            className="absolute -start-3 top-2 bottom-2 hidden w-[3px] rounded-pill bg-accent lg:group-aria-[current=page]:block"
          />
        </Link>
      ))}
    </nav>
  );
}
