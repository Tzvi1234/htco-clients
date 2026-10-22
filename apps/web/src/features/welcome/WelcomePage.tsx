import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import "./welcome.css";
import hero0 from "../../assets/hero/hero0.webp";
import hero1 from "../../assets/hero/hero1.webp";
import hero10 from "../../assets/hero/hero10.webp";
import hero11 from "../../assets/hero/hero11.webp";
import hero2 from "../../assets/hero/hero2.webp";
import hero3 from "../../assets/hero/hero3.webp";
import hero4 from "../../assets/hero/hero4.webp";
import hero5 from "../../assets/hero/hero5.webp";
import hero6 from "../../assets/hero/hero6.webp";
import hero7 from "../../assets/hero/hero7.webp";
import hero8 from "../../assets/hero/hero8.webp";
import hero9 from "../../assets/hero/hero9.webp";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { REDUCED_MOTION_QUERY, useMediaQuery } from "../../shared/lib/useMediaQuery.ts";
import { useTweaks } from "../../shared/theme/ThemeProvider.tsx";
import { ArrowEndIcon, ArrowStartIcon } from "../../shared/ui/icons.tsx";
import { Ltr } from "../../shared/ui/Ltr.tsx";
import { Logo } from "../../shared/ui/Logo.tsx";
import { Segmented } from "../../shared/ui/Segmented.tsx";

const PANEL =
  "glass relative flex min-w-0 flex-col overflow-hidden rounded-panel border border-edge bg-panel shadow-panel";
const PILL_PRIMARY =
  "inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-action-primary bg-action-primary px-6 text-body-sm text-action-primary-fg no-underline transition-[background-color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:bg-action-primary-hover active:scale-[0.98]";
const PILL_SECONDARY =
  "inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-line-strong px-6 text-body-sm text-primary no-underline transition-[background-color,border-color,scale] duration-[var(--motion-duration-fast)] ease-standard hover:border-line-hover-strong hover:bg-hover active:scale-[0.98]";

/** The hero carousel: the same five renders in each palette. */
const HEROES = {
  sbb: [hero0, hero1, hero2, hero3, hero4],
  d4: [hero5, hero6, hero7, hero8, hero9],
};

/**
 * The public front door (web first, platform ADR-0016) in the Design 1C language: panels on the
 * ground, light type, ink pills and the renders. It says plainly what works today (the web app)
 * and what is planned, and it carries the same tweaks panel as the app: one stored preference.
 */
export function WelcomePage() {
  return (
    <div className="welcome mx-auto flex min-h-dvh max-w-[1440px] flex-col gap-2 p-2">
      <TopBar />
      <main className="flex flex-col gap-2">
        <Hero />
        <Today />
        <Planned />
        <HowItWorks />
        <Apps />
      </main>
      <footer
        className={cx(PANEL, "flex-row flex-wrap items-center justify-between gap-3 px-6 py-5")}
      >
        <Logo height={18} />
        <p className="m-0 text-caption font-light text-muted">
          <Trans>HT-Commerce by H.T.Z Studios</Trans>
        </p>
        <Link
          to="/sign-in"
          className="-my-1 inline-block rounded-[4px] py-1 text-caption text-primary underline underline-offset-[3px]"
        >
          <Trans>Sign in</Trans>
        </Link>
      </footer>
    </div>
  );
}

function TopBar() {
  const { t } = useLingui();
  const { locale, setLocale } = useLocale();
  return (
    <header
      className={cx(PANEL, "sticky top-2 z-20 h-[72px] flex-row items-center gap-6 ps-6 pe-3")}
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
            className="inline-flex h-9 items-center rounded-pill px-3.5 text-body-sm text-secondary no-underline transition-colors hover:bg-hover hover:text-primary"
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

        <Link to="/sign-in" className={cx(PILL_PRIMARY, "h-10 px-5 max-sm:hidden")}>
          <Trans>Open the web app</Trans>
        </Link>
        {/* Phones: the short word, so the bar keeps one line. */}
        <Link to="/sign-in" className={cx(PILL_PRIMARY, "h-10 px-5 sm:hidden")}>
          <Trans>Sign in</Trans>
        </Link>
      </div>
    </header>
  );
}

/** The headline panel and the renders carousel beside it (stacked on phones). */
function Hero() {
  return (
    <section className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className={cx(PANEL, "w-rise justify-between gap-10 p-6 sm:p-10")}>
        <p className="m-0 flex items-center gap-2 text-caption font-light text-muted">
          <span aria-hidden="true" className="w-led size-1.5 rounded-pill bg-success" />
          <Trans>The web app is open today</Trans>
        </p>
        <div className="flex flex-col gap-5">
          <h1 className="m-0 text-[44px] leading-[1.05] font-light tracking-[-0.02em] sm:text-[64px]">
            <Trans>Your shop runs. You decide.</Trans>
          </h1>
          <p className="m-0 max-w-[46ch] text-title-sm leading-[1.55] font-light text-secondary">
            <Trans>
              HT-Commerce is the operating system for your Etsy business: your shops, your team and,
              step by step, an AI office that asks you before anything risky.
            </Trans>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/sign-in" className={PILL_PRIMARY}>
            <Trans>Open the web app</Trans>
            <ArrowEndIcon size={14} />
          </Link>
          <a href="#today" className={PILL_SECONDARY}>
            <Trans>What works today</Trans>
          </a>
        </div>
      </div>
      <Carousel />
    </section>
  );
}

function Carousel() {
  const { t } = useLingui();
  const { tweaks } = useTweaks();
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const images = tweaks.palette === "d4" ? HEROES.d4 : HEROES.sbb;
  const names = [
    t`Your AI office, in miniature`,
    t`A desk for every specialist`,
    t`Your products`,
    t`Orders on their way`,
    t`Your shop`,
  ];
  const [index, setIndex] = useState(0);
  // Hover and focus pause the rotation independently: either one keeps it still.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  useEffect(() => {
    if (reduced || paused) return;
    const timer = window.setInterval(() => {
      setIndex((now) => (now + 1) % images.length);
    }, 4200);
    return () => {
      window.clearInterval(timer);
    };
  }, [reduced, paused, images.length]);
  const step = (by: number) => {
    setIndex((now) => (now + by + images.length) % images.length);
  };
  return (
    <section
      aria-roledescription={t`carousel`}
      aria-label={t`HT-Commerce renders`}
      className={cx(PANEL, "w-rise min-h-[420px] [animation-delay:80ms] lg:min-h-[560px]")}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      onFocus={() => {
        setFocused(true);
      }}
      onBlur={(event) => {
        // Moving between the carousel controls keeps the focus inside.
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between gap-3 ps-6 pe-4">
        <h2 className="m-0 truncate text-body-sm font-normal">{names[index]}</h2>
        <span className="inline-flex h-6 items-center gap-1.5 rounded-pill border border-line-strong px-2.5 text-[11px] text-secondary">
          <b className="font-medium text-primary">
            <Ltr mono={false}>{`${String(index + 1)}/${String(images.length)}`}</Ltr>
          </b>
        </span>
      </header>
      <div className="relative grow" aria-live={paused || reduced ? "polite" : "off"}>
        {images.map((src, at) => (
          <img
            key={src}
            src={src}
            alt={at === index ? (names[at] ?? "") : ""}
            aria-hidden={at === index ? undefined : true}
            draggable={false}
            className={cx(
              "absolute inset-0 m-auto h-[86%] max-h-[440px] w-[86%] object-contain transition-[opacity,scale,translate] duration-[700ms] ease-standard select-none",
              at === index ? "w-float opacity-100" : "scale-95 opacity-0",
            )}
          />
        ))}
        <button
          type="button"
          aria-label={t`Previous render`}
          onClick={() => {
            step(-1);
          }}
          className="absolute inset-s-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-pill border border-line-strong text-primary transition-[border-color,background-color,scale] hover:border-line-hover-strong hover:bg-hover active:scale-95"
        >
          <ArrowStartIcon size={16} />
        </button>
        <button
          type="button"
          aria-label={t`Next render`}
          onClick={() => {
            step(1);
          }}
          className="absolute inset-e-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-pill border border-line-strong text-primary transition-[border-color,background-color,scale] hover:border-line-hover-strong hover:bg-hover active:scale-95"
        >
          <ArrowEndIcon size={16} />
        </button>
      </div>
      {/* The dots follow the reading direction, like the arrows above them. Each has a 24 px tall
          target; on a touch screen they only show the position and the arrows move. */}
      <div className="flex justify-center gap-1.5 pb-5">
        {images.map((src, at) => (
          <button
            key={src}
            type="button"
            aria-label={t`Show render ${String(at + 1)}`}
            aria-current={at === index ? "true" : undefined}
            data-hit="own"
            onClick={() => {
              setIndex(at);
            }}
            className={cx(
              "relative h-1.5 rounded-pill transition-[width,background-color] duration-[var(--motion-duration-slow)] ease-standard after:absolute after:-inset-x-[3px] after:-inset-y-[9px] after:content-[''] pointer-coarse:pointer-events-none",
              at === index ? "w-5 bg-inverse" : "w-1.5 bg-faint hover:bg-icon-muted",
            )}
          />
        ))}
      </div>
    </section>
  );
}

/** What a signed-in user can do in the web app today: a KPI-style strip (the demo's `.kpis`). */
function Today() {
  const { t } = useLingui();
  const items = [
    { label: t`Sign-in`, value: t`Two-step`, detail: t`Password and authenticator app` },
    { label: t`Etsy shops`, value: t`Connect`, detail: t`Connect and reconnect your shops` },
    { label: t`Team`, value: t`Invite`, detail: t`Members, roles and invitation links` },
    { label: t`Languages`, value: "2", detail: t`Hebrew and English, right to left` },
  ];
  return (
    <section id="today" aria-labelledby="today-title" className={cx(PANEL, "w-rise scroll-mt-24")}>
      <header className="flex h-14 items-center gap-2.5 ps-6 pe-4">
        <h2 id="today-title" className="m-0 text-body-sm font-normal">
          <Trans>What works today</Trans>
        </h2>
        <span className="text-caption font-light text-muted">
          <Trans>in the web app</Trans>
        </span>
      </header>
      {/* On phones the strip scrolls sideways, so it takes keyboard focus to scroll it. */}
      <ul
        tabIndex={0}
        aria-labelledby="today-title"
        className="m-0 flex list-none snap-x outline-offset-[-2px] overflow-x-auto border-t border-line p-0 [scrollbar-width:none] md:grid md:grid-cols-4"
      >
        {items.map((item, index) => (
          <li
            key={item.label}
            className={cx(
              "w-rise flex min-w-[200px] shrink-0 snap-start flex-col items-center gap-0.5 px-6 pt-4 pb-5 text-center",
              index > 0 && "border-s border-line",
            )}
            style={{ animationDelay: `${String(120 + index * 70)}ms` }}
          >
            <span className="flex items-center gap-1.5 text-caption font-light text-muted">
              <span aria-hidden="true" className="w-led size-1.5 rounded-pill bg-success" />
              {item.label}
            </span>
            <span className="text-number-lg leading-[1.3] font-light tracking-[-0.01em]">
              {item.value}
            </span>
            <span className="text-caption text-secondary">{item.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The planned office, honestly labelled: renders and one line each, with "Coming". */
function Planned() {
  const { t } = useLingui();
  const { tweaks } = useTweaks();
  const d4 = tweaks.palette === "d4";
  const cards = [
    {
      image: hero11,
      title: t`The AI office`,
      body: t`Sixteen AI employees in seven departments, working under your policies.`,
    },
    {
      image: hero10,
      title: t`Orders and shipping`,
      body: t`Every order checked against the marketplace, with tracking that keeps up.`,
    },
    {
      image: d4 ? hero7 : hero2,
      title: t`Listings and products`,
      body: t`Titles, photos and claims audited, fixed as drafts you approve.`,
    },
  ];
  return (
    <section
      id="planned"
      aria-labelledby="planned-title"
      // Phones scroll the cards sideways: focusable, so the keyboard can scroll them too.
      tabIndex={0}
      className="-mx-2 flex snap-x scroll-px-2 gap-2 overflow-x-auto px-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0"
    >
      <h2 id="planned-title" className="sr-only">
        <Trans>What is coming</Trans>
      </h2>
      {cards.map((card, index) => (
        <article
          key={card.title}
          className={cx(PANEL, "w-rise w-lift group shrink-0 snap-start max-md:w-[82%]")}
          style={{ animationDelay: `${String(index * 80)}ms` }}
        >
          <header className="flex h-14 items-center justify-between gap-3 ps-6 pe-4">
            <h3 className="m-0 text-body-sm font-normal">{card.title}</h3>
            <span className="inline-flex h-6 items-center gap-1.5 rounded-pill border border-line-strong px-2.5 text-caption text-secondary">
              <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent-mark" />
              <Trans>Coming</Trans>
            </span>
          </header>
          <div className="relative h-[220px] overflow-hidden" aria-hidden="true">
            <img
              src={card.image}
              alt=""
              draggable={false}
              className="absolute inset-0 m-auto h-[88%] w-[88%] object-contain transition-[scale,rotate] duration-[600ms] ease-standard select-none group-hover:scale-[1.04] group-hover:-rotate-1"
            />
          </div>
          <p className="m-0 px-6 pb-6 text-body-sm text-secondary">{card.body}</p>
        </article>
      ))}
    </section>
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
    <section id="how" aria-labelledby="how-title" className={cx(PANEL, "w-rise scroll-mt-24")}>
      <header className="flex h-14 items-center gap-2.5 ps-6 pe-4">
        <h2 id="how-title" className="m-0 text-body-sm font-normal">
          <Trans>How it works</Trans>
        </h2>
      </header>
      <ol className="m-0 grid list-none gap-0 border-t border-line p-0 md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={cx(
              "w-rise relative flex flex-col gap-2 px-6 pt-5 pb-6",
              index > 0 && "max-md:border-t md:border-s border-line",
            )}
            style={{ animationDelay: `${String(index * 90)}ms` }}
          >
            <span className="text-number-lg leading-none font-light text-muted tabular">
              <Ltr mono={false}>{`0${String(index + 1)}`}</Ltr>
            </span>
            <h3 className="m-0 text-title-sm font-normal">{step.title}</h3>
            <p className="m-0 text-body-sm text-secondary">{step.body}</p>
            <span aria-hidden="true" className="mt-2 flex gap-1" dir="ltr">
              {Array.from({ length: 12 }, (_, dot) => (
                <i
                  key={dot}
                  className={cx(
                    "w-dot size-1.5 rounded-pill",
                    dot < (index + 1) * 4 ? "bg-inverse" : "bg-faint",
                  )}
                  style={{ animationDelay: `${String(300 + index * 200 + dot * 40)}ms` }}
                />
              ))}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Apps() {
  return (
    <section
      id="apps"
      aria-labelledby="apps-title"
      className="grid scroll-mt-24 gap-2 md:grid-cols-3"
    >
      <h2 id="apps-title" className="sr-only">
        <Trans>Apps</Trans>
      </h2>
      <AppCard
        name={<Trans>Web</Trans>}
        status={<Trans>Ready today</Trans>}
        ready
        detail={<Trans>Any browser, nothing to install.</Trans>}
      >
        <Link to="/sign-in" className={cx(PILL_PRIMARY, "w-full")}>
          <Trans>Open the web app</Trans>
          <ArrowEndIcon size={14} />
        </Link>
      </AppCard>
      <AppCard
        name={<Trans>Windows</Trans>}
        status={<Trans>Coming</Trans>}
        detail={<Trans>A native desktop app with the same features.</Trans>}
      />
      <AppCard
        name={<Trans>Android</Trans>}
        status={<Trans>Coming</Trans>}
        detail={<Trans>An app for your phone with the same features.</Trans>}
      />
    </section>
  );
}

function AppCard({
  name,
  status,
  ready = false,
  detail,
  children,
}: {
  name: ReactNode;
  status: ReactNode;
  ready?: boolean;
  detail: ReactNode;
  children?: ReactNode;
}) {
  return (
    <article className={cx(PANEL, "w-rise w-lift gap-4 p-6")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-[32px] leading-tight font-light tracking-[-0.01em]">{name}</h3>
        <span
          className={cx(
            "inline-flex h-6 items-center gap-1.5 rounded-pill px-2.5 text-caption",
            ready ? "bg-inverse text-on-inverse" : "border border-line-strong text-secondary",
          )}
        >
          <span
            aria-hidden="true"
            className={cx("size-1.5 rounded-pill", ready ? "w-led bg-success" : "bg-accent-mark")}
          />
          {status}
        </span>
      </div>
      <p className="m-0 text-body-sm text-secondary">{detail}</p>
      <div className="mt-auto">
        {children ?? (
          <span className="inline-flex h-12 w-full items-center justify-center rounded-pill border border-dashed border-line-strong text-body-sm text-muted">
            <Trans>In development</Trans>
          </span>
        )}
      </div>
    </article>
  );
}
