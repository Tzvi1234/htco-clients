# <Feature name> — Design

## Screens and states

| Screen | States | Platforms |
|---|---|---|
| … | loading · empty · populated · error · stale · offline · no permission | web / android / windows |

## Components used

<From design/COMPONENT_SPEC.md. New components need the owner's agreement and a spec entry first.>

## Navigation

<Entry points and deep links; update docs/ux/NAVIGATION_MAP.md.>

## API consumed

| Endpoint | Purpose | Notes |
|---|---|---|
| `GET /v1/…` | … | pagination, caching, error mapping |

## Client state

<What is server state (TanStack Query, repositories), what is local UI state, what is persisted and where.>

## References

<Mobbin or other references studied for new patterns, with links.>

## Decisions and alternatives

| Decision | Alternatives | Why |
|---|---|---|
