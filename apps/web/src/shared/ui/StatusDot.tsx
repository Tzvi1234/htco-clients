import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

export type Status = "running" | "needs-you" | "waiting" | "done" | "failed" | "offline";

const DOTS: Record<Status, string> = {
  running: "size-2 bg-status-running ring-3 ring-accent-subtle",
  "needs-you": "size-2.5 bg-status-needs-you",
  waiting: "size-2 bg-status-waiting",
  done: "size-2 bg-status-done",
  failed: "size-2 bg-status-failed",
  offline: "size-2 border-[1.5px] border-status-waiting",
};

/** The status dot. Colour is never the only signal, so it is decorative: pair it with a word. */
export function StatusDot({ status }: { status: Status }) {
  return (
    <span
      aria-hidden="true"
      data-status={status}
      className={cx("inline-block shrink-0 rounded-pill", DOTS[status])}
    />
  );
}

/** A dot with the word that says the same thing ("Running", "Needs you"). */
export function StatusLabel({ status, children }: { status: Status; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-primary">
      <StatusDot status={status} />
      {children}
    </span>
  );
}
