import { MutationCache } from "@tanstack/react-query";
import { vi } from "vitest";

/**
 * Every mutation cache the app builds into from now on, to check that no secret (a link's
 * tokens, a password, an authenticator seed, an invitation link) is ever kept there as what was
 * sent, what came back or a stored error (Codex security review, owner gate v4).
 */
export function watchMutationCaches(): MutationCache[] {
  const caches: MutationCache[] = [];
  // The original, taken before the spy replaces it.
  const build = Object.getOwnPropertyDescriptor(MutationCache.prototype, "build")
    ?.value as MutationCache["build"];
  vi.spyOn(MutationCache.prototype, "build").mockImplementation(function (
    this: MutationCache,
    ...args: Parameters<MutationCache["build"]>
  ) {
    if (!caches.includes(this)) caches.push(this);
    return Reflect.apply(build, this, args);
  });
  return caches;
}

/** Everything the watched caches hold, as text. */
export function heldIn(caches: MutationCache[]): string {
  return JSON.stringify(
    caches.flatMap((cache) =>
      cache
        .getAll()
        .map((m) => [m.state.variables ?? null, m.state.data ?? null, String(m.state.error)]),
    ),
  );
}
