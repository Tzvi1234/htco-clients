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

## Consequences

- Positive: a server change that breaks a client fails CI before release.
- Negative: generator quirks with OpenAPI 3.1 nullables need a spike per generator (Phases 3, 17 and 18).
