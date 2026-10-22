import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BarChart } from "./BarChart.tsx";
import { HBarList, ProgressBar } from "./HBarList.tsx";
import { LineChart } from "./LineChart.tsx";
import { chartSummary, tipAt } from "./scale.ts";

const days = ["16", "17", "18", "19", "20", "21", "22"];
const orders = [3, 5, 0, 8, 2, 6, 4];

function bars(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-bar]"));
}

describe("BarChart", () => {
  it("draws one bar per value, each with its value written above it", () => {
    const { container } = render(
      <BarChart values={orders} labels={days} highlight={6} label="Orders per day" />,
    );
    expect(bars(container)).toHaveLength(7);
    const written = Array.from(container.querySelectorAll("[data-value]")).map(
      (node) => node.textContent,
    );
    expect(written).toEqual(["3", "5", "0", "8", "2", "6", "4"]);
    const axis = Array.from(container.querySelectorAll("[data-axis]")).map((n) => n.textContent);
    expect(axis).toEqual(days);
  });

  it("scales the bars to the largest value", () => {
    const { container } = render(
      <BarChart values={[2, 8, 4]} labels={["a", "b", "c"]} label="x" />,
    );
    const heights = bars(container).map(
      (bar) => (bar.firstElementChild as HTMLElement).style.height,
    );
    expect(heights).toEqual(["25%", "100%", "50%"]);
  });

  it("gives the highlighted bar the full tertiary orange and the others its lighter wash", () => {
    const { container } = render(
      <BarChart values={orders} labels={days} highlight={6} label="Orders per day" />,
    );
    const all = bars(container);
    const marked = all.filter((bar) => bar.hasAttribute("data-highlight"));
    expect(marked).toEqual([all[6]]);
    expect(all[6]?.querySelector(".k-bar")).toHaveClass("bg-tertiary");
    expect(all[0]?.querySelector(".k-bar")).toHaveClass("k-bar-soft");
    expect(all[0]?.querySelector(".k-bar")).not.toHaveClass("bg-tertiary");
    // An empty day is a baseline stub, not an orange bar.
    expect(all[2]?.querySelector(".k-bar")).toHaveClass("bg-line-strong");
  });

  it("writes only the highlighted and the highest values when asked for the key ones", () => {
    const { container } = render(
      <BarChart values={orders} labels={days} highlight={6} valueLabels="key" label="x" />,
    );
    const written = Array.from(container.querySelectorAll("[data-value]")).map(
      (node) => node.textContent,
    );
    expect(written).toEqual(["8", "4"]);
  });

  it("is one image for screen readers, named with every day and value", () => {
    render(
      <BarChart
        values={[3, 5]}
        labels={["16", "17"]}
        tips={["16 Oct", "17 Oct"]}
        format={(v) => `${String(v)} orders`}
        label="Orders per day, last 7 days"
      />,
    );
    expect(
      screen.getByRole("img", {
        name: "Orders per day, last 7 days: 16 Oct 3 orders, 17 Oct 5 orders",
      }),
    ).toBeInTheDocument();
  });

  it("keeps time in the language's direction: oldest first in the DOM, no forced left-to-right", () => {
    const { container } = render(
      <div dir="rtl">
        <BarChart values={orders} labels={days} highlight={6} label="x" />
      </div>,
    );
    // The columns are a flex row in document order, so in Hebrew the first (oldest) sits at the
    // right and the newest at the left. The old dot columns forced `dir="ltr"`; nothing may.
    expect(bars(container).map((bar) => bar.getAttribute("data-bar"))).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
    expect(container.querySelector("[data-bar]")?.closest("[dir='ltr']")).toBeNull();
    expect(container.querySelector(".ltr [data-bar], [data-bar].ltr")).toBeNull();
  });

  it("shows a bar's name and value when it is tapped or focused", () => {
    const { container } = render(
      <BarChart values={[3, 5]} labels={["16", "17"]} tips={["16 Oct", "17 Oct"]} label="x" />,
    );
    const second = bars(container)[1];
    if (second === undefined) throw new Error("no bar");
    const tip = second.querySelector("[data-tip]");
    expect(tip).toHaveClass("opacity-0");
    expect(tip).not.toHaveClass("opacity-100");
    fireEvent.focus(second);
    expect(tip).toHaveClass("opacity-100");
    expect(tip).toHaveTextContent("17 Oct");
    expect(tip).toHaveTextContent("5");
    fireEvent.blur(second);
    expect(tip).not.toHaveClass("opacity-100");
  });
});

describe("LineChart", () => {
  it("draws a point per value, the highlighted one in full orange, with the summary", () => {
    const { container } = render(
      <LineChart
        values={[100, 400, 200]}
        labels={["Aug", "Sep", "Oct"]}
        highlight={2}
        format={(v) => `$${String(v)}`}
        label="Revenue per month"
      />,
    );
    const points = Array.from(container.querySelectorAll<HTMLElement>("[data-point]"));
    expect(points).toHaveLength(3);
    expect(points.filter((p) => p.hasAttribute("data-highlight"))).toEqual([points[2]]);
    expect(points[2]?.querySelector(".bg-tertiary")).not.toBeNull();
    // The highlighted and the highest values are written; the rest show on hover or tap.
    const written = Array.from(container.querySelectorAll("[data-value]")).map(
      (n) => n.textContent,
    );
    expect(written).toEqual(["$400", "$200"]);
    expect(
      screen.getByRole("img", { name: "Revenue per month: Aug $100, Sep $400, Oct $200" }),
    ).toBeInTheDocument();
    const line = container.querySelectorAll("path")[1]?.getAttribute("d") ?? "";
    expect(line.match(/[ML]/g)).toHaveLength(3);
  });

  it("mirrors its drawing with the document, so the newest month is at the left in Hebrew", () => {
    const { container } = render(
      <LineChart values={[1, 2, 3]} labels={["a", "b", "c"]} label="x" />,
    );
    expect(container.querySelector("svg")).toHaveClass("rtl:-scale-x-100");
    const points = Array.from(container.querySelectorAll<HTMLElement>("[data-point]"));
    expect(points.map((p) => p.getAttribute("data-point"))).toEqual(["0", "1", "2"]);
  });
});

describe("HBarList", () => {
  const items = [
    { key: "us", label: "United States", value: 30, text: "30" },
    { key: "de", label: "Germany", value: 15, text: "15" },
    { key: "il", label: "Israel", value: 5, text: "5" },
  ];

  it("is a named list whose rows keep their words, the bars scaled to the largest", () => {
    const { container } = render(<HBarList items={items} label="Where orders go" />);
    const list = screen.getByRole("list", { name: "Where orders go" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByText("Germany")).toBeInTheDocument();
    const widths = Array.from(container.querySelectorAll<HTMLElement>("[data-fill]")).map(
      (fill) => fill.style.width,
    );
    expect(widths).toEqual(["100%", "50%", `${String((5 / 30) * 100)}%`]);
  });

  it("puts the full orange on the highlighted row and scales to a given maximum", () => {
    const { container } = render(<HBarList items={items} label="x" max={100} />);
    const fills = Array.from(container.querySelectorAll<HTMLElement>("[data-fill]"));
    expect(fills[0]).toHaveClass("bg-tertiary");
    expect(fills[1]).toHaveClass("k-bar-soft");
    expect(fills.map((fill) => fill.style.width)).toEqual(["30%", "15%", "5%"]);
  });

  it("numbers a ranking", () => {
    render(<HBarList ranked items={items} label="Top" />);
    const list = screen.getByRole("list", { name: "Top" });
    expect(list.tagName).toBe("OL");
    expect(within(list).getByText("1")).toBeInTheDocument();
  });
});

describe("ProgressBar", () => {
  it("fills its share and names it", () => {
    const { container } = render(<ProgressBar value={2} max={3} label="2 of 3 done" />);
    expect(screen.getByRole("img", { name: "2 of 3 done" })).toBeInTheDocument();
    const fill = container.querySelector<HTMLElement>("[data-fill]");
    expect(Number.parseFloat(fill?.style.width ?? "")).toBeCloseTo(66.67, 1);
  });
});

describe("chart helpers", () => {
  it("reads a point without a name by its value", () => {
    expect(chartSummary("Events", ["00", ""], [4, 6], String)).toBe("Events: 00 4, 6");
  });

  it("hangs the edge tips inwards", () => {
    expect([0, 1, 2].map((i) => tipAt(i, 3))).toEqual(["start", "middle", "end"]);
  });
});
