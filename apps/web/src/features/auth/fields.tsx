import { useLingui } from "@lingui/react/macro";
import { useState, type ReactNode } from "react";
import {
  Button as AriaButton,
  Group,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { FIELD_GROUP, FIELD_LABEL } from "./AuthLayout.tsx";
import { cx } from "../../shared/lib/cx.ts";

interface AuthFieldProps extends Omit<AriaTextFieldProps, "className" | "children"> {
  label: string;
  description?: string;
  placeholder?: string;
  /** Email addresses and passwords stay left-to-right inside Hebrew pages. */
  ltr?: boolean;
  /** A control at the end of the pill, such as "show password". */
  end?: ReactNode;
}

/** The demo's `.fld`: a quiet 12 px label over a 48 px pill input (React Aria for the ARIA). */
export function AuthField({
  label,
  description,
  placeholder,
  ltr = false,
  end,
  ...props
}: AuthFieldProps) {
  return (
    <AriaTextField {...props} className="group flex flex-col gap-1.5">
      <Label className={FIELD_LABEL}>{label}</Label>
      <Group className={FIELD_GROUP}>
        <Input
          dir={ltr ? "ltr" : undefined}
          {...(placeholder === undefined ? {} : { placeholder })}
          className={cx(
            "h-full min-w-0 grow bg-transparent text-body text-primary outline-none placeholder:text-muted",
            ltr && "text-start",
          )}
        />
        {end}
      </Group>
      {description === undefined ? null : (
        <Text slot="description" className="ps-5 text-caption font-light text-muted">
          {description}
        </Text>
      )}
    </AriaTextField>
  );
}

/** A password pill with its "show password" eye. */
export function PasswordField({
  label,
  autoComplete,
  description,
  value,
  onChange,
}: {
  label: string;
  autoComplete: "current-password" | "new-password";
  description?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useLingui();
  const [shown, setShown] = useState(false);
  return (
    <AuthField
      label={label}
      type={shown ? "text" : "password"}
      autoComplete={autoComplete}
      isRequired
      ltr
      value={value}
      onChange={onChange}
      {...(description === undefined ? {} : { description })}
      end={
        <AriaButton
          aria-label={shown ? t`Hide password` : t`Show password`}
          onPress={() => {
            setShown((now) => !now);
          }}
          className="grid size-9 shrink-0 cursor-default place-items-center rounded-pill text-icon-muted outline-none transition-[background-color,color,scale] duration-[var(--motion-duration-fast)] data-[focus-visible]:outline-2 data-[focus-visible]:outline-focus data-[hovered]:bg-hover data-[hovered]:text-primary data-[pressed]:scale-90"
        >
          <EyeGlyph closed={shown} />
        </AriaButton>
      }
    />
  );
}

/** The demo's thin-line eye (open, or struck through while the password shows). */
function EyeGlyph({ closed }: { closed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
      {closed ? <path d="M4 20 20 4" /> : null}
    </svg>
  );
}

/**
 * The demo's six code boxes (`.codes`) for the authenticator code. One real input, labelled and
 * marked `one-time-code`, lies over the boxes, so typing, pasting, autofill and screen readers
 * work as with any field; the boxes only draw its digits and where the next one goes.
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
        className={cx("flex justify-center gap-2", invalid && "auth-shake")}
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
                  <i className="auth-caret block h-7 w-px bg-primary" />
                ) : null
              ) : (
                <span key={digit + String(index)} className="auth-digit">
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
