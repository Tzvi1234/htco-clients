# Security Policy

## Reporting a vulnerability

Please do not open a public issue for security problems. Email **security@office.ht-co.app** with a description, steps to reproduce and the expected impact. We aim to acknowledge reports within 3 business days. Until that mailbox is live (inbound mail arrives in Phase 12), contact the repository owner directly through GitHub.

## Scope

The web, Windows and Android clients and their build and release pipelines. The API and data layer are covered by the `htco-platform` repository's policy.

## Our client security baseline

- The web app never exposes authentication tokens to JavaScript: sessions use `__Host-` HttpOnly, Secure, SameSite=Strict cookies, with CSRF protection and a strict Content Security Policy.
- Native apps store tokens only in platform-secure storage (Android Keystore-backed encryption; Windows Credential Locker or DPAPI) and use server-verified device keys for biometric step-up.
- No secrets, API keys or service credentials in any client.
- Buyer data is masked unless the user's role allows it; logout clears caches, push registration and live subscriptions.
- Release builds are signed (MSIX, Android app bundles).
