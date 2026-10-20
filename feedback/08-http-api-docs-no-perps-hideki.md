# HTTP API docs have no Hideki (50383) row and no perps — perps builders have no documented REST API
Severity: normal
Area: docs

## Steps to reproduce
1. Open the dreamDEX HTTP API docs (https://app.dreamdex.io/docs/developers/http-api). Base URL table lists exactly two environments: Mainnet (chain 5031, `https://api.dreamdex.io/v0`) and Testnet "(Somnia Shannon)" (chain 50312, `https://stg.api.dreamdex.io/v0`). No row exists for the Hideki testnet (chain 50383) on which the perk markets run, and no perp market symbols appear anywhere in the API docs' market-data pages.
2. Verify the staging API really carries no perps: `GET https://stg.api.dreamdex.io/v0/markets` → returns exactly 3 markets, all `"kind":"spot"` (SOMI:USDso, WBTC:USDso, WETH:USDso), contracts on the Shannon testnet collateral `0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171`.
3. Compare with the actual perps deployment: 21 live perp pools on chain 50383, enumerated by the SDK (`listPerpMarkets`) / the bot kit's `npm run perp:doctor` — none reachable through any documented REST base URL.

Reproducible twice: 2× `GET /v0/markets` on 2026-10-20 (`poc/repro_08_rest_api_no_hideki.mjs` — raw body saved each run), and 2× doc fetches.

## Expected
Either (a) the base-URL table gets a Hideki row + the market-data doc lists perp symbols and their REST endpoints, or (b) the docs explicitly state that perps are on-chain/SDK/indexer only, with the bounty's "Perps API" scoped to smart contracts + GraphQL + SDK. Nothing today says (b).

## Actual
A perps-focused builder following the bounty's Resources finds the HTTP API docs last in scope "Perps API" appearing to apply, but no perp endpoint or Hideki URL exists there. The staging host that the docs DO document cannot see a single perp market.

## Evidence
- Raw response (2026-10-20, 2×): `{"markets":[{"symbol":"SOMI:USDso","kind":"spot",...},{"symbol":"WBTC:USDso","kind":"spot",...},{"symbol":"WETH:USDso","kind":"spot",...}]}` (full payloads in the script's output; the two runs are byte-identical).
- Docs quote (Base URLs table): rows `5031 / api.dreamdex.io` and `50312 / stg.api.dreamdex.io` only — no 50383 row anywhere in the HTTP API docs.
- Perp side: 21 pools enumerated on chain 50383 (`recon/onchain_markets.json`, and `node poc/dump_all_perp_markets.mjs`).

## Environment
Docs: live 2026-10-20. Network: Somnia Hideki testnet (chain 50383) checked against the Shannon staging API. Wallet: n/a (read-only). SDK: does not reach the SDK (plain REST probe).

Impact: variable-impact blocks every integrator whose toolkit assumes REST (ccxt's REST-based flows, shop dashboards); nothing tells them the perps surface is contracts+GraphQL+SDK only.
Suggested fix: add a Hideki row + perps section to the HTTP API docs, or an explicit "perps are not served over REST; use the markets SDK / GraphQL indexer" note in both the perps dev page and the HTTP API docs (and in the bounty page so nobody burns time looking for undocumented endpoints).
