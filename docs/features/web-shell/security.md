# Web shell — Security

## Repository and supply chain (slice 3.1)

| Element | Threat | Control | Test |
|---|---|---|---|
| npm dependencies | Tampering: a fresh malicious release, a worm spreading through install scripts, a package published without its usual provenance | Seven-day `minimumReleaseAge`; install scripts blocked unless allow-listed; `trustPolicy: no-downgrade`; exotic transitive sources blocked; lockfile committed; osv-scanner in CI | `security` job |
| CI workflow | Tampering and elevation of privilege | Actions pinned by SHA, `permissions: {}` with `contents: read` per job, no persisted credentials, pull request text only through environment variables | `workflows` job (actionlint, zizmor, `scripts/check-action-pins.ts`) |
| Repository | Information disclosure: committed secrets | gitleaks over the full history | `security` job |
| Tests | Repudiation: tests silently weakened | `scripts/test-integrity.ts` requires a "Test changes" explanation | `test-integrity` job |

## Sign-in in the browser (slices 3.5 web and 3.6)

| Element | Threat | Control | Test |
|---|---|---|---|
| Session | Information disclosure: a token stolen by injected script | No token reaches JavaScript: the API keeps tokens sealed on the server and sets an HttpOnly, `SameSite=Strict` cookie; the app writes nothing to web storage | `auth.test.tsx` (AC-3.5.1) |
| Unsafe requests | Spoofing: cross-site request forgery | The client sends `X-HTCO-CSRF: 1` on every non-GET request; the API also checks `Origin` | `client.test.ts` (AC-3.5.2) |
| Post-sign-in redirect | Spoofing: open redirect to a look-alike site | `safeRedirect` accepts only a same-site path | `auth.test.tsx`: "never follows a redirect to another site" |
| Dashboard | Elevation of privilege: an Owner or Admin with only a password | The route guard requires `aal2` for those roles; the API enforces it again on every request | `auth.test.tsx` (AC-3.5.3) |
| Error messages | Information disclosure: account enumeration | One message for an unknown email and a wrong password | `auth.test.tsx` |
| QR code | Tampering | Rendered only from the API's `data:` image; the CSP (slice 3.8) allows `img-src data:` and nothing third-party | Slice 3.8 |

## ASVS 5.0 requirements covered

| Requirement | How it is met | Evidence |
|---|---|---|
| v5.0.0-15.1.1 | Update time frames documented: seven-day release age, weekly Renovate updates | `pnpm-workspace.yaml`, `.github/renovate.json5` |
| v5.0.0-15.2.1 | Known-vulnerable locked versions fail CI | `security` job |
| v5.0.0-15.2.4 | Dependencies only from the npm registry; exotic transitive sources blocked | `pnpm-workspace.yaml` |
