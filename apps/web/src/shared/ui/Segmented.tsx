import type { Key, ReactNode } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";

import { cx } from "../lib/cx.ts";

export interface SegmentedOption<K extends string> {
  id: K;
  /** The option's name for screen readers and the tooltip. */
  label: string;
  /** What the option shows; its label when omitted. */
  content?: ReactNode;
  /** Text inside follows this language (for "עברית" and "English"). */
  lang?: string;
}

const SIZES = {
  // The top bar's language switch (Design 1C `.seg`).
  md: { group: "h-8 p-[3px] gap-0.5", item: "h-6 px-2.5 text-caption any-pointer-coarse:min-w-11" },
  // The tweaks panel's level switches (Design 1C `.tws`), each a 24 px target (WCAG 2.5.8).
  // On a touch screen each is 44 px wide (its touch layer only grows up and down; styles.css).
  sm: {
    group: "h-[30px] p-[3px] gap-0.5",
    item: "h-6 min-w-[30px] px-1.5 gap-0.5 any-pointer-coarse:min-w-11",
  },
} as const;

/**
 * A pill of mutually exclusive choices: one is always chosen. A radio group for assistive
 * technology; arrow keys move between the options.
 */
export function Segmented<K extends string>({
  label,
  value,
  onChange,
  options,
  size = "md",
  isDisabled = false,
  className,
}: {
  label: string;
  value: K;
  onChange: (value: K) => void;
  options: readonly SegmentedOption<K>[];
  size?: keyof typeof SIZES;
  isDisabled?: boolean;
  className?: string;
}) {
  const pick = (keys: Set<Key>) => {
    const [first] = [...keys];
    const option = options.find(({ id }) => id === first);
    if (option !== undefined) onChange(option.id);
  };
  return (
    <ToggleButtonGroup
      aria-label={label}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={pick}
      isDisabled={isDisabled}
      className={cx(
        "inline-flex shrink-0 items-center rounded-pill border border-line-strong",
        SIZES[size].group,
        className,
      )}
    >
      {options.map((option) => (
        <ToggleButton
          key={option.id}
          id={option.id}
          {...(option.content === undefined ? {} : { "aria-label": option.label })}
          className={cx(
            "inline-flex cursor-default items-center justify-center rounded-pill whitespace-nowrap outline-none",
            // Glyph options (dots, swatches) are quieter until chosen, as in the design.
            option.content === undefined ? "text-primary" : "text-icon-muted",
            "transition-[background-color,color,scale] duration-[var(--motion-duration-fast)] ease-standard",
            "data-[hovered]:bg-hover data-[pressed]:scale-[0.96]",
            "data-[selected]:bg-inverse data-[selected]:text-on-inverse",
            "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-1 data-[focus-visible]:outline-focus",
            "data-[disabled]:opacity-60",
            SIZES[size].item,
          )}
        >
          {option.content ??
            (option.lang === undefined ? (
              option.label
            ) : (
              <span lang={option.lang}>{option.label}</span>
            ))}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

/** One to three dots: a tweak's level, as in the design's tweaks panel. */
export function LevelDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-0.5">
      {Array.from({ length: level }, (_, index) => (
        <i key={index} className="size-1 rounded-pill bg-current" />
      ))}
    </span>
  );
}
