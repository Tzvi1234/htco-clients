// The pinned OpenAPI copy (client ADR-0004) against the platform commit it was copied from
// (architecture audit 2026-10-23, finding 8.1). `packages/api-client/openapi.pin.json` names the
// repository, the commit and the file; the copy is that file as Prettier formats it here.
//
//   node scripts/openapi-pin.ts --check        fails when the copy differs from the pinned file
//   node scripts/openapi-pin.ts --pin <commit> copies the file at that commit and records it
//
// Then `pnpm api:generate` regenerates the types (a unit test fails while they drift).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { format, resolveConfig } from "prettier";

export interface Pin {
  repository: string;
  commit: string;
  path: string;
}

const PIN_FILE = join("packages", "api-client", "openapi.pin.json");
const SPEC_FILE = join("packages", "api-client", "openapi.yaml");
const COMMIT = /^[0-9a-f]{40}$/;
const REPOSITORY = /^[\w.-]+\/[\w.-]+$/;

/** The pin, refused unless it names a full commit SHA (a branch or tag can move). */
export function parsePin(text: string): Pin {
  const value: unknown = JSON.parse(text);
  if (typeof value !== "object" || value === null) throw new Error("the pin is not an object");
  const { repository, commit, path } = value as Record<string, unknown>;
  if (typeof repository !== "string" || !REPOSITORY.test(repository))
    throw new Error("the pin's repository must be owner/name");
  if (typeof commit !== "string" || !COMMIT.test(commit))
    throw new Error("the pin's commit must be a full 40-character SHA");
  if (typeof path !== "string" || path === "" || path.startsWith("/") || path.includes(".."))
    throw new Error("the pin's path must be a relative path inside the repository");
  return { repository, commit, path };
}

/** Where the pinned file is served as published at that commit. */
export function rawUrl(pin: Pin): string {
  return `https://raw.githubusercontent.com/${pin.repository}/${pin.commit}/${pin.path}`;
}

/** The platform's file as the pinned copy keeps it: formatted with this repository's Prettier. */
export async function asPinned(text: string, file = SPEC_FILE): Promise<string> {
  const options = (await resolveConfig(file)) ?? {};
  return format(text, { ...options, parser: "yaml" });
}

export async function fetchPinned(pin: Pin, fetcher: typeof fetch = fetch): Promise<string> {
  const response = await fetcher(rawUrl(pin));
  if (!response.ok)
    throw new Error(`${rawUrl(pin)} answered ${String(response.status)}; is the commit pushed?`);
  return response.text();
}

/** The first line where the copy and the pinned file part, or undefined when they match. */
export function firstDifference(copy: string, pinned: string): number | undefined {
  if (copy === pinned) return undefined;
  const a = copy.split("\n");
  const b = pinned.split("\n");
  for (let index = 0; index < Math.max(a.length, b.length); index += 1)
    if (a[index] !== b[index]) return index + 1;
  return undefined;
}

/** Compares the committed copy with the pinned commit's file; a message when they differ. */
export async function checkPin(
  root: string,
  fetcher: typeof fetch = fetch,
): Promise<string | undefined> {
  const pin = parsePin(readFileSync(join(root, PIN_FILE), "utf8"));
  const pinned = await asPinned(await fetchPinned(pin, fetcher), join(root, SPEC_FILE));
  const line = firstDifference(readFileSync(join(root, SPEC_FILE), "utf8"), pinned);
  if (line === undefined) return undefined;
  return (
    `${SPEC_FILE} differs from ${pin.repository}@${pin.commit.slice(0, 12)}:${pin.path} ` +
    `(first at line ${String(line)}). Copy it again with ` +
    `\`node scripts/openapi-pin.ts --pin ${pin.commit}\`, or pin the commit it came from.`
  );
}

async function main(args: string[]): Promise<number> {
  const root = process.cwd();
  if (args[0] === "--check") {
    const problem = await checkPin(root);
    if (problem === undefined) return 0;
    process.stderr.write(`${problem}\n`);
    return 1;
  }
  if (args[0] === "--pin" && args[1] !== undefined) {
    const current = parsePin(readFileSync(join(root, PIN_FILE), "utf8"));
    const pin = parsePin(JSON.stringify({ ...current, commit: args[1] }));
    writeFileSync(join(root, SPEC_FILE), await asPinned(await fetchPinned(pin)));
    writeFileSync(join(root, PIN_FILE), `${JSON.stringify(pin, null, 2)}\n`);
    process.stdout.write(`Pinned ${rawUrl(pin)}. Now run \`pnpm api:generate\`.\n`);
    return 0;
  }
  process.stderr.write("usage: node scripts/openapi-pin.ts --check | --pin <commit sha>\n");
  return 2;
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2));
