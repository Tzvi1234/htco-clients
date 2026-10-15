import {
  CheckIcon as Check,
  CubeIcon as Cube,
  PaperPlaneTiltIcon as PaperPlaneTilt,
  ShoppingCartSimpleIcon as ShoppingCart,
  SparkleIcon as Sparkle,
  UserIcon as User,
  UsersThreeIcon as UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

/*
 * The sign-in art (the owner's reference): HTCO's relay as one composition. The work arrives as
 * cards (orders with their states, customers, products), travels along dashed traces into the
 * interlocked rings of the logo, and reaches the AI office, which acts and asks. Solid colours
 * only, no text (it reads the same in every language), decorative. It mirrors in right-to-left
 * layouts and plays once.
 */

function Line({ className }: { className: string }) {
  return <span className={cx("block h-2 rounded-pill bg-border-subtle", className)} />;
}

function Card({
  icon: Glyph,
  className,
  children,
}: {
  icon: Icon;
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "absolute flex animate-art-in flex-col gap-3 rounded-[18px] border border-border-subtle bg-surface p-4 shadow-2",
        className,
      )}
    >
      <span className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-button bg-selected text-accent-text">
          <Glyph size={18} weight="duotone" />
        </span>
        <Line className="w-16 bg-border-strong" />
      </span>
      {children}
    </div>
  );
}

/** The interlocked rings: the first passes over the second at the top, under it at the bottom. */
function Rings() {
  return (
    <svg viewBox="0 0 240 170" className="block h-auto w-full">
      <circle
        cx="82"
        cy="85"
        r="56"
        fill="none"
        stroke="var(--presence-iris-bg)"
        strokeWidth="26"
      />
      <circle
        cx="152"
        cy="85"
        r="56"
        fill="none"
        stroke="var(--illustration-sky)"
        strokeWidth="26"
      />
      {/* The first ring again, over the second, across the top crossing only. */}
      <path
        d="M91.72 29.85A56 56 0 0 1 134.62 65.85"
        fill="none"
        stroke="var(--presence-iris-bg)"
        strokeWidth="26"
      />
      <circle
        cx="205"
        cy="128"
        r="19"
        fill="var(--illustration-saffron)"
        className="animate-dot-drop [animation-delay:700ms] [transform-box:fill-box] origin-center"
      />
    </svg>
  );
}

const DOTS = ["bg-art-sky", "bg-ring", "bg-art-coral"] as const;
const CHIPS = ["bg-presence-mint", "bg-presence-saffron", "bg-presence-slate"] as const;

export function SignInArt({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx("relative aspect-[16/11] w-full rtl:-scale-x-100", className)}
    >
      {/* Dashed traces between the cards and the rings, and a little burst of activity. */}
      <svg viewBox="0 0 640 440" className="absolute inset-0 h-full w-full" fill="none">
        <g stroke="var(--icon-muted)" strokeWidth="2" strokeDasharray="5 8" strokeLinecap="round">
          <path d="M212 118c48 4 64 40 86 82" />
          <path d="M200 330c40-2 58-30 92-66" />
          <path d="M460 140c-26 14-44 30-58 52" />
          <path d="M410 290c14 30 38 42 74 44" />
        </g>
        <g stroke="var(--illustration-ink)" strokeWidth="4" strokeLinecap="round">
          <path d="M396 120l8-22" />
          <path d="M410 128l18-14" />
          <path d="M416 142l22-4" />
        </g>
      </svg>

      {/* Orders, with their states as solid chips. */}
      <Card icon={ShoppingCart} className="start-[2%] top-[6%] w-[31%]">
        {CHIPS.map((chip, row) => (
          <span key={chip} className="flex items-center gap-2">
            <span className={cx("size-2.5 shrink-0 rounded-pill", DOTS[row])} />
            <Line className="grow" />
            <span className={cx("h-4 w-10 shrink-0 rounded-tag", chip)} />
          </span>
        ))}
      </Card>

      {/* Products: a photo tile and its lines. */}
      <Card icon={Cube} className="start-[2%] bottom-[6%] w-[28%] [animation-delay:90ms]">
        <span className="flex items-center gap-3">
          <span className="grid size-14 shrink-0 place-items-center rounded-button bg-shape-peach">
            <span className="size-6 rounded-[6px] bg-art-coral" />
          </span>
          <span className="flex grow flex-col gap-2">
            <Line className="w-full bg-border-strong" />
            <Line className="w-2/3" />
            <Line className="w-4/5" />
          </span>
        </span>
      </Card>

      {/* The rings at the centre. */}
      <div className="absolute start-[33%] top-[26%] w-[37%] animate-art-in [animation-delay:180ms]">
        <Rings />
      </div>
      <PaperPlaneTilt
        weight="fill"
        className="absolute start-[60%] top-[68%] size-[7%] animate-art-in text-presence-iris [animation-delay:320ms]"
      />

      {/* Customers. */}
      <Card icon={UsersThree} className="end-[4%] top-[9%] w-[27%] [animation-delay:240ms]">
        {[0, 1].map((row) => (
          <span key={row} className="flex items-center gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-pill bg-sunken text-icon">
              <User size={14} weight="fill" />
            </span>
            <span className="flex grow flex-col gap-1.5">
              <Line className="w-full bg-border-strong" />
              <Line className="w-1/2" />
            </span>
          </span>
        ))}
      </Card>

      {/* The AI office: one action done, two waiting their turn. */}
      <Card icon={Sparkle} className="end-[1%] bottom-[2%] w-[31%] [animation-delay:320ms]">
        <span className="flex items-center gap-2 rounded-button bg-presence-iris px-2.5 py-2">
          <span className="grid size-4 shrink-0 place-items-center rounded-pill bg-presence-fg text-presence-iris">
            <Check size={10} weight="bold" />
          </span>
          <span className="block h-2 grow rounded-pill bg-presence-fg opacity-80" />
        </span>
        {[0, 1].map((row) => (
          <span
            key={row}
            className="flex items-center gap-2 rounded-button border border-border-subtle px-2.5 py-2"
          >
            <span className="size-4 shrink-0 rounded-pill border-2 border-border-strong" />
            <Line className="grow" />
          </span>
        ))}
      </Card>
    </div>
  );
}
