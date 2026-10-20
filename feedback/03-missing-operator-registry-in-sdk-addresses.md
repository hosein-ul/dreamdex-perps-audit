# operatorRegistry missing from SOMNIA_HIDEKI_TESTNET_ADDRESSES, causing placePerpStopOrder to fail with NotConfiguredError
Severity: major
Area: SDK

## Steps to reproduce
1. Instantiate `SomniaMarkets` using `SOMNIA_HIDEKI_TESTNET_ADDRESSES` and a private key:
   ```ts
   import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk";
   import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains";

   const exchange = new SomniaMarkets({
     chain: hidekiTestnet,
     indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql",
     addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
     privateKey: "0x...",
   });
   ```
2. Call `trader.placePerpStopOrder` on an active market (e.g., BTC-PERP) passing standard stop-order parameters without manually supplying an `operatorRegistry` property.
3. Observe that execution fails immediately before signing or broadcasting.
4. Alternatively, run the automated verification script:
   ```bash
   node poc/repro_03_missing_operator_registry.mjs
   ```

## Expected
`SOMNIA_HIDEKI_TESTNET_ADDRESSES` should include `operatorRegistry: "0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3a"` (the live `OperatorPermissionsRegistry`), allowing stop order placement methods to resolve necessary contract dependencies transparently.

## Actual
Neither `operatorRegistry` nor `operatorPermissionsRegistry` is defined in `SOMNIA_HIDEKI_TESTNET_ADDRESSES`. When `trader.placePerpStopOrder` runs, the internal address resolver throws `NotConfiguredError: Addresses do not include 'operatorRegistry'`:
```text
NotConfiguredError: Addresses do not include 'operatorRegistry'. Pass it in the constructor addresses dictionary, or supply operatorRegistry on this call.
```

## Evidence
Execution log from `poc/repro_03_missing_operator_registry.mjs`:
```text
--- PoC 03: Verifying missing operatorRegistry in SDK Address Constants ---
Checking SOMNIA_HIDEKI_TESTNET_ADDRESSES:
operatorRegistry defined?: false
operatorPermissionsRegistry defined?: false

Attempting to call trader.placePerpStopOrder without passing operatorRegistry explicitly...

[RESULT: CONFIRMED BUG]
Thrown Error Name: NotConfiguredError
Thrown Error Message: @somnia-chain/markets-sdk: a perp stop order — needs operatorRegistry or addresses.operatorPermissionsRegistry
Stack snippet: NotConfiguredError: @somnia-chain/markets-sdk: a perp stop order — needs operatorRegistry or addresses.operatorPermissionsRegistry
    at operatorGrantCall (file:///C:/Users/hashe/Documents/antigravity/excited-hubble/node_modules/@somnia-chain/markets-sdk/dist/perp/stops.js:492:15)
    at Module.placePerpStopOrder (file:///C:/Users/hashe/Documents/antigravity/excited-hubble/node_modules/@somnia-chain/markets-sdk/dist/perp/stops.js:582:29)
```

## Environment
- SDK version: `@somnia-chain/markets-sdk@0.32.1`
- Network: Somnia Hideki Testnet (chain ID `50383`)
- Verified On-Chain Operator Registry: `0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3a`

## Impact
All stop loss and take profit features built through the Markets SDK (`placePerpStopOrder`, `linkPerpStopOrders`, `buildPlacePerpStopOrder`) crash at runtime for developers following the official SDK quickstart, unless they independently discover the undocumented requirement to inject `operatorRegistry`.

## Suggested fix
Add `operatorRegistry` to `SOMNIA_HIDEKI_TESTNET_ADDRESSES` (and `SOMNIA_TESTNET_ADDRESSES`) in `@somnia-chain/markets-sdk`:
```ts
export const SOMNIA_HIDEKI_TESTNET_ADDRESSES = {
  ...
  operatorRegistry: "0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3a",
};
```
