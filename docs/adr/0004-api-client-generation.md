# Client ADR-0004: Generated API clients from a pinned OpenAPI copy

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** Owner, engineering

## Context

The platform publishes an OpenAPI 3.1 document. Hand-written clients drift from the server and hide breaking changes until runtime.

## Decision

- `packages/api-clients/openapi.yaml` is a pinned copy of the platform's contract, updated by pull request.
- **TypeScript:** openapi-typescript + openapi-fetch + openapi-react-query; MSW handlers typed with openapi-msw.
- **Kotlin:** openapi-generator (`kotlin`, `jvm-retrofit2`, kotlinx serialization).
- **C#:** Kiota, behind an `IHtcoApi` facade so the generator can be replaced.
- A CI job regenerates every client when the pinned copy changes and fails on compile errors or uncommitted output. The platform runs a breaking-change check (oasdiff) on every API change.
- The platform keeps its schema generator-friendly (nullable fields instead of open unions).

## Revision — 2026-10-15 (slice 3.6)

- The package is `packages/api-client` (`@htco/api-client`); the pinned copy is `packages/api-client/openapi.yaml`.
- TanStack Query is used through small `queryOptions` factories over openapi-fetch (`apps/web/src/shared/api/`) instead of openapi-react-query: the route guards need the same options outside React.
- Web tests pass an in-memory fetch (`apps/web/src/test/fakeApi.ts`) to the client instead of MSW: no service worker or global patching, and the fake refuses requests without the CSRF header, like the API.
- The drift check is a unit test (`packages/api-client/test/client.test.ts`) that compares the committed output with a fresh generation.

## Revision — 2026-10-28 (architecture audit finding 8.1)

- `packages/api-client/openapi.pin.json` names the platform repository, the full commit SHA and the file the copy came from. The copy is that file formatted with this repository's Prettier.
- `node scripts/openapi-pin.ts --pin <commit>` copies the file at a commit and records it; `pnpm api:generate` then regenerates the types.
- CI's `checks` job runs `node scripts/openapi-pin.ts --check`: it fetches the file at the pinned commit from `raw.githubusercontent.com` and fails when the copy differs.
- A copy taken from an open platform pull request names that pull request's head commit, and is pinned again to the platform's `main` once it merges.

## Consequences

- Positive: a server change that breaks a client fails CI before release.
- Negative: generator quirks with OpenAPI 3.1 nullables need a spike per generator (Phases 3, 14 and 15).
