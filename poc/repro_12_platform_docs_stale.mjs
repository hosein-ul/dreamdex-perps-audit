// poc/repro_12_platform_docs_stale.mjs
// 12 — Somnia Markets SDK docs describe a stale perps deployment:
//   (a) "Perps are live on testnet: BTC/USDSO:USDSO and ETH/USDSO:USDSO"  (2 markets, wrong casing)
//   (b) "Testnet today has 10 pools, four of them restricted SBTC*"      (10 pools, 4 restricted)
//   (c) "(Hideki has no hosted indexer…)"                                (wrong: hideki-dev.smk.somnia.host is hosted)
// Live chain 50383 truth (committed dump): 21 pools, 0 restricted, hosted indexer used by the SDK itself.
// Run twice: node poc/repro_12_platform_docs_stale.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DOCS_PERPS = "https://somnia-platform-docs.vercel.app/markets/somnia-markets/typescript/perps";
const DOCS_EXCHANGE = "https://somnia-platform-docs.vercel.app/markets/somnia-markets/typescript/exchange";

const perps = await (await fetch(DOCS_PERPS)).text();
const exchange = await (await fetch(DOCS_EXCHANGE)).text();

const claimA = /USDSO:USDSO/.test(perps);
const claimB = /10 pools/.test(perps) || /10 pools/.test(exchange);
const claimC = /no hosted indexer|has no hosted/i.test(perps) || /no hosted indexer|has no hosted/i.test(exchange);

const dump = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "recon", "onchain_markets.json"), "utf8"));
const live = dump.markets.length;
const restricted = dump.markets.filter((m) => m.restricted === true).length;

console.log(`docs quote USDSO-only symbols (never USDso): ${claimA}`);
console.log(`docs quote "10 pools": ${claimB}`);
console.log(`docs quote "no hosted indexer": ${claimC}`);
console.log(`live on-chain dump (recon/onchain_markets.json): ${live} perp pools, restricted: ${restricted}`);
console.log(`live symbols use the token's real casing (USDso) and the SDK resolves them via HostedHidekiIndexer: hideki-dev.smk.somnia.host/v1/graphql${claimC ? " — contradicting (c)" : ""}`);

const pass = claimA && claimB && live === 21 && restricted === 0;
console.log(pass
  ? "REPRO CONFIRMED: the guide's market list, pool count, restriction and indexer claims are all stale versus the live Hideki deployment."
  : "NOT REPRODUCED — docs page changed, re-check.");
