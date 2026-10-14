import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { cx } from "../lib/cx.ts";

export interface TextFieldProps extends Omit<AriaTextFieldProps, "className" | "children"> {
  label: string;
  description?: string;
  errorMessage?: string;
  /** Codes and email addresses stay left-to-right inside Hebrew pages. */
  ltr?: boolean;
  className?: string;
}

/** A labelled text input with an optional hint and error (React Aria: label, ARIA, validation). */
export function TextField({
  label,
  description,
  errorMessage,
  ltr = false,
  className,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      isInvalid={errorMessage !== undefined || props.isInvalid === true}
      className={cx("flex flex-col gap-1", className)}
    >
      <Label className="text-body font-medium">{label}</Label>
      <Input
        dir={ltr ? "ltr" : undefined}
        className={cx(
          "h-10 rounded-control border border-border-control bg-surface px-3 text-body text-primary",
          "outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-focus",
          "data-[invalid]:border-danger",
          ltr && "text-start",
        )}
      />
      {description === undefined ? null : (
        <Text slot="description" className="text-caption text-muted">
          {description}
        </Text>
      )}
      <FieldError className="text-caption text-danger-text">{errorMessage}</FieldError>
    </AriaTextField>
  );
}
