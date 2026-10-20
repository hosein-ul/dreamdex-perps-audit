# dreamDEX Perps QA & Security Audit (Somnia Tokyo Testnet)

Authorized security review, QA analysis, and bug bounty deliverables for the **dreamDEX Perps Builder Bounty** (DoraHacks Feedback Track).

---

## 📌 Repository Overview

This repository contains reproducible proof-of-concept (PoC) scripts, architectural attack surface maps, threat models, and standardized vulnerability reports evaluated against the dreamDEX Perpetual Futures protocol on **Somnia Hideki Testnet** (`chain ID: 50383`).

All findings are documented in [`feedback/`](./feedback/) following the official DoraHacks Feedback Track template, and backed by automated, standalone verification scripts in [`poc/`](./poc/).

---

## 📊 Summary of Findings

| ID | Title | Severity | Area | Verification Script |
| :- | :--- | :---: | :---: | :--- |
| **01** | [`SOMNIA_HIDEKI_TESTNET_ADDRESSES` export missing in Markets SDK <= 0.31.0](./feedback/01-missing-hideki-addresses-export.md) | **Major** | Docs / SDK | [`poc/repro_01_missing_addresses_export.mjs`](./poc/repro_01_missing_addresses_export.mjs) |
| **02** | [Bundled `collateral` address points to 6-decimal tUSDC instead of 18-decimal USDso](./feedback/02-bundled-collateral-address-mismatch.md) | **Major** | SDK / Contracts | [`poc/repro_02_collateral_address_mismatch.mjs`](./poc/repro_02_collateral_address_mismatch.mjs) |
| **03** | [`operatorRegistry` missing from SDK addresses, causing `placePerpStopOrder` failure](./feedback/03-missing-operator-registry-in-sdk-addresses.md) | **Major** | SDK | [`poc/repro_03_missing_operator_registry.mjs`](./poc/repro_03_missing_operator_registry.mjs) |
| **04** | [`trader.setPerpLeverage` lacks idempotency check, triggering `NoStateChange()` revert](./feedback/04-unhandled-nostatechange-revert-in-setleverage.md) | **Normal** | SDK / Contracts | [`poc/repro_04_set_leverage_revert.mjs`](./poc/repro_04_set_leverage_revert.mjs) |
| **05** | [Six live perp markets omitted from raw contract integration table in documentation](./feedback/05-undocumented-perp-markets.md) | **Normal** | Docs | [`poc/repro_05_undocumented_markets.mjs`](./poc/repro_05_undocumented_markets.mjs) |
| **06** | [Markets SDK Trader lacks `placePerpOrderFor`, `cancelPerpOrderFor`, and `reducePerpOrderFor`](./feedback/06-missing-perp-operator-for-methods-in-sdk.md) | **Major** | SDK | [`poc/repro_06_missing_perp_for_methods.mjs`](./poc/repro_06_missing_perp_for_methods.mjs) |
| **07** | [Canonical Errors page carries no perp error table, while perp dev docs point to it as "the full list"](./feedback/07-errors-page-missing-perp-errors.md) | **Normal** | Docs | [`poc/repro_07_errors_page_no_perp_selectors.mjs`](./poc/repro_07_errors_page_no_perp_selectors.mjs) |
| **08** | [Documented HTTP API is spot-only; no REST surface exists for chain 50383 where all 21 perp pools live](./feedback/08-http-api-docs-no-perps-hideki.md) | **Normal** | Docs / API | [`poc/repro_08_rest_api_no_hideki.mjs`](./poc/repro_08_rest_api_no_hideki.mjs) |
| **09** | [bot-kit quickstart silently coerces `--network hideki` → `testnet` and drops `--strategy perp-starter`](./feedback/09-botkit-quickstart-hideki-coerced.md) | **Normal** | SDK (bot kit) | [`poc/repro_09_botkit_quickstart_coercion.mjs`](./poc/repro_09_botkit_quickstart_coercion.mjs) |
| **10** | [bot-kit `.env.example` ships active `NETWORK=testnet` — verbatim copy aims perp bot at Shannon 50312](./feedback/10-botkit-env-example-network-footgun.md) | **Normal** | SDK (bot kit) | [`poc/repro_10_botkit_env_footgun.mjs`](./poc/repro_10_botkit_env_footgun.mjs) |
| **11** | [One bot-kit install ships two markets-sdk versions (0.30.0 hoisted, 0.31.0 nested) — perp money path decodes on only one](./feedback/11-duplicate-markets-sdk-versions.md) | **Normal** | SDK (bot kit) | [`poc/repro_11_two_sdk_versions.mjs`](./poc/repro_11_two_sdk_versions.mjs) |
| **12** | [Somnia Markets SDK docs describe a stale perps deployment (BTC/ETH only, 10 pools, "no hosted indexer")](./feedback/12-platform-docs-stale-perps.md) | **Normal** | Docs | [`poc/repro_12_platform_docs_stale.mjs`](./poc/repro_12_platform_docs_stale.mjs) |
| **13** | [bot-kit `perp-funding` position cap guard is unreachable dead code (`held` always 0 where checked)](./feedback/13-botkit-perp-funding-dead-cap.md) | **Normal** | SDK (bot kit) | [`poc/repro_13_botkit_dead_branch.mjs`](./poc/repro_13_botkit_dead_branch.mjs) |
| **14** | [Docs' canonical perp symbol `BTC/USDSO:USDSO` throws `unknown symbol`; live symbol is `BTC/USDso:USDso`](./feedback/14-docs-rep-symbol-casing.md) | **Normal** | Docs / SDK | [`poc/repro_14_symbol_casing.mjs`](./poc/repro_14_symbol_casing.mjs) |

See [`feedback/INDEX.md`](./feedback/INDEX.md) for detailed triager notes and verification timestamps.

---

## 🛠️ Verification & Reproduction

Every finding can be reproduced in under 60 seconds against the live Somnia Hideki testnet node:

```bash
# 1. Install dependencies
npm install

# 2. Run any standalone repro script
node poc/repro_01_missing_addresses_export.mjs
node poc/repro_02_collateral_address_mismatch.mjs
node poc/repro_03_missing_operator_registry.mjs
node poc/repro_04_set_leverage_revert.mjs
node poc/repro_05_undocumented_markets.mjs
node poc/repro_06_missing_perp_for_methods.mjs
node poc/repro_07_errors_page_no_perp_selectors.mjs
node poc/repro_08_rest_api_no_hideki.mjs
node poc/repro_09_botkit_quickstart_coercion.mjs
node poc/repro_10_botkit_env_footgun.mjs
node poc/repro_11_two_sdk_versions.mjs
node poc/repro_12_platform_docs_stale.mjs
node poc/repro_13_botkit_dead_branch.mjs
node poc/repro_14_symbol_casing.mjs
```

---

## 📂 Recon & Architectural Intelligence

- [`recon/ARCHITECTURE.md`](./recon/ARCHITECTURE.md): Component diagrams, trust boundaries, collateral accounting flows.
- [`recon/ATTACK_SURFACE.md`](./recon/ATTACK_SURFACE.md): Contract function tables, error matrices, parameter validations.
- [`recon/HYPOTHESES.md`](./recon/HYPOTHESES.md): Ranked failure-mode threat model.
- [`recon/LINKS.md`](./recon/LINKS.md): Authoritative registry of all verified testnet endpoints and contracts.
- [`recon/onchain_markets.json`](./recon/onchain_markets.json): Full dump of all 21 live perp markets, parameters, and risk configurations.
- [`NOTES.md`](./NOTES.md): Running audit execution log.
