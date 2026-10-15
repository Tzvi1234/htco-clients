import { Trans, useLingui } from "@lingui/react/macro";
import "./auth.css";
import type { ReactNode } from "react";

import office from "../../assets/hero/hero11.webp";
import officeD4 from "../../assets/hero/hero5.webp";
import parcel from "../../assets/hero/hero10.webp";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { useTweaks } from "../../shared/theme/ThemeProvider.tsx";
import { Ltr } from "../../shared/ui/Ltr.tsx";
import { DemoTag } from "../../shared/ui/kit/index.ts";
import { Logo } from "../../shared/ui/Logo.tsx";
import { Segmented } from "../../shared/ui/Segmented.tsx";

/**
 * The sign-in screens in Design 1C (the demo's `loginHTML()`): two floating panels on the ground.
 * The form panel sits on the physical left and the office render on the right in both languages
 * (the owner's choice), so the grid itself is left-to-right and each panel keeps the page's
 * direction inside. The render is a large crop that bleeds off the panel's outer edge, slightly
 * turned; phones show the form panel alone.
 */
export function AuthLayout({
  eyebrow,
  title,
  description,
  step,
  art = "office",
  alert = false,
  children,
}: {
  /** The quiet line above the title ("Welcome back", "Step 2 of 2"). */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** The sign-in steps: the dots under the form show which one this is. */
  step?: 1 | 2;
  /** What the right panel shows: the office render, or the parcel (pages that lost their way). */
  art?: "office" | "parcel";
  /** The whole message is an alert (error and not-found pages), title included. */
  alert?: boolean;
  children: ReactNode;
}) {
  const { locale } = useLocale();
  const dir = locale === "he" ? "rtl" : "ltr";
  return (
    <div
      dir="ltr"
      className="grid min-h-dvh gap-2 p-2 md:h-dvh md:min-h-[700px] md:grid-cols-[minmax(400px,480px)_minmax(0,1fr)]"
    >
      <div dir={dir} className="contents">
        <main className="glass relative flex min-h-[calc(100dvh-16px)] min-w-0 flex-col overflow-hidden rounded-panel border border-edge bg-panel shadow-panel md:min-h-0">
          <AuthTopBar />
          {step === 1 || alert ? <PhoneArt art={art} /> : null}
          <div className="flex grow flex-col justify-center px-6 pb-10 sm:px-12 sm:pb-12">
            <div
              role={alert ? "alert" : undefined}
              className="mx-auto flex w-full max-w-[384px] animate-enter flex-col gap-6"
            >
              <header className="flex flex-col text-start">
                {eyebrow === undefined ? null : (
                  <p className="m-0 text-caption font-light text-muted">{eyebrow}</p>
                )}
                <h1 className="m-0 text-[34px] leading-[1.25] font-light tracking-[-0.01em] sm:text-display">
                  {title}
                </h1>
                {description === undefined ? null : (
                  <p className="m-0 mt-1.5 text-body-sm text-secondary">{description}</p>
                )}
              </header>
              {children}
            </div>
          </div>
          {step === undefined ? null : <StepDots step={step} />}
        </main>
      </div>
      <div dir={dir} className="contents">
        <AuthArt art={art} />
      </div>
    </div>
  );
}

/**
 * Phones: the office render as a short band under the header, leaving through the outer edge
 * like the wide screen's panel (fewer things, not smaller ones: no caption and no facts).
 */
function PhoneArt({ art }: { art: "office" | "parcel" }) {
  const { tweaks } = useTweaks();
  const src = art === "parcel" ? parcel : tweaks.palette === "d4" ? officeD4 : office;
  return (
    <div
      aria-hidden="true"
      dir="ltr"
      className="relative mb-4 h-[168px] shrink-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_22%,#000_74%,transparent)] md:hidden"
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className={cx(
          "auth-art pointer-events-none absolute top-1/2 max-w-none select-none",
          art === "parcel" ? "end-[-2%] w-[52%]" : "end-[-28%] w-[118%]",
        )}
      />
    </div>
  );
}

/** The form panel's 72 px header: the logo and the language switch. */
function AuthTopBar() {
  const { t } = useLingui();
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex h-[72px] shrink-0 items-center justify-between ps-6 pe-4">
      <Logo height={22} animated />
      <Segmented
        label={t`Language`}
        value={locale}
        onChange={setLocale}
        options={[
          { id: "he", label: "עברית", lang: "he" },
          { id: "en", label: "English", lang: "en" },
        ]}
      />
    </div>
  );
}

/** Two dots under the form: sign-in, then the authenticator code. */
function StepDots({ step }: { step: 1 | 2 }) {
  const { t } = useLingui();
  return (
    <div className="flex justify-center gap-1.5 pb-6">
      <span className="sr-only">{t`Step ${step} of 2`}</span>
      {([1, 2] as const).map((dot) => (
        <span
          key={dot}
          aria-hidden="true"
          className={cx(
            "h-1.5 rounded-pill transition-[width,background-color] duration-[var(--motion-duration-slow)] ease-standard",
            dot === step ? "w-4 bg-inverse" : "w-1.5 bg-faint",
          )}
        />
      ))}
    </div>
  );
}

/** The right panel: "Your office" with its caption, the render bleeding off the outer edge, and the demo's office numbers under it. */
function AuthArt({ art }: { art: "office" | "parcel" }) {
  const { t } = useLingui();
  const { tweaks } = useTweaks();
  const src = art === "parcel" ? parcel : tweaks.palette === "d4" ? officeD4 : office;
  // The demo's four office numbers. The office is planned, not built, so before sign-in they
  // are the demo's own figures: dimmed and labelled "Demo".
  const kpis = [
    { label: t`Running now`, value: "3" },
    { label: t`Waiting for you`, value: "3" },
    { label: t`Orders today`, value: "37" },
    { label: t`Uptime`, value: "99.8%" },
  ];
  return (
    <aside
      aria-label={art === "office" ? t`Your office` : undefined}
      aria-hidden={art === "office" ? undefined : true}
      className="glass relative hidden min-h-0 min-w-0 flex-col overflow-hidden rounded-panel border border-edge bg-panel shadow-panel md:flex"
    >
      {/* Separate isolated pieces, so the caption reads in order in both directions. */}
      <header className="relative z-10 flex h-14 shrink-0 items-center gap-2.5 ps-6 pe-2">
        {art === "office" ? (
          <>
            <h2 className="m-0 text-body-sm font-normal whitespace-nowrap">
              <Trans>Your office</Trans>
            </h2>
            <p className="m-0 flex min-w-0 items-center gap-1.5 truncate text-caption font-light text-muted">
              <bdi>{t`16 AI employees`}</bdi>
              <span aria-hidden="true">·</span>
              <bdi>{t`7 departments`}</bdi>
            </p>
          </>
        ) : null}
      </header>
      <div dir="ltr" className="relative min-h-0 grow" aria-hidden="true">
        {/* Left-to-right on purpose: the render always leaves through the screen's right edge. */}
        <img
          src={src}
          alt=""
          draggable={false}
          className={cx(
            "auth-art pointer-events-none absolute max-w-none select-none",
            art === "parcel" ? "top-1/2 end-[-6%] w-[78%]" : "top-[54%] end-[-22%] w-[116%]",
          )}
        />
      </div>
      {art === "office" ? (
        <div className="relative z-10 shrink-0 border-t border-line">
          <DemoTag className="absolute -top-2.5 start-6 z-10" />
          <dl className="m-0 grid grid-cols-4 opacity-55 saturate-50">
            {kpis.map((kpi, index) => (
              <div
                key={kpi.label}
                className={cx(
                  "auth-fact flex flex-col-reverse items-center px-3 pt-4 pb-5 text-center",
                  index > 0 && "border-s border-line",
                )}
                style={{ animationDelay: `${String(240 + index * 60)}ms` }}
              >
                <dd className="m-0 text-number-lg font-light tracking-[-0.01em] tabular">
                  <Ltr mono={false}>{kpi.value}</Ltr>
                </dd>
                <dt className="truncate text-caption font-light text-muted">{kpi.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </aside>
  );
}

/** A Design 1C field: a 12 px quiet label over a 48 px pill (the demo's `.fld` and `.inp`). */
export const FIELD_LABEL = "text-caption font-light text-muted";
export const FIELD_GROUP = cx(
  "flex h-12 items-center gap-2 rounded-pill border border-line-strong bg-transparent ps-5 pe-2",
  "transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-standard",
  "data-[hovered]:border-line-hover-strong",
  "data-[focus-within]:border-primary data-[focus-within]:shadow-[0_0_0_1px_var(--text-primary)]",
  "group-data-[invalid]:border-danger",
);

/** The demo's `.lnk`: a small underlined link. */
export const AUTH_LINK =
  "cursor-default rounded-[4px] text-caption text-primary underline decoration-1 underline-offset-[3px] outline-none transition-colors hover:text-secondary data-[hovered]:text-secondary";

/** The full-width 48 px primary button of the sign-in screens. */
export const AUTH_SUBMIT = "h-12 w-full text-body-sm";

export function FormAlert({ message }: { message: string | undefined }) {
  if (message === undefined) return null;
  return (
    <p
      role="alert"
      className="m-0 animate-enter rounded-button border border-danger bg-surface px-3 py-2.5 text-body-sm font-medium text-danger-text"
    >
      {message}
    </p>
  );
}
