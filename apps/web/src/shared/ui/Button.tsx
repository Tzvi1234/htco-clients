import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import { cx } from "../lib/cx.ts";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-action-primary text-action-primary-fg data-[hovered]:bg-action-primary-hover data-[pressed]:bg-action-primary-pressed",
  secondary:
    "bg-action-secondary text-action-secondary-fg border-action-secondary-border data-[hovered]:bg-action-secondary-hover",
  ghost: "bg-transparent text-primary data-[hovered]:bg-action-secondary-hover",
  danger: "bg-action-danger text-action-danger-fg",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-body",
};

export interface ButtonProps extends Omit<AriaButtonProps, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** A verb that does one thing ("Approve fix"). Pending shows a spinner and keeps the label. */
export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-button border border-transparent font-medium whitespace-nowrap",
        "cursor-default transition-colors duration-[var(--motion-duration-fast)] ease-standard",
        "data-[disabled]:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {(renderProps) => (
        <>
          {renderProps.isPending ? (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-pill border-2 border-current border-e-transparent"
            />
          ) : null}
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </AriaButton>
  );
}
