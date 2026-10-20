# quickstart silently coerces --network hideki to testnet, against docs/perps.md and railway-start
Severity: normal
Area: SDK

Package: dreamdex-bot-kit (github.com/somnia-chain/dreamdex-bot-kit), latest main (squash commit 2579866).

## Steps to reproduce
1. Clone the kit and run the documented onboarding command against a perp bot:
   ```
   git clone https://github.com/somnia-chain/dreamdex-bot-kit && cd dreamdex-bot-kit
   npm install
   node scripts/quickstart.mjs --strategy perp-starter --network hideki --yes
   ```
2. Read the generated `.env`.

Reference script: `poc/repro_09_botkit_quickstart_coercion.mjs` — verifies the two code paths (missing perp strategies + network ternary) in the shipped `scripts/quickstart.mjs`; terminal transcripts of two live repop runs are in `NOTES.md`.

## Expected
docs/perps.md instructs perp users to run with `NETWORK=hideki` ("perps run on the Hideki testnet — chain 50383"), and `scripts/railway-start.mjs` (line 76–78) itself treats a `perp-*` service as Hideki. The quickstart writing a valid perp config should honor `--network hideki`.

## Actual
Both arguments are silently dropped:
- `network`: quickstart.mjs contains only two nets, `const net = String(netRaw).toLowerCase() === "mainnet" ? "mainnet" : "testnet";` — anything that is not `mainnet` (including the _documented_ `hideki`) is coerced to `testnet` (= Shannon, chain 50312). The console summary even prints `network=testnet` so the user sees a value they never asked for, with no warning that hideki is unsupported by the script.
- `strategy`: `perp-starter` is not in quickstart's 9-entry STRATEGIES map (line 30–40), so it falls back to `starter` and writes `SYMBOL=SOMI:USDso` — a spot config.
Net result: the onboarding "fast path" cannot scaffold any perp bot, and each of its two required perp decisions (network + strategy) is silently overwritten with a spot/Shannon default instead of erroring.

## Evidence
- Run 1 (2026-10-20):
  ```
  Unknown strategy "perp-starter", using "starter".
    Wrote …\.env
      strategy=starter  network=testnet  SYMBOL=SOMI:USDso  DRY_RUN=true
  ```
- Run 2 (identical, same day): same output.
- `scripts/quickstart.mjs` line ~??: user-visible coercion quoted above; `STRATEGIES` map has no perp keys (grep `perp` in quickstart.mjs → 0 matches).

## Environment
bot kit @ main (2579866), node v22.x/Windows, no SDK needed. Network n/a (script-local). Wallet: n/a (throwaway key path unused afterward — .env deleted).

Impact: every new perp builder starts from a silently spot/Shannon-poisoned .env; symptom appears later as a mysterious "wallet not found" on the wrong chain. Note also `.env.example` root has `NETWORK=testnet` active with the perps section as commented guidance, so the same footgun exists without quickstart (combined reproduction, see report 04).
Suggested fix: add the perp strategies to the STRATEGIES map with `PERP_SYMBOL` as symbolVar, and validate `netRaw ∈ {mainnet, testnet, hideki}` — reject unknown values (or map hideki) instead of the silent ternary.
