import { Trans, useLingui } from "@lingui/react/macro";
import {
  AndroidLogoIcon as AndroidLogo,
  ArrowRightIcon as ArrowRight,
  BuildingsIcon as Buildings,
  GlobeIcon as Globe,
  PackageIcon as Package,
  TagIcon,
  UsersThreeIcon as UsersThree,
  WindowsLogoIcon as WindowsLogo,
  type Icon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AppPreview } from "../../shared/art/AppPreview.tsx";
import { SignInArt } from "../../shared/art/SignInArt.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { DecisionRing } from "../../shared/ui/DecisionRing.tsx";
import { Logo } from "../../shared/ui/Logo.tsx";

const BUTTON =
  "inline-flex h-12 items-center justify-center gap-2 rounded-button px-6 text-body font-semibold no-underline transition-[background-color,scale] active:scale-[0.98]";

/**
 * The public front door (web first, platform ADR-0016), in bold solid colour blocks: the iris
 * hero with the product on stage, the four jobs as solid tiles, how it works on ink, and the web
 * app to open now with the Windows and Android apps that follow. Nothing here needs a session.
 */
export function WelcomePage() {
  const { t } = useLingui();
  const jobs: { tile: string; icon: Icon; title: string; body: string }[] = [
    {
      tile: "bg-shape-sky",
      icon: Package,
      title: t`Every order, verified`,
      body: t`Orders, tracking and delivery checked against the marketplace, with the receipt to prove it.`,
    },
    {
      tile: "bg-shape-peach",
      icon: TagIcon,
      title: t`Listings that stay healthy`,
      body: t`Titles, photos and claims audited and fixed as drafts you approve.`,
    },
    {
      tile: "bg-shape-mint",
      icon: UsersThree,
      title: t`Customers answered`,
      body: t`Messages sorted, drafted and escalated with the order history beside them.`,
    },
    {
      tile: "bg-shape-saffron",
      icon: Buildings,
      title: t`An AI office you control`,
      body: t`Named specialists work under your policies and bring you every risky decision.`,
    },
  ];

  return (
    <div className="min-h-dvh bg-canvas text-primary">
      <header className="mx-auto flex h-18 max-w-[1240px] items-center gap-6 px-5 sm:px-8">
        <Logo height={30} animated />
        <nav aria-label={t`Sections`} className="hidden gap-7 md:flex">
          <a
            href="#jobs"
            className="text-body font-medium text-secondary no-underline hover:text-primary"
          >
            <Trans>Product</Trans>
          </a>
          <a
            href="#how"
            className="text-body font-medium text-secondary no-underline hover:text-primary"
          >
            <Trans>How it works</Trans>
          </a>
          <a
            href="#download"
            className="text-body font-medium text-secondary no-underline hover:text-primary"
          >
            <Trans>Download</Trans>
          </a>
        </nav>
        <span className="grow" />
        <Link
          to="/sign-in"
          className="text-body font-medium text-primary no-underline hover:underline max-sm:hidden"
        >
          <Trans>Sign in</Trans>
        </Link>
        <Link
          to="/sign-in"
          className={cx(BUTTON, "h-10 bg-app px-4 text-app-text hover:bg-app-hover")}
        >
          <Trans>Open the web app</Trans>
        </Link>
      </header>

      <main>
        {/* The hero: a solid iris stage, the product rising out of it. */}
        <section className="px-3 sm:px-4">
          <div className="relative isolate overflow-hidden rounded-[28px] bg-presence-iris px-6 pt-16 text-presence-fg sm:px-12 lg:pt-24">
            <span
              aria-hidden="true"
              className="absolute -end-24 -top-24 -z-10 size-[340px] rounded-pill border-[44px] border-shape-sky opacity-90 max-md:hidden"
            />
            <span
              aria-hidden="true"
              className="absolute end-[170px] top-[150px] -z-10 size-[240px] rounded-pill border-[36px] border-shape-iris max-md:hidden"
            />
            <span
              aria-hidden="true"
              className="absolute end-[110px] top-[320px] -z-10 size-20 rounded-pill bg-ring max-md:hidden"
            />
            <div className="mx-auto flex max-w-[860px] animate-enter flex-col items-center gap-6 text-center">
              <h1 className="m-0 font-display text-display leading-[1.02] font-bold sm:text-[72px] sm:leading-[1]">
                <Trans>Your shop runs. You decide.</Trans>
              </h1>
              <p className="m-0 max-w-[52ch] text-title-sm opacity-90">
                <Trans>
                  HT-Commerce runs your Etsy business with an AI office that checks every order,
                  keeps listings healthy and asks you before anything risky.
                </Trans>
              </p>
              <div className="flex flex-wrap justify-center gap-3">
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
                    size={18}
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
            <AppPreview className="mx-auto mt-14 max-w-[1000px] translate-y-6 animate-art-in [animation-delay:150ms]" />
          </div>
        </section>

        {/* The four jobs as solid tiles. */}
        <section
          id="jobs"
          aria-labelledby="jobs-title"
          className="mx-auto max-w-[1240px] px-5 pt-28 pb-20 sm:px-8"
        >
          <div className="flex flex-col items-start gap-3">
            <h2 id="jobs-title" className="m-0 max-w-[18ch] font-display text-display font-bold">
              <Trans>One place for the whole business</Trans>
            </h2>
          </div>
          <ul className="m-0 mt-12 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {jobs.map(({ tile, icon: Glyph, title, body }) => (
              <li
                key={title}
                className={cx(
                  "flex min-h-[280px] flex-col justify-between gap-8 rounded-[24px] p-6",
                  tile,
                )}
              >
                <span className="grid size-12 place-items-center rounded-pill bg-canvas text-primary shadow-1">
                  <Glyph aria-hidden="true" size={24} weight="duotone" />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="m-0 font-display text-title font-semibold">{title}</h3>
                  <p className="m-0 text-body text-secondary">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works, on ink, with the relay art. */}
        <section id="how" aria-labelledby="how-title" className="px-3 sm:px-4">
          <div className="grid items-center gap-12 overflow-hidden rounded-[28px] bg-app px-6 py-16 text-app-text sm:px-12 lg:grid-cols-2 lg:py-24">
            <div className="flex flex-col gap-10">
              <h2 id="how-title" className="m-0 font-display text-display font-bold">
                <Trans>How it works</Trans>
              </h2>
              <ol className="m-0 flex list-none flex-col gap-8 p-0">
                <HowStep n="01" title={<Trans>Connect your Etsy shop</Trans>}>
                  <Trans>Orders, listings and messages start flowing in.</Trans>
                </HowStep>
                <HowStep n="02" title={<Trans>Your office gets to work</Trans>}>
                  <Trans>Each specialist acts under your policies and shows its work.</Trans>
                </HowStep>
                <HowStep
                  n="03"
                  title={
                    <DecisionRing>
                      <span>
                        <Trans>You decide</Trans>
                      </span>
                    </DecisionRing>
                  }
                >
                  <Trans>
                    Anything risky waits for your approval, with the reason and the receipt.
                  </Trans>
                </HowStep>
              </ol>
            </div>
            <div className="rounded-[24px] bg-canvas p-6 sm:p-10">
              <SignInArt />
            </div>
          </div>
        </section>

        {/* Use it anywhere. */}
        <section
          id="download"
          aria-labelledby="download-title"
          className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8"
        >
          <h2 id="download-title" className="m-0 font-display text-display font-bold">
            <Trans>Use it anywhere</Trans>
          </h2>
          <p className="m-0 mt-4 max-w-[56ch] text-title-sm text-secondary">
            <Trans>
              The web app is ready today. The Windows and Android apps follow with the same
              features.
            </Trans>
          </p>
          <ul className="m-0 mt-12 grid list-none gap-4 p-0 md:grid-cols-3">
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
              </Link>
            </Platform>
            <Platform
              tone="bg-surface border border-border-subtle"
              icon={WindowsLogo}
              title={<Trans>Windows</Trans>}
              detail={<Trans>A native desktop app.</Trans>}
            >
              <Soon />
            </Platform>
            <Platform
              tone="bg-surface border border-border-subtle"
              icon={AndroidLogo}
              title={<Trans>Android</Trans>}
              detail={<Trans>An APK for your phone.</Trans>}
            >
              <Soon />
            </Platform>
          </ul>
        </section>
      </main>

      <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="flex flex-wrap items-center gap-4 rounded-[28px] bg-app px-6 py-8 text-body-sm text-app-muted sm:px-12">
          <Logo height={20} onInk />
          <span className="grow">
            <Trans>HT-Commerce by H.T.Z Studios</Trans>
          </span>
          <Link to="/sign-in" className="text-app-text no-underline hover:underline">
            <Trans>Sign in</Trans>
          </Link>
        </div>
      </footer>
    </div>
  );
}

function HowStep({ n, title, children }: { n: string; title: ReactNode; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[56px_1fr] gap-4">
      <span className="tabular font-display text-display-sm font-bold text-ring">{n}</span>
      <div className="flex flex-col gap-1.5">
        <h3 className="m-0 font-display text-title font-semibold">{title}</h3>
        <p className="m-0 text-body text-app-muted">{children}</p>
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
    <li className={cx("flex flex-col justify-between gap-10 rounded-[24px] p-6 shadow-1", tone)}>
      <div className="flex flex-col gap-4">
        <Glyph aria-hidden="true" size={36} weight="duotone" />
        <div className="flex flex-col gap-1">
          <h3 className="m-0 font-display text-title font-semibold">{title}</h3>
          <span className="text-body opacity-80">{detail}</span>
        </div>
      </div>
      {children}
    </li>
  );
}

/** A platform still being built: said plainly, with no dead download button. */
function Soon() {
  return (
    <div className="flex h-12 items-center justify-center rounded-button border-2 border-dashed border-border-control text-body font-semibold text-muted">
      <Trans>In development</Trans>
    </div>
  );
}
