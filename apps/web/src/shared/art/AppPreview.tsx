import {
  BellIcon as Bell,
  BuildingsIcon as Buildings,
  CaretDownIcon as CaretDown,
  CaretRightIcon as CaretRight,
  ChatCenteredTextIcon as ChatCenteredText,
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  CubeIcon as Cube,
  CurrencyCircleDollarIcon as CurrencyCircleDollar,
  GearSixIcon as GearSix,
  HouseIcon as House,
  MagnifyingGlassIcon as MagnifyingGlass,
  ArrowRightIcon as ArrowRight,
  ArrowUpIcon as ArrowUp,
  ShieldCheckIcon as ShieldCheck,
  StorefrontIcon as Storefront,
  TagIcon,
  TrayIcon as Tray,
  UsersThreeIcon as UsersThree,
  type Icon,
} from "@phosphor-icons/react";

import { cx } from "../lib/cx.ts";
import { Logo } from "../ui/Logo.tsx";

const NAV: { icon: Icon; label: string; current?: boolean }[] = [
  { icon: House, label: "Overview", current: true },
  { icon: Tray, label: "Orders" },
  { icon: TagIcon, label: "Listings" },
  { icon: ChatCenteredText, label: "Messages" },
  { icon: Storefront, label: "Shops" },
  { icon: GearSix, label: "Settings" },
];

// A sample shop, so the picture shows what the dashboard looks like at work. It is a marketing
// illustration on the front door only, never shown inside the app.
const METRICS: {
  icon: Icon;
  label: string;
  value: string;
  delta?: string;
  tint: string;
  line: string;
  points: string;
}[] = [
  {
    icon: Cube,
    label: "Orders today",
    value: "24",
    delta: "12%",
    tint: "bg-shape-sky text-presence-sky",
    line: "var(--illustration-sky)",
    points: "0,20 12,18 24,19 36,14 48,15 60,8 72,4",
  },
  {
    icon: CurrencyCircleDollar,
    label: "Revenue, 30 days",
    value: "$2,840",
    delta: "18%",
    tint: "bg-sunken text-primary",
    line: "var(--illustration-iris)",
    points: "0,19 12,20 24,16 36,17 48,11 60,7 72,6",
  },
  {
    icon: TagIcon,
    label: "Active listings",
    value: "312",
    delta: "6%",
    tint: "bg-shape-mint text-presence-mint",
    line: "var(--illustration-mint)",
    points: "0,20 12,19 24,20 36,16 48,12 60,9 72,5",
  },
  {
    icon: Clock,
    label: "Decisions waiting",
    value: "3",
    tint: "bg-shape-saffron text-presence-saffron",
    line: "var(--illustration-saffron)",
    points: "0,16 12,10 24,14 36,8 48,12 60,6 72,10",
  },
];

/**
 * A miniature of the dashboard for the front door: the window, the ink sidebar, the search bar,
 * the key numbers with their trends, getting started and the AI office card. Its text stays in
 * English like a product screenshot. Decorative (aria-hidden).
 */
export function AppPreview({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      dir="ltr"
      className={cx(
        "overflow-hidden rounded-t-[18px] border border-[#2a2a33] bg-[#1b1b22] text-start shadow-3",
        className,
      )}
    >
      <div className="flex gap-2 px-4 py-3">
        <span className="size-3 rounded-pill bg-[#ff5f57]" />
        <span className="size-3 rounded-pill bg-[#febc2e]" />
        <span className="size-3 rounded-pill bg-[#28c840]" />
      </div>
      <div className="grid grid-cols-[180px_1fr] max-md:grid-cols-1">
        <div className="flex flex-col gap-1 bg-app px-3 pt-4 pb-6 max-md:hidden">
          <span className="mb-5 px-2">
            <Logo height={20} onInk />
          </span>
          {NAV.map(({ icon: Glyph, label, current }) => (
            <span
              key={label}
              className={cx(
                "flex h-9 items-center gap-3 rounded-button px-3 text-[13px] font-medium",
                current === true ? "bg-app-selected text-app-text" : "text-app-muted",
              )}
            >
              <Glyph size={18} weight={current === true ? "fill" : "regular"} />
              {label}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-4 rounded-ss-[14px] bg-canvas p-5 max-md:rounded-none">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-[300px] max-w-[50%] items-center gap-2 rounded-button border border-border-subtle bg-sunken px-3 text-[11px] text-muted">
              <MagnifyingGlass size={13} />
              Search orders, listings, messages…
            </span>
            <span className="grow" />
            <Bell size={18} className="text-icon" />
            <span className="h-6 w-px bg-border-subtle" />
            <span className="flex items-center gap-2 text-[12px] font-medium">
              <span className="grid size-7 place-items-center rounded-pill bg-presence-iris text-[12px] font-semibold text-presence-fg">
                S
              </span>
              Shop owner
              <CaretDown size={12} />
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-latin text-[26px] leading-tight font-extrabold tracking-[-0.02em]">
              Your shop runs. You decide.
            </span>
            <span className="text-[12px] text-secondary">
              HTCO checks orders, tracking and listings, and asks you before anything risky.
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
            {METRICS.map(({ icon: Glyph, label, value, delta, tint, line, points }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface p-3"
              >
                <span className={cx("grid size-9 shrink-0 place-items-center rounded-pill", tint)}>
                  <Glyph size={17} weight="duotone" />
                </span>
                <div className="flex min-w-0 grow flex-col">
                  <span className="truncate text-[11px] text-secondary">{label}</span>
                  <span className="flex items-baseline gap-1.5">
                    <span className="tabular text-[17px] font-bold">{value}</span>
                    {delta === undefined ? null : (
                      <span className="flex items-center text-[10px] font-semibold text-success-text">
                        <ArrowUp size={9} weight="bold" />
                        {delta}
                      </span>
                    )}
                  </span>
                </div>
                <svg viewBox="0 0 72 24" className="h-6 w-16 shrink-0 max-lg:hidden">
                  <polyline
                    points={points}
                    fill="none"
                    stroke={line}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[1.6fr_1fr] gap-3 max-sm:grid-cols-1">
            <div className="overflow-hidden rounded-card border border-border-subtle bg-surface">
              <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
                <span className="text-[12px] font-semibold">Getting started</span>
                <span className="flex items-center gap-2 text-[11px] font-medium text-success-text">
                  <span className="h-1 w-5 rounded-pill bg-success" />1 of 3 done
                </span>
              </div>
              {(
                [
                  [
                    ShieldCheck,
                    "Secure your account",
                    "Password and an authenticator app.",
                    "done",
                  ],
                  [
                    Storefront,
                    "Connect your first shop",
                    "Orders, tracking and listings start flowing in.",
                    "waiting",
                  ],
                  [
                    UsersThree,
                    "Meet your office",
                    "The AI employees start once a shop is connected.",
                    "next",
                  ],
                ] as const
              ).map(([Glyph, title, detail, state]) => (
                <div
                  key={title}
                  className="flex items-center gap-3 border-b border-border-subtle px-4 py-2.5 last:border-b-0"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-button border border-border-subtle">
                    <Glyph size={16} weight="duotone" />
                  </span>
                  <span className="flex min-w-0 grow flex-col">
                    <span className="text-[12px] font-semibold">{title}</span>
                    <span className="truncate text-[11px] text-secondary">{detail}</span>
                  </span>
                  {state === "done" ? (
                    <CheckCircle size={20} weight="fill" className="text-success" />
                  ) : null}
                  {state === "waiting" ? (
                    <span className="rounded-pill bg-ring px-2.5 py-1 text-[10px] font-semibold text-[var(--illustration-ink)]">
                      Waiting for you
                    </span>
                  ) : null}
                  {state === "done" ? null : (
                    <span className="grid size-6 place-items-center rounded-pill border border-border-subtle">
                      <CaretRight size={11} />
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="relative flex flex-col gap-2 overflow-hidden rounded-card bg-shape-iris p-4">
              <span className="absolute -end-10 -bottom-12 size-36 rounded-pill border-[26px] border-[var(--illustration-iris)]" />
              <span className="absolute end-3 bottom-4 size-14 rounded-pill bg-ring" />
              <Buildings size={22} weight="duotone" className="text-presence-iris" />
              <span className="text-[15px] font-bold">Your AI office</span>
              <span className="relative max-w-[30ch] text-[11px] text-secondary">
                Specialists for listings, orders, customers and money work under your policies, and
                bring you every risky decision.
              </span>
              <span className="relative mt-2 inline-flex h-8 items-center gap-1.5 self-start rounded-button bg-app px-3 text-[11px] font-semibold text-app-text">
                Start with your shop <ArrowRight size={11} weight="bold" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
