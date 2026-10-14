// Fail when a workflow or composite action uses an action that is not pinned to a commit SHA
// (ER-SEC-09). Tags and branches can be moved to malicious code; a full commit SHA cannot.
// CI: `node scripts/check-action-pins.ts`.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface Unpinned {
  line: number;
  reference: string;
}

const USES = /^\s*(?:-\s+)?uses:\s*(\S+)/;
const PINNED_ACTION = /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/;
const PINNED_IMAGE = /^docker:\/\/\S+@sha256:[0-9a-f]{64}$/;

/** Every `uses:` reference in `text` that is neither local nor pinned to a commit or digest. */
export function unpinnedUses(text: string): Unpinned[] {
  const problems: Unpinned[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    const reference = USES.exec(line)?.[1]?.replace(/^['"]|['"]$/g, "");
    if (reference === undefined) return;
    if (reference.startsWith("./") || PINNED_IMAGE.test(reference)) return;
    if (!PINNED_ACTION.test(reference)) problems.push({ line: index + 1, reference });
  });
  return problems;
}

function workflowFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (directory: string): void => {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.ya?ml$/.test(entry.name)) files.push(path);
    }
  };
  walk(join(root, ".github", "workflows"));
  walk(join(root, ".github", "actions"));
  return files.sort();
}

function main(): number {
  const problems = workflowFiles(process.cwd()).flatMap((path) =>
    unpinnedUses(readFileSync(path, "utf8")).map(
      ({ line, reference }) => `${path}:${String(line)}: ${reference}`,
    ),
  );
  if (problems.length === 0) return 0;
  process.stderr.write(
    "Actions must be pinned to a full commit SHA (add the tag as a comment):\n" +
      problems.map((problem) => `  ${problem}\n`).join(""),
  );
  return 1;
}

if (import.meta.main) process.exitCode = main();
