// Flag pull requests that weaken tests without a "Test changes" explanation (ER-TEST-07).
// Findings: skip, todo or focus markers added to tests (also after modifiers such as
// `test.concurrent.skip`); removed tests; changed or removed assertions; any added or removed
// line in a quality-gate config; changed `test`, `lint`, `typecheck` or `check` scripts. Any finding fails the check unless the pull
// request body explains it under "Test changes".
// CI: `PR_BODY=… node scripts/test-integrity.ts --base <base commit>`.
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";

export interface Finding {
  path: string;
  message: string;
}

interface ChangedLine {
  path: string;
  text: string;
  added: boolean;
}

const MARKER = "adds a skip, todo or focus marker";
const ASSERTION = "changes or removes an assertion";
const SETTINGS = "changes quality-gate settings";

// Vitest and Jest (`it.skip`, `describe.only`, `test.todo`, `it.skipIf`, `xit`), JUnit
// (`@Ignore`, `@Disabled`) and MSTest (`[Ignore]`).
const SKIP =
  /\b(?:it|test|describe|suite)(?:\.\w+)*\.(?:skip|only|todo|skipIf|runIf|fails)\b|\bx(?:it|test|describe)\(|@Ignore\b|@Disabled\b|\[Ignore\]/;
const TEST_NAME = /^\s*(?:it|test)(?:\.each\(.*?\))?\(\s*(["'`])(.+?)\1/;
const ASSERTS = /\bexpect\(|\bassert/;
const TEST_FILE = /(?:\.(?:test|spec)\.[cm]?[jt]sx?|\.stories\.tsx?|Tests?\.(?:kt|cs))$/;
const QUALITY_GATE_FILES = new Set([
  "vitest.config.ts",
  "eslint.config.js",
  "tsconfig.base.json",
  "tsconfig.json",
]);
// The package.json scripts that CI runs as gates.
const GATE_SCRIPT = /^\s*"(?:test|lint|typecheck|check)"\s*:/;

function changedLines(diff: string): ChangedLine[] {
  const lines: ChangedLine[] = [];
  let oldPath = "";
  let newPath = "";
  let inHeader = false;
  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("diff --git ")) inHeader = true;
    else if (inHeader && line.startsWith("--- ")) oldPath = line.slice(4).replace(/^a\//, "");
    else if (inHeader && line.startsWith("+++ ")) newPath = line.slice(4).replace(/^b\//, "");
    else if (line.startsWith("@@")) inHeader = false;
    else if (!inHeader && (line.startsWith("+") || line.startsWith("-"))) {
      const added = line.startsWith("+");
      const path = added || newPath !== "/dev/null" ? newPath : oldPath;
      lines.push({ path, text: line.slice(1), added });
    }
  }
  return lines;
}

/** Weakened tests and settings in `git diff --unified=0` output. */
export function diffFindings(diff: string): Finding[] {
  const lines = changedLines(diff);
  const tests = lines.filter((line) => TEST_FILE.test(line.path));
  const findings: Finding[] = [];

  for (const line of tests) {
    if (line.added && SKIP.test(line.text)) findings.push({ path: line.path, message: MARKER });
  }

  const addedNames = new Set(
    tests.filter((line) => line.added).flatMap((line) => TEST_NAME.exec(line.text)?.[2] ?? []),
  );
  for (const line of tests) {
    const name = TEST_NAME.exec(line.text)?.[2];
    if (!line.added && name !== undefined && !addedNames.has(name)) {
      findings.push({ path: line.path, message: `removes test ${JSON.stringify(name)}` });
    }
  }

  const addedTexts = new Set(tests.filter((line) => line.added).map((line) => line.text.trim()));
  for (const line of tests) {
    if (!line.added && ASSERTS.test(line.text) && !addedTexts.has(line.text.trim())) {
      findings.push({ path: line.path, message: ASSERTION });
    }
  }

  for (const line of lines) {
    const gateScript = line.path.endsWith("package.json") && GATE_SCRIPT.test(line.text);
    if (QUALITY_GATE_FILES.has(line.path) || gateScript) {
      findings.push({ path: line.path, message: SETTINGS });
    }
  }

  const seen = new Set<string>();
  return findings.filter(({ path, message }) => {
    const key = `${path}\u0000${message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const SECTION = /^#{2,3}\s*test changes\s*$([\s\S]*?)(?=^#{1,3}\s|(?![\s\S]))/im;
const EMPTY_ANSWERS = new Set(["", "none", "n/a", "na", "-"]);

/** True when the pull request body has a non-empty "Test changes" section. */
export function explainsTestChanges(body: string | undefined): boolean {
  const match = SECTION.exec((body ?? "").replaceAll("\r\n", "\n"));
  if (match === null) return false;
  const text = (match[1] ?? "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim()
    .replace(/\.$/, "")
    .toLowerCase();
  return !EMPTY_ANSWERS.has(text);
}

function main(): number {
  const { values } = parseArgs({ options: { base: { type: "string" } } });
  if (values.base === undefined) {
    process.stderr.write("usage: node scripts/test-integrity.ts --base <commit>\n");
    return 2;
  }
  const diff = execFileSync(
    "git",
    [
      "diff",
      "--unified=0",
      "--no-color",
      "--no-ext-diff",
      "--find-renames",
      `${values.base}...HEAD`,
    ],
    { encoding: "utf8" },
  );
  const findings = diffFindings(diff);
  if (findings.length === 0) return 0;
  const report = findings.map(({ path, message }) => `  ${path}: ${message}\n`).join("");
  if (explainsTestChanges(process.env["PR_BODY"])) {
    process.stderr.write(`Test changes found and explained in the pull request:\n${report}`);
    return 0;
  }
  process.stderr.write(
    `Test changes found:\n${report}` +
      "Explain them in the pull request's 'Test changes' section (ER-TEST-07).\n",
  );
  return 1;
}

if (import.meta.main) process.exitCode = main();
