# Design tokens — Operations

## Runbook

### `pnpm check` fails with "is stale: run `pnpm tokens`"
1. **Cause:** a source token changed without regenerating, or a generated file was edited by hand.
2. **Fix:** `pnpm tokens`, review the diff of `packages/design-tokens/generated/`, commit it with the source change.

### `pnpm tokens` refuses to build
1. **Check:** the output names the theme, the pair and its ratio (for example `dark: text.muted on bg.sunken is 4.21:1 (needs 4.5:1)`).
2. **Fix:** adjust the semantic token in `design/tokens/semantic.<theme>.json`. A brand colour change needs the owner's approval and an ADR.
