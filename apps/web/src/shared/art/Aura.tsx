import { cx } from "../lib/cx.ts";

/*
 * The aura (design/README.md, "Backgrounds"): large organic shapes in solid pastel colours
 * (`shape.*` tokens, deep tones in the dark theme) with crisp edges and no gradients, plus one
 * hand-drawn coral stroke. Taken from the owner's sign-in reference. Decorative only, static apart
 * from a one-time entrance, positioned with logical properties (mirrors in right-to-left), and
 * never under text: on work screens it sits beside the greeting, never behind a table.
 */

const BLOB = {
  round: "M100 6c38 0 78 20 90 58 12 38-6 82-40 108-34 26-84 30-118 6S-2 110 8 70 62 6 100 6Z",
  swoosh: "M10 150C22 84 92 22 162 14c32-4 44 22 30 52-20 44-80 82-136 108-34 16-52 6-46-24Z",
  pebble:
    "M120 10c40 10 70 50 66 92-4 44-42 84-88 88-46 4-86-30-90-74C4 70 30 30 68 14c18-8 36-8 52-4Z",
} as const;

type Fill = "iris" | "sky" | "peach" | "mint" | "saffron";

const FILL: Record<Fill, string> = {
  iris: "fill-shape-iris",
  sky: "fill-shape-sky",
  peach: "fill-shape-peach",
  mint: "fill-shape-mint",
  saffron: "fill-shape-saffron",
};

function Blob({
  shape,
  fill,
  className,
}: {
  shape: keyof typeof BLOB;
  fill: Fill;
  className: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="none"
      className={cx("absolute block animate-art-in", className)}
    >
      <path d={BLOB[shape]} className={FILL[fill]} />
    </svg>
  );
}

/** The hand-drawn stroke, drawn on once. */
function Squiggle({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cx("absolute rtl:-scale-x-100", className)}>
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
  );
}

type AuraVariant = "brand" | "form" | "page" | "hero";

export function Aura({ variant, className }: { variant: AuraVariant; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {variant === "brand" ? (
        <>
          <Blob
            shape="swoosh"
            fill="sky"
            className="-inset-e-20 -top-16 h-[420px] w-[520px] rotate-[-8deg]"
          />
          <Blob
            shape="round"
            fill="peach"
            className="-inset-e-28 -top-28 size-[300px] [animation-delay:80ms]"
          />
          <Blob
            shape="pebble"
            fill="iris"
            className="-inset-s-32 bottom-[-120px] size-[380px] [animation-delay:160ms]"
          />
          <Blob
            shape="round"
            fill="saffron"
            className="inset-s-[42%] bottom-[-40px] size-[110px] [animation-delay:240ms]"
          />
        </>
      ) : null}
      {variant === "form" ? (
        <>
          {/* A cluster in the lower inline-end corner, clear of the form column. */}
          <Blob shape="pebble" fill="peach" className="-inset-e-28 -bottom-32 size-[340px]" />
          <Blob
            shape="swoosh"
            fill="sky"
            className="-inset-e-40 bottom-24 h-[220px] w-[360px] rotate-[-14deg] [animation-delay:80ms] max-sm:hidden"
          />
          <Blob
            shape="round"
            fill="iris"
            className="inset-e-[14%] bottom-[38%] size-[64px] [animation-delay:160ms] max-lg:hidden"
          />
          <Blob
            shape="round"
            fill="mint"
            className="inset-e-10 top-10 size-[44px] [animation-delay:240ms] max-sm:hidden"
          />
          <Blob
            shape="round"
            fill="saffron"
            className="-inset-e-6 top-1/3 size-[90px] [animation-delay:200ms] max-lg:hidden"
          />
          <Squiggle className="inset-e-[22%] bottom-10 w-24" />
        </>
      ) : null}
      {variant === "page" ? (
        <>
          <Blob
            shape="swoosh"
            fill="sky"
            className="-inset-e-16 -top-24 h-[230px] w-[380px] rotate-[-6deg]"
          />
          <Blob
            shape="round"
            fill="peach"
            className="-inset-e-20 -top-24 size-[170px] [animation-delay:80ms]"
          />
          <Blob
            shape="round"
            fill="iris"
            className="inset-e-[300px] -top-10 size-[70px] [animation-delay:160ms]"
          />
        </>
      ) : null}
      {variant === "hero" ? (
        <>
          <Blob
            shape="swoosh"
            fill="sky"
            className="-inset-e-24 top-8 h-[460px] w-[620px] rotate-[-10deg]"
          />
          <Blob
            shape="round"
            fill="peach"
            className="-inset-e-32 -top-32 size-[380px] [animation-delay:80ms]"
          />
          <Blob
            shape="pebble"
            fill="iris"
            className="-inset-s-40 top-[45%] size-[360px] [animation-delay:160ms]"
          />
          <Blob
            shape="round"
            fill="mint"
            className="inset-s-[30%] -bottom-24 size-[200px] [animation-delay:240ms]"
          />
          <Squiggle className="inset-e-[8%] bottom-16 w-28" />
        </>
      ) : null}
    </div>
  );
}
