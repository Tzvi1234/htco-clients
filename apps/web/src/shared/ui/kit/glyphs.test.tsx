import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ApprovalGlyph,
  BackGlyph,
  CheckGlyph,
  ChevronGlyph,
  CloseGlyph,
  CrumbGlyph,
  NextGlyph,
  PlayGlyph,
  SearchGlyph,
  SendGlyph,
  SidebarGlyph,
  type Glyph,
} from "./glyphs.tsx";

const MIRROR = "rtl:-scale-x-100";

function classOf(Icon: Glyph, className?: string): string {
  const { container } = render(<Icon className={className} />);
  return container.querySelector("svg")?.getAttribute("class") ?? "";
}

// One icon set (audit 2026-10-23, P1-1): the shell's arrows (ArrowEnd, ArrowStart) were the
// kit's Next and Back glyphs, so each is checked once.
describe("icon mirroring (Hebrew RTL)", () => {
  it.each([
    ["CrumbGlyph", CrumbGlyph],
    ["NextGlyph", NextGlyph],
    ["BackGlyph", BackGlyph],
    ["SidebarGlyph", SidebarGlyph],
  ])("%s points along the reading direction and flips in right-to-left layouts", (_, Icon) => {
    expect(classOf(Icon).split(" ")).toContain(MIRROR);
  });

  it.each([
    ["CheckGlyph", CheckGlyph],
    ["CloseGlyph", CloseGlyph],
    ["SearchGlyph", SearchGlyph],
    ["ChevronGlyph", ChevronGlyph],
    ["PlayGlyph", PlayGlyph],
    ["SendGlyph", SendGlyph],
    ["ApprovalGlyph", ApprovalGlyph],
  ])("%s has a fixed meaning and never flips", (_, Icon) => {
    expect(classOf(Icon)).not.toContain("scale-x");
  });

  it("keeps the caller's classes beside the flip", () => {
    expect(classOf(NextGlyph, "shrink-0").split(" ")).toEqual([MIRROR, "shrink-0"]);
  });

  it("draws the chevrons and the crumb on their 12 grid, the rest on 24", () => {
    const box = (Icon: Glyph) =>
      render(<Icon />)
        .container.querySelector("svg")
        ?.getAttribute("viewBox");
    expect(box(ChevronGlyph)).toBe("0 0 12 12");
    expect(box(CrumbGlyph)).toBe("0 0 12 12");
    expect(box(CheckGlyph)).toBe("0 0 24 24");
  });
});
