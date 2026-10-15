import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import { cx } from "../lib/cx.ts";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

// Design 1C (.btn): pills with a hairline; the primary is the inverse (ink) fill.
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-action-primary text-action-primary-fg border-action-primary data-[hovered]:bg-action-primary-hover data-[pressed]:bg-action-primary-pressed",
  secondary:
    "bg-transparent text-action-secondary-fg border-line-strong data-[hovered]:border-line-hover-strong data-[hovered]:bg-hover",
  ghost:
    "border-transparent bg-transparent text-secondary data-[hovered]:bg-hover data-[hovered]:text-primary",
  danger: "border-transparent bg-action-danger text-action-danger-fg",
};

// The same looks on plain elements (links), with CSS hover and active states.
const LINK_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-action-primary text-action-primary-fg border-action-primary hover:bg-action-primary-hover active:bg-action-primary-pressed",
  secondary:
    "bg-transparent text-action-secondary-fg border-line-strong hover:border-line-hover-strong hover:bg-hover",
  ghost: "border-transparent bg-transparent text-secondary hover:bg-hover hover:text-primary",
  danger: "border-transparent bg-action-danger text-action-danger-fg",
};

// 28, 32 and 40 px.
const SIZES: Record<ButtonSize, string> = {
  sm: "h-7 gap-1.5 px-3 text-caption",
  md: "h-8 gap-1.5 px-4 text-body-sm",
  lg: "h-10 gap-2 px-5 text-body-sm",
};

export interface ButtonProps extends Omit<AriaButtonProps, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** The button's look, for a link that reads as a button (a route behind "Connect a shop"). */
export function buttonStyle({
  variant = "secondary",
  size = "md",
}: { variant?: ButtonVariant; size?: ButtonSize } = {}): string {
  return cx(
    "inline-flex items-center justify-center rounded-button border font-normal whitespace-nowrap no-underline",
    "transition-[background-color,border-color,scale] duration-[var(--motion-duration-fast)] ease-standard active:scale-[0.98]",
    LINK_VARIANTS[variant],
    SIZES[size],
  );
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
        "inline-flex items-center justify-center rounded-button border font-normal whitespace-nowrap",
        "cursor-default transition-[background-color,border-color,scale] duration-[var(--motion-duration-fast)] ease-standard",
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
