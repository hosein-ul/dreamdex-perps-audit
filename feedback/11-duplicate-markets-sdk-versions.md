# One npm install of the bot kit ships two different versions of markets-sdk, and the perp money path uses only one
Severity: normal
Area: SDK

Package: dreamdex-bot-kit main (squash 2579866); `@somnia-chain/markets-sdk` resolved 0.30.0 (hoisted) and 0.31.0 (nested in packages/perp-core).

## Steps to reproduce
1. Clone the kit and install with the repo's documented manager:
   ```
   git clone https://github.com/somnia-chain/dreamdex-bot-kit && cd dreamdex-bot-kit
   npm install
   npm ls @somnia-chain/markets-sdk
   ```
2. Inspect both copies:
   ```
   (Get-Content node_modules/@somnia-chain/markets-sdk/package.json | Select-String '"version"')
   (Get-Content packages/perp-core/node_modules/@somnia-chain/markets-sdk/package.json | Select-String '"version"')
   ```
3. Note package.json constraints: `packages/perp-core/package.json` → `^0.31.0`; `packages/ec-core/package.json` → `^0.30.0`; root `package-lock.json` contains both a hoisted `node_modules/@somnia-chain/markets-sdk` at 0.30.0 and a nested `packages/perp-core/node_modules/...` at 0.31.0.

## Expected
One canonical mixer version per install: the kit's packages that read and decode the same receipts/ABIs should run one markets-sdk, or the README/docs should pin and test against the version per package. This matters doubly because the bot kit treats the SDK as its only receipt decoder (`decodePlaceOrder` / `contractErrorsAbi` in perp-core's operator path is THE money path: a perp order the chain accepted can surface to the bot as `orderId: undefined` if the table drifts).

## Actual
Two versions in one install:
- hoisted `node_modules/@somnia-chain/markets-sdk` → **0.30.0** (ec-core and any root-level import)
- nested `packages/perp-core/node_modules/@somnia-chain/markets-sdk` → **0.31.0** (perp-core only)

The two distributions genuinely differ (dist totals 6.10 MB vs 9.17 MB; differing file sets incl. `client.js`, `activity.js`; error-table related code counts differ, e.g. `Liq*` selectors 56 vs 115 matches). Anything the upgrade changes between 0.30 and 0.31 will be invisible to a workspace-level typecheck because each package compiles against its own resolved copy.

## Evidence
- `npm ls @somnia-chain/markets-sdk` output (run twice: same tree)
- version reads: `"version": "0.30.0"` (hoisted), `"version": "0.31.0"` (perp-core nested)
- size/file diffs quoted above (Compare-Object over dist trees)

## Environment
bot kit @ 2579866, node 24/npm 10 on Windows. Network n/a. Wallet n/a.

Impact: silent version split in the exact package that decodes perp receipt/fill events; the next 0.31 change (ABI/topic/error table) can break decode for perps while everything typechecks. Cheap to prevent at the repo level.
Suggested fix: agree both packages on one caret range (e.g. ^0.32.1, the version the app runs per dreamDEX dev docs), or add a CI check pinning a single resolved version (`npm why/ls` assertion in the existing checks.mjs).
