// Check that a pull request title or commit header follows Conventional Commits (ER-GIT-02).
// CI: `node scripts/conventional-commit.ts --title "$PR_TITLE"`.
import { parseArgs } from "node:util";

export const MAX_HEADER_LENGTH = 100;

const TYPES = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
] as const;

// type, optional lower-case scope, optional "!", then ": " and a non-empty subject.
const HEADER = new RegExp(`^(?:${TYPES.join("|")})(?:\\([a-z0-9][a-z0-9._-]*\\))?!?: \\S.*$`);
// Headers Git writes itself for merges, reverts and autosquash fixups.
const GIT_GENERATED = ["Merge ", 'Revert "', "fixup! ", "squash! ", "amend! "];

const HELP =
  "Expected a Conventional Commits header such as 'feat(web): add the shop switcher'.\n" +
  `Types: ${TYPES.join(", ")}. Scope is optional and lower case; '!' marks a breaking change; ` +
  `at most ${String(MAX_HEADER_LENGTH)} characters.`;

/** Why `header` is not a valid Conventional Commits header, or undefined when it is. */
export function headerProblem(header: string): string | undefined {
  if (header.trim() === "") return "The header is empty.";
  if (GIT_GENERATED.some((prefix) => header.startsWith(prefix))) return undefined;
  if (header.length > MAX_HEADER_LENGTH) {
    return `The header is ${String(header.length)} characters long (max ${String(MAX_HEADER_LENGTH)}).`;
  }
  if (!HEADER.test(header)) {
    return `The header ${JSON.stringify(header)} does not start with a valid type, scope and subject.`;
  }
  return undefined;
}

function main(): number {
  const { values } = parseArgs({ options: { title: { type: "string" } } });
  if (values.title === undefined) {
    process.stderr.write("usage: node scripts/conventional-commit.ts --title <title>\n");
    return 2;
  }
  const problem = headerProblem(values.title);
  if (problem === undefined) return 0;
  process.stderr.write(`${problem}\n${HELP}\n`);
  return 1;
}

if (import.meta.main) process.exitCode = main();
