# Copied verbatim, .env.example configures a perp bot against the wrong chain (testnet=Shannon 50312)
Severity: normal
Area: SDK

Package: dreamdex-bot-kit main (squash 2579866), file `.env.example` line 8: `NETWORK=testnet`.

## Steps to reproduce
1. Clone the kit, copy the sample env as the README instructs: `cp .env.example .env`, add any key, leave `PERP_SYMBOL=BTC-PERP` (perp section) untouched.
2. Ask the perp layer which network it will target:
   ```
   npx tsx -e "import {loadConfig} from './packages/perp-core/src/config.ts'; const cfg:any = loadConfig();
     console.log(JSON.stringify({network:cfg.network, chainId:cfg.chainId, rpc:cfg.rpcUrl, indexer:cfg.indexerUrl}))"
   ```
   (with .env as above; runs from repo root)
3. Observe the output.

Reference: `poc/repro_10_botkit_env_footgun.mjs` (asserts the active `NETWORK=testnet` line and the perps block overlap); runtime `loadConfig()` transcripts pasted in the Evidence section.

## Expected
`.env.example` is the single root sample the README points at, so it should either default perps to `NETWORK=hideki` (the perp section itself is guidance to "set NETWORK=hideki for them"), or error loudly, or at minimum place the perps requirement in an uncommented line that survives a copy-paste. docs/perps.md: perps run on Hideki, chain 50383.

## Actual
With the verbatim copy, `loadConfig()` resolves `network:"testnet"`, `chainId:50312`, RPC `https://api.infra.testnet.somnia.network`, indexer `https://dev.smk.somnia.host/v1/graphql` — the Shannon deployment, which contains none of the dreamDEX app's accounts/perp positions. The perp section's `NETWORK=hideki` advice sits in a comment ABOVE the active `NETWORK=testnet` line, so the active value wins and no warning fires at loadConfig time (only `mainnet` throws: and `perpNetworks = ["hideki","testnet"]` both pass).
The bot then runs happily against Shannon perp pools with a wallet that does not exist there, and doctor (without OWNER override) reports a wallet/margin mismatch instead of "wrong chain".

## Evidence
- Run 1 (2026-10-20): `{"network":"testnet","chainId":50312,"rpcUrl":"https://api.infra.testnet.somnia.network","indexerUrl":"https://dev.smk.somnia.host/v1/graphql","symbol":"BTC-PERP"}`
- Run 2 (identical minutes later): same values, `RUN2:` prefixed line in poc/repro-env-network-footgun.md.
- .env.example: line 8 `NETWORK=testnet` (active), perps block later says `NETWORK=hideki` is the perp default.

## Environment
bot kit @ 2579866, node 24/Windows, perp-core scoped SDK 0.31.0. Network: Shannon endpoints as produced. Wallet: dummy 0x1111… key never funded or used on chain.

Impact: any perp builder who copies the sample env starts their perp bot aimed at the wrong chain & indexer — two commands away from wasted debugging, compounded by quickstart not being able to scaffold perps at all (see report 03).
Suggested fix: in `.env.example`, move `NETWORK=hideki` into the perps block as an uncommented default, or have `loadConfig()` warn when `PERP_*` vars are set while `NETWORK !== "hideki"`.
