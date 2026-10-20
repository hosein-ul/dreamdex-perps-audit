# dreamDEX Perps Threat Model & Ranked Hypotheses

This document outlines prioritized hypotheses evaluating potential protocol failure modes, authorization flaws, accounting errors, and SDK/API discrepancies across the dreamDEX Perps stack on Somnia Tokyo testnet.

---

## Ranked Hypotheses Matrix

| Rank | Hypothesis ID | Target Component | Hypothesis ("If X, then Y") | Likelihood | Impact | Severity Target |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| **1** | `HYP-AUTH-01` | `OperatorPermissionsRegistry` / `MarginBank` | **If** `MarginBank` does not strictly enforce that only the account owner can initiate withdrawals or transfers, **then** a linked bot key (`Operator`) could call withdrawal functions and exfiltrate funds from the delegated account. | Low | Critical | Critical |
| **2** | `HYP-AUTH-02` | `PerpPool.placeOrderFor` | **If** `placeOrderFor` checks authorization on the current pool but does not verify cross-market margin consumption, **then** an operator linked to Market A could intentionally lock collateral or open positions that deplete margin needed by Market B. | Medium | Major | Major |
| **3** | `HYP-SDK-01` | SDK Address Sets (`SOMNIA_HIDEKI_TESTNET_ADDRESSES`) | **If** the SDK bundles `collateral = 0x9E94...148f` (tUSDC, 6 decimals) instead of `0xed79...4F72` (USDso, 18 decimals) and omits `operatorRegistry`, **then** builders using standard SDK quickstart code approve the wrong token, suffer balance read errors, and fail with `NotConfiguredError` on stop orders. | Confirmed | Major | Major |
| **4** | `HYP-MARGIN-01` | `MarginBank.withdrawMargin` | **If** `withdrawable` equity calculation uses stale mark prices or fails to account for adverse mark-to-entry gaps in resting orders, **then** a trader could withdraw collateral while heavily levered, leaving the account instantly liquidatable or bad debt in the protocol. | Medium | Critical | Critical |
| **5** | `HYP-MATH-01` | Units & Decimals Scaling (6/7/8/9/18/24) | **If** SDK or contract math confuses base decimals (which vary from 6 on XRP to 24 on NEAR) with 18-decimal price/collateral math, **then** orders will either fail with `InsufficientCollateral` or submit distorted sizes causing unexpected market impact or liquidation. | High | Major | Major |
| **6** | `HYP-ORDER-01` | Reduce-Only / Position Flips | **If** a reduce-only order is placed for a quantity larger than the current open position and is partially filled, **then** subsequent fills could flip the position into a new leveraged position rather than closing flat. | Medium | Major | Major |
| **7** | `HYP-STOP-01` | `PerpStopOrderRegistry` STT Locks | **If** a stop order cancellation reverts during native STT refund (or if a smart contract with no fallback receives the refund), **then** the locked `0.15 STT` becomes permanently trapped or unclaimable. | High | Normal | Normal |
| **8** | `HYP-LEVERAGE-01` | `MarginBank.setPerpLeverage` Idempotency | **If** `setPerpLeverage` is invoked with the leverage value that is already configured, **then** the contract reverts with `NoStateChange()`, crashing naive bots or re-quote loops on subsequent runs. | Confirmed | Normal | Normal |
| **9** | `HYP-ORACLE-01` | Stale Mark Price Liveness Gate (`isPriceable`) | **If** an oracle feed becomes stale and `isPriceable` returns `false`, **then** position-increasing orders are blocked, but if closing/reducing orders are also blocked, traders would be trapped with no emergency exit. | Medium | Major | Major |
| **10** | `HYP-DOCS-01` | Market Table Discrepancies | **If** the official documentation claims 15 perp markets while 21 markets are live on-chain, and provides code snippets referencing nonexistent exports (`SOMNIA_HIDEKI_TESTNET_ADDRESSES` in SDK <= 0.31.0), **then** developers cannot successfully onboard or integrate newly listed markets. | Confirmed | Normal | Normal |

---

## Detailed Component Vulnerability Profiles

### 1. Authorization & Session Boundary (`HYP-AUTH-01`, `HYP-AUTH-02`)
- **Premise**: Non-custodial bot linking must remain strictly partitioned.
- **Verification Vector**:
  1. Test invoking `withdrawMargin` or `transfer` using a linked trading key.
  2. Test invoking `placeOrderFor` from an unlinked key or for a market where access was not explicitly granted.
  3. Verify that removing a bot in the app immediately invalidates `isOperatorAuthorized`.

### 2. Collateral Math & Decimals Scaling (`HYP-MATH-01`)
- **Premise**: Markets span 6 decimals (ADA, HYPE, PUMP, XRP), 7 (XLM), 8 (BTC, DOGE, ZEC), 9 (SOL, SUI, TAO), 18 (ETH, BNB, LINK, etc.), and 24 (NEAR).
- **Verification Vector**:
  1. Test `toRaw` and `fromRaw` conversions on NEAR (24 decimals) vs XRP (6 decimals).
  2. Verify that integer division truncation never allows a sub-lot or sub-tick size order to be submitted.

### 3. Contract Revert vs SDK Handling (`HYP-LEVERAGE-01`, `HYP-SDK-01`)
- **Premise**: SDK wraps contract methods and must provide clear error typing rather than raw uncaught reverts.
- **Verification Vector**:
  1. Inspect `setPerpLeverage` behavior on repeated calls.
  2. Inspect `placePerpStopOrder` address resolution when `operatorRegistry` is omitted.
