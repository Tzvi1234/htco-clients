import { cx } from "../lib/cx.ts";

/*
 * The aura (design/README.md, "Backgrounds"): soft gradient shapes in the illustration palette
 * behind brand moments, with a hand-drawn stroke in one corner. Decorative only, static (it fades
 * in once), positioned with logical properties so it mirrors in right-to-left layouts, and kept
 * off dense work surfaces: there it is a faint glow at the top of a page, never behind a table.
 */

type AuraVariant = "brand" | "corner" | "page";

/** One organic shape: a two-colour gradient on an irregular rounded outline, softly blurred. */
function Shape({ className }: { className: string }) {
  return <span className={cx("absolute block animate-enter", className)} />;
}

export function Aura({ variant, className }: { variant: AuraVariant; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {variant === "brand" ? (
        <>
          {/* Peach to iris, rising from the top corner. */}
          <Shape className="-end-24 -top-32 size-[460px] rotate-[24deg] rounded-[58%_42%_60%_40%/46%_54%_46%_54%] bg-linear-to-br from-art-saffron via-art-coral to-art-iris opacity-60 blur-xl dark:opacity-30" />
          {/* Sky to iris, sweeping across the middle. */}
          <Shape className="-start-40 top-[38%] h-[340px] w-[620px] -rotate-[18deg] rounded-[64%_36%_52%_48%/58%_44%_56%_42%] bg-linear-to-r from-art-sky to-art-iris opacity-45 blur-xl dark:opacity-25" />
          {/* A small cool accent near the bottom. */}
          <Shape className="-bottom-28 end-[18%] size-[300px] rounded-full bg-linear-to-tr from-art-iris to-art-sky opacity-30 blur-3xl dark:opacity-20" />
        </>
      ) : null}
      {variant === "corner" ? (
        <>
          <Shape className="-end-36 -bottom-40 size-[380px] rotate-12 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-linear-to-tl from-art-iris via-art-sky to-art-mint opacity-40 blur-xl dark:opacity-20" />
          <svg
            viewBox="0 0 120 120"
            className="absolute end-[12%] bottom-6 w-24 animate-art-in [animation-delay:300ms] rtl:-scale-x-100"
          >
            <path
              d="M14 86c18-30 52-46 66-34 12 10-10 34-26 44-12 8-22 4-14-8 10-14 40-30 62-26"
              fill="none"
              stroke="var(--illustration-coral)"
              strokeWidth="4.5"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              className="animate-ring-draw [animation-delay:420ms] [animation-duration:900ms]"
            />
          </svg>
        </>
      ) : null}
      {variant === "page" ? (
        <>
          <Shape className="-end-32 -top-48 h-[320px] w-[560px] rotate-[8deg] rounded-[60%_40%_58%_42%/48%_56%_44%_52%] bg-linear-to-l from-art-saffron via-art-coral to-art-iris opacity-25 blur-3xl dark:opacity-15" />
          <Shape className="-top-40 end-[38%] size-[280px] rounded-full bg-art-sky opacity-20 blur-3xl dark:opacity-10" />
        </>
      ) : null}
    </div>
  );
}
