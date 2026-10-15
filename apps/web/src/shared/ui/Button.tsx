import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import { cx } from "../lib/cx.ts";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-action-primary text-action-primary-fg shadow-1 data-[hovered]:bg-action-primary-hover data-[pressed]:bg-action-primary-pressed",
  secondary:
    "bg-action-secondary text-action-secondary-fg border-border-strong shadow-1 data-[hovered]:bg-action-secondary-hover",
  ghost: "bg-transparent text-secondary data-[hovered]:bg-hover data-[hovered]:text-primary",
  danger: "bg-action-danger text-action-danger-fg shadow-1",
};

// Attio density: 28, 32 and 40 px.
const SIZES: Record<ButtonSize, string> = {
  sm: "h-7 gap-1.5 px-2.5 text-body-sm",
  md: "h-8 gap-2 px-3 text-body",
  lg: "h-10 gap-2 px-4 text-body",
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
        "inline-flex items-center justify-center rounded-button border border-transparent font-medium whitespace-nowrap",
        "cursor-default transition-[background-color,scale] duration-[var(--motion-duration-fast)] ease-standard",
        "data-[pressed]:scale-[0.98] data-[disabled]:opacity-45",
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
              className="size-3.5 animate-spin rounded-pill border-2 border-current border-e-transparent"
            />
          ) : null}
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </AriaButton>
  );
}
