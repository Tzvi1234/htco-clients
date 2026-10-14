/** `pnpm --filter @htco/api-client generate`: rewrite the generated types from openapi.yaml. */
import { writeFile } from "node:fs/promises";

import { GENERATED_PATH, renderSchema } from "./generate.ts";

await writeFile(GENERATED_PATH, await renderSchema());
