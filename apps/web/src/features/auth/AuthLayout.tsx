import { useLingui } from "@lingui/react/macro";
import "./auth.css";
import type { ReactNode } from "react";

import office from "../../assets/hero/hero11.webp";
import parcel from "../../assets/hero/hero10.webp";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { Logo } from "../../shared/ui/Logo.tsx";
import { Segmented } from "../../shared/ui/Segmented.tsx";
import { TEXT_LINK } from "../../shared/ui/kit/index.ts";

/**
 * The sign-in screens in Design 1C (the demo's `loginHTML()`): two floating panels on the ground.
 * The form panel sits on the physical left and the office render on the right in both languages
 * (the owner's choice), so the grid itself is left-to-right and each panel keeps the page's
 * direction inside. The render is a large crop that bleeds off the panel's outer edge, slightly
 * turned, and nothing is laid over it (round 3: the demo's caption and office numbers are gone);
 * phones show the form panel alone. Motion (auth.css): the render glides in from the outer edge
 * out of a soft blur, and the form's parts rise one after another.
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
        <main
          // Its own snapshot when one sign-in step leads to the next (styles.css).
          data-vt="screen"
          className="relative flex min-h-[calc(100dvh-16px)] min-w-0 flex-col overflow-hidden rounded-panel border border-edge bg-panel shadow-panel md:min-h-0"
        >
          <AuthTopBar />
          {step === 1 || alert ? <PhoneArt art={art} /> : null}
          <div className="flex grow flex-col justify-center px-6 pb-10 sm:px-12 sm:pb-12">
            <div
              role={alert ? "alert" : undefined}
              className="auth-stagger mx-auto flex w-full max-w-[384px] flex-col gap-6"
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
  // The same render in both palettes: since round 3 both carry the logo's orange.
  const src = art === "parcel" ? parcel : office;
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
          art === "parcel" ? "inset-e-[-2%] w-[52%]" : "inset-e-[-28%] w-[118%]",
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
            "h-1.5 rounded-pill transition-[width,background-color] duration-[var(--motion-duration-expand)] ease-spring",
            dot === step ? "w-4 bg-inverse" : "w-1.5 bg-faint",
          )}
        />
      ))}
    </div>
  );
}

/**
 * The right panel: the office render alone, bleeding off the outer edge. It is a picture of the
 * office to come, so no figures or captions sit on it (the owner's round 3 brief).
 */
function AuthArt({ art }: { art: "office" | "parcel" }) {
  const { t } = useLingui();
  // The same render in both palettes: since round 3 both carry the logo's orange.
  const src = art === "parcel" ? parcel : office;
  return (
    <aside
      aria-label={art === "office" ? t`Your office` : undefined}
      aria-hidden={art === "office" ? undefined : true}
      className="relative hidden min-h-0 min-w-0 flex-col overflow-hidden rounded-panel border border-edge bg-panel shadow-panel md:flex"
    >
      <div dir="ltr" className="relative min-h-0 grow" aria-hidden="true">
        {/* Left-to-right on purpose: the render always leaves through the screen's right edge. */}
        <img
          src={src}
          alt=""
          draggable={false}
          className={cx(
            "auth-art pointer-events-none absolute max-w-none select-none",
            art === "parcel" ? "top-1/2 inset-e-[-6%] w-[78%]" : "top-1/2 inset-e-[-22%] w-[116%]",
          )}
        />
      </div>
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

/** The demo's `.lnk`: a small underlined link; padding gives it a 24 px target without moving it. */
export const AUTH_LINK = cx(TEXT_LINK, "-my-1 inline-block cursor-default");

/** The full-width 48 px primary button of the sign-in screens. */
export const AUTH_SUBMIT = "h-12 w-full text-body-sm";
