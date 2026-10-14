import type { ReactNode } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import { cx } from "../lib/cx.ts";

export interface IconButtonProps extends Omit<AriaButtonProps, "className" | "children"> {
  /** What the button does; icon-only buttons are named for screen readers. */
  "aria-label": string;
  icon: ReactNode;
  /** The amber dot: something here waits for the user. */
  needsYou?: boolean;
  className?: string;
}

export function IconButton({ icon, needsYou = false, className, ...props }: IconButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cx(
        "relative inline-flex size-10 cursor-default items-center justify-center rounded-button text-icon",
        "data-[hovered]:bg-action-secondary-hover data-[disabled]:opacity-45",
        className,
      )}
    >
      {icon}
      {needsYou ? (
        <span
          aria-hidden="true"
          className="absolute top-2 end-2 size-2.5 rounded-pill bg-attention ring-2 ring-surface"
        />
      ) : null}
    </AriaButton>
  );
}
