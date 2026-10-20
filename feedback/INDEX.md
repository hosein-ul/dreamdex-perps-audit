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
| [`07-errors-page-missing-perp-errors.md`](07-errors-page-missing-perp-errors.md) | Canonical Errors page carries no perp error table, while perp dev docs point to it as "the full list" | normal | docs | High | Yes (2026-10-20) |
| [`08-http-api-docs-no-perps-hideki.md`](08-http-api-docs-no-perps-hideki.md) | Documented HTTP API is spot-only; no REST surface for chain 50383 where all 21 perp pools live | normal | docs / API | High | Yes (2026-10-20) |
| [`09-botkit-quickstart-hideki-coerced.md`](09-botkit-quickstart-hideki-coerced.md) | `dreamdex-bot-kit` quickstart silently coerces `--network hideki` → `testnet` and drops `--strategy perp-starter` | normal | SDK (bot kit) | High | Yes (2026-10-20) |
| [`10-botkit-env-example-network-footgun.md`](10-botkit-env-example-network-footgun.md) | bot-kit `.env.example` ships active `NETWORK=testnet`; verbatim copy aims perp bot at Shannon 50312 | normal | SDK (bot kit) | High | Yes (2026-10-20) |
| [`11-duplicate-markets-sdk-versions.md`](11-duplicate-markets-sdk-versions.md) | One bot-kit install ships two `@somnia-chain/markets-sdk` versions (0.30.0 hoisted, 0.31.0 nested in perp-core) | normal | SDK (bot kit) | High | Yes (2026-10-20) |
| [`12-platform-docs-stale-perps.md`](12-platform-docs-stale-perps.md) | Somnia Markets SDK docs describe a stale perps deployment (BTC/ETH only, 10 pools, "no hosted indexer") | normal | docs | High | Yes (2026-10-20) |
| [`13-botkit-perp-funding-dead-cap.md`](13-botkit-perp-funding-dead-cap.md) | bot-kit `perp-funding` position-cap guard unreachable (`held` always 0 where checked); documented cap is per-entry only | normal | SDK (bot kit) | High | Yes (2026-10-20) |
| [`14-docs-rep-symbol-casing.md`](14-docs-rep-symbol-casing.md) | Docs' canonical perp symbol `BTC/USDSO:USDSO` throws `unknown symbol`; live symbol is `BTC/USDso:USDso` | normal | docs / SDK | High | Yes (2026-10-20) |

---

## Verification Scripts
All reports are backed by executable, automated verification scripts located in [`poc/`](../poc/):
- `poc/repro_01_missing_addresses_export.mjs`
- `poc/repro_02_collateral_address_mismatch.mjs`
- `poc/repro_03_missing_operator_registry.mjs`
- `poc/repro_04_set_leverage_revert.mjs`
- `poc/repro_05_undocumented_markets.mjs`
- `poc/repro_06_missing_perp_for_methods.mjs`
