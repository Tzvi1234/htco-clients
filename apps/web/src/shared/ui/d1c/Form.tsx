import type { ReactNode, Ref } from "react";
import {
  Input,
  Label,
  RadioButton,
  RadioField,
  RadioGroup,
  TextField,
  type TextFieldProps,
} from "react-aria-components";

import { cx } from "../../lib/cx.ts";

/**
 * The demo's field (`.fld` + `.inp`): a quiet 12 px label over a 48 px round input that takes an
 * ink edge when focused. `ltr` keeps emails, links and codes left-to-right.
 */
export function PillField({
  label,
  ltr = false,
  mono = false,
  placeholder,
  inputRef,
  className,
  ...props
}: Omit<TextFieldProps, "className" | "children"> & {
  label: string;
  ltr?: boolean;
  mono?: boolean;
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
}) {
  return (
    <TextField {...props} className={cx("flex flex-col gap-1.5", className)}>
      <Label className="text-caption font-light text-muted">{label}</Label>
      <Input
        ref={inputRef}
        dir={ltr ? "ltr" : undefined}
        {...(placeholder === undefined ? {} : { placeholder })}
        className={cx(
          "h-12 w-full min-w-0 rounded-pill border border-line-strong bg-transparent px-5 text-body text-primary outline-none placeholder:text-muted",
          "transition-[border-color] duration-[var(--motion-duration-fast)]",
          "data-[hovered]:border-line-hover data-[focused]:border-inverse data-[invalid]:border-danger",
          "read-only:bg-raised",
          ltr && "text-start",
          mono && "font-mono text-body-sm text-ellipsis",
        )}
      />
    </TextField>
  );
}

/** A choice chip (the demo's `.tab` pill): ink when chosen. */
export const CHOICE_CHIP = cx(
  "flex h-8 cursor-default items-center gap-1.5 rounded-pill border border-line-strong px-3 text-caption whitespace-nowrap outline-none",
  "transition-[background-color,border-color,color,scale] duration-[var(--motion-duration-fast)] ease-standard",
  "data-[hovered]:border-line-hover data-[pressed]:scale-95",
  "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus",
  "data-[selected]:border-inverse data-[selected]:bg-inverse data-[selected]:text-on-inverse",
  "data-[disabled]:opacity-45",
);

/** One choice among chips: a radio group with a quiet label. */
export function ChoiceChips<K extends string>({
  label,
  value,
  onChange,
  options,
  isDisabled = false,
  className,
}: {
  label: string;
  value: K | null;
  onChange: (value: K) => void;
  options: readonly { id: K; label: ReactNode; ltr?: boolean }[];
  isDisabled?: boolean;
  className?: string;
}) {
  return (
    <RadioGroup
      value={value}
      onChange={(next) => {
        const option = options.find(({ id }) => id === next);
        if (option !== undefined) onChange(option.id);
      }}
      orientation="horizontal"
      isDisabled={isDisabled}
      className={cx("flex flex-col gap-2", className)}
    >
      <Label className="text-caption font-light text-muted">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <RadioField key={option.id} value={option.id}>
            <RadioButton className={CHOICE_CHIP}>
              {option.ltr === true ? (
                <span dir="ltr" className="font-mono">
                  {option.label}
                </span>
              ) : (
                option.label
              )}
            </RadioButton>
          </RadioField>
        ))}
      </div>
    </RadioGroup>
  );
}
