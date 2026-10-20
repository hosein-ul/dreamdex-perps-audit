# dreamDEX Perps Testing & Audit Log

## Progress Summary
- **Phase 1 (Recon)**: Completed.
  - Official docs, platform SDK docs, bot kit repo, contract ABIs, and live on-chain parameters fetched and analyzed.
  - Created `recon/LINKS.md`, `recon/ARCHITECTURE.md`, `recon/ATTACK_SURFACE.md`, and dumped 21 live markets into `recon/onchain_markets.json`.
- **Phase 2 (Threat Model)**: Completed.
  - Ranked hypotheses created in `recon/HYPOTHESES.md`.
- **Phase 3 (Testing & Verification)**: Completed.
  - Built 6 automated, executable PoC test scripts in `poc/`.
- **Phase 4 (Verify and Triage)**: Completed.
  - Verified every finding twice against real Somnia Hideki testnet RPC/contracts.
- **Phase 5 (Reporting)**: Completed.
  - Generated 6 standardized markdown reports in `feedback/` and index in `feedback/INDEX.md`.
  - Created `private-security/INDEX.md` documenting evaluated security boundaries.

---

## Testing Matrix & Execution Log

| Test ID | Area | Target / Method | Status | Finding / Evidence | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `TEST-DISC-01` | Docs / SDK | `SOMNIA_HIDEKI_TESTNET_ADDRESSES` export in SDK <= 0.31.0 | **FAIL** (Confirmed Bug) | Developer docs recommend importing `SOMNIA_HIDEKI_TESTNET_ADDRESSES` from `@somnia-chain/markets-sdk`, but it was omitted until 0.32.1. In `dreamdex-bot-kit` (pinned to 0.31.0), importing it throws `SyntaxError / ERR_MODULE_NOT_FOUND`. | Reported as `01-missing-hideki-addresses-export.md` |
| `TEST-DISC-02` | SDK / Contracts | Bundled `collateral` address in `SOMNIA_HIDEKI_TESTNET_ADDRESSES` | **FAIL** (Confirmed Bug) | In SDK 0.32.1, `SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral` is set to `0x9E9492cC533E8696A3b6afC7df730800DF75148f` (tUSDC, 6 decimals). But on-chain `MarginBank.collateralToken` is `0xed7993A74dAe1e6656B704A424DcD8711aAf4F72` (USDso, 18 decimals). Any code using `addresses.collateral` interacts with the wrong token! | Reported as `02-bundled-collateral-address-mismatch.md` |
| `TEST-DISC-03` | SDK / Stop Orders | Missing `operatorRegistry` in SDK address sets | **FAIL** (Confirmed Bug) | Neither `SOMNIA_HIDEKI_TESTNET_ADDRESSES` nor `SOMNIA_TESTNET_ADDRESSES` defines `operatorRegistry`. Calling `placePerpStopOrder` without an explicit override throws `NotConfiguredError`. | Reported as `03-missing-operator-registry-in-sdk-addresses.md` |
| `TEST-DISC-04` | Docs / Markets | Documented market count vs live on-chain deployment | **FAIL** (Confirmed Gap) | `somnia-markets/contracts.md` documents only 15 perp markets. The live testnet runs 21 markets (ZRO, LIT, VVV, 1000PEPE, PUMP, ZEC are missing from the raw contracts table). | Reported as `05-undocumented-perp-markets.md` |
| `TEST-LEVER-01` | Contracts / SDK | `setPerpLeverage` idempotency revert `NoStateChange()` | **FAIL** (Confirmed Bug) | `MarginBank.setMaxLeverage` reverts with `NoStateChange()` when setting the same leverage value. The Markets SDK `exchange.trader.setPerpLeverage` has no idempotency check, does not pre-read `getMaxLeverage`, and crashes bot restarts. | Reported as `04-unhandled-nostatechange-revert-in-setleverage.md` |
| `TEST-SDK-01` | SDK / Operator | Missing Perp Operator methods (`placePerpOrderFor`, etc.) | **FAIL** (Confirmed Gap) | Markets SDK Trader class lacks all Perp Operator execution methods (`placePerpOrderFor`, `cancelPerpOrderFor`, `reducePerpOrderFor`), forcing developers to construct raw viem transactions and decoders. | Reported as `06-missing-perp-operator-for-methods-in-sdk.md` |
| `TEST-AUTH-01` | Contracts / Auth | Operator key attempting unauthorized withdrawal on MarginBank | **PASS** (Secure) | `MarginBank.withdraw(amount)` has no delegation/owner parameter and only transfers funds to `msg.sender` from `msg.sender`'s own account. No operator withdrawal exploit is possible. | Documented in `private-security/INDEX.md` |
| `TEST-AUTH-02` | Contracts / Auth | Unauthorized operator calling `placeOrderFor` | **PASS** (Secure) | `PerpPool.placeOrderFor` checks `isOperatorAuthorized`. Calls from unapproved operators revert immediately on-chain with `OnlyApprovedContracts()`. | Documented in `private-security/INDEX.md` |
| `TEST-MATH-01` | SDK / Units | Base decimals scaling across 6, 7, 8, 9, 18, 24 decimals | **PASS** (Verified) | Quote token is consistently USDso (18 decimals). Prices and ticks are consistently 18 decimals across all 21 markets. Quantities and lot sizes scale according to each market's `baseDecimals`. | Verified in `scripts/perp-doctor.ts` |
