import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterChips } from "./form.tsx";

// The one filter chip row of the kit (audit 2026-10-23, P1-3): Orders' states, Products'
// sections and the shop chips all use it.
describe("FilterChips", () => {
  const options = [
    { id: "all", label: "All", count: 12 },
    { id: "late", label: "Late", count: 1 },
    { id: "mugs", label: "Mugs" },
  ] as const;

  it("is a named group of toggle buttons with the chosen one pressed", () => {
    render(<FilterChips label="Status" value="late" onChange={vi.fn()} options={options} />);
    const group = screen.getByRole("group", { name: "Status" });
    expect(within(group).getAllByRole("button")).toHaveLength(3);
    expect(within(group).getByRole("button", { name: /^Late/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(group).getByRole("button", { name: /^All/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows a count after the name only when there is one", () => {
    render(<FilterChips label="Status" value="all" onChange={vi.fn()} options={options} />);
    expect(screen.getByRole("button", { name: /^All\s*12$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mugs" })).toBeInTheDocument();
  });

  it("reports the chosen chip, by keyboard too", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterChips label="Status" value="all" onChange={onChange} options={options} />);
    await user.click(screen.getByRole("button", { name: "Mugs" }));
    expect(onChange).toHaveBeenLastCalledWith("mugs");
    screen.getByRole("button", { name: /^Late/ }).focus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("late");
  });
});
