import {
  CheckIcon as Check,
  CubeIcon as Cube,
  PaperPlaneTiltIcon as PaperPlaneTilt,
  ShoppingCartSimpleIcon as ShoppingCart,
  SparkleIcon as Sparkle,
  UsersThreeIcon as UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

/*
 * The sign-in art (the owner's reference, drawn in the Relay illustration style): HTCO's relay
 * as one composition. Illustrated cards with ink outlines and a solid offset shadow (orders with
 * their states, customers, a product) send their work along dashed traces into the interlocked
 * rings of the logo, and on to the AI office, which acts and asks. Solid colours only, no text
 * (it reads the same in every language), decorative. It mirrors in right-to-left layouts and
 * plays once.
 */

const INK = "var(--illustration-ink)";

function Line({ className }: { className: string }) {
  return <span className={cx("block h-2 rounded-pill bg-border-strong", className)} />;
}

/** An illustrated card: paper, a 2 px ink outline and a solid ink shadow, no blur. */
function Card({
  icon: Glyph,
  tile,
  className,
  children,
}: {
  icon: Icon;
  tile: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "absolute flex animate-art-in flex-col gap-3 rounded-[18px] border-2 border-[var(--illustration-ink)] bg-[var(--illustration-paper)] p-4 shadow-[5px_5px_0_var(--illustration-ink)]",
        className,
      )}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={cx(
            "grid size-9 place-items-center rounded-button border-2 border-[var(--illustration-ink)] text-[var(--illustration-ink)]",
            tile,
          )}
        >
          <Glyph size={18} weight="bold" />
        </span>
        <span className="block h-2.5 w-16 rounded-pill bg-[var(--illustration-ink)]" />
      </span>
      {children}
    </div>
  );
}

/** A tiny drawn product for an order row: a tile in its colour and a simple object on it. */
function Thumb({ fill, children }: { fill: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 28 28" className="size-7 shrink-0">
      <rect x="1" y="1" width="26" height="26" rx="7" fill={fill} stroke={INK} strokeWidth="2" />
      {children}
    </svg>
  );
}

/** The interlocked rings with ink outlines: over at the top crossing, under at the bottom. */
function Rings() {
  return (
    <svg viewBox="0 0 250 180" className="block h-auto w-full overflow-visible">
      <circle cx="82" cy="85" r="56" fill="none" stroke={INK} strokeWidth="32" />
      <circle
        cx="82"
        cy="85"
        r="56"
        fill="none"
        stroke="var(--presence-iris-bg)"
        strokeWidth="26"
      />
      <circle cx="152" cy="85" r="56" fill="none" stroke={INK} strokeWidth="32" />
      <circle
        cx="152"
        cy="85"
        r="56"
        fill="none"
        stroke="var(--illustration-sky)"
        strokeWidth="26"
      />
      {/* The first ring again across the top crossing: its outline first, then its colour over
          a longer arc, so the band stays seamless. */}
      <path d="M83.95 29.03A56 56 0 0 1 133.92 64.02" fill="none" stroke={INK} strokeWidth="32" />
      <path
        d="M72.28 29.85A56 56 0 0 1 136.78 73.36"
        fill="none"
        stroke="var(--presence-iris-bg)"
        strokeWidth="26"
      />
      <circle
        cx="206"
        cy="130"
        r="19"
        fill="var(--illustration-saffron)"
        stroke={INK}
        strokeWidth="3"
        className="animate-dot-drop [animation-delay:700ms] [transform-box:fill-box] origin-center"
      />
    </svg>
  );
}

const CHIPS = ["bg-presence-mint", "bg-presence-saffron", "bg-presence-slate"] as const;

export function SignInArt({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx("relative aspect-[16/11] w-full rtl:-scale-x-100", className)}
    >
      {/* Dashed traces between the cards and the rings, and a burst of activity. */}
      <svg viewBox="0 0 640 440" className="absolute inset-0 h-full w-full" fill="none">
        <g stroke={INK} strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round">
          <path d="M214 120c48 4 62 38 82 78" />
          <path d="M204 330c40-2 56-30 88-64" />
          <path d="M462 142c-26 14-44 30-58 52" />
          <path d="M412 292c14 30 38 42 72 44" />
        </g>
        <g stroke={INK} strokeWidth="4" strokeLinecap="round">
          <path d="M396 116l8-22" />
          <path d="M410 124l18-14" />
          <path d="M416 138l22-4" />
        </g>
      </svg>

      {/* Orders: drawn products and their states as solid chips. */}
      <Card icon={ShoppingCart} tile="bg-shape-sky" className="start-[2%] top-[5%] w-[31%]">
        <span className="flex items-center gap-2">
          <Thumb fill="var(--shape-mint)">
            <path
              d="M9 11h10l-1 10H10z"
              fill="var(--illustration-mint)"
              stroke={INK}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path d="M11 11a3 3 0 0 1 6 0" fill="none" stroke={INK} strokeWidth="1.6" />
          </Thumb>
          <Line className="grow" />
          <span
            className={cx(
              "h-4 w-10 shrink-0 rounded-tag border-2 border-[var(--illustration-ink)]",
              CHIPS[0],
            )}
          />
        </span>
        <span className="flex items-center gap-2">
          <Thumb fill="var(--shape-saffron)">
            <circle
              cx="14"
              cy="15"
              r="6"
              fill="var(--illustration-saffron)"
              stroke={INK}
              strokeWidth="1.6"
            />
            <path d="M14 9V6" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          </Thumb>
          <Line className="grow" />
          <span
            className={cx(
              "h-4 w-10 shrink-0 rounded-tag border-2 border-[var(--illustration-ink)]",
              CHIPS[1],
            )}
          />
        </span>
        <span className="flex items-center gap-2">
          <Thumb fill="var(--shape-peach)">
            <rect
              x="8"
              y="9"
              width="12"
              height="11"
              rx="2"
              fill="var(--illustration-coral)"
              stroke={INK}
              strokeWidth="1.6"
            />
            <path d="M8 13h12" stroke={INK} strokeWidth="1.6" />
          </Thumb>
          <Line className="grow" />
          <span
            className={cx(
              "h-4 w-10 shrink-0 rounded-tag border-2 border-[var(--illustration-ink)]",
              CHIPS[2],
            )}
          />
        </span>
      </Card>

      {/* A product: a drawn vase on its tile. */}
      <Card
        icon={Cube}
        tile="bg-shape-peach"
        className="start-[3%] bottom-[5%] w-[28%] [animation-delay:90ms]"
      >
        <span className="flex items-center gap-3">
          <svg viewBox="0 0 64 64" className="size-16 shrink-0">
            <rect
              x="1.5"
              y="1.5"
              width="61"
              height="61"
              rx="12"
              fill="var(--shape-peach)"
              stroke={INK}
              strokeWidth="2.5"
            />
            <ellipse cx="32" cy="52" rx="16" ry="3.5" fill={INK} opacity="0.15" />
            <path
              d="M25 14h14v4c0 3 6 7 6 16 0 10-6 17-13 17s-13-7-13-17c0-9 6-13 6-16z"
              fill="var(--illustration-rose)"
              stroke={INK}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M22 33c6 3 14 3 20 0"
              fill="none"
              stroke={INK}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M32 14V7m0 0c-3 0-5 2-5 4m5-4c3 0 5 2 5 4"
              fill="none"
              stroke="var(--illustration-mint)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="flex grow flex-col gap-2">
            <span className="block h-2.5 w-full rounded-pill bg-[var(--illustration-ink)]" />
            <Line className="w-2/3" />
            <Line className="w-4/5" />
          </span>
        </span>
      </Card>

      {/* The rings at the centre. */}
      <div className="absolute start-[33%] top-[25%] w-[38%] animate-art-in [animation-delay:180ms]">
        <Rings />
      </div>
      <PaperPlaneTilt
        weight="fill"
        className="absolute start-[60%] top-[69%] size-[7%] animate-art-in text-presence-iris [animation-delay:320ms]"
      />

      {/* Customers: drawn avatars. */}
      <Card
        icon={UsersThree}
        tile="bg-shape-mint"
        className="end-[4%] top-[8%] w-[27%] [animation-delay:240ms]"
      >
        {(["var(--shape-iris)", "var(--shape-saffron)"] as const).map((fill, row) => (
          <span key={fill} className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="size-8 shrink-0">
              <circle cx="16" cy="16" r="14.5" fill={fill} stroke={INK} strokeWidth="2" />
              <circle
                cx="16"
                cy="13"
                r="4.5"
                fill="var(--illustration-paper)"
                stroke={INK}
                strokeWidth="1.8"
              />
              <path
                d="M8.5 25c1.5-4.5 4.5-6.5 7.5-6.5s6 2 7.5 6.5"
                fill="var(--illustration-paper)"
                stroke={INK}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {row === 0 ? (
                <path
                  d="M11.5 11c1-3 8-3 9 0"
                  fill="none"
                  stroke={INK}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : null}
            </svg>
            <span className="flex grow flex-col gap-1.5">
              <span className="block h-2.5 w-full rounded-pill bg-[var(--illustration-ink)]" />
              <Line className="w-1/2" />
            </span>
          </span>
        ))}
      </Card>

      {/* The AI office: one action done, two waiting their turn. */}
      <Card
        icon={Sparkle}
        tile="bg-shape-iris"
        className="end-[1%] bottom-[2%] w-[31%] [animation-delay:320ms]"
      >
        <span className="flex items-center gap-2 rounded-button border-2 border-[var(--illustration-ink)] bg-presence-iris px-2.5 py-2">
          <span className="grid size-4 shrink-0 place-items-center rounded-pill bg-presence-fg text-presence-iris">
            <Check size={10} weight="bold" />
          </span>
          <span className="block h-2 grow rounded-pill bg-presence-fg" />
        </span>
        {[0, 1].map((row) => (
          <span
            key={row}
            className="flex items-center gap-2 rounded-button border-2 border-[var(--illustration-ink)] px-2.5 py-2"
          >
            <span className="size-4 shrink-0 rounded-pill border-2 border-[var(--illustration-ink)]" />
            <Line className="grow" />
          </span>
        ))}
      </Card>
    </div>
  );
}
