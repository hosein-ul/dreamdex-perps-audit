# Markets SDK Trader lacks placePerpOrderFor, cancelPerpOrderFor, and reducePerpOrderFor methods
Severity: major
Area: SDK

## Steps to reproduce
1. Instantiate `SomniaMarkets` with a linked trading key / bot key (`privateKey`).
2. Inspect the methods available on `exchange.trader`.
3. Search for methods that support delegated execution on behalf of an account owner (`placePerpOrderFor`, `cancelPerpOrderFor`, `reducePerpOrderFor`).
4. Notice that while spot methods (`depositVaultNativeFor`, `redeemFor`) exist, no perp `...For` methods exist on `trader`.
5. Alternatively, run the automated verification script:
   ```bash
   node poc/repro_06_missing_perp_for_methods.mjs
   ```

## Expected
The Markets SDK `trader` should provide first-class support for delegated bot trading on perps (`placePerpOrderFor`, `cancelPerpOrderFor`, `reducePerpOrderFor`), corresponding to the on-chain selectors `0x80054449`, `0xe37b444b`, and `0x364c2587` exported by the SDK as `PLACE_ORDER_FOR_SELECTOR` and `CANCEL_ORDER_FOR_SELECTOR`.

## Actual
The Markets SDK completely omits perp operator execution methods from `exchange.trader`. Developers building non-custodial trading bots are forced to bypass the SDK and manually construct `viem` contract simulations, ABI definitions, gas limits, and receipt decoders (`decodePlaceOrder`).

This missing capability is highlighted directly in the `dreamdex-bot-kit` codebase (`packages/perp-core/src/operator.ts`):
```ts
// packages/perp-core/src/operator.ts:19-21
// The markets SDK has no perp `…For` writes, so the three calls are sent here
// with viem. Reads stay on the SDK, pointed at the owner's address.
```

## Evidence
Execution log from `poc/repro_06_missing_perp_for_methods.mjs`:
```text
--- PoC 06: Missing Perp "...For" Methods on Trader ---
SDK Exported Selectors:
  PLACE_ORDER_FOR_SELECTOR: 0x80054449
  CANCEL_ORDER_FOR_SELECTOR: 0xe37b444b

Inspecting trader methods:
trader.placePerpOrder exists?: true
trader.placePerpOrderFor exists?: false
trader.cancelPerpOrderFor exists?: false
trader.reducePerpOrderFor exists?: false

All "*For" methods present on trader: [ 'depositVaultNativeFor', 'redeemFor' ]

[RESULT: CONFIRMED SDK GAP / MISSING FEATURE]
The Markets SDK exposes no high-level or builder methods for operator perp trading.
Developers using "Link a Bot" / trading key architecture cannot use the SDK trader abstraction.
As documented in dreamdex-bot-kit (packages/perp-core/src/operator.ts):
  "The markets SDK has no perp ...For writes, so the three calls are sent here with viem."
```

## Environment
- SDK version: `@somnia-chain/markets-sdk@0.32.1`
- Network: Somnia Hideki Testnet (chain ID `50383`)
- Affected Modules: `SomniaMarkets.trader`, `Writer`

## Impact
The "Link a Bot" / delegated trading workflow promoted as the premier security feature of DreamDEX is unsupported by the official Markets SDK. Every developer building an automated bot must duplicate low-level transaction plumbing rather than using standard SDK interfaces.

## Suggested fix
Add `placePerpOrderFor`, `cancelPerpOrderFor`, and `reducePerpOrderFor` to `SomniaMarketsTrader` in `@somnia-chain/markets-sdk`:
```ts
export interface PlacePerpOrderForParams extends PlacePerpOrderParams {
  owner: `0x${string}`;
}

// In Trader:
async placePerpOrderFor(p: PlacePerpOrderForParams) {
  return PerpTrade.placeFor(this.writer, p);
}
```
