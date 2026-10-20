# The documented perp symbol "BTC/USDSO:USDSO" throws unknown symbol; live symbols are "BTC/USDso:USDso"
Severity: normal
Area: docs

Source: Somnia Markets SDK docs — perps guide intro ("Perps are live on testnet: `BTC/USDSO:USDSO` and `ETH/USDSO:USDSO`"), the exchange guide's Symbols table (Perp row: market symbol `BTC/USDSO:USDSO`), and the multi-chain example (`exchange.createOrder("BTC/USDSO:USDSO", "limit", "buy", 1, 60_000)`).

## Steps to reproduce
1. Install `@somnia-chain/markets-sdk@0.32.1`.
2. Run the script verbatim from the docs' own example:
   ```
   node poc/repro_14_symbol_casing.mjs
   ```
   (loads markets, then resolves the doc's symbol string exactly as printed above).

## Expected
The symbol the docs use as the canonical perp symbol resolves, at minimum, with `loadMarkets()` called — this is the exact claim in the error message itself ("call loadMarkets() first"), which we do.

## Actual
The symbol string docs give resolves to `unknown symbol` because the live symbol uses the token's actual casing (`USDso`), not the docs' (`USDSO`):
```
doc symbol BTC/USDSO:USDSO → InvalidInputError: @somnia-chain/markets-sdk: unknown symbol BTC/USDSO:USDSO — call loadMarkets() first
live BTC perp symbol: BTC/USDso:USDso
live symbol resolves: BTC/USDso:USDso (pool 0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0)
```
Reproduced twice (yes 2026-10-20). The dev's first-ever `createOrder` from the copy-paste example fails with an error that misdirects them to call a method they already called (loadMarkets), which compounds the confusion.

## Evidence
- Pasted output above (2 runs identical).
- SDK error itself: `InvalidInputError: unknown symbol BTC/USDSO:USDSO — call loadMarkets() first`.
- (Reference: `poc/watch-feed.mjs`, which I also hit this same error from, twice, before tracing it.)

## Environment
`somnia-usdso` docs (somnia-platform-docs.vercel.app/markets/somnia-markets): live 2026-10-20 quotes; SDK 0.32.1; chain 50383. Wallet n/a.

Impact: every integration string rooted in the docs' symbol ("watchOrderBook", "fetchTicker", "createOrder", and any config like `PERP_SYMBOL`) fails against this chain at first run. The casing mistake is invisible in a config screen and produces misleading error text.
Suggested fix: update the perps guide, exchange guide symbols, and the multi-chain example's symbol string to `BTC/USDso:USDso` / `ETH/USDso:USDso` (or make the client's symbol resolver case-insensitive over the quote code — `USDSO→USDso` alias).
