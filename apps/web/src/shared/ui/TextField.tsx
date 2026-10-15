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
  size?: "md" | "lg";
  className?: string;
}

/** A labelled text input with an optional hint and error (React Aria: label, ARIA, validation). */
export function TextField({
  label,
  description,
  errorMessage,
  ltr = false,
  size = "md",
  className,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      isInvalid={errorMessage !== undefined || props.isInvalid === true}
      className={cx("flex flex-col gap-1.5", className)}
    >
      <Label className="text-body-sm font-medium text-secondary">{label}</Label>
      <Input
        dir={ltr ? "ltr" : undefined}
        className={cx(
          size === "lg" ? "h-10" : "h-8",
          "rounded-control border border-border-control bg-surface px-2.5 text-body text-primary shadow-1",
          "transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] outline-none",
          "placeholder:text-muted data-[hovered]:border-icon",
          "data-[focused]:border-focus data-[focused]:ring-3 data-[focused]:ring-accent-subtle",
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
