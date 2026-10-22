import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import {
  FieldError,
  Group,
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
  /** A leading icon inside the field (envelope for email, lock for password). */
  icon?: Icon;
  placeholder?: string;
  /** A control at the end of the field, such as "show password". */
  end?: ReactNode;
  className?: string;
}

/** A labelled text input with an optional hint and error (React Aria: label, ARIA, validation). */
export function TextField({
  label,
  description,
  errorMessage,
  ltr = false,
  size = "md",
  icon: Lead,
  end,
  placeholder,
  className,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      isInvalid={errorMessage !== undefined || props.isInvalid === true}
      className={cx("group flex flex-col gap-1.5", className)}
    >
      <Label className="text-body-sm font-medium text-primary">{label}</Label>
      <Group
        className={cx(
          size === "lg" ? "h-11 rounded-button" : "h-8 rounded-control",
          "flex items-center gap-2 border border-border-control bg-surface px-3 shadow-1",
          "transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)]",
          "data-[hovered]:border-icon",
          "data-[focus-within]:border-focus data-[focus-within]:ring-4 data-[focus-within]:ring-accent-subtle",
          "group-data-[invalid]:border-danger",
        )}
      >
        {Lead === undefined ? null : (
          <Lead
            aria-hidden="true"
            size={size === "lg" ? 18 : 15}
            weight="duotone"
            className="shrink-0 text-icon-muted transition-colors group-focus-within:text-accent-text"
          />
        )}
        <Input
          dir={ltr ? "ltr" : "auto"}
          {...(placeholder === undefined ? {} : { placeholder })}
          className={cx(
            "h-full min-w-0 grow bg-transparent text-body text-primary outline-none placeholder:text-muted",
            ltr && "text-start",
          )}
        />
        {end}
      </Group>
      {description === undefined ? null : (
        <Text slot="description" className="text-caption text-muted">
          {description}
        </Text>
      )}
      <FieldError className="text-caption text-danger-text">{errorMessage}</FieldError>
    </AriaTextField>
  );
}
