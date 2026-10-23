import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Chip, TEXT_LINK } from "./parts.tsx";

// The kit's chip and text link (audit 2026-10-23, P2-5): one source for the capsule classes
// that Products, Shops and the refund chip used to write by hand.
describe("Chip", () => {
  it("is a raised 24 px capsule by default", () => {
    render(<Chip>Policy</Chip>);
    const chip = screen.getByText("Policy");
    expect(chip.tagName).toBe("SPAN");
    expect(chip).toHaveClass("h-6", "px-2.5", "bg-raised", "text-caption");
  });

  it("takes the orange wash for what needs the owner, at 20 px in dense places", () => {
    render(
      <Chip tone="tertiary" size="sm" title="Sold out">
        Sold out
      </Chip>,
    );
    const chip = screen.getByTitle("Sold out");
    expect(chip).toHaveClass("h-5", "px-2", "bg-tertiary-subtle", "text-tertiary-text");
    expect(chip).not.toHaveClass("bg-raised");
  });

  it("renders as a list item inside a list of chips", () => {
    render(
      <ul>
        <Chip as="li">mugs</Chip>
      </ul>,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("mugs");
  });
});

describe("TEXT_LINK", () => {
  it("is underlined caption ink that quiets on hover", () => {
    expect(TEXT_LINK.split(" ")).toEqual(
      expect.arrayContaining(["text-caption", "text-primary", "underline", "hover:text-secondary"]),
    );
  });
});
