# Web shell — Security

## Repository and supply chain (slice 3.1)

| Element | Threat | Control | Test |
|---|---|---|---|
| npm dependencies | Tampering: a fresh malicious release, a worm spreading through install scripts, a package published without its usual provenance | Seven-day `minimumReleaseAge`; install scripts blocked unless allow-listed; `trustPolicy: no-downgrade`; exotic transitive sources blocked; lockfile committed; osv-scanner in CI | `security` job |
| CI workflow | Tampering and elevation of privilege | Actions pinned by SHA, `permissions: {}` with `contents: read` per job, no persisted credentials, pull request text only through environment variables | `workflows` job (actionlint, zizmor, `scripts/check-action-pins.ts`) |
| Repository | Information disclosure: committed secrets | gitleaks over the full history | `security` job |
| Tests | Repudiation: tests silently weakened | `scripts/test-integrity.ts` requires a "Test changes" explanation | `test-integrity` job |

## ASVS 5.0 requirements covered

| Requirement | How it is met | Evidence |
|---|---|---|
| v5.0.0-15.1.1 | Update time frames documented: seven-day release age, weekly Renovate updates | `pnpm-workspace.yaml`, `.github/renovate.json5` |
| v5.0.0-15.2.1 | Known-vulnerable locked versions fail CI | `security` job |
| v5.0.0-15.2.4 | Dependencies only from the npm registry; exotic transitive sources blocked | `pnpm-workspace.yaml` |
