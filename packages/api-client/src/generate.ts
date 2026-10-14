/**
 * Generates `generated/schema.d.ts` from the pinned `openapi.yaml` (slice 3.6).
 *
 * The OpenAPI document is copied from htco-platform's `packages/contracts/openapi.yaml` when the
 * API changes; a test fails when the generated types do not match it (AC-3.6.1), and any field
 * the platform removes breaks compilation where the web app still uses it.
 */
import { fileURLToPath } from "node:url";

import openapiTS, { astToString } from "openapi-typescript";

const SPEC = new URL("../openapi.yaml", import.meta.url);
export const GENERATED_PATH = fileURLToPath(new URL("../generated/schema.d.ts", import.meta.url));

const HEADER = `// Generated from openapi.yaml by \`pnpm --filter @htco/api-client generate\`. Do not edit.\n\n`;

export async function renderSchema(): Promise<string> {
  const ast = await openapiTS(SPEC, { exportType: false, alphabetize: true });
  return HEADER + astToString(ast);
}
