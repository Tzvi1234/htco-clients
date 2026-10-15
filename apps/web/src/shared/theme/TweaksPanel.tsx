import { useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";
import { Button, Dialog, DialogTrigger, Heading, Popover } from "react-aria-components";

import { useTweaks } from "./ThemeProvider.tsx";
import { changedTweaks, levelsApply, type Level, type Palette } from "./tweaks.ts";
import type { ThemePreference } from "./theme.ts";
import { cx } from "../lib/cx.ts";
import { MoonIcon, SunIcon, SystemThemeIcon, TweaksIcon } from "../ui/icons.tsx";
import { LevelDots, Segmented } from "../ui/Segmented.tsx";

function Row({
  title,
  caption,
  disabled = false,
  wide = false,
  children,
}: {
  title: string;
  caption: string;
  disabled?: boolean;
  /** The control takes its own line under the title. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "flex gap-2.5 border-t border-line px-0.5 py-2 transition-opacity duration-[var(--motion-duration-fast)]",
        wide ? "flex-col" : "items-center justify-between",
        disabled && "opacity-45",
      )}
    >
      <div className="min-w-0">
        <p className="m-0 text-body-sm leading-tight">{title}</p>
        <p className="m-0 text-[11px] leading-snug font-light text-muted">{caption}</p>
      </div>
      {children}
    </div>
  );
}

/**
 * The design tweaks (client ADR-0008): theme, palette and ground, element vs ground contrast,
 * frosted glass and element borders. One preference for every interface on this origin; the
 * landing page and later the native apps show the same panel. Contrast and borders come from
 * the palette in Design 4, so their rows rest while it is chosen.
 */
export function TweaksPanel({ className }: { className?: string }) {
  const { t } = useLingui();
  const { tweaks, setTweak, resetTweaks } = useTweaks();
  const levels: Record<Level, string> = {
    1: t`Normal`,
    2: t`Different`,
    3: t`Very different`,
  };
  const levelOptions = ([1, 2, 3] as const).map((level) => ({
    id: String(level) as `${Level}`,
    label: levels[level],
    content: <LevelDots level={level} />,
  }));
  const palettes: Record<Palette, { short: string; caption: string }> = {
    sbb: { short: "SBB", caption: t`Gray and orange` },
    d4: { short: t`Design 4`, caption: t`Cream, lilac, orchid and lemon` },
    plain: { short: t`Plain ground`, caption: t`Gray, with no blooms behind the glass` },
  };
  const themes: Record<ThemePreference, string> = {
    system: t`Match the system`,
    light: t`Light`,
    dark: t`Dark`,
  };
  const fixed = !levelsApply(tweaks.palette);
  const level = (name: "contrast" | "glass" | "borders", title: string, disabled = false) => (
    <Row title={title} caption={levels[tweaks[name]]} disabled={disabled}>
      <Segmented
        size="sm"
        label={title}
        value={String(tweaks[name]) as `${Level}`}
        onChange={(value) => {
          setTweak(name, Number(value) as Level);
        }}
        options={levelOptions}
        isDisabled={disabled}
      />
    </Row>
  );

  return (
    <div className={cx("flex flex-col", className)}>
      <div className="flex items-center justify-between px-0.5 pb-2.5">
        <Heading slot="title" className="m-0 text-caption font-normal text-muted">
          {t`Design tweaks`}
        </Heading>
        <Button
          onPress={resetTweaks}
          className="cursor-default rounded-pill px-1.5 text-caption text-muted underline underline-offset-[3px] outline-none data-[hovered]:text-primary data-[focus-visible]:outline-2 data-[focus-visible]:outline-focus"
        >
          {t`Reset`}
        </Button>
      </div>
      <Row title={t`Theme`} caption={themes[tweaks.theme]}>
        <Segmented
          size="sm"
          label={t`Theme`}
          value={tweaks.theme}
          onChange={(value) => {
            setTweak("theme", value);
          }}
          options={[
            { id: "system", label: themes.system, content: <SystemThemeIcon size={12} /> },
            { id: "light", label: themes.light, content: <SunIcon size={12} /> },
            { id: "dark", label: themes.dark, content: <MoonIcon size={12} /> },
          ]}
        />
      </Row>
      {level("contrast", t`Element vs. ground contrast`, fixed)}
      {level("glass", t`Frosted glass`)}
      {level("borders", t`Element borders`, fixed)}
      <Row title={t`Palette and ground`} caption={palettes[tweaks.palette].caption} wide>
        <Segmented
          size="sm"
          label={t`Palette and ground`}
          value={tweaks.palette}
          onChange={(value) => {
            setTweak("palette", value);
          }}
          options={(["sbb", "d4", "plain"] as const).map((id) => ({
            id,
            label: palettes[id].short,
          }))}
          className="w-full [&>*]:flex-1 [&>*]:text-caption"
        />
      </Row>
      {fixed ? (
        <p className="m-0 px-0.5 pt-0.5 pb-1 text-[11px] leading-snug font-light text-muted">
          {t`With the Design 4 palette, contrast and borders come from the palette; glass still applies.`}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The top bar's tweaks control: a circle button, with a badge counting the tweaks away from
 * their defaults, that opens the tweaks panel.
 */
export function TweaksButton({ className }: { className?: string }) {
  const { t } = useLingui();
  const { tweaks } = useTweaks();
  const changed = changedTweaks(tweaks);
  return (
    <DialogTrigger>
      <Button
        aria-label={t`Design tweaks`}
        className={cx(
          "relative inline-flex size-10 shrink-0 cursor-default items-center justify-center rounded-pill border border-line-strong text-primary outline-none",
          "transition-[border-color,background-color,scale] duration-[var(--motion-duration-fast)] ease-standard",
          "data-[hovered]:border-line-hover data-[pressed]:scale-95",
          "aria-expanded:border-inverse aria-expanded:bg-inverse aria-expanded:text-on-inverse",
          "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus",
          className,
        )}
      >
        <TweaksIcon />
        {changed > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -end-[3px] -top-[3px] grid h-[18px] min-w-[18px] place-items-center rounded-pill border-2 border-ground bg-inverse px-[5px] text-[11px] font-medium text-on-inverse"
          >
            {changed}
          </span>
        ) : null}
      </Button>
      <Popover
        placement="bottom end"
        offset={8}
        className="w-[304px] max-w-[calc(100vw-32px)] rounded-[20px] border border-edge bg-menu px-3.5 pt-3.5 pb-3 text-primary shadow-popover outline-none backdrop-blur-[22px] backdrop-saturate-[1.4] data-[entering]:animate-pop-in"
      >
        <Dialog className="outline-none">
          <TweaksPanel />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
