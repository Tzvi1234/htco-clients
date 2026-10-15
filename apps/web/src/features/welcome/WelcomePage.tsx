import { Trans, useLingui } from "@lingui/react/macro";
import {
  AndroidLogoIcon as AndroidLogo,
  ArrowRightIcon as ArrowRight,
  BuildingsIcon as Buildings,
  CubeIcon as Cube,
  GlobeIcon as Globe,
  TagIcon,
  UsersThreeIcon as UsersThree,
  WindowsLogoIcon as WindowsLogo,
  type Icon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AppPreview } from "../../shared/art/AppPreview.tsx";
import { HowArt } from "../../shared/art/HowArt.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { Logo } from "../../shared/ui/Logo.tsx";

// The front door's headlines: tight, heavy grotesque (the owner's reference).
const HEAD = "m-0 font-extrabold leading-[1.02] tracking-[-0.035em]";
const BUTTON =
  "inline-flex h-14 items-center justify-center gap-2.5 rounded-button px-7 text-title-sm font-bold no-underline transition-[background-color,scale] active:scale-[0.98]";

/**
 * The public front door (web first, platform ADR-0016), built to the owner's reference: the iris
 * hero with the dashboard rising out of it, the four jobs as solid tiles, how it works on ink,
 * and the web app to open now with the Windows and Android apps that follow.
 */
export function WelcomePage() {
  const { t } = useLingui();
  const jobs: { tile: string; arc: string; icon: Icon; title: string; body: string }[] = [
    {
      tile: "bg-shape-sky",
      arc: "border-[var(--illustration-sky)]",
      icon: Cube,
      title: t`Every order, verified`,
      body: t`Orders, tracking and delivery checked against the marketplace, with the receipt to prove it.`,
    },
    {
      tile: "bg-shape-peach",
      arc: "border-[var(--illustration-coral)]",
      icon: TagIcon,
      title: t`Listings that stay healthy`,
      body: t`Titles, photos and claims audited and fixed as drafts you approve.`,
    },
    {
      tile: "bg-shape-mint",
      arc: "border-[var(--illustration-mint)]",
      icon: UsersThree,
      title: t`Customers answered`,
      body: t`Messages sorted, drafted and escalated with the order history beside them.`,
    },
    {
      tile: "bg-shape-saffron",
      arc: "border-[var(--illustration-saffron)]",
      icon: Buildings,
      title: t`An AI office you control`,
      body: t`Named specialists work under your policies and bring you every risky decision.`,
    },
  ];

  return (
    <div className="min-h-dvh overflow-x-clip bg-canvas text-primary">
      <header className="mx-auto flex h-[84px] max-w-[1300px] items-center gap-10 px-5 sm:px-10">
        <Logo height={34} animated />
        <nav aria-label={t`Sections`} className="hidden gap-11 text-title-sm md:flex">
          <a href="#jobs" className="text-primary no-underline hover:text-link">
            <Trans>Product</Trans>
          </a>
          <a href="#how" className="text-primary no-underline hover:text-link">
            <Trans>How it works</Trans>
          </a>
          <a href="#download" className="text-primary no-underline hover:text-link">
            <Trans>Download</Trans>
          </a>
        </nav>
        <span className="grow" />
        <Link
          to="/sign-in"
          className="text-title-sm text-primary no-underline hover:underline max-sm:hidden"
        >
          <Trans>Sign in</Trans>
        </Link>
        <Link
          to="/sign-in"
          className="inline-flex h-12 items-center gap-2 rounded-button bg-inverse px-6 text-body font-semibold text-on-inverse no-underline hover:bg-inverse-hover"
        >
          <Trans>Open the web app</Trans>
          <ArrowRight aria-hidden="true" size={16} weight="bold" className="rtl:-scale-x-100" />
        </Link>
      </header>

      <main>
        {/* The hero: iris, with the logo's rings and dot around the headline. */}
        <section className="relative px-4 sm:px-12">
          <div className="relative isolate overflow-hidden rounded-[32px] bg-presence-iris px-6 pt-14 pb-[300px] text-presence-fg sm:pt-16 lg:pb-[360px]">
            <span
              aria-hidden="true"
              className="absolute -start-[170px] top-[110px] -z-10 size-[460px] rounded-pill border-[52px] border-shape-iris max-md:hidden"
            />
            <span
              aria-hidden="true"
              className="absolute start-[16%] top-[112px] -z-10 size-[84px] rounded-pill bg-ring max-md:hidden"
            />
            <span
              aria-hidden="true"
              className="absolute -end-[80px] -top-[150px] -z-10 size-[360px] rounded-pill border-[56px] border-shape-sky max-md:hidden"
            />
            <span
              aria-hidden="true"
              className="absolute end-[6%] top-[150px] -z-10 size-[230px] rounded-pill border-[3px] border-dashed border-shape-sky max-lg:hidden"
            />
            <div className="mx-auto flex max-w-[900px] animate-enter flex-col items-center gap-6 text-center">
              <h1 className={cx(HEAD, "text-[44px] leading-[1] sm:text-[88px] sm:leading-[0.96]")}>
                <Trans>Your shop runs. You decide.</Trans>
              </h1>
              <p className="m-0 max-w-[40ch] text-title-sm leading-[1.5] opacity-95 sm:text-[22px]">
                <Trans>
                  HT-Commerce runs your Etsy business with an AI office that checks every order,
                  keeps listings healthy, and asks you before anything risky.
                </Trans>
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-5">
                <Link
                  to="/sign-in"
                  className={cx(
                    BUTTON,
                    "bg-ring text-[var(--illustration-ink)] hover:brightness-95",
                  )}
                >
                  <Trans>Open the web app</Trans>
                  <ArrowRight
                    aria-hidden="true"
                    size={20}
                    weight="bold"
                    className="rtl:-scale-x-100"
                  />
                </Link>
                <a
                  href="#download"
                  className={cx(
                    BUTTON,
                    "border-2 border-presence-fg text-presence-fg hover:bg-presence-fg hover:text-presence-iris",
                  )}
                >
                  <Trans>Get the apps</Trans>
                </a>
              </div>
            </div>
          </div>
          <AppPreview className="relative mx-auto -mt-[270px] max-w-[1160px] animate-art-in [animation-delay:150ms] lg:-mt-[320px]" />
        </section>

        {/* The four jobs. */}
        <section
          id="jobs"
          aria-labelledby="jobs-title"
          className="mx-auto max-w-[1300px] px-5 pt-24 pb-16 sm:px-10"
        >
          <h2
            id="jobs-title"
            className={cx(HEAD, "max-w-[14ch] text-[40px] leading-[1.02] sm:text-[60px]")}
          >
            <Trans>One office for the whole business</Trans>
          </h2>
          <p className="m-0 mt-3 text-title-sm text-secondary">
            <Trans>Everything your Etsy shop needs, working together in one AI office.</Trans>
          </p>
          <ul className="m-0 mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {jobs.map(({ tile, arc, icon: Glyph, title, body }) => (
              <li
                key={title}
                className={cx(
                  "relative flex min-h-[300px] flex-col gap-4 overflow-hidden rounded-[22px] p-7",
                  tile,
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx("absolute -end-14 -top-14 size-36 rounded-pill border-[22px]", arc)}
                />
                <span className="relative grid size-16 place-items-center rounded-pill bg-[var(--illustration-paper)] text-[var(--illustration-ink)]">
                  <Glyph aria-hidden="true" size={30} weight="regular" />
                </span>
                <h3
                  className={cx(
                    HEAD,
                    "mt-3 text-[30px] leading-[1.05] tracking-[-0.03em] text-[var(--illustration-ink)]",
                  )}
                >
                  {title}
                </h3>
                <p className="m-0 text-body leading-[1.55] text-secondary">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works, on ink. */}
        <section id="how" aria-labelledby="how-title" className="px-4 sm:px-10">
          <div className="grid items-center gap-12 rounded-[32px] bg-inverse px-6 py-14 text-on-inverse sm:px-16 lg:grid-cols-[1fr_1.15fr] lg:py-16">
            <div className="flex flex-col gap-8">
              <h2 id="how-title" className={cx(HEAD, "text-[44px] sm:text-[60px]")}>
                <Trans>How it works.</Trans>
              </h2>
              <ol className="m-0 flex list-none flex-col gap-7 p-0">
                <HowStep n="01" title={<Trans>Connect your Etsy shop</Trans>}>
                  <Trans>Orders, listings and messages start flowing in.</Trans>
                </HowStep>
                <HowStep n="02" title={<Trans>Your AI office gets to work</Trans>}>
                  <Trans>
                    Each specialist acts under your policies and handles the day-to-day.
                  </Trans>
                </HowStep>
                <HowStep n="03" title={<Trans>You approve what's risky</Trans>}>
                  <Trans>
                    Big changes, sensitive messages and anything unusual always come to you.
                  </Trans>
                </HowStep>
              </ol>
            </div>
            <div className="rounded-[24px] bg-[var(--illustration-paper)] p-3 sm:p-5">
              <HowArt />
            </div>
          </div>
        </section>

        {/* Use it anywhere. */}
        <section
          id="download"
          aria-labelledby="download-title"
          className="mx-auto max-w-[1300px] px-5 pt-28 pb-16 sm:px-10"
        >
          <h2 id="download-title" className={cx(HEAD, "text-[44px] sm:text-[80px]")}>
            <Trans>Use it anywhere</Trans>
          </h2>
          <p className="m-0 mt-4 max-w-[46ch] text-[22px] leading-[1.45] text-secondary">
            <Trans>
              The web app is ready today. The Windows and Android apps are coming soon with the same
              features.
            </Trans>
          </p>
          <ul className="m-0 mt-12 grid list-none gap-6 p-0 md:grid-cols-3">
            <Platform
              tone="bg-presence-iris text-presence-fg"
              icon={Globe}
              title={<Trans>Web</Trans>}
              detail={<Trans>Any browser, nothing to install.</Trans>}
            >
              <Link
                to="/sign-in"
                className={cx(
                  BUTTON,
                  "w-full bg-ring text-[var(--illustration-ink)] hover:brightness-95",
                )}
              >
                <Trans>Open the web app</Trans>
                <ArrowRight
                  aria-hidden="true"
                  size={20}
                  weight="bold"
                  className="rtl:-scale-x-100"
                />
              </Link>
            </Platform>
            <Platform
              tone="border border-border-subtle bg-surface"
              icon={WindowsLogo}
              title={<Trans>Windows</Trans>}
              detail={<Trans>A native desktop app with the same features.</Trans>}
            >
              <Soon />
            </Platform>
            <Platform
              tone="border border-border-subtle bg-surface"
              icon={AndroidLogo}
              title={<Trans>Android</Trans>}
              detail={<Trans>An APK for your phone with the same features.</Trans>}
            >
              <Soon />
            </Platform>
          </ul>
        </section>
      </main>

      <footer className="px-4 pb-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-6 rounded-[28px] bg-inverse px-8 py-7 text-title-sm text-on-inverse-muted sm:px-10">
          <Logo height={34} inverse />
          <span className="h-9 w-px bg-inverse-border max-sm:hidden" />
          <span className="grow">
            <Trans>HT-Commerce by H.T.Z Studios</Trans>
          </span>
          <Link
            to="/sign-in"
            className="font-semibold text-on-inverse no-underline hover:underline"
          >
            <Trans>Sign in</Trans>
          </Link>
        </div>
      </footer>
    </div>
  );
}

function HowStep({ n, title, children }: { n: string; title: ReactNode; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[72px_1fr] items-start gap-5">
      <span className="tabular grid size-[68px] place-items-center rounded-pill bg-inverse-hover font-latin text-[26px] font-extrabold text-ring">
        {n}
      </span>
      <div className="flex flex-col gap-1.5 pt-2">
        <h3 className="m-0 text-[22px] font-bold">{title}</h3>
        <p className="m-0 text-title-sm text-on-inverse-muted">{children}</p>
      </div>
    </li>
  );
}

function Platform({
  tone,
  icon: Glyph,
  title,
  detail,
  children,
}: {
  tone: string;
  icon: Icon;
  title: ReactNode;
  detail: ReactNode;
  children: ReactNode;
}) {
  return (
    <li
      className={cx("flex min-h-[350px] flex-col justify-between gap-8 rounded-[24px] p-10", tone)}
    >
      <div className="flex flex-col gap-4">
        <Glyph aria-hidden="true" size={52} weight="regular" />
        <div className="flex flex-col gap-2">
          <h3 className={cx(HEAD, "text-[34px] tracking-[-0.02em]")}>{title}</h3>
          <span className="max-w-[26ch] text-title-sm leading-[1.5] opacity-80">{detail}</span>
        </div>
      </div>
      {children}
    </li>
  );
}

/** A platform still being built: said plainly, with no dead download button. */
function Soon() {
  return (
    <div className="flex h-14 items-center justify-center rounded-button border-2 border-dashed border-border-control bg-sunken text-title-sm font-semibold text-secondary">
      <Trans>In development</Trans>
    </div>
  );
}
