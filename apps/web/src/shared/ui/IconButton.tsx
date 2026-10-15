import type { ReactNode } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import { cx } from "../lib/cx.ts";

export interface IconButtonProps extends Omit<AriaButtonProps, "className" | "children"> {
  /** What the button does; icon-only buttons are named for screen readers. */
  "aria-label": string;
  icon: ReactNode;
  /** The saffron dot: something here waits for the user. */
  needsYou?: boolean;
  className?: string;
}

export function IconButton({ icon, needsYou = false, className, ...props }: IconButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cx(
        "relative inline-flex size-8 cursor-default items-center justify-center rounded-control text-icon",
        "transition-colors duration-[var(--motion-duration-fast)] data-[hovered]:bg-hover data-[hovered]:text-primary data-[disabled]:opacity-45",
        className,
      )}
    >
      {icon}
      {needsYou ? (
        <span
          aria-hidden="true"
          className="absolute end-1 top-1 size-2 rounded-pill bg-attention ring-2 ring-canvas"
        />
      ) : null}
    </AriaButton>
  );
}
