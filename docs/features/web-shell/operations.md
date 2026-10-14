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

## Deployment (slice 3.8)

The web app is the `web` static site of the App Platform app `htco`, defined in `htco-platform/infra/digitalocean/app.yaml`. App Platform builds `apps/web/Dockerfile` from `main` on every push (`deploy_on_push`) and serves `/src/apps/web/dist`; unknown paths get `index.html`, so client routes load directly.

### The site shows an old version
1. **Check:** the `web` component's latest deployment in App Platform (Activity).
2. **Likely cause:** the build failed (lockfile, Node version) and App Platform kept the previous version.
3. **Fix:** run `docker build -f apps/web/Dockerfile .` locally to reproduce, fix, merge.

### A page shows "Refused to apply inline style" in the console
1. **Likely cause:** a dependency upgrade changed the `<style>` React Aria injects, so its hash in `src/shared/security/csp.ts` no longer matches. The page still works, because `styles.css` repeats the rule.
2. **Fix:** copy the hash from the console message into `REACT_ARIA_PRESSABLE_STYLE`.
