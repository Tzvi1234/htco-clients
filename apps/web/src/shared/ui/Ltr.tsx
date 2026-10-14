import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

/**
 * Keeps codes (receipt numbers, tracking codes, SKUs, IDs, emails, URLs) left-to-right inside
 * any text, so their characters keep their order in Hebrew sentences.
 */
export function Ltr({ children, mono = true }: { children: ReactNode; mono?: boolean }) {
  return (
    <bdi dir="ltr" className={cx(mono && "font-mono")}>
      {children}
    </bdi>
  );
}
