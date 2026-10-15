import {
  ChatCircleIcon as ChatCircle,
  CheckIcon as Check,
  CubeIcon as Cube,
  ImageIcon,
  ShieldCheckIcon as ShieldCheck,
  TagIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

const INK = "var(--illustration-ink)";

function Bar({ className }: { className: string }) {
  return <span className={cx("block h-2 rounded-pill bg-border-strong", className)} />;
}

function Card({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div
      className={cx(
        "absolute rounded-[12px] border-[1.5px] border-[var(--illustration-ink)] bg-[var(--illustration-paper)] p-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * "How it works" in one picture (the owner's landing reference): an order checked, a listing
 * prepared, a customer message, all traced into the interlocked rings and out to an approval the
 * owner decides. Line-drawn on a light grid, solid colours, decorative.
 */
export function HowArt({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx("relative aspect-[740/345] w-full rtl:-scale-x-100", className)}
    >
      <svg viewBox="0 0 740 345" className="absolute inset-0 h-full w-full" fill="none">
        <defs>
          <pattern id="how-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M36 0H0V36" stroke="var(--border-subtle)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="40" y="25" width="660" height="300" fill="url(#how-grid)" />
        <g stroke={INK} strokeWidth="1.8" strokeDasharray="4 6" strokeLinecap="round">
          <path d="M205 80c60 0 80 10 96 52" />
          <path d="M172 250c60 0 92-24 110-62" />
          <path d="M448 120c20-30 36-46 64-50" />
          <path d="M452 200c18 30 26 44 52 52" />
        </g>
        {/* The interlocked rings: over at the top crossing, under at the bottom. */}
        <circle cx="330" cy="175" r="58" stroke={INK} strokeWidth="34" />
        <circle cx="330" cy="175" r="58" stroke="var(--illustration-iris)" strokeWidth="28" />
        <circle cx="402" cy="175" r="58" stroke={INK} strokeWidth="34" />
        <circle cx="402" cy="175" r="58" stroke="var(--illustration-sky)" strokeWidth="28" />
        <path d="M332.02 117.03A58 58 0 0 1 383.78 152.27" stroke={INK} strokeWidth="34" />
        <path
          d="M319.93 117.88A58 58 0 0 1 386.73 162.94"
          stroke="var(--illustration-iris)"
          strokeWidth="28"
        />
        <circle
          cx="460"
          cy="230"
          r="15"
          fill="var(--illustration-saffron)"
          stroke={INK}
          strokeWidth="2.5"
        />
      </svg>

      {/* An order, checked. */}
      <Card className="start-[14%] top-[13%] w-[14%]">
        <span className="flex items-center gap-2">
          <Cube size={18} weight="duotone" />
          <span className="flex grow flex-col gap-1.5">
            <Bar className="w-full" />
            <Bar className="w-2/3" />
          </span>
        </span>
        <span className="mt-3 flex flex-col gap-1.5">
          <Bar className="w-4/5" />
          <Bar className="w-1/2" />
        </span>
        <span className="absolute -end-3 -bottom-3 grid size-7 place-items-center rounded-pill border-2 border-[var(--illustration-ink)] bg-presence-mint text-presence-fg">
          <Check size={13} weight="bold" />
        </span>
      </Card>

      {/* A listing, prepared. */}
      <Card className="start-[10%] top-[52%] w-[14%]">
        <span className="grid h-14 place-items-center rounded-[8px] border-[1.5px] border-[var(--illustration-ink)] bg-shape-iris text-[var(--illustration-iris)]">
          <ImageIcon size={30} weight="fill" />
        </span>
        <span className="mt-3 flex flex-col gap-1.5">
          <Bar className="w-2/3 bg-[var(--illustration-iris)]" />
          <Bar className="w-1/2" />
        </span>
        <TagIcon size={22} weight="duotone" className="absolute -end-4 -bottom-3 rotate-12" />
      </Card>

      {/* A customer message. */}
      <Card className="end-[10%] top-[12%] w-[21%]">
        <span className="flex items-start gap-3">
          <ChatCircle size={22} weight="regular" />
          <span className="flex grow flex-col gap-1.5 pt-1">
            <Bar className="w-3/4" />
            <span className="flex items-center gap-2">
              <Bar className="grow" />
              <span className="size-2 rounded-pill bg-[var(--illustration-iris)]" />
            </span>
            <Bar className="w-1/2" />
          </span>
        </span>
      </Card>

      {/* The approval the owner decides. */}
      <Card className="end-[6%] top-[57%] w-[25%]">
        <span className="flex items-start gap-3">
          <ShieldCheck size={22} weight="fill" className="text-[var(--illustration-iris)]" />
          <span className="flex grow flex-col gap-1.5 pt-1">
            <Bar className="w-3/4" />
            <Bar className="w-1/2" />
          </span>
        </span>
        <span className="mt-3 flex justify-end gap-2">
          <span className="rounded-[6px] bg-sunken px-2.5 py-1 font-latin text-[10px] font-semibold">
            Decline
          </span>
          <span className="rounded-[6px] bg-ring px-2.5 py-1 font-latin text-[10px] font-semibold text-[var(--illustration-ink)]">
            Approve
          </span>
        </span>
      </Card>
    </div>
  );
}
