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

### A screenshot test fails, or a new story has no baseline
Screenshots are compared only on Linux, in the Playwright image the `storybook` CI job runs in (`mcr.microsoft.com/playwright:v1.63.0-noble`, pinned by digest), because fonts render differently on Windows and macOS; elsewhere `pnpm test:e2e` still runs every axe and behaviour check and skips the screenshot assertions. A missing baseline fails the run (it is written in the runner only, for review); a screenshot that differs never overwrites its baseline.
1. **Check:** the failing run's `storybook-screenshots` artifact. `e2e/**/__screenshots__/` holds every baseline including the ones just written for missing screenshots; `test-results/` holds `<name>-actual.png`, `<name>-expected.png` and `<name>-diff.png` for each screenshot that changed.
2. **If the change is a bug:** fix the component; never update a baseline to get green.
3. **If the change is intended** (a new story, or a design change the owner approved): review every new or changed image, then copy the new baselines (or each `<name>-actual.png`, renamed to `<name>.png`) into `apps/web/e2e/**/__screenshots__/` and commit them with the change. To make them locally instead, run the suite in the same image: `docker run --rm -v "$PWD:/w" -w /w mcr.microsoft.com/playwright:v1.63.0-noble sh -c "corepack enable && pnpm install --frozen-lockfile && pnpm --filter @htco/web storybook:build && pnpm --filter @htco/web exec playwright test --project components --update-snapshots=changed"` (on a clean checkout: it installs Linux packages into `node_modules`).
4. **Tests time out waiting for a story:** its play function failed in the built Storybook; open it with `pnpm storybook` to see the interaction panel.
5. **Journeys** (`journeys-desktop`, `journeys-phone`) work the same way: their artifact is `journey-screenshots`, their baselines live in `apps/web/e2e/journeys/__screenshots__/` with the project in the name, and the same `docker run` with `--project journeys-desktop --project journeys-phone` (no Storybook build needed) makes them locally. A journey runs on the development server with `?demo`, so the in-memory API lives in the page: a journey must not reload the page unless it means to start again from the demo state.

## Deployment (slice 3.8)

The web app is the `web` static site of the App Platform app `htco`, defined in `htco-platform/infra/digitalocean/app.yaml`. App Platform builds `apps/web/Dockerfile` from `main` on every push (`deploy_on_push`) and serves `/src/apps/web/dist`; unknown paths get `index.html`, so client routes load directly.

### The site shows an old version
1. **Check:** the `web` component's latest deployment in App Platform (Activity).
2. **Likely cause:** the build failed (lockfile, Node version) and App Platform kept the previous version.
3. **Fix:** run `docker build -f apps/web/Dockerfile .` locally to reproduce, fix, merge.

### A page shows "Refused to apply inline style" in the console
1. **Likely cause:** a dependency upgrade changed the `<style>` React Aria injects, so its hash in `src/shared/security/csp.ts` no longer matches. The page still works, because `styles.css` repeats the rule.
2. **Fix:** copy the hash from the console message into `REACT_ARIA_PRESSABLE_STYLE`.
