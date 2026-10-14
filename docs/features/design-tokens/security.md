# Design tokens — Security

Build-time only: no runtime code, no data, no network.

| Element | Threat | Control | Test |
|---|---|---|---|
| Build dependency | Tampering: a compromised Style Dictionary release | Exact version, seven-day release age, lockfile, osv-scanner; it only reads our JSON | `security` job |
| Generated files | Tampering: hand edits that bypass review of the source | Drift test fails unless outputs equal the source's build | `build.test.ts` |
