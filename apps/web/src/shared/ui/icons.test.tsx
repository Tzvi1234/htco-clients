import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ArrowEndIcon,
  ArrowStartIcon,
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  CrumbIcon,
  SearchIcon,
  SidebarIcon,
  type IconComponent,
} from "./icons.tsx";
import { BackGlyph, CheckGlyph, NextGlyph, PlayGlyph, SendGlyph } from "./kit/glyphs.tsx";

const MIRROR = "rtl:-scale-x-100";

function classOf(Icon: IconComponent | typeof BackGlyph, className?: string): string {
  const { container } = render(<Icon className={className} />);
  return container.querySelector("svg")?.getAttribute("class") ?? "";
}

describe("icon mirroring (Hebrew RTL)", () => {
  it.each([
    ["CrumbIcon", CrumbIcon],
    ["ArrowEndIcon", ArrowEndIcon],
    ["ArrowStartIcon", ArrowStartIcon],
    ["SidebarIcon", SidebarIcon],
    ["BackGlyph", BackGlyph],
    ["NextGlyph", NextGlyph],
  ])("%s points along the reading direction and flips in right-to-left layouts", (_, Icon) => {
    expect(classOf(Icon).split(" ")).toContain(MIRROR);
  });

  it.each([
    ["CheckIcon", CheckIcon],
    ["CloseIcon", CloseIcon],
    ["SearchIcon", SearchIcon],
    ["ChevronIcon", ChevronIcon],
    ["CheckGlyph", CheckGlyph],
    ["PlayGlyph", PlayGlyph],
    ["SendGlyph", SendGlyph],
  ])("%s has a fixed meaning and never flips", (_, Icon) => {
    expect(classOf(Icon)).not.toContain("scale-x");
  });

  it("keeps the caller's classes beside the flip", () => {
    expect(classOf(ArrowEndIcon, "shrink-0").split(" ")).toEqual([MIRROR, "shrink-0"]);
  });
});
