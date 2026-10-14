import { describe, expect, it } from "vitest";

import { headerProblem, MAX_HEADER_LENGTH } from "./conventional-commit.ts";

describe("headerProblem (ER-GIT-02)", () => {
  it.each([
    "feat: add the token pipeline",
    "fix(web): keep the request id on errors",
    "feat(tokens)!: rename the surface tokens",
    "build(deps): bump vitest to 5.0.3",
    "ci(security): pin actions by commit SHA",
    "docs: explain the workspace",
    "test(tokens): contrast fails below AA (red)",
    "refactor(design-tokens): split the formats",
    "revert: feat(web): add the shop switcher",
  ])("accepts %s", (header) => {
    expect(headerProblem(header)).toBeUndefined();
  });

  it.each([
    ["Add the token pipeline", "type"],
    ["feature: add the token pipeline", "type"],
    ["Feat: add the token pipeline", "type"],
    ["feat:add the token pipeline", "type"],
    ["feat(): add the token pipeline", "type"],
    ["feat(Web): add the token pipeline", "type"],
    ["feat: ", "type"],
    ["", "empty"],
    [`feat: ${"x".repeat(95)}`, "long"],
  ])("rejects %j because of its %s", (header, reason) => {
    expect(headerProblem(header)).toContain(reason);
  });

  it.each([
    "Merge branch 'main' into build/workspace-tooling",
    'Revert "feat(web): add the shop switcher"',
    "fixup! feat: add the token pipeline",
    "squash! feat: add the token pipeline",
  ])("accepts the Git-generated header %s", (header) => {
    expect(headerProblem(header)).toBeUndefined();
  });

  it("accepts a header of exactly the maximum length", () => {
    const header = `feat: ${"x".repeat(MAX_HEADER_LENGTH - 6)}`;

    expect(header).toHaveLength(MAX_HEADER_LENGTH);
    expect(headerProblem(header)).toBeUndefined();
  });
});
