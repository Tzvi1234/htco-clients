import { describe, expect, it } from "vitest";

import { unpinnedUses } from "./check-action-pins.ts";

const SHA = "3d3c42e5aac5ba805825da76410c181273ba90b1";

describe("unpinnedUses (ER-SEC-09)", () => {
  it.each([
    `      - uses: actions/checkout@${SHA} # v7.0.1`,
    `    uses: pnpm/action-setup@${SHA}`,
    `      - uses: 'actions/checkout@${SHA}'`,
    `      - uses: "actions/checkout@${SHA}"`,
    `    uses: octo-org/shared/.github/workflows/build.yml@${SHA}`,
    "      - uses: ./.github/actions/setup",
    `      - uses: docker://alpine@sha256:${"a".repeat(64)}`,
  ])("accepts the pinned or local reference in %s", (line) => {
    expect(unpinnedUses(`steps:\n${line}\n`)).toEqual([]);
  });

  it.each([
    "actions/checkout@v7",
    "actions/checkout@v7.0.1",
    "actions/checkout@main",
    "actions/checkout@3d3c42e",
    "actions/checkout",
    "docker://alpine:3.22",
    `actions/checkout@${SHA.toUpperCase()}`,
  ])("reports %s with its line number", (reference) => {
    const text = `steps:\n  - name: Check out\n    uses: ${reference}\n`;

    expect(unpinnedUses(text)).toEqual([{ line: 3, reference }]);
  });

  it("ignores commented-out lines", () => {
    expect(unpinnedUses("steps:\n  # - uses: actions/checkout@v7\n")).toEqual([]);
  });
});
