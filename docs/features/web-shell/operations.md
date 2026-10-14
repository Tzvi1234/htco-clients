# Web shell — Operations

Nothing runs in production yet; this is how to keep the client toolchain healthy.

## Runbook

### `pnpm install` fails with "ignored builds"
1. **Likely cause:** a new dependency has an install script, which pnpm blocks until reviewed.
2. **Fix:** read what the script does; if it is needed and safe, add the package to `allowBuilds` in `pnpm-workspace.yaml` in the same pull request, with a comment saying why.

### `pnpm install` cannot find a version
1. **Likely cause:** it is younger than seven days (`minimumReleaseAge`).
2. **Fix:** wait; for an urgent security fix, add the package to `minimumReleaseAgeExclude` with a comment and an expiry.

### `pnpm` refuses to run because of its version
1. **Check:** `pnpm --version` against `packageManager` in `package.json`.
2. **Fix:** `corepack enable`, or let a recent pnpm switch versions by itself (it does when not run under corepack).
