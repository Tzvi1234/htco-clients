import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DemoRoute, loadDemoScreens } from "./DemoRoute.tsx";
import { LocaleProvider } from "../../shared/i18n/LocaleProvider.tsx";

function show() {
  return render(
    <LocaleProvider initialLocale="en" storage={undefined}>
      <DemoRoute area="work" tab="tasks" />
    </LocaleProvider>,
  );
}

describe("DemoRoute", () => {
  it("fetches an area's demo screens only when one of its tabs opens", async () => {
    // Nothing is bundled with the route itself: before its loader runs there is no screen.
    const before = show();
    expect(screen.getByRole("heading", { level: 1, name: "Tasks" })).toBeInTheDocument();
    expect(screen.queryByText("DEMO")).not.toBeInTheDocument();
    before.unmount();

    await loadDemoScreens("work");
    show();
    expect(screen.getByText("DEMO")).toBeInTheDocument();
    expect(screen.getByTestId("demo-content")).toHaveAttribute("inert");
  });

  it("does nothing for an area with no demo screens", async () => {
    await expect(loadDemoScreens("home")).resolves.toBeUndefined();
  });
});
