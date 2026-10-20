# dreamDEX Perps Attack Surface Analysis

This document provides a comprehensive mapping of all network endpoints, contract entry points, trust boundaries, assumptions, and attack vectors across the dreamDEX Perps stack on Somnia Tokyo testnet (Hideki chain 50383).

---

## 1. Network & API Endpoints Table

| Protocol / Layer | Endpoint URL | Authentication | Channels / Operations | Attack Vectors & Test Scenarios |
| :--- | :--- | :--- | :--- | :--- |
| **HTTP JSON-RPC** | `https://api.hideki2.infra.testnet.somnia.network` | None | `eth_call`, `eth_sendRawTransaction`, `eth_estimateGas`, `eth_getLogs` | Rate limiting, gas estimation underreporting, EIP-1898 block tag rejection, batch call limits, large log range DoS (`> 1000` blocks). |
| **WebSocket RPC** | `wss://api.hideki2.infra.testnet.somnia.network/ws` | None | `eth_subscribe` (newHeads, logs), raw JSON-RPC | Connection drop recovery, subscription limits, message reordering, dropped events during rapid block progression. |
| **GraphQL Indexer** | `https://hideki-dev.smk.somnia.host/v1/graphql` | None (Public) | Queries for markets, positions, fills, candles, margin events | Unauthenticated query complexity / depth abuse (issue #45), pagination bypass (`limit`/`offset`), stale row reads vs on-chain state, negative/null fields. |
| **REST / HTTP App API** | `https://app.testnet.dreamdex.io/api/*` | SIWE / Cookie | Market lists, order routing, user session state | IDOR on user portfolios, session expiration, CORS misconfiguration, verbose error paths or stack traces. |

---

## 2. Smart Contract Function Surface

### A. PerpPool (CLOB Matching Engine)

| Function Name | Visibility | Modifiers | Primary Parameters | Key Failure Modes & Attack Scenarios |
| :--- | :--- | :--- | :--- | :--- |
| `placeOrder` | `external` | `payable` | `bool isBid, uint64 userData, uint256 price, uint256 quantity, uint64 expireTimestampNs, uint8 orderType, uint8 selfMatchingOption, address builder, uint96 builderFeeBpsTimes1k` | Self-trading, tick/lot grid violations, zero price, past/zero expiry, adverse mark-to-entry overflow, builder fee manipulation without prior approval. |
| `placeOrderFor` | `external` | `payable` | `address owner, bool isBid, ...` (same args) | Operator spoofing (`OnlyApprovedContracts` bypass), cross-account margin drain, privilege escalation to trade unauthorized markets, unlinked caller. |
| `cancelOrder` | `external` | — | `uint128 orderId` | Cancel of already filled order, double-cancel, cancelling someone else's order (`IncorrectSender`), race condition between fill and cancel. |
| `cancelOrderFor` | `external` | — | `address owner, uint128 orderId` | Cancel order for unauthorized owner, refund redirection (verifying refunds NEVER land in operator wallet). |
| `reduceOrder` | `external` | — | `uint128 orderId, uint256 newQuantityRemaining` | Reducing to `newQuantityRemaining > currentQuantity`, reducing to `newQuantityRemaining < minQuantity`, position queue priority manipulation. |
| `reduceOrderFor` | `external` | — | `address owner, uint128 orderId, uint256 newQuantityRemaining` | Operator authority verification, partial execution state corruption. |
| `amendOrders` | `external` | — | `uint128[] orderIds, ...` | Atomic batch cancellation and replacement; reentrancy or partial state commits. |
| `getOrderBookParameters` | `external view` | — | none | Returns `(tickSize, minQuantity, lotSize)`. Verified against SDK expectations. |

### B. MarginBank (Collateral Custody & Cross-Margin)

| Function Name | Visibility | Modifiers | Primary Parameters | Key Failure Modes & Attack Scenarios |
| :--- | :--- | :--- | :--- | :--- |
| `depositMargin` | `external` | — | `uint256 amount` | Reentrancy via ERC-20 token callback, zero deposit, integer overflow, transfer fee token accounting. |
| `depositFor` | `external` | — | `address account, uint256 amount` | Depositing for arbitrary user, spoofing deposit origin, auto-pull allowance drains. |
| `withdrawMargin` | `external` | — | `uint256 amount` | Withdrawing locked collateral, withdrawing while underwater or near liquidation, insolvency drain, frontrunning oracle mark drops. |
| `lockCollateral` | `external` | `onlyPerpPool` | `address account, uint256 amount` | Unauthorized caller claiming to be pool, double locking, overflow. |
| `settleTrade` | `external` | `onlyPerpPool` | `address account, int256 sizeDelta, uint256 fillPrice, uint256 fee` | Arbitrary caller invoking settlement, negative equity creation, fee rounding bias. |
| `getMarginAccount` | `external view` | — | `address account` | Returns unlocked, locked, equity, withdrawable, requirements, status. Precision loss on calculations. |
| `setPerpLeverage` | `external` | — | `address pool, uint32 leverageX` | Setting leverage cap above protocol max (20x), setting leverage when `current == target` (reverts `NoStateChange`), linked bot unauthorized write attempt. |

### C. OperatorPermissionsRegistry (Authorization Singleton)

| Function Name | Visibility | Modifiers | Primary Parameters | Key Failure Modes & Attack Scenarios |
| :--- | :--- | :--- | :--- | :--- |
| `setOperatorAuthorization` | `external` | — | `address operator, bytes4 selector, bool authorized` | Setting authorization for arbitrary selectors (e.g. `withdrawMargin`), revocation frontrunning, re-authorization. |
| `isOperatorAuthorized` | `external view` | — | `address owner, address operator, bytes4 selector` | Ensuring checks are strictly scoped per owner and selector. |

### D. PerpStopOrderRegistry (Conditional TP/SL Orders)

| Function Name | Visibility | Modifiers | Primary Parameters | Key Failure Modes & Attack Scenarios |
| :--- | :--- | :--- | :--- | :--- |
| `placePerpStopOrder` | `external` | `payable` (locks 0.15 STT) | `address pool, bool isBid, uint256 triggerPrice, uint8 triggerOperator, ...` | Locking insufficient STT, unlinked brackets where one fires and the other persists, non-straddling triggers, frontrunning trigger executions. |
| `cancelPerpStopOrders` | `external` | — | `uint128[] orderIds` | Cancelling other traders' stops, STT refund failures (`SomiRefundFailed` leaving locked native tokens), double-claiming refunds. |
| `claimSomi` | `external` | — | none | Reentrancy on native STT transfer, claiming with 0 balance (`NothingToClaim`). |

### E. LiquidationEngine & InsuranceFund

| Function Name | Visibility | Modifiers | Primary Parameters | Key Failure Modes & Attack Scenarios |
| :--- | :--- | :--- | :--- | :--- |
| `liquidate` | `external` | — | `address account, address pool` | Liquidating healthy accounts, MEV frontrunning of liquidation transactions, liquidation penalty miscalculation. |
| `takeover` | `external` | `onlyRegisteredBidder` | `address account, address pool` | Unauthorized bidder registration, takeover when account is solvent. |
| `autoDeleverage` | `external` | — | `address pool, bool isLong` | Ranking manipulation, closing un-profitable counterparty positions, ADL session replay. |

---

## 3. Assumptions & Security Invariants

1. **Custodial Isolation**: No entity other than the account owner can withdraw collateral from `MarginBank`. A linked bot key (`Operator`) can NEVER initiate withdrawals, transfers, or balance seizures.
2. **Margin Solvency**: `unlocked + locked == totalCollateralDeposited`. No order or trade settlement can cause an account's equity to be credited without corresponding debit from counterparty or depositor.
3. **Decimals Separation**: Prices are strictly 18 decimals across all markets; quantities use the underlying base token's native decimals (varying from 6 to 24). Sizing math must never mix base decimals with quote decimals.
4. **Oracle Liveness**: An un-priceable mark (`isPriceable == false`) must strictly block position-increasing orders, leverage changes, and withdrawals, while permitting position-reducing orders (emergency exits).
5. **Idempotency of Linking**: Bot permissions granted via `OperatorPermissionsRegistry` apply per-market and per-selector. Adding an already linked bot must be idempotent and never drop previous grants.
