import type AxeBuilder from "@axe-core/playwright";

type AxeResults = Awaited<ReturnType<AxeBuilder["analyze"]>>;

/**
 * The axe violations that fail a test: serious and critical ones (AC-3.4.1), each with the rule,
 * its help text and the offending elements, so a failure says what to fix.
 */
export function seriousViolations(results: AxeResults): string[] {
  return results.violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .map(
      (violation) =>
        `${violation.id} (${String(violation.impact)}): ${violation.help} — ${violation.nodes
          .map((node) => node.target.join(" "))
          .join(", ")}`,
    );
}
