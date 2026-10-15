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
