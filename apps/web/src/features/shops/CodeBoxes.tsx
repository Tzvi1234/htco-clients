import { useLingui } from "@lingui/react/macro";
import { useState } from "react";

import { cx } from "../../shared/lib/cx.ts";

/**
 * The demo's six code boxes (`.codes`: 52×60, radius 16, 26 px light digits, left-to-right) for
 * the step-up code. One real input, labelled and marked `one-time-code`, lies over the boxes, so
 * typing (each digit advances), pasting six digits, backspace and screen readers behave as in any
 * field; the boxes only draw its digits and where the next one goes. Same look as the sign-in
 * MFA boxes (features/auth), kept here until that one is shared.
 */
export function CodeBoxes({
  value,
  onChange,
  autoFocus = false,
  invalid = false,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  /** The last code was refused: the boxes turn red. */
  invalid?: boolean;
}) {
  const { t } = useLingui();
  const [focused, setFocused] = useState(autoFocus);
  const digits = value.split("");
  return (
    <div dir="ltr" className="relative flex justify-center gap-2">
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
                <i className="block h-7 w-px bg-primary motion-safe:animate-[htco-wait-dot_1s_steps(2)_infinite]" />
              ) : null
            ) : (
              <span key={digit + String(index)} className="motion-safe:animate-pop-in">
                {digit}
              </span>
            )}
          </span>
        );
      })}
      <input
        aria-label={t`Code from the app`}
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
