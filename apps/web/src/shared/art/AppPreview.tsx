import { cx } from "../lib/cx.ts";
import { Logo } from "../ui/Logo.tsx";

/** A placeholder line in the shape of text: no invented data on a marketing picture. */
function Line({ className }: { className: string }) {
  return <span className={cx("block h-2 rounded-pill", className)} />;
}

/**
 * A miniature of the app for the front door: the ink sidebar, the white work panel, the key
 * numbers card, a list and the AI office card. Shapes stand in for text and numbers, so nothing
 * on the page pretends to be real data. Decorative.
 */
export function AppPreview({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "overflow-hidden rounded-dialog border border-border-strong bg-app shadow-3",
        className,
      )}
    >
      <div className="flex gap-1.5 px-4 py-3">
        <span className="size-2.5 rounded-pill bg-app-selected" />
        <span className="size-2.5 rounded-pill bg-app-selected" />
        <span className="size-2.5 rounded-pill bg-app-selected" />
      </div>
      <div className="grid grid-cols-[150px_1fr] gap-2 px-2 pb-2 max-sm:grid-cols-1">
        <div className="flex flex-col gap-3 px-2 py-1 max-sm:hidden">
          <Logo height={16} onInk />
          <span className="mt-2 block h-6 rounded-control bg-app-selected" />
          {["w-16", "w-12", "w-20", "w-14"].map((width) => (
            <span key={width} className="flex items-center gap-2 px-1">
              <span className="size-3 rounded-[3px] bg-app-muted" />
              <Line className={cx("bg-app-hover", width)} />
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-3 rounded-card bg-canvas p-4">
          <Line className="w-40 bg-border-strong" />
          <div className="grid grid-cols-4 overflow-hidden rounded-button border border-border-subtle">
            {[0, 1, 2, 3].map((cell) => (
              <span
                key={cell}
                className="flex flex-col gap-2 border-border-subtle p-3 not-last:border-e"
              >
                <Line className="w-12 bg-border-subtle" />
                <span className="block h-4 w-10 rounded-tag bg-border-strong" />
              </span>
            ))}
          </div>
          <div className="grid grid-cols-[1.6fr_1fr] gap-3">
            <div className="flex flex-col overflow-hidden rounded-button border border-border-subtle">
              {["w-28", "w-36", "w-24"].map((width, row) => (
                <span
                  key={width}
                  className="flex items-center gap-2.5 border-border-subtle px-3 py-2.5 not-last:border-b"
                >
                  <span className="size-5 rounded-[5px] border border-border-strong" />
                  <Line className={cx("bg-border-strong", width)} />
                  <span className="grow" />
                  <span
                    className={cx(
                      "h-3.5 w-12 rounded-tag",
                      row === 1 ? "bg-presence-saffron" : "bg-presence-mint",
                    )}
                  />
                </span>
              ))}
            </div>
            <div className="relative flex flex-col gap-2 overflow-hidden rounded-button bg-presence-iris p-3">
              <Line className="w-16 bg-presence-fg" />
              <Line className="w-20 bg-presence-fg opacity-60" />
              <span className="absolute -end-4 -bottom-4 size-12 rounded-pill bg-ring" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
