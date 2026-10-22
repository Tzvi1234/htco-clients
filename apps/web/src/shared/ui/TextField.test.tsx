import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextField } from "./TextField.tsx";

describe("TextField direction (Hebrew RTL)", () => {
  it("lets a free-text value pick its own direction, so English typed in Hebrew stays readable", () => {
    render(<TextField label="שם" />);
    expect(screen.getByRole("textbox", { name: "שם" })).toHaveAttribute("dir", "auto");
  });

  it("keeps codes and email addresses left-to-right", () => {
    render(<TextField label="אימייל" type="email" ltr />);
    expect(screen.getByRole("textbox", { name: "אימייל" })).toHaveAttribute("dir", "ltr");
  });
});
