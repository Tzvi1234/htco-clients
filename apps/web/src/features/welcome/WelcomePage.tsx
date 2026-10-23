import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import "./welcome.css";
import hero0 from "../../assets/hero/hero0.webp";
import hero10 from "../../assets/hero/hero10.webp";
import hero11 from "../../assets/hero/hero11.webp";
import hero2 from "../../assets/hero/hero2.webp";
import hero3 from "../../assets/hero/hero3.webp";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { ArrowEndIcon } from "../../shared/ui/icons.tsx";
import { Logo } from "../../shared/ui/Logo.tsx";
import { Segmented } from "../../shared/ui/Segmented.tsx";
import { TEXT_LINK } from "../../shared/ui/kit/index.ts";

const PILL_PRIMARY =
  "inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-action-primary px-6 text-body-sm text-action-primary-fg no-underline outline-none transition-[background-color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:bg-action-primary-hover active:scale-[0.97]";
const PILL_SECONDARY =
  "inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-line-strong px-6 text-body-sm text-primary no-underline outline-none transition-[background-color,border-color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:border-line-hover-strong hover:bg-hover active:scale-[0.97]";

/**
 * The public front door (web first, platform ADR-0016), redesigned in round 3 as one flowing
 * composition instead of a grid of boxes (welcome.css has the scroll choreography). The page
 * reads as five movements on one ground, each in its own colour:
 *
 * 1. The hero, on the ground: the promise beside a layered scene (the office plan far back,
 *    the logo's orange sun, the robot carrying an order, the parcel in front), whose planes
 *    part at different speeds as the page scrolls.
 * 2. What works today, on the ground: four plain lines that wipe in as they arrive.
 * 3. What is coming, on ink: the peak. The page holds while the planned office slides past
 *    sideways, and ends on the signature: an approval that waits for the owner in orange and is
 *    decided by the scroll itself ("You decide").
 * 4. How it works: three steps on a rail that fills with orange as you read.
 * 5. The close, on orange: open the web app, and which apps follow.
 *
 * Under reduced motion, or where the browser has no scroll-driven animations, the same content
 * stands still in its final composition (nothing pins, nothing is hidden). It shares the
 * language, theme and palette with the app: one stored preference.
 */
export function WelcomePage() {
  return (
    <div className="welcome min-h-dvh">
      <TopBar />
      <main>
        <Hero />
        <Today />
        <Planned />
        <HowItWorks />
        <Apps />
      </main>
      <footer className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-6 py-8 sm:px-10">
        <Logo height={18} />
        <p className="m-0 text-caption font-light text-muted">
          <Trans>HT-Commerce by H.T.Z Studios</Trans>
        </p>
        <Link to="/sign-in" className={cx(TEXT_LINK, "-my-1 inline-block")}>
          <Trans>Sign in</Trans>
        </Link>
      </footer>
    </div>
  );
}

/** The frosted glass bar: the logo, the sections, the language and the way in. */
function TopBar() {
  const { t } = useLingui();
  const { locale, setLocale } = useLocale();
  const over = useToneUnderBar();
  return (
    <div className="w-bar sticky top-0 z-popover px-2 pt-2">
      <header
        data-glass=""
        data-over={over}
        className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 rounded-pill border border-sidebar-line bg-sidebar ps-6 pe-2 shadow-sidebar"
      >
        <Logo height={22} animated />
        <nav aria-label={t`Sections`} className="hidden gap-1 lg:flex">
          {[
            { href: "#today", label: t`What works today` },
            { href: "#planned", label: t`What is coming` },
            { href: "#how", label: t`How it works` },
            { href: "#apps", label: t`Apps` },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex h-9 items-center rounded-pill px-3.5 text-body-sm text-secondary no-underline transition-colors duration-[var(--motion-duration-fast)] hover:bg-hover hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <span className="grow" />
        <div className="flex items-center gap-1.5">
          <Segmented
            label={t`Language`}
            value={locale}
            onChange={setLocale}
            className="max-sm:hidden"
            options={[
              { id: "he", label: "עברית", lang: "he" },
              { id: "en", label: "English", lang: "en" },
            ]}
          />
          <Link to="/sign-in" className={cx(PILL_PRIMARY, "h-12 px-5 max-sm:hidden")}>
            <Trans>Open the web app</Trans>
          </Link>
          {/* Phones: the short word, so the bar keeps one line. */}
          <Link to="/sign-in" className={cx(PILL_PRIMARY, "h-12 px-5 sm:hidden")}>
            <Trans>Sign in</Trans>
          </Link>
        </div>
      </header>
    </div>
  );
}

/** The line under the middle of the bar: where its glass reads what passes beneath it. */
const BAR_LINE = 40;

/**
 * The colour of the section under the bar ("ink" or "orange"), so its glass can turn with it
 * (welcome.css, "The bar"): sections say their colour with data-tone. Read on scroll, at most
 * once a frame.
 */
function useToneUnderBar(): string | undefined {
  const [tone, setTone] = useState<string | undefined>(undefined);
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const under = [...document.querySelectorAll<HTMLElement>(".welcome [data-tone]")].find(
        (section) => {
          const box = section.getBoundingClientRect();
          return box.top <= BAR_LINE && box.bottom >= BAR_LINE;
        },
      );
      setTone(under?.dataset["tone"]);
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);
  return tone;
}

/** The promise, and the layered scene beside it (above it on phones). */
function Hero() {
  return (
    <section
      aria-labelledby="welcome-title"
      className="w-hero relative mx-auto grid max-w-[1440px] items-center gap-6 px-6 pt-10 pb-16 sm:px-10 lg:min-h-[calc(100dvh-72px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pt-4"
    >
      <div className="relative z-sticky flex flex-col gap-8 max-lg:order-2">
        <h1
          id="welcome-title"
          className="w-in m-0 text-display leading-[1.02] font-light tracking-[-0.02em] text-balance sm:text-hero xl:text-[84px]"
        >
          <Trans>Your shop runs. You decide.</Trans>
        </h1>
        <p className="w-in m-0 max-w-[44ch] text-title-sm leading-[1.55] font-light text-secondary [animation-delay:80ms]">
          <Trans>
            HT-Commerce is the operating system for your Etsy business: your shops, your team and,
            step by step, an AI office that asks you before anything risky.
          </Trans>
        </p>
        <div className="w-in flex flex-wrap items-center gap-2 [animation-delay:160ms]">
          <Link to="/sign-in" className={PILL_PRIMARY}>
            <Trans>Open the web app</Trans>
            <ArrowEndIcon size={14} />
          </Link>
          <a href="#today" className={PILL_SECONDARY}>
            <Trans>What works today</Trans>
          </a>
        </div>
        <p className="w-in m-0 flex items-center gap-2 text-caption text-secondary [animation-delay:240ms]">
          <span aria-hidden="true" className="w-led size-2 rounded-pill bg-success" />
          <Trans>The web app is open today</Trans>
        </p>
      </div>
      {/* The scene: four planes that part as the page scrolls (welcome.css, "The hero"). */}
      <div
        aria-hidden="true"
        dir="ltr"
        className="relative h-[340px] max-lg:order-1 sm:h-[460px] lg:h-[min(72vh,660px)]"
      >
        <span className="w-sun absolute top-[30%] inset-e-[34%] aspect-square w-[46%] rounded-pill bg-tertiary" />
        <img
          src={hero11}
          alt=""
          draggable={false}
          className="w-back pointer-events-none absolute top-[2%] inset-e-[-10%] w-[96%] max-w-none select-none"
        />
        <img
          src={hero3}
          alt=""
          draggable={false}
          className="w-subject pointer-events-none absolute inset-e-[22%] bottom-[2%] w-[46%] max-w-none select-none"
        />
        <img
          src={hero10}
          alt=""
          draggable={false}
          className="w-front pointer-events-none absolute inset-e-[2%] bottom-[-4%] w-[30%] max-w-none select-none"
        />
      </div>
    </section>
  );
}

/** What a signed-in user can do in the web app today: four lines, no boxes. */
function Today() {
  const { t } = useLingui();
  const items = [
    { label: t`Sign-in`, value: t`Two-step`, detail: t`Password and authenticator app` },
    { label: t`Etsy shops`, value: t`Connect`, detail: t`Connect and reconnect your shops` },
    { label: t`Team`, value: t`Invite`, detail: t`Members, roles and invitation links` },
    { label: t`Languages`, value: t`Hebrew and English`, detail: t`Right to left and back` },
  ];
  return (
    <section
      id="today"
      aria-labelledby="today-title"
      className="mx-auto max-w-[1440px] scroll-mt-24 px-6 py-20 sm:px-10 lg:py-28"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-3 lg:sticky lg:top-28 lg:self-start">
          <h2
            id="today-title"
            className="m-0 text-display-sm leading-[1.1] font-light tracking-[-0.01em] sm:text-display"
          >
            <Trans>What works today</Trans>
          </h2>
          <p className="m-0 max-w-[32ch] text-body text-secondary">
            <Trans>In the web app, for you and your team, from the first sign-in.</Trans>
          </p>
        </div>
        <ul className="m-0 flex list-none flex-col p-0">
          {items.map((item) => (
            <li
              key={item.label}
              className="w-wipe grid gap-1 border-t border-line-strong py-6 last:border-b sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] sm:items-baseline sm:gap-6"
            >
              <span className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-caption text-secondary">
                  <span aria-hidden="true" className="size-1.5 rounded-pill bg-success" />
                  {item.label}
                </span>
                <span className="text-display-sm leading-[1.15] font-light tracking-[-0.01em] sm:text-number-lg">
                  {item.value}
                </span>
              </span>
              <span className="text-body text-secondary">{item.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * The peak, on ink: the page holds while the planned office passes sideways, and the last
 * stop is an approval the scroll itself decides (welcome.css, "The peak").
 */
function Planned() {
  const { t } = useLingui();
  const cards = [
    {
      image: hero0,
      title: t`The AI office`,
      body: t`Sixteen AI employees in seven departments, working under your policies.`,
    },
    {
      image: hero3,
      title: t`Orders and shipping`,
      body: t`Every order checked against the marketplace, with tracking that keeps up.`,
    },
    {
      image: hero2,
      title: t`Listings and products`,
      body: t`Titles, photos and claims audited, fixed as drafts you approve.`,
    },
  ];
  return (
    <section id="planned" aria-labelledby="planned-title" className="w-pan scroll-mt-20 px-2">
      <div
        data-tone="ink"
        className="w-pan-frame overflow-hidden rounded-panel bg-inverse text-on-inverse"
      >
        <div className="mx-auto flex h-full max-w-[1440px] flex-col justify-center gap-10 py-16 sm:py-20">
          <div className="flex flex-col gap-3 px-6 sm:px-10">
            <h2
              id="planned-title"
              className="m-0 text-display-sm leading-[1.1] font-light tracking-[-0.01em] sm:text-display"
            >
              <Trans>What is coming</Trans>
            </h2>
            <p className="m-0 max-w-[46ch] text-body text-on-inverse-muted">
              <Trans>
                The office that works for you, built step by step. It asks before anything risky.
              </Trans>
            </p>
          </div>
          <div className="w-track flex gap-4 px-6 sm:px-10">
            {cards.map((card) => (
              <article
                key={card.title}
                className="flex w-[min(78vw,380px)] shrink-0 flex-col gap-4 rounded-card border border-inverse-border p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="m-0 text-title-sm font-normal">{card.title}</h3>
                  <span className="inline-flex h-6 items-center gap-1.5 rounded-pill border border-inverse-border px-2.5 text-caption text-on-inverse-muted">
                    <span aria-hidden="true" className="size-1.5 rounded-pill bg-tertiary-mark" />
                    <Trans>Coming</Trans>
                  </span>
                </div>
                <div className="relative h-[200px]" aria-hidden="true">
                  <img
                    src={card.image}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 m-auto h-full w-full object-contain select-none"
                  />
                </div>
                <p className="m-0 text-body-sm text-on-inverse-muted">{card.body}</p>
              </article>
            ))}
            <Decision />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The signature: an example approval at the end of the passing office. It waits for the owner
 * in orange; as the scroll reaches it, the orange fills the button and the request becomes
 * "Approved by you". Standing still (reduced motion, or no scroll-driven animations) it
 * shows the outcome: the orange Approve and "Approved by you".
 */
function Decision() {
  return (
    <article
      aria-labelledby="decision-title"
      className="w-decision flex w-[min(84vw,440px)] shrink-0 flex-col gap-5 rounded-card bg-on-inverse p-6 text-primary"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-pill bg-inverse text-body-sm text-on-inverse"
        >
          M
        </span>
        <span className="min-w-0">
          <span className="block text-body">
            <Trans>Maya · General Manager</Trans>
          </span>
          <span className="block text-caption text-secondary">
            <Trans>An example of what will ask you</Trans>
          </span>
        </span>
      </div>
      <h3 id="decision-title" className="m-0 text-title font-light">
        <Trans>Pause the summer sale on four listings?</Trans>
      </h3>
      <p className="m-0 text-body-sm text-secondary">
        <Trans>Stock is low on all four. Nothing changes until you say so.</Trans>
      </p>
      <div className="relative flex items-center justify-between gap-3">
        <span className="w-decision-state relative inline-flex h-7 items-center">
          <span className="w-ask inline-flex items-center gap-2 text-caption text-tertiary-text">
            <span aria-hidden="true" className="size-2 rounded-pill bg-tertiary-mark" />
            <Trans>Needs you</Trans>
          </span>
          <span className="w-done absolute inset-0 inline-flex items-center gap-2 text-caption whitespace-nowrap">
            <span aria-hidden="true" className="size-2 rounded-pill bg-success" />
            <Trans>Approved by you</Trans>
          </span>
        </span>
        <span
          aria-hidden="true"
          className="relative inline-flex h-10 items-center overflow-hidden rounded-pill bg-inverse px-5 text-body-sm text-on-inverse"
        >
          <Trans>Approve</Trans>
          {/* The same word in the same place, on orange: the sweep reveals it over the ink. */}
          <span className="w-fill absolute inset-0 inline-flex items-center bg-tertiary px-5 text-on-tertiary">
            <Trans>Approve</Trans>
          </span>
        </span>
      </div>
    </article>
  );
}

function HowItWorks() {
  const { t } = useLingui();
  const steps = [
    {
      title: t`Open the web app`,
      body: t`Sign in; Owners and Admins add a code from an authenticator app.`,
    },
    {
      title: t`Connect your Etsy shop`,
      body: t`One button, Etsy asks you to allow it, and you are back.`,
    },
    {
      title: t`Bring your team`,
      body: t`Invite members by email or link and choose what they can do.`,
    },
  ];
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="mx-auto max-w-[1440px] scroll-mt-24 px-6 py-20 sm:px-10 lg:py-28"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ol className="w-rail relative m-0 flex list-none flex-col gap-12 p-0 ps-14 max-lg:order-2">
          {/* The rail: a hairline that fills with orange as the steps are read. */}
          <span
            aria-hidden="true"
            className="absolute inset-y-2 inset-s-[19px] w-px overflow-hidden bg-line-strong"
          >
            <span className="w-rail-fill absolute inset-0 origin-top bg-tertiary" />
          </span>
          {steps.map((step, index) => (
            <li key={step.title} className="w-step relative flex flex-col gap-2">
              <span
                aria-hidden="true"
                className="absolute -inset-s-14 top-0 grid size-10 place-items-center rounded-pill border border-line-strong bg-ground text-body-sm tabular"
              >
                {index + 1}
              </span>
              <h3 className="m-0 text-title-lg leading-[1.2] font-light sm:text-display-sm">
                {step.title}
              </h3>
              <p className="m-0 max-w-[48ch] text-body text-secondary">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-3 lg:sticky lg:top-28 lg:self-start">
          <h2
            id="how-title"
            className="m-0 text-display-sm leading-[1.1] font-light tracking-[-0.01em] sm:text-display"
          >
            <Trans>How it works</Trans>
          </h2>
          <p className="m-0 max-w-[32ch] text-body text-secondary">
            <Trans>Three steps, a few minutes each.</Trans>
          </p>
        </div>
      </div>
    </section>
  );
}

/** The close, on orange: the way in, and which apps follow. */
function Apps() {
  const { t } = useLingui();
  return (
    <section id="apps" aria-label={t`Apps`} className="scroll-mt-20 px-2">
      <div
        data-tone="orange"
        className="w-close overflow-hidden rounded-panel bg-tertiary text-on-tertiary"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-16 sm:px-10 sm:py-24">
          <div className="flex flex-col gap-6">
            <h2
              id="apps-title"
              className="m-0 max-w-[14ch] text-display leading-[1.02] font-light tracking-[-0.02em] sm:text-hero"
            >
              <Trans>Your office opens in the browser.</Trans>
            </h2>
            <div>
              <Link
                to="/sign-in"
                className="inline-flex h-14 items-center gap-2 rounded-pill bg-inverse px-7 text-body text-on-inverse no-underline outline-none transition-[background-color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:bg-inverse-hover active:scale-[0.97]"
              >
                <Trans>Open the web app</Trans>
                <ArrowEndIcon size={16} />
              </Link>
            </div>
          </div>
          <ul className="m-0 grid list-none gap-0 p-0 sm:grid-cols-3">
            <AppLine
              name={<Trans>Web</Trans>}
              detail={<Trans>Any browser, nothing to install.</Trans>}
              status={<Trans>Ready today</Trans>}
              ready
            />
            <AppLine
              name={<Trans>Windows</Trans>}
              detail={<Trans>A native desktop app with the same features.</Trans>}
              status={<Trans>In development</Trans>}
            />
            <AppLine
              name={<Trans>Android</Trans>}
              detail={<Trans>An app for your phone with the same features.</Trans>}
              status={<Trans>In development</Trans>}
            />
          </ul>
        </div>
      </div>
    </section>
  );
}

function AppLine({
  name,
  detail,
  status,
  ready = false,
}: {
  name: ReactNode;
  detail: ReactNode;
  status: ReactNode;
  ready?: boolean;
}) {
  return (
    <li className="flex flex-col gap-2 border-t border-on-tertiary/25 py-5 sm:pe-6">
      <span className="flex flex-col items-start gap-2">
        <span className="text-display-sm leading-tight font-light">{name}</span>
        <span
          className={cx(
            "inline-flex h-6 items-center rounded-pill px-2.5 text-caption",
            ready ? "bg-inverse text-on-inverse" : "border border-on-tertiary/40",
          )}
        >
          {status}
        </span>
      </span>
      <span className="text-body-sm">{detail}</span>
    </li>
  );
}
