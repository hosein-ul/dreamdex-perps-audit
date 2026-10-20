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
```

---

## 📂 Recon & Architectural Intelligence

- [`recon/ARCHITECTURE.md`](./recon/ARCHITECTURE.md): Component diagrams, trust boundaries, collateral accounting flows.
- [`recon/ATTACK_SURFACE.md`](./recon/ATTACK_SURFACE.md): Contract function tables, error matrices, parameter validations.
- [`recon/HYPOTHESES.md`](./recon/HYPOTHESES.md): Ranked failure-mode threat model.
- [`recon/LINKS.md`](./recon/LINKS.md): Authoritative registry of all verified testnet endpoints and contracts.
- [`recon/onchain_markets.json`](./recon/onchain_markets.json): Full dump of all 21 live perp markets, parameters, and risk configurations.
- [`NOTES.md`](./NOTES.md): Running audit execution log.
