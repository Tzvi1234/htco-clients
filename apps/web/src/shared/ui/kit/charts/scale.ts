/** The top of a chart's scale: the largest value, never below zero. */
export function scaleMax(values: readonly number[]): number {
  return Math.max(0, ...values);
}

/**
 * A chart in words for screen readers: what it shows, then each point's name and value
 * ("Orders per day, last 7 days: 16 3, 17 5, …"). A point without a name is read by its value.
 */
export function chartSummary(
  label: string,
  names: readonly string[],
  values: readonly number[],
  format: (value: number) => string,
): string {
  const points = values.map((value, i) => {
    const name = names[i] ?? "";
    return name === "" ? format(value) : `${name} ${format(value)}`;
  });
  return `${label}: ${points.join(", ")}`;
}

/** Where a column's tip hangs: from the start or end at the edges, so it never leaves the chart. */
export function tipAt(index: number, count: number): "start" | "middle" | "end" {
  if (count > 2 && index === 0) return "start";
  if (count > 2 && index === count - 1) return "end";
  return "middle";
}
