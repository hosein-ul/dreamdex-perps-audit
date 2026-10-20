# Bundled SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral points to 6-decimal tUSDC instead of 18-decimal USDso
Severity: major
Area: SDK

## Steps to reproduce
1. In an application using `@somnia-chain/markets-sdk@0.32.1`, import `SOMNIA_HIDEKI_TESTNET_ADDRESSES`.
2. Inspect `SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral` and query its metadata on-chain via the standard ERC-20 `name()`, `symbol()`, and `decimals()` functions.
3. Query the live on-chain `MarginBank` contract (`0x478769E1177C0773c43A593DCCc4Ad15F15F1394`) via `exchange.client.getPerpSystemConfig(marginBank)` or read its `collateralToken()` view function.
4. Compare the two addresses.
5. Alternatively, run the automated verification script:
   ```bash
   node poc/repro_02_collateral_address_mismatch.mjs
   ```

## Expected
`SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral` should point to the official dreamDEX Perps collateral token, USDso (`0xed7993A74dAe1e6656B704A424DcD8711aAf4F72`, 18 decimals), which is required by `MarginBank` for deposits, margin locking, and PnL accounting.

## Actual
`SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral` is hardcoded to `0x9E9492cC533E8696A3b6afC7df730800DF75148f`, which is Test USDC (tUSDC, 6 decimals), an asset used solely for binary markets collateral.

## Evidence
Execution log from `poc/repro_02_collateral_address_mismatch.mjs`:
```text
--- PoC 02: Verifying SDK Collateral Address vs On-Chain MarginBank Collateral ---
SDK Bundled Address (SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral): 0x9E9492cC533E8696A3b6afC7df730800DF75148f
On-Chain MarginBank Collateral (getPerpSystemConfig.collateralToken): 0xed7993A74dAe1e6656B704A424DcD8711aAf4F72

--- TOKEN DETAILS COMPARISON ---
Bundled SDK Token (0x9E9492cC533E8696A3b6afC7df730800DF75148f):
  Name: Test USDC, Symbol: tUSDC, Decimals: 6
Actual On-Chain MarginBank Token (0xed7993A74dAe1e6656B704A424DcD8711aAf4F72):
  Name: USDso, Symbol: USDso, Decimals: 18

Address Mismatch Detected: true

[CRITICAL DX / ACCOUNTING IMPACT]
1. Any integration relying on SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral will approve
   spending for Test USDC (6 decimals) instead of USDso (18 decimals).
2. Deposits into MarginBank will revert because MarginBank transfers the actual collateral token (USDso).
3. Decimal scaling math is corrupted by a 10^12 factor (6 decimals vs 18 decimals).
```

## Environment
- SDK version: `@somnia-chain/markets-sdk@0.32.1`
- Network: Somnia Hideki Testnet (chain ID `50383`)
- Target Contract: `MarginBank` (`0x478769E1177C0773c43A593DCCc4Ad15F15F1394`)
- RPC: `https://api.hideki2.infra.testnet.somnia.network`

## Impact
Any bot, SDK consumer, or front-end integration that relies on `addresses.collateral` to approve allowances and deposit into `MarginBank` will approve the wrong token contract (`tUSDC`). When `depositMargin` is subsequently called, the transaction reverts on-chain with `ERC20InsufficientAllowance` or `ERC20InsufficientBalance` because `MarginBank` attempts to pull `USDso` (`0xed79...4F72`). Furthermore, any off-chain balance display or quoting logic relying on `collateral` will miscalculate balances by $10^{12}$ due to the 6 vs 18 decimal discrepancy.

## Suggested fix
Update `SOMNIA_HIDEKI_TESTNET_ADDRESSES` in `@somnia-chain/markets-sdk` so that:
```ts
collateral: "0xed7993A74dAe1e6656B704A424DcD8711aAf4F72", // USDso (18 decimals)
binaryCollateral: "0x9E9492cC533E8696A3b6afC7df730800DF75148f", // tUSDC (6 decimals)
```
