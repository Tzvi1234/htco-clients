import { Trans, useLingui } from "@lingui/react/macro";
import {
  AndroidLogoIcon as AndroidLogo,
  ArrowRightIcon as ArrowRight,
  BuildingsIcon as Buildings,
  GlobeIcon as Globe,
  HandPalmIcon as HandPalm,
  PackageIcon as Package,
  StorefrontIcon as Storefront,
  TagIcon,
  UsersThreeIcon as UsersThree,
  WindowsLogoIcon as WindowsLogo,
  type Icon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Aura } from "../../shared/art/Aura.tsx";
import { SignInArt } from "../../shared/art/SignInArt.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { DecisionRing } from "../../shared/ui/DecisionRing.tsx";
import { Logo } from "../../shared/ui/Logo.tsx";
import { ObjectIcon, type Hue } from "../../shared/ui/Tag.tsx";

const PRIMARY_LINK =
  "inline-flex h-11 items-center justify-center gap-2 rounded-button bg-action-primary px-5 text-body font-medium text-action-primary-fg no-underline shadow-1 transition-colors hover:bg-action-primary-hover";
const SECONDARY_LINK =
  "inline-flex h-11 items-center justify-center gap-2 rounded-button border border-border-strong bg-action-secondary px-5 text-body font-medium text-action-secondary-fg no-underline shadow-1 transition-colors hover:bg-action-secondary-hover";

/**
 * The public front door (web first, platform ADR-0016): what HTCO is, the web app to open now,
 * and the Windows and Android apps that follow. Nothing here needs a session.
 */
export function WelcomePage() {
  const { t } = useLingui();
  const features: { hue: Hue; icon: Icon; title: string; body: string }[] = [
    {
      hue: "sky",
      icon: Package,
      title: t`Every order, verified`,
      body: t`Orders, tracking and delivery checked against the marketplace, with the receipt to prove it.`,
    },
    {
      hue: "rose",
      icon: TagIcon,
      title: t`Listings that stay healthy`,
      body: t`Titles, photos and claims audited and fixed as drafts you approve.`,
    },
    {
      hue: "mint",
      icon: UsersThree,
      title: t`Customers answered`,
      body: t`Messages sorted, drafted and escalated with the order history beside them.`,
    },
    {
      hue: "iris",
      icon: Buildings,
      title: t`An AI office you control`,
      body: t`Named specialists work under your policies and bring you every risky decision.`,
    },
  ];

  return (
    <div className="min-h-dvh bg-canvas text-primary">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5 sm:px-8">
          <Logo height={28} animated />
          <nav aria-label={t`Sections`} className="ms-6 hidden gap-6 md:flex">
            <a
              href="#features"
              className="text-body-sm font-medium text-secondary no-underline hover:text-primary"
            >
              <Trans>Product</Trans>
            </a>
            <a
              href="#download"
              className="text-body-sm font-medium text-secondary no-underline hover:text-primary"
            >
              <Trans>Download</Trans>
            </a>
          </nav>
          <span className="grow" />
          <Link
            to="/sign-in"
            className="text-body-sm font-medium text-primary no-underline hover:underline max-sm:hidden"
          >
            <Trans>Sign in</Trans>
          </Link>
          <Link to="/sign-in" className={cx(PRIMARY_LINK, "h-9 px-4 text-body-sm")}>
            <Trans>Open the web app</Trans>
          </Link>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <Aura variant="hero" className="-z-10" />
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-24 lg:pb-28">
            <div className="flex animate-enter flex-col items-start gap-6">
              <h1 className="m-0 font-display text-display font-bold sm:text-hero">
                <Trans>Your shop runs. You decide.</Trans>
              </h1>
              <p className="m-0 max-w-[48ch] text-title-sm text-secondary">
                <Trans>
                  HT-Commerce runs your Etsy business with an AI office that checks every order,
                  keeps listings healthy and asks you before anything risky.
                </Trans>
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/sign-in" className={PRIMARY_LINK}>
                  <Trans>Open the web app</Trans>
                  <ArrowRight
                    aria-hidden="true"
                    size={16}
                    weight="bold"
                    className="rtl:-scale-x-100"
                  />
                </Link>
                <a href="#download" className={SECONDARY_LINK}>
                  <Trans>Get the apps</Trans>
                </a>
              </div>
            </div>
            <div className="animate-art-in rounded-dialog border border-border-subtle bg-canvas p-6 shadow-3 [animation-delay:120ms]">
              <SignInArt />
            </div>
          </div>
        </section>

        <section
          id="features"
          aria-labelledby="features-title"
          className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8"
        >
          <h2
            id="features-title"
            className="m-0 max-w-[24ch] font-display text-display-sm font-semibold"
          >
            <Trans>One place for the whole business</Trans>
          </h2>
          <ul className="m-0 mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ hue, icon, title, body }) => (
              <li
                key={title}
                className="flex flex-col gap-3 rounded-dialog border border-border-subtle bg-surface p-5 shadow-1"
              >
                <ObjectIcon hue={hue} size="lg" icon={icon} />
                <h3 className="m-0 mt-1 text-title-sm font-semibold">{title}</h3>
                <p className="m-0 text-body-sm text-secondary">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-title" className="border-y border-border-subtle bg-sunken">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
            <h2 id="how-title" className="m-0 font-display text-display-sm font-semibold">
              <Trans>How it works</Trans>
            </h2>
            <ol className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-3">
              <HowStep
                n="1"
                hue="coral"
                icon={Storefront}
                title={<Trans>Connect your Etsy shop</Trans>}
              >
                <Trans>Orders, listings and messages start flowing in.</Trans>
              </HowStep>
              <HowStep
                n="2"
                hue="sky"
                icon={Buildings}
                title={<Trans>Your office gets to work</Trans>}
              >
                <Trans>Each specialist acts under your policies and shows its work.</Trans>
              </HowStep>
              <HowStep
                n="3"
                hue="saffron"
                icon={HandPalm}
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
        </section>

        <section
          id="download"
          aria-labelledby="download-title"
          className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8"
        >
          <h2 id="download-title" className="m-0 font-display text-display-sm font-semibold">
            <Trans>Use it anywhere</Trans>
          </h2>
          <p className="m-0 mt-3 max-w-[56ch] text-secondary">
            <Trans>
              The web app is ready today. The Windows and Android apps follow with the same
              features.
            </Trans>
          </p>
          <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-3">
            <Platform
              hue="iris"
              icon={Globe}
              title={<Trans>Web</Trans>}
              detail={<Trans>Any browser, nothing to install.</Trans>}
            >
              <Link to="/sign-in" className={cx(PRIMARY_LINK, "w-full")}>
                <Trans>Open the web app</Trans>
              </Link>
            </Platform>
            <Platform
              hue="sky"
              icon={WindowsLogo}
              title={<Trans>Windows</Trans>}
              detail={<Trans>A native desktop app.</Trans>}
            >
              <Soon />
            </Platform>
            <Platform
              hue="mint"
              icon={AndroidLogo}
              title={<Trans>Android</Trans>}
              detail={<Trans>An APK for your phone.</Trans>}
            >
              <Soon />
            </Platform>
          </ul>
        </section>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-4 px-5 py-8 text-body-sm text-muted sm:px-8">
          <Logo height={18} />
          <span className="grow">
            <Trans>HT-Commerce by H.T.Z Studios</Trans>
          </span>
          <Link to="/sign-in" className="text-secondary no-underline hover:text-primary">
            <Trans>Sign in</Trans>
          </Link>
        </div>
      </footer>
    </div>
  );
}

function HowStep({
  n,
  hue,
  icon,
  title,
  children,
}: {
  n: string;
  hue: Hue;
  icon: Icon;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-dialog border border-border-subtle bg-surface p-6 shadow-1">
      <div className="flex items-center justify-between">
        <ObjectIcon hue={hue} size="lg" icon={icon} />
        <span className="tabular font-display text-display-sm font-semibold text-border-strong">
          {n}
        </span>
      </div>
      <h3 className="m-0 mt-1 text-title-sm font-semibold">{title}</h3>
      <p className="m-0 text-body-sm text-secondary">{children}</p>
    </li>
  );
}

function Platform({
  hue,
  icon,
  title,
  detail,
  children,
}: {
  hue: Hue;
  icon: Icon;
  title: ReactNode;
  detail: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-4 rounded-dialog border border-border-subtle bg-surface p-6 shadow-1">
      <div className="flex items-center gap-3">
        <ObjectIcon hue={hue} size="lg" icon={icon} />
        <div className="flex flex-col">
          <h3 className="m-0 text-title-sm font-semibold">{title}</h3>
          <span className="text-body-sm text-muted">{detail}</span>
        </div>
      </div>
      {children}
    </li>
  );
}

/** A platform still being built: said plainly, with no dead download button. */
function Soon() {
  return (
    <div className="flex h-11 items-center justify-center gap-2 rounded-button border border-dashed border-border-control text-body-sm font-medium text-muted">
      <Trans>In development</Trans>
    </div>
  );
}
