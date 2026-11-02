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
| Forgot password | Information disclosure: account enumeration | The page shows the same confirmation for every email, because the API answers 202 for every email | `passwordReset.test.tsx`: "says the same thing whether or not the account exists" |
| Reset and invitation links | Information disclosure: the link's session tokens read by script on the page (a compromised dependency or XSS) and replayed (Codex security review, owner gate v4) | The link goes to the API's link callback, which redeems it on the server and keeps the tokens in an `HttpOnly` cookie; the page gets a clean address (or `?link=invalid` / `too-many`) and posts only the password; it never parses the address for tokens | `passwordReset.test.tsx`: "sending only the password", "never reads a token from the address"; `team.test.tsx`: "sending only the password" |
| Secrets in the shared mutation cache | Information disclosure: passwords, authenticator seeds and invitation links kept in TanStack's mutation cache for minutes after the view (Codex security review) | Mutations return nothing and take no secret as variables; the values live in the view's state and go with it; `gcTime: 0` | `passwordReset.test.tsx`, `team.test.tsx`, `auth.test.tsx`: "out of the shared mutation cache" |
| Reset link | Elevation of privilege: a stolen inbox bypassing the authenticator app | The API requires the code (`mfa-code-required`); the page asks for it | `passwordReset.test.tsx`: "asks a user with an authenticator app for its code" |
| QR code | Tampering | Rendered only from the API's `data:` image; the CSP (slice 3.8) allows `img-src data:` and nothing third-party | Slice 3.8 |

## The deployed site (slice 3.8)

| Element | Threat | Control | Test |
|---|---|---|---|
| Built page | Tampering: injected script or style | CSP in a `<meta>`: `'self'` only, no `unsafe-*`, one hashed React Aria `<style>`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` | `csp.test.ts`; checked in a browser against the built page (a foreign `<style>` is blocked, the hashed one applies) |
| Transport | Information disclosure | `.app` is HSTS-preloaded in browsers; App Platform redirects HTTP to HTTPS | Live check after deploy |
| Framing | Spoofing: clickjacking | The app renders nothing inside a frame (`frame-ancestors` is ignored in a `<meta>`) | `csp.test.ts` |
| Referrer | Information disclosure: addresses leaking to other sites, or a page's query to this site's own asset requests (Codex security review) | `<meta name="referrer" content="no-referrer">`; API calls set `referrerPolicy: same-origin` so a POST keeps its `Origin` for the API's CSRF check | `csp.test.ts`, `client.test.ts` |

## ASVS 5.0 requirements covered

| Requirement | How it is met | Evidence |
|---|---|---|
| v5.0.0-15.1.1 | Update time frames documented: seven-day release age, weekly Renovate updates | `pnpm-workspace.yaml`, `.github/renovate.json5` |
| v5.0.0-15.2.1 | Known-vulnerable locked versions fail CI | `security` job |
| v5.0.0-15.2.4 | Dependencies only from the npm registry; exotic transitive sources blocked | `pnpm-workspace.yaml` |
