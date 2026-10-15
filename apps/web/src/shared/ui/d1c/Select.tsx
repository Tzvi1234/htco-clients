import type { ReactNode } from "react";
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";

import { cx } from "../../lib/cx.ts";
import { ChevronIcon } from "../icons.tsx";

/**
 * The demo's settings field (`.sec` over a wide 40 px pill with a chevron) as a real select: the
 * menu opens below it on the menu surface (`.menu`).
 */
export function PillSelect<K extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: K;
  onChange: (value: K) => void;
  options: readonly { id: K; label: ReactNode; lang?: string; textValue: string }[];
}) {
  return (
    <Select
      value={value}
      onChange={(key) => {
        const option = options.find(({ id }) => id === key);
        if (option !== undefined) onChange(option.id);
      }}
      className="flex flex-col"
    >
      <Label className="mb-2 text-caption font-light text-muted">{label}</Label>
      <Button
        className={cx(
          "flex h-10 w-full cursor-default items-center justify-between gap-2 rounded-pill border border-line-strong px-3.5 text-body-sm outline-none",
          "transition-[border-color,scale] duration-[var(--motion-duration-fast)] data-[hovered]:border-line-hover data-[pressed]:scale-[0.99]",
          "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus",
        )}
      >
        <SelectValue className="truncate" />
        <ChevronIcon
          size={10}
          className="shrink-0 transition-transform duration-[var(--motion-duration-base)] in-aria-expanded:rotate-180"
        />
      </Button>
      <Popover
        offset={6}
        className="w-[var(--trigger-width)] rounded-card border border-line bg-menu p-2 shadow-popover outline-none backdrop-blur-[22px] data-[entering]:animate-pop-in"
      >
        <ListBox className="flex flex-col gap-0.5 outline-none">
          {options.map((option) => (
            <ListBoxItem
              key={option.id}
              id={option.id}
              textValue={option.textValue}
              className="flex h-9 cursor-default items-center gap-2 rounded-[12px] px-3 text-body-sm outline-none data-[focused]:bg-panel data-[selected]:bg-panel"
            >
              {({ isSelected }) => (
                <>
                  <span lang={option.lang} className="flex-1">
                    {option.label}
                  </span>
                  {isSelected ? (
                    <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent-mark" />
                  ) : null}
                </>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}

/** A demo field that only shows its value (a planned setting): the same pill, inert. */
export function PillValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="mb-2 text-caption font-light text-muted">{label}</div>
      <span className="flex h-10 w-full items-center justify-between gap-2 rounded-pill border border-line-strong px-3.5 text-body-sm">
        <span className="truncate">{value}</span>
        <ChevronIcon size={10} className="shrink-0" />
      </span>
    </div>
  );
}
