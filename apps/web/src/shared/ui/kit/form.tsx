import { useLingui } from "@lingui/react/macro";
import { useState, type ReactNode, type Ref } from "react";
import {
  Button,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  RadioButton,
  RadioField,
  RadioGroup,
  Select,
  SelectValue,
  TextField,
  type TextFieldProps,
} from "react-aria-components";

import { cx } from "../../lib/cx.ts";
import { ChevronIcon } from "../icons.tsx";

// The demo's form parts: the round field (`.fld` + `.inp`), choice chips (its `.tab` pills) and
// the settings select (`.sec` over a wide pill with a chevron).

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
        dir={ltr ? "ltr" : "auto"}
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

/**
 * The demo's six code boxes (`.codes`: 52×60, radius 16, 26 px light digits, left-to-right) for
 * an authenticator code: sign-in, authenticator setup, password reset and the shops' step-up.
 * One real input, labelled and marked `one-time-code`, lies over the boxes, so typing (each digit
 * advances), pasting, autofill, backspace and screen readers work as with any field; the boxes
 * only draw its digits and where the next one goes.
 */
export function CodeBoxes({
  value,
  onChange,
  autoFocus = false,
  invalid = false,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  /** The last code was refused: the boxes shake once and turn red. */
  invalid?: boolean;
  label?: string;
}) {
  const { t } = useLingui();
  const [focused, setFocused] = useState(autoFocus);
  const digits = value.split("");
  return (
    <div dir="ltr" className="relative">
      {/* Only the boxes remount to shake again; the input keeps its focus. */}
      <div
        key={invalid ? "refused" : "ok"}
        className={cx("flex justify-center gap-2", invalid && "k-code-shake")}
      >
        {Array.from({ length: 6 }, (_, index) => {
          const digit = digits[index];
          const next = focused && index === Math.min(digits.length, 5) && digits.length < 6;
          return (
            <span
              key={index}
              aria-hidden="true"
              className={cx(
                "grid h-[60px] w-[clamp(40px,12vw,52px)] place-items-center rounded-card border text-[26px] font-light tabular transition-[border-color,box-shadow,background-color] duration-[var(--motion-duration-fast)] ease-standard",
                invalid
                  ? "border-danger"
                  : next
                    ? "border-primary shadow-[0_0_0_1px_var(--text-primary)]"
                    : digit === undefined
                      ? "border-line-strong"
                      : "border-line-hover-strong bg-hover",
              )}
            >
              {digit === undefined ? (
                next ? (
                  <i className="k-code-caret block h-7 w-px bg-primary" />
                ) : null
              ) : (
                <span key={digit + String(index)} className="k-code-digit">
                  {digit}
                </span>
              )}
            </span>
          );
        })}
      </div>
      <input
        aria-label={label ?? t`Code from the app`}
        aria-invalid={invalid || undefined}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        required
        autoFocus={autoFocus}
        value={value}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        onChange={(event) => {
          onChange(event.target.value.replace(/\D/g, "").slice(0, 6));
        }}
        className="absolute inset-0 h-full w-full cursor-default bg-transparent text-[16px] text-transparent caret-transparent opacity-0 outline-none selection:bg-transparent"
      />
    </div>
  );
}
