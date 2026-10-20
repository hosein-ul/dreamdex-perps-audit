# dreamDEX Perps Bug Bounty & Feedback Reports

This index tracks all validated, reproducible reports submitted under the dreamDEX Perps Bounty program (Somnia Hideki testnet).

---

## Findings Matrix

| File | Title | Severity | Area | Confidence | Reproduced |
| :--- | :--- | :---: | :---: | :---: | :---: |
| [`01-missing-hideki-addresses-export.md`](01-missing-hideki-addresses-export.md) | `SOMNIA_HIDEKI_TESTNET_ADDRESSES` export missing in Markets SDK <= 0.31.0 as specified in official docs | major | docs / SDK | High | Yes (2026-10-20) |
| [`02-bundled-collateral-address-mismatch.md`](02-bundled-collateral-address-mismatch.md) | Bundled `SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral` points to 6-decimal tUSDC instead of 18-decimal USDso | major | SDK / contracts | High | Yes (2026-10-20) |
| [`03-missing-operator-registry-in-sdk-addresses.md`](03-missing-operator-registry-in-sdk-addresses.md) | `operatorRegistry` missing from `SOMNIA_HIDEKI_TESTNET_ADDRESSES`, causing `placePerpStopOrder` to fail with `NotConfiguredError` | major | SDK | High | Yes (2026-10-20) |
| [`04-unhandled-nostatechange-revert-in-setleverage.md`](04-unhandled-nostatechange-revert-in-setleverage.md) | `trader.setPerpLeverage` lacks idempotency check, causing on-chain `NoStateChange` revert on repeated executions | normal | SDK / contracts | High | Yes (2026-10-20) |
| [`05-undocumented-perp-markets.md`](05-undocumented-perp-markets.md) | Six live perp markets (ZEC, PUMP, 1000PEPE, VVV, LIT, ZRO) omitted from raw contract integration table in documentation | normal | docs | High | Yes (2026-10-20) |
| [`06-missing-perp-operator-for-methods-in-sdk.md`](06-missing-perp-operator-for-methods-in-sdk.md) | Markets SDK Trader lacks `placePerpOrderFor`, `cancelPerpOrderFor`, and `reducePerpOrderFor` methods | major | SDK | High | Yes (2026-10-20) |

---

## Verification Scripts
All reports are backed by executable, automated verification scripts located in [`poc/`](../poc/):
- `poc/repro_01_missing_addresses_export.mjs`
- `poc/repro_02_collateral_address_mismatch.mjs`
- `poc/repro_03_missing_operator_registry.mjs`
- `poc/repro_04_set_leverage_revert.mjs`
- `poc/repro_05_undocumented_markets.mjs`
- `poc/repro_06_missing_perp_for_methods.mjs`
