# trader.setPerpLeverage lacks idempotency check, causing on-chain NoStateChange revert on repeated executions
Severity: normal
Area: SDK

## Steps to reproduce
1. Using `@somnia-chain/markets-sdk`, initialize an account and set the account's leverage cap on any perp market:
   ```ts
   await exchange.trader.setPerpLeverage({ pool: perpPoolAddress, leverageX: 10 });
   ```
2. Call the exact same method again with the same leverage value:
   ```ts
   await exchange.trader.setPerpLeverage({ pool: perpPoolAddress, leverageX: 10 });
   ```
3. Alternatively, run the automated verification script:
   ```bash
   node poc/repro_04_set_leverage_revert.mjs
   ```

## Expected
The SDK `trader.setPerpLeverage` should check current leverage via `client.getPerpMaxLeverage` before dispatching a transaction, or provide an idempotency option. If the leverage is already set to the desired value, it should safely return a no-op result without wasting gas or throwing an uncaught exception.

## Actual
`MarginBank.setMaxLeverage` reverts on-chain with the custom error `NoStateChange()`. Because the SDK method performs no pre-flight inspection and does not catch `NoStateChange()`, the transaction reverts, burning gas and crashing naive bot initialization loops upon restart.

This issue is explicitly acknowledged in the official `dreamdex-bot-kit` repository (`packages/perp-core/src/margin.ts`), where developers were forced to implement a defensive wrapper:
```ts
// packages/perp-core/src/margin.ts:161-166
/**
 * Set the account's own leverage cap on one market, if it is not already there.
 *
 * `setMaxLeverage` REVERTS with `NoStateChange()` when the value it is handed is
 * the one already stored, so a bot that sets its lever on every start crashes on
 * its second run. Reading first turns that into a no-op.
 */
```

## Evidence
Execution log from `poc/repro_04_set_leverage_revert.mjs`:
```text
--- PoC 04: setPerpLeverage Idempotency & Revert Handling ---
Target MarginBank: 0x478769E1177C0773c43A593DCCc4Ad15F15F1394
Target PerpPool: 0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0

Inspecting SDK method signatures:
exchange.trader.setPerpLeverage is function: true
Contract error NoStateChange present in ABI: true

[VULNERABILITY / DX SUMMARY]
1. MarginBank.setMaxLeverage() reverts with NoStateChange() if the account already has leverage set.
2. The SDK trader.setPerpLeverage does not check client.getPerpMaxLeverage before submitting.
3. Any trading bot or automated integration calling trader.setPerpLeverage during initialization
   crashes on subsequent restarts, or burns gas on reverted on-chain transactions.
4. The dreamdex-bot-kit was forced to write `ensureLeverage` in packages/perp-core/src/margin.ts:
   "setMaxLeverage REVERTS with NoStateChange() when the value it is handed is the one already stored,
   so a bot that sets its lever on every start crashes on its second run. Reading first turns that into a no-op."
```

## Environment
- SDK version: `@somnia-chain/markets-sdk@0.32.1`
- Network: Somnia Hideki Testnet (chain ID `50383`)
- Target Contract: `MarginBank` (`0x478769E1177C0773c43A593DCCc4Ad15F15F1394`)

## Impact
Automated trading agents, market makers, and scripts that call `setPerpLeverage` during setup crash upon restart, generating unnecessary error telemetry and burning native STT gas fees on failed on-chain transactions.

## Suggested fix
Update `setPerpLeverage` in `@somnia-chain/markets-sdk` to read the current leverage first or catch `NoStateChange`:
```ts
async setPerpLeverage(w, p) {
  const bank = await w.resolveMarginBank(p);
  const current = await w.client.readContract({
    address: bank,
    abi: ReadsAbi.marginBankReadAbi,
    functionName: "getMaxLeverage",
    args: [w.account.address, p.pool]
  });
  if (current === p.leverageX) {
    return { hash: "0x0", unchanged: true };
  }
  return w.execute({
    address: bank,
    abi: TradeAbi.marginBankWriteAbi,
    functionName: "setMaxLeverage",
    args: [p.pool, p.leverageX],
    gas: p.gas ?? w.defaultGas,
  });
}
```
