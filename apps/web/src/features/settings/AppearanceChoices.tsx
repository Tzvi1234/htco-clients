import { useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";
import { Label, RadioButton, RadioField, RadioGroup, Text } from "react-aria-components";

import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { cx } from "../../shared/lib/cx.ts";
import { useSystemTheme, useTweaks } from "../../shared/theme/ThemeProvider.tsx";
import type { ThemePreference } from "../../shared/theme/theme.ts";
import type { Palette } from "../../shared/theme/tweaks.ts";

/**
 * One choice of an appearance setting: a card with a small picture of what it gives, its name
 * and a line under it. The chosen card carries the ink outline and the orange check (orange is
 * the selection colour, round 3); a press gives under the finger.
 */
function Choice({
  value,
  label,
  line,
  lang,
  picture,
}: {
  value: string;
  label: string;
  line?: ReactNode;
  lang?: string;
  picture: ReactNode;
}) {
  return (
    <RadioField value={value} className="flex min-w-0 flex-1">
      <RadioButton
        className={cx(
          "group/choice relative flex w-full min-w-0 flex-1 cursor-default flex-col gap-2.5 rounded-card border border-line-strong bg-raised p-2 pb-3 outline-none",
          "transition-[border-color,box-shadow,scale,background-color] duration-[var(--motion-duration-fast)] ease-standard",
          "data-[hovered]:border-line-hover data-[pressed]:scale-[0.98]",
          "data-[selected]:border-inverse data-[selected]:shadow-[inset_0_0_0_1px_var(--inverse-bg)]",
        )}
      >
        {({ isSelected }) => (
          <>
            <span
              aria-hidden="true"
              className="relative block h-16 overflow-hidden rounded-[11px] border border-line"
            >
              {picture}
            </span>
            <span className="min-w-0 px-1">
              <span lang={lang} className="block text-body">
                {label}
              </span>
              {line === undefined ? null : (
                <span className="block text-caption text-pretty text-secondary">{line}</span>
              )}
            </span>
            {/* The check sits on the picture's corner, so the label keeps the card's width. */}
            <span
              aria-hidden="true"
              className={cx(
                "absolute top-3.5 inset-e-3.5 grid size-5 place-items-center rounded-pill border shadow-popover transition-[background-color,border-color,scale,opacity] duration-[var(--motion-duration-base)] ease-spring",
                isSelected
                  ? "scale-100 border-tertiary bg-tertiary text-on-tertiary opacity-100"
                  : "scale-75 border-transparent opacity-0",
              )}
            >
              {isSelected ? (
                <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 6.2 5 8.6l4.5-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
          </>
        )}
      </RadioButton>
    </RadioField>
  );
}

/** A setting: its name and a line saying what it changes, over its choices. */
function Setting<K extends string>({
  label,
  description,
  value,
  onChange,
  children,
}: {
  label: string;
  description: string;
  value: K;
  onChange: (value: K) => void;
  children: ReactNode;
}) {
  return (
    <RadioGroup
      value={value}
      onChange={(next) => {
        onChange(next as K);
      }}
      orientation="horizontal"
      className="flex min-w-0 flex-col gap-3"
    >
      <div className="flex flex-col gap-0.5">
        <Label className="text-body font-normal">{label}</Label>
        <Text slot="description" className="text-caption text-secondary">
          {description}
        </Text>
      </div>
      <div className="flex gap-2">{children}</div>
    </RadioGroup>
  );
}

/** A miniature window in the given colours: the ground, a panel and two lines of ink. */
function Window({ ground, panel, ink }: { ground: string; panel: string; ink: string }) {
  return (
    <span className="absolute inset-0 flex gap-1.5 p-2" style={{ backgroundColor: ground }}>
      <span className="w-1/4 rounded-[6px]" style={{ backgroundColor: panel }} />
      <span
        className="flex flex-1 flex-col gap-1.5 rounded-[6px] p-2"
        style={{ backgroundColor: panel }}
      >
        <span className="h-1.5 w-2/3 rounded-pill" style={{ backgroundColor: ink }} />
        <span className="h-1.5 w-1/3 rounded-pill opacity-40" style={{ backgroundColor: ink }} />
        <span className="mt-auto size-2 rounded-pill bg-[var(--swatch-orange)]" />
      </span>
    </span>
  );
}

const LIGHT = {
  ground: "var(--swatch-light-ground)",
  panel: "var(--swatch-light-panel)",
  ink: "var(--swatch-light-ink)",
};
const DARK = {
  ground: "var(--swatch-dark-ground)",
  panel: "var(--swatch-dark-panel)",
  ink: "var(--swatch-dark-ink)",
};

/**
 * The three personal settings (round 3), each remembered on this device and shared with the
 * landing page: the theme (System follows the device's light or dark setting as it changes),
 * the palette (gray, or cream; both with the logo's orange) and the language.
 */
export function AppearanceChoices() {
  const { t } = useLingui();
  const { tweaks, setTweak } = useTweaks();
  const { locale, setLocale } = useLocale();
  const system = useSystemTheme();
  return (
    <div className="grid gap-x-8 gap-y-7 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)]">
      <Setting<ThemePreference>
        label={t`Theme`}
        description={t`System follows your device, also when it changes.`}
        value={tweaks.theme}
        onChange={(theme) => {
          setTweak("theme", theme);
        }}
      >
        <Choice
          value="system"
          label={t`System`}
          line={system === "dark" ? t`Now dark` : t`Now light`}
          picture={
            <>
              <Window {...LIGHT} />
              <span className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">
                <Window {...DARK} />
              </span>
            </>
          }
        />
        <Choice value="light" label={t`Light`} picture={<Window {...LIGHT} />} />
        <Choice value="dark" label={t`Dark`} picture={<Window {...DARK} />} />
      </Setting>
      <Setting<Palette>
        label={t`Palette`}
        description={t`The ground behind your panels.`}
        value={tweaks.palette}
        onChange={(palette) => {
          setTweak("palette", palette);
        }}
      >
        <Choice
          value="sbb"
          label={t`Gray`}
          line={t`Cool and neutral`}
          picture={
            <Window
              ground="var(--swatch-gray-ground)"
              panel="var(--swatch-gray-panel)"
              ink="var(--swatch-light-ink)"
            />
          }
        />
        <Choice
          value="d4"
          label={t`Cream`}
          line={t`Warm and soft`}
          picture={
            <Window
              ground="var(--swatch-cream-ground)"
              panel="var(--swatch-cream-panel)"
              ink="var(--swatch-light-ink)"
            />
          }
        />
      </Setting>
      <Setting<Locale>
        label={t`Language`}
        description={t`The whole app, and the direction it reads in.`}
        value={locale}
        onChange={setLocale}
      >
        <Choice
          value="he"
          label="עברית"
          lang="he"
          line={t`Right to left`}
          picture={<Glyph lang="he">אב</Glyph>}
        />
        <Choice
          value="en"
          label="English"
          lang="en"
          line={t`Left to right`}
          picture={<Glyph lang="en">Aa</Glyph>}
        />
      </Setting>
    </div>
  );
}

function Glyph({ lang, children }: { lang: string; children: string }) {
  return (
    <span
      lang={lang}
      className="absolute inset-0 grid place-items-center bg-panel font-display text-title font-light text-primary"
    >
      {children}
    </span>
  );
}
