# Somnia Markets SDK docs describe a stale perps deployment (BTC/ETH only, 10 pools, "no hosted indexer") — all false on the live network
Severity: normal
Area: docs

Source: https://somnia-platform-docs.vercel.app/markets/somnia-markets/typescript/perps (listed in the bounty page's Resources as "Somnia Markets SDK docs").
Note on scope: report 05 (undocumented-perp-markets) covers a different defect on the **contracts** page (six pools missing from the raw-integration table). This report covers the **SDK guide's deployment narrative** (perps live = "BTC/USDSO and ETH/USDSO only", "testnet today has 10 pools, four restricted SBTC*", "no hosted Hideki indexer") — different page, different stale claims, entirely false today.

## Steps to reproduce
1. Open the Somnia Markets SDK perps guide and note three claims:
   - "Perps are live on testnet: `BTC/USDSO:USDSO` and `ETH/USDSO:USDSO`"
   - "Testnet today has 10 pools, four of them restricted `SBTC*` arena markets."
   - "(Hideki has no hosted indexer. Indexed reads need an indexer you operate.)" (exchange guide, same docs)
2. Read the actual deployment through the SDK (dreamdex's own docs, same package version 0.32.1):
   ```
   node poc/dump_all_perp_markets.mjs   # + recon/onchain_markets.json (21 pools)
   ```
   Actual: **21 perp pools, all `registered:true`, all `restricted:false`**, base symbols BTC, ETH, SOL, XRP, HYPE, ADA, AVAX, BNB, DOGE, LINK, NEAR, SUI, XLM, TAO, WLD, plus 1000PEPE, LIT, PUMP, VVV, ZEC, ZRO — from the same SDK, same chainId 50383, against dreamDEX's hosted indexer `https://hideki-dev.smk.somnia.host/v1/graphql`.
3. Cross-practically: `npm run perp:doctor` in dreamdex-bot-kit prints the same 21 markets.

Reproducible twice: recon script and perp:doctor both run 2× on 2026-10-20, plus the docs pages themselves quoted.

## Expected
Resources documents for a venue whose epochs/allowlists/ABIs change should state which deployment they describe, or be regenerated from the live deployment (the docs already say they are "generated from the SDK source").

## Actual
The platform guide describes an unrelated older/test deployment (their own "SBTC* arena"): wrong market count, wrong symbol list, wrong indexer assertion. A developer entering from the bounty page sees BTC and ETH only, plans around them, and indexes incorrectly.

## Evidence
- Quotes above fetched 2026-10-20 (2×).
- Recon output: `count: 21` + 21 pool rows with `tradeable:true` (poc/output/), perp:doctor table "markets: 21 live".

## Environment
SDK @somnia-chain/markets-sdk 0.32.1, chain 50383. Wallet n/a.

Impact: wrong symbol list & market universe in a doc listed first under the bounty's Resources.
Suggested fix: regenerate the page from the deployment it serves, or add a screaming aside that dreamDEX's 21-market Hideki deployment differs from the platform-curated deployment.
