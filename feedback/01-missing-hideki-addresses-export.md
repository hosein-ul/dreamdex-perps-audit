# SOMNIA_HIDEKI_TESTNET_ADDRESSES export missing in Markets SDK <= 0.31.0 as specified in official docs
Severity: major
Area: docs

## Steps to reproduce
1. Follow the official dreamDEX Perps Developer Quickstart documentation at `https://app.testnet.dreamdex.io/docs/developers/perps-testnet` or clone the official `somnia-chain/dreamdex-bot-kit` repository.
2. In a clean Node.js ESM environment with `@somnia-chain/markets-sdk` installed at version `0.30.0` or `0.31.0` (as pinned in the root `package.json` and workspaces of `dreamdex-bot-kit`), execute the documented import:
   ```ts
   import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk";
   ```
3. Alternatively, run the automated verification script:
   ```bash
   node poc/repro_01_missing_addresses_export.mjs
   ```

## Expected
The `@somnia-chain/markets-sdk` package should export `SOMNIA_HIDEKI_TESTNET_ADDRESSES` containing the canonical contract address registry for the Somnia Hideki testnet (chain ID 50383), allowing developers to initialize `SomniaMarkets` without syntax or import errors.

## Actual
The import crashes immediately with an unhandled Node.js module resolution error:
```
SyntaxError: The requested module '@somnia-chain/markets-sdk' does not provide an export named 'SOMNIA_HIDEKI_TESTNET_ADDRESSES'
```
Inspection of exported symbols in versions `<= 0.31.0` reveals only `SOMNIA_MAINNET_ADDRESSES` and `SOMNIA_TESTNET_ADDRESSES` (which points to Shannon testnet chain 50312, not Hideki chain 50383).

## Evidence
Execution log from `poc/repro_01_missing_addresses_export.mjs`:
```text
--- Testing @somnia-chain/markets-sdk exports in dreamdex-bot-kit ---
Installed version in bot kit: 0.31.0
Export SOMNIA_HIDEKI_TESTNET_ADDRESSES present: false
Exported address constants: [ 'SOMNIA_MAINNET_ADDRESSES', 'SOMNIA_TESTNET_ADDRESSES' ]

[RESULT: CONFIRMED BUG]
Developer documentation instructs developers to write:
  import { SOMNIA_HIDEKI_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk"
However, in version 0.31.0 (used in dreamdex-bot-kit), this export does not exist,
causing immediate runtime crash: Named export 'SOMNIA_HIDEKI_TESTNET_ADDRESSES' not found.
```

## Environment
- SDK version: `@somnia-chain/markets-sdk@0.31.0` (as pinned by `dreamdex-bot-kit`)
- Network: Somnia Hideki Testnet (chain ID `50383`)
- Wallet address: N/A (compile/import time failure)

## Impact
New builders following the developer quickstart fail at line 1 of the integration guide. Furthermore, projects depending on `dreamdex-bot-kit` cannot build against the documented SDK configuration without either upgrading to `0.32.1` or manually polyfilling the address object.

## Suggested fix
1. Update `package.json` across `dreamdex-bot-kit` packages to require `@somnia-chain/markets-sdk >= 0.32.1`.
2. In developer documentation, add a clear note indicating that `SOMNIA_HIDEKI_TESTNET_ADDRESSES` was introduced in SDK version `0.32.1` and is incompatible with earlier releases.
