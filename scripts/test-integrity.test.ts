import { describe, expect, it } from "vitest";

import { diffFindings, explainsTestChanges } from "./test-integrity.ts";

function aDiff(path: string, lines: string[], { deleted = false } = {}): string {
  const target = deleted ? "/dev/null" : `b/${path}`;
  return (
    `diff --git a/${path} b/${path}\nindex 1111111..2222222 100644\n--- a/${path}\n+++ ${target}\n` +
    `@@ -1,2 +1,2 @@\n${lines.map((line) => `${line}\n`).join("")}`
  );
}

const TEST_FILE = "packages/design-tokens/test/contrast.test.ts";

describe("diffFindings (ER-TEST-07)", () => {
  it.each([
    '+  it.skip("passes AA on every surface", () => {',
    '+describe.skip("contrast", () => {',
    '+  it.only("passes AA on every surface", () => {',
    '+  test.todo("checks the dark theme")',
    "+  it.skipIf(process.platform === 'win32')('writes files', () => {",
    '+  xit("passes AA", () => {',
    "+    @Ignore",
    "+    [Ignore]",
    '+  test.concurrent.skip("checks the dark theme", () => {',
    '+describe.concurrent.todo("contrast")',
    '+  it.sequential.only("passes AA", () => {',
  ])("reports a skip, todo or focus marker added in a test: %s", (added) => {
    expect(diffFindings(aDiff(TEST_FILE, [added]))).toEqual([
      { path: TEST_FILE, message: "adds a skip, todo or focus marker" },
    ]);
  });

  it("ignores skip markers outside test files", () => {
    expect(diffFindings(aDiff("docs/README.md", ["+Never commit it.skip."]))).toEqual([]);
  });

  it("reports a removed test", () => {
    const diff = aDiff(TEST_FILE, ['-  it("passes AA on every surface", () => {']);

    expect(diffFindings(diff)).toEqual([
      { path: TEST_FILE, message: 'removes test "passes AA on every surface"' },
    ]);
  });

  it("does not report a test moved to another file", () => {
    const diff =
      aDiff(TEST_FILE, ['-  it("passes AA", () => {']) +
      aDiff("packages/design-tokens/test/aa.test.ts", ['+  it("passes AA", () => {']);

    expect(diffFindings(diff)).toEqual([]);
  });

  it("reports a changed assertion", () => {
    const diff = aDiff(TEST_FILE, [
      "-    expect(ratio).toBeGreaterThanOrEqual(4.5);",
      "+    expect(ratio).toBeGreaterThanOrEqual(3);",
    ]);

    expect(diffFindings(diff)).toEqual([
      { path: TEST_FILE, message: "changes or removes an assertion" },
    ]);
  });

  it("does not report an assertion moved unchanged", () => {
    const diff =
      aDiff(TEST_FILE, ["-    expect(ratio).toBe(1);"]) +
      aDiff("packages/design-tokens/test/aa.test.ts", ["+      expect(ratio).toBe(1);"]);

    expect(diffFindings(diff)).toEqual([]);
  });

  it.each(["vitest.config.ts", "eslint.config.js", "tsconfig.base.json", "tsconfig.json"])(
    "reports a changed quality-gate setting in %s",
    (path) => {
      const diff = aDiff(path, ["-    strict: true,", "+    strict: false,"]);

      expect(diffFindings(diff)).toEqual([{ path, message: "changes quality-gate settings" }]);
    },
  );

  it("reports a quality-gate setting added without removing anything", () => {
    const diff = aDiff("vitest.config.ts", [
      '+    exclude: ["**"],',
      "+    passWithNoTests: true,",
    ]);

    expect(diffFindings(diff)).toEqual([
      { path: "vitest.config.ts", message: "changes quality-gate settings" },
    ]);
  });

  it.each([
    ['-    "test": "vitest run",', '+    "test": "true",'],
    ['+    "lint": "true",'],
    ['-    "typecheck": "tsc --project tsconfig.json",'],
    ['-    "check": "pnpm run lint && pnpm run typecheck && pnpm run test",'],
  ])("reports a changed quality-gate script in package.json: %s", (...lines) => {
    expect(diffFindings(aDiff("package.json", lines))).toEqual([
      { path: "package.json", message: "changes quality-gate settings" },
    ]);
  });

  it("ignores dependency changes in package.json", () => {
    const diff = aDiff("package.json", ['-    "vitest": "5.0.2",', '+    "vitest": "5.0.3",']);

    expect(diffFindings(diff)).toEqual([]);
  });

  it("ignores pure additions of new tests", () => {
    const diff = aDiff(TEST_FILE, [
      '+  it("checks focus rings", () => {',
      "+    expect(1).toBe(1);",
    ]);

    expect(diffFindings(diff)).toEqual([]);
  });

  it("reports every test of a deleted test file", () => {
    const diff = aDiff(TEST_FILE, ['-it("a", () => {', '-it("b", () => {'], { deleted: true });

    expect(diffFindings(diff).map((finding) => finding.message)).toEqual([
      'removes test "a"',
      'removes test "b"',
    ]);
  });
});

describe("explainsTestChanges", () => {
  const template =
    '## Test changes\n\n<!-- Required if any existing test changed. Otherwise write "None". -->\n\n';

  it.each([
    undefined,
    "",
    "## What and why\n\nStuff.\n",
    `${template}## Checklist\n`,
    `${template}None\n\n## Checklist\n`,
    `${template}None.\n`,
    `${template}N/A\n`,
  ])("is false for %j", (body) => {
    expect(explainsTestChanges(body)).toBe(false);
  });

  it.each([
    `${template}Removed the old contrast test: the pairs moved to a table test.\n\n## Checklist\n`,
    "### Test changes\nThe expected ratio was wrong: WCAG rounds down.\n",
    "## test changes\r\n\r\nSkipped on Windows until #12 is fixed.\r\n",
  ])("is true for a written explanation", (body) => {
    expect(explainsTestChanges(body)).toBe(true);
  });
});
